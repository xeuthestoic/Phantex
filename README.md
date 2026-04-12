# Φ PHANTEX — OSINT Intelligence Platform

> Outil OSINT éducatif propulsé par Claude (Anthropic). Apprenez les techniques de recherche en sources ouvertes de façon éthique et légale.

![Licence](https://img.shields.io/badge/licence-MIT-purple) ![Stack](https://img.shields.io/badge/stack-HTML%2FJS%20%2B%20Firebase-orange)

---

## Fonctionnalités

- **5 types de recherche OSINT** : Username, Email, Téléphone, IP/Domaine, Nom complet
- **Analyse IA** via Claude Sonnet (Anthropic) — résumé, niveau de risque, sources, techniques, conseils de protection
- **Historique de session** — retrouve et relance tes recherches
- **Onglet Ressources** — 10 ressources OSINT de référence dont OSINTOPIA & OSINT-FR
- **Onglet Apprendre** — guide éthique et légal de l'OSINT
- 100% éducatif — aucune donnée réelle stockée

---

## Architecture

```
GitHub Pages  ──(fetch)──▶  Firebase Function (proxy)  ──▶  Anthropic API
   (front)                    (clé API sécurisée)
```

La clé API Anthropic n'est **jamais** exposée côté client.

---

## Installation & Déploiement

### Prérequis
- Node.js 20+
- Firebase CLI : `npm install -g firebase-tools`
- Un compte [Firebase](https://console.firebase.google.com) (gratuit)
- Une clé API [Anthropic](https://console.anthropic.com)

---

### 1. Cloner le repo

```bash
git clone https://github.com/TON_GITHUB/phantex.git
cd phantex
```

### 2. Configurer Firebase

```bash
firebase login
firebase init
# Choisis : Functions + Hosting
# Runtime : Node 20
# Public directory : public
# SPA : Non
```

Modifie `.firebaserc` avec ton project ID Firebase :

```json
{
  "projects": {
    "default": "ton-project-id"
  }
}
```

### 3. Ajouter la clé API en secret Firebase

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
# Colle ta clé quand demandé
```

### 4. Installer les dépendances de la function

```bash
cd functions
npm install
cd ..
```

### 5. Déployer

```bash
firebase deploy
```

Firebase te donnera une URL du type :
`https://ton-projet.web.app`

### 6. (Optionnel) GitHub Pages en plus

Si tu veux aussi héberger le front sur GitHub Pages :

1. Va dans **Settings → Pages** de ton repo GitHub
2. Source : branche `main`, dossier `/public`
3. Dans `public/js/config.js`, remplace `/api/proxy` par l'URL complète de ta Firebase Function :

```js
const PHANTEX_CONFIG = {
  PROXY_URL: "https://proxy-XXXXXXXX-uc.a.run.app",
};
```

---

## Structure du projet

```
phantex/
├── public/                 # Front-end (GitHub Pages / Firebase Hosting)
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── config.js       ← seul fichier à modifier selon l'environnement
│       └── app.js
├── functions/              # Firebase Function (proxy API)
│   ├── index.js
│   └── package.json
├── firebase.json
├── .firebaserc             ← ton project ID Firebase
└── .gitignore
```

---

## Ressources OSINT intégrées

| Nom | URL | Catégorie |
|-----|-----|-----------|
| OSINT Framework | osintframework.com | Référence |
| OSINTOPIA | osintopia.fr | Communauté FR |
| OSINT-FR | osintfr.com | Communauté FR |
| Bellingcat | bellingcat.com | Méthodes |
| IntelTechniques | inteltechniques.com | Formation |
| TraceLabs | tracelabs.org | Pratique |
| OSINT Curious | osintcurio.us | Veille |
| Have I Been Pwned | haveibeenpwned.com | Outil |
| Shodan | shodan.io | Outil |
| Awesome OSINT | github.com/jivoi/awesome-osint | Référence |

---

## Avertissement légal

Phantex est un **outil éducatif**. Il est conçu pour apprendre les techniques OSINT de façon éthique et légale. L'utilisation de cet outil pour harceler, surveiller ou porter atteinte à la vie privée de personnes est **illégale et contraire à l'éthique**. L'auteur décline toute responsabilité en cas d'usage malveillant.

---

## Licence

MIT — libre d'utilisation, modification et distribution.
