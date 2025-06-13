-- Script d'initialisation de la base de données DynProt
-- Exécuter avec : psql -U postgres -f init-database.sql

-- Créer la base de données
CREATE DATABASE dynprot_db;

-- Créer l'utilisateur dédié
CREATE USER dynprot_user WITH PASSWORD 'votre_mot_de_passe_securise';

-- Donner les permissions sur la base de données
GRANT ALL PRIVILEGES ON DATABASE dynprot_db TO dynprot_user;

-- Se connecter à la base de données dynprot_db
\c dynprot_db;

-- Donner les permissions sur le schéma public
GRANT ALL ON SCHEMA public TO dynprot_user;

-- Donner les permissions sur les tables futures
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dynprot_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dynprot_user;

-- Afficher un message de confirmation
\echo 'Base de données dynprot_db créée avec succès!'
\echo 'Utilisateur dynprot_user créé avec les permissions appropriées.'
\echo ''
\echo 'Prochaines étapes :'
\echo '1. Modifier le mot de passe dans server/.env'
\echo '2. Démarrer le serveur avec : cd server && npm start'
\echo '3. Les tables seront créées automatiquement au premier démarrage'
