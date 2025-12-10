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

// Utility: run queries with promise
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

/**
 * Quiz decision tree
 */
const QUIZ_TREE = [
  {
    base: 'Basic Vanilla',
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
        name: 'Chocolate/Fudge',
        toppings: [
          {
            name: 'Simple Chocolate',
            cupcakes: ['Yellow with Chocolate Buttercream', 'Yellow with Milk Chocolate Frosting']
          }
        ]
      }
    ]
  },
  {
    base: 'Nutty',
    icings: [
      {
        name: 'Coconut Cream Cheese',
        toppings: [
          {
            name: 'Toasted Coconut/Nut',
            cupcakes: ['Almond Joy', 'Coconut Macaroon', 'Italian Cream', 'Hummingbird']
          }
        ]
      },
      {
        name: 'Nutella',
        toppings: [
          {
            name: 'Hazelnut/Chocolate',
            cupcakes: ['Coconut Nutella', 'Mocha Nutella']
          }
        ]
      }
    ]
  },
  {
    base: 'Fruity',
    icings: [
      {
        name: 'Strawberry Cream',
        toppings: [
          {
            name: 'Fresh Fruit',
            cupcakes: ['Strawberry Shortcake', 'Berry Bliss']
          }
        ]
      },
      {
        name: 'Lemon Buttercream',
        toppings: [
          {
            name: 'Zest/Curd',
            cupcakes: ['Lemon Zest', 'Lemon Raspberry']
          }
        ]
      }
    ]
  },
  {
    base: 'Spiced',
    icings: [
      {
        name: 'Cinnamon Cream',
        toppings: [
          {
            name: 'Spice Garnish',
            cupcakes: ['Pumpkin Spice', 'Chai Latte']
          }
        ]
      },
      {
        name: 'Cream Cheese',
        toppings: [
          {
            name: 'Classic Spice',
            cupcakes: ['Carrot Cake', 'Ginger Snap']
          }
        ]
      }
    ]
  },
  {
    base: 'Coffee/Drink',
    icings: [
      {
        name: 'Espresso Buttercream',
        toppings: [
          {
            name: 'Mocha Drizzle',
            cupcakes: ['Mocha Delight', 'Caramel Macchiato']
          }
        ]
      },
      {
        name: 'Irish Cream',
        toppings: [
          {
            name: 'Chocolate Shavings',
            cupcakes: ['Irish Coffee', 'Tiramisu Cupcake']
          }
        ]
      }
    ]
  }
];

// In-memory quiz sessions
const sessions = new Map();

/**
 * Start quiz
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
 * Answer quiz step
 */
app.post('/api/quiz/answer', async (req, res) => {
  const { sessionID, answer } = req.body;
  const state = sessions.get(sessionID);
  if (!state) return res.status(404).json({ error: 'Session not found' });

  // Step 1: base
  if (state.step === 1) {
    state.answers.base = answer;
    state.step = 2;
    const baseNode = QUIZ_TREE.find(b => b.base === answer);
    if (!baseNode) return res.status(400).json({ error: 'Invalid base choice' });
    return res.json({
      sessionID,
      step: 2,
      question: `Great choice! Now pick an icing for ${answer}:`,
      options: baseNode.icings.map(i => i.name)
    });
  }

  // Step 2: icing
  if (state.step === 2) {
    state.answers.icing = answer;
    state.step = 3;
    const baseNode = QUIZ_TREE.find(b => b.base === state.answers.base);
    const icingNode = baseNode.icings.find(i => i.name === answer);
    if (!icingNode) return res.status(400).json({ error: 'Invalid icing choice' });
    return res.json({
      sessionID,
      step: 3,
      question: `Last step — pick your topping/accent:`,
      options: icingNode.toppings.map(t => t.name)
    });
  }

  // Step 3: topping
  if (state.step === 3) {
    state.answers.topping = answer;
    state.step = 4;
    const baseNode = QUIZ_TREE.find(b => b.base === state.answers.base);
    const icingNode = baseNode.icings.find(i => i.name === state.answers.icing);
    const toppingNode = icingNode.toppings.find(t => t.name === answer);
    if (!toppingNode) return res.status(400).json({ error: 'Invalid topping choice' });

    const cupcakes = toppingNode.cupcakes;

    // Fetch retailers for each cupcake
    const results = [];
    for (const cname of cupcakes) {
      const rows = await runQuery(`
        SELECT r.rname, r.location
        FROM retailer r
        JOIN cupcake_available_at ca ON ca.retailerID = r.retailerID
        JOIN cupcake c ON c.cupcakeID = ca.cupcakeID
        WHERE c.cname = ?
      `, [cname]);
      results.push({ cupcake: cname, retailers: rows });
    }

    return res.json({
      sessionID,
      step: 4,
      recommendation: {
        message: `Here are your recommended cupcakes:`,
        cupcakes: results
      }
    });
  }

  res.json({ sessionID, step: state.step, info: 'Quiz already completed' });
});

// Server start
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
