# 🚀 NexDash - Dashboard Personnel Moderne

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**Un tableau de bord personnel élégant et moderne pour organiser votre journée**

[Démo en direct](#) • [Documentation](#fonctionnalités) • [Installation](#installation)

</div>

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du Projet](#-structure-du-projet)
- [API Routes](#-api-routes)
- [Base de Données](#-base-de-données)
- [Déploiement](#-déploiement)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

---

## 🎯 À propos

**NexDash** est une application web de tableau de bord personnel conçue pour vous aider à organiser votre journée de manière efficace et élégante. Avec une interface utilisateur moderne inspirée du design Apple, des animations fluides et des fonctionnalités de productivité puissantes, NexDash transforme la gestion quotidienne en une expérience agréable.

### ✨ Points forts

- 🎨 **Design moderne** avec glassmorphisme et animations Framer Motion
- 🌍 **Multi-langue** (Français, Anglais, Allemand)
- 🔐 **Authentification sécurisée** (Credentials + GitHub OAuth)
- 📊 **6 widgets interactifs** pour une productivité maximale
- 🌙 **Mode sombre** automatique
- 📱 **Responsive** sur tous les appareils
- ⚡ **Performance optimale** avec Next.js 16 et React 19

---

## 🎁 Fonctionnalités

### 🔐 Authentification

- **Connexion par email/mot de passe** avec hachage bcrypt
- **OAuth GitHub** pour une connexion rapide
- **Gestion de session** avec NextAuth.js et JWT
- **Pages de connexion/inscription** avec design moderne
- **Changement de mot de passe** sécurisé

### 📊 Widgets du Dashboard

#### 1. ✅ **Gestionnaire de Tâches**
- Création, modification et suppression de tâches
- Marquage des tâches comme complétées
- Organisation par date
- Statistiques de progression en temps réel
- Persistance automatique en base de données

#### 2. 📝 **Notes**
- Prise de notes rapide
- Édition et suppression de notes
- Interface minimaliste et intuitive
- Synchronisation automatique

#### 3. 📈 **Statistiques**
- Aperçu de la productivité
- Taux de réussite des tâches
- Nombre de tâches complétées vs totales
- Visualisation graphique élégante

#### 4. 🍅 **Pomodoro Timer**
- Technique Pomodoro pour la concentration
- Sessions de travail de 25 minutes
- Pauses de 5 minutes
- Contrôles play/pause/reset
- Animations visuelles

#### 5. 💧 **Suivi d'Hydratation**
- Objectif quotidien de 8 gourdes d'eau
- Ajout/réinitialisation facile
- Visualisation de la progression
- Persistance par jour

#### 6. 🌤️ **Météo Détaillée**
- Météo en temps réel
- Température, humidité, vitesse du vent
- Température ressentie
- Recherche par ville
- Icônes animées

### 👤 Profil Utilisateur

- **Modification du profil** (nom, email)
- **Upload de photo de profil** (JPG, PNG, GIF - max 5 MB)
- **Changement de mot de passe**
- **Sélection de langue** (FR/EN/DE)
- Interface moderne avec glassmorphisme

### 🌐 Internationalisation

Support complet de 3 langues :
- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇩🇪 Allemand

Changement de langue en temps réel sans rechargement de page.

---

## 🛠️ Stack Technique

### Frontend

| Technologie | Version | Description |
|------------|---------|-------------|
| **Next.js** | 16.0.3 | Framework React avec App Router |
| **React** | 19.2.0 | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4.0 | Framework CSS utility-first |
| **Framer Motion** | 12.23.24 | Animations fluides |
| **Lucide React** | 0.554.0 | Icônes modernes |
| **next-intl** | 4.5.5 | Internationalisation |

### Backend

| Technologie | Version | Description |
|------------|---------|-------------|
| **NextAuth.js** | 4.24.13 | Authentification |
| **Prisma** | 7.0.0 | ORM pour PostgreSQL |
| **PostgreSQL** | - | Base de données relationnelle |
| **bcrypt** | 6.0.0 | Hachage de mots de passe |
| **Zod** | 4.1.12 | Validation de schémas |

### Outils de Développement

- **ESLint** - Linting du code
- **PostCSS** - Transformation CSS
- **Prisma Client** - Génération de types TypeScript

---

## 🏗️ Architecture

### Structure de l'Application

```
nexdash/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── tasks/                # CRUD tâches
│   │   ├── notes/                # CRUD notes
│   │   ├── daily-data/           # Données quotidiennes
│   │   ├── user/                 # Profil utilisateur
│   │   └── weather/              # API météo
│   ├── dashboard/                # Pages dashboard
│   ├── login/                    # Page de connexion
│   ├── register/                 # Page d'inscription
│   ├── layout.tsx                # Layout principal
│   └── globals.css               # Styles globaux
├── components/                   # Composants React
│   ├── dashboard/                # Widgets du dashboard
│   ├── providers/                # Context providers
│   ├── auth-provider.tsx         # Provider d'authentification
│   ├── locale-provider.tsx       # Provider de langue
│   └── theme-provider.tsx        # Provider de thème
├── lib/                          # Utilitaires
│   ├── prisma.ts                 # Client Prisma
│   └── utils.ts                  # Fonctions utilitaires
├── messages/                     # Fichiers de traduction
│   ├── fr.json                   # Français
│   ├── en.json                   # Anglais
│   └── de.json                   # Allemand
├── prisma/                       # Configuration Prisma
│   └── schema.prisma             # Schéma de base de données
└── public/                       # Assets statiques
```

### Flux de Données

```mermaid
graph TD
    A[Client Browser] -->|HTTP Request| B[Next.js Server]
    B -->|API Route| C[API Handler]
    C -->|Prisma Query| D[PostgreSQL Database]
    D -->|Data| C
    C -->|JSON Response| B
    B -->|SSR/CSR| A
    
    E[NextAuth] -->|Session| B
    F[Weather API] -->|External Data| C
```

### Authentification Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant NA as NextAuth
    participant DB as Database
    
    U->>C: Login Form
    C->>NA: Credentials
    NA->>DB: Verify User
    DB-->>NA: User Data
    NA->>NA: Generate JWT
    NA-->>C: Session Token
    C-->>U: Redirect to Dashboard
```

---

## 📦 Installation

### Prérequis

- **Node.js** 18.x ou supérieur
- **npm** ou **yarn** ou **pnpm**
- **PostgreSQL** (ou compte Neon/Supabase)
- **Compte GitHub** (pour OAuth - optionnel)

### Étapes d'installation

1. **Cloner le repository**

```bash
git clone https://github.com/votre-username/nexdash.git
cd nexdash
```

2. **Installer les dépendances**

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nexdash"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-super-securise-genere-aleatoirement"

# GitHub OAuth (optionnel)
GITHUB_ID="votre-github-client-id"
GITHUB_SECRET="votre-github-client-secret"

# Weather API (optionnel)
OPENWEATHER_API_KEY="votre-api-key-openweather"
```

4. **Générer le secret NextAuth**

```bash
openssl rand -base64 32
```

5. **Configurer la base de données**

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# (Optionnel) Ouvrir Prisma Studio
npx prisma studio
```

6. **Lancer le serveur de développement**

```bash
npm run dev
```

7. **Ouvrir l'application**

Naviguez vers [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Configuration de la Base de Données

#### Option 1 : PostgreSQL Local

```bash
# Installer PostgreSQL
# Créer une base de données
createdb nexdash

# Mettre à jour DATABASE_URL dans .env
DATABASE_URL="postgresql://localhost:5432/nexdash"
```

#### Option 2 : Neon (Recommandé)

1. Créez un compte sur [Neon](https://neon.tech)
2. Créez un nouveau projet
3. Copiez la connection string
4. Collez-la dans `DATABASE_URL`

#### Option 3 : Supabase

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez la connection string PostgreSQL
4. Collez-la dans `DATABASE_URL`

### Configuration GitHub OAuth

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Créez une nouvelle OAuth App
3. Configurez :
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copiez `Client ID` et `Client Secret` dans `.env`

### Configuration Weather API

1. Créez un compte sur [OpenWeatherMap](https://openweathermap.org/api)
2. Générez une API key
3. Ajoutez-la dans `.env` comme `OPENWEATHER_API_KEY`

---

## 🚀 Utilisation

### Créer un compte

1. Naviguez vers `/register`
2. Remplissez le formulaire (nom, email, mot de passe)
3. Cliquez sur "S'inscrire"
4. Vous serez automatiquement connecté

### Se connecter

**Avec email/mot de passe :**
1. Naviguez vers `/login`
2. Entrez vos identifiants
3. Cliquez sur "Se connecter"

**Avec GitHub :**
1. Cliquez sur le bouton GitHub
2. Autorisez l'application
3. Vous serez redirigé vers le dashboard

### Utiliser les Widgets

#### Tâches
- Tapez dans le champ "Ajouter une tâche..."
- Appuyez sur Entrée pour créer
- Cliquez sur la checkbox pour marquer comme complétée
- Cliquez sur l'icône poubelle pour supprimer

#### Notes
- Cliquez sur "+ Ajouter une note"
- Tapez votre note
- Cliquez sur "Enregistrer"
- Cliquez sur l'icône crayon pour éditer

#### Pomodoro
- Cliquez sur "Démarrer" pour lancer une session de 25 min
- Cliquez sur "Pause" pour mettre en pause
- Cliquez sur "Réinitialiser" pour recommencer

#### Hydratation
- Cliquez sur "+ Ajouter" pour chaque gourde bue
- Objectif : 8 gourdes par jour
- Réinitialise automatiquement chaque jour

#### Météo
- Entrez le nom d'une ville
- Appuyez sur Entrée ou cliquez sur la loupe
- Consultez les informations météo en temps réel

### Modifier le Profil

1. Cliquez sur votre nom en haut à droite
2. Sélectionnez "Profil"
3. Modifiez vos informations
4. Cliquez sur "Enregistrer les modifications"

### Changer la Langue

1. Cliquez sur votre nom en haut à droite
2. Sélectionnez "Paramètres"
3. Choisissez votre langue
4. L'interface se met à jour instantanément

---

## 📁 Structure du Projet

### Composants Principaux

#### `app/dashboard/dashboard-content.tsx`
Composant principal du dashboard qui orchestre tous les widgets.

#### `components/dashboard/`
- `tasks-widget.tsx` - Gestionnaire de tâches
- `notes-widget.tsx` - Prise de notes
- `stats-widget.tsx` - Statistiques de productivité
- `pomodoro-widget.tsx` - Timer Pomodoro
- `water-tracker-widget.tsx` - Suivi d'hydratation
- `detailed-weather-widget.tsx` - Météo détaillée

#### `components/providers/`
- `auth-provider.tsx` - Gestion de l'authentification
- `locale-provider.tsx` - Gestion de l'internationalisation
- `theme-provider.tsx` - Gestion du thème dark/light

### API Routes

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

#### Tâches
- `GET /api/tasks` - Récupérer les tâches du jour
- `POST /api/tasks` - Créer une tâche
- `PATCH /api/tasks/[id]` - Modifier une tâche
- `DELETE /api/tasks/[id]` - Supprimer une tâche

#### Notes
- `GET /api/notes` - Récupérer toutes les notes
- `POST /api/notes` - Créer une note
- `PATCH /api/notes/[id]` - Modifier une note
- `DELETE /api/notes/[id]` - Supprimer une note

#### Profil Utilisateur
- `GET /api/user/profile` - Récupérer le profil
- `PATCH /api/user/profile` - Modifier le profil
- `POST /api/user/image` - Upload photo de profil
- `GET /api/user/image` - Récupérer la photo
- `GET /api/user/has-password` - Vérifier si mot de passe existe
- `POST /api/user/change-password` - Changer le mot de passe

#### Données Quotidiennes
- `GET /api/daily-data` - Récupérer les données du jour
- `POST /api/daily-data` - Créer/mettre à jour les données

#### Météo
- `GET /api/weather?city=Paris` - Récupérer la météo

---

## 🗄️ Base de Données

### Schéma Prisma

Le projet utilise **Prisma ORM** avec **PostgreSQL**. Voici les modèles principaux :

#### **User**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?
  name          String?
  emailVerified DateTime?
  image         String?
  imageData     Bytes?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts   Account[]
  sessions   Session[]
  widgets    Widget[]
  tasks      Task[]
  notes      Note[]
  dailyData  DailyData[]
}
```

#### **Task**
```prisma
model Task {
  id        String   @id @default(cuid())
  title     String
  completed Boolean  @default(false)
  date      String   // YYYY-MM-DD
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@index([userId, date])
}
```

#### **Note**
```prisma
model Note {
  id        String   @id @default(cuid())
  content   String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### **DailyData**
```prisma
model DailyData {
  id           String   @id @default(cuid())
  userId       String
  date         String   // YYYY-MM-DD
  waterBottles Int      @default(0)
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([userId, date])
  @@index([userId, date])
}
```

### Migrations

```bash
# Créer une migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la base de données (développement uniquement)
npx prisma migrate reset
```

---

## 🌐 Déploiement

### Déploiement sur Vercel (Recommandé)

1. **Pusher le code sur GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connecter à Vercel**

- Allez sur [vercel.com](https://vercel.com)
- Cliquez sur "Import Project"
- Sélectionnez votre repository GitHub
- Configurez les variables d'environnement

3. **Variables d'environnement Vercel**

Ajoutez toutes les variables de `.env` :
- `DATABASE_URL`
- `NEXTAUTH_URL` (votre URL de production)
- `NEXTAUTH_SECRET`
- `GITHUB_ID`
- `GITHUB_SECRET`
- `OPENWEATHER_API_KEY`

4. **Déployer**

Vercel déploiera automatiquement à chaque push sur `main`.

### Déploiement sur d'autres plateformes

#### Netlify
```bash
npm run build
# Déployer le dossier .next
```

#### Railway
1. Créez un nouveau projet
2. Connectez votre repository
3. Ajoutez une base de données PostgreSQL
4. Configurez les variables d'environnement
5. Déployez

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🎨 Personnalisation

### Modifier les Couleurs

Éditez `app/globals.css` :

```css
:root {
  --background: #0a0a0a;
  --foreground: #ededed;
  /* Ajoutez vos couleurs personnalisées */
}
```

### Ajouter un Widget

1. Créez un nouveau composant dans `components/dashboard/`
2. Importez-le dans `dashboard-content.tsx`
3. Ajoutez-le à la grille

```tsx
import MonNouveauWidget from "@/components/dashboard/mon-nouveau-widget";

// Dans le JSX
<div className="md:col-span-1">
  <MonNouveauWidget />
</div>
```

### Ajouter une Langue

1. Créez `messages/es.json` (exemple pour l'espagnol)
2. Copiez la structure de `fr.json`
3. Traduisez tous les textes
4. Mettez à jour `locale-provider.tsx`

---

## 🧪 Tests

### Lancer les tests

```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Tests manuels recommandés

- ✅ Inscription d'un nouvel utilisateur
- ✅ Connexion avec email/mot de passe
- ✅ Connexion avec GitHub
- ✅ Création/modification/suppression de tâches
- ✅ Création/modification/suppression de notes
- ✅ Upload de photo de profil
- ✅ Changement de mot de passe
- ✅ Changement de langue
- ✅ Pomodoro timer
- ✅ Suivi d'hydratation
- ✅ Recherche météo

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork le projet**
2. **Créez une branche** (`git checkout -b feature/AmazingFeature`)
3. **Committez vos changements** (`git commit -m 'Add some AmazingFeature'`)
4. **Pushez vers la branche** (`git push origin feature/AmazingFeature`)
5. **Ouvrez une Pull Request**

### Guidelines

- Suivez les conventions de code existantes
- Ajoutez des commentaires pour le code complexe
- Testez vos changements avant de soumettre
- Mettez à jour la documentation si nécessaire

---

## 📝 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

## 👨‍💻 Auteur

**Maxime Derbigny**

- GitHub: [@MrTangoo](https://github.com/MrTangoo)
- Email: votre.email@example.com

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Vercel](https://vercel.com/) - Plateforme de déploiement
- [Prisma](https://www.prisma.io/) - ORM moderne
- [NextAuth.js](https://next-auth.js.org/) - Authentification
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide](https://lucide.dev/) - Icônes
- [OpenWeatherMap](https://openweathermap.org/) - API Météo

---

## 📸 Screenshots

### Dashboard
![Dashboard](./public/screenshots/dashboard.png)

### Page de Connexion
![Login](./public/screenshots/login.png)

### Profil Utilisateur
![Profile](./public/screenshots/profile.png)

---

## 🔮 Roadmap

- [ ] Mode drag-and-drop pour réorganiser les widgets
- [ ] Export des tâches en PDF/CSV
- [ ] Notifications push
- [ ] Mode hors ligne avec PWA
- [ ] Thèmes personnalisables
- [ ] Intégration calendrier
- [ ] Graphiques de productivité avancés
- [ ] Application mobile (React Native)

---

<div align="center">

**⭐ Si vous aimez ce projet, n'hésitez pas à lui donner une étoile ! ⭐**

Made with ❤️ by [Maxime Derbigny](https://github.com/MrTangoo)

</div>
