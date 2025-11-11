const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db_config');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // serve HTML/CSS/JS files from public/

//Example API route: get cupcake recommendations by flavor base
app.get('/api/cupcakes/:base', (req, res) => {
  const { base } = req.params;

  // Example: find cupcakes whose flavor_profile includes the base name
  const query = 'SELECT * FROM cupcake WHERE flavor_profile LIKE ?';
  db.query(query, [`%${base}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Example: get all cupcakes (for testing) 
app.get('/api/cupcakes', (req, res) => {
  db.query('SELECT * FROM cupcake', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
