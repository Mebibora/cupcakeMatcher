// app.js

const baseGroup = document.getElementById("base-group");
const icingGroup = document.getElementById("icing-group");
const toppingGroup = document.getElementById("topping-group");
const summaryText = document.getElementById("summary-text");
const resultsDiv = document.getElementById("results");
const matchBtn = document.getElementById("match-btn");
const resetBtn = document.getElementById("reset-btn");

let sessionID = null;
let selections = { base: null, icing: null, topping: null };

// Utility: call backend
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Step 1: start quiz
async function startQuiz() {
  try {
    const data = await postJSON("/api/quiz/start", {});
    sessionID = data.sessionID;
    renderOptions(baseGroup, data.options, answerBase);
    icingGroup.innerHTML = "";
    toppingGroup.innerHTML = "";
    summaryText.textContent = "None yet — choose options above.";
    resultsDiv.innerHTML = "";
    matchBtn.disabled = true;
  } catch (err) {
    resultsDiv.innerHTML = `<p>Error starting quiz: ${err.message}</p>`;
  }
}

// Render helper
function renderOptions(container, options, handler) {
  container.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => handler(opt);
    container.appendChild(btn);
  });
}

// Step 2: choose base
async function answerBase(base) {
  try {
    selections.base = base;
    const data = await postJSON("/api/quiz/answer", { sessionID, answer: base });
    renderOptions(icingGroup, data.options, answerIcing);
    toppingGroup.innerHTML = "";
    summaryText.textContent = `Base: ${base}`;
    matchBtn.disabled = true;
    resultsDiv.innerHTML = "";
  } catch (err) {
    resultsDiv.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

// Step 3: choose icing
async function answerIcing(icing) {
  try {
    selections.icing = icing;
    const data = await postJSON("/api/quiz/answer", { sessionID, answer: icing });
    renderOptions(toppingGroup, data.options, answerTopping);
    summaryText.textContent = `Base: ${selections.base}, Icing: ${icing}`;
    matchBtn.disabled = true;
    resultsDiv.innerHTML = "";
  } catch (err) {
    resultsDiv.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

// Step 4: choose topping
async function answerTopping(topping) {
  try {
    selections.topping = topping;
    const data = await postJSON("/api/quiz/answer", { sessionID, answer: topping });
    summaryText.textContent = `Base: ${selections.base}, Icing: ${selections.icing}, Topping: ${topping}`;
    matchBtn.disabled = false;

    // Render recommendations when "Find my cupcakes" is clicked
    matchBtn.onclick = () => {
      const recs = data.recommendation.cupcakes;
      resultsDiv.innerHTML = `
        <h3>${data.recommendation.message}</h3>
        <ul>
          ${recs.map(c => `
            <li>
              <strong>${c.cupcake}</strong>
              ${c.retailers.length === 0
                ? `<div><em></em></div>`
                : `<ul>${c.retailers.map(r => `<li>${r.rname} — ${r.location}</li>`).join("")}</ul>`
              }
            </li>
          `).join("")}
        </ul>
      `;
    };
  } catch (err) {
    resultsDiv.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

// Reset quiz
resetBtn.onclick = () => {
  selections = { base: null, icing: null, topping: null };
  icingGroup.innerHTML = "";
  toppingGroup.innerHTML = "";
  summaryText.textContent = "None yet — choose options above.";
  resultsDiv.innerHTML = "";
  matchBtn.disabled = true;
  startQuiz();
};

// Initialize
startQuiz();
