# Configuration Base de Données PostgreSQL - DynProt

## Installation PostgreSQL

### macOS (avec Homebrew)
```bash
# Installer PostgreSQL
brew install postgresql@15

# Démarrer le service
brew services start postgresql@15

# Créer un utilisateur (optionnel)
createuser -s postgres
```

### Ubuntu/Debian
```bash
# Installer PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Démarrer le service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
1. Télécharger depuis https://www.postgresql.org/download/windows/
2. Installer avec l'assistant
3. Noter le mot de passe du superutilisateur

## Configuration de la Base de Données

### 1. Créer la base de données
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE dynprot_db;

# Créer un utilisateur dédié (recommandé)
CREATE USER dynprot_user WITH PASSWORD 'votre_mot_de_passe_securise';

# Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE dynprot_db TO dynprot_user;

# Quitter
\q
```

### 2. Configuration des variables d'environnement

Créer le fichier `server/.env` :
```bash
# Configuration Base de Données
DB_USER=dynprot_user
DB_HOST=localhost
DB_NAME=dynprot_db
DB_PASSWORD=votre_mot_de_passe_securise
DB_PORT=5432

# Configuration JWT
JWT_SECRET=dynprot-super-secret-jwt-key-2024-change-in-production

# Configuration Serveur
PORT=5001
NODE_ENV=development

# Clés API (si nécessaire)
OPENAI_API_KEY=your-openai-api-key
CLAUDE_API_KEY=your-claude-api-key
```

### 3. Structure des Tables

Le système créera automatiquement ces tables :

#### Table `users` (Authentification)
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  onboarding_completed BOOLEAN DEFAULT FALSE
);
```

#### Table `user_profiles` (Profils utilisateurs)
```sql
CREATE TABLE user_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  prenom VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  poids NUMERIC(5, 1) NOT NULL,
  niveau_activite VARCHAR(50),
  objectif_principal VARCHAR(100),
  daily_protein_goal INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `chat_messages` (Messages chat)
```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  message_content TEXT,
  message_type VARCHAR(50),
  sender_type VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);
```

#### Table `meal_entries` (Entrées repas)
```sql
CREATE TABLE meal_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  produit TEXT,
  description_visuelle TEXT,
  proteines_apportees DECIMAL(6,2),
  poids_estime DECIMAL(6,2),
  methode VARCHAR(50),
  source VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Démarrage du Système

### 1. Installer les dépendances
```bash
cd server
npm install
```

### 2. Démarrer le serveur
```bash
npm start
# ou
node index.js
```

### 3. Démarrer le client React
```bash
# Dans le répertoire racine
npm run dev
```

## Vérification de la Configuration

### Test de connexion PostgreSQL
```bash
# Tester la connexion
psql -U dynprot_user -d dynprot_db -h localhost

# Lister les tables
\dt

# Vérifier la structure d'une table
\d users
```

### Test de l'API
```bash
# Tester le serveur
curl http://localhost:5001/

# Tester l'inscription
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"motdepasse123","prenom":"Test"}'
```

## Sécurité en Production

### 1. Variables d'environnement sécurisées
```bash
# Générer un JWT secret sécurisé
openssl rand -base64 32

# Utiliser un mot de passe fort pour la DB
openssl rand -base64 24
```

### 2. Configuration PostgreSQL
```sql
-- Créer un utilisateur avec permissions limitées
CREATE USER dynprot_app WITH PASSWORD 'mot_de_passe_tres_securise';

-- Donner seulement les permissions nécessaires
GRANT CONNECT ON DATABASE dynprot_db TO dynprot_app;
GRANT USAGE ON SCHEMA public TO dynprot_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dynprot_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dynprot_app;
```

### 3. Configuration réseau
- Configurer `pg_hba.conf` pour limiter les connexions
- Utiliser SSL/TLS en production
- Configurer un firewall

## Dépannage

### Erreurs courantes

1. **Connection refused**
   - Vérifier que PostgreSQL est démarré
   - Vérifier le port (5432 par défaut)

2. **Authentication failed**
   - Vérifier les identifiants dans `.env`
   - Vérifier la configuration `pg_hba.conf`

3. **Database does not exist**
   - Créer la base de données manuellement
   - Vérifier le nom dans `.env`

### Logs utiles
```bash
# Logs PostgreSQL (macOS avec Homebrew)
tail -f /opt/homebrew/var/log/postgresql@15.log

# Logs PostgreSQL (Ubuntu)
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

## Migration depuis la version mémoire

Si vous utilisez actuellement la version en mémoire, les données seront perdues lors du passage à PostgreSQL. Pour migrer :

1. Exporter les données de test si nécessaire
2. Configurer PostgreSQL selon ce guide
3. Redémarrer le serveur
4. Les tables seront créées automatiquement

## Support

Pour toute question sur la configuration PostgreSQL :
- Documentation officielle : https://www.postgresql.org/docs/
- Guide d'installation : https://www.postgresql.org/download/
- Tutoriels : https://www.postgresqltutorial.com/
