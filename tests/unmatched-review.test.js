const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("app.js", "utf8").replace(/document\.addEventListener\([\s\S]*?^}\);/m, "");
const context = { console, window: {}, document: {}, localStorage: { getItem() { return null; }, setItem() {} } };
vm.createContext(context);
vm.runInContext(source, context);
context.appState = context.createInitialStore();

const preview = { styleName: "UNMATCHED TEST", detectedType: "GLOVE", file: { name: "fixture.xls" } };
const parsedRow = { material: "ABC UNKNOWN FABRIC", matchedFabricId: null, matchedFabricName: "", composition: "", usage: 0.0163, confidence: "UNMATCHED", matchScore: 0.2, sourceSheet: "L4", sourceCell: "L4!R7C5" };
const unresolved = context.convertPreviewRowToDraftRow(preview, parsedRow);

if (unresolved.fabricId !== null || unresolved.compositionId !== null || unresolved.compositionDefinition !== null || unresolved.composition !== "") throw new Error("TEST A/E: UNMATCHED received an automatic composition");
if (!unresolved.importStatus.reviewRequired || unresolved.yy !== 0.0163) throw new Error("TEST A: review status or YY missing");

let calculation = context.calculateStyle({ name: preview.styleName, rows: [unresolved] });
if (calculation.totalYy !== 0 || calculation.unresolvedYy !== 0.0163 || calculation.reviewCount !== 1) throw new Error("TEST A: unresolved row entered calculation");

unresolved.compositionId = context.appState.compositions.find((item) => item.label === "POLYESTER100%")?.id;
unresolved.compositionDefinition = context.clone(context.getComposition(unresolved.compositionId));
unresolved.composition = unresolved.compositionDefinition.label;
context.markRowReviewState(unresolved, true);
calculation = context.calculateStyle({ name: preview.styleName, rows: [unresolved] });
if (calculation.reviewCount !== 0 || calculation.totalYy !== 0.0163 || Math.abs(calculation.totals.polyester_uncoated - 1) > 1e-9) throw new Error("TEST B: reviewed row did not enter calculation");

const fourRows = Array.from({ length: 4 }, (_, index) => context.convertPreviewRowToDraftRow(preview, { ...parsedRow, material: `UNKNOWN ${index}` }));
if (fourRows.filter(context.rowNeedsReview).length !== 4) throw new Error("TEST C: review count is not four");
if (context.getStylesReviewCount([{ name: preview.styleName, rows: fourRows }]) !== 4) throw new Error("TEST D: export review guard did not detect unresolved rows");

console.log("UNMATCHED review tests A-E passed");
