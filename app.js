const STORAGE_KEY = "fabricCompositionCalculator";
const STORAGE_VERSION = 2;
const MIGRATION_BACKUP_KEY = "fabricCompositionBackupBeforeV2Migration";

const DEFAULT_MATERIALS = [
  { id: "polyester_coated", name: "POLYESTER (COATED)", order: 1 },
  { id: "polyester_uncoated", name: "POLYESTER (UNCOATED)", order: 2 },
  { id: "polyurethane", name: "POLYURETHANE", order: 3 },
  { id: "nylon", name: "NYLON", order: 4 },
  { id: "kevlar", name: "KEVLAR", order: 5 },
  { id: "spandex", name: "SPANDEX", order: 6 },
  { id: "leather", name: "LEATHER", order: 7 },
];

const DEFAULT_COMPOSITIONS = [
  { label: "NYLON90%+SPANDEX10%", components: { nylon: 90, spandex: 10 } },
  { label: "POLYESTER100% (COATED)", components: { polyester_coated: 100 } },
  { label: "POLYESTER92%+POLYURETHANE8%", components: { polyester_coated: 92, polyurethane: 8 } },
  { label: "GENUINELEATHER100%", components: { leather: 100 } },
  { label: "POLYESTER85%+POLYURETHANE15%", components: { polyester_coated: 85, polyurethane: 15 } },
  { label: "POLYESTER88%+SPANDEX12%", components: { polyester_coated: 88, spandex: 12 } },
  { label: "POLYESTER85%+SPANDEX15%", components: { polyester_coated: 85, spandex: 15 } },
  { label: "POLYESTER90%+SPANDEX10%", components: { polyester_coated: 90, spandex: 10 } },
  { label: "POLYESTER92%+SPANDEX8%", components: { polyester_coated: 92, spandex: 8 } },
  { label: "POLYESTER82%+SPANDEX18%", components: { polyester_coated: 82, spandex: 18 } },
  { label: "NYLON78%+KEVLAR14%+SPANDEX8%", components: { nylon: 78, kevlar: 14, spandex: 8 } },
  { label: "POLYESTER100%", components: { polyester_uncoated: 100 } },
  { label: "NYLON100%", components: { nylon: 100 } },
].map((item) => ({ id: slugify(item.label), ...item }));

const DEFAULT_FABRICS_SOURCE = [
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
];

const SAMPLE_STYLE = {
  name: "28 EVO PANT",
  yyByFabricId: {
    fabric_009: 0.509,
    fabric_006: 1.017,
    fabric_001: 0.107,
    fabric_003: 0.247,
    fabric_013: 0.401,
    fabric_012: 0.048,
    fabric_014: 0.052,
    fabric_016: 0.088,
    fabric_015: 0.742,
  },
};

let appState;
appState = loadStore();
let currentYyByFabricId = {};
let lastExtractedStyles = [];
let dbEditMode = false;
let dbEditSnapshot = null;
const els = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  bindEvents();
  renderAll();
  loadStyle(SAMPLE_STYLE.name);
});

function bindElements() {
  [
    "messageArea", "styleNameInput", "newStyleBtn", "saveStyleBtn", "savedStyleList", "savedCount",
    "extractSelectedBtn", "deleteSelectedBtn", "downloadSelectedCsvBtn", "downloadSelectedXlsxBtn",
    "fabricSearchInput", "clearYyBtn", "extractCurrentBtn", "fabricTableHead", "fabricTableBody",
    "currentStyleLabel", "totalYyLabel", "summaryTableBody", "resultArea", "printBtn",
    "downloadCsvBtn", "downloadXlsxBtn", "exportJsonBtn", "importJsonInput", "restoreSampleBtn",
    "resetAllBtn", "unmappedList", "dbEditBtn", "dbSaveLockBtn", "dbCancelBtn", "dbBackupBtn", "dbWarning",
    "validationArea", "materialSearchInput", "addMaterialBtn", "materialTableBody",
    "compositionSearchInput", "addCompositionBtn", "compositionList", "fabricDbSearchInput",
    "fabricSortSelect", "addFabricBtn", "fabricDbTableBody",
  ].forEach((id) => { els[id] = document.getElementById(id); });
}

function bindEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });
  document.querySelectorAll(".sub-tab").forEach((button) => {
    button.addEventListener("click", () => activateDbTab(button.dataset.dbTab));
  });
  els.newStyleBtn.addEventListener("click", newStyle);
  els.saveStyleBtn.addEventListener("click", saveCurrentStyle);
  els.fabricSearchInput.addEventListener("input", renderFabricTable);
  els.clearYyBtn.addEventListener("click", clearYy);
  els.extractCurrentBtn.addEventListener("click", extractCurrentStyle);
  els.extractSelectedBtn.addEventListener("click", extractSelectedStyles);
  els.deleteSelectedBtn.addEventListener("click", deleteSelectedStyles);
  els.downloadSelectedCsvBtn.addEventListener("click", () => downloadCsv(getSelectedStylesForAction()));
  els.downloadSelectedXlsxBtn.addEventListener("click", () => downloadXlsx(getSelectedStylesForAction()));
  els.exportJsonBtn.addEventListener("click", exportJson);
  els.dbBackupBtn.addEventListener("click", exportJson);
  els.importJsonInput.addEventListener("change", importJson);
  els.restoreSampleBtn.addEventListener("click", restoreSampleData);
  els.resetAllBtn.addEventListener("click", resetAllData);
  els.printBtn.addEventListener("click", () => window.print());
  els.downloadCsvBtn.addEventListener("click", () => downloadCsv());
  els.downloadXlsxBtn.addEventListener("click", () => downloadXlsx());
  els.styleNameInput.addEventListener("input", updateSummary);
  els.dbEditBtn.addEventListener("click", enterDbEditMode);
  els.dbSaveLockBtn.addEventListener("click", saveDbAndLock);
  els.dbCancelBtn.addEventListener("click", cancelDbEdits);
  els.addMaterialBtn.addEventListener("click", addMaterial);
  els.addCompositionBtn.addEventListener("click", addComposition);
  els.addFabricBtn.addEventListener("click", addFabric);
  els.materialSearchInput.addEventListener("input", renderMaterialDb);
  els.compositionSearchInput.addEventListener("input", renderCompositionDb);
  els.fabricDbSearchInput.addEventListener("input", renderFabricDb);
  els.fabricSortSelect.addEventListener("change", renderFabricDb);
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
    if (!parsed || parsed.version !== STORAGE_VERSION) {
      localStorage.setItem(MIGRATION_BACKUP_KEY, raw);
      const migrated = migrateToV2(parsed);
      saveStore(migrated);
      return migrated;
    }
    normalizeV2Store(parsed);
    return parsed;
  } catch {
    return fallback;
  }
}

function createInitialStore() {
  return {
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    materials: clone(DEFAULT_MATERIALS),
    compositions: clone(DEFAULT_COMPOSITIONS),
    fabrics: createDefaultFabrics(),
    styles: { [SAMPLE_STYLE.name]: cloneStyle(SAMPLE_STYLE) },
    unmappedFabrics: [],
  };
}

function createDefaultFabrics() {
  const compositionIdByLabel = new Map(DEFAULT_COMPOSITIONS.map((item) => [item.label, item.id]));
  return DEFAULT_FABRICS_SOURCE.map(([name, label], index) => ({
    id: defaultFabricId(index),
    name,
    compositionId: compositionIdByLabel.get(label),
    order: index + 1,
  }));
}

function migrateToV2(oldData) {
  const store = createInitialStore();
  const defaultFabrics = createDefaultFabrics();
  const oldIdMap = new Map(defaultFabrics.map((fabric, index) => [String(index + 1), fabric.id]));
  const nameMap = new Map(defaultFabrics.map((fabric) => [fabric.name.toLowerCase(), fabric.id]));
  const oldStyles = Array.isArray(oldData?.styles) ? oldData.styles : [];
  store.styles = {};
  store.unmappedFabrics = [];

  oldStyles.forEach((style) => {
    const name = normalizeStyleName(style.name);
    if (!name) return;
    const yyByFabricId = {};
    Object.entries(style.yyByFabricId || {}).forEach(([key, value]) => {
      const yy = parseYy(value);
      if (yy <= 0) return;
      const mappedId = oldIdMap.get(String(key)) || nameMap.get(String(key).toLowerCase());
      if (mappedId) {
        yyByFabricId[mappedId] = yy;
      } else {
        store.unmappedFabrics.push({ style: name, fabric: key, yy });
      }
    });
    store.styles[name] = { name, yyByFabricId };
  });

  if (Object.keys(store.styles).length === 0) {
    store.styles[SAMPLE_STYLE.name] = cloneStyle(SAMPLE_STYLE);
  }
  return store;
}

function normalizeV2Store(store) {
  store.materials = Array.isArray(store.materials) ? store.materials : clone(DEFAULT_MATERIALS);
  store.compositions = Array.isArray(store.compositions) ? store.compositions : clone(DEFAULT_COMPOSITIONS);
  store.fabrics = Array.isArray(store.fabrics) ? store.fabrics : createDefaultFabrics();
  if (Array.isArray(store.styles)) {
    store.styles = Object.fromEntries(store.styles.map((style) => [style.name, cloneStyle(style)]));
  }
  store.styles = store.styles && typeof store.styles === "object" ? store.styles : {};
  store.unmappedFabrics = Array.isArray(store.unmappedFabrics) ? store.unmappedFabrics : [];
}

function saveStore(store = appState) {
  store.version = STORAGE_VERSION;
  store.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function renderAll() {
  renderFabricTable();
  renderSavedStyles();
  renderDbManagement();
  renderUnmappedFabrics();
}

function getMaterials() {
  return appState.materials.slice().sort((a, b) => Number(a.order) - Number(b.order) || a.name.localeCompare(b.name));
}

function getMaterialName(id) {
  return appState.materials.find((item) => item.id === id)?.name || id;
}

function getComposition(id) {
  return appState.compositions.find((item) => item.id === id);
}

function getCompositionLabel(id) {
  return getComposition(id)?.label || "";
}

function normalizeStyleName(name) {
  return String(name || "").trim();
}

function cloneStyle(style) {
  return {
    name: normalizeStyleName(style.name),
    yyByFabricId: sanitizeYyMap(style.yyByFabricId, true),
  };
}

function sanitizeYyMap(map, allowUnknown = false) {
  const currentStore = typeof appState === "undefined" ? null : appState;
  const fabricIds = new Set(currentStore?.fabrics?.map((fabric) => fabric.id) || createDefaultFabrics().map((fabric) => fabric.id));
  const clean = {};
  Object.entries(map || {}).forEach(([fabricId, value]) => {
    const yy = parseYy(value);
    if (yy > 0 && (allowUnknown || fabricIds.has(fabricId))) clean[fabricId] = yy;
  });
  return clean;
}

function parseYy(value) {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function calculateStyle(style) {
  const materials = getMaterials();
  const rows = appState.fabrics
    .slice()
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map((fabric) => ({
      ...fabric,
      fabricName: fabric.name,
      compositionLabel: getCompositionLabel(fabric.compositionId),
      yy: parseYy(style.yyByFabricId?.[fabric.id]),
      ratio: 0,
      materialValues: emptyMaterialMap(),
    }));
  const usedRows = rows.filter((row) => row.yy > 0);
  const totalYy = usedRows.reduce((sum, row) => sum + row.yy, 0);
  const totals = emptyMaterialMap();

  if (totalYy > 0) {
    usedRows.forEach((row) => {
      const composition = getComposition(row.compositionId);
      row.ratio = row.yy / totalYy;
      materials.forEach((material) => {
        const componentRatio = Number(composition?.components?.[material.id] || 0) / 100;
        const value = row.ratio * componentRatio;
        row.materialValues[material.id] = value;
        totals[material.id] += value;
      });
    });
  }

  return {
    styleName: style.name,
    totalYy,
    rows,
    usedRows,
    totals,
    grandTotal: materials.reduce((sum, material) => sum + totals[material.id], 0),
  };
}

function emptyMaterialMap() {
  return getMaterials().reduce((map, material) => {
    map[material.id] = 0;
    return map;
  }, {});
}

function renderFabricTable() {
  const materials = getMaterials();
  const query = els.fabricSearchInput.value.trim().toLowerCase();
  els.fabricTableHead.innerHTML = `
    <tr>
      <th>No</th><th>Fabric Name</th><th>Composition</th><th>YY</th><th>Ratio</th>
      ${materials.map((material) => `<th>${escapeHtml(material.name)}</th>`).join("")}
    </tr>
  `;
  els.fabricTableBody.innerHTML = "";

  appState.fabrics
    .slice()
    .sort((a, b) => Number(a.order) - Number(b.order))
    .filter((fabric) => {
      if (!query) return true;
      return `${fabric.name} ${getCompositionLabel(fabric.compositionId)}`.toLowerCase().includes(query);
    })
    .forEach((fabric, index) => {
      const tr = document.createElement("tr");
      tr.dataset.fabricId = fabric.id;
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHtml(fabric.name)}</td>
        <td>${escapeHtml(getCompositionLabel(fabric.compositionId))}</td>
        <td class="number-cell"></td>
        <td class="number-cell calc-ratio">0.000%</td>
        ${materials.map((material) => `<td class="number-cell calc-material" data-material-id="${escapeAttribute(material.id)}">0.000%</td>`).join("")}
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
  if (yy > 0) currentYyByFabricId[fabricId] = yy;
  else delete currentYyByFabricId[fabricId];
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
      cell.textContent = formatPercent(calcRow.materialValues[cell.dataset.materialId], 3);
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
  const calculation = existingCalculation?.totals ? existingCalculation : getCurrentCalculation();
  els.currentStyleLabel.textContent = calculation.styleName || "-";
  els.totalYyLabel.textContent = formatNumber(calculation.totalYy, 3);
  els.summaryTableBody.innerHTML = "";
  getMaterials().forEach((material) => {
    els.summaryTableBody.append(createSummaryRow(material.name, formatPercent(calculation.totals[material.id], 2)));
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
  const styles = Object.values(appState.styles).sort((a, b) => a.name.localeCompare(b.name));
  const currentName = normalizeStyleName(els.styleNameInput.value).toLowerCase();
  els.savedStyleList.innerHTML = "";
  els.savedCount.textContent = styles.length;
  if (!styles.length) {
    els.savedStyleList.innerHTML = `<p class="empty-state">저장된 스타일이 없습니다.</p>`;
    return;
  }
  styles.forEach((style) => {
    const item = document.createElement("div");
    item.className = "saved-item";
    if (style.name.toLowerCase() === currentName) item.classList.add("active");
    item.innerHTML = `
      <input type="checkbox" class="style-check" value="${escapeAttribute(style.name)}" aria-label="${escapeAttribute(style.name)} 선택">
      <span class="saved-name" title="${escapeAttribute(style.name)}">${escapeHtml(style.name)}</span>
      <button type="button" class="mini-button">불러오기</button>
      <button type="button" class="mini-button danger">삭제</button>
    `;
    item.querySelector(".saved-name").addEventListener("click", () => loadStyle(style.name));
    item.querySelectorAll("button")[0].addEventListener("click", () => loadStyle(style.name));
    item.querySelectorAll("button")[1].addEventListener("click", () => deleteStyle(style.name));
    els.savedStyleList.append(item);
  });
}

function loadStyle(name) {
  const style = appState.styles[name];
  if (!style) return;
  els.styleNameInput.value = style.name;
  currentYyByFabricId = sanitizeYyMap(style.yyByFabricId);
  renderFabricTable();
  renderSavedStyles();
  activateTab("styleInput");
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
  const style = cloneStyle(getCurrentStyle());
  if (!style.name) {
    showMessage("Style Name을 입력하세요.", "error");
    els.styleNameInput.focus();
    return;
  }
  const existingName = Object.keys(appState.styles).find((name) => name.toLowerCase() === style.name.toLowerCase());
  if (existingName && existingName !== style.name) style.name = existingName;
  if (existingName && !confirm(`'${existingName}' 스타일을 업데이트할까요?`)) return;
  appState.styles[style.name] = style;
  saveStore();
  renderSavedStyles();
  showMessage("저장되었습니다.");
}

function clearYy() {
  if (!confirm("현재 화면의 YY 입력값을 모두 지울까요? 저장된 데이터는 저장 버튼을 누르기 전까지 변경되지 않습니다.")) return;
  currentYyByFabricId = {};
  renderFabricTable();
}

function deleteStyle(name) {
  if (!confirm(`'${name}' 스타일을 삭제할까요?`)) return;
  delete appState.styles[name];
  saveStore();
  if (normalizeStyleName(els.styleNameInput.value) === name) newStyle();
  else renderSavedStyles();
}

function getSelectedStyleNames() {
  return Array.from(document.querySelectorAll(".style-check:checked")).map((input) => input.value);
}

function getSelectedStylesForAction() {
  const selected = getSelectedStyleNames();
  if (selected.length === 0) {
    showMessage("스타일을 선택하세요.", "error");
    return [];
  }
  return selected.map((name) => cloneStyle(appState.styles[name])).filter((style) => style.name);
}

function deleteSelectedStyles() {
  const selected = getSelectedStyleNames();
  if (!selected.length) {
    showMessage("삭제할 스타일을 선택하세요.", "error");
    return;
  }
  if (!confirm(`선택한 ${selected.length}개 스타일을 삭제할까요?`)) return;
  selected.forEach((name) => delete appState.styles[name]);
  saveStore();
  if (selected.includes(normalizeStyleName(els.styleNameInput.value))) newStyle();
  else renderSavedStyles();
}

function extractCurrentStyle() {
  const style = cloneStyle(getCurrentStyle());
  if (!style.name) {
    showMessage("Style Name을 입력하세요.", "error");
    return;
  }
  renderResults([style]);
}

function extractSelectedStyles() {
  const styles = getSelectedStylesForAction();
  if (styles.length) renderResults(styles);
}

function renderResults(styles) {
  lastExtractedStyles = styles.map(cloneStyle);
  els.resultArea.innerHTML = "";
  const materials = getMaterials();
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
                <th>Fabric Name</th><th>Composition</th><th>YY</th><th>Ratio</th>
                ${materials.map((material) => `<th>${escapeHtml(material.name)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${calculation.usedRows.map((row) => `
                <tr class="used-row">
                  <td>${escapeHtml(row.fabricName)}</td>
                  <td>${escapeHtml(row.compositionLabel)}</td>
                  <td class="number-cell">${formatNumber(row.yy, 3)}</td>
                  <td class="number-cell">${formatPercent(row.ratio, 3)}</td>
                  ${materials.map((material) => `<td class="number-cell">${formatPercent(row.materialValues[material.id], 3)}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <table class="summary-table">
          <tbody>
            <tr><td>Total YY</td><td>${formatNumber(calculation.totalYy, 3)}</td></tr>
            ${materials.map((material) => `<tr><td>${escapeHtml(material.name)}</td><td>${formatPercent(calculation.totals[material.id], 2)}</td></tr>`).join("")}
            <tr class="total-row"><td>Total</td><td>${formatPercent(calculation.grandTotal, 2)}</td></tr>
          </tbody>
        </table>
      </div>
    `;
    els.resultArea.append(section);
  });
  activateTab("results");
}

function renderDbManagement() {
  renderMaterialDb();
  renderCompositionDb();
  renderFabricDb();
  updateDbModeUi();
}

function enterDbEditMode() {
  dbEditSnapshot = clone(appState);
  dbEditMode = true;
  updateDbModeUi();
  showMessage("DB 수정 모드입니다. 저장 전 validation을 확인하세요.");
}

function saveDbAndLock() {
  const errors = validateDb();
  if (errors.length) {
    showValidation(errors);
    return;
  }
  hideValidation();
  saveStore();
  dbEditMode = false;
  dbEditSnapshot = null;
  renderAll();
  showMessage("DB 저장 후 잠금 상태로 전환되었습니다.");
}

function cancelDbEdits() {
  if (!dbEditSnapshot || !confirm("DB 수정 내용을 취소하고 이전 상태로 되돌릴까요?")) return;
  appState = dbEditSnapshot;
  dbEditSnapshot = null;
  dbEditMode = false;
  renderAll();
  showMessage("DB 변경을 취소했습니다.");
}

function updateDbModeUi() {
  els.dbEditBtn.disabled = dbEditMode;
  els.dbSaveLockBtn.disabled = !dbEditMode;
  els.dbCancelBtn.disabled = !dbEditMode;
  els.dbWarning.classList.toggle("hidden", !dbEditMode);
  document.querySelectorAll(".db-edit-only").forEach((el) => { el.disabled = !dbEditMode; });
  document.querySelectorAll("[data-db-input]").forEach((el) => { el.disabled = !dbEditMode; });
}

function renderMaterialDb() {
  const query = els.materialSearchInput.value.trim().toLowerCase();
  els.materialTableBody.innerHTML = "";
  getMaterials().filter((material) => !query || `${material.name} ${material.id}`.toLowerCase().includes(query)).forEach((material) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input data-db-input data-material-field="order" data-id="${escapeAttribute(material.id)}" type="number" min="1" step="1" value="${Number(material.order) || 1}"></td>
      <td><input data-db-input data-material-field="name" data-id="${escapeAttribute(material.id)}" type="text" value="${escapeAttribute(material.name)}"></td>
      <td class="muted-cell">${escapeHtml(material.id)}</td>
      <td><button type="button" class="mini-button danger db-edit-only" data-delete-material="${escapeAttribute(material.id)}">삭제</button></td>
    `;
    els.materialTableBody.append(tr);
  });
  els.materialTableBody.querySelectorAll("[data-material-field]").forEach((input) => input.addEventListener("input", updateMaterialField));
  els.materialTableBody.querySelectorAll("[data-delete-material]").forEach((button) => button.addEventListener("click", () => deleteMaterial(button.dataset.deleteMaterial)));
  updateDbModeUi();
}

function updateMaterialField(event) {
  const material = appState.materials.find((item) => item.id === event.target.dataset.id);
  if (!material) return;
  if (event.target.dataset.materialField === "order") material.order = Number(event.target.value) || 1;
  if (event.target.dataset.materialField === "name") material.name = event.target.value.trim();
  renderFabricTable();
  renderCompositionDb();
}

function addMaterial() {
  if (!dbEditMode) return;
  const name = prompt("추가할 Material 이름을 입력하세요. 예: COTTON");
  const cleanName = String(name || "").trim().toUpperCase();
  if (!cleanName) return;
  if (appState.materials.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) {
    showMessage("이미 존재하는 Material입니다.", "error");
    return;
  }
  appState.materials.push({ id: uniqueId(slugify(cleanName), appState.materials.map((item) => item.id)), name: cleanName, order: nextOrder(appState.materials) });
  renderAll();
}

function deleteMaterial(id) {
  if (!dbEditMode) return;
  if (appState.compositions.some((composition) => Object.prototype.hasOwnProperty.call(composition.components || {}, id))) {
    showMessage("Composition에서 사용 중인 Material은 삭제할 수 없습니다.", "error");
    return;
  }
  if (!confirm(`'${getMaterialName(id)}' Material을 삭제할까요?`)) return;
  appState.materials = appState.materials.filter((item) => item.id !== id);
  renderAll();
}

function renderCompositionDb() {
  const query = els.compositionSearchInput.value.trim().toLowerCase();
  const materials = getMaterials();
  els.compositionList.innerHTML = "";
  appState.compositions
    .filter((composition) => !query || composition.label.toLowerCase().includes(query))
    .forEach((composition) => {
      const card = document.createElement("section");
      card.className = "composition-card";
      const total = compositionTotal(composition);
      card.innerHTML = `
        <div class="composition-head">
          <input data-db-input data-composition-label="${escapeAttribute(composition.id)}" type="text" value="${escapeAttribute(composition.label)}">
          <span class="${Math.abs(total - 100) < 0.0001 ? "ok-text" : "error-text"}">Total ${formatNumber(total, 2)}</span>
          <button type="button" class="mini-button db-edit-only" data-add-component="${escapeAttribute(composition.id)}">행 추가</button>
          <button type="button" class="mini-button danger db-edit-only" data-delete-composition="${escapeAttribute(composition.id)}">삭제</button>
        </div>
        <table class="data-table compact-table">
          <thead><tr><th>Material</th><th>Ratio</th><th>Action</th></tr></thead>
          <tbody>
            ${Object.entries(composition.components || {}).map(([materialId, ratio]) => `
              <tr>
                <td>
                  <select data-db-input data-component-material="${escapeAttribute(composition.id)}" data-old-material="${escapeAttribute(materialId)}">
                    ${materials.map((material) => `<option value="${escapeAttribute(material.id)}" ${material.id === materialId ? "selected" : ""}>${escapeHtml(material.name)}</option>`).join("")}
                  </select>
                </td>
                <td><input data-db-input data-component-ratio="${escapeAttribute(composition.id)}" data-material-id="${escapeAttribute(materialId)}" type="number" min="0.001" max="100" step="0.001" value="${Number(ratio)}"></td>
                <td><button type="button" class="mini-button danger db-edit-only" data-delete-component="${escapeAttribute(composition.id)}" data-material-id="${escapeAttribute(materialId)}">삭제</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      els.compositionList.append(card);
    });

  els.compositionList.querySelectorAll("[data-composition-label]").forEach((input) => input.addEventListener("input", updateCompositionLabel));
  els.compositionList.querySelectorAll("[data-add-component]").forEach((button) => button.addEventListener("click", () => addComponent(button.dataset.addComponent)));
  els.compositionList.querySelectorAll("[data-delete-composition]").forEach((button) => button.addEventListener("click", () => deleteComposition(button.dataset.deleteComposition)));
  els.compositionList.querySelectorAll("[data-component-material]").forEach((select) => select.addEventListener("change", updateComponentMaterial));
  els.compositionList.querySelectorAll("[data-component-ratio]").forEach((input) => input.addEventListener("change", updateComponentRatio));
  els.compositionList.querySelectorAll("[data-delete-component]").forEach((button) => button.addEventListener("click", () => deleteComponent(button.dataset.deleteComponent, button.dataset.materialId)));
  updateDbModeUi();
}

function updateCompositionLabel(event) {
  const composition = getComposition(event.target.dataset.compositionLabel);
  if (composition) {
    composition.label = event.target.value.trim();
    renderFabricTable();
  }
}

function addComposition() {
  if (!dbEditMode) return;
  const label = prompt("추가할 Composition label을 입력하세요. 예: COTTON60%+POLYESTER40%");
  const cleanLabel = String(label || "").trim().toUpperCase();
  if (!cleanLabel) return;
  if (appState.compositions.some((item) => item.label.toLowerCase() === cleanLabel.toLowerCase())) {
    showMessage("이미 존재하는 Composition label입니다.", "error");
    return;
  }
  const firstMaterial = getMaterials()[0];
  appState.compositions.push({ id: uniqueId(slugify(cleanLabel), appState.compositions.map((item) => item.id)), label: cleanLabel, components: { [firstMaterial.id]: 100 } });
  renderAll();
}

function addComponent(compositionId) {
  const composition = getComposition(compositionId);
  if (!composition) return;
  const used = new Set(Object.keys(composition.components || {}));
  const material = getMaterials().find((item) => !used.has(item.id));
  if (!material) {
    showMessage("추가할 수 있는 미사용 Material이 없습니다.", "error");
    return;
  }
  composition.components[material.id] = 1;
  renderCompositionDb();
}

function updateComponentMaterial(event) {
  const composition = getComposition(event.target.dataset.componentMaterial);
  if (!composition) return;
  const oldId = event.target.dataset.oldMaterial;
  const newId = event.target.value;
  if (oldId === newId) return;
  if (Object.prototype.hasOwnProperty.call(composition.components, newId)) {
    showMessage("같은 Composition 안에서 Material은 중복될 수 없습니다.", "error");
    renderCompositionDb();
    return;
  }
  composition.components[newId] = composition.components[oldId];
  delete composition.components[oldId];
  renderCompositionDb();
}

function updateComponentRatio(event) {
  const composition = getComposition(event.target.dataset.componentRatio);
  if (composition) composition.components[event.target.dataset.materialId] = Number(event.target.value);
  renderCompositionDb();
}

function deleteComponent(compositionId, materialId) {
  const composition = getComposition(compositionId);
  if (!composition || !confirm("이 구성 소재 행을 삭제할까요?")) return;
  delete composition.components[materialId];
  renderCompositionDb();
}

function deleteComposition(id) {
  if (!dbEditMode) return;
  if (appState.fabrics.some((fabric) => fabric.compositionId === id)) {
    showMessage("Fabric에서 사용 중인 Composition은 삭제할 수 없습니다.", "error");
    return;
  }
  if (!confirm(`'${getCompositionLabel(id)}' Composition을 삭제할까요?`)) return;
  appState.compositions = appState.compositions.filter((item) => item.id !== id);
  renderAll();
}

function renderFabricDb() {
  const query = els.fabricDbSearchInput.value.trim().toLowerCase();
  const sort = els.fabricSortSelect.value;
  const rows = appState.fabrics.slice().filter((fabric) => {
    if (!query) return true;
    return `${fabric.name} ${getCompositionLabel(fabric.compositionId)} ${fabric.id}`.toLowerCase().includes(query);
  });
  rows.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "composition") return getCompositionLabel(a.compositionId).localeCompare(getCompositionLabel(b.compositionId));
    return Number(a.order) - Number(b.order);
  });
  els.fabricDbTableBody.innerHTML = rows.map((fabric, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><input data-db-input data-fabric-name="${escapeAttribute(fabric.id)}" type="text" value="${escapeAttribute(fabric.name)}"></td>
      <td>
        <select data-db-input data-fabric-composition="${escapeAttribute(fabric.id)}">
          <option value="">Composition 선택</option>
          ${appState.compositions.map((composition) => `<option value="${escapeAttribute(composition.id)}" ${composition.id === fabric.compositionId ? "selected" : ""}>${escapeHtml(composition.label)}</option>`).join("")}
        </select>
      </td>
      <td class="muted-cell">${escapeHtml(fabric.id)}</td>
      <td><button type="button" class="mini-button danger db-edit-only" data-delete-fabric="${escapeAttribute(fabric.id)}">삭제</button></td>
    </tr>
  `).join("");
  els.fabricDbTableBody.querySelectorAll("[data-fabric-name]").forEach((input) => input.addEventListener("input", updateFabricName));
  els.fabricDbTableBody.querySelectorAll("[data-fabric-composition]").forEach((select) => select.addEventListener("change", updateFabricComposition));
  els.fabricDbTableBody.querySelectorAll("[data-delete-fabric]").forEach((button) => button.addEventListener("click", () => deleteFabric(button.dataset.deleteFabric)));
  updateDbModeUi();
}

function updateFabricName(event) {
  const fabric = appState.fabrics.find((item) => item.id === event.target.dataset.fabricName);
  if (fabric) {
    fabric.name = event.target.value.trim();
    renderFabricTable();
  }
}

function updateFabricComposition(event) {
  const fabric = appState.fabrics.find((item) => item.id === event.target.dataset.fabricComposition);
  if (fabric) {
    fabric.compositionId = event.target.value;
    renderFabricTable();
  }
}

function addFabric() {
  if (!dbEditMode) return;
  const fabric = {
    id: uniqueId("fabric_new", appState.fabrics.map((item) => item.id)),
    name: "NEW FABRIC",
    compositionId: appState.compositions[0]?.id || "",
    order: nextOrder(appState.fabrics),
  };
  appState.fabrics.push(fabric);
  renderAll();
}

function deleteFabric(id) {
  if (!dbEditMode) return;
  if (isFabricUsed(id)) {
    showMessage("스타일에서 YY가 입력된 Fabric은 삭제할 수 없습니다.", "error");
    return;
  }
  if (!confirm(`'${appState.fabrics.find((item) => item.id === id)?.name || id}' Fabric을 삭제할까요?`)) return;
  appState.fabrics = appState.fabrics.filter((item) => item.id !== id);
  renderAll();
}

function validateDb() {
  const errors = [];
  const materialNames = new Set();
  appState.materials.forEach((material) => {
    if (!material.name) errors.push("Material 이름이 비어 있습니다.");
    const key = material.name.toLowerCase();
    if (materialNames.has(key)) errors.push(`Material 이름 중복: ${material.name}`);
    materialNames.add(key);
  });
  const compositionLabels = new Set();
  appState.compositions.forEach((composition) => {
    if (!composition.label) errors.push("Composition label이 비어 있습니다.");
    const key = composition.label.toLowerCase();
    if (compositionLabels.has(key)) errors.push(`Composition label 중복: ${composition.label}`);
    compositionLabels.add(key);
    const componentIds = Object.keys(composition.components || {});
    if (!componentIds.length) errors.push(`${composition.label}: 구성 소재가 없습니다.`);
    const total = compositionTotal(composition);
    if (Math.abs(total - 100) > 0.0001) errors.push(`${composition.label}: 구성비 합계가 100이 아닙니다. 현재 ${formatNumber(total, 3)}`);
    componentIds.forEach((materialId) => {
      const ratio = Number(composition.components[materialId]);
      if (!appState.materials.some((material) => material.id === materialId)) errors.push(`${composition.label}: 존재하지 않는 Material ID ${materialId}`);
      if (!(ratio > 0 && ratio <= 100)) errors.push(`${composition.label}: 비율은 0보다 크고 100 이하이어야 합니다.`);
    });
  });
  const fabricNames = new Set();
  appState.fabrics.forEach((fabric) => {
    if (!fabric.name) errors.push("Fabric Name이 비어 있습니다.");
    const key = fabric.name.toLowerCase();
    if (fabricNames.has(key)) errors.push(`Fabric Name 중복: ${fabric.name}`);
    fabricNames.add(key);
    if (!fabric.compositionId || !getComposition(fabric.compositionId)) errors.push(`${fabric.name}: Composition을 선택하세요.`);
  });
  return [...new Set(errors)];
}

function compositionTotal(composition) {
  return Object.values(composition.components || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function isFabricUsed(fabricId) {
  return Object.values(appState.styles).some((style) => parseYy(style.yyByFabricId?.[fabricId]) > 0);
}

function exportJson() {
  downloadBlob(new Blob([JSON.stringify(appState, null, 2)], { type: "application/json" }), `fabric-composition-backup-${dateStamp()}.json`);
}

function importJson(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const nextStore = parsed.version === STORAGE_VERSION ? parsed : migrateToV2(parsed);
      normalizeV2Store(nextStore);
      const errors = validateStoreShape(nextStore);
      if (errors.length) throw new Error(errors.join("\n"));
      if (!confirm("JSON 백업 내용으로 현재 저장 데이터를 교체할까요?")) return;
      appState = nextStore;
      saveStore();
      renderAll();
      const firstStyle = Object.keys(appState.styles)[0];
      if (firstStyle) loadStyle(firstStyle);
      else newStyle();
      showMessage("복원되었습니다.");
    } catch (error) {
      showMessage(`JSON 복원 실패: ${error.message}`, "error");
    }
  };
  reader.readAsText(file);
}

function validateStoreShape(store) {
  const errors = [];
  if (!Array.isArray(store.materials)) errors.push("materials 배열이 없습니다.");
  if (!Array.isArray(store.compositions)) errors.push("compositions 배열이 없습니다.");
  if (!Array.isArray(store.fabrics)) errors.push("fabrics 배열이 없습니다.");
  if (!store.styles || typeof store.styles !== "object") errors.push("styles 객체가 없습니다.");
  return errors;
}

function restoreSampleData() {
  if (!confirm("초기 예시 데이터로 복원할까요? 현재 데이터는 교체됩니다. 필요한 경우 먼저 JSON Export를 실행하세요.")) return;
  appState = createInitialStore();
  saveStore();
  renderAll();
  loadStyle(SAMPLE_STYLE.name);
}

function resetAllData() {
  if (!confirm("전체 저장 데이터를 초기화할까요? 이 작업은 되돌릴 수 없습니다. 필요한 경우 먼저 JSON 백업을 다운로드하세요.")) return;
  appState = { ...createInitialStore(), styles: {} };
  saveStore();
  currentYyByFabricId = {};
  renderAll();
  newStyle();
}

function renderUnmappedFabrics() {
  if (!els.unmappedList) return;
  const items = appState.unmappedFabrics || [];
  if (!items.length) {
    els.unmappedList.innerHTML = "";
    return;
  }
  els.unmappedList.innerHTML = `
    <h3>Unmapped Fabrics</h3>
    <p>v2 마이그레이션 중 기본 Fabric DB와 매칭하지 못한 YY 데이터입니다. 기존 백업은 localStorage의 ${MIGRATION_BACKUP_KEY}에 보관됩니다.</p>
    <table class="data-table">
      <thead><tr><th>Style</th><th>Fabric Key</th><th>YY</th></tr></thead>
      <tbody>
        ${items.map((item) => `<tr><td>${escapeHtml(item.style)}</td><td>${escapeHtml(item.fabric)}</td><td class="number-cell">${formatNumber(item.yy, 3)}</td></tr>`).join("")}
      </tbody>
    </table>
  `;
}

function downloadCsv(inputStyles) {
  const styles = inputStyles || getStylesForDownload();
  if (!styles.length) return;
  const materials = getMaterials();
  const rows = [];
  styles.forEach((style) => {
    const calculation = calculateStyle(style);
    rows.push(["STYLE", style.name]);
    rows.push(["Fabric Name", "Composition", "YY", "Ratio", ...materials.map((material) => material.name)]);
    calculation.usedRows.forEach((row) => {
      rows.push([row.fabricName, row.compositionLabel, row.yy, row.ratio, ...materials.map((material) => row.materialValues[material.id])]);
    });
    rows.push([]);
    rows.push(["Summary", "Value"]);
    materials.forEach((material) => rows.push([material.name, calculation.totals[material.id]]));
    rows.push(["Total", calculation.grandTotal]);
    rows.push([]);
  });
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  downloadBlob(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), `fabric-composition-${dateStamp()}.csv`);
}

async function downloadXlsx(inputStyles) {
  const styles = inputStyles || getStylesForDownload();
  if (!styles.length) return;
  if (!window.ExcelJS) {
    showMessage("ExcelJS 라이브러리가 로드되지 않았습니다. 인터넷 연결을 확인하거나 CSV 다운로드를 사용하세요.", "error");
    return;
  }
  try {
    const workbook = createXlsxWorkbook(styles, window.ExcelJS);
    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `fabric-composition-${dateStamp()}.xlsx`);
  } catch (error) {
    showMessage(`XLSX 다운로드 실패: ${error.message}`, "error");
  }
}

function createXlsxWorkbook(styles, ExcelJS) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Fabric Composition Calculator";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;
  const entries = styles.map((style) => ({ style: cloneStyle(style), calculation: calculateStyle(style) }));
  if (entries.length > 1) addSummaryWorksheet(workbook, entries);
  entries.forEach((entry) => addStyleWorksheet(workbook, entry, entries.length > 1));
  return workbook;
}

function addSummaryWorksheet(workbook, entries) {
  const materials = getMaterials();
  const lastColumn = 3 + materials.length;
  const sheet = workbook.addWorksheet("Summary", {
    views: [{ state: "frozen", ySplit: 3, showGridLines: false }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    properties: { defaultRowHeight: 20 },
  });
  sheet.properties.defaultColWidth = 12;
  sheet.mergeCells(1, 1, 1, lastColumn);
  setCell(sheet, 1, 1, "FABRIC COMPOSITION SUMMARY", titleStyle(16));
  sheet.getRow(1).height = 28;
  const headerRow = 3;
  ["STYLE", "Total YY", ...materials.map((material) => material.name), "Total"].forEach((header, index) => setCell(sheet, headerRow, index + 1, header, tableHeaderStyle()));
  sheet.getRow(headerRow).height = 26;
  entries.forEach((entry, index) => {
    const rowNumber = headerRow + index + 1;
    setCell(sheet, rowNumber, 1, entry.style.name, dataCellStyle(null, "left"));
    setCell(sheet, rowNumber, 2, entry.calculation.totalYy, dataCellStyle("0.000", "right"));
    materials.forEach((material, materialIndex) => {
      setCell(sheet, rowNumber, materialIndex + 3, entry.calculation.totals[material.id], dataCellStyle("0.00%", "right"));
    });
    setCell(sheet, rowNumber, lastColumn, 1, dataCellStyle("0.00%", "right"));
    sheet.getRow(rowNumber).height = 22;
  });
  sheet.columns = [{ width: 36 }, { width: 12 }, ...materials.map(() => ({ width: 18 })), { width: 12 }];
  sheet.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: headerRow + Math.max(entries.length, 1), column: lastColumn } };
}

function addStyleWorksheet(workbook, entry, useUniqueNames) {
  const materials = getMaterials();
  const lastColumn = 4 + materials.length;
  const sheetName = useUniqueNames ? uniqueSheetName(workbook, entry.style.name) : safeSheetName(entry.style.name);
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 5, showGridLines: false }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    properties: { defaultRowHeight: 20 },
  });
  sheet.properties.defaultColWidth = 12;
  const calculation = entry.calculation;
  sheet.mergeCells(1, 1, 1, Math.max(lastColumn, 11));
  setCell(sheet, 1, 1, "FABRIC COMPOSITION RESULT", titleStyle(16));
  sheet.getRow(1).height = 28;
  setCell(sheet, 2, 1, "STYLE", infoLabelStyle());
  setCell(sheet, 2, 2, entry.style.name, infoValueStyle());
  setCell(sheet, 3, 1, "TOTAL YY", infoLabelStyle());
  setCell(sheet, 3, 2, calculation.totalYy, infoValueStyle("0.000"));

  const detailHeaderRow = 5;
  ["Fabric Name", "Composition", "YY", "Ratio", ...materials.map((material) => material.name)].forEach((header, index) => setCell(sheet, detailHeaderRow, index + 1, header, tableHeaderStyle()));
  sheet.getRow(detailHeaderRow).height = 26;
  calculation.usedRows.forEach((row, index) => {
    const rowNumber = detailHeaderRow + index + 1;
    setCell(sheet, rowNumber, 1, row.fabricName, dataCellStyle(null, "left"));
    setCell(sheet, rowNumber, 2, row.compositionLabel, dataCellStyle(null, "left"));
    setCell(sheet, rowNumber, 3, row.yy, dataCellStyle("0.000", "right"));
    setCell(sheet, rowNumber, 4, row.ratio, dataCellStyle("0.00%", "right"));
    materials.forEach((material, materialIndex) => setCell(sheet, rowNumber, materialIndex + 5, row.materialValues[material.id], dataCellStyle("0.00%", "right")));
    sheet.getRow(rowNumber).height = 22;
  });

  const summaryHeaderRow = detailHeaderRow + calculation.usedRows.length + 3;
  setCell(sheet, summaryHeaderRow, 1, "Material", tableHeaderStyle());
  setCell(sheet, summaryHeaderRow, 2, "Value", tableHeaderStyle());
  materials.forEach((material, index) => {
    setCell(sheet, summaryHeaderRow + index + 1, 1, material.name, dataCellStyle(null, "left"));
    setCell(sheet, summaryHeaderRow + index + 1, 2, calculation.totals[material.id], dataCellStyle("0.00%", "right"));
  });
  setCell(sheet, summaryHeaderRow + materials.length + 1, 1, "Total", totalRowStyle());
  setCell(sheet, summaryHeaderRow + materials.length + 1, 2, 1, totalRowStyle("0.00%"));

  sheet.columns = [{ width: 55 }, { width: 36 }, { width: 10 }, { width: 10 }, ...materials.map(() => ({ width: 18 }))];
  sheet.autoFilter = { from: { row: detailHeaderRow, column: 1 }, to: { row: detailHeaderRow + Math.max(calculation.usedRows.length, 1), column: lastColumn } };
}

function setCell(sheet, rowNumber, columnNumber, value, style = {}) {
  const cell = sheet.getCell(rowNumber, columnNumber);
  cell.value = value;
  cell.style = clone(style);
  return cell;
}

function titleStyle(size = 14) {
  return { font: { name: "Calibri", bold: true, color: { argb: "FFFFFFFF" }, size }, fill: fill("FF1F4E78"), alignment: { vertical: "middle", horizontal: "center", wrapText: true }, border: thinBorder() };
}

function infoLabelStyle() {
  return { font: { name: "Calibri", bold: true, color: { argb: "FFFFFFFF" } }, fill: fill("FF5B6F8C"), alignment: { vertical: "middle", horizontal: "center", wrapText: true }, border: thinBorder() };
}

function infoValueStyle(numFmt) {
  return { font: { name: "Calibri", bold: true, color: { argb: "FF17324D" } }, fill: fill("FFDDEBF7"), alignment: { vertical: "middle", horizontal: "left", wrapText: true }, border: thinBorder(), ...(numFmt ? { numFmt } : {}) };
}

function tableHeaderStyle() {
  return { font: { name: "Calibri", bold: true, color: { argb: "FFFFFFFF" } }, fill: fill("FF2F5597"), alignment: { vertical: "middle", horizontal: "center", wrapText: true }, border: thinBorder() };
}

function dataCellStyle(numFmt, horizontal = "left") {
  return { font: { name: "Calibri", size: 11 }, alignment: { vertical: "middle", horizontal, wrapText: true }, border: thinBorder(), ...(numFmt ? { numFmt } : {}) };
}

function totalRowStyle(numFmt) {
  return { font: { name: "Calibri", bold: true, color: { argb: "FF17324D" } }, fill: fill("FFFFE699"), alignment: { vertical: "middle", horizontal: "right", wrapText: true }, border: thinBorder(), ...(numFmt ? { numFmt } : {}) };
}

function fill(argb) {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function thinBorder() {
  return {
    top: { style: "thin", color: { argb: "FFB7B7B7" } },
    left: { style: "thin", color: { argb: "FFB7B7B7" } },
    bottom: { style: "thin", color: { argb: "FFB7B7B7" } },
    right: { style: "thin", color: { argb: "FFB7B7B7" } },
  };
}

function getStylesForDownload() {
  if (lastExtractedStyles.length) return lastExtractedStyles;
  showMessage("먼저 결과를 추출하세요.", "error");
  return [];
}

function activateTab(tabId) {
  document.querySelectorAll(".tab-button").forEach((button) => button.classList.toggle("active", button.dataset.tab === tabId));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === tabId));
}

function activateDbTab(tabId) {
  document.querySelectorAll(".sub-tab").forEach((button) => button.classList.toggle("active", button.dataset.dbTab === tabId));
  document.querySelectorAll(".db-panel").forEach((panel) => panel.classList.remove("active"));
  document.getElementById(`${tabId}Db`).classList.add("active");
}

function showMessage(message, type = "success") {
  els.messageArea.textContent = message;
  els.messageArea.className = `message-area ${type}`;
}

function showValidation(errors) {
  els.validationArea.classList.remove("hidden");
  els.validationArea.innerHTML = `<strong>저장 전 확인 필요</strong><ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul>`;
}

function hideValidation() {
  els.validationArea.classList.add("hidden");
  els.validationArea.innerHTML = "";
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
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function formatNumber(value, digits = 3) {
  return Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatPercent(value, digits = 2) {
  return `${((Number(value) || 0) * 100).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

function dateStamp() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
}

function safeSheetName(name) {
  return String(name || "Style").replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Style";
}

function uniqueSheetName(workbook, name) {
  const baseName = safeSheetName(name);
  let sheetName = baseName;
  let index = 2;
  while (workbook.getWorksheet(sheetName)) {
    const suffix = ` ${index}`;
    sheetName = `${baseName.slice(0, 31 - suffix.length)}${suffix}`;
    index += 1;
  }
  return sheetName;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "item";
}

function uniqueId(base, existingIds) {
  const used = new Set(existingIds);
  let id = base;
  let index = 2;
  while (used.has(id)) {
    id = `${base}_${index}`;
    index += 1;
  }
  return id;
}

function defaultFabricId(index) {
  return `fabric_${String(index + 1).padStart(3, "0")}`;
}

function nextOrder(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
