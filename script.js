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
  temp: ["C", "F", "K", "R"],
  length: ["km","hm","dam","m","dm","cm","mm"],
  mass: ["kg","hg","dag","g","dg","cg","mg"]
};

let history = JSON.parse(localStorage.getItem("history")) || [];

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
      ? "Konversi suhu tidak linear karena perbedaan titik nol."
      : "Konversi berbasis satuan SI dengan faktor 10.";
});

populateUnits();

function formatNumber(value) {
  return notationToggle.checked
    ? value.toExponential(4)
    : Number(value.toFixed(6)).toString();
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

function convertSI(v, from, to, list) {
  return v * Math.pow(10, list.indexOf(from) - list.indexOf(to));
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

renderHistory();

form.addEventListener("submit", e => {
  e.preventDefault();
  const val = valueInput.value.trim();

  if (!numberRegex.test(val)) {
    errorMsg.textContent = "Masukkan angka valid";
    return;
  }

  errorMsg.textContent = "";
  const num = parseFloat(val);
  let result;

  if (categorySelect.value === "temp") {
    result = convertTemperature(num, fromUnit.value, toUnit.value);
  } else {
    result = convertSI(
      num,
      fromUnit.value,
      toUnit.value,
      units[categorySelect.value]
    );
  }

  lastResult = result;

  const display = `${num} ${fromUnit.value} = ${formatNumber(result)} ${toUnit.value}`;
  resultDiv.textContent = display;

  history.unshift(display);
  history = history.slice(0, 10);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
});

notationToggle.addEventListener("change", () => {
  if (lastResult !== null) {
    resultDiv.textContent =
      `${valueInput.value} ${fromUnit.value} = ${formatNumber(lastResult)} ${toUnit.value}`;
  }
});

clearHistoryBtn.addEventListener("click", () => {
  history = [];
  localStorage.removeItem("history");
  renderHistory();
});
