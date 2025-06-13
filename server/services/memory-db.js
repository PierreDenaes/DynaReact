// Base de données temporaire en mémoire pour les tests
const users = new Map();
const profiles = new Map();

const memoryDb = {
  query: async (text, params = []) => {
    // Simulation des requêtes SQL principales
    
    // SELECT user_id FROM users WHERE email = $1
    if (text.includes('SELECT user_id FROM users WHERE email')) {
      const email = params[0];
      const user = Array.from(users.values()).find(u => u.email === email);
      return { rows: user ? [{ user_id: user.user_id }] : [] };
    }
    
    // INSERT INTO users ... RETURNING user_id
    if (text.includes('INSERT INTO users') && text.includes('RETURNING user_id')) {
      const [email, password_hash, onboarding_completed] = params;
      const user_id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      const user = {
        user_id,
        email,
        password_hash,
        onboarding_completed,
        created_at: new Date()
      };
      
      users.set(user_id, user);
      return { rows: [{ user_id }] };
    }
    
    // SELECT user with profile for login
    if (text.includes('SELECT u.*, up.prenom') && text.includes('WHERE u.email')) {
      const email = params[0];
      const user = Array.from(users.values()).find(u => u.email === email);
      if (!user) return { rows: [] };
      
      const profile = profiles.get(user.user_id);
      const result = {
        ...user,
        prenom: profile?.prenom,
        age: profile?.age,
        poids: profile?.poids,
        niveau_activite: profile?.niveau_activite,
        objectif_principal: profile?.objectif_principal,
        daily_protein_goal: profile?.daily_protein_goal
      };
      
      return { rows: [result] };
    }
    
    // INSERT INTO user_profiles with ON CONFLICT
    if (text.includes('INSERT INTO user_profiles')) {
      const [user_id, prenom, age, poids, niveau_activite, objectif_principal, daily_protein_goal] = params;
      
      const profile = {
        user_id,
        prenom,
        age,
        poids,
        niveau_activite,
        objectif_principal,
        daily_protein_goal,
        updated_at: new Date()
      };
      
      profiles.set(user_id, profile);
      console.log('Profile saved for user:', user_id, profile);
      return { rows: [] };
    }
    
    // UPDATE users SET onboarding_completed
    if (text.includes('UPDATE users') && text.includes('onboarding_completed')) {
      const user_id = params[0];
      const user = users.get(user_id);
      if (user) {
        user.onboarding_completed = true;
        users.set(user_id, user);
      }
      return { rows: [] };
    }
    
    // SELECT user profile
    if (text.includes('SELECT u.user_id, u.email, u.onboarding_completed')) {
      const user_id = params[0];
      const user = users.get(user_id);
      if (!user) return { rows: [] };
      
      const profile = profiles.get(user_id);
      const result = {
        user_id: user.user_id,
        email: user.email,
        onboarding_completed: user.onboarding_completed,
        prenom: profile?.prenom,
        age: profile?.age,
        poids: profile?.poids,
        niveau_activite: profile?.niveau_activite,
        objectif_principal: profile?.objectif_principal,
        daily_protein_goal: profile?.daily_protein_goal
      };
      
      return { rows: [result] };
    }
    
    return { rows: [] };
  },
  
  initializeDatabase: async () => {
    console.log('Memory database initialized (no PostgreSQL required)');
    return Promise.resolve();
  }
};

module.exports = memoryDb;
