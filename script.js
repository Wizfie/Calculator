"use strict";

// ===== STATE =====
const state = {
  expression: "", // raw expression string
  result: "",
  justEvaluated: false,
  history: [],
  openParens: 0,
};

// ===== DOM =====
const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const themeToggle = document.getElementById("themeToggle");
const historyBtn = document.getElementById("historyBtn");
const backspaceBtn = document.getElementById("backspaceBtn");
const body = document.body;
const calcEl = document.getElementById("calculator");

// ===== THEME TOGGLE =====
themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  body.classList.toggle("light");
});

// ===== HISTORY PANEL TOGGLE =====
const buttonsEl = document.querySelector(".buttons");
historyBtn.addEventListener("click", () => {
  const isOpen = historyPanel.classList.toggle("open");
  buttonsEl.style.display = isOpen ? "none" : "";
  renderHistory();
});

document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  state.history = [];
  renderHistory();
});

// ===== BUTTON CLICK HANDLER =====
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", () => handleInput(btn.dataset.value));
});

backspaceBtn.addEventListener("click", handleBackspace);

// ===== KEYBOARD SUPPORT =====
document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (key >= "0" && key <= "9") handleInput(key);
  else if (key === ".") handleInput(".");
  else if (key === "+") handleInput("+");
  else if (key === "-") handleInput("−");
  else if (key === "*") handleInput("×");
  else if (key === "/") {
    e.preventDefault();
    handleInput("÷");
  } else if (key === "%") handleInput("%");
  else if (key === "Enter" || key === "=") handleInput("=");
  else if (key === "Escape") handleInput("AC");
  else if (key === "Backspace") handleBackspace();
  else if (key === "(") handleInput("(");
  else if (key === ")") handleInput(")");
});

// ===== MAIN INPUT HANDLER =====
function handleInput(value) {
  expressionEl.classList.remove("error");

  switch (value) {
    case "AC":
      clearAll();
      break;
    case "=":
      evaluate();
      break;
    case "+/-":
      toggleSign();
      break;
    case "%":
      applyPercent();
      break;
    case "()":
      insertParenthesis();
      break;
    case "÷":
    case "×":
    case "−":
    case "+":
      insertOperator(value);
      break;
    case ".":
      insertDecimal();
      break;
    default:
      insertDigit(value);
  }

  renderDisplay();
}

// ===== CLEAR =====
function clearAll() {
  state.expression = "";
  state.result = "";
  state.justEvaluated = false;
  state.openParens = 0;
}

// ===== INSERT DIGIT =====
function insertDigit(digit) {
  // Validate: only digits allowed
  if (!/^[0-9]$/.test(digit)) return;

  if (state.justEvaluated) {
    // Start fresh after evaluation
    state.expression = digit;
    state.result = "";
    state.justEvaluated = false;
    return;
  }

  // Prevent leading multiple zeros (e.g., "00")
  if (state.expression === "0" && digit === "0") return;
  if (
    state.expression === "0" &&
    digit !== "0" &&
    !endsWithOperatorOrParen(state.expression)
  ) {
    state.expression = digit;
    return;
  }

  state.expression += digit;
  computePreview();
}

// ===== INSERT DECIMAL =====
function insertDecimal() {
  if (state.justEvaluated) {
    state.expression = "0.";
    state.result = "";
    state.justEvaluated = false;
    return;
  }

  if (state.expression === "") {
    state.expression = "0.";
    return;
  }

  // Get the current number segment
  const segments = state.expression.split(/[+\−×÷()]/);
  const lastSegment = segments[segments.length - 1];

  if (lastSegment.includes(".")) return; // already has decimal
  if (lastSegment === "" || endsWithOperatorOrParen(state.expression)) {
    state.expression += "0.";
  } else {
    state.expression += ".";
  }
  computePreview();
}

// ===== INSERT OPERATOR =====
function insertOperator(op) {
  if (state.justEvaluated && state.result !== "") {
    // Continue from result
    state.expression = state.result;
    state.result = "";
    state.justEvaluated = false;
  }

  if (state.expression === "" || state.expression === undefined) {
    if (op === "−") state.expression = "−"; // allow negative start
    return;
  }

  // Replace trailing operator if exists (except after open paren)
  if (endsWithOperator(state.expression)) {
    state.expression = state.expression.slice(0, -1) + op;
    return;
  }

  // Don't add operator after open paren (except minus for negative)
  if (state.expression.endsWith("(")) {
    if (op === "−") state.expression += op;
    return;
  }

  state.expression += op;
}

// ===== INSERT PARENTHESIS =====
function insertParenthesis() {
  if (state.justEvaluated) {
    state.expression = state.result;
    state.result = "";
    state.justEvaluated = false;
    state.expression += "×(";
    state.openParens = 1;
    return;
  }

  const expr = state.expression;
  if (expr === "") {
    state.expression = "(";
    state.openParens++;
    return;
  }

  // If ends with digit or close paren and there are open parens → close
  if (state.openParens > 0 && (endsWithDigit(expr) || expr.endsWith(")"))) {
    state.expression += ")";
    state.openParens--;
    computePreview();
  } else {
    // Otherwise open a new one (auto-multiply if after digit)
    if (endsWithDigit(expr) || expr.endsWith(")")) {
      state.expression += "×(";
    } else {
      state.expression += "(";
    }
    state.openParens++;
  }
}

// ===== TOGGLE SIGN =====
function toggleSign() {
  if (state.expression === "" || state.expression === "0") return;

  // Get last number token
  const match = state.expression.match(/([-−]?\d+\.?\d*)$/);
  if (!match) return;

  const num = match[1];
  const pos = state.expression.lastIndexOf(num);
  const before = state.expression.slice(0, pos);
  const negated =
    num.startsWith("−") || num.startsWith("-")
      ? num.replace(/^[−-]/, "")
      : "−" + num;

  state.expression = before + negated;
  computePreview();
}

// ===== APPLY PERCENT =====
function applyPercent() {
  if (state.expression === "") return;

  const match = state.expression.match(/(\d+\.?\d*)$/);
  if (!match) return;

  const num = match[1];
  const pos = state.expression.lastIndexOf(num);
  const before = state.expression.slice(0, pos);
  const percentVal = parseFloat(num) / 100;

  // If there's a preceding number and + or −, compute relative percent
  const prevMatch = before.match(/(\d+\.?\d*)[+−]$/);
  let percentStr;
  if (prevMatch && (before.endsWith("+") || before.endsWith("−"))) {
    const base = parseFloat(prevMatch[1]);
    percentStr = String(base * percentVal);
  } else {
    percentStr = String(percentVal);
  }

  state.expression = before + percentStr;
  computePreview();
}

// ===== BACKSPACE =====
function handleBackspace() {
  if (state.justEvaluated) {
    clearAll();
    renderDisplay();
    return;
  }

  if (state.expression.length === 0) return;

  const last = state.expression[state.expression.length - 1];
  if (last === ")") state.openParens++;
  if (last === "(") state.openParens = Math.max(0, state.openParens - 1);

  state.expression = state.expression.slice(0, -1);
  state.result = "";

  if (state.expression !== "") computePreview();
  else state.result = "";

  renderDisplay();
}

// ===== EVALUATE =====
function evaluate() {
  const raw = state.expression.trim();

  // Validation: must not be empty
  if (raw === "" || raw === undefined) {
    showError("Input tidak boleh kosong");
    return;
  }

  // Validation: must contain at least one digit
  if (!/\d/.test(raw)) {
    showError("Input tidak valid");
    return;
  }

  try {
    const jsExpr = toJsExpression(raw);
    // eslint-disable-next-line no-new-func
    const evalResult = Function('"use strict"; return (' + jsExpr + ")")();

    if (!isFinite(evalResult) || isNaN(evalResult)) {
      showError("Tidak terdefinisi");
      return;
    }

    const formatted = formatNumber(evalResult);
    addToHistory(raw, formatted);

    state.expression = formatted;
    state.result = "";
    state.justEvaluated = true;
    state.openParens = 0;
  } catch {
    showError("Ekspresi tidak valid");
  }
}

// ===== COMPUTE PREVIEW (real-time result) =====
function computePreview() {
  try {
    const jsExpr = toJsExpression(state.expression);
    // eslint-disable-next-line no-new-func
    const val = Function('"use strict"; return (' + jsExpr + ")")();
    if (isFinite(val) && !isNaN(val)) {
      const formatted = formatNumber(val);
      // Only show preview if different from current expression
      if (formatted !== state.expression) {
        state.result = formatted;
        return;
      }
    }
  } catch {
    // Expression incomplete — no preview yet
  }
  state.result = "";
}

// ===== CONVERT TO JS EXPRESSION =====
function toJsExpression(expr) {
  return expr
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/−/g, "-")
    .replace(/,/g, "");
}

// ===== FORMAT NUMBER =====
function formatNumber(num) {
  // Avoid floating point noise
  const rounded = parseFloat(num.toPrecision(12));
  // Format with up to 10 decimal places, remove trailing zeros
  return rounded.toString();
}

// ===== RENDER DISPLAY =====
function renderDisplay() {
  const displayText = state.expression === "" ? "0" : state.expression;

  // Adjust font size for long expressions
  const len = displayText.length;
  if (len > 16) expressionEl.style.fontSize = "1.3rem";
  else if (len > 12) expressionEl.style.fontSize = "1.7rem";
  else if (len > 8) expressionEl.style.fontSize = "2rem";
  else expressionEl.style.fontSize = "";

  expressionEl.textContent = displayText;
  resultEl.textContent = state.result;
}

// ===== SHOW ERROR =====
function showError(msg) {
  expressionEl.classList.add("error");
  expressionEl.textContent = msg;
  resultEl.textContent = "";
  state.expression = "";
  state.result = "";
  state.justEvaluated = false;
  state.openParens = 0;
}

// ===== HISTORY =====
function addToHistory(expr, result) {
  state.history.unshift({ expr, result });
  if (state.history.length > 3) state.history.pop();
}

function renderHistory() {
  historyList.innerHTML = "";
  if (state.history.length === 0) {
    historyEmpty.style.display = "block";
    return;
  }
  historyEmpty.style.display = "none";

  state.history.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span style="opacity:.65;font-size:.8rem">${escapeHtml(item.expr)}</span><br/><strong>${escapeHtml(item.result)}</strong>`;
    li.title = "Klik untuk pakai hasil ini";
    li.addEventListener("click", () => {
      state.expression = item.result;
      state.result = "";
      state.justEvaluated = true;
      historyPanel.classList.remove("open");
      renderDisplay();
    });
    historyList.appendChild(li);
  });
}

// ===== HELPERS =====
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function endsWithOperator(expr) {
  return /[+−×÷]$/.test(expr);
}

function endsWithOperatorOrParen(expr) {
  return /[+−×÷(]$/.test(expr);
}

function endsWithDigit(expr) {
  return /[\d.]$/.test(expr);
}

// ===== INIT =====
renderDisplay();
