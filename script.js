const form = document.getElementById("converterForm");
const valueInput = document.getElementById("valueInput");
const categorySelect = document.getElementById("category");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const resultDiv = document.getElementById("result");
const errorMsg = document.getElementById("error");
const notationToggle = document.getElementById("notationToggle");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");
const dynamicInsight = document.getElementById("dynamicInsight");

const numberRegex = /^-?\d+(\.\d+)?$/;
let lastResult = null;

const units = {
  length: ["km","hm","dam","m","dm","cm","mm"],
  mass: ["kg","hg","dag","g","dg","cg","mg"],
  temp: ["C","F","K","R"]
};

let history = JSON.parse(localStorage.getItem("history")) || [];

/* ===== Helper Display Unit (° untuk suhu) ===== */
function displayUnit(unit, category) {
  if (category !== "temp") return unit;
  if (unit === "K") return "K";
  return `°${unit}`;
}

/* ===== Populate Units ===== */
function populateUnits() {
  const cat = categorySelect.value;
  fromUnit.innerHTML = "";
  toUnit.innerHTML = "";
  units[cat].forEach(u => {
    fromUnit.innerHTML += `<option value="${u}">${u}</option>`;
    toUnit.innerHTML += `<option value="${u}">${u}</option>`;
  });
}

categorySelect.addEventListener("change", () => {
  populateUnits();
  dynamicInsight.textContent =
    categorySelect.value === "temp"
      ? "Suhu tidak linear karena titik nol berbeda."
      : "Tangga satuan SI: turun dikali 10, naik dibagi 10.";
});

populateUnits();

/* ===== Format Number ===== */
function formatScientific(value) {
  if (value === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const man = value / Math.pow(10, exp);
  return `${man.toFixed(3)} × 10^${exp}`;
}

function formatNumber(value) {
  return notationToggle.checked
    ? formatScientific(value)
    : Number(value.toFixed(6)).toString();
}

/* ===== Conversion ===== */
function convertSI(value, from, to, list) {
  return value * Math.pow(10, list.indexOf(to) - list.indexOf(from));
}

function convertTemperature(v, from, to) {
  let c;
  if (from === "C") c = v;
  if (from === "F") c = (v - 32) * 5/9;
  if (from === "K") c = v - 273.15;
  if (from === "R") c = v * 5/4;

  if (to === "C") return c;
  if (to === "F") return c * 9/5 + 32;
  if (to === "K") return c + 273.15;
  if (to === "R") return c * 4/5;
}

/* ===== History ===== */
function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}
renderHistory();

/* ===== Submit ===== */
form.addEventListener("submit", e => {
  e.preventDefault();
  const raw = valueInput.value.trim();

  if (!numberRegex.test(raw)) {
    errorMsg.textContent = "Masukkan angka valid";
    return;
  }
  errorMsg.textContent = "";

  const num = parseFloat(raw);
  let result;

  if (categorySelect.value === "temp") {
    result = convertTemperature(num, fromUnit.value, toUnit.value);
  } else {
    result = convertSI(num, fromUnit.value, toUnit.value, units[categorySelect.value]);
  }

  lastResult = result;

  const output =
    `${num} ${displayUnit(fromUnit.value, categorySelect.value)} = ${formatNumber(result)} ${displayUnit(toUnit.value, categorySelect.value)}`;

  resultDiv.textContent = output;

  history.unshift(output);
  history = history.slice(0, 10);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
});

/* ===== Toggle Notation ===== */
notationToggle.addEventListener("change", () => {
  if (lastResult !== null) {
    resultDiv.textContent =
      `${valueInput.value} ${displayUnit(fromUnit.value, categorySelect.value)} = ${formatNumber(lastResult)} ${displayUnit(toUnit.value, categorySelect.value)}`;
  }
});

/* ===== Clear History ===== */
clearHistoryBtn.addEventListener("click", () => {
  history = [];
  localStorage.removeItem("history");
  renderHistory();
});
