const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db_config');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // serve HTML/CSS/JS from public/

// Utility: simple helper to run queries with promise
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

/**
 * Health check
 */
app.get('/api/health', async (req, res) => {
  try {
    await runQuery('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'DB not reachable', details: err });
  }
});

/**
 * Cupcakes CRUD
 */

// Create cupcake (and optionally map to flavorIDs)
app.post('/api/cupcakes', async (req, res) => {
  try {
    const { cname, base, flavor_profile, recipe_url, flavorIDs } = req.body;
    if (!cname || !base || !flavor_profile) {
      return res.status(400).json({ error: 'cname, base, and flavor_profile are required' });
    }

    const insertCupcake = `
      INSERT INTO cupcake (cname, base, flavor_profile, recipe_url)
      VALUES (?, ?, ?, ?)
    `;
    const result = await runQuery(insertCupcake, [cname, base, flavor_profile, recipe_url || null]);
    const cupcakeID = result.insertId;

    // Map flavors if provided
    if (Array.isArray(flavorIDs) && flavorIDs.length > 0) {
      const values = flavorIDs.map(fid => [cupcakeID, fid]);
      await runQuery('INSERT INTO cupcake_flavor (cupcakeID, flavorID) VALUES ?', [values]);
    }

    const created = await runQuery('SELECT * FROM cupcake WHERE cupcakeID = ?', [cupcakeID]);
    res.json(created[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create cupcake', details: err });
  }
});

// Read: get all cupcakes
app.get('/api/cupcakes', async (req, res) => {
  try {
    const { base, q } = req.query; // optional filters
    let sql = 'SELECT * FROM cupcake';
    const params = [];
    const where = [];

    if (base) {
      where.push('base = ?');
      params.push(base);
    }
    if (q) {
      where.push('(cname LIKE ? OR flavor_profile LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    if (where.length) {
      sql += ' WHERE ' + where.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const results = await runQuery(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cupcakes', details: err });
  }
});

// Read: get cupcake by ID (with flavors)
app.get('/api/cupcakes/:cupcakeID', async (req, res) => {
  try {
    const { cupcakeID } = req.params;
    const cupcake = await runQuery('SELECT * FROM cupcake WHERE cupcakeID = ?', [cupcakeID]);
    if (cupcake.length === 0) return res.status(404).json({ error: 'Cupcake not found' });

    const flavors = await runQuery(
      `SELECT f.flavorID, f.flavor_name, f.flavor_group
       FROM cupcake_flavor cf
       JOIN flavor f ON f.flavorID = cf.flavorID
       WHERE cf.cupcakeID = ?`,
      [cupcakeID]
    );

    res.json({ ...cupcake[0], flavors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cupcake', details: err });
  }
});

// Update cupcake
app.put('/api/cupcakes/:cupcakeID', async (req, res) => {
  try {
    const { cupcakeID } = req.params;
    const { cname, base, flavor_profile, recipe_url, flavorIDs } = req.body;

    // Ensure cupcake exists
    const exists = await runQuery('SELECT * FROM cupcake WHERE cupcakeID = ?', [cupcakeID]);
    if (exists.length === 0) return res.status(404).json({ error: 'Cupcake not found' });

    const updateCupcake = `
      UPDATE cupcake
      SET cname = ?, base = ?, flavor_profile = ?, recipe_url = ?
      WHERE cupcakeID = ?
    `;
    await runQuery(updateCupcake, [
      cname ?? exists[0].cname,
      base ?? exists[0].base,
      flavor_profile ?? exists[0].flavor_profile,
      recipe_url ?? exists[0].recipe_url,
      cupcakeID
    ]);

    // Update flavors if provided
    if (Array.isArray(flavorIDs)) {
      await runQuery('DELETE FROM cupcake_flavor WHERE cupcakeID = ?', [cupcakeID]);
      if (flavorIDs.length > 0) {
        const values = flavorIDs.map(fid => [cupcakeID, fid]);
        await runQuery('INSERT INTO cupcake_flavor (cupcakeID, flavorID) VALUES ?', [values]);
      }
    }

    const updated = await runQuery('SELECT * FROM cupcake WHERE cupcakeID = ?', [cupcakeID]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cupcake', details: err });
  }
});

// Delete cupcake
app.delete('/api/cupcakes/:cupcakeID', async (req, res) => {
  try {
    const { cupcakeID } = req.params;
    const result = await runQuery('DELETE FROM cupcake WHERE cupcakeID = ?', [cupcakeID]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cupcake not found' });
    res.json({ message: 'Cupcake deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete cupcake', details: err });
  }
});

/**
 * Flavors
 */

// List flavors
app.get('/api/flavors', async (req, res) => {
  try {
    const { group } = req.query;
    let sql = 'SELECT * FROM flavor';
    const params = [];
    if (group) {
      sql += ' WHERE flavor_group = ?';
      params.push(group);
    }
    sql += ' ORDER BY flavor_name ASC';
    const flavors = await runQuery(sql, params);
    res.json(flavors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flavors', details: err });
  }
});

// Cupcakes by flavor name (join)
app.get('/api/cupcakes-by-flavor/:flavorName', async (req, res) => {
  try {
    const { flavorName } = req.params;
    const sql = `
      SELECT c.*
      FROM cupcake c
      JOIN cupcake_flavor cf ON cf.cupcakeID = c.cupcakeID
      JOIN flavor f ON f.flavorID = cf.flavorID
      WHERE f.flavor_name = ?
      ORDER BY c.created_at DESC
    `;
    const results = await runQuery(sql, [flavorName]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cupcakes by flavor', details: err });
  }
});

/**
 * Ingredients and allergen joins (for “interesting queries”)
 */

// List ingredients
app.get('/api/ingredients', async (req, res) => {
  try {
    const ingredients = await runQuery('SELECT * FROM ingredients ORDER BY iname ASC');
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ingredients', details: err });
  }
});

// Cupcakes containing a given ingredient
app.get('/api/cupcakes-by-ingredient/:iname', async (req, res) => {
  try {
    const { iname } = req.params;
    const sql = `
      SELECT c.*
      FROM cupcake c
      JOIN contains ct ON ct.cupcakeID = c.cupcakeID
      JOIN ingredients i ON i.ingredientID = ct.ingredientID
      WHERE i.iname = ?
      ORDER BY c.created_at DESC
    `;
    const results = await runQuery(sql, [iname]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cupcakes by ingredient', details: err });
  }
});

// Ingredients with allergens
app.get('/api/ingredients-with-allergens', async (req, res) => {
  try {
    const sql = `
      SELECT i.iname, i.category, a.allergen_category
      FROM ingredients i
      LEFT JOIN allergen a ON a.ingredientID = i.ingredientID
      ORDER BY i.iname ASC
    `;
    const results = await runQuery(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch allergens', details: err });
  }
});

/**
 * Retailers and availability
 */

// List retailers
app.get('/api/retailers', async (req, res) => {
  try {
    const retailers = await runQuery('SELECT * FROM retailer ORDER BY rname ASC, location ASC');
    res.json(retailers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch retailers', details: err });
  }
});

// Cupcakes sold at a retailer (join)
app.get('/api/retailers/:retailerID/cupcakes', async (req, res) => {
  try {
    const { retailerID } = req.params;
    const sql = `
      SELECT c.*
      FROM cupcake_available_at ca
      JOIN cupcake c ON c.cupcakeID = ca.cupcakeID
      WHERE ca.retailerID = ?
      ORDER BY c.cname ASC
    `;
    const results = await runQuery(sql, [retailerID]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch retailer cupcakes', details: err });
  }
});

/**
 * Likes (favorites)
 */

// Like a cupcake
app.post('/api/likes', async (req, res) => {
  try {
    const { userID, cupcakeID } = req.body;
    if (!userID || !cupcakeID) return res.status(400).json({ error: 'userID and cupcakeID are required' });
    await runQuery('INSERT IGNORE INTO likes (userID, cupcakeID) VALUES (?, ?)', [userID, cupcakeID]);
    res.json({ message: 'Liked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like cupcake', details: err });
  }
});

// List likes for a user (join)
app.get('/api/users/:userID/likes', async (req, res) => {
  try {
    const { userID } = req.params;
    const sql = `
      SELECT c.*
      FROM likes l
      JOIN cupcake c ON c.cupcakeID = l.cupcakeID
      WHERE l.userID = ?
      ORDER BY l.created_at DESC
    `;
    const results = await runQuery(sql, [userID]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user likes', details: err });
  }
});

/**
 * Search logging and analytics (advanced/interesting queries)
 */

// Log a search
app.post('/api/search-log', async (req, res) => {
  try {
    const { userID, query_text } = req.body;
    if (!query_text) return res.status(400).json({ error: 'query_text is required' });
    const sql = 'INSERT INTO search_log (userID, query_text) VALUES (?, ?)';
    await runQuery(sql, [userID || null, query_text]);
    res.json({ message: 'Search logged' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log search', details: err });
  }
});

// Popular searches (aggregate)
app.get('/api/analytics/popular-searches', async (req, res) => {
  try {
    const sql = `
      SELECT query_text, COUNT(*) AS count
      FROM search_log
      GROUP BY query_text
      ORDER BY count DESC, query_text ASC
      LIMIT 20
    `;
    const results = await runQuery(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch popular searches', details: err });
  }
});

// Cupcakes by base (aggregate)
app.get('/api/analytics/cupcakes-by-base', async (req, res) => {
  try {
    const sql = `
      SELECT base, COUNT(*) AS count
      FROM cupcake
      GROUP BY base
      ORDER BY count DESC, base ASC
    `;
    const results = await runQuery(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cupcakes by base', details: err });
  }
});

// Cupcakes by flavor (join + aggregate)
app.get('/api/analytics/cupcakes-by-flavor', async (req, res) => {
  try {
    const sql = `
      SELECT f.flavor_name, COUNT(cf.cupcakeID) AS count
      FROM flavor f
      LEFT JOIN cupcake_flavor cf ON cf.flavorID = f.flavorID
      GROUP BY f.flavorID, f.flavor_name
      ORDER BY count DESC, f.flavor_name ASC
    `;
    const results = await runQuery(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cupcakes by flavor', details: err });
  }
});

/**
 * Quiz decision tree
 * - Server-side decision tree based on your branching PDF
 * - Levels: base -> icing -> topping -> cupcakes
 */

const QUIZ_TREE = [
  {
    base: 'Chocolate',
    icings: [
      {
        name: 'Chocolate Ganache/Mousse',
        toppings: [
          {
            name: 'Chocolate/Sauce',
            cupcakes: ['Death by Chocolate', 'Triple Chocolate Jack Daniels', 'Faux Chocolate Hostess']
          }
        ]
      },
      {
        name: 'Peanut Butter',
        toppings: [
          {
            name: 'Candy (Mini Cups, Crushed Candy)',
            cupcakes: ['Double Stuffed Peanut Butter Cup Bliss', 'Reese\'s Peanut Butter Cup', 'Ultimate Snickers']
          }
        ]
      },
      {
        name: 'Mint/Shamrock Shake',
        toppings: [
          { name: 'Nut Crunch', cupcakes: ['Double Stuffed Peanut Butter Cup Bliss'] },
          { name: 'Candy/Chocolate Chip', cupcakes: ['Shamrock Shake'] }
        ]
      }
    ]
  },
  {
    base: 'Vanilla',
    icings: [
      {
        name: 'Vanilla Buttercream',
        toppings: [
          {
            name: 'Sprinkles/Simple Garnish',
            cupcakes: ['Classic Vanilla', 'Ultimate Birthday', 'Vanilla Bean', 'Vanilla Bean White Velvet']
          }
        ]
      },
      {
        name: 'Cream Cheese',
        toppings: [{ name: 'Sprinkles', cupcakes: ['Funfetti', 'Sour Cream Funfetti'] }]
      },
      {
        name: 'Chocolate/Fudge',
        toppings: [{ name: 'Simple Chocolate', cupcakes: ['Yellow with Chocolate Buttercream', 'Yellow with Milk Chocolate Frosting'] }]
      }
    ]
  },
  {
    base: 'Nutty',
    icings: [
      {
        name: 'Coconut Cream Cheese',
        toppings: [{ name: 'Toasted Coconut/Nut', cupcakes: ['Almond Joy', 'Coconut Macaroon', 'Italian Cream', 'Hummingbird'] }]
      },
      {
        name: 'Nutella',
        toppings: [{ name: 'Hazelnut/Chocolate', cupcakes: ['Coconut Nutella', 'Mocha Nutella'] }]
      },
      {
        name: 'Maple Buttercream',
        toppings: [{ name: 'Pecan/Crunch', cupcakes: ['Maple Butter Pecan'] }]
      }
    ]
  },
  {
    base: 'Fruity',
    icings: [
      {
        name: 'Caramel Buttercream',
        toppings: [{ name: 'Crunchy/Caramel Drizzle', cupcakes: ['Apple Cider', 'Apple Pie', 'Caramel Apple', 'Banana Caramel'] }]
      },
      {
        name: 'Berry Buttercream',
        toppings: [{ name: 'Fresh Fruit/Curd', cupcakes: ['Strawberry', 'Raspberry Lemon', 'Summer Berry', 'Berries and Cream', 'Strawberry Sundae'] }]
      },
      {
        name: 'Lemon/Lime Buttercream',
        toppings: [{ name: 'Zest/Meringue', cupcakes: ['Key Lime Pie', 'Lemon', 'Pink Lemonade', 'Lemon Meringue'] }]
      }
    ]
  },
  {
    base: 'Spice/Savory',
    icings: [
      {
        name: 'Cinnamon Buttercream',
        toppings: [{ name: 'Spice Dust/Toffee', cupcakes: ['Pumpkin', 'Pumpkin Spice Latte', 'Apple Cinnamon Pancake', 'Snickerdoodle'] }]
      },
      {
        name: 'Mascarpone/Light Buttercream',
        toppings: [{ name: 'Chocolate/Spice Dust', cupcakes: ['Tiramisu', 'Cannoli'] }]
      }
    ]
  },
  {
    base: 'Boozy/Beverage',
    icings: [
      {
        name: 'Tequila/Lime Buttercream',
        toppings: [{ name: 'Salt Rim/Garnish', cupcakes: ['Berry Margarita', 'Margarita', 'Tequila Sunrise'] }]
      },
      {
        name: 'Champagne/Prosecco',
        toppings: [{ name: 'Edible Glitter/Sugar', cupcakes: ['Pink Asti', 'Champagne', 'Cranberry Mimosa', 'Grapefruit Champagne Mimosa'] }]
      },
      {
        name: 'Marshmallow Fluff/Meringue',
        toppings: [{ name: 'Toasted/Fudge', cupcakes: ['Strawberry S\'mores', 'S\'mores Frappuccino', 'S\'more Cupcakes'] }]
      },
      {
        name: 'Malt Buttercream',
        toppings: [{ name: 'Crunchy Cereal/Malt', cupcakes: ['Black and White Malt Shoppe'] }]
      }
    ]
  }
];

// In-memory quiz sessions: sessionID -> progress
const sessions = new Map();

/**
 * Start quiz: returns Level 1 (base) question
 */
app.post('/api/quiz/start', (req, res) => {
  const sessionID = uuidv4();
  sessions.set(sessionID, { step: 1, answers: {} });
  const bases = QUIZ_TREE.map(b => b.base);
  res.json({
    sessionID,
    step: 1,
    question: 'Choose your cupcake base:',
    options: bases
  });
});

/**
 * Next step: advance through base -> icing -> topping
 */
app.post('/api/quiz/answer', (req, res) => {
  const { sessionID, answer } = req.body;
  if (!sessionID || !answer) {
    return res.status(400).json({ error: 'sessionID and answer are required' });
  }
  const state = sessions.get(sessionID);
  if (!state) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Step 1: choose base
  if (state.step === 1) {
    state.answers.base = answer;
    state.step = 2;

    const baseNode = QUIZ_TREE.find(b => b.base === answer);
    if (!baseNode) return res.status(400).json({ error: 'Invalid base choice' });

    res.json({
      sessionID,
      step: 2,
      question: `Great choice! Now pick an icing for ${answer}:`,
      options: baseNode.icings.map(i => i.name)
    });
    return;
  }

  // Step 2: choose icing
  if (state.step === 2) {
    state.answers.icing = answer;
    state.step = 3;

    const baseNode = QUIZ_TREE.find(b => b.base === state.answers.base);
    const icingNode = baseNode.icings.find(i => i.name === answer);
    if (!icingNode) return res.status(400).json({ error: 'Invalid icing choice' });

    res.json({
      sessionID,
      step: 3,
      question: `Last step — pick your topping/accent:`,
      options: icingNode.toppings.map(t => t.name)
    });
    return;
  }

  // Step 3: choose topping -> recommend cupcakes
  if (state.step === 3) {
    state.answers.topping = answer;
    state.step = 4;

    const baseNode = QUIZ_TREE.find(b => b.base === state.answers.base);
    const icingNode = baseNode.icings.find(i => i.name === state.answers.icing);
    const toppingNode = icingNode.toppings.find(t => t.name === answer);
    if (!toppingNode) return res.status(400).json({ error: 'Invalid topping choice' });

    const cupcakes = toppingNode.cupcakes;

    res.json({
      sessionID,
      step: 4,
      recommendation: {
        message: `Here are your recommended cupcakes:`,
        cupcakes
      }
    });
    return;
  }

  res.json({ sessionID, step: state.step, info: 'Quiz already completed' });
});

/**
 * Recommendation engine (existing)
 * - Accepts preferences: array of flavor names or keywords
 */
app.post('/api/recommend', async (req, res) => {
  try {
    const { preferences } = req.body; // e.g., ["Chocolate", "Berry", "Boozy"]
    if (!Array.isArray(preferences) || preferences.length === 0) {
      return res.status(400).json({ error: 'preferences array is required' });
    }

    // Fetch cupcakes and their mapped flavors
    const cupcakes = await runQuery(`
      SELECT c.cupcakeID, c.cname, c.base, c.flavor_profile, c.recipe_url
      FROM cupcake c
    `);

    const flavorMap = await runQuery(`
      SELECT cf.cupcakeID, f.flavor_name
      FROM cupcake_flavor cf
      JOIN flavor f ON f.flavorID = cf.flavorID
    `);

    // Build lookup: cupcakeID -> [flavor_names]
    const flavorsByCupcake = {};
    for (const row of flavorMap) {
      if (!flavorsByCupcake[row.cupcakeID]) flavorsByCupcake[row.cupcakeID] = [];
      flavorsByCupcake[row.cupcakeID].push(row.flavor_name.toLowerCase());
    }

    const prefs = preferences.map(p => p.toLowerCase());
    const scored = cupcakes.map(c => {
      const tags = (c.flavor_profile || '').toLowerCase();
      const mapped = (flavorsByCupcake[c.cupcakeID] || []);
      let score = 0;

      for (const p of prefs) {
        // +2 for normalized flavor map match, +1 for textual flavor_profile match
        if (mapped.includes(p)) score += 2;
        if (tags.includes(p)) score += 1;
        if ((c.base || '').toLowerCase() === p) score += 1; // base alignment bonus
      }

      return { ...c, score };
    });

    // Filter out score 0 and sort desc
    const recommendations = scored
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to recommend cupcakes', details: err });
  }
});

/**
 * Recommendation feedback (existing)
 */
app.post('/api/recommend/feedback', async (req, res) => {
  try {
    const { userID, cupcakeID, relevance_score } = req.body;
    if (!userID || !cupcakeID || typeof relevance_score !== 'number') {
      return res.status(400).json({ error: 'userID, cupcakeID, and numeric relevance_score are required' });
    }
    await runQuery(
      'INSERT INTO recommendation_feedback (userID, cupcakeID, relevance_score) VALUES (?, ?, ?)',
      [userID, cupcakeID, Math.max(1, Math.min(5, relevance_score))]
    );
    res.json({ message: 'Feedback recorded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record feedback', details: err });
  }
});

// Example: average relevance per cupcake
app.get('/api/analytics/relevance', async (req, res) => {
  try {
    const sql = `
      SELECT c.cname, AVG(rf.relevance_score) AS avg_score, COUNT(*) AS votes
      FROM recommendation_feedback rf
      JOIN cupcake c ON c.cupcakeID = rf.cupcakeID
      GROUP BY rf.cupcakeID, c.cname
      HAVING votes >= 1
      ORDER BY avg_score DESC, votes DESC, c.cname ASC
    `;
    const results = await runQuery(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch relevance analytics', details: err });
  }
});

// Server start
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
