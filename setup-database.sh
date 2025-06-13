#!/bin/bash

# Script de configuration rapide de la base de données PostgreSQL pour DynProt
# Usage: ./setup-database.sh

echo "🏋️ Configuration de la base de données DynProt"
echo "=============================================="

# Vérifier si PostgreSQL est installé
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé."
    echo "📖 Consultez DATABASE_SETUP.md pour les instructions d'installation."
    exit 1
fi

echo "✅ PostgreSQL détecté"

# Vérifier si PostgreSQL est en cours d'exécution
if ! pg_isready -q; then
    echo "❌ PostgreSQL n'est pas en cours d'exécution."
    echo "💡 Démarrez PostgreSQL avec :"
    echo "   - macOS: brew services start postgresql@15"
    echo "   - Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL est en cours d'exécution"

# Créer la base de données et l'utilisateur
echo "📊 Création de la base de données..."
if psql -U postgres -f server/scripts/init-database.sql; then
    echo "✅ Base de données créée avec succès"
else
    echo "❌ Erreur lors de la création de la base de données"
    echo "💡 Vérifiez que vous avez les permissions pour vous connecter en tant que 'postgres'"
    echo "💡 Ou exécutez manuellement : psql -U postgres -f server/scripts/init-database.sql"
    exit 1
fi

# Générer un mot de passe sécurisé
if command -v openssl &> /dev/null; then
    DB_PASSWORD=$(openssl rand -base64 24)
    JWT_SECRET=$(openssl rand -base64 32)
    
    echo "🔐 Génération des mots de passe sécurisés..."
    
    # Mettre à jour le fichier .env
    sed -i.bak "s/votre_mot_de_passe_securise/$DB_PASSWORD/g" server/.env
    sed -i.bak "s/dynprot-super-secret-jwt-key-2024-change-in-production/$JWT_SECRET/g" server/.env
    
    echo "✅ Fichier server/.env mis à jour avec des mots de passe sécurisés"
    
    # Mettre à jour le script SQL avec le nouveau mot de passe
    sed -i.bak "s/votre_mot_de_passe_securise/$DB_PASSWORD/g" server/scripts/init-database.sql
    
    # Mettre à jour le mot de passe de l'utilisateur dans PostgreSQL
    echo "🔄 Mise à jour du mot de passe utilisateur..."
    psql -U postgres -d dynprot_db -c "ALTER USER dynprot_user PASSWORD '$DB_PASSWORD';"
    
else
    echo "⚠️  OpenSSL non trouvé - veuillez modifier manuellement les mots de passe dans server/.env"
fi

# Installer les dépendances Node.js si nécessaire
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installation des dépendances Node.js..."
    cd server && npm install && cd ..
    echo "✅ Dépendances installées"
fi

echo ""
echo "🎉 Configuration terminée !"
echo "=============================================="
echo "📋 Prochaines étapes :"
echo "1. Démarrer le serveur : cd server && npm start"
echo "2. Démarrer le client : npm run dev"
echo "3. Ouvrir http://localhost:5173"
echo ""
echo "📖 Pour plus d'informations, consultez DATABASE_SETUP.md"
echo "🔐 Pour la sécurité, consultez SECURITY_AUTH_GUIDE.md"
