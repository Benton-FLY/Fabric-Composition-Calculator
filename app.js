const STORAGE_KEY = "fabricCompositionCalculator";
const STORAGE_VERSION = 1;

const MATERIALS = [
  "POLYESTER (COATED)",
  "POLYESTER (UNCOATED)",
  "POLYURETHANE",
  "NYLON",
  "KEVLAR",
  "SPANDEX",
  "LEATHER",
];

const COMPOSITION_DB = {
  "NYLON90%+SPANDEX10%": {
    "NYLON": 90,
    "SPANDEX": 10,
  },
  "POLYESTER100% (COATED)": {
    "POLYESTER (COATED)": 100,
  },
  "POLYESTER92%+POLYURETHANE8%": {
    "POLYESTER (COATED)": 92,
    "POLYURETHANE": 8,
  },
  "GENUINELEATHER100%": {
    "LEATHER": 100,
  },
  "POLYESTER85%+POLYURETHANE15%": {
    "POLYESTER (COATED)": 85,
    "POLYURETHANE": 15,
  },
  "POLYESTER88%+SPANDEX12%": {
    "POLYESTER (COATED)": 88,
    "SPANDEX": 12,
  },
  "POLYESTER85%+SPANDEX15%": {
    "POLYESTER (COATED)": 85,
    "SPANDEX": 15,
  },
  "POLYESTER90%+SPANDEX10%": {
    "POLYESTER (COATED)": 90,
    "SPANDEX": 10,
  },
  "POLYESTER92%+SPANDEX8%": {
    "POLYESTER (COATED)": 92,
    "SPANDEX": 8,
  },
  "POLYESTER82%+SPANDEX18%": {
    "POLYESTER (COATED)": 82,
    "SPANDEX": 18,
  },
  "NYLON78%+KEVLAR14%+SPANDEX8%": {
    "NYLON": 78,
    "KEVLAR": 14,
    "SPANDEX": 8,
  },
  "POLYESTER100%": {
    "POLYESTER (UNCOATED)": 100,
  },
  "NYLON100%": {
    "NYLON": 100,
  },
};

const FABRIC_DB = [
  ["600 POLY (78T) -600MM CHINA WR C0 (WRC0)", "POLYESTER100% (COATED)"],
  ["600 POLY - CHINA C0 (74T) (WRC0)", "POLYESTER100% (COATED)"],
  ["900 POLY (72T) - 600mm (WRC0)", "POLYESTER100% (COATED)"],
  ["ES#PSDW02-RIP-290 C0 WR (POLY)", "POLYESTER92%+POLYURETHANE8%"],
  ["ES#PSW-05 C0 WR (POLY)", "POLYESTER92%+POLYURETHANE8%"],
  ["ES#PSDW-05 (POLY) (WRC0)", "POLYESTER92%+POLYURETHANE8%"],
  ["ELECTRIC MESH (FLY RACING) #2 (POLY) (JX)", "POLYESTER100%"],
  ["ONE MESH POLY", "POLYESTER85%+POLYURETHANE15%"],
  ["ONE MESH POLY #BT-102", "POLYESTER90%+SPANDEX10%"],
  ["3:1 MESH (POLY)", "POLYESTER100%"],
  ["1.4M/M BUFFALO DRUM DYED LEATHER (A:80%/B:20%)", "GENUINELEATHER100%"],
  ["CREORA 6OZ POLY (CN) (SHINY) <HIGH-STRETCH>", "POLYESTER82%+SPANDEX18%"],
  ["#7172 STRETCH KEVLAR (WRC0)", "NYLON78%+KEVLAR14%+SPANDEX8%"],
  ["ES#N FD 160D (PU 1TIME)", "NYLON100%"],
  ["FOX SMITH (POLY)", "POLYESTER100%"],
  ["POLY TASLAN PA COATED (WRC0) (CN)", "POLYESTER100%"],
  ["JX-300 (POLY)", "POLYESTER100%"],
  ["JX-306 (POLY)", "POLYESTER100%"],
  ["JX-19 (POLY)", "POLYESTER100%"],
  ["JX-13 (POLY)", "POLYESTER100%"],
  ["JX-185 (POLY)", "POLYESTER100%"],
  ["JX-44 (POLY)", "POLYESTER88%+SPANDEX12%"],
  ["JX-42 (POLY)", "POLYESTER100%"],
  ["JX-12 (130G) (POLY)", "POLYESTER100%"],
  ["#TY-016SP (85%POLY+15%SPAN, WEFT KNIT) HK24-00401-001 (GSM)", "POLYESTER85%+SPANDEX15%"],
  ["#YK-L002 (90%POLY+10%SPANDEX, WEFT KNIT) HK24-00402-001 (GSM)", "POLYESTER90%+SPANDEX10%"],
].map(([fabricName, composition], index) => ({
  id: String(index + 1),
  no: index + 1,
  fabricName,
  composition,
}));

const SAMPLE_STYLE = {
  name: "28 EVO PANT",
  yyByFabricId: {
    "9": 0.509,
    "6": 1.017,
    "1": 0.107,
    "3": 0.247,
    "13": 0.401,
    "12": 0.048,
    "14": 0.052,
    "16": 0.088,
    "15": 0.742,
  },
};

let appState = loadStore();
let currentYyByFabricId = {};
let lastExtractedStyles = [];

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  bindEvents();
  renderFabricTable();
  renderSavedStyles();
  loadStyle(SAMPLE_STYLE.name);
});

function bindElements() {
  Object.assign(els, {
    styleNameInput: document.getElementById("styleNameInput"),
    newStyleBtn: document.getElementById("newStyleBtn"),
    saveStyleBtn: document.getElementById("saveStyleBtn"),
    savedStyleList: document.getElementById("savedStyleList"),
    savedCount: document.getElementById("savedCount"),
    extractSelectedBtn: document.getElementById("extractSelectedBtn"),
    deleteSelectedBtn: document.getElementById("deleteSelectedBtn"),
    fabricSearchInput: document.getElementById("fabricSearchInput"),
    clearYyBtn: document.getElementById("clearYyBtn"),
    extractCurrentBtn: document.getElementById("extractCurrentBtn"),
    fabricTableBody: document.getElementById("fabricTableBody"),
    currentStyleLabel: document.getElementById("currentStyleLabel"),
    totalYyLabel: document.getElementById("totalYyLabel"),
    summaryTableBody: document.getElementById("summaryTableBody"),
    resultArea: document.getElementById("resultArea"),
    printBtn: document.getElementById("printBtn"),
    downloadCsvBtn: document.getElementById("downloadCsvBtn"),
    downloadXlsxBtn: document.getElementById("downloadXlsxBtn"),
    exportJsonBtn: document.getElementById("exportJsonBtn"),
    importJsonInput: document.getElementById("importJsonInput"),
    resetAllBtn: document.getElementById("resetAllBtn"),
  });
}

function bindEvents() {
  els.newStyleBtn.addEventListener("click", newStyle);
  els.saveStyleBtn.addEventListener("click", saveCurrentStyle);
  els.fabricSearchInput.addEventListener("input", renderFabricTable);
  els.clearYyBtn.addEventListener("click", clearYy);
  els.extractCurrentBtn.addEventListener("click", extractCurrentStyle);
  els.extractSelectedBtn.addEventListener("click", extractSelectedStyles);
  els.deleteSelectedBtn.addEventListener("click", deleteSelectedStyles);
  els.exportJsonBtn.addEventListener("click", exportJson);
  els.importJsonInput.addEventListener("change", importJson);
  els.resetAllBtn.addEventListener("click", resetAllData);
  els.printBtn.addEventListener("click", () => window.print());
  els.downloadCsvBtn.addEventListener("click", downloadCsv);
  els.downloadXlsxBtn.addEventListener("click", downloadXlsx);
  els.styleNameInput.addEventListener("input", updateSummary);
}

function loadStore() {
  const fallback = createInitialStore();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveStore(fallback);
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.styles)) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function createInitialStore() {
  return {
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    styles: [cloneStyle(SAMPLE_STYLE)],
  };
}

function saveStore(store = appState) {
  store.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function cloneStyle(style) {
  return {
    name: style.name,
    yyByFabricId: { ...style.yyByFabricId },
  };
}

function normalizeStyleName(name) {
  return String(name || "").trim();
}

function parseYy(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function calculateStyle(style) {
  const rows = FABRIC_DB.map((fabric) => {
    const yy = parseYy(style.yyByFabricId[fabric.id]);
    return {
      ...fabric,
      yy,
      ratio: 0,
      materialValues: emptyMaterialMap(),
    };
  });

  const usedRows = rows.filter((row) => row.yy > 0);
  const totalYy = usedRows.reduce((sum, row) => sum + row.yy, 0);
  const totals = emptyMaterialMap();

  if (totalYy > 0) {
    usedRows.forEach((row) => {
      const composition = COMPOSITION_DB[row.composition] || {};
      row.ratio = row.yy / totalYy;
      MATERIALS.forEach((material) => {
        const value = row.ratio * ((composition[material] || 0) / 100);
        row.materialValues[material] = value;
        totals[material] += value;
      });
    });
  }

  return {
    styleName: style.name,
    totalYy,
    rows,
    usedRows,
    totals,
    grandTotal: MATERIALS.reduce((sum, material) => sum + totals[material], 0),
  };
}

function emptyMaterialMap() {
  return MATERIALS.reduce((map, material) => {
    map[material] = 0;
    return map;
  }, {});
}

function renderFabricTable() {
  const query = els.fabricSearchInput.value.trim().toLowerCase();

  els.fabricTableBody.innerHTML = "";

  FABRIC_DB.filter((fabric) => {
    if (!query) return true;
    return `${fabric.fabricName} ${fabric.composition}`.toLowerCase().includes(query);
  }).forEach((fabric) => {
    const tr = document.createElement("tr");
    tr.dataset.fabricId = fabric.id;

    tr.innerHTML = `
      <td>${fabric.no}</td>
      <td>${escapeHtml(fabric.fabricName)}</td>
      <td>${escapeHtml(fabric.composition)}</td>
      <td class="number-cell"></td>
      <td class="number-cell calc-ratio">0.000%</td>
      ${MATERIALS.map((material) => `<td class="number-cell calc-material" data-material="${escapeAttribute(material)}">0.000%</td>`).join("")}
    `;

    const input = document.createElement("input");
    input.className = "yy-input";
    input.type = "number";
    input.min = "0";
    input.step = "0.001";
    input.inputMode = "decimal";
    input.value = currentYyByFabricId[fabric.id] || "";
    input.dataset.fabricId = fabric.id;
    input.addEventListener("input", handleYyInput);
    tr.children[3].append(input);

    els.fabricTableBody.append(tr);
  });

  refreshFabricCalculations();
}

function handleYyInput(event) {
  const fabricId = event.target.dataset.fabricId;
  const yy = parseYy(event.target.value);
  if (yy > 0) {
    currentYyByFabricId[fabricId] = yy;
  } else {
    delete currentYyByFabricId[fabricId];
  }
  refreshFabricCalculations();
}

function refreshFabricCalculations() {
  const calculation = getCurrentCalculation();
  const rowById = new Map(calculation.rows.map((row) => [row.id, row]));

  Array.from(els.fabricTableBody.querySelectorAll("tr[data-fabric-id]")).forEach((tr) => {
    const calcRow = rowById.get(tr.dataset.fabricId);
    tr.classList.toggle("used-row", calcRow.yy > 0);
    tr.querySelector(".calc-ratio").textContent = formatPercent(calcRow.ratio, 3);
    tr.querySelectorAll(".calc-material").forEach((cell) => {
      cell.textContent = formatPercent(calcRow.materialValues[cell.dataset.material], 3);
    });
  });

  updateSummary(calculation);
}

function getCurrentStyle() {
  return {
    name: normalizeStyleName(els.styleNameInput.value),
    yyByFabricId: { ...currentYyByFabricId },
  };
}

function getCurrentCalculation() {
  return calculateStyle(getCurrentStyle());
}

function updateSummary(existingCalculation) {
  const calculation = existingCalculation && existingCalculation.totals
    ? existingCalculation
    : getCurrentCalculation();

  els.currentStyleLabel.textContent = calculation.styleName || "-";
  els.totalYyLabel.textContent = formatNumber(calculation.totalYy, 3);
  els.summaryTableBody.innerHTML = "";

  MATERIALS.forEach((material) => {
    els.summaryTableBody.append(createSummaryRow(material, formatPercent(calculation.totals[material], 2)));
  });
  els.summaryTableBody.append(createSummaryRow("Total", formatPercent(calculation.grandTotal, 2), true));
}

function createSummaryRow(label, value, isTotal = false) {
  const tr = document.createElement("tr");
  if (isTotal) tr.classList.add("total-row");
  tr.innerHTML = `<td>${escapeHtml(label)}</td><td>${value}</td>`;
  return tr;
}

function renderSavedStyles() {
  els.savedStyleList.innerHTML = "";
  els.savedCount.textContent = appState.styles.length;
  const currentName = normalizeStyleName(els.styleNameInput.value).toLowerCase();

  if (appState.styles.length === 0) {
    els.savedStyleList.innerHTML = `<p class="empty-state">저장된 스타일이 없습니다.</p>`;
    return;
  }

  appState.styles
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((style) => {
      const item = document.createElement("div");
      item.className = "saved-item";
      if (style.name.toLowerCase() === currentName) item.classList.add("active");
      item.innerHTML = `
        <input type="checkbox" class="style-check" value="${escapeAttribute(style.name)}" aria-label="${escapeAttribute(style.name)} 선택">
        <span class="saved-name" title="${escapeAttribute(style.name)}">${escapeHtml(style.name)}</span>
        <button type="button" class="mini-button danger">삭제</button>
      `;
      item.querySelector(".saved-name").addEventListener("click", () => loadStyle(style.name));
      item.querySelector("button").addEventListener("click", () => deleteStyle(style.name));
      els.savedStyleList.append(item);
    });
}

function loadStyle(name) {
  const style = appState.styles.find((item) => item.name === name);
  if (!style) return;
  els.styleNameInput.value = style.name;
  currentYyByFabricId = { ...style.yyByFabricId };
  renderFabricTable();
  renderSavedStyles();
}

function newStyle() {
  els.styleNameInput.value = "";
  currentYyByFabricId = {};
  els.fabricSearchInput.value = "";
  renderFabricTable();
  renderSavedStyles();
  els.styleNameInput.focus();
}

function saveCurrentStyle() {
  const style = getCurrentStyle();
  if (!style.name) {
    alert("Style Name을 입력하세요.");
    els.styleNameInput.focus();
    return;
  }

  const existingIndex = appState.styles.findIndex((item) => item.name.toLowerCase() === style.name.toLowerCase());
  if (existingIndex >= 0) {
    const existingName = appState.styles[existingIndex].name;
    if (!confirm(`'${existingName}' 스타일을 업데이트할까요?`)) return;
    style.name = existingName;
    els.styleNameInput.value = existingName;
    appState.styles[existingIndex] = cloneStyle(style);
  } else {
    appState.styles.push(cloneStyle(style));
  }

  saveStore();
  renderSavedStyles();
  alert("저장되었습니다.");
}

function clearYy() {
  if (!confirm("현재 화면의 YY 입력값을 모두 지울까요? 저장된 데이터는 저장 버튼을 누르기 전까지 변경되지 않습니다.")) {
    return;
  }
  currentYyByFabricId = {};
  renderFabricTable();
}

function deleteStyle(name) {
  if (!confirm(`'${name}' 스타일을 삭제할까요?`)) return;
  appState.styles = appState.styles.filter((style) => style.name !== name);
  saveStore();
  if (normalizeStyleName(els.styleNameInput.value) === name) {
    newStyle();
  } else {
    renderSavedStyles();
  }
}

function getSelectedStyleNames() {
  return Array.from(document.querySelectorAll(".style-check:checked")).map((input) => input.value);
}

function deleteSelectedStyles() {
  const selected = getSelectedStyleNames();
  if (selected.length === 0) {
    alert("삭제할 스타일을 선택하세요.");
    return;
  }
  if (!confirm(`선택한 ${selected.length}개 스타일을 삭제할까요?`)) return;
  const selectedSet = new Set(selected);
  appState.styles = appState.styles.filter((style) => !selectedSet.has(style.name));
  saveStore();
  if (selectedSet.has(normalizeStyleName(els.styleNameInput.value))) {
    newStyle();
  } else {
    renderSavedStyles();
  }
}

function extractCurrentStyle() {
  const style = getCurrentStyle();
  if (!style.name) {
    alert("Style Name을 입력하세요.");
    return;
  }
  renderResults([style]);
}

function extractSelectedStyles() {
  const selected = getSelectedStyleNames();
  if (selected.length === 0) {
    alert("추출할 스타일을 선택하세요.");
    return;
  }
  const selectedSet = new Set(selected);
  const styles = appState.styles.filter((style) => selectedSet.has(style.name)).map(cloneStyle);
  renderResults(styles);
}

function renderResults(styles) {
  lastExtractedStyles = styles.map(cloneStyle);
  els.resultArea.innerHTML = "";

  styles.forEach((style) => {
    const calculation = calculateStyle(style);
    const section = document.createElement("section");
    section.className = "result-section";
    section.innerHTML = `
      <h3>STYLE / ${escapeHtml(style.name)}</h3>
      <div class="result-grid">
        <div class="result-table-wrap">
          <table class="result-table">
            <thead>
              <tr>
                <th>Fabric Name</th>
                <th>Composition</th>
                <th>YY</th>
                <th>Ratio</th>
                ${MATERIALS.map((material) => `<th>${escapeHtml(material)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${calculation.usedRows.map((row) => `
                <tr class="used-row">
                  <td>${escapeHtml(row.fabricName)}</td>
                  <td>${escapeHtml(row.composition)}</td>
                  <td class="number-cell">${formatNumber(row.yy, 3)}</td>
                  <td class="number-cell">${formatPercent(row.ratio, 3)}</td>
                  ${MATERIALS.map((material) => `<td class="number-cell">${formatPercent(row.materialValues[material], 3)}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <table class="summary-table">
          <tbody>
            <tr><td>Total YY</td><td>${formatNumber(calculation.totalYy, 3)}</td></tr>
            ${MATERIALS.map((material) => `<tr><td>${escapeHtml(material)}</td><td>${formatPercent(calculation.totals[material], 2)}</td></tr>`).join("")}
            <tr class="total-row"><td>Total</td><td>${formatPercent(calculation.grandTotal, 2)}</td></tr>
          </tbody>
        </table>
      </div>
    `;
    els.resultArea.append(section);
  });
}

function exportJson() {
  const blob = new Blob([JSON.stringify(appState, null, 2)], { type: "application/json" });
  downloadBlob(blob, `fabric-composition-backup-${dateStamp()}.json`);
}

function importJson(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      validateImportedStore(parsed);
      if (!confirm("JSON 백업 내용으로 현재 저장 데이터를 교체할까요?")) return;
      appState = {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        styles: parsed.styles.map((style) => ({
          name: normalizeStyleName(style.name),
          yyByFabricId: sanitizeYyMap(style.yyByFabricId),
        })),
      };
      saveStore();
      renderSavedStyles();
      if (appState.styles[0]) {
        loadStyle(appState.styles[0].name);
      } else {
        newStyle();
      }
      alert("복원되었습니다.");
    } catch (error) {
      alert(`JSON 복원 실패: ${error.message}`);
    }
  };
  reader.readAsText(file);
}

function validateImportedStore(data) {
  if (!data || !Array.isArray(data.styles)) {
    throw new Error("styles 배열이 없습니다.");
  }
  data.styles.forEach((style) => {
    if (!normalizeStyleName(style.name)) {
      throw new Error("Style Name이 비어 있는 데이터가 있습니다.");
    }
    if (!style.yyByFabricId || typeof style.yyByFabricId !== "object") {
      throw new Error(`${style.name}의 YY 데이터가 올바르지 않습니다.`);
    }
  });
}

function sanitizeYyMap(map) {
  const clean = {};
  Object.entries(map || {}).forEach(([fabricId, value]) => {
    const yy = parseYy(value);
    if (yy > 0 && FABRIC_DB.some((fabric) => fabric.id === fabricId)) {
      clean[fabricId] = yy;
    }
  });
  return clean;
}

function resetAllData() {
  if (!confirm("전체 저장 데이터를 초기화할까요? 이 작업은 되돌릴 수 없습니다. 필요한 경우 먼저 JSON 백업을 다운로드하세요.")) {
    return;
  }
  appState = createInitialStore();
  saveStore();
  loadStyle(SAMPLE_STYLE.name);
  renderSavedStyles();
}

function downloadCsv() {
  const styles = getStylesForDownload();
  if (!styles.length) return;
  const rows = [];

  styles.forEach((style) => {
    const calculation = calculateStyle(style);
    rows.push(["STYLE", style.name]);
    rows.push(["Fabric Name", "Composition", "YY", "Ratio", ...MATERIALS]);
    calculation.usedRows.forEach((row) => {
      rows.push([
        row.fabricName,
        row.composition,
        row.yy,
        row.ratio,
        ...MATERIALS.map((material) => row.materialValues[material]),
      ]);
    });
    rows.push([]);
    rows.push(["Summary", "Value"]);
    rows.push(["Total YY", calculation.totalYy]);
    MATERIALS.forEach((material) => rows.push([material, calculation.totals[material]]));
    rows.push(["Total", calculation.grandTotal]);
    rows.push([]);
  });

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  downloadBlob(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), `fabric-composition-${dateStamp()}.csv`);
}

function downloadXlsx() {
  const styles = getStylesForDownload();
  if (!styles.length) return;
  if (!window.XLSX) {
    alert("SheetJS 라이브러리가 로드되지 않았습니다. 인터넷 연결을 확인하거나 CSV 다운로드를 사용하세요.");
    return;
  }

  const workbook = window.XLSX.utils.book_new();
  styles.forEach((style) => {
    const calculation = calculateStyle(style);
    const rows = [
      ["STYLE", style.name],
      [],
      ["Fabric Name", "Composition", "YY", "Ratio", ...MATERIALS],
      ...calculation.usedRows.map((row) => [
        row.fabricName,
        row.composition,
        row.yy,
        row.ratio,
        ...MATERIALS.map((material) => row.materialValues[material]),
      ]),
      [],
      ["Summary", "Value"],
      ["Total YY", calculation.totalYy],
      ...MATERIALS.map((material) => [material, calculation.totals[material]]),
      ["Total", calculation.grandTotal],
    ];
    const sheet = window.XLSX.utils.aoa_to_sheet(rows);
    window.XLSX.utils.book_append_sheet(workbook, sheet, safeSheetName(style.name));
  });

  window.XLSX.writeFile(workbook, `fabric-composition-${dateStamp()}.xlsx`);
}

function getStylesForDownload() {
  if (lastExtractedStyles.length > 0) {
    return lastExtractedStyles;
  }
  alert("먼저 결과를 추출하세요.");
  return [];
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function formatNumber(value, digits = 3) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPercent(value, digits = 2) {
  return `${((Number(value) || 0) * 100).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

function dateStamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function safeSheetName(name) {
  return String(name).replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Style";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
