# 🔐 Guide de Sécurité - DynProt

## 🚨 Sécurité des Clés API

### Configuration des Variables d'Environnement

1. **Copiez le fichier d'exemple** :
   ```bash
   cp .env.example .env
   ```

2. **Ajoutez vos vraies clés API** dans `.env` :
   ```bash
   # OpenAI API Configuration
   OPENAI_API_KEY=sk-proj-votre_vraie_cle_openai_ici
   
   # Claude API Configuration
   CLAUDE_API_KEY=sk-ant-api03-votre_vraie_cle_claude_ici
   ```

### ✅ Bonnes Pratiques

- ✅ Le fichier `.env` est dans `.gitignore` - il ne sera jamais commité
- ✅ Utilisez `.env.example` pour documenter la configuration
- ✅ Ne partagez jamais vos vraies clés API
- ✅ Régénérez vos clés si elles sont compromises

### ❌ À Éviter

- ❌ Ne jamais commiter le fichier `.env`
- ❌ Ne jamais mettre de vraies clés dans le code source
- ❌ Ne jamais partager vos clés dans des messages/emails
- ❌ Ne jamais utiliser les mêmes clés en production et développement

## 🔑 Obtenir vos Clés API

### OpenAI
1. Allez sur [platform.openai.com](https://platform.openai.com)
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys"
4. Créez une nouvelle clé secrète
5. Copiez la clé dans votre fichier `.env`

### Claude (Anthropic)
1. Allez sur [console.anthropic.com](https://console.anthropic.com)
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys"
4. Créez une nouvelle clé
5. Copiez la clé dans votre fichier `.env`

## 🛡️ Sécurité Supplémentaire

### Limitation des Permissions
- Configurez des limites de dépenses sur vos comptes API
- Utilisez des clés avec permissions minimales nécessaires
- Surveillez l'utilisation de vos APIs

### Rotation des Clés
- Changez vos clés API régulièrement
- Utilisez des clés différentes pour développement/production
- Désactivez les anciennes clés après rotation

### Monitoring
- Surveillez les logs pour détecter une utilisation anormale
- Configurez des alertes de dépenses
- Vérifiez régulièrement l'activité de vos comptes

## 🚀 Déploiement Sécurisé

### Variables d'Environnement en Production
```bash
# Utilisez des services comme:
# - Heroku Config Vars
# - Vercel Environment Variables
# - AWS Systems Manager Parameter Store
# - Azure Key Vault
```

### Checklist de Sécurité
- [ ] `.env` est dans `.gitignore`
- [ ] Clés API configurées correctement
- [ ] Limites de dépenses configurées
- [ ] Monitoring activé
- [ ] Clés de production différentes du développement

## 📞 En Cas de Problème

Si vous pensez que vos clés ont été compromises :

1. **Immédiatement** :
   - Désactivez les clés compromises
   - Générez de nouvelles clés
   - Vérifiez l'utilisation récente

2. **Ensuite** :
   - Mettez à jour votre configuration
   - Surveillez l'activité
   - Changez vos mots de passe si nécessaire

## 🔍 Vérification

Pour vérifier que votre configuration est sécurisée :

```bash
# Vérifiez que .env n'est pas tracké par git
git status

# Le fichier .env ne doit PAS apparaître dans la liste
```

---

**⚠️ Rappel Important** : Ne jamais partager vos clés API. Elles donnent accès à vos comptes et peuvent générer des coûts !
