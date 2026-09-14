const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8').replace(/document\.addEventListener\([\s\S]*?^}\);/m, '');
const context = { console, window: {}, document: {}, localStorage: { getItem() { return null; }, setItem() {} } };
vm.createContext(context);
vm.runInContext(source, context);
context.appState = context.createInitialStore();
const fabric = context.appState.fabrics.find(f => context.getComposition(f.compositionId).components.polyester_coated === 92);
const original = JSON.stringify(context.getComposition(fabric.compositionId));
const style = { name: 'Coating test', yyByFabricId: { [fabric.id]: 2 }, coatingByFabricId: { [fabric.id]: 'uncoated' } };
const calculation = context.calculateStyle(style);
assert.equal(calculation.totals.polyester_uncoated, 0.92);
assert.equal(calculation.totals.polyester_coated, 0);
assert.equal(calculation.totals.polyurethane, 0.08);
assert.equal(calculation.grandTotal, 1);
assert.doesNotMatch(calculation.usedRows[0].compositionLabel, /coated/i);
assert.equal(JSON.stringify(context.getComposition(fabric.compositionId)), original);
assert.equal(context.calculateStyle({ ...style, coatingByFabricId: {} }).totals.polyester_coated, 0.92);
const restored = context.cloneStyle(JSON.parse(JSON.stringify(style)));
assert.equal(context.calculateStyle(restored).totals.polyester_uncoated, 0.92);
assert.equal(context.newDraft(restored).coatingByFabricId[fabric.id], 'uncoated');
const rows = ['coated', 'uncoated'].map(polyesterCoating => ({ fabricName: fabric.name, compositionId: fabric.compositionId, yy: 1, polyesterCoating }));
const imported = context.calculateStyle(context.cloneStyle({ name: 'Imported', rows }));
assert.equal(imported.totals.polyester_coated, 0.46);
assert.equal(imported.totals.polyester_uncoated, 0.46);
assert.equal(imported.totals.polyurethane, 0.08);
assert.equal(context.polyesterRatio({ components: { polyurethane: 100 } }), 0);
assert.equal(context.polyesterRatio({ components: { nylon: 100 } }), 0);
console.log('Polyester coating calculation and persistence tests passed');
// Editing YY must preserve the original composition behind its displayed override.
const customRow = { compositionDefinition: { label: 'Custom blend (COATED)', components: { polyester_coated: 80, nylon: 20 } }, polyesterCoating: 'uncoated' };
const display = context.applyPolyesterCoating(context.getRowComposition(customRow), customRow.polyesterCoating);
assert.equal(display.label, 'Custom blend');
assert.equal(context.getEditedRowCompositionLabel(customRow, display.label), 'Custom blend (COATED)');
assert.equal(context.getEditedRowCompositionLabel(customRow, 'NYLON100%'), 'NYLON100%');
assert.equal(context.applyPolyesterCoating(display, 'coated').label, 'Custom blend');
// A dropdown selection in normal mode updates this style, including saved results.
context.commitWorkspaceChange = (action) => action();
const manualDraft = context.newDraft(style);
const nylon = context.appState.compositions.find(c => c.components.nylon === 100);
context.handleDraftCompositionEdit({ target: { dataset: { compositionEdit: fabric.id }, value: nylon.label } });
assert.equal(manualDraft.compositionByFabricId[fabric.id], nylon.id);
assert.equal(manualDraft.coatingByFabricId[fabric.id], undefined);
const changed = context.cloneStyle({ name: 'Changed', yyByFabricId: manualDraft.yyByFabricId, compositionByFabricId: manualDraft.compositionByFabricId });
assert.equal(context.calculateStyle(changed).totals.nylon, 1);
assert.equal(JSON.stringify(context.getComposition(fabric.compositionId)), original);
assert.equal(context.newDraft(changed).compositionByFabricId[fabric.id], nylon.id);

// An imported DB fabric must honor a new composition and retain it when YY changes.
const importRow = { rowId: 'dropdown-row', fabricId: fabric.id, fabricName: fabric.name, compositionId: fabric.compositionId, yy: 1, polyesterCoating: 'coated' };
context.newDraft({ name: 'Import' }, { sourceType: 'import', rows: [importRow] });
context.renderFabricTable = () => {};
context.refreshFabricCalculations = () => {};
const fields = {
  '[data-import-row-fabric]': { value: fabric.name },
  '[data-import-row-composition]': { value: nylon.label },
  '[data-import-row-yy]': { value: '1' },
};
context.updateImportDraftRow({ target: { dataset: { importRowComposition: importRow.rowId }, closest: () => ({ querySelector: key => fields[key] }) } });
assert.equal(importRow.compositionId, nylon.id);
assert.equal(importRow.polyesterCoating, undefined);
context.updateImportDraftRow({ target: { dataset: { importRowYy: importRow.rowId }, value: '2' } });
assert.equal(importRow.compositionId, nylon.id);
assert.equal(importRow.yy, 2);
assert.equal(context.calculateStyle({ name: 'Import', rows: [importRow] }).totals.nylon, 1);

assert.equal(context.stripCoatingName('POLY TASLAN PA COATED (WRC0) (CN)'), 'POLY TASLAN PA (WRC0) (CN)');
assert.equal(context.stripCoatingName('Fabric (uncoated)'), 'Fabric');
assert.ok(context.appState.compositions.every(c => !/\bcoated\b|\buncoated\b/i.test(c.label)));
assert.ok(context.appState.fabrics.every(f => !/\bcoated\b|\buncoated\b/i.test(f.name)));
const legacy = context.createInitialStore();
legacy.fabrics[0].name = 'Legacy (COATED)';
legacy.compositions[0].label = 'Blend (UNCOATED)';
const idsBefore = legacy.fabrics.map(f => f.compositionId).join(',');
context.normalizeV3Store(legacy);
assert.equal(legacy.fabrics[0].name, 'Legacy');
assert.equal(legacy.compositions[0].label, 'Blend');
assert.equal(legacy.fabrics.map(f => f.compositionId).join(','), idsBefore);
