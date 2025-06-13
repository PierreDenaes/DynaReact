# DynProt - Configuration Base de Données

## 🚀 Démarrage Rapide

### Option 1 : Script Automatique (Recommandé)
```bash
# Rendre le script exécutable (si pas déjà fait)
chmod +x setup-database.sh

# Exécuter la configuration automatique
./setup-database.sh
```

### Option 2 : Configuration Manuelle

#### 1. Installer PostgreSQL
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 2. Créer la base de données
```bash
# Exécuter le script SQL
psql -U postgres -f server/scripts/init-database.sql
```

#### 3. Configurer les variables d'environnement
Modifier `server/.env` avec vos paramètres :
```bash
DB_USER=dynprot_user
DB_HOST=localhost
DB_NAME=dynprot_db
DB_PASSWORD=votre_mot_de_passe_securise
DB_PORT=5432
```

#### 4. Démarrer l'application
```bash
# Terminal 1 : Serveur
cd server
npm install
npm start

# Terminal 2 : Client
npm run dev
```

## 📊 Structure de la Base de Données

### Tables Principales

#### `users` - Authentification
- `user_id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `onboarding_completed` (BOOLEAN)
- `created_at` (TIMESTAMP)

#### `user_profiles` - Profils Utilisateurs
- `profile_id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `prenom` (VARCHAR)
- `age` (INTEGER)
- `poids` (NUMERIC)
- `niveau_activite` (VARCHAR)
- `objectif_principal` (VARCHAR)
- `daily_protein_goal` (INTEGER)

#### `chat_messages` - Messages
- `id` (SERIAL, PK)
- `user_id` (UUID, FK → users)
- `message_content` (TEXT)
- `message_type` (VARCHAR)
- `sender_type` (VARCHAR)
- `timestamp` (TIMESTAMP)
- `metadata` (JSONB)

#### `meal_entries` - Entrées Repas
- `id` (SERIAL, PK)
- `user_id` (UUID, FK → users)
- `produit` (TEXT)
- `description_visuelle` (TEXT)
- `proteines_apportees` (DECIMAL)
- `poids_estime` (DECIMAL)
- `methode` (VARCHAR)
- `source` (VARCHAR)
- `timestamp` (TIMESTAMP)

## 🔐 Sécurité

### Authentification JWT
- Tokens sécurisés avec expiration 7 jours
- Mots de passe hachés avec bcrypt (12 rounds)
- Validation email unique

### Configuration Sécurisée
```bash
# Générer des secrets sécurisés
openssl rand -base64 32  # JWT Secret
openssl rand -base64 24  # DB Password
```

## 🛠️ Commandes Utiles

### Base de Données
```bash
# Se connecter à la DB
psql -U dynprot_user -d dynprot_db -h localhost

# Lister les tables
\dt

# Voir la structure d'une table
\d users

# Voir les utilisateurs
SELECT user_id, email, onboarding_completed FROM users;
```

### Développement
```bash
# Redémarrer le serveur
cd server && npm start

# Voir les logs en temps réel
tail -f server/logs/app.log

# Tests API
curl http://localhost:5001/
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"motdepasse123","prenom":"Test"}'
```

## 🔧 Dépannage

### Erreurs Communes

#### "Connection refused"
```bash
# Vérifier que PostgreSQL est démarré
pg_isready

# Démarrer PostgreSQL
# macOS:
brew services start postgresql@15
# Ubuntu:
sudo systemctl start postgresql
```

#### "Authentication failed"
```bash
# Vérifier les identifiants dans server/.env
cat server/.env | grep DB_

# Réinitialiser le mot de passe
psql -U postgres -c "ALTER USER dynprot_user PASSWORD 'nouveau_mot_de_passe';"
```

#### "Database does not exist"
```bash
# Recréer la base de données
psql -U postgres -f server/scripts/init-database.sql
```

### Logs PostgreSQL
```bash
# macOS (Homebrew)
tail -f /opt/homebrew/var/log/postgresql@15.log

# Ubuntu
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

## 📚 Documentation

- [Configuration Complète](DATABASE_SETUP.md)
- [Guide de Sécurité](SECURITY_AUTH_GUIDE.md)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)

## 🆘 Support

En cas de problème :
1. Vérifiez que PostgreSQL est installé et démarré
2. Consultez les logs d'erreur
3. Vérifiez la configuration dans `server/.env`
4. Référez-vous à `DATABASE_SETUP.md` pour plus de détails

## 🔄 Migration

### Depuis la version mémoire
Si vous utilisez actuellement la version en mémoire :
1. Les données seront perdues lors du passage à PostgreSQL
2. Suivez les étapes de configuration ci-dessus
3. Les tables seront créées automatiquement
4. Vous pouvez commencer à utiliser l'application immédiatement

### Sauvegarde/Restauration
```bash
# Sauvegarde
pg_dump -U dynprot_user dynprot_db > backup.sql

# Restauration
psql -U dynprot_user dynprot_db < backup.sql
