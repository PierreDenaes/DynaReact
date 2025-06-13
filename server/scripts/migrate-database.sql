-- Script de migration pour corriger la structure de la base de données
-- Exécuter avec : psql -U postgres -d dynprot_db -f migrate-database.sql

\echo 'Migration de la base de données DynProt...'

-- Se connecter à la base de données
\c dynprot_db;

-- Ajouter la colonne daily_protein_goal si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'daily_protein_goal'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN daily_protein_goal INTEGER;
        \echo 'Colonne daily_protein_goal ajoutée à user_profiles';
    ELSE
        \echo 'Colonne daily_protein_goal existe déjà';
    END IF;
END $$;

-- Vérifier et corriger les contraintes NOT NULL
DO $$
BEGIN
    -- Rendre daily_protein_goal NOT NULL avec une valeur par défaut
    UPDATE user_profiles SET daily_protein_goal = 120 WHERE daily_protein_goal IS NULL;
    ALTER TABLE user_profiles ALTER COLUMN daily_protein_goal SET NOT NULL;
    \echo 'Contrainte NOT NULL ajoutée à daily_protein_goal';
EXCEPTION
    WHEN OTHERS THEN
        \echo 'Contrainte NOT NULL déjà présente ou erreur';
END $$;

-- Vérifier la structure finale
\echo 'Structure finale de la table user_profiles :';
\d user_profiles;

\echo 'Migration terminée avec succès !';
