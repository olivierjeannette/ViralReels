# 🚀 Quick Start - Tester ViralReels en 5 minutes

## Prérequis

Avant de commencer, installez sur votre machine :

1. **Node.js 22+** : https://nodejs.org/ (version LTS recommandée)
2. **Docker Desktop** : https://www.docker.com/products/docker-desktop/

Vérifiez l'installation :
```bash
node --version  # Doit afficher v22.x ou supérieur
npm --version   # Doit afficher v10.x ou supérieur
docker --version
```

## Installation rapide (Mode dev simplifié)

### 1. Ouvrir un terminal et aller dans le projet

```bash
cd viralreels
```

### 2. Installer les dépendances

```bash
npm install
```

⏱️ Temps estimé : 2-3 minutes

### 3. Créer le fichier .env.local

```bash
cp .env.example .env.local
```

Ensuite, éditer `.env.local` avec les valeurs minimales pour tester :

```bash
# Base de données (Docker local)
DATABASE_URL="postgresql://viralreels:viralreels_dev_password@localhost:5432/viralreels"
REDIS_URL="redis://localhost:6379"

# NextAuth (générer un secret)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production-use-openssl-rand-base64-32"

# Google OAuth (OPTIONNEL pour test simple)
GOOGLE_CLIENT_ID="skip-for-now"
GOOGLE_CLIENT_SECRET="skip-for-now"

# Cloudflare R2 (OPTIONNEL pour test)
CLOUDFLARE_R2_ACCOUNT_ID="skip"
CLOUDFLARE_R2_ACCESS_KEY_ID="skip"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="skip"
CLOUDFLARE_R2_BUCKET_NAME="viralreels-dev"
CLOUDFLARE_R2_PUBLIC_URL="http://localhost:3000/uploads"

# Services IA (OPTIONNEL pour test)
DEEPGRAM_API_KEY="skip"
ANTHROPIC_API_KEY="skip"

# Stripe (OPTIONNEL pour test)
STRIPE_SECRET_KEY="skip"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="skip"

# Feature Flags
NEXT_PUBLIC_ENABLE_STRIPE="false"
NEXT_PUBLIC_ENABLE_TRANSLATIONS="false"
```

### 4. Lancer PostgreSQL et Redis avec Docker

```bash
npm run docker:up
```

⏱️ Premier lancement : ~1 minute (téléchargement des images)

Vérifier que les containers tournent :
```bash
docker ps
```

Vous devriez voir `viralreels-postgres` et `viralreels-redis`.

### 5. Initialiser la base de données

```bash
npm run db:push
npm run db:generate
```

⏱️ Temps : 10-20 secondes

### 6. Lancer le serveur de développement

```bash
npm run dev
```

⏱️ Premier lancement : 30 secondes

Vous verrez :
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

### 7. Ouvrir dans le navigateur

Ouvrir **http://localhost:3000**

Vous devriez voir la landing page de ViralReels avec :
- Navigation
- Hero section "Transformez vos vidéos YouTube en clips viraux"
- Section Features
- Pricing
- CTA et Footer

## 🎨 Ce que vous pouvez tester

### ✅ Actuellement fonctionnel

1. **Landing page** : http://localhost:3000
   - Design professionnel
   - Responsive
   - Liens vers pricing

2. **Base de données**
   - Schéma Prisma complet
   - Tables créées automatiquement
   - Voir avec : `npm run db:studio` (ouvre Prisma Studio sur http://localhost:5555)

### ⚠️ À compléter (pages non encore créées)

- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/dashboard` - Dashboard utilisateur
- `/admin` - Dashboard admin
- API routes

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev              # Lancer le serveur dev (http://localhost:3000)
npm run build            # Build pour production
npm run start            # Lancer en mode production

# Base de données
npm run db:studio        # Interface visuelle DB (http://localhost:5555)
npm run db:push          # Push le schéma vers la DB
npm run db:migrate       # Créer une migration

# Docker
npm run docker:up        # Démarrer PostgreSQL + Redis
npm run docker:down      # Arrêter les containers
docker ps                # Voir les containers en cours

# Lint
npm run lint             # Vérifier le code
```

## 🔧 Dépannage

### Problème : "Port 3000 already in use"

```bash
# Trouver et tuer le processus
lsof -ti:3000 | xargs kill -9
```

Ou changer le port :
```bash
PORT=3001 npm run dev
```

### Problème : "Cannot connect to PostgreSQL"

Vérifier que Docker tourne :
```bash
docker ps
```

Si vide, relancer :
```bash
npm run docker:up
```

### Problème : "Prisma Client not generated"

```bash
npm run db:generate
```

### Problème : Erreurs TypeScript au build

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

## 📁 Structure des fichiers créés

```
viralreels/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ✅ Créé
│   │   ├── page.tsx            ✅ Créé (Landing)
│   │   ├── globals.css         ✅ Créé
│   │   ├── (auth)/            ❌ À créer
│   │   ├── (dashboard)/       ❌ À créer
│   │   └── api/               ❌ À créer
│   ├── components/
│   │   └── ui/                ✅ Créé (Button, Card, Progress)
│   ├── lib/
│   │   ├── prisma.ts          ✅ Créé
│   │   ├── auth.ts            ✅ Créé
│   │   ├── stripe.ts          ✅ Créé
│   │   ├── r2.ts              ✅ Créé
│   │   ├── queue.ts           ✅ Créé
│   │   └── utils.ts           ✅ Créé
│   ├── services/
│   │   ├── video/             ✅ Créé (transcription)
│   │   └── ai/                ✅ Créé (virality)
│   └── types/
│       └── index.ts           ✅ Créé
├── prisma/
│   └── schema.prisma          ✅ Créé
├── package.json               ✅ Créé
├── docker-compose.yml         ✅ Créé
└── README.md                  ✅ Créé
```

## 🎯 Prochaines étapes pour avoir un MVP fonctionnel

1. **Créer les pages d'authentification**
   - `src/app/(auth)/login/page.tsx`
   - `src/app/(auth)/register/page.tsx`
   - `src/app/api/auth/[...nextauth]/route.ts`

2. **Créer le dashboard utilisateur**
   - `src/app/(dashboard)/dashboard/page.tsx`
   - `src/app/(dashboard)/videos/page.tsx`
   - `src/app/(dashboard)/clips/page.tsx`

3. **Créer les API routes**
   - `src/app/api/videos/route.ts`
   - `src/app/api/clips/route.ts`
   - `src/app/api/upload/route.ts`

4. **Implémenter le worker FFmpeg**
   - `workers/src/index.ts`

Voulez-vous que je crée ces pages maintenant ?

## 📞 Support

- **Documentation** : Voir README.md
- **Déploiement** : Voir DEPLOYMENT.md
- **Architecture** : Voir ViralReels_SaaS_Architecture.md

---

**Temps total de setup** : ~5-10 minutes
**Prêt pour** : Test local de la landing page
**Prochaine étape** : Créer les pages d'authentification et dashboard
