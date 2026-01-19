# Guide de Déploiement ViralReels

Ce guide détaille toutes les étapes pour déployer ViralReels en production.

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration des services](#configuration-des-services)
3. [Déploiement Vercel](#déploiement-vercel)
4. [Déploiement Workers](#déploiement-workers)
5. [Configuration Stripe](#configuration-stripe)
6. [DNS et Domaine](#dns-et-domaine)
7. [Monitoring](#monitoring)
8. [Checklist finale](#checklist-finale)

## Prérequis

- [ ] Compte GitHub avec repository ViralReels
- [ ] Compte Vercel
- [ ] Domaine personnalisé (optionnel mais recommandé)
- [ ] Carte bancaire pour services payants

## Configuration des services

### 1. Supabase (PostgreSQL)

**Pourquoi** : Base de données PostgreSQL hébergée avec backup automatique

**Steps** :

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
   - Nom : `viralreels-prod`
   - Région : choisir la plus proche (ex: `eu-west-1`)
   - Mot de passe : générer un mot de passe fort
3. Attendre la création (2-3 min)
4. Aller dans `Settings` → `Database`
5. Copier la `Connection String` (mode pooling)
6. Format : `postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`

**Variables d'environnement** :
```bash
DATABASE_URL="votre-connection-string"
```

**Coût estimé** : 0€/mois (Free tier) ou 25€/mois (Pro)

---

### 2. Upstash (Redis)

**Pourquoi** : Redis serverless pour BullMQ queues

**Steps** :

1. Créer un compte sur [upstash.com](https://upstash.com)
2. Créer une nouvelle database Redis
   - Type : Regional
   - Région : même que Supabase
   - Eviction : `noeviction`
3. Copier la `REST URL` et le `REST Token`

**Variables d'environnement** :
```bash
REDIS_HOST="votre-upstash-endpoint"
REDIS_PORT="votre-port"
REDIS_PASSWORD="votre-password"
# OU en format URL :
REDIS_URL="redis://default:[password]@[endpoint]:[port]"
```

**Coût estimé** : 0€/mois (Free tier) ou ~10€/mois

---

### 3. Cloudflare R2

**Pourquoi** : Stockage vidéo avec 0€ de frais de sortie + CDN intégré

**Steps** :

1. Créer un compte [Cloudflare](https://cloudflare.com)
2. Aller dans `R2 Object Storage`
3. Créer un bucket
   - Nom : `viralreels`
   - Région : Automatic
4. Générer des credentials R2
   - Cliquer `Manage R2 API Tokens`
   - `Create API Token`
   - Permissions : `Object Read & Write`
   - Scope : `Apply to specific buckets only` → `viralreels`
5. Copier `Access Key ID` et `Secret Access Key`
6. Configurer le domaine public (optionnel)
   - Aller dans le bucket → `Settings`
   - `Public Access` → Activer
   - Copier l'URL publique : `https://pub-xxxxx.r2.dev`

**Variables d'environnement** :
```bash
CLOUDFLARE_R2_ACCOUNT_ID="votre-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="votre-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="votre-secret-key"
CLOUDFLARE_R2_BUCKET_NAME="viralreels"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

**Coût estimé** : ~5-10€/mois (stockage + requests)

---

### 4. Deepgram (Transcription)

**Pourquoi** : Meilleur rapport qualité/prix pour transcription

**Steps** :

1. Créer un compte [Deepgram](https://deepgram.com)
2. Aller dans `API Keys`
3. Créer une nouvelle clé
4. Copier la clé

**Variables d'environnement** :
```bash
DEEPGRAM_API_KEY="votre-deepgram-api-key"
```

**Coût estimé** : ~9€/mois (2000 min de transcription)

---

### 5. Anthropic Claude (Analyse IA)

**Pourquoi** : Meilleure qualité d'analyse contextuelle

**Steps** :

1. Créer un compte [Anthropic Console](https://console.anthropic.com)
2. Ajouter un moyen de paiement
3. Générer une API Key
4. Copier la clé

**Variables d'environnement** :
```bash
ANTHROPIC_API_KEY="votre-anthropic-api-key"
```

**Coût estimé** : ~30-50€/mois

**Alternative** : OpenAI GPT-4
```bash
OPENAI_API_KEY="votre-openai-api-key"
```

---

### 6. Stripe (Paiements)

**Pourquoi** : Standard de l'industrie pour paiements SaaS

**Steps** :

1. Créer un compte [Stripe](https://stripe.com)
2. Activer le mode live
3. Créer les produits et prix :

   **Produit Creator** :
   - Nom : "ViralReels Creator"
   - Prix : 9.99€/mois récurrent
   - Copier le Price ID : `price_xxxxx`

   **Produit Pro** :
   - Nom : "ViralReels Pro"
   - Prix : 24.99€/mois récurrent
   - Copier le Price ID : `price_xxxxx`

4. Récupérer les clés
   - `Developers` → `API Keys`
   - Copier `Publishable key` et `Secret key`

5. Configurer les webhooks
   - `Developers` → `Webhooks`
   - Ajouter endpoint : `https://viralreels.com/api/webhooks/stripe`
   - Événements à écouter :
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copier le `Signing secret` : `whsec_xxxxx`

**Variables d'environnement** :
```bash
STRIPE_SECRET_KEY="sk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"
STRIPE_CREATOR_PRICE_ID="price_xxxxx"
STRIPE_PRO_PRICE_ID="price_xxxxx"
```

**Coût** : 2.9% + 0.30€ par transaction

---

### 7. Google OAuth

**Pourquoi** : Connexion simple pour les utilisateurs

**Steps** :

1. [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet "ViralReels Production"
3. Activer `Google+ API`
4. Créer des credentials OAuth 2.0
   - Type : Web application
   - URIs de redirection autorisées :
     - `https://viralreels.com/api/auth/callback/google`
     - `https://www.viralreels.com/api/auth/callback/google` (si www)
5. Copier Client ID et Client Secret

**Variables d'environnement** :
```bash
GOOGLE_CLIENT_ID="votre-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="votre-client-secret"
```

---

## Déploiement Vercel

### 1. Préparation

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login
```

### 2. Configuration du projet

1. Dans le dashboard Vercel, créer un nouveau projet
2. Connecter le repository GitHub
3. Configuration :
   - Framework Preset : `Next.js`
   - Root Directory : `./`
   - Build Command : `npm run build`
   - Output Directory : `.next`

### 3. Variables d'environnement

Aller dans `Settings` → `Environment Variables` et ajouter TOUTES les variables :

```bash
# Database
DATABASE_URL="postgresql://..."
REDIS_HOST="..."
REDIS_PORT="6379"
REDIS_PASSWORD="..."

# NextAuth
NEXTAUTH_URL="https://viralreels.com"
NEXTAUTH_SECRET="générer-nouveau-avec-openssl-rand-base64-32"

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Storage
CLOUDFLARE_R2_ACCOUNT_ID="..."
CLOUDFLARE_R2_ACCESS_KEY_ID="..."
CLOUDFLARE_R2_SECRET_ACCESS_KEY="..."
CLOUDFLARE_R2_BUCKET_NAME="viralreels"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"

# IA
DEEPGRAM_API_KEY="..."
ANTHROPIC_API_KEY="..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_CREATOR_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."

# Workers
WORKER_URL="https://viralreels-worker.railway.app"

# Feature Flags
NEXT_PUBLIC_ENABLE_STRIPE="true"
NEXT_PUBLIC_ENABLE_TRANSLATIONS="true"
```

### 4. Déployer

```bash
# Deploy en production
vercel --prod
```

### 5. Configurer le domaine

Dans Vercel :
1. `Settings` → `Domains`
2. Ajouter domaine : `viralreels.com`
3. Suivre les instructions pour configurer DNS

---

## Déploiement Workers (Railway)

**Pourquoi** : Workers FFmpeg nécessitent CPU dédié

### 1. Créer compte Railway

1. [Railway.app](https://railway.app)
2. Se connecter avec GitHub

### 2. Déployer le worker

1. `New Project` → `Deploy from GitHub repo`
2. Sélectionner le repository ViralReels
3. Configuration :
   - Root Directory : `./workers`
   - Start Command : `npm start`
4. Variables d'environnement :
   ```bash
   DATABASE_URL="..."
   REDIS_URL="..."
   CLOUDFLARE_R2_ACCOUNT_ID="..."
   CLOUDFLARE_R2_ACCESS_KEY_ID="..."
   CLOUDFLARE_R2_SECRET_ACCESS_KEY="..."
   CLOUDFLARE_R2_BUCKET_NAME="viralreels"
   ```
5. Déployer

### 3. Récupérer l'URL

1. Railway génère une URL : `viralreels-worker.railway.app`
2. Ajouter cette URL dans les variables Vercel :
   ```bash
   WORKER_URL="https://viralreels-worker.railway.app"
   ```

**Coût estimé** : 40-60€/mois (2 workers)

---

## Configuration Stripe

### 1. Activer le mode Live

Dans Stripe Dashboard :
1. Toggle "View test data" → OFF
2. Activer le compte avec infos bancaires

### 2. Configurer le Customer Portal

1. `Settings` → `Billing` → `Customer Portal`
2. Activer portal
3. Customiser avec logo et couleurs ViralReels
4. URL de retour : `https://viralreels.com/dashboard/settings`

### 3. Tester un paiement

1. Créer un compte test sur votre site
2. Souscrire au plan Creator
3. Vérifier dans Stripe Dashboard

---

## DNS et Domaine

### Acheter un domaine

Recommandations :
- **Namecheap** : ~10€/an
- **OVH** : ~8€/an
- **Cloudflare** : ~9€/an

### Configurer DNS

Chez votre registrar :

**Pour Vercel** :
```
Type A    @ (root)     76.76.21.21
Type A    www          76.76.21.21
```

**Alternative CNAME** :
```
CNAME    @            cname.vercel-dns.com
CNAME    www          cname.vercel-dns.com
```

Propagation DNS : 24-48h

---

## Monitoring

### 1. Vercel Analytics

Activé par défaut, gratuit.

### 2. Sentry (Optionnel)

Pour tracking d'erreurs :

1. Créer compte [Sentry](https://sentry.io)
2. Créer projet Next.js
3. Installer :
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```
4. Ajouter DSN :
   ```bash
   SENTRY_DSN="..."
   NEXT_PUBLIC_SENTRY_DSN="..."
   ```

**Coût** : 0€ (dev tier) ou 26€/mois (team)

### 3. Uptime Monitoring

Services gratuits :
- **UptimeRobot** : ping toutes les 5 min
- **Better Uptime** : alertes SMS/Email

---

## Checklist finale

### Avant le lancement

- [ ] Tester tous les flows utilisateur
  - [ ] Inscription / Connexion Google
  - [ ] Upload vidéo
  - [ ] Transcription
  - [ ] Analyse + clips
  - [ ] Export
  - [ ] Paiement Stripe
  - [ ] Annulation abonnement
- [ ] Vérifier quotas par plan
- [ ] Tester codes promo
- [ ] Vérifier emails transactionnels
- [ ] Responsive mobile
- [ ] SEO (meta tags, sitemap)
- [ ] Legal (CGV, CGU, Politique confidentialité)
- [ ] RGPD compliance

### Performance

- [ ] Lighthouse score > 90
- [ ] Core Web Vitals OK
- [ ] Images optimisées
- [ ] CDN configuré

### Sécurité

- [ ] HTTPS actif
- [ ] Headers sécurité configurés
- [ ] Rate limiting actif
- [ ] Validation inputs
- [ ] SQL injection protection
- [ ] XSS protection

### Monitoring

- [ ] Sentry configuré
- [ ] Uptime monitoring
- [ ] Logs centralisés
- [ ] Alertes configurées

---

## Post-lancement

### Marketing

- [ ] Product Hunt launch
- [ ] Twitter/X announcement
- [ ] Reddit (r/SaaS, r/Entrepreneur)
- [ ] LinkedIn post
- [ ] YouTube demo video

### Support

- [ ] Email support@viralreels.com
- [ ] Chat support (Intercom/Crisp)
- [ ] Documentation utilisateur
- [ ] FAQ

### Growth

- [ ] Analytics Google
- [ ] A/B testing (pricing page)
- [ ] Referral program
- [ ] Affiliate program

---

## Commandes utiles

```bash
# Déployer sur Vercel
vercel --prod

# Voir les logs Vercel
vercel logs

# Rollback si problème
vercel rollback

# Migrer la DB
npm run db:migrate

# Vérifier santé services
curl https://viralreels.com/api/health
```

---

## Support déploiement

En cas de problème, vérifier dans l'ordre :

1. Logs Vercel
2. Logs Railway (workers)
3. Supabase logs
4. Upstash logs
5. Stripe events

**Bon déploiement !** 🚀
