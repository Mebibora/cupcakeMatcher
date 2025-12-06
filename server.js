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

// ---------- CRUD for cupcakes ----------

// CREATE a new cupcake
// POST /api/cupcake
// Body: { "cname": "Red Velvet", "flavor_profile": "Basic Vanilla" }
app.post('/api/cupcake', (req, res) => {
  const { cname, flavor_profile } = req.body;

  if (!cname || !flavor_profile) {
    return res.status(400).json({ error: 'cname and flavor_profile are required' });
  }

  const sql = 'INSERT INTO cupcake (cname, flavor_profile) VALUES (?, ?)';
  db.query(sql, [cname, flavor_profile], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'A cupcake with that name already exists' });
      }
      return res.status(500).json({ error: err });
    }

    return res.status(201).json({
      message: 'Cupcake created',
      cupcake: { cname, flavor_profile }
    });
  });
});

// READ a single cupcake by name
// GET /api/cupcake/:cname
app.get('/api/cupcake/:cname', (req, res) => {
  const { cname } = req.params;
  const sql = 'SELECT * FROM cupcake WHERE cname = ?';

  db.query(sql, [cname], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Cupcake not found' });
    }

    return res.json(results[0]);
  });
});

// UPDATE a cupcake’s flavor_profile
// PUT /api/cupcake/:cname
// Body: { "flavor_profile": "Spiced" }
app.put('/api/cupcake/:cname', (req, res) => {
  const { cname } = req.params;
  const { flavor_profile } = req.body;

  if (!flavor_profile) {
    return res.status(400).json({ error: 'flavor_profile is required' });
  }

  const sql = 'UPDATE cupcake SET flavor_profile = ? WHERE cname = ?';
  db.query(sql, [flavor_profile, cname], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cupcake not found' });
    }

    return res.json({
      message: 'Cupcake updated',
      cupcake: { cname, flavor_profile }
    });
  });
});

// DELETE a cupcake by name
// DELETE /api/cupcake/:cname
app.delete('/api/cupcake/:cname', (req, res) => {
  const { cname } = req.params;
  const sql = 'DELETE FROM cupcake WHERE cname = ?';

  db.query(sql, [cname], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cupcake not found' });
    }

    return res.json({ message: 'Cupcake deleted' });
  });
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
