const fs = require("fs");
const vm = require("vm");
const XLSX = require("xlsx");

const source = fs.readFileSync("app.js", "utf8").replace(/document\.addEventListener\([\s\S]*?^}\);/m, "");
const context = { console, XLSX, window: {}, document: {}, localStorage: { getItem() { return null; }, setItem() {} } };
vm.createContext(context);
vm.runInContext(source, context);
context.appState = context.createInitialStore();

const fileName = "FLY RACING 28 EVO JERSEY 1차 소요량 260210.xlsx";
const output = context.parseConsumptionWorkbook({ name: fileName }, XLSX.readFile(`reference/${fileName}`));
const actual = Object.fromEntries(output.rows.map((row) => [row.material, row.usage]));
const expected = { "JX-13 (POLY)": 1.0717, "JX-19 (POLY)": 0.9733, "JX-44 (POLY)": 0.1075, "JX-185 (POLY)": 0.2589 };

Object.entries(expected).forEach(([name, usage]) => {
  if (Math.abs((actual[name] ?? NaN) - usage) > 1e-6) throw new Error(`${name}: expected ${usage}, received ${actual[name]}`);
});
const draft = context.createDraftFromImport({ ...output, file: { name: fileName } });
if (draft.styleName !== "28 EVO JERSEY" || draft.sourceType !== "import") throw new Error("Imported draft did not retain preview Style Name/source type");
Object.entries(expected).forEach(([name, usage]) => {
  const row = draft.rows.find((item) => item.fabricName === name);
  if (!row || Math.abs(row.yy - usage) > 1e-6) throw new Error(`Imported draft row missing YY: ${name}`);
});
console.log("JERSEY parser acceptance test passed", actual);
