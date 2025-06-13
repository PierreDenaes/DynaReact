const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dynprot_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const init = async () => {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      user_id VARCHAR PRIMARY KEY,
      email VARCHAR UNIQUE NOT NULL,
      password_hash VARCHAR NOT NULL,
      prenom VARCHAR NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS user_profiles (
      user_id VARCHAR PRIMARY KEY REFERENCES users(user_id),
      prenom VARCHAR NOT NULL,
      age INTEGER,
      poids DECIMAL(5,2),
      niveau_activite VARCHAR(50),
      objectif_principal VARCHAR(100),
      daily_protein_goal INTEGER NOT NULL DEFAULT 120,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS user_onboarding_status (
      user_id VARCHAR PRIMARY KEY REFERENCES users(user_id),
      onboarding_completed BOOLEAN DEFAULT FALSE,
      welcome_message_sent BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR REFERENCES users(user_id),
      message_content TEXT,
      message_type VARCHAR(50),
      sender_type VARCHAR(20),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB
    )`,
    
    `CREATE TABLE IF NOT EXISTS meal_entries (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR REFERENCES users(user_id),
      produit TEXT,
      description_visuelle TEXT,
      proteines_apportees DECIMAL(6,2),
      poids_estime DECIMAL(6,2),
      methode VARCHAR(50),
      source VARCHAR(50),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
    } catch (error) {
      console.error('Error creating table:', error);
    }
  }
  
  console.log('Database tables initialized');
};

const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

module.exports = {
  init,
  query,
  pool
};
