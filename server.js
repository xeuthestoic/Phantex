const express = require('express');
const bodyParser = require('body-parser');
const admin = require('./firebase-admin');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Route de test
app.get('/', (req, res) => {
  res.send('OSINT Tool API');
});

// Route pour l'authentification
app.post('/auth', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(user.uid);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Invalid credentials' });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
