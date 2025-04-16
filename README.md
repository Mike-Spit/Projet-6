# Projet 6 - Mon Vieux Grimoire (Backend)

> Ce projet constitue le backend de l'application "Mon Vieux Grimoire" réalisé dans le cadre du parcours Développeur Web d'OpenClassrooms. Il permet la gestion d'une collection de livres : ajout, modification, suppression, notation et recommandation des livres les mieux notés.

## 🌐 Lien du dépôt GitHub

**Frontend fourni par OpenClassrooms :** [Lien vers le repo officiel](https://github.com/OpenClassrooms-Student-Center/OC-frontend-mon-vieux-grimoire)

**Backend (ce projet) :** [https://github.com/Mike-Spit/Projet-6](https://github.com/Mike-Spit/Projet-6)

---

## 🚀 Fonctionnalités principales

- Authentification par JWT (connexion/sécurisation des routes)
- Upload d'image via Multer + compression automatique
- Ajout / modification / suppression d'un livre
- Notation d'un livre par les utilisateurs (0 à 5)
- Recommandation des 3 livres les mieux notés
- Validation des données
- Sécurisation des routes et contrôle des autorisations

---

## 🌐 Stack technique

- **Node.js** / **Express**
- **MongoDB Atlas** via **Mongoose**
- **JWT** pour l'authentification
- **Multer** pour la gestion des fichiers (images)
- **Sharp** pour la compression d'image
- **dotenv** pour les variables d'environnement

---

## 📁 Installation locale

1. **Cloner ce dépôt**
```bash
https://github.com/Mike-Spit/Projet-6.git
cd Projet-6
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
Créer un fichier `.env` à la racine du projet avec :
```env
MONGODB_URI=<votre URI MongoDB Atlas>
JWT_SECRET=<votre secret JWT>
```

4. **Démarrer le serveur**
```bash
npm start
```
Le serveur est accessible sur [http://localhost:4000](http://localhost:4000)

---

## 🔧 Scripts utiles

```bash
npm start       # Démarre le serveur (index.js)
npm run dev     # (si ajouté) Lance avec nodemon pour dév
```

---

## 🔐 Routes principales

### Authentification (non protégées)
- `POST /api/auth/signup` : Inscription
- `POST /api/auth/login` : Connexion

### Livres (protégées par token JWT)
- `GET /api/books` : Liste tous les livres
- `GET /api/books/:id` : Détail d'un livre
- `POST /api/books` : Créer un livre (image obligatoire)
- `PUT /api/books/:id` : Modifier un livre (image optionnelle)
- `DELETE /api/books/:id` : Supprimer un livre
- `POST /api/books/:id/rating` : Ajouter une note
- `GET /api/books/bestrating` : 3 meilleurs livres

---

## 🤔 Points de vigilance pour l'évaluation

- Respect de la logique REST
- Utilisation correcte de `req.auth.userId` pour sécuriser les actions
- Fichiers correctement stockés dans `/images`
- Images compressées avec Sharp (nommage dynamique)
- Données sensibles dans `.env`, non versionné
- Aucun accès à la modification/suppression si l'utilisateur n'est pas propriétaire

---

## 🎨 Améliorations possibles (hors scope OC)

- Ajout de tests unitaires avec Jest
- Logs plus poussés (morgan, Winston)
- Swagger pour documenter l'API
- Pagination de la liste des livres

---

## 🙌 Auteur

**Mike Spit** - [github.com/Mike-Spit](https://github.com/Mike-Spit)

Projet réalisé dans le cadre du parcours **Développeur Web** chez [OpenClassrooms](https://openclassrooms.com/fr/paths/717-developpeur-web).

