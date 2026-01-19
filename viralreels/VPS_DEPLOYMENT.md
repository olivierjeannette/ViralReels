# 🖥️ Déploiement ViralReels sur VPS

## Recommandation importante

⚠️ **Pour un projet Next.js 15, nous recommandons fortement Vercel plutôt qu'un VPS.**

**Mais** si vous voulez absolument utiliser un VPS (pour réduire les coûts ou avoir le contrôle total), voici comment faire.

---

## Comparaison Vercel vs VPS

| Critère | Vercel | VPS |
|---------|--------|-----|
| **Facilité** | ⭐⭐⭐⭐⭐ Très simple | ⭐⭐ Complexe |
| **Temps setup** | 10 minutes | 2-4 heures |
| **Coût initial** | 0€ (gratuit) | 5-20€/mois |
| **Scaling** | Automatique | Manuel |
| **SSL** | Automatique | Manuel (Certbot) |
| **CI/CD** | Intégré | À configurer |
| **Performance** | Edge Network | Dépend de la localisation |
| **Maintenance** | Zéro | Vous gérez tout |
| **Support Next.js 15** | ⭐⭐⭐⭐⭐ Parfait | ⭐⭐⭐ Nécessite config |

---

## Architecture recommandée (Hybride)

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL (Gratuit)                  │
│  - Next.js App (frontend + API)                     │
│  - Déploiement automatique depuis GitHub            │
│  - SSL + CDN inclus                                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                 SERVICES EXTERNES                    │
│  - Supabase (PostgreSQL) : 0€ ou 25€/mois          │
│  - Upstash (Redis) : 0€ ou 10€/mois                │
│  - Cloudflare R2 (Storage) : ~5-10€/mois           │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              VPS (Workers FFmpeg uniquement)         │
│  - Hetzner/OVH/Scaleway : 5-10€/mois               │
│  - Uniquement pour traitement vidéo intensif        │
│  - BullMQ worker + FFmpeg                           │
└─────────────────────────────────────────────────────┘
```

**Coût total** : 20-50€/mois vs 150-200€/mois full Railway

---

## Option 1 : Déploiement Vercel (RECOMMANDÉ)

### Avantages
✅ Gratuit pour commencer
✅ Setup en 10 minutes
✅ Support Next.js 15 parfait
✅ SSL automatique
✅ Déploiement automatique depuis GitHub
✅ Edge Functions
✅ Analytics intégré

### Étapes

1. **Créer un compte Vercel** : https://vercel.com/signup

2. **Connecter GitHub**
   - Import Git Repository
   - Sélectionner `viralreels`
   - Auto-détecte Next.js

3. **Configurer les variables d'environnement**
   - Copier toutes les variables de `.env.example`
   - Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour obtenir les clés API

4. **Déployer**
   - Cliquer "Deploy"
   - Attendre 2-3 minutes
   - URL : `https://votre-projet.vercel.app`

5. **Configurer un domaine** (optionnel)
   - Settings → Domains
   - Ajouter `viralreels.com`
   - Configurer DNS chez votre registrar

**Temps total** : 10-15 minutes
**Coût** : 0€/mois (Hobby) ou 20€/mois (Pro)

---

## Option 2 : Déploiement VPS complet

### Prérequis

- VPS Ubuntu 22.04 LTS
- 2 vCPU minimum
- 4 GB RAM minimum
- 50 GB SSD
- Domaine configuré pointant vers le VPS

**Providers recommandés** :
- **Hetzner** : 5€/mois (CPX21)
- **OVH** : 7€/mois (VPS Starter)
- **Scaleway** : 7€/mois (DEV1-M)
- **DigitalOcean** : 12$/mois (Basic Droplet)

### Étape 1 : Configuration initiale du VPS

```bash
# Se connecter au VPS
ssh root@votre-ip

# Créer un utilisateur non-root
adduser viralreels
usermod -aG sudo viralreels
su - viralreels
```

### Étape 2 : Installation automatique

```bash
# Télécharger le script d'installation
wget https://raw.githubusercontent.com/votre-repo/viralreels/main/scripts/vps-setup.sh

# Rendre exécutable
chmod +x vps-setup.sh

# Exécuter
./vps-setup.sh
```

Ou **installation manuelle** :

```bash
# 1. Mise à jour
sudo apt update && sudo apt upgrade -y

# 2. Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 4. Nginx
sudo apt install -y nginx

# 5. Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx

# 6. PM2
sudo npm install -g pm2

# 7. FFmpeg
sudo apt install -y ffmpeg

# 8. Git
sudo apt install -y git
```

### Étape 3 : Cloner et configurer le projet

```bash
# Cloner le repository
cd /var/www
sudo mkdir viralreels
sudo chown $USER:$USER viralreels
git clone https://github.com/votre-username/viralreels.git viralreels
cd viralreels

# Installer les dépendances
npm install

# Créer .env.production
cp .env.example .env.production
nano .env.production
```

Configurer `.env.production` :

```bash
# Database (utiliser Supabase ou PostgreSQL local)
DATABASE_URL="postgresql://..."

# Redis (utiliser Upstash ou Redis local)
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="générer-avec-openssl-rand-base64-32"

# ... autres variables (voir DEPLOYMENT.md)
```

### Étape 4 : Setup PostgreSQL et Redis (si local)

```bash
# Lancer les containers Docker
docker-compose up -d

# Initialiser la base de données
npm run db:push
npm run db:generate
```

**Recommandation** : Utiliser Supabase et Upstash (gratuit) plutôt que local.

### Étape 5 : Build de l'application

```bash
# Build production
npm run build

# Tester localement
npm start
```

### Étape 6 : Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/viralreels
```

Contenu :

```nginx
server {
    listen 80;
    server_name viralreels.com www.viralreels.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Limites upload
    client_max_body_size 100M;
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/viralreels /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Étape 7 : SSL avec Certbot

```bash
sudo certbot --nginx -d viralreels.com -d www.viralreels.com
```

Suivre les instructions. Certbot configure automatiquement HTTPS.

### Étape 8 : Démarrer avec PM2

```bash
# Démarrer l'application
pm2 start npm --name "viralreels" -- start

# Configurer le démarrage auto
pm2 startup
pm2 save

# Voir les logs
pm2 logs viralreels

# Monitoring
pm2 monit
```

### Étape 9 : Firewall

```bash
# Configurer UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Option 3 : Architecture Hybride (MEILLEUR RAPPORT QUALITÉ/PRIX)

### Vercel (Frontend) + VPS (Workers uniquement)

**Coût** : 0€ (Vercel) + 5€ (VPS Hetzner) = **5€/mois**

#### Sur Vercel
- Déployer Next.js app (gratuit)
- Utiliser Supabase (gratuit ou 25€)
- Utiliser Upstash Redis (gratuit ou 10€)
- Utiliser Cloudflare R2 (10€)

#### Sur VPS (uniquement workers)
- Installer Docker + FFmpeg
- Lancer uniquement les workers BullMQ
- Configuration minimale

**Script worker sur VPS** :

```bash
# Sur le VPS
cd /var/www/viralreels-worker
git clone https://github.com/votre-username/viralreels.git
cd viralreels/workers

# Install
npm install

# Créer .env
nano .env
```

`.env` :
```bash
DATABASE_URL="votre-supabase-url"
REDIS_URL="votre-upstash-url"
CLOUDFLARE_R2_ACCESS_KEY_ID="..."
CLOUDFLARE_R2_SECRET_ACCESS_KEY="..."
```

```bash
# Démarrer le worker
pm2 start src/index.ts --name "viralreels-worker" --interpreter node
pm2 save
```

Dans Vercel, ajouter :
```bash
WORKER_URL="https://votre-vps-ip:3001"
```

---

## Monitoring et Maintenance VPS

### Logs

```bash
# Logs Next.js
pm2 logs viralreels

# Logs Nginx
sudo tail -f /var/log/nginx/error.log

# Logs système
sudo journalctl -f
```

### Mises à jour

```bash
# Mettre à jour l'application
cd /var/www/viralreels
git pull
npm install
npm run build
pm2 restart viralreels

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y
```

### Backup

```bash
# Backup DB (si PostgreSQL local)
pg_dump viralreels > backup_$(date +%Y%m%d).sql

# Backup fichiers
tar -czf viralreels_backup_$(date +%Y%m%d).tar.gz /var/www/viralreels
```

### Monitoring

```bash
# CPU/RAM
htop

# Disk
df -h

# PM2 monitoring
pm2 monit
```

---

## Coûts comparés

### Vercel (Hobby - Gratuit)
- ✅ Gratuit pour commencer
- ✅ 100 GB bandwidth/mois
- ✅ Déploiements illimités
- ❌ Pas de workers FFmpeg

**Total** : 0€/mois + services externes (~40€)

### Vercel (Pro - 20€/mois)
- ✅ Tout du Hobby
- ✅ Plus de bandwidth
- ✅ Analytics avancés
- ❌ Toujours pas de workers FFmpeg

**Total** : 20€/mois + services externes (~40€) = **60€/mois**

### VPS complet (Hetzner CPX31)
- ✅ Contrôle total
- ✅ Workers FFmpeg inclus
- ✅ PostgreSQL + Redis inclus
- ❌ Configuration complexe
- ❌ Maintenance manuelle

**Total** : 10€/mois + Cloudflare R2 (10€) = **20€/mois**

### Hybride Vercel + VPS (RECOMMANDÉ)
- ✅ Meilleur des deux mondes
- ✅ Frontend optimisé (Vercel)
- ✅ Workers sur VPS
- ✅ Facile à scaler

**Total** : 0€ (Vercel) + 5€ (VPS mini) + services (40€) = **45€/mois**

---

## Ma recommandation finale

### Pour débuter (MVP)
➡️ **Vercel Hobby (gratuit) + Supabase gratuit + Upstash gratuit**
- Coût : ~10€/mois (uniquement R2 et APIs IA)
- Temps setup : 15 minutes
- Parfait pour tester le product-market fit

### Pour croissance (100-500 users)
➡️ **Vercel Pro + VPS Hetzner pour workers**
- Coût : 45€/mois
- Performance optimale
- Facile à maintenir

### Pour scale (1000+ users)
➡️ **Vercel + Railway workers + services managés**
- Coût : 150-200€/mois
- Auto-scaling
- Monitoring professionnel

---

## Script de déploiement automatique

Je peux créer des scripts pour automatiser le déploiement. Voulez-vous :

1. ✅ **Script Vercel** (recommandé) - 1 commande
2. 🔧 **Script VPS complet** - Configuration automatique
3. 🎯 **Script Hybride** - Vercel + VPS workers

Qu'est-ce que vous préférez ?
