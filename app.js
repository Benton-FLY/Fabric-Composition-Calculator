const STORAGE_KEY = "fabricCompositionCalculator";
const STORAGE_VERSION = 4;
const MIGRATION_BACKUP_KEY = "fabricCompositionBackupBeforeV2Migration";
const CARE_LABEL_MODES = ["internal", "us", "eu"];
const CARE_LABEL_TYPES = ["fiber", "custom-warning", "animal-nontextile"];

const DEFAULT_MATERIALS = [
  { id: "polyester_coated", name: "POLYESTER (COATED)", order: 1 },
  { id: "polyester_uncoated", name: "POLYESTER (UNCOATED)", order: 2 },
  { id: "polyurethane", name: "POLYURETHANE", order: 3 },
  { id: "nylon", name: "NYLON", order: 4 },
  { id: "kevlar", name: "KEVLAR", order: 5 },
  { id: "spandex", name: "SPANDEX", order: 6 },
  { id: "leather", name: "LEATHER", order: 7 },
];

const DEFAULT_CARE_LABEL_MAPPINGS = {
  internal: {
    polyester_coated: { label: "POLYESTER (COATED)", type: "fiber", active: true },
    polyester_uncoated: { label: "POLYESTER (UNCOATED)", type: "fiber", active: true },
    polyurethane: { label: "POLYURETHANE", type: "custom-warning", active: true },
    nylon: { label: "NYLON", type: "fiber", active: true },
    kevlar: { label: "KEVLAR", type: "custom-warning", active: true },
    spandex: { label: "SPANDEX", type: "fiber", active: true },
    leather: { label: "LEATHER", type: "animal-nontextile", active: true },
  },
  us: {
    polyester_coated: { label: "POLYESTER", type: "fiber", active: true },
    polyester_uncoated: { label: "POLYESTER", type: "fiber", active: true },
    polyurethane: { label: "POLYURETHANE", type: "custom-warning", active: true },
    nylon: { label: "NYLON", type: "fiber", active: true },
    kevlar: { label: "ARAMID", type: "fiber", active: true },
    spandex: { label: "SPANDEX", type: "fiber", functionalSignificance: true, active: true },
    leather: { label: "LEATHER", type: "animal-nontextile", active: true },
  },
  eu: {
    polyester_coated: { label: "POLYESTER", type: "fiber", active: true },
    polyester_uncoated: { label: "POLYESTER", type: "fiber", active: true },
    polyurethane: { label: "POLYURETHANE", type: "custom-warning", active: true },
    nylon: { label: "POLYAMIDE", type: "fiber", active: true },
    kevlar: { label: "ARAMID", type: "fiber", active: true },
    spandex: { label: "ELASTANE", type: "fiber", active: true },
    leather: { label: "LEATHER", type: "animal-nontextile", active: true },
  },
};

const DEFAULT_CARE_LABEL_OPTIONS = {
  showPreview: true,
  strictFTC: false,
  includeInternal: false,
  includeUs: true,
  includeEu: true,
  singleLine: false,
  includeWarnings: true,
};

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
let styleDrafts = {};
let activeStyleId = null;
let pendingUpload = null;
let selectedStyleIds = new Set();
let undoStack = [];
let redoStack = [];
let inputHistoryBefore = null;
let compositionBuilderTarget = null;
let compositionBuilderState = null;
let showReviewOnly = false;
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
    "fabricSortSelect", "addFabricBtn", "fabricDbTableBody", "carePreviewToggle",
    "usStrictFtcToggle", "includeInternalToggle", "includeUsToggle", "includeEuToggle",
    "singleLineToggle", "includeWarningsToggle", "resetCareMappingBtn", "careMappingTableBody",
    "currentCareLabelArea", "sidebarNewStyleBtn", "consumptionUploadInput", "styleDraftList",
    "fabricTemplateBtn", "fabricExcelUploadInput", "uploadPreviewModal", "uploadPreviewTitle", "uploadPreviewBody",
    "closeUploadPreviewBtn", "cancelUploadPreviewBtn", "importUploadPreviewBtn", "undoBtn", "redoBtn",
    "selectAllDraftsBtn", "deleteSelectedDraftsBtn", "addDraftFabricRowBtn",
    "compositionBuilderModal", "closeCompositionBuilderBtn", "compositionBuilderName", "compositionBuilderRows", "compositionBuilderTotal", "compositionBuilderError", "addCompositionMaterialBtn", "addBuilderMaterialBtn", "cancelCompositionBuilderBtn", "applyTemporaryCompositionBtn", "saveCompositionToDbBtn", "materialBuilderModal", "closeMaterialBuilderBtn", "builderMaterialName", "builderMaterialInternalLabel", "builderMaterialUsLabel", "builderMaterialEuLabel", "cancelMaterialBuilderBtn", "saveBuilderMaterialBtn",
    "reviewWarningArea", "reviewWarningText", "toggleReviewFilterBtn", "summaryReviewWarning",
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
  els.sidebarNewStyleBtn.addEventListener("click", newStyle);
  els.selectAllDraftsBtn.addEventListener("click", toggleSelectAllDrafts);
  els.deleteSelectedDraftsBtn.addEventListener("click", deleteSelectedDrafts);
  els.addDraftFabricRowBtn.addEventListener("click", addDraftFabricRow);
  els.undoBtn.addEventListener("click", undoWorkspace);
  els.redoBtn.addEventListener("click", redoWorkspace);
  els.closeCompositionBuilderBtn.addEventListener("click", closeCompositionBuilder);
  els.cancelCompositionBuilderBtn.addEventListener("click", closeCompositionBuilder);
  els.addCompositionMaterialBtn.addEventListener("click", () => { compositionBuilderState.rows.push({ materialId: "", ratio: "" }); renderCompositionBuilder(); });
  els.addBuilderMaterialBtn.addEventListener("click", openMaterialBuilder);
  els.applyTemporaryCompositionBtn.addEventListener("click", () => applyBuiltComposition(false));
  els.saveCompositionToDbBtn.addEventListener("click", () => applyBuiltComposition(true));
  els.closeMaterialBuilderBtn.addEventListener("click", closeMaterialBuilder);
  els.cancelMaterialBuilderBtn.addEventListener("click", closeMaterialBuilder);
  els.saveBuilderMaterialBtn.addEventListener("click", saveBuilderMaterial);
  els.toggleReviewFilterBtn.addEventListener("click", () => { showReviewOnly = !showReviewOnly; renderFabricTable(); });
  els.consumptionUploadInput.addEventListener("change", handleConsumptionFiles);
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
  els.styleNameInput.addEventListener("input", () => { syncActiveDraft(); updateSummary(); renderStyleDraftList(); });
  els.styleNameInput.addEventListener("focus", () => { inputHistoryBefore = workspaceSnapshot(); });
  els.styleNameInput.addEventListener("blur", () => finalizeInputHistory());
  els.dbEditBtn.addEventListener("click", enterDbEditMode);
  els.dbSaveLockBtn.addEventListener("click", saveDbAndLock);
  els.dbCancelBtn.addEventListener("click", cancelDbEdits);
  els.addMaterialBtn.addEventListener("click", addMaterial);
  els.addCompositionBtn.addEventListener("click", addComposition);
  els.addFabricBtn.addEventListener("click", addFabric);
  els.fabricTemplateBtn.addEventListener("click", downloadFabricTemplate);
  els.fabricExcelUploadInput.addEventListener("change", handleFabricExcelUpload);
  els.closeUploadPreviewBtn.addEventListener("click", closeUploadPreview);
  els.cancelUploadPreviewBtn.addEventListener("click", closeUploadPreview);
  els.importUploadPreviewBtn.addEventListener("click", commitUploadPreview);
  els.materialSearchInput.addEventListener("input", renderMaterialDb);
  els.compositionSearchInput.addEventListener("input", renderCompositionDb);
  els.fabricDbSearchInput.addEventListener("input", renderFabricDb);
  els.fabricSortSelect.addEventListener("change", renderFabricDb);
  [
    els.carePreviewToggle, els.usStrictFtcToggle, els.includeInternalToggle, els.includeUsToggle,
    els.includeEuToggle, els.singleLineToggle, els.includeWarningsToggle,
  ].filter(Boolean).forEach((input) => input.addEventListener("change", handleCareLabelOptionChange));
  els.resetCareMappingBtn.addEventListener("click", resetCareLabelMappings);
  els.resultArea.addEventListener("click", handleResultAreaClick);
  document.addEventListener("keydown", handleWorkspaceShortcuts);
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
      const migrated = migrateToV4(parsed);
      saveStore(migrated);
      return migrated;
    }
    normalizeV3Store(parsed);
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
    careLabelMappings: clone(DEFAULT_CARE_LABEL_MAPPINGS),
    careLabelOptions: clone(DEFAULT_CARE_LABEL_OPTIONS),
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

function migrateToV3(data) {
  const store = data?.version === 2 ? data : migrateToV2(data);
  normalizeV3Store(store);
  store.version = STORAGE_VERSION;
  return store;
}

function migrateToV4(data) {
  const store = data?.version === 3 ? data : migrateToV3(data);
  normalizeV3Store(store);
  store.version = STORAGE_VERSION;
  return store;
}

function normalizeV3Store(store) {
  store.materials = Array.isArray(store.materials) ? store.materials : clone(DEFAULT_MATERIALS);
  store.compositions = Array.isArray(store.compositions) ? store.compositions : clone(DEFAULT_COMPOSITIONS);
  store.fabrics = Array.isArray(store.fabrics) ? store.fabrics : createDefaultFabrics();
  if (Array.isArray(store.styles)) {
    store.styles = Object.fromEntries(store.styles.map((style) => [style.name, cloneStyle(style)]));
  }
  store.styles = store.styles && typeof store.styles === "object" ? store.styles : {};
  store.unmappedFabrics = Array.isArray(store.unmappedFabrics) ? store.unmappedFabrics : [];
  store.careLabelMappings = normalizeCareLabelMappings(store.careLabelMappings, store.materials);
  store.careLabelOptions = { ...clone(DEFAULT_CARE_LABEL_OPTIONS), ...(store.careLabelOptions || {}) };
}

function saveStore(store = appState) {
  store.version = STORAGE_VERSION;
  store.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function renderAll() {
  setCareLabelOptionsToUi();
  renderFabricTable();
  renderSavedStyles();
  renderDbManagement();
  renderUnmappedFabrics();
  renderAutocompleteLists();
  renderStyleDraftList();
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
    coatingByFabricId: clone(style.coatingByFabricId || {}),
    rows: Array.isArray(style.rows) ? clone(style.rows) : undefined,
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

function newDraft(style = { name: "", yyByFabricId: {} }, extras = {}) {
  const id = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  styleDrafts[id] = { id, styleName: normalizeStyleName(style.name), coatingByFabricId: clone(style.coatingByFabricId || {}), yyByFabricId: { ...(style.yyByFabricId || {}) }, rows: extras.rows || [], sourceFile: extras.sourceFile || "", sourceType: extras.sourceType || "manual", dirty: Boolean(extras.dirty), ...extras };
  activeStyleId = id;
  return styleDrafts[id];
}

function activeDraft() { return styleDrafts[activeStyleId]; }
function syncActiveDraft() {
  const draft = activeDraft();
  if (!draft || !els.styleNameInput) return;
  draft.styleName = normalizeStyleName(els.styleNameInput.value);
  draft.yyByFabricId = { ...currentYyByFabricId };
  draft.dirty = true;
}

function activateDraft(id, { syncCurrent = true } = {}) {
  if (syncCurrent) syncActiveDraft();
  const draft = styleDrafts[id];
  if (!draft) return;
  activeStyleId = id;
  els.styleNameInput.value = draft.styleName;
  currentYyByFabricId = { ...draft.yyByFabricId };
  renderStyleDraftList();
  renderFabricTable();
}

function renderStyleDraftList() {
  if (!els.styleDraftList) return;
  els.styleDraftList.innerHTML = Object.values(styleDrafts).map((draft) => { const reviewCount = (draft.rows || []).filter(rowNeedsReview).length; return `<div class="draft-item ${draft.id === activeStyleId ? "active" : ""}" data-draft-id="${escapeAttribute(draft.id)}"><input type="checkbox" data-draft-select="${escapeAttribute(draft.id)}" ${selectedStyleIds.has(draft.id) ? "checked" : ""}><button type="button" class="draft-label" data-draft-open="${escapeAttribute(draft.id)}" title="${escapeAttribute(draft.sourceFile || draft.styleName)}">${escapeHtml(draft.styleName || "Untitled Style")} ${reviewCount ? `<span class="review-count">⚠${reviewCount}</span>` : ""}<span class="draft-source">${draft.sourceType === "import" ? "Imported" : "Manual"}${reviewCount ? ` · ${reviewCount} Review` : ""}</span></button><button type="button" class="draft-delete" data-draft-delete="${escapeAttribute(draft.id)}" aria-label="삭제">×</button></div>`; }).join("");
  els.styleDraftList.querySelectorAll("[data-draft-open]").forEach((button) => button.addEventListener("click", () => activateDraft(button.dataset.draftOpen)));
  els.styleDraftList.querySelectorAll("[data-draft-select]").forEach((input) => input.addEventListener("click", (event) => { event.stopPropagation(); if (input.checked) selectedStyleIds.add(input.dataset.draftSelect); else selectedStyleIds.delete(input.dataset.draftSelect); renderStyleDraftList(); }));
  els.styleDraftList.querySelectorAll("[data-draft-delete]").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); deleteDrafts([button.dataset.draftDelete]); }));
}

function workspaceSnapshot() { return clone({ styleDrafts, activeStyleId, selectedStyleIds: Array.from(selectedStyleIds) }); }
function restoreWorkspace(snapshot) { styleDrafts = snapshot.styleDrafts || {}; activeStyleId = snapshot.activeStyleId; selectedStyleIds = new Set(snapshot.selectedStyleIds || []); if (!activeStyleId || !styleDrafts[activeStyleId]) activeStyleId = Object.keys(styleDrafts)[0] || null; if (!activeStyleId) newDraft(); const draft = activeDraft(); els.styleNameInput.value = draft.styleName; currentYyByFabricId = { ...draft.yyByFabricId }; renderStyleDraftList(); renderFabricTable(); }
function commitWorkspaceChange(action, { render = true } = {}) { undoStack.push(workspaceSnapshot()); redoStack = []; action(); if (render) { renderStyleDraftList(); renderFabricTable(); } updateHistoryButtons(); }
function undoWorkspace() { if (!undoStack.length) return; redoStack.push(workspaceSnapshot()); restoreWorkspace(undoStack.pop()); updateHistoryButtons(); }
function redoWorkspace() { if (!redoStack.length) return; undoStack.push(workspaceSnapshot()); restoreWorkspace(redoStack.pop()); updateHistoryButtons(); }
function updateHistoryButtons() { if (els.undoBtn) els.undoBtn.disabled = !undoStack.length; if (els.redoBtn) els.redoBtn.disabled = !redoStack.length; }
function handleWorkspaceShortcuts(event) { if (!(event.ctrlKey || event.metaKey)) return; const key = event.key.toLowerCase(); if (key === "z") { event.preventDefault(); event.shiftKey ? redoWorkspace() : undoWorkspace(); } else if (key === "y" && !event.metaKey) { event.preventDefault(); redoWorkspace(); } }
function toggleSelectAllDrafts() { const ids = Object.keys(styleDrafts); selectedStyleIds = selectedStyleIds.size === ids.length ? new Set() : new Set(ids); renderStyleDraftList(); }
function deleteSelectedDrafts() { deleteDrafts(Array.from(selectedStyleIds)); }
function deleteDrafts(ids) { const targets = ids.filter((id) => styleDrafts[id]); if (!targets.length) return; const names = targets.map((id) => styleDrafts[id].styleName || "Untitled Style"); const message = targets.length === 1 ? `${names[0]} 스타일을 삭제하시겠습니까?\n입력한 데이터도 함께 삭제됩니다.` : `선택한 ${targets.length}개 스타일을 삭제하시겠습니까?\n삭제 후 복구하려면 Undo를 사용해야 합니다.`; if (!confirm(message)) return; commitWorkspaceChange(() => { targets.forEach((id) => delete styleDrafts[id]); selectedStyleIds = new Set(); if (!styleDrafts[activeStyleId]) activeStyleId = Object.keys(styleDrafts)[0] || null; if (!activeStyleId) newDraft(); const draft = activeDraft(); els.styleNameInput.value = draft.styleName; currentYyByFabricId = { ...draft.yyByFabricId }; }); }

function calculateStyle(style) {
  const materials = getMaterials();
  const rows = Array.isArray(style.rows) ? style.rows.map((row, index) => ({
    id: row.rowId || row.fabricId || `custom_${index}`,
    fabricName: row.fabricName || "(Unnamed Fabric)",
    compositionLabel: applyPolyesterCoating(getRowComposition(row), row.polyesterCoating)?.label || row.composition || "",
    yy: parseYy(row.yy), ratio: 0, materialValues: emptyMaterialMap(), composition: applyPolyesterCoating(getRowComposition(row), row.polyesterCoating), sourceRow: row,
  })) : appState.fabrics
    .slice()
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map((fabric) => ({
      ...fabric,
      fabricName: fabric.name,
      compositionLabel: applyPolyesterCoating(getComposition(fabric.compositionId), style.coatingByFabricId?.[fabric.id])?.label || "",
      yy: parseYy(style.yyByFabricId?.[fabric.id]),
      ratio: 0,
      materialValues: emptyMaterialMap(),
      composition: applyPolyesterCoating(getComposition(fabric.compositionId), style.coatingByFabricId?.[fabric.id]),
    }));
  const unresolvedRows = rows.filter((row) => row.yy > 0 && (rowNeedsReview(row.sourceRow) || !row.composition?.components));
  const usedRows = rows.filter((row) => row.yy > 0 && !rowNeedsReview(row.sourceRow) && row.composition?.components);
  const totalYy = usedRows.reduce((sum, row) => sum + row.yy, 0);
  const unresolvedYy = unresolvedRows.reduce((sum, row) => sum + row.yy, 0);
  const totals = emptyMaterialMap();

  if (totalYy > 0) {
    usedRows.forEach((row) => {
      const composition = row.composition || getComposition(row.compositionId);
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
    unresolvedRows,
    unresolvedYy,
    reviewCount: unresolvedRows.length,
    totals,
    grandTotal: materials.reduce((sum, material) => sum + totals[material.id], 0),
  };
}

function rowNeedsReview(row) {
  if (!row) return false;
  if (row.importStatus) return Boolean(row.importStatus.reviewRequired);
  return ["MEDIUM", "LOW", "UNMATCHED"].includes(row.confidence) && !getRowComposition(row)?.components;
}

function getRowComposition(row) {
  if (row?.compositionDefinition?.components) return row.compositionDefinition;
  if (row?.composition && typeof row.composition === "object" && row.composition.components) return row.composition;
  if (row?.compositionId) return getComposition(row.compositionId);
  return null;
}

// Coating is a style-row override; shared Composition DB entries stay reusable.
function polyesterRatio(composition) {
  return Number(composition?.components?.polyester_coated || 0) + Number(composition?.components?.polyester_uncoated || 0);
}

function applyPolyesterCoating(composition, coating) {
  if (!polyesterRatio(composition) || !["coated", "uncoated"].includes(coating)) return composition;
  const components = { ...composition.components, polyester_coated: 0, polyester_uncoated: 0 };
  components[`polyester_${coating}`] = polyesterRatio(composition);
  const label = String(composition.label || "").replace(/\s*\((?:UNCOATED|COATED)\)/gi, "");
  return { ...composition, label: `${label} (${coating.toUpperCase()})`, components };
}

// The displayed coating suffix is an override, not a different DB composition.
function getEditedRowCompositionLabel(row, value) {
  const original = getRowComposition(row);
  const displayed = applyPolyesterCoating(original, row.polyesterCoating);
  return displayed && value === displayed.label ? original.label : value;
}

function appendCoatingControl(cell, composition, coating, key, onChange) {
  if (!polyesterRatio(composition)) return;
  const selected = ["coated", "uncoated"].includes(coating) ? coating
    : Number(composition.components.polyester_coated || 0) > 0 && !Number(composition.components.polyester_uncoated || 0) ? "coated"
    : Number(composition.components.polyester_uncoated || 0) > 0 && !Number(composition.components.polyester_coated || 0) ? "uncoated" : "";
  const group = document.createElement("span");
  group.className = "coating-options";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Polyester coating");
  group.innerHTML = ["coated", "uncoated"].map((value) => `<label><input type="radio" name="coating-${escapeAttribute(key)}" value="${value}" ${selected === value ? "checked" : ""}>${value === "coated" ? "Coated" : "Uncoated"}</label>`).join("");
  group.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => onChange(input.value)));
  cell.append(group);
}

function emptyMaterialMap() {
  return getMaterials().reduce((map, material) => {
    map[material.id] = 0;
    return map;
  }, {});
}

function normalizeCareLabelMappings(source, materials = appState?.materials || DEFAULT_MATERIALS) {
  const normalized = clone(DEFAULT_CARE_LABEL_MAPPINGS);
  CARE_LABEL_MODES.forEach((mode) => {
    normalized[mode] = normalized[mode] || {};
    getMaterialIdsFromDefaultsAndStore(materials).forEach((materialId) => {
      const materialName = materials.find((material) => material.id === materialId)?.name || materialId;
      const fallback = normalized[mode][materialId] || { label: materialName, type: "fiber", active: true };
      const incoming = source?.[mode]?.[materialId] || {};
      normalized[mode][materialId] = {
        ...fallback,
        ...incoming,
        label: String(incoming.label ?? fallback.label ?? materialName).trim().toUpperCase(),
        type: CARE_LABEL_TYPES.includes(incoming.type || fallback.type) ? incoming.type || fallback.type : "fiber",
        active: incoming.active !== false,
        functionalSignificance: Boolean(incoming.functionalSignificance ?? fallback.functionalSignificance),
      };
    });
  });
  return normalized;
}

function getMaterialIdsFromDefaultsAndStore(materials = appState?.materials || DEFAULT_MATERIALS) {
  const ids = new Set(DEFAULT_MATERIALS.map((material) => material.id));
  if (Array.isArray(materials)) {
    materials.forEach((material) => ids.add(material.id));
  }
  return Array.from(ids);
}

function getCareLabelOptionsFromUi() {
  return {
    showPreview: els.carePreviewToggle?.checked ?? appState.careLabelOptions.showPreview,
    strictFTC: els.usStrictFtcToggle?.checked ?? appState.careLabelOptions.strictFTC,
    includeInternal: els.includeInternalToggle?.checked ?? appState.careLabelOptions.includeInternal,
    includeUs: els.includeUsToggle?.checked ?? appState.careLabelOptions.includeUs,
    includeEu: els.includeEuToggle?.checked ?? appState.careLabelOptions.includeEu,
    singleLine: els.singleLineToggle?.checked ?? appState.careLabelOptions.singleLine,
    includeWarnings: els.includeWarningsToggle?.checked ?? appState.careLabelOptions.includeWarnings,
  };
}

function setCareLabelOptionsToUi() {
  const options = appState.careLabelOptions || DEFAULT_CARE_LABEL_OPTIONS;
  if (els.carePreviewToggle) els.carePreviewToggle.checked = Boolean(options.showPreview);
  if (els.usStrictFtcToggle) els.usStrictFtcToggle.checked = Boolean(options.strictFTC);
  if (els.includeInternalToggle) els.includeInternalToggle.checked = Boolean(options.includeInternal);
  if (els.includeUsToggle) els.includeUsToggle.checked = Boolean(options.includeUs);
  if (els.includeEuToggle) els.includeEuToggle.checked = Boolean(options.includeEu);
  if (els.singleLineToggle) els.singleLineToggle.checked = Boolean(options.singleLine);
  if (els.includeWarningsToggle) els.includeWarningsToggle.checked = Boolean(options.includeWarnings);
}

function handleCareLabelOptionChange() {
  appState.careLabelOptions = getCareLabelOptionsFromUi();
  saveStore();
  updateSummary();
  if (lastExtractedStyles.length) renderResults(lastExtractedStyles);
}

function getSelectedCareLabelModes(options = getCareLabelOptionsFromUi(), includeInternalOverride = false) {
  return [
    ...(options.includeInternal || includeInternalOverride ? ["internal"] : []),
    ...(options.includeUs ? ["us"] : []),
    ...(options.includeEu ? ["eu"] : []),
  ];
}

function generateCareLabel(totals, mode, options = {}) {
  const modeMappings = appState.careLabelMappings?.[mode] || {};
  const aggregate = new Map();
  const warnings = [];
  const notes = [];
  const animalLabels = [];

  getMaterials().forEach((material) => {
    const value = Number(totals?.[material.id] || 0);
    if (!(value > 0)) return;
    const mapping = modeMappings[material.id] || { label: material.name, type: "fiber", active: true };
    if (mapping.active === false) return;
    const label = String(mapping.label || material.name).trim().toUpperCase();
    if (!label) return;
    if (mapping.type === "animal-nontextile") {
      animalLabels.push(label);
      return;
    }
    const existing = aggregate.get(label) || { label, value: 0, type: mapping.type, functionalSignificance: false };
    existing.value += value;
    existing.type = existing.type === "custom-warning" || mapping.type === "custom-warning" ? "custom-warning" : "fiber";
    existing.functionalSignificance = existing.functionalSignificance || Boolean(mapping.functionalSignificance);
    aggregate.set(label, existing);
  });

  let items = Array.from(aggregate.values()).filter((item) => item.value > 0);

  if (mode === "us" && options.strictFTC) {
    const other = { label: "OTHER FIBER", value: 0, type: "fiber", functionalSignificance: false };
    items = items.filter((item) => {
      if (item.value < 0.05 && !item.functionalSignificance) {
        other.value += item.value;
        return false;
      }
      return true;
    });
    if (other.value > 0) items.push(other);
  }

  items.forEach((item) => {
    if (item.type === "custom-warning") {
      warnings.push(`Warning: ${item.label} is currently treated as a custom care-label term. Verify legal suitability before use.`);
    }
  });

  if (animalLabels.length) {
    if (mode === "eu") notes.push("Contains non-textile parts of animal origin");
    if (mode === "us" && options.includeUsAnimalNote) notes.push(`Contains ${animalLabels.join(", ")}`);
    if (mode === "internal") notes.push(`Animal/non-textile item excluded from fibre lines: ${animalLabels.join(", ")}`);
  }

  items.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  const rounded = allocateIntegerPercentages(items);
  const lines = rounded.map((item) => ({ label: item.label, percent: item.percent }));
  const totalPercent = lines.reduce((sum, item) => sum + item.percent, 0);
  const delimiter = options.singleLine ? " / " : "\n";
  const text = lines.length ? lines.map((item) => `${item.label} ${item.percent}%`).join(delimiter) : "No care label content available";
  if (lines.length && totalPercent !== 100) warnings.push(`Warning: care label integer total is ${totalPercent}%, expected 100%.`);

  return {
    mode,
    title: `${mode.toUpperCase()} CARE LABEL`,
    lines,
    text,
    warnings: [...new Set(warnings)],
    notes: [...new Set(notes)],
    totalPercent,
    isValid: !lines.length || totalPercent === 100,
  };
}

function allocateIntegerPercentages(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (!(total > 0)) return [];
  const prepared = items.map((item, index) => {
    const exact = (item.value / total) * 100;
    return { ...item, exact, percent: Math.floor(exact), remainder: exact - Math.floor(exact), index };
  });
  let remaining = 100 - prepared.reduce((sum, item) => sum + item.percent, 0);
  prepared
    .slice()
    .sort((a, b) => b.remainder - a.remainder || b.value - a.value || a.label.localeCompare(b.label) || a.index - b.index)
    .forEach((item) => {
      if (remaining > 0) {
        prepared[item.index].percent += 1;
        remaining -= 1;
      }
    });
  return prepared.sort((a, b) => b.percent - a.percent || b.value - a.value || a.label.localeCompare(b.label));
}

function renderFabricTable() {
  const materials = getMaterials();
  const query = els.fabricSearchInput.value.trim().toLowerCase();
  els.fabricTableHead.innerHTML = `
    <tr>
      <th>No</th><th>Fabric Name</th><th>Composition</th><th>YY</th><th>Ratio</th>
      ${materials.map((material) => `<th>${escapeHtml(material.name)}</th>`).join("")}
      ${activeDraft()?.sourceType === "import" ? "<th>Action</th>" : ""}
    </tr>
  `;
  els.fabricTableBody.innerHTML = "";
  els.reviewWarningArea?.classList.add("hidden");
  if (activeDraft()?.sourceType === "import") {
    renderImportedFabricTable(materials);
    refreshFabricCalculations();
    return;
  }

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
        <td><input class="fabric-edit-input" list="fabricAutocomplete" data-fabric-edit="${escapeAttribute(fabric.id)}" value="${escapeAttribute(fabric.name)}"></td>
        <td><input class="composition-edit-input" list="compositionAutocomplete" data-composition-edit="${escapeAttribute(fabric.id)}" value="${escapeAttribute(applyPolyesterCoating(getComposition(fabric.compositionId), activeDraft()?.coatingByFabricId?.[fabric.id])?.label || "")}"></td>
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
      input.value = currentYyByFabricId[fabric.id] ? formatYY(currentYyByFabricId[fabric.id]) : "";
      input.dataset.fabricId = fabric.id;
      input.addEventListener("input", handleYyInput);
      tr.children[3].append(input);
      appendCoatingControl(tr.children[2], getComposition(fabric.compositionId), activeDraft()?.coatingByFabricId?.[fabric.id], fabric.id, (value) => {
        commitWorkspaceChange(() => { const draft = activeDraft(); draft.coatingByFabricId ||= {}; draft.coatingByFabricId[fabric.id] = value; draft.dirty = true; });
      });
      tr.querySelector("[data-fabric-edit]").addEventListener("change", handleDraftFabricEdit);
      tr.querySelector("[data-composition-edit]").addEventListener("change", handleDraftCompositionEdit);
      els.fabricTableBody.append(tr);
    });

  // Unmatched imported materials stay visible as editable draft-only rows. They are
  // never silently added to Fabric DB and only participate in calculation after a
  // user maps them to an existing fabric.
  (activeDraft()?.rows || []).filter((row) => !row.matchedFabricId).forEach((row, index) => {
    const tr = document.createElement("tr"); tr.className = `match-${row.confidence.toLowerCase()}`;
    tr.innerHTML = `<td>—</td><td><input class="fabric-edit-input" list="fabricAutocomplete" data-imported-fabric="${index}" value="${escapeAttribute(row.matchedFabricName || row.material)}"><span class="source-badge">Source: ${escapeHtml(row.material)} · ${escapeHtml(row.sourceSheet)} · ${escapeHtml(row.sourceCell)}</span><span class="not-in-db">Not in Fabric DB</span></td><td><input class="composition-edit-input" list="compositionAutocomplete" data-imported-composition="${index}" value="${escapeAttribute(row.composition)}"></td><td class="number-cell"><input class="yy-input" type="number" min="0" step="0.001" data-imported-yy="${index}" value="${row.usage}"></td><td class="number-cell">${escapeHtml(row.confidence)}</td>${materials.map(() => "<td class=\"number-cell\">—</td>").join("")}`;
    tr.querySelector("[data-imported-fabric]").addEventListener("change", updateImportedDraftRow);
    tr.querySelector("[data-imported-composition]").addEventListener("change", updateImportedDraftRow);
    tr.querySelector("[data-imported-yy]").addEventListener("input", updateImportedDraftRow);
    els.fabricTableBody.append(tr);
  });

  refreshFabricCalculations();
}

function renderImportedFabricTable(materials) {
  const draft = activeDraft();
  const reviewCount = (draft.rows || []).filter(rowNeedsReview).length;
  els.reviewWarningArea.classList.toggle("hidden", reviewCount === 0);
  els.reviewWarningText.textContent = `⚠ Review Required: ${reviewCount}개 원단의 Fabric/Composition 확인이 필요합니다.`;
  els.toggleReviewFilterBtn.textContent = showReviewOnly ? "전체 보기" : "검토 필요 항목만 보기";
  (draft.rows || []).filter((row) => !showReviewOnly || rowNeedsReview(row)).forEach((row, index) => {
    const reviewRequired = rowNeedsReview(row);
    const status = getImportRowStatus(row);
    const tr = document.createElement("tr"); tr.className = status.className;
    const isDbFabric = Boolean(row.fabricId);
    const compositionLabel = applyPolyesterCoating(getRowComposition(row), row.polyesterCoating)?.label || row.composition || "";
    tr.innerHTML = `<td>${index + 1}</td><td><input class="fabric-edit-input" list="fabricAutocomplete" data-import-row-fabric="${escapeAttribute(row.rowId)}" value="${escapeAttribute(row.fabricName || "")}" title="Source: ${escapeAttribute(row.source?.sourceMaterialName || "")}\nMatched: ${escapeAttribute(row.fabricName || "")}\nConfidence: ${Math.round((row.matchScore || 0) * 100)}%">${row.source?.sourceMaterialName ? `<span class="source-badge">Source: ${escapeHtml(row.source.sourceMaterialName)} · ${escapeHtml(row.source.sourceSheet || "")}</span>` : ""}${status.badge ? `<span class="review-badge ${status.badgeClass}">${status.badge}</span>` : ""}${!isDbFabric && row.fabricName ? `<span class="not-in-db">Not in Fabric DB</span><button type="button" class="mini-button" data-add-fabric-db="${escapeAttribute(row.rowId)}">Fabric DB에 추가</button>` : ""}</td><td><input class="composition-edit-input" list="compositionAutocomplete" placeholder="Composition 선택 또는 생성" data-import-row-composition="${escapeAttribute(row.rowId)}" value="${escapeAttribute(compositionLabel)}"><button type="button" class="mini-button" data-compose-row="${escapeAttribute(row.rowId)}">${row.compositionDefinition?.source === "temporary" ? "CUSTOM" : "Composition 만들기"}</button></td><td class="number-cell"><input class="yy-input" type="number" min="0" step="0.0001" data-import-row-yy="${escapeAttribute(row.rowId)}" value="${formatYY(row.yy)}"></td><td class="number-cell">${escapeHtml(status.label)}</td>${materials.map(() => "<td class=\"number-cell\">—</td>").join("")}<td><button type="button" class="mini-button danger" data-import-row-delete="${escapeAttribute(row.rowId)}">X</button></td>`;
    appendCoatingControl(tr.children[2], getRowComposition(row), row.polyesterCoating, row.rowId, (value) => {
      commitWorkspaceChange(() => { row.polyesterCoating = value; draft.dirty = true; });
    });
    tr.querySelectorAll("input:not([type=radio])").forEach((input) => { input.addEventListener("focus", () => { inputHistoryBefore = workspaceSnapshot(); }); input.addEventListener("blur", finalizeInputHistory); });
    tr.querySelector("[data-import-row-fabric]").addEventListener("change", updateImportDraftRow);
    tr.querySelector("[data-import-row-composition]").addEventListener("change", updateImportDraftRow);
    tr.querySelector("[data-import-row-yy]").addEventListener("input", updateImportDraftRow);
    tr.querySelector("[data-import-row-delete]").addEventListener("click", () => deleteImportDraftRow(row.rowId));
    tr.querySelector("[data-compose-row]").addEventListener("click", () => openCompositionBuilder({ kind: "draft", rowId: row.rowId }, getRowComposition(row) || { label: compositionLabel, components: {} }));
    tr.querySelector("[data-add-fabric-db]")?.addEventListener("click", () => addImportedFabricToDb(row.rowId));
    els.fabricTableBody.append(tr);
  });
}
function finalizeInputHistory() { if (!inputHistoryBefore) return; const before = JSON.stringify(inputHistoryBefore); const after = JSON.stringify(workspaceSnapshot()); if (before !== after) { undoStack.push(inputHistoryBefore); redoStack = []; updateHistoryButtons(); } inputHistoryBefore = null; }
function updateImportDraftRow(event) {
  const rowId = event.target.dataset.importRowFabric || event.target.dataset.importRowComposition || event.target.dataset.importRowYy; const row = activeDraft()?.rows.find((item) => item.rowId === rowId); if (!row) return;
  const tr = event.target.closest("tr"); const fabricValue = tr.querySelector("[data-import-row-fabric]").value.trim(); const compositionValue = getEditedRowCompositionLabel(row, tr.querySelector("[data-import-row-composition]").value.trim()); const yy = numericUsage(tr.querySelector("[data-import-row-yy]").value);
  const fabric = appState.fabrics.find((item) => fabricMatchingKey(item.name) === fabricMatchingKey(fabricValue));
  const composition = appState.compositions.find((item) => normalizeText(item.label) === normalizeText(compositionValue));
  row.fabricId = fabric?.id || null; row.fabricName = fabric?.name || fabricValue; row.compositionId = fabric?.compositionId || composition?.id || null; row.composition = fabric ? getCompositionLabel(fabric.compositionId) : compositionValue; row.compositionDefinition = fabric ? clone(getComposition(fabric.compositionId)) : composition ? clone(composition) : row.compositionDefinition?.label === compositionValue ? row.compositionDefinition : null; row.yy = yy;
  const resolved = Boolean(getRowComposition(row)?.components);
  markRowReviewState(row, resolved, resolved ? "MANUAL" : null);
  if (resolved && composition?.id) autoRegisterFabricFromManualReview(row);
  rebuildDraftYy(activeDraft());
  if (event.target.dataset.importRowYy) { refreshFabricCalculations(); return; }
  renderFabricTable();
}
function markRowReviewState(row, reviewed, resolutionType = null) { row.importStatus = { ...(row.importStatus || {}), originalConfidence: row.importStatus?.originalConfidence || row.confidence || "UNMATCHED", matchScore: row.importStatus?.matchScore ?? row.matchScore ?? 0, reviewRequired: !reviewed, reviewed: Boolean(reviewed), resolvedByUser: reviewed ? true : Boolean(row.importStatus?.resolvedByUser), resolutionType: reviewed ? (resolutionType || row.importStatus?.resolutionType || "MANUAL") : null }; }
function getImportRowStatus(row) {
  const status = row?.importStatus || {};
  if (status.reviewRequired) return { label: "REVIEW REQUIRED", badge: "REVIEW REQUIRED", badgeClass: "", className: "review-required-row match-unmatched" };
  if (status.resolvedByUser) return { label: "MANUAL", badge: "MANUAL", badgeClass: "manual-badge", className: "row-manual" };
  const confidence = status.originalConfidence || row?.confidence || "";
  return { label: confidence, badge: "", badgeClass: "", className: `match-${confidence.toLowerCase()}` };
}
function autoRegisterFabricFromManualReview(row) {
  if (!row?.fabricName || !row.compositionId || row.fabricId) return;
  const composition = appState.compositions.find((item) => item.id === row.compositionId);
  if (!composition?.components || Math.abs(Object.values(composition.components).reduce((sum, value) => sum + Number(value || 0), 0) - 100) > 1e-6) return;
  const existing = appState.fabrics.find((item) => fabricMatchingKey(item.name) === fabricMatchingKey(row.fabricName));
  if (existing) {
    if (existing.compositionId === composition.id) { row.fabricId = existing.id; row.compositionDefinition = clone(composition); return; }
    showMessage("Fabric DB에 동일한 원단명이 있지만 Composition이 다릅니다.", "error");
    return;
  }
  const fabric = { id: uniqueId("fabric_manual", appState.fabrics.map((item) => item.id)), name: row.fabricName, compositionId: composition.id, order: nextOrder(appState.fabrics) };
  appState.fabrics.push(fabric); row.fabricId = fabric.id; row.compositionDefinition = clone(composition); saveStore(); renderAutocompleteLists(); showMessage(`${row.fabricName}가 Fabric DB에 자동 등록되었습니다.`);
}
function addImportedFabricToDb(rowId) { const row = activeDraft()?.rows.find((item) => item.rowId === rowId); const composition = getRowComposition(row); if (!row?.fabricName || !composition?.components) { showMessage("Fabric Name과 계산 가능한 Composition을 먼저 입력하세요.", "error"); return; } let compositionId = composition.id; if (!compositionId) { compositionId = uniqueId(slugify(composition.label), appState.compositions.map((item) => item.id)); appState.compositions.push({ id: compositionId, label: composition.label, components: clone(composition.components) }); } const fabric = { id: uniqueId("fabric_import", appState.fabrics.map((item) => item.id)), name: row.fabricName, compositionId, order: nextOrder(appState.fabrics) }; appState.fabrics.push(fabric); row.fabricId = fabric.id; row.compositionId = compositionId; row.compositionDefinition = clone(getComposition(compositionId)); markRowReviewState(row, true); saveStore(); rebuildDraftYy(activeDraft()); renderAll(); }

function openCompositionBuilder(target, initial = {}) { compositionBuilderTarget = target; compositionBuilderState = { label: initial.label || "", rows: Object.entries(initial.components || {}).map(([materialId, ratio]) => ({ materialId, ratio })), nameEdited: Boolean(initial.label) }; if (!compositionBuilderState.rows.length) compositionBuilderState.rows.push({ materialId: getMaterials()[0]?.id || "", ratio: "" }); renderCompositionBuilder(); els.compositionBuilderModal.classList.remove("hidden"); }
function closeCompositionBuilder() { compositionBuilderTarget = null; compositionBuilderState = null; els.compositionBuilderModal.classList.add("hidden"); }
function materialLabelForComposition(material) { return String(material.name || "").replace(/\s*\(COATED\)|\s*\(UNCOATED\)/g, ""); }
function suggestCompositionName(rows) { return rows.map((item) => { const material = appState.materials.find((m) => m.id === item.materialId); const ratio = Number(item.ratio); return material && Number.isFinite(ratio) && ratio > 0 ? `${materialLabelForComposition(material)}${ratio}%` : ""; }).filter(Boolean).join("+"); }
function renderCompositionBuilder() { const state = compositionBuilderState; els.compositionBuilderName.value = state.label || suggestCompositionName(state.rows); els.compositionBuilderRows.innerHTML = state.rows.map((item, index) => `<tr class="composition-builder-row"><td><select title="${escapeAttribute(getMaterials().find((m) => m.id === item.materialId)?.name || "Material 선택")}" data-builder-material="${index}"><option value="">Material 선택</option>${getMaterials().map((m) => `<option value="${escapeAttribute(m.id)}" ${m.id === item.materialId ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}</select></td><td class="ratio-cell"><input type="number" min="0" max="100" step="0.01" data-builder-ratio="${index}" value="${item.ratio}"><span>%</span></td><td class="action-cell"><button type="button" class="mini-button danger" data-builder-delete="${index}">X</button></td></tr>`).join(""); const total = state.rows.reduce((sum, item) => sum + (Number(item.ratio) || 0), 0); els.compositionBuilderTotal.textContent = `Total: ${formatNumber(total, 2)}%`; els.compositionBuilderTotal.className = total === 100 ? "ok-text" : "error-text"; els.compositionBuilderError.classList.toggle("hidden", total === 100); els.compositionBuilderRows.querySelectorAll("[data-builder-material]").forEach((input) => input.addEventListener("change", () => { state.rows[Number(input.dataset.builderMaterial)].materialId = input.value; state.label = ""; renderCompositionBuilder(); })); els.compositionBuilderRows.querySelectorAll("[data-builder-ratio]").forEach((input) => input.addEventListener("input", () => { state.rows[Number(input.dataset.builderRatio)].ratio = input.value; state.label = ""; renderCompositionBuilder(); })); els.compositionBuilderRows.querySelectorAll("[data-builder-delete]").forEach((button) => button.addEventListener("click", () => { state.rows.splice(Number(button.dataset.builderDelete), 1); renderCompositionBuilder(); })); els.compositionBuilderName.oninput = () => { state.label = els.compositionBuilderName.value; state.nameEdited = true; }; }
function builtComposition() { const total = compositionBuilderState.rows.reduce((sum, item) => sum + (Number(item.ratio) || 0), 0); if (Math.abs(total - 100) > 1e-6) { els.compositionBuilderError.classList.remove("hidden"); return null; } const components = {}; compositionBuilderState.rows.forEach((item) => { if (item.materialId && Number(item.ratio) > 0) components[item.materialId] = Number(item.ratio); }); const label = els.compositionBuilderName.value.trim() || suggestCompositionName(compositionBuilderState.rows); return { label, components, source: "temporary" }; }
function applyBuiltComposition(saveToDb) { const composition = builtComposition(); if (!composition) { showMessage("Composition total must equal 100%.", "error"); return; } if (saveToDb) { const existing = appState.compositions.find((item) => normalizeText(item.label) === normalizeText(composition.label)); if (existing) { composition.id = existing.id; composition.source = "db"; } else { composition.id = uniqueId(slugify(composition.label), appState.compositions.map((item) => item.id)); composition.source = "db"; appState.compositions.push({ id: composition.id, label: composition.label, components: clone(composition.components) }); saveStore(); } renderAutocompleteLists(); } applyCompositionToTarget(composition); closeCompositionBuilder(); }
function applyCompositionToTarget(composition) { if (compositionBuilderTarget?.kind === "draft") { commitWorkspaceChange(() => { const row = activeDraft().rows.find((item) => item.rowId === compositionBuilderTarget.rowId); if (!row) return; row.compositionDefinition = clone(composition); row.compositionId = composition.id || null; row.composition = composition.label; markRowReviewState(row, true, "MANUAL"); if (composition.id) autoRegisterFabricFromManualReview(row); rebuildDraftYy(activeDraft()); }); } else if (compositionBuilderTarget?.kind === "preview") { const row = pendingUpload?.files?.[compositionBuilderTarget.fileIndex]?.rows?.[compositionBuilderTarget.rowIndex]; if (row) { row.compositionDefinition = clone(composition); row.composition = composition.label; row.compositionUserConfirmed = true; renderStyleUploadPreview(); } } }
function openMaterialBuilder() { els.builderMaterialName.value = ""; els.builderMaterialInternalLabel.value = ""; els.builderMaterialUsLabel.value = ""; els.builderMaterialEuLabel.value = ""; els.materialBuilderModal.classList.remove("hidden"); }
function closeMaterialBuilder() { els.materialBuilderModal.classList.add("hidden"); }
function saveBuilderMaterial() { const name = els.builderMaterialName.value.trim(); if (!name) { showMessage("Material Name을 입력하세요.", "error"); return; } const id = uniqueId(slugify(name), appState.materials.map((m) => m.id)); appState.materials.push({ id, name, order: nextOrder(appState.materials) }); appState.careLabelMappings = normalizeCareLabelMappings(appState.careLabelMappings); const internal = els.builderMaterialInternalLabel.value.trim(); const us = els.builderMaterialUsLabel.value.trim(); const eu = els.builderMaterialEuLabel.value.trim(); if (internal) appState.careLabelMappings.internal[id].label = internal.toUpperCase(); if (us) appState.careLabelMappings.us[id].label = us.toUpperCase(); if (eu) appState.careLabelMappings.eu[id].label = eu.toUpperCase(); saveStore(); closeMaterialBuilder(); renderCompositionBuilder(); }
function rebuildDraftYy(draft) { draft.yyByFabricId = {}; (draft.rows || []).forEach((row) => { if (row.fabricId && parseYy(row.yy) > 0) draft.yyByFabricId[row.fabricId] = (draft.yyByFabricId[row.fabricId] || 0) + parseYy(row.yy); }); currentYyByFabricId = { ...draft.yyByFabricId }; draft.dirty = true; }
function addDraftFabricRow() { const draft = activeDraft(); if (!draft || draft.sourceType !== "import") return; commitWorkspaceChange(() => { draft.rows.push({ rowId: `row_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, fabricId: null, fabricName: "", compositionId: null, composition: "", compositionDefinition: null, yy: "", confidence: "UNMATCHED", importStatus: { originalConfidence: "UNMATCHED", matchScore: 0, reviewRequired: true, reviewed: false }, source: {} }); }); }
function deleteImportDraftRow(rowId) { commitWorkspaceChange(() => { const draft = activeDraft(); draft.rows = draft.rows.filter((row) => row.rowId !== rowId); rebuildDraftYy(draft); }); }

function handleYyInput(event) {
  const fabricId = event.target.dataset.fabricId;
  const yy = parseYy(event.target.value);
  if (yy > 0) currentYyByFabricId[fabricId] = yy;
  else delete currentYyByFabricId[fabricId];
  syncActiveDraft();
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
  syncActiveDraft();
  return {
    name: normalizeStyleName(els.styleNameInput.value),
    yyByFabricId: { ...currentYyByFabricId },
    coatingByFabricId: clone(activeDraft()?.coatingByFabricId || {}),
    rows: activeDraft()?.sourceType === "import" ? clone(activeDraft().rows) : undefined,
  };
}

function getCurrentCalculation() {
  return calculateStyle(getCurrentStyle());
}

function updateSummary(existingCalculation) {
  const calculation = existingCalculation?.totals ? existingCalculation : getCurrentCalculation();
  els.currentStyleLabel.textContent = calculation.styleName || "-";
  els.totalYyLabel.textContent = formatNumber(calculation.totalYy, 3);
  if (els.summaryReviewWarning) {
    els.summaryReviewWarning.classList.toggle("hidden", !calculation.reviewCount);
    els.summaryReviewWarning.innerHTML = calculation.reviewCount ? `⚠ 현재 혼용률은 임시 결과입니다.<br>미확인 원단 ${calculation.reviewCount}건 · Unresolved YY ${formatYY(calculation.unresolvedYy)}` : "";
  }
  els.summaryTableBody.innerHTML = "";
  getMaterials().forEach((material) => {
    els.summaryTableBody.append(createSummaryRow(material.name, formatPercent(calculation.totals[material.id], 2)));
  });
  els.summaryTableBody.append(createSummaryRow("Total", formatPercent(calculation.grandTotal, 2), true));
  renderCurrentCareLabelGenerator(calculation);
}

function createSummaryRow(label, value, isTotal = false) {
  const tr = document.createElement("tr");
  if (isTotal) tr.classList.add("total-row");
  tr.innerHTML = `<td>${escapeHtml(label)}</td><td>${value}</td>`;
  return tr;
}

function renderCurrentCareLabelGenerator(calculation) {
  if (!els.currentCareLabelArea) return;
  const options = { ...getCareLabelOptionsFromUi(), includeInternal: false, includeUs: true, includeEu: true, singleLine: false };
  const labels = ["us", "eu"].map((mode) => generateCareLabel(calculation.totals, mode, options));
  els.currentCareLabelArea.innerHTML = `
    <section class="live-care-generator">
      <h3>CARE LABEL AUTO GENERATOR</h3>
      ${calculation.reviewCount ? '<p class="live-care-warning">⚠ 미확인 원단이 있어 최종 CARE LABEL로 사용할 수 없습니다.</p>' : ""}
      ${labels.map((label) => `
        <article class="live-care-card">
          <strong>${escapeHtml(label.title)}</strong>
          <pre>${escapeHtml(label.text)}</pre>
          ${label.warnings.length ? `<p class="live-care-warning">${escapeHtml(label.warnings[0])}</p>` : ""}
          ${label.notes.length ? `<p class="live-care-note">${escapeHtml(label.notes[0])}</p>` : ""}
        </article>
      `).join("")}
    </section>
  `;
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
  newDraft(style, { rows: style.rows || [], sourceType: Array.isArray(style.rows) ? "import" : "manual", dirty: false });
  els.styleNameInput.value = style.name;
  currentYyByFabricId = sanitizeYyMap(style.yyByFabricId);
  renderStyleDraftList();
  renderFabricTable();
  renderSavedStyles();
  activateTab("styleInput");
}

function newStyle() {
  syncActiveDraft();
  newDraft();
  els.styleNameInput.value = "";
  currentYyByFabricId = {};
  els.fabricSearchInput.value = "";
  renderFabricTable();
  renderSavedStyles();
  renderStyleDraftList();
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
  const draft = activeDraft();
  if (draft) { draft.styleName = style.name; draft.dirty = false; draft.yyByFabricId = { ...style.yyByFabricId }; }
  saveStore();
  renderSavedStyles();
  renderStyleDraftList();
  showMessage("저장되었습니다.");
}

function clearYy() {
  if (!confirm("현재 화면의 YY 입력값을 모두 지울까요? 저장된 데이터는 저장 버튼을 누르기 전까지 변경되지 않습니다.")) return;
  currentYyByFabricId = {};
  syncActiveDraft();
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
  const options = getCareLabelOptionsFromUi();
  styles.forEach((style) => {
    const calculation = calculateStyle(style);
    const careLabels = getSelectedCareLabelModes(options).map((mode) => generateCareLabel(calculation.totals, mode, options));
    const section = document.createElement("section");
    section.className = "result-section";
    section.innerHTML = `
      <h3>STYLE / ${escapeHtml(style.name)}</h3>
      ${options.showPreview ? renderCareLabelPreview(careLabels, options) : ""}
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

function renderCareLabelPreview(careLabels, options) {
  if (!careLabels.length) return "";
  return `
    <section class="care-label-preview">
      <h4>CARE LABEL AUTO GENERATOR</h4>
      <div class="care-label-grid">
        ${careLabels.map((label) => `
          <article class="care-label-card">
            <div class="care-label-card-head">
              <strong>${escapeHtml(label.title)}</strong>
              <button type="button" class="mini-button" data-copy-care-label="${escapeAttribute(encodeURIComponent(label.text))}">Copy</button>
            </div>
            <pre>${escapeHtml(label.text)}</pre>
            ${options.includeWarnings && label.warnings.length ? `<div class="care-label-message warning"><strong>Warnings</strong>${label.warnings.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div>` : ""}
            ${label.notes.length ? `<div class="care-label-message note"><strong>Notes</strong>${label.notes.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

async function handleResultAreaClick(event) {
  const button = event.target.closest("[data-copy-care-label]");
  if (!button) return;
  const text = decodeURIComponent(button.dataset.copyCareLabel || "");
  try {
    await navigator.clipboard.writeText(text);
    showMessage("CARE LABEL 문구를 복사했습니다.");
  } catch {
    showMessage("복사에 실패했습니다. 브라우저 권한을 확인하세요.", "error");
  }
}

function renderDbManagement() {
  renderMaterialDb();
  renderCompositionDb();
  renderFabricDb();
  renderCareMappingDb();
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
  const id = uniqueId(slugify(cleanName), appState.materials.map((item) => item.id));
  appState.materials.push({ id, name: cleanName, order: nextOrder(appState.materials) });
  CARE_LABEL_MODES.forEach((mode) => {
    appState.careLabelMappings[mode][id] = { label: cleanName, type: "fiber", active: true };
  });
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
        <table class="data-table compact-table composition-components-table">
          <thead><tr class="composition-component-row"><th>Material</th><th>Ratio</th><th>Action</th></tr></thead>
          <tbody>
            ${Object.entries(composition.components || {}).map(([materialId, ratio]) => `
              <tr class="composition-component-row">
                <td>
                  <select class="material-select" title="${escapeAttribute(getMaterialName(materialId))}" data-db-input data-component-material="${escapeAttribute(composition.id)}" data-old-material="${escapeAttribute(materialId)}">
                    ${materials.map((material) => `<option value="${escapeAttribute(material.id)}" ${material.id === materialId ? "selected" : ""}>${escapeHtml(material.name)}</option>`).join("")}
                  </select>
                </td>
                <td><input class="component-ratio-input" data-db-input data-component-ratio="${escapeAttribute(composition.id)}" data-material-id="${escapeAttribute(materialId)}" type="number" min="0.001" max="100" step="0.001" value="${Number(ratio)}"></td>
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

function renderCareMappingDb() {
  if (!els.careMappingTableBody) return;
  appState.careLabelMappings = normalizeCareLabelMappings(appState.careLabelMappings);
  els.careMappingTableBody.innerHTML = getMaterials().map((material) => {
    const internal = appState.careLabelMappings.internal[material.id];
    const us = appState.careLabelMappings.us[material.id];
    const eu = appState.careLabelMappings.eu[material.id];
    return `
      <tr>
        <td><strong>${escapeHtml(material.name)}</strong><br><span class="muted-cell">${escapeHtml(material.id)}</span></td>
        <td><input data-db-input data-care-label-mode="internal" data-care-label-field="label" data-material-id="${escapeAttribute(material.id)}" type="text" value="${escapeAttribute(internal.label)}"></td>
        <td>${careTypeSelect("internal", material.id, internal.type)}</td>
        <td><input data-db-input data-care-label-mode="us" data-care-label-field="label" data-material-id="${escapeAttribute(material.id)}" type="text" value="${escapeAttribute(us.label)}"></td>
        <td>${careTypeSelect("us", material.id, us.type)}</td>
        <td><input data-db-input data-care-label-mode="us" data-care-label-field="functionalSignificance" data-material-id="${escapeAttribute(material.id)}" type="checkbox" ${us.functionalSignificance ? "checked" : ""}></td>
        <td><input data-db-input data-care-label-mode="eu" data-care-label-field="label" data-material-id="${escapeAttribute(material.id)}" type="text" value="${escapeAttribute(eu.label)}"></td>
        <td>${careTypeSelect("eu", material.id, eu.type)}</td>
        <td>
          ${CARE_LABEL_MODES.map((mode) => `
            <label class="inline-check"><input data-db-input data-care-label-mode="${mode}" data-care-label-field="active" data-material-id="${escapeAttribute(material.id)}" type="checkbox" ${appState.careLabelMappings[mode][material.id].active !== false ? "checked" : ""}> ${mode.toUpperCase()}</label>
          `).join("")}
        </td>
      </tr>
    `;
  }).join("");
  els.careMappingTableBody.querySelectorAll("[data-care-label-field]").forEach((input) => input.addEventListener("change", updateCareLabelMapping));
  els.careMappingTableBody.querySelectorAll('input[type="text"][data-care-label-field]').forEach((input) => input.addEventListener("input", updateCareLabelMapping));
  updateDbModeUi();
}

function careTypeSelect(mode, materialId, value) {
  return `
    <select data-db-input data-care-label-mode="${mode}" data-care-label-field="type" data-material-id="${escapeAttribute(materialId)}">
      ${CARE_LABEL_TYPES.map((type) => `<option value="${type}" ${type === value ? "selected" : ""}>${type}</option>`).join("")}
    </select>
  `;
}

function updateCareLabelMapping(event) {
  if (!dbEditMode) return;
  const { careLabelMode: mode, careLabelField: field, materialId } = event.target.dataset;
  const mapping = appState.careLabelMappings?.[mode]?.[materialId];
  if (!mapping) return;
  if (field === "label") mapping.label = event.target.value.trim().toUpperCase();
  if (field === "type") mapping.type = event.target.value;
  if (field === "functionalSignificance") mapping.functionalSignificance = event.target.checked;
  if (field === "active") mapping.active = event.target.checked;
  updateSummary();
}

function resetCareLabelMappings() {
  if (!dbEditMode || !confirm("CARE LABEL mapping을 기본값으로 복원할까요?")) return;
  appState.careLabelMappings = normalizeCareLabelMappings(DEFAULT_CARE_LABEL_MAPPINGS);
  renderCareMappingDb();
  updateSummary();
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
  CARE_LABEL_MODES.forEach((mode) => {
    const mappings = appState.careLabelMappings?.[mode] || {};
    appState.materials.forEach((material) => {
      const mapping = mappings[material.id];
      if (!mapping) errors.push(`${mode.toUpperCase()} mapping 누락: ${material.name}`);
      if (mapping && !String(mapping.label || "").trim()) errors.push(`${mode.toUpperCase()} label이 비어 있습니다: ${material.name}`);
      if (mapping && !CARE_LABEL_TYPES.includes(mapping.type)) errors.push(`${mode.toUpperCase()} type을 선택하세요: ${material.name}`);
    });
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
      const nextStore = parsed.version === STORAGE_VERSION ? parsed : migrateToV3(parsed);
      normalizeV3Store(nextStore);
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
  const reviewCount = getStylesReviewCount(styles);
  if (reviewCount && !confirm(`현재 선택한 스타일에 검토되지 않은 원단이 ${reviewCount}개 있습니다.\n이 상태로 추출하시겠습니까?`)) return;
  const careLabelErrors = validateCareLabelsForExport(styles);
  if (careLabelErrors.length) {
    showMessage(careLabelErrors[0], "error");
    return;
  }
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

function getStylesReviewCount(styles) {
  return (styles || []).reduce((count, style) => count + calculateStyle(style).reviewCount, 0);
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
  const lastColumn = 5 + materials.length;
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
  ["STYLE", "Total YY", ...materials.map((material) => material.name), "Total", "US CARE LABEL", "EU CARE LABEL"].forEach((header, index) => setCell(sheet, headerRow, index + 1, header, tableHeaderStyle()));
  sheet.getRow(headerRow).height = 26;
  entries.forEach((entry, index) => {
    const rowNumber = headerRow + index + 1;
    const careLabels = createExportCareLabels(entry.calculation);
    setCell(sheet, rowNumber, 1, entry.style.name, dataCellStyle(null, "left"));
    setCell(sheet, rowNumber, 2, entry.calculation.totalYy, dataCellStyle("0.000", "right"));
    materials.forEach((material, materialIndex) => {
      setCell(sheet, rowNumber, materialIndex + 3, entry.calculation.totals[material.id], dataCellStyle("0.00%", "right"));
    });
    setCell(sheet, rowNumber, 3 + materials.length, 1, dataCellStyle("0.00%", "right"));
    setCell(sheet, rowNumber, 4 + materials.length, careLabels.us.text.replace(/\n/g, " / "), dataCellStyle(null, "left"));
    setCell(sheet, rowNumber, 5 + materials.length, careLabels.eu.text.replace(/\n/g, " / "), dataCellStyle(null, "left"));
    sheet.getRow(rowNumber).height = 42;
  });
  sheet.columns = [{ width: 36 }, { width: 12 }, ...materials.map(() => ({ width: 18 })), { width: 12 }, { width: 42 }, { width: 42 }];
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
  if (calculation.reviewCount) {
    setCell(sheet, 4, 1, "REVIEW REQUIRED", infoLabelStyle());
    setCell(sheet, 4, 2, `${calculation.reviewCount} unresolved material(s), YY ${formatYY(calculation.unresolvedYy)}`, infoValueStyle());
  }

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

  addCareLabelBlocks(sheet, entry, summaryHeaderRow, materials.length + 2, lastColumn);

  sheet.columns = [{ width: 55 }, { width: 36 }, { width: 10 }, { width: 10 }, ...materials.map(() => ({ width: 18 }))];
  sheet.autoFilter = { from: { row: detailHeaderRow, column: 1 }, to: { row: detailHeaderRow + Math.max(calculation.usedRows.length, 1), column: lastColumn } };
}

function createExportCareLabels(calculation) {
  const options = { ...getCareLabelOptionsFromUi(), singleLine: false, includeWarnings: true };
  return {
    us: generateCareLabel(calculation.totals, "us", options),
    eu: generateCareLabel(calculation.totals, "eu", options),
  };
}

function validateCareLabelsForExport(styles) {
  const errors = [];
  styles.forEach((style) => {
    const calculation = calculateStyle(style);
    const labels = createExportCareLabels(calculation);
    Object.values(labels).forEach((label) => {
      if (!label.isValid) errors.push(`${style.name}: ${label.title} integer total is ${label.totalPercent}%, expected 100%.`);
    });
  });
  return errors;
}

/* Excel import ---------------------------------------------------------- */
function normalizeText(value) {
  return String(value ?? "").replace(/[\r\n\t\u3000]+/g, " ").replace(/^[\s\-_:;,.]+|[\s\-_:;,.]+$/g, "").replace(/\s+/g, " ").trim().toUpperCase();
}
function fabricMatchingKey(value) {
  return normalizeText(value).replace(/[\s\-_/,.:]/g, "").replace(/\(\s*/g, "(").replace(/\s*\)/g, ")");
}
function tokens(value) { return normalizeText(value).match(/[A-Z]+|\d+(?:\.\d+)?/g) || []; }
function levenshtein(a, b) {
  if (a === b) return 0; const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) { let prev = i; for (let j = 1; j <= b.length; j += 1) { const old = row[j]; row[j] = Math.min(row[j] + 1, prev + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = old; } } return row[b.length];
}
function matchFabric(source) {
  const raw = normalizeText(source); const key = fabricMatchingKey(source); const sourceTokens = tokens(source); const numberTokens = sourceTokens.filter((x) => /^\d/.test(x));
  let best = null;
  appState.fabrics.forEach((fabric) => {
    const candidateKey = fabricMatchingKey(fabric.name); const candidateTokens = tokens(fabric.name); const candidateNumbers = candidateTokens.filter((x) => /^\d/.test(x));
    let score = key === candidateKey ? 1 : 0;
    if (!score) {
      const overlap = sourceTokens.filter((t) => candidateTokens.includes(t)).length / Math.max(sourceTokens.length, candidateTokens.length, 1);
      const similarity = 1 - levenshtein(key, candidateKey) / Math.max(key.length, candidateKey.length, 1);
      const contains = key.includes(candidateKey) || candidateKey.includes(key) ? .88 : 0;
      score = Math.max(contains, similarity * .62 + overlap * .38);
      // A complete candidate embedded in a longer printed-material description is stronger
      // evidence than unrelated style numbers that also appear in that description.
      if (!(key.includes(candidateKey) || candidateKey.includes(key)) && numberTokens.length && !numberTokens.every((n) => candidateNumbers.includes(n))) score *= .42;
    }
    if (!best || score > best.score) best = { fabric, score };
  });
  if (!best || best.score < .55) return { fabric: null, score: best?.score || 0, confidence: "UNMATCHED", matchType: "UNMATCHED" };
  return { ...best, confidence: best.score === 1 ? "EXACT" : best.score >= .88 ? "HIGH" : best.score >= .72 ? "MEDIUM" : "LOW", matchType: best.score === 1 ? "EXACT" : "FUZZY" };
}
function numericUsage(value) { const clean = String(value ?? "").trim().replace(/,/g, ""); if (!clean || /^(?:-|N\/?A)$/i.test(clean)) return 0; const n = Number(clean); return Number.isFinite(n) && n > 0 ? n : 0; }
function sheetMatrix(sheet) {
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
  // SheetJS returns the value only at the anchor of a merged range.  Keeping that
  // address (rather than copying it into every visual cell) prevents a merged NET
  // or consumption value from being counted more than once.
  return matrix;
}
function cellContains(value, word) { return normalizeText(value).includes(normalizeText(word)); }
function isAccessory(text) { return /(TPR|ZIPPER|BUTTON|LABEL|WEBBING|TAPE|HOOK|BUCKLE|VELCRO|ELASTIC|BEMIS|RHEON)/.test(normalizeText(text)); }
function typeFromMatrix(matrix, fileName) {
  const text = matrix.slice(0, 80).flat().map(normalizeText).join(" |");
  if (text.includes("자재별 패턴부위".toUpperCase()) && text.includes("소요량")) return "PANT";
  if (text.includes("원단명") && text.includes("원단 소요량".toUpperCase())) return "JERSEY";
  if (text.includes("자 재") && text.includes("NET") && text.includes("S/F")) return "GLOVE";
  return "UNKNOWN";
}
function sizeAt(matrix, rowIndex) { for (let r = rowIndex; r >= Math.max(0, rowIndex - 25); r -= 1) { const text = matrix[r].map(normalizeText).join(" "); const hit = text.match(/SIZE\s*[:：]?\s*([^|]+)|SIZE\s+([^|]+)/); if (hit) return normalizeText(hit[1] || hit[2]); } return "DEFAULT"; }
function styleNameFromWorkbook(workbook, fileName) {
  for (const name of workbook.SheetNames) { const matrix = sheetMatrix(workbook.Sheets[name]); for (const row of matrix.slice(0, 8)) { const line = row.map(String).join(" "); const hit = line.match(/(?:스타일|STYLE)\s*[:：]?\s*([A-Z0-9 #_-]+(?:PANT|JERSEY|GLOVE)[A-Z0-9 #_-]*)/i) || line.match(/(?:FLY RACING\s*[- ]*)?(#?\s*\d+\s+EVO\s+(?:PANT|JERSEY|GLOVE))/i); if (hit) return cleanStyleName(hit[1]); } }
  return cleanStyleName(fileName.replace(/\.[^.]+$/, ""));
}
function cleanStyleName(value) { return String(value).replace(/FLY RACING/ig, "").replace(/#/g, " ").replace(/\d+차|소요량|\b\d{6,8}\b|\(\s*\d+\s*=\s*XL\s*\)|\(\s*\d+\s*\)|\(\s*\d{1,2}\.\d{1,2}\s*\)|\(\s*XL\s*\)|\bL\d+\b/ig, " ").replace(/\s+/g, " ").trim().replace(/^[- ]+|[- ]+$/g, ""); }
function headerColumn(row, predicate) { return row.findIndex((cell) => predicate(normalizeText(cell))); }
function makeRecord(material, usage, sizeGroup, sheet, row, col, parsedType) {
  const match = matchFabric(material);
  return { material: String(material).trim(), usage, sizeGroup, section: sheet, sourceCell: `${sheet}!R${row + 1}C${col + 1}`, sourceSheet: sheet, parsedType, matchedFabricId: match.fabric?.id || null, matchedFabricName: match.fabric?.name || "", composition: match.fabric ? getCompositionLabel(match.fabric.compositionId) : "", matchScore: match.score, confidence: match.confidence, matchType: match.matchType, importMatch: { confidence: match.confidence, score: match.score, rule: match.matchType, resolvedByUser: false } };
}
function parsePant(matrix, sheetName) {
  const records = []; let materialCol = -1; let usageCol = -1; let currentSize = "DEFAULT";
  matrix.forEach((row, r) => {
    const joined = row.map(normalizeText).join("|");
    if (joined.includes("자재별 패턴부위".toUpperCase())) { materialCol = headerColumn(row, (v) => v.includes("자재별")); usageCol = headerColumn(row, (v) => v === "소요량"); return; }
    const sizeText = row.map(normalizeText).join(" "); if (sizeText.includes("SIZE")) currentSize = sizeAt(matrix, r);
    if (materialCol < 0 || usageCol < 0) return;
    const material = String(row[materialCol] || "").trim(); const usage = numericUsage(row[usageCol]);
    if (!material || !usage || /^(SIZE|디지털 프린트|\d+$)/i.test(material) || /^\d+\s*(?:=>|→|=)\s*\d+/.test(material)) return;
    const match = matchFabric(material); if (!match.fabric && isAccessory(material)) return;
    records.push(makeRecord(material, usage, currentSize, sheetName, r, usageCol, "PANT"));
  }); return records;
}
function isNetFabricUsageHeader(text) { const n = normalizeText(text); return (n.includes("원단 소요량") || n.includes("소요량")) && !/(LOSS|로스|포함)/.test(n); }
function resolveJerseySection(row, matrix, headerRowIndex, sheetName) {
  const materialColumnIndex = headerColumn(row, (v) => v === "원단명");
  const usageCandidates = row.map((cell, index) => ({ cell, index, n: normalizeText(cell) })).filter(({ cell }) => isNetFabricUsageHeader(cell));
  usageCandidates.sort((a, b) => { const rank = (x) => x.n === "원단 소요량 (YD)" ? 0 : x.n === "원단 소요량" ? 1 : x.n.includes("원단 소요량") ? 2 : 3; return rank(a) - rank(b) || a.index - b.index; });
  return { materialColumnIndex, netUsageColumnIndex: usageCandidates[0]?.index ?? -1, lossColumnIndex: headerColumn(row, (v) => /(LOSS|로스)/.test(v) && !v.includes("포함")), lossIncludedColumnIndex: headerColumn(row, (v) => /(LOSS|로스|포함)/.test(v) && v.includes("소요량")), sizeGroup: `${sheetName}:${sizeAt(matrix, headerRowIndex)}`, headerRowIndex };
}
function parseJersey(matrix, sheetName) {
  const records = []; let section = null;
  matrix.forEach((row, rowIndex) => {
    const text = row.map(normalizeText).join("|");
    if (text.includes("부자재")) { section = null; return; }
    if (text.includes("원단명")) { section = resolveJerseySection(row, matrix, rowIndex, sheetName); return; }
    if (!section || section.materialColumnIndex < 0 || section.netUsageColumnIndex < 0) return;
    const material = String(row[section.materialColumnIndex] || "").trim();
    // The resolved header index is the only permitted source for YY.
    const usage = numericUsage(row[section.netUsageColumnIndex]);
    if (!material || !usage) return;
    const match = matchFabric(material); if (!match.fabric && isAccessory(material)) return;
    records.push({ ...makeRecord(material, usage, section.sizeGroup, sheetName, rowIndex, section.netUsageColumnIndex, "JERSEY"), header: section });
  }); return records;
}
function parseGlove(matrix, sheetName) {
  const records = []; let materialCol = -1; let netCol = -1; let currentMaterial = ""; let group = "DEFAULT";
  matrix.forEach((row, r) => {
    const text = row.map(normalizeText).join("|");
    if (text.includes("NET") && text.includes("S/F") && text.includes("자 재")) { materialCol = headerColumn(row, (v) => v.replace(/\s/g, "") === "자재"); netCol = headerColumn(row, (v) => v === "NET"); group = sizeAt(matrix, r); return; }
    if (materialCol < 0 || netCol < 0) return;
    if (String(row[materialCol] || "").trim()) currentMaterial = String(row[materialCol]).trim();
    const usage = numericUsage(row[netCol]); if (!currentMaterial || !usage) return;
    const match = matchFabric(currentMaterial); if (!match.fabric && isAccessory(currentMaterial)) return;
    records.push(makeRecord(currentMaterial, usage, group, sheetName, r, netCol, "GLOVE"));
  }); return records;
}
function aggregateUsage(records) {
  const unique = new Map(); records.forEach((record) => { if (!unique.has(record.sourceCell)) unique.set(record.sourceCell, record); });
  const byFabric = new Map();
  unique.forEach((record) => { const id = record.matchedFabricId || `source:${fabricMatchingKey(record.material)}`; const bySize = byFabric.get(id) || new Map(); const group = record.sizeGroup || "DEFAULT"; const bucket = bySize.get(group) || []; bucket.push(record); bySize.set(group, bucket); byFabric.set(id, bySize); });
  return Array.from(byFabric.values()).map((groups) => {
    const totals = Array.from(groups.values()).map((items) => ({ items, total: items.reduce((sum, item) => sum + item.usage, 0) })); const chosen = totals.sort((a, b) => b.total - a.total)[0]; const base = chosen.items[0];
    return { ...base, usage: chosen.total, sourceUsage: chosen.total, sizeGroup: chosen.items.map((i) => i.sizeGroup).join(", "), rule: `${chosen.items.length > 1 ? "SUM WITHIN SIZE + " : ""}${groups.size > 1 ? "SIZE MAX" : base.matchType}` , records: chosen.items };
  });
}
function parseConsumptionWorkbook(file, workbook) {
  const parsed = [];
  const hasDigitalJerseySheet = workbook.SheetNames.some((name) => /디지|DIGI/i.test(name));
  workbook.SheetNames.forEach((sheetName) => { const matrix = sheetMatrix(workbook.Sheets[sheetName]); const type = typeFromMatrix(matrix, file.name); if (type === "PANT") parsed.push(...parsePant(matrix, sheetName)); else if (type === "JERSEY" && (!hasDigitalJerseySheet || /디지|DIGI/i.test(sheetName))) parsed.push(...parseJersey(matrix, sheetName)); else if (type === "GLOVE" && (!/L\d/i.test(file.name) || sheetName.toUpperCase().includes((file.name.match(/L\d/i) || [""])[0].toUpperCase()))) parsed.push(...parseGlove(matrix, sheetName)); });
  const detectedType = parsed[0]?.parsedType || "UNKNOWN"; return { file, styleName: styleNameFromWorkbook(workbook, file.name), detectedType, rows: aggregateUsage(parsed), error: parsed.length ? "" : detectedType === "UNKNOWN" ? "Unknown file format" : "No numeric usage found" };
}
async function readWorkbook(file) { if (!window.XLSX) throw new Error("SheetJS library not loaded"); return XLSX.read(await file.arrayBuffer(), { type: "array", cellFormula: false, cellText: true }); }
async function handleConsumptionFiles(event) {
  const files = Array.from(event.target.files || []); event.target.value = ""; if (!files.length) return;
  const results = await Promise.all(files.map(async (file) => { try { return parseConsumptionWorkbook(file, await readWorkbook(file)); } catch (error) { return { file, styleName: cleanStyleName(file.name), detectedType: "UNKNOWN", rows: [], error: error.message || "Unknown file format" }; } }));
  pendingUpload = { kind: "style", files: results }; renderStyleUploadPreview();
}

function renderAutocompleteLists() {
  const fabrics = document.getElementById("fabricAutocomplete"); const compositions = document.getElementById("compositionAutocomplete");
  if (fabrics) fabrics.innerHTML = appState.fabrics.map((f) => `<option value="${escapeAttribute(f.name)}"></option>`).join("");
  if (compositions) compositions.innerHTML = appState.compositions.map((c) => `<option value="${escapeAttribute(c.label)}"></option>`).join("");
}
function handleDraftFabricEdit(event) {
  const oldId = event.target.dataset.fabricEdit; const chosen = appState.fabrics.find((f) => fabricMatchingKey(f.name) === fabricMatchingKey(event.target.value));
  if (!chosen || chosen.id === oldId) { renderFabricTable(); return; }
  const yy = currentYyByFabricId[oldId]; if (yy) { currentYyByFabricId[chosen.id] = yy; delete currentYyByFabricId[oldId]; }
  syncActiveDraft(); renderFabricTable();
}
function handleDraftCompositionEdit(event) {
  const fabric = appState.fabrics.find((f) => f.id === event.target.dataset.compositionEdit); const composition = appState.compositions.find((c) => normalizeText(c.label) === normalizeText(event.target.value));
  if (fabric && composition && dbEditMode) fabric.compositionId = composition.id;
  renderFabricTable();
}
function updateImportedDraftRow(event) {
  const index = Number(event.target.dataset.importedFabric ?? event.target.dataset.importedComposition ?? event.target.dataset.importedYy); const row = (activeDraft()?.rows || []).filter((item) => !item.matchedFabricId)[index]; if (!row) return;
  const tr = event.target.closest("tr"); const fabricInput = tr.querySelector("[data-imported-fabric]"); const compositionInput = tr.querySelector("[data-imported-composition]"); const yyInput = tr.querySelector("[data-imported-yy]"); const match = matchFabric(fabricInput.value);
  row.matchedFabricName = fabricInput.value.trim(); row.composition = compositionInput.value.trim(); row.usage = numericUsage(yyInput.value); row.matchedFabricId = match.fabric?.id || null; row.matchScore = match.score; row.confidence = match.confidence;
  if (row.matchedFabricId) currentYyByFabricId[row.matchedFabricId] = (currentYyByFabricId[row.matchedFabricId] || 0) + row.usage;
  syncActiveDraft(); renderFabricTable();
}
function showUploadPreview(title, body) { els.uploadPreviewTitle.textContent = title; els.uploadPreviewBody.innerHTML = body; els.uploadPreviewModal.classList.remove("hidden"); }
function closeUploadPreview() { pendingUpload = null; els.uploadPreviewModal.classList.add("hidden"); }
function renderStyleUploadPreview() {
  const files = pendingUpload.files;
  showUploadPreview("소요량표 Import Preview", files.map((item, index) => `
    <section class="preview-file" data-preview-file="${index}"><div class="preview-meta"><div><b>Style Name</b><input data-style-name value="${escapeAttribute(item.styleName)}"></div><div><b>Detected Type</b><select data-file-type><option ${item.detectedType === "PANT" ? "selected" : ""}>PANT</option><option ${item.detectedType === "JERSEY" ? "selected" : ""}>JERSEY</option><option ${item.detectedType === "GLOVE" ? "selected" : ""}>GLOVE</option><option ${item.detectedType === "UNKNOWN" ? "selected" : ""}>UNKNOWN</option></select></div><div><b>Source File</b><br>${escapeHtml(item.file.name)}</div></div>
    ${item.error ? `<p class="error-text">${escapeHtml(item.error)}</p>` : ""}<div class="table-wrap import-preview-table-wrapper"><table class="data-table preview-table import-preview-table"><colgroup><col class="source-material"><col class="matched-fabric"><col class="composition"><col class="parsed-yy"><col class="confidence"><col class="rule"></colgroup><thead><tr><th class="source-material-cell">Source Material</th><th class="matched-fabric-cell">Matched Fabric</th><th class="composition-cell">Composition</th><th class="parsed-yy-cell">Parsed YY</th><th class="confidence-cell">Confidence</th><th class="rule-cell">Rule</th></tr></thead><tbody>${item.rows.map((row, rowIndex) => `<tr class="match-${row.confidence.toLowerCase()}"><td class="source-material-cell">${escapeHtml(row.material)}</td><td class="matched-fabric-cell"><input list="fabricAutocomplete" data-row-fabric="${rowIndex}" value="${escapeAttribute(row.matchedFabricName)}" title="Source: ${escapeAttribute(row.material)}&#10;Matched: ${escapeAttribute(row.matchedFabricName)}&#10;Confidence: ${Math.round(row.matchScore * 100)}%"></td><td class="composition-cell"><input list="compositionAutocomplete" placeholder="Composition 선택 또는 생성" data-row-composition="${rowIndex}" value="${escapeAttribute(row.compositionDefinition?.label || row.composition)}"><button type="button" class="mini-button" data-preview-compose="${rowIndex}">${row.compositionDefinition?.source === "temporary" ? "CUSTOM" : "Composition 만들기"}</button></td><td class="parsed-yy-cell"><input class="preview-yy-input" type="number" min="0" step="0.0001" data-row-usage="${rowIndex}" value="${formatYY(row.usage)}"></td><td class="confidence-cell"><span class="confidence-text">${escapeHtml(row.confidence)} ${Math.round(row.matchScore * 100)}%</span></td><td class="rule-cell">${escapeHtml(row.rule)}</td></tr>`).join("")}</tbody></table></div></section>`).join(""));
  els.uploadPreviewBody.querySelectorAll("[data-preview-file]").forEach((section) => section.querySelectorAll("[data-preview-compose]").forEach((button) => button.addEventListener("click", () => { const fileIndex = Number(section.dataset.previewFile); const rowIndex = Number(button.dataset.previewCompose); const row = pendingUpload.files[fileIndex].rows[rowIndex]; openCompositionBuilder({ kind: "preview", fileIndex, rowIndex }, row.compositionDefinition || { label: row.composition, components: {} }); })));
  els.uploadPreviewBody.querySelectorAll("[data-preview-file]").forEach((section) => {
    const preview = pendingUpload.files[Number(section.dataset.previewFile)];
    section.querySelector("[data-style-name]").addEventListener("input", (event) => { preview.styleName = event.target.value; });
    section.querySelector("[data-file-type]").addEventListener("change", (event) => { preview.detectedType = event.target.value; });
    section.querySelectorAll("[data-row-fabric]").forEach((input) => input.addEventListener("change", () => { const row = preview.rows[Number(input.dataset.rowFabric)]; row.fabricUserConfirmed = Boolean(input.value.trim()); }));
    section.querySelectorAll("[data-row-composition]").forEach((input) => input.addEventListener("change", () => { const row = preview.rows[Number(input.dataset.rowComposition)]; row.compositionUserConfirmed = Boolean(input.value.trim()); }));
  });
  els.importUploadPreviewBtn.textContent = files.length > 1 ? "Import All" : "Import";
}
function readPreviewEdits() {
  els.uploadPreviewBody.querySelectorAll("[data-preview-file]").forEach((section) => { const item = pendingUpload.files[Number(section.dataset.previewFile)]; item.styleName = section.querySelector("[data-style-name]").value.trim(); item.detectedType = section.querySelector("[data-file-type]").value; section.querySelectorAll("[data-row-fabric]").forEach((input) => { const row = item.rows[Number(input.dataset.rowFabric)]; const compositionLabel = section.querySelector(`[data-row-composition="${input.dataset.rowFabric}"]`).value.trim(); updatePreviewRowFromInputs(row, input.value, compositionLabel, section.querySelector(`[data-row-usage="${input.dataset.rowFabric}"]`).value); }); });
}
function updatePreviewRowFromInputs(row, fabricValue, compositionLabel, usageValue) {
  const value = String(fabricValue || "").trim();
  const originalValue = String(row.matchedFabricName || "").trim();
  // A preview import is already the result of matching.  Re-match only when the
  // user actually changed the Fabric field; otherwise preserve UNMATCHED/HIGH
  // and the exact match metadata produced by the parser.
  if (row.fabricUserConfirmed || value !== originalValue) {
    const match = value ? matchFabric(value) : { fabric: null, score: 0, confidence: "UNMATCHED", matchType: "UNMATCHED" };
    row.matchedFabricName = value;
    row.matchedFabricId = match.fabric?.id || null;
    row.matchScore = match.score;
    row.confidence = match.confidence;
    row.matchType = match.matchType;
    if (row.importMatch) row.importMatch.resolvedByUser = true;
  }
  const dbComposition = appState.compositions.find((c) => normalizeText(c.label) === normalizeText(compositionLabel));
  row.composition = String(compositionLabel || "").trim();
  row.compositionDefinition = dbComposition ? clone(dbComposition) : row.compositionDefinition?.label === row.composition ? row.compositionDefinition : null;
  row.usage = numericUsage(usageValue);
  return row;
}
function commitUploadPreview() {
  if (!pendingUpload) return; readPreviewEdits();
  if (pendingUpload.kind === "fabric") { commitFabricImport(); return; }
  const previews = pendingUpload.files;
  if (previews.some((preview) => !normalizeStyleName(preview.styleName))) { showMessage("Style Name is required.", "error"); return; }
  const unresolvedCount = previews.reduce((count, preview) => count + preview.rows.filter((row) => ["MEDIUM", "LOW", "UNMATCHED"].includes(row.confidence) && !row.fabricUserConfirmed && !row.compositionUserConfirmed && !row.compositionDefinition?.components).length, 0);
  if (unresolvedCount && !confirm(`미확인 원단 ${unresolvedCount}건이 있습니다.\n해당 항목은 REVIEW REQUIRED 상태로 Import되며 Composition 계산에서는 제외됩니다.`)) return;
  const importedCount = pendingUpload.files.length;
  // Preview state is the sole import source. Do not read or clone the background draft.
  commitWorkspaceChange(() => {
    pendingUpload.files.forEach((preview) => createDraftFromImport(preview));
  }, { render: false });
  const importedDraftId = activeStyleId;
  closeUploadPreview();
  // activeStyleId already points at the imported draft. The editor still contains
  // the background style name, so it must not be synchronized into the new draft.
  activateDraft(importedDraftId, { syncCurrent: false });
  showMessage(`${importedCount}개 Style draft를 생성했습니다.`);
}
function createDraftFromImport(preview) {
  const rows = preview.rows.map((row) => convertPreviewRowToDraftRow(preview, row));
  const yyByFabricId = {}; rows.forEach((row) => { if (row.fabricId && row.yy > 0) yyByFabricId[row.fabricId] = (yyByFabricId[row.fabricId] || 0) + row.yy; });
  return newDraft({ name: normalizeStyleName(preview.styleName) || "Untitled Style", yyByFabricId }, { rows, sourceType: "import", sourceFile: preview.file.name, parsedType: preview.detectedType, dirty: true });
}
function convertPreviewRowToDraftRow(preview, row) {
  const fabric = row.matchedFabricId ? appState.fabrics.find((item) => item.id === row.matchedFabricId) : null;
  const originalConfidence = row.importMatch?.confidence || row.confidence || "UNMATCHED";
  const autoApproved = ["EXACT", "HIGH"].includes(originalConfidence) && Boolean(fabric);
  const explicitlyReviewed = Boolean(row.fabricUserConfirmed || row.compositionUserConfirmed || row.compositionDefinition?.source === "temporary");
  const definition = row.compositionDefinition?.components ? row.compositionDefinition : (autoApproved || row.fabricUserConfirmed) && fabric ? getComposition(fabric.compositionId) : row.compositionUserConfirmed ? appState.compositions.find((item) => normalizeText(item.label) === normalizeText(row.composition)) : null;
  const reviewRequired = !definition?.components || (["MEDIUM", "LOW", "UNMATCHED"].includes(originalConfidence) && !explicitlyReviewed);
  const importMatch = { ...(row.importMatch || {}), confidence: originalConfidence, score: row.importMatch?.score ?? row.matchScore ?? 0, rule: row.importMatch?.rule || row.matchType || originalConfidence, resolvedByUser: explicitlyReviewed };
  return { rowId: `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, fabricId: reviewRequired && originalConfidence === "UNMATCHED" ? null : fabric?.id || null, fabricName: row.matchedFabricName || row.material, compositionId: reviewRequired ? null : definition?.id || null, composition: reviewRequired ? "" : definition?.label || "", compositionDefinition: reviewRequired ? null : clone(definition), yy: numericUsage(row.usage), confidence: row.confidence || originalConfidence, matchScore: row.matchScore ?? importMatch.score, importMatch, importStatus: { originalConfidence, matchScore: importMatch.score, reviewRequired, reviewed: !reviewRequired }, source: { sourceFileName: preview.file.name, sourceSheet: row.sourceSheet, sourceMaterialName: row.material, sourceUsage: row.sourceUsage, sizeGroup: row.sizeGroup, parsedType: preview.detectedType, matchScore: importMatch.score, matchType: row.matchType, matchedFabricId: row.matchedFabricId, sourceCell: row.sourceCell } };
}
function downloadFabricTemplate() {
  if (!window.ExcelJS) { showMessage("ExcelJS 라이브러리가 로드되지 않았습니다.", "error"); return; }
  const workbook = new ExcelJS.Workbook(); const sheet = workbook.addWorksheet("Fabric Import"); sheet.columns = [{ width: 48 }, { width: 36 }]; sheet.addRow(["Fabric Name", "Composition"]); sheet.addRows([["JX-19 (POLY)", "POLYESTER100%"], ["ONE MESH POLY #BT-102", "POLYESTER90%+SPANDEX10%"], ["ES#PSDW-05 (POLY) (WRC0)", "POLYESTER92%+POLYURETHANE8%"]]);
  sheet.getRow(1).eachCell((cell) => { cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F6F66" } }; cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }; });
  workbook.xlsx.writeBuffer().then((buffer) => downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "fabric-import-template.xlsx"));
}
async function handleFabricExcelUpload(event) {
  const file = event.target.files[0]; event.target.value = ""; if (!file) return;
  try { const book = await readWorkbook(file); const rows = []; book.SheetNames.forEach((name) => { const matrix = sheetMatrix(book.Sheets[name]); matrix.forEach((row, index) => { const nameCol = headerColumn(row, (v) => v === "FABRIC NAME"); const compCol = headerColumn(row, (v) => v === "COMPOSITION"); if (nameCol < 0 || compCol < 0) return; matrix.slice(index + 1).forEach((data) => { if (String(data[nameCol] || "").trim() || String(data[compCol] || "").trim()) rows.push({ name: String(data[nameCol] || "").trim(), composition: String(data[compCol] || "").trim() }); }); }); }); if (!rows.length) throw new Error("Fabric Name and Composition headers not found"); pendingUpload = { kind: "fabric", file, rows }; renderFabricImportPreview(); } catch (error) { showMessage(`Fabric Excel 읽기 실패: ${error.message}`, "error"); }
}
function renderFabricImportPreview() {
  const rows = pendingUpload.rows; showUploadPreview("Fabric DB Import Preview", `<div class="table-wrap"><table class="data-table preview-table"><thead><tr><th>Fabric Name</th><th>Composition</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows.map((row, index) => { const existing = appState.fabrics.find((f) => normalizeText(f.name) === normalizeText(row.name)); const comp = appState.compositions.find((c) => normalizeText(c.label) === normalizeText(row.composition)); const status = !row.name || !row.composition ? "EMPTY" : existing ? "DUPLICATE" : !comp ? "INVALID COMPOSITION" : "NEW"; return `<tr><td><input data-fabric-import-name="${index}" value="${escapeAttribute(row.name)}"></td><td><input list="compositionAutocomplete" data-fabric-import-composition="${index}" value="${escapeAttribute(row.composition)}"></td><td>${status}</td><td>${existing ? "Skip" : "Add"}</td></tr>`; }).join("")}</tbody></table></div>`); els.importUploadPreviewBtn.textContent = "Import";
}
function commitFabricImport() {
  els.uploadPreviewBody.querySelectorAll("[data-fabric-import-name]").forEach((input) => { const row = pendingUpload.rows[Number(input.dataset.fabricImportName)]; row.name = input.value.trim(); row.composition = els.uploadPreviewBody.querySelector(`[data-fabric-import-composition="${input.dataset.fabricImportName}"]`).value.trim(); });
  let added = 0; pendingUpload.rows.forEach((row) => { const composition = appState.compositions.find((c) => normalizeText(c.label) === normalizeText(row.composition)); if (!row.name || !composition || appState.fabrics.some((f) => normalizeText(f.name) === normalizeText(row.name))) return; appState.fabrics.push({ id: uniqueId("fabric_import", appState.fabrics.map((f) => f.id)), name: row.name, compositionId: composition.id, order: nextOrder(appState.fabrics) }); added += 1; });
  saveStore(); closeUploadPreview(); renderAll(); showMessage(`${added}개 Fabric을 추가했습니다.`);
}

function addCareLabelBlocks(sheet, entry, summaryHeaderRow, summaryHeight, lastColumn) {
  const labels = createExportCareLabels(entry.calculation);
  const startColumn = lastColumn >= 8 ? 4 : 1;
  const startRow = startColumn > 1 ? summaryHeaderRow : summaryHeaderRow + summaryHeight + 3;
  addCareLabelBlock(sheet, startRow, startColumn, entry.style.name, labels.us);
  addCareLabelBlock(sheet, startRow, startColumn + 4, entry.style.name, labels.eu);
}

function addCareLabelBlock(sheet, startRow, startColumn, styleName, label) {
  const options = getCareLabelOptionsFromUi();
  const endColumn = startColumn + 2;
  sheet.mergeCells(startRow, startColumn, startRow, endColumn);
  setCell(sheet, startRow, startColumn, "CARE LABEL", careLabelHeaderStyle());
  sheet.mergeCells(startRow + 1, startColumn, startRow + 1, endColumn);
  setCell(sheet, startRow + 1, startColumn, `<${styleName}>`, careLabelStyleNameStyle());
  sheet.mergeCells(startRow + 2, startColumn, startRow + 2, endColumn);
  setCell(sheet, startRow + 2, startColumn, label.title, careLabelSubHeaderStyle());
  sheet.mergeCells(startRow + 3, startColumn, startRow + 3, startColumn + 1);
  setCell(sheet, startRow + 3, startColumn, "LABEL", careLabelTableHeaderStyle());
  setCell(sheet, startRow + 3, endColumn, "%", careLabelTableHeaderStyle());
  const rows = label.lines.length ? label.lines : [{ label: "No care label content available", percent: "" }];
  rows.forEach((line, index) => {
    const rowNumber = startRow + 4 + index;
    sheet.mergeCells(rowNumber, startColumn, rowNumber, startColumn + 1);
    setCell(sheet, rowNumber, startColumn, line.label, careLabelBodyStyle());
    setCell(sheet, rowNumber, endColumn, line.percent === "" ? "" : `${line.percent}%`, careLabelPercentStyle());
    sheet.getRow(rowNumber).height = 22;
  });
  const messageLines = [...(options.includeWarnings ? label.warnings : []), ...label.notes];
  const messageRow = startRow + 4 + rows.length;
  if (messageLines.length) {
    sheet.mergeCells(messageRow, startColumn, messageRow, endColumn);
    setCell(sheet, messageRow, startColumn, messageLines.join("\n"), careLabelNoteStyle());
    sheet.getRow(messageRow).height = Math.max(22, messageLines.length * 16);
  }
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

function careLabelHeaderStyle() {
  return { font: { name: "Calibri", bold: true, color: { argb: "FFFFFFFF" }, size: 13 }, fill: fill("FF0F6F66"), alignment: { vertical: "middle", horizontal: "center", wrapText: true }, border: thinBorder() };
}

function careLabelStyleNameStyle() {
  return { font: { name: "Calibri", bold: true, color: { argb: "FF17324D" } }, fill: fill("FFDDEBF7"), alignment: { vertical: "middle", horizontal: "center", wrapText: true }, border: thinBorder() };
}

function careLabelSubHeaderStyle() {
  return { font: { name: "Calibri", bold: true, color: { argb: "FFFFFFFF" } }, fill: fill("FF5B6F8C"), alignment: { vertical: "middle", horizontal: "center", wrapText: true }, border: thinBorder() };
}

function careLabelBodyStyle() {
  return { font: { name: "Calibri", size: 12, bold: true }, alignment: { vertical: "top", horizontal: "left", wrapText: true }, border: thinBorder() };
}

function careLabelTableHeaderStyle() {
  return { font: { name: "Calibri", bold: true, color: { argb: "FFFFFFFF" } }, fill: fill("FF7A8A99"), alignment: { vertical: "middle", horizontal: "center", wrapText: true }, border: thinBorder() };
}

function careLabelPercentStyle() {
  return { font: { name: "Calibri", size: 12, bold: true }, alignment: { vertical: "middle", horizontal: "right", wrapText: true }, border: thinBorder() };
}

function careLabelNoteStyle() {
  return { font: { name: "Calibri", size: 9, italic: true, color: { argb: "FF6B4E00" } }, fill: fill("FFFFF7D6"), alignment: { vertical: "top", horizontal: "left", wrapText: true }, border: thinBorder() };
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

function formatYY(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(4) : "";
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
