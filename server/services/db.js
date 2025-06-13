const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Création de la table users avec authentification
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        onboarding_completed BOOLEAN DEFAULT FALSE
      );
    `);

    // Création de la table user_profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
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
    `);

    // Création des autres tables existantes pour compatibilité
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(user_id),
        message_content TEXT,
        message_type VARCHAR(50),
        sender_type VARCHAR(20),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS meal_entries (
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
    `);

    console.log('Database tables initialized with authentication support');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  } finally {
    client.release();
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase,
  pool,
};
