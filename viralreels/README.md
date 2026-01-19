# ViralReels SaaS

> Transformez vos vidéos YouTube en clips viraux avec l'IA

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Déploiement](#déploiement)
- [Architecture](#architecture)
- [Contribuer](#contribuer)
- [License](#license)

## Vue d'ensemble

**ViralReels** est un SaaS permettant aux créateurs de contenu YouTube de maximiser leur portée sur les réseaux sociaux en automatisant l'extraction de clips viraux à partir de leurs vidéos longues.

### Proposition de valeur

- **Analyse de viralité IA** : Identification automatique des moments à fort potentiel viral
- **Découpage intelligent** : Création de reels optimisés (10-60 sec) avec transitions fluides
- **Sous-titres multilingues** : Transcription + traduction automatique (FR/EN/ES/DE)
- **Export multi-qualité** : HD jusqu'à 8K, formats multiples (MP4, MKV, MOV, WEBM)
- **Format vertical automatique** : Recadrage intelligent pour les formats portrait

## Fonctionnalités

### Phase 1 - MVP (Actuel)

- [x] Authentification (Google OAuth, Email)
- [x] Upload vidéo avec chunking resumable
- [x] Transcription automatique (Deepgram)
- [x] Analyse de viralité IA (Claude/GPT)
- [x] Découpage automatique en clips
- [x] Export HD avec sous-titres
- [x] Dashboard utilisateur
- [x] Système de quotas par plan
- [ ] Worker FFmpeg pour traitement vidéo (en cours)
- [ ] Dashboard admin (en cours)

### Phase 2 - Monétisation

- [x] Intégration Stripe
- [ ] Plans Creator (9.99€) et Pro (24.99€)
- [ ] Export 4K/8K
- [ ] Traductions multi-langues (DeepL)
- [ ] Codes promo

### Phase 3 - Scale

- [ ] Éditeur de clips interactif
- [ ] Templates de styles sous-titres
- [ ] Batch export
- [ ] API publique

## Stack technique

### Frontend

- **Framework** : Next.js 15 (App Router, React 19)
- **Styling** : Tailwind CSS + shadcn/ui
- **State** : Zustand / TanStack Query
- **Upload** : react-dropzone + tus-js-client

### Backend

- **Runtime** : Node.js 22 LTS
- **API** : Next.js API Routes + tRPC (type-safe)
- **Auth** : NextAuth.js v5
- **ORM** : Prisma
- **Queue** : BullMQ + Redis

### Database & Storage

- **Principal** : PostgreSQL (Supabase/Neon)
- **Cache** : Redis (Upstash)
- **Storage** : Cloudflare R2 + CDN

### Services IA

- **Transcription** : Deepgram Nova-3
- **Analyse** : Claude API / GPT-4
- **Traduction** : DeepL API
- **Video** : FFmpeg

### Paiements

- **Principal** : Stripe

## Prérequis

- Node.js >= 22.0.0
- npm >= 10.0.0
- Docker (pour PostgreSQL et Redis en local)
- Comptes requis :
  - Supabase ou Neon (PostgreSQL)
  - Cloudflare (R2 Storage)
  - Upstash (Redis)
  - Deepgram (Transcription)
  - Anthropic ou OpenAI (Analyse IA)
  - Stripe (Paiements)

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/viralreels.git
cd viralreels
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env.local
```

Éditer `.env.local` avec vos clés API (voir [Configuration](#configuration))

### 4. Lancer les services locaux (PostgreSQL + Redis)

```bash
npm run docker:up
```

### 5. Initialiser la base de données

```bash
npm run db:push
npm run db:generate
```

### 6. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Configuration

### Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```bash
# Base de données
DATABASE_URL="postgresql://viralreels:viralreels_dev_password@localhost:5432/viralreels"
REDIS_URL="redis://localhost:6379"

# Authentification
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="générer-avec-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="votre-google-client-id"
GOOGLE_CLIENT_SECRET="votre-google-client-secret"

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID="votre-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="votre-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="votre-secret-key"
CLOUDFLARE_R2_BUCKET_NAME="viralreels"
CLOUDFLARE_R2_PUBLIC_URL="https://votre-bucket.r2.dev"

# IA et Processing
DEEPGRAM_API_KEY="votre-deepgram-api-key"
ANTHROPIC_API_KEY="votre-anthropic-api-key"

# Stripe (optionnel en dev)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Google OAuth Setup

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet
3. Activer l'API Google+
4. Créer des identifiants OAuth 2.0
5. Ajouter `http://localhost:3000/api/auth/callback/google` comme URI de redirection
6. Copier Client ID et Client Secret dans `.env.local`

### Cloudflare R2 Setup

1. Créer un compte [Cloudflare](https://cloudflare.com)
2. Aller dans R2 Object Storage
3. Créer un bucket `viralreels`
4. Créer des clés API R2
5. Copier les credentials dans `.env.local`

### Deepgram Setup

1. Créer un compte [Deepgram](https://deepgram.com)
2. Créer une clé API
3. Copier dans `.env.local`

### Anthropic Claude Setup

1. Créer un compte [Anthropic](https://console.anthropic.com)
2. Créer une clé API
3. Copier dans `.env.local`

## Développement

### Scripts disponibles

```bash
npm run dev          # Lancer le serveur de développement
npm run build        # Build production
npm run start        # Lancer en production
npm run lint         # Linter
npm run db:generate  # Générer le client Prisma
npm run db:push      # Push le schéma sans migration
npm run db:migrate   # Créer une migration
npm run db:studio    # Interface DB visuelle
npm run docker:up    # Démarrer PostgreSQL + Redis
npm run docker:down  # Arrêter les services Docker
```

### Structure du projet

```
viralreels/
├── prisma/
│   └── schema.prisma          # Schéma de base de données
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Routes authentification
│   │   ├── (dashboard)/      # Routes utilisateur
│   │   ├── (admin)/          # Routes admin
│   │   ├── api/              # API Routes
│   │   ├── layout.tsx
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── video/            # Composants vidéo
│   │   └── shared/           # Composants partagés
│   ├── lib/
│   │   ├── prisma.ts         # Client Prisma
│   │   ├── auth.ts           # NextAuth config
│   │   ├── stripe.ts         # Stripe client
│   │   ├── r2.ts             # Cloudflare R2
│   │   ├── queue.ts          # BullMQ
│   │   └── utils.ts          # Utilitaires
│   ├── services/
│   │   ├── video/            # Services vidéo
│   │   ├── ai/               # Services IA
│   │   └── billing/          # Services paiement
│   ├── workers/              # Workers BullMQ
│   └── types/                # Types TypeScript
├── workers/                   # Service worker FFmpeg
├── docker-compose.yml
├── package.json
└── README.md
```

### Conventions de code

- **TypeScript strict** : Tous les fichiers doivent être typés
- **Naming** :
  - Composants : PascalCase (`VideoUploader.tsx`)
  - Fonctions : camelCase (`getUserVideos`)
  - Types : PascalCase (`VideoStatus`)
- **Imports** : Utiliser `@/` pour les imports depuis `src/`
- **Composants** : Préférer les Server Components par défaut

## Déploiement

### Vercel (Recommandé)

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

```bash
npm install -g vercel
vercel
```

### Variables d'environnement production

Configurer toutes les variables de `.env.example` dans les settings Vercel.

**Important** :
- Changer `NEXTAUTH_SECRET` pour une valeur unique
- Utiliser les URLs de production pour callbacks OAuth
- Configurer les webhooks Stripe avec l'URL de production

## Architecture

### Flux de traitement vidéo

```
Upload → R2 → BullMQ → Worker FFmpeg → Deepgram → Claude → Découpage → R2 → Notification
```

1. **Upload** : Chunked upload vers Cloudflare R2
2. **Queue** : Création job BullMQ avec priorité selon plan
3. **Transcription** : Deepgram extrait l'audio et génère transcript
4. **Analyse** : Claude analyse le transcript pour viralité
5. **Découpage** : FFmpeg génère les clips avec sous-titres
6. **Stockage** : Upload clips vers R2 avec URLs signées
7. **Notification** : Email + in-app notification

### Modèle de données

Voir [prisma/schema.prisma](prisma/schema.prisma) pour le schéma complet.

**Entités principales** :
- **User** : Utilisateurs avec quotas
- **Subscription** : Plans et paiements Stripe
- **Video** : Vidéos uploadées
- **Clip** : Clips générés avec scores de viralité
- **ProcessingJob** : Jobs de traitement async
- **PromoCode** : Codes promotionnels

## Contribuer

Les contributions sont les bienvenues !

### Process

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Guidelines

- Respecter les conventions de code
- Ajouter des tests si applicable
- Mettre à jour la documentation
- S'assurer que `npm run lint` passe

## Roadmap

- [x] MVP avec upload et transcription
- [x] Analyse de viralité IA
- [ ] Worker FFmpeg complet
- [ ] Dashboard admin
- [ ] Monétisation Stripe
- [ ] Export 4K/8K
- [ ] API publique
- [ ] Apps mobiles

## Support

- **Documentation** : Voir [claude.md](claude.md) pour le guide développeur complet
- **Issues** : [GitHub Issues](https://github.com/votre-username/viralreels/issues)
- **Email** : support@viralreels.com

## License

MIT License - voir [LICENSE](LICENSE)

## Auteurs

- **Votre Nom** - Développeur principal

---

**Créé avec** Next.js, TypeScript, Prisma, et beaucoup de ☕

**Version** : 0.1.0 (MVP)
