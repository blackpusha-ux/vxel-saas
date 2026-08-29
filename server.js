const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// SÉCURITÉ : Le mot de passe n'est plus dans le code.
// Il est lu uniquement depuis les variables d'environnement de Render.
// =====================================================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('ERREUR CRITIQUE : MONGO_URI non défini !');
    console.error('Veuillez ajouter la variable MONGO_URI dans les paramètres de Render ou en local.');
    process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let usersCol = null;

async function connectDB() {
  console.log('Connexion a MongoDB...');
  const client = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });
  await client.connect();
  const db = client.db('vexel');
  usersCol = db.collection('users');
  // Index unique pour empêcher les doublons d'emails
  await usersCol.createIndex({ email: 1 }, { unique: true });
  console.log('Base MongoDB connectee avec succes');
}

// Inscription (10 credits offerts)
app.post('/api/register', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email requis' });
    
    const existing = await usersCol.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Utilisateur deja existant' });
    
    await usersCol.insertOne({ email, credits: 10, createdAt: new Date().toISOString() });
    res.json({ success: true, credits: 10 });
  } catch (e) {
    console.error('Erreur register:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Voir ses credits
app.get('/api/credits/:email', async (req, res) => {
  try {
    const user = await usersCol.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouve' });
    res.json({ credits: user.credits });
  } catch (e) {
    console.error('Erreur credits:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Consommer 1 credit (ATOMIQUE : impossible de tricher ou de passer en négatif)
app.post('/api/consume-credit', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    const result = await usersCol.findOneAndUpdate(
      { email, credits: { $gt: 0 } }, // Trouve l'utilisateur ET vérifie qu'il a > 0 crédit
      { $inc: { credits: -1 } },      // Décrémente de 1 de manière atomique
      { returnDocument: 'after' }     // Retourne le document après modification
    );
    
    if (!result) {
      const exists = await usersCol.findOne({ email });
      if (!exists) return res.status(404).json({ error: 'Utilisateur non trouve' });
      return res.status(403).json({ error: 'Credits insuffisants !' });
    }
    res.json({ success: true, creditsRemaining: result.credits });
  } catch (e) {
    console.error('Erreur consume:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajout de credits (Mode Test pour l'instant, sera branché sur Stripe plus tard)
app.post('/api/add-credits', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    const amount = parseInt(req.body.amount) || 0;
    
    const result = await usersCol.findOneAndUpdate(
      { email },
      { $inc: { credits: amount } },
      { returnDocument: 'after' }
    );
    
    if (!result) return res.status(404).json({ error: 'Utilisateur non trouve' });
    res.json({ success: true, credits: result.credits });
  } catch (e) {
    console.error('Erreur add-credits:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrage : connexion à la base PUIS lancement du serveur
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('Serveur demarre sur le port ' + PORT);
  });
}).catch(e => {
  console.error('Erreur connexion MongoDB : ' + e.message);
  process.exit(1);
});