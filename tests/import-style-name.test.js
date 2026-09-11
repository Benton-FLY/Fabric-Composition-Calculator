const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("app.js", "utf8").replace(/document\.addEventListener\([\s\S]*?^}\);/m, "");
const context = { console, window: {}, document: {}, localStorage: { getItem() { return null; }, setItem() {} } };
vm.createContext(context);
vm.runInContext(source, context);
vm.runInContext("appState = createInitialStore(); renderStyleDraftList = () => {}; renderFabricTable = () => {}; els.styleNameInput = { value: '' };", context);

function importAgainstBackground(previewName, backgroundName) {
  const script = `(() => {
    styleDrafts = {};
    activeStyleId = null;
    currentYyByFabricId = {};
    const background = newDraft({ name: ${JSON.stringify(backgroundName)}, yyByFabricId: {} });
    els.styleNameInput.value = ${JSON.stringify(backgroundName)};
    let imported;
    commitWorkspaceChange(() => { imported = createDraftFromImport({
      styleName: ${JSON.stringify(previewName)},
      detectedType: "PANT",
      file: { name: "fixture.xlsx" },
      rows: [{ material: "TEST FABRIC", matchedFabricId: null, matchedFabricName: "TEST FABRIC", composition: "", usage: 0.25, confidence: "UNMATCHED", matchScore: 0, sourceSheet: "Sheet1", sourceCell: "Sheet1!R1C1" }]
    }); }, { render: false });
    activateDraft(imported.id, { syncCurrent: false });
    return JSON.stringify({ draftName: imported.styleName, inputName: els.styleNameInput.value, sourceType: imported.sourceType, rowCount: imported.rows.length, backgroundName: styleDrafts[background.id].styleName });
  })();
  `;
  return JSON.parse(vm.runInContext(script, context));
}

[
  ["28 KINETIC YOUTH DBK PANT", "28 EVO PANT"],
  ["28 F-16 2 JERSEY", "28 EVO PANT"],
  ["TEST STYLE ABC", "28 EVO PANT"],
  ["28 F-16 2 JERSEY", "Untitled Style"],
].forEach(([preview, background]) => {
  const result = importAgainstBackground(preview, background);
  if (result.draftName !== preview || result.inputName !== preview) throw new Error(`${preview}: imported as ${result.draftName}/${result.inputName}`);
  if (result.backgroundName !== background || result.sourceType !== "import" || result.rowCount !== 1) throw new Error(`${preview}: import metadata regression`);
});

console.log("Import Style Name A-D tests passed");
