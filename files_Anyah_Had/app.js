// Data mapping from the provided branching doc.
// We normalize categories into consistent labels for base, icing, topping.

const OPTIONS = {
  base: [
    "Basic (Chocolate)",
    "Basic (Chocolate/Vanilla)",
    "Basic (Vanilla)",
    "Basic (Vanilla/Fruity)",
    "Nutty (Coconut)",
    "Nutty (Pecan/Walnut)",
    "Fruity (Apple/Banana)",
    "Fruity (Berry)",
    "Fruity (Citrus)",
    "Spice (Pumpkin/Chai)",
    "Savory (Italian/Dessert)",
    "Boozy (Margarita/Citrus)",
    "Boozy (Champagne/Mimosa)",
    "Boozy (S'mores/Meringue)",
    "Boozy (Malt/Beverage)"
  ],
  icing: [
    "Chocolate Ganache/Mousse",
    "Peanut Butter",
    "Mint/Shamrock Shake",
    "Vanilla Buttercream",
    "Cream Cheese",
    "Chocolate/Fudge",
    "Coconut Cream Cheese",
    "Nutella",
    "Maple Buttercream",
    "Caramel Buttercream",
    "Berry Buttercream",
    "Lemon/Lime Buttercream",
    "Cinnamon Buttercream",
    "Mascarpone/Light Buttercream",
    "Tequila/Lime Buttercream",
    "Champagne/Prosecco",
    "Marshmallow Fluff/Meringue",
    "Malt Buttercream"
  ],
  topping: [
    "Chocolate/Sauce",
    "Candy",
    "Nut Crunch",
    "Candy/Chocolate Chip",
    "Sprinkles/Simple Garnish",
    "Sprinkles",
    "Simple Chocolate",
    "Toasted Coconut/Nut",
    "Hazelnut/Chocolate",
    "Pecan/Crunch",
    "Crunchy/Caramel Drizzle",
    "Fresh Fruit/Curd",
    "Zest/Meringue",
    "Spice Dust/Toffee",
    "Chocolate/Spice Dust",
    "Salt Rim/Garnish",
    "Edible Glitter/Sugar",
    "Toasted/Fudge",
    "Crumb/Chocolate",
    "Crunchy Cereal/Malt"
  ]
};

// Branching: key combos -> recommended cupcakes
const MATCHES = [
  {
    base: "Basic (Chocolate)",
    icing: "Chocolate Ganache/Mousse",
    topping: "Chocolate/Sauce",
    cupcakes: ["Death by Chocolate", "Triple Chocolate Jack Daniels", "Faux Chocolate Hostess"]
  },
  {
    base: "Basic (Chocolate/Vanilla)",
    icing: "Peanut Butter",
    topping: "Candy",
    cupcakes: ["Double Stuffed Peanut Butter Cup Bliss", "Reese's Peanut Butter Cup", "Ultimate Snickers"]
  },
  {
    base: "Basic (Chocolate/Vanilla)",
    icing: "Mint/Shamrock Shake",
    topping: "Nut Crunch",
    cupcakes: ["Double Stuffed Peanut Butter Cup Bliss"]
  },
  {
    base: "Basic (Chocolate/Vanilla)",
    icing: "Mint/Shamrock Shake",
    topping: "Candy/Chocolate Chip",
    cupcakes: ["Shamrock Shake"]
  },
  {
    base: "Basic (Vanilla)",
    icing: "Vanilla Buttercream",
    topping: "Sprinkles/Simple Garnish",
    cupcakes: ["Classic Vanilla", "Ultimate Birthday", "Vanilla Bean", "Vanilla Bean White Velvet"]
  },
  {
    base: "Basic (Vanilla/Fruity)",
    icing: "Cream Cheese",
    topping: "Sprinkles",
    cupcakes: ["Funfetti", "Sour Cream Funfetti"]
  },
  {
    base: "Basic (Vanilla)",
    icing: "Chocolate/Fudge",
    topping: "Simple Chocolate",
    cupcakes: ["Yellow with Chocolate Buttercream", "Yellow with Milk Chocolate Frosting"]
  },
  {
    base: "Nutty (Coconut)",
    icing: "Coconut Cream Cheese",
    topping: "Toasted Coconut/Nut",
    cupcakes: ["Almond Joy", "Coconut Macaroon", "Italian Cream", "Hummingbird"]
  },
  {
    base: "Nutty (Coconut)",
    icing: "Nutella",
    topping: "Hazelnut/Chocolate",
    cupcakes: ["Coconut Nutella", "Mocha Nutella"]
  },
  {
    base: "Nutty (Pecan/Walnut)",
    icing: "Maple Buttercream",
    topping: "Pecan/Crunch",
    cupcakes: ["Maple Butter Pecan"]
  },
  {
    base: "Fruity (Apple/Banana)",
    icing: "Caramel Buttercream",
    topping: "Crunchy/Caramel Drizzle",
    cupcakes: ["Apple Cider", "Apple Pie", "Caramel Apple", "Banana Caramel"]
  },
  {
    base: "Fruity (Berry)",
    icing: "Berry Buttercream",
    topping: "Fresh Fruit/Curd",
    cupcakes: ["Strawberry", "Raspberry Lemon", "Summer Berry", "Berries and Cream", "Strawberry Sundae"]
  },
  {
    base: "Fruity (Citrus)",
    icing: "Lemon/Lime Buttercream",
    topping: "Zest/Meringue",
    cupcakes: ["Key Lime Pie", "Lemon", "Pink Lemonade", "Lemon Meringue"]
  },
  {
    base: "Spice (Pumpkin/Chai)",
    icing: "Cinnamon Buttercream",
    topping: "Spice Dust/Toffee",
    cupcakes: ["Pumpkin", "Pumpkin Spice Latte", "Apple Cinnamon Pancake", "Snickerdoodle"]
  },
  {
    base: "Savory (Italian/Dessert)",
    icing: "Mascarpone/Light Buttercream",
    topping: "Chocolate/Spice Dust",
    cupcakes: ["Tiramisu", "Cannoli"]
  },
  {
    base: "Boozy (Margarita/Citrus)",
    icing: "Tequila/Lime Buttercream",
    topping: "Salt Rim/Garnish",
    cupcakes: ["Berry Margarita", "Margarita", "Tequila Sunrise"]
  },
  {
    base: "Boozy (Champagne/Mimosa)",
    icing: "Champagne/Prosecco",
    topping: "Edible Glitter/Sugar",
    cupcakes: ["Pink Asti", "Champagne", "Cranberry Mimosa", "Grapefruit Champagne Mimosa"]
  },
  {
    base: "Boozy (S'mores/Meringue)",
    icing: "Marshmallow Fluff/Meringue",
    topping: "Toasted/Fudge",
    cupcakes: ["Strawberry S'mores", "S'mores Frappuccino", "S'more Cupcakes"]
  },
  {
    base: "Boozy (S'mores/Meringue)",
    icing: "Marshmallow Fluff/Meringue",
    topping: "Crumb/Chocolate",
    cupcakes: ["Strawberry S'mores", "S'mores Frappuccino", "S'more Cupcakes"]
  },
  {
    base: "Boozy (Malt/Beverage)",
    icing: "Malt Buttercream",
    topping: "Crunchy Cereal/Malt",
    cupcakes: ["Black and White Malt Shoppe"]
  }
];

// Retailers from the doc (plus sensible mappings)
const RETAILERS = {
  "Death by Chocolate": ["Magnolia Bakery", "Sprinkles Cupcakes", "Ghirardelli Chocolate Shops"],
  "Triple Chocolate Jack Daniels": ["Local artisan bakeries"],
  "Faux Chocolate Hostess": ["Local artisan bakeries"],
  "Double Stuffed Peanut Butter Cup Bliss": ["Hershey's Chocolate World", "Publix"],
  "Reese's Peanut Butter Cup": ["Hershey's Chocolate World", "Walmart Bakery", "Publix"],
  "Ultimate Snickers": ["Walmart Bakery", "Publix"],
  "Classic Vanilla": ["Magnolia Bakery", "Georgetown Cupcake", "Whole Foods"],
  "Ultimate Birthday": ["Magnolia Bakery", "Georgetown Cupcake", "Whole Foods"],
  "Vanilla Bean": ["Magnolia Bakery", "Georgetown Cupcake", "Whole Foods"],
  "Vanilla Bean White Velvet": ["Magnolia Bakery", "Georgetown Cupcake", "Whole Foods"],
  "Funfetti": ["Whole Foods", "Publix"],
  "Sour Cream Funfetti": ["Whole Foods", "Publix"],
  "Yellow with Chocolate Buttercream": ["Whole Foods", "Publix"],
  "Yellow with Milk Chocolate Frosting": ["Whole Foods", "Publix"],
  "Almond Joy": ["Milk Bar", "Trader Joe's", "Local artisan bakeries"],
  "Coconut Macaroon": ["Milk Bar", "Local artisan bakeries"],
  "Italian Cream": ["Milk Bar", "Local artisan bakeries"],
  "Hummingbird": ["Milk Bar", "Local artisan bakeries"],
  "Coconut Nutella": ["Local artisan bakeries"],
  "Mocha Nutella": ["Local artisan bakeries"],
  "Maple Butter Pecan": ["Publix", "Local artisan bakeries"],
  "Apple Cider": ["Crumbs Bake Shop", "Publix", "Kroger"],
  "Apple Pie": ["Crumbs Bake Shop", "Publix", "Kroger"],
  "Caramel Apple": ["Crumbs Bake Shop", "Publix", "Kroger"],
  "Banana Caramel": ["Publix", "Kroger"],
  "Strawberry": ["Sprinkles Cupcakes", "Whole Foods"],
  "Raspberry Lemon": ["Sprinkles Cupcakes", "Whole Foods"],
  "Summer Berry": ["Sprinkles Cupcakes", "Whole Foods"],
  "Berries and Cream": ["Sprinkles Cupcakes", "Whole Foods"],
  "Strawberry Sundae": ["Sprinkles Cupcakes", "Whole Foods"],
  "Key Lime Pie": ["Publix", "Local artisan bakeries"],
  "Lemon": ["Magnolia Bakery", "Publix"],
  "Pink Lemonade": ["Publix", "Local artisan bakeries"],
  "Lemon Meringue": ["Magnolia Bakery", "Publix"],
  "Pumpkin": ["Whole Foods", "Publix"],
  "Pumpkin Spice Latte": ["Whole Foods", "Publix"],
  "Apple Cinnamon Pancake": ["Whole Foods", "Publix"],
  "Snickerdoodle": ["Whole Foods", "Publix"],
  "Tiramisu": ["Eataly", "Carlo's Bakery", "Whole Foods"],
  "Cannoli": ["Eataly", "Carlo's Bakery"],
  "Berry Margarita": ["Sprinkles Cupcakes (seasonal)", "Local Mexican bakeries", "Publix"],
  "Margarita": ["Sprinkles Cupcakes (seasonal)", "Local Mexican bakeries", "Publix"],
  "Tequila Sunrise": ["Sprinkles Cupcakes (seasonal)", "Local Mexican bakeries", "Publix"],
  "Pink Asti": ["Magnolia Bakery", "Milk Bar", "Whole Foods"],
  "Champagne": ["Magnolia Bakery", "Milk Bar", "Whole Foods"],
  "Cranberry Mimosa": ["Magnolia Bakery", "Milk Bar", "Whole Foods"],
  "Grapefruit Champagne Mimosa": ["Magnolia Bakery", "Milk Bar", "Whole Foods"],
  "Strawberry S'mores": ["Local artisan bakeries"],
  "S'mores Frappuccino": ["Local artisan bakeries"],
  "S'more Cupcakes": ["Local artisan bakeries"],
  "Black and White Malt Shoppe": ["Local artisan bakeries"]
};

// Allergen inference by flavor keywords and category
function inferAllergens(name) {
  const allergens = new Set();

  // Base common allergens
  allergens.add("Gluten (wheat)");
  allergens.add("Eggs");
  allergens.add("Dairy");

  // Keyword-based
  const n = name.toLowerCase();
  if (n.includes("peanut") || n.includes("snicker")) allergens.add("Peanuts");
  if (n.includes("almond") || n.includes("nutella") || n.includes("hazelnut") || n.includes("pecan") || n.includes("walnut")) allergens.add("Tree nuts");
  if (n.includes("coconut")) allergens.add("Tree nuts (coconut)");
  if (n.includes("tiramisu") || n.includes("espresso") || n.includes("margarita") || n.includes("tequila") || n.includes("champagne")) allergens.add("Alcohol");
  if (n.includes("meringue") || n.includes("marshmallow")) allergens.add("Eggs");

  return Array.from(allergens);
}

// Utility: create buttons
function createButtons(containerId, items, onClick) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach(label => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.addEventListener("click", () => onClick(label, btn));
    container.appendChild(btn);
  });
}

// State
const state = {
  base: null,
  icing: null,
  topping: null
};

// Handle selections
function selectHandler(groupKey) {
  return (label, btn) => {
    state[groupKey] = label;

    // toggle selected styles
    const group = btn.parentElement;
    Array.from(group.children).forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    // update summary and enable match
    updateSummary();
  };
}

function updateSummary() {
  const sum = document.getElementById("summary-text");
  const ready = state.base && state.icing && state.topping;
  sum.textContent = `Base: ${state.base ?? "—"}, Icing: ${state.icing ?? "—"}, Topping: ${state.topping ?? "—"}`;
  const matchBtn = document.getElementById("match-btn");
  matchBtn.disabled = !ready;
}

// Find matches
function findMatches() {
  const found = MATCHES.find(
    m => m.base === state.base && m.icing === state.icing && m.topping === state.topping
  );

  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  if (!found) {
    const empty = document.createElement("div");
    empty.className = "result";
    empty.innerHTML = `<div class="result-title">No exact matches found</div>
      <p>Try a different icing or topping combination for your base.</p>`;
    resultsEl.appendChild(empty);
    return;
  }

  found.cupcakes.forEach(c => {
    const retailers = RETAILERS[c] || ["Local artisan bakeries"];
    const allergens = inferAllergens(c);

    const item = document.createElement("div");
    item.className = "result";

    const title = document.createElement("div");
    title.className = "result-title";
    title.textContent = c;
    item.appendChild(title);

    const row = document.createElement("div");
    row.className = "result-row";

    // Buy section
    const buyLabel = document.createElement("span");
    buyLabel.className = "badge";
    buyLabel.textContent = "Where to buy";
    row.appendChild(buyLabel);

    const buyList = document.createElement("div");
    buyList.className = "buy-list";
    retailers.forEach(r => {
      const a = document.createElement("a");
      a.className = "buy-link";
      a.href = "#";
      a.title = `Search ${r} for ${c}`;
      a.textContent = r;
      // Optional: wire to a search query
      a.onclick = (e) => {
        e.preventDefault();
        const q = encodeURIComponent(`${r} ${c} cupcakes`);
        window.open(`https://www.google.com/search?q=${q}`, "_blank");
      };
      buyList.appendChild(a);
    });
    row.appendChild(buyList);

    item.appendChild(row);

    // Allergens
    const allergenEl = document.createElement("div");
    allergenEl.className = "allergens";
    allergenEl.innerHTML = `<strong>Allergens:</strong> ${allergens.join(", ")}`;
    item.appendChild(allergenEl);

    resultsEl.appendChild(item);
  });
}

// Reset
function resetAll() {
  state.base = null;
  state.icing = null;
  state.topping = null;

  ["base-group", "icing-group", "topping-group"].forEach(id => {
    const group = document.getElementById(id);
    Array.from(group.children).forEach(b => b.classList.remove("selected"));
  });

  document.getElementById("results").innerHTML = "";
  updateSummary();
}

// Init
window.addEventListener("DOMContentLoaded", () => {
  createButtons("base-group", OPTIONS.base, selectHandler("base"));
  createButtons("icing-group", OPTIONS.icing, selectHandler("icing"));
  createButtons("topping-group", OPTIONS.topping, selectHandler("topping"));

  document.getElementById("match-btn").addEventListener("click", findMatches);
  document.getElementById("reset-btn").addEventListener("click", resetAll);

  updateSummary();
});
