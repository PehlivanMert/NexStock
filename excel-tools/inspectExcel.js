import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const file1 = path.join(process.cwd(), 'public', 'ProductBasePrices.xlsx');

function readExcel(filePath) {
    const file = fs.readFileSync(filePath);
    const workbook = XLSX.read(file, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // use header: 1 to get array of arrays
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
}

try {
    const prices = readExcel(file1);
    console.log('--- ProductBasePrices.xlsx ---');
    console.log(prices.slice(0, 10));
} catch (e) {
    console.error(e);
}
