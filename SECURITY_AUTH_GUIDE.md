# Guide de Sécurité - Système d'Authentification DynProt

## Vue d'ensemble

Le système d'authentification de DynProt implémente les meilleures pratiques de sécurité pour protéger les données des utilisateurs.

## Fonctionnalités de Sécurité

### 1. Hachage des Mots de Passe
- **Algorithme** : bcrypt avec 12 rounds de salage
- **Sécurité** : Les mots de passe ne sont jamais stockés en clair
- **Résistance** : Protection contre les attaques par force brute et rainbow tables

### 2. Authentification JWT
- **Tokens** : JSON Web Tokens pour l'authentification stateless
- **Expiration** : Tokens valides pendant 7 jours
- **Sécurité** : Signature cryptographique pour éviter la falsification

### 3. Validation des Données
- **Email** : Validation du format email
- **Mot de passe** : Minimum 6 caractères (recommandé : 8+ avec complexité)
- **Unicité** : Vérification de l'unicité des emails

### 4. Protection des Routes
- **Middleware** : Vérification automatique des tokens JWT
- **Autorisation** : Accès restreint aux données de l'utilisateur authentifié
- **Fallback** : Support de l'ancien système pour la compatibilité

## Architecture

### Frontend (React)
```
Auth.jsx → AuthContext → API Service → Backend
```

### Backend (Node.js/Express)
```
Routes → Middleware → Database
```

## Flux d'Authentification

### Inscription
1. Utilisateur saisit email/mot de passe/prénom
2. Validation côté client et serveur
3. Hachage du mot de passe avec bcrypt
4. Création de l'utilisateur en base
5. Génération du token JWT
6. Stockage du token côté client

### Connexion
1. Utilisateur saisit email/mot de passe
2. Recherche de l'utilisateur par email
3. Vérification du mot de passe avec bcrypt
4. Génération du token JWT
5. Retour des données utilisateur + token

### Configuration du Profil
1. Utilisateur authentifié complète son profil
2. Mise à jour des tables user_profiles, user_goals
3. Marquage de l'onboarding comme terminé

## Configuration Sécurisée

### Variables d'Environnement
```bash
# JWT Secret - OBLIGATOIRE en production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Base de données
DB_USER=postgres
DB_HOST=localhost
DB_NAME=dynprot_db
DB_PASSWORD=strong-password
DB_PORT=5432
```

### Recommandations Production

1. **JWT Secret**
   - Utilisez une clé de 256 bits minimum
   - Générez avec `openssl rand -base64 32`
   - Ne jamais exposer dans le code source

2. **Base de Données**
   - Utilisez des mots de passe forts
   - Configurez SSL/TLS
   - Limitez les connexions réseau

3. **HTTPS**
   - Obligatoire en production
   - Certificats SSL valides
   - Redirection HTTP → HTTPS

4. **Headers de Sécurité**
   - CORS configuré correctement
   - Headers de sécurité (HSTS, CSP, etc.)

## Structure de Base de Données

### Table `users`
```sql
CREATE TABLE users (
  user_id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  prenom VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relations
- `users` → `user_profiles` (1:1)
- `users` → `user_goals` (1:1)
- `users` → `user_onboarding_status` (1:1)

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register-profile` - Configuration profil
- `GET /api/auth/profile/:userId` - Récupération profil

### Headers Requis
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Gestion des Erreurs

### Codes d'Erreur
- `400` : Données invalides
- `401` : Non authentifié / Token invalide
- `404` : Utilisateur non trouvé
- `500` : Erreur serveur

### Messages d'Erreur
- Messages en français pour l'UX
- Pas d'exposition d'informations sensibles
- Logs détaillés côté serveur uniquement

## Tests de Sécurité

### À Tester
1. **Injection SQL** : Paramètres préparés utilisés
2. **XSS** : Validation et échappement des données
3. **CSRF** : Tokens JWT protègent contre CSRF
4. **Brute Force** : Rate limiting recommandé
5. **Session Fixation** : Tokens JWT régénérés

### Outils Recommandés
- OWASP ZAP
- Burp Suite
- npm audit
- Snyk

## Maintenance

### Rotation des Secrets
- Changez JWT_SECRET régulièrement
- Invalidez les anciens tokens si nécessaire
- Documentez les changements

### Monitoring
- Surveillez les tentatives de connexion échouées
- Alertes sur les activités suspectes
- Logs d'audit des actions sensibles

## Support

Pour toute question de sécurité, consultez :
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
