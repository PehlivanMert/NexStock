import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const file1 = path.join(process.cwd(), 'public', 'ProductBasePrices.xlsx');

function readExcel(filePath) {
    const file = fs.readFileSync(filePath);
    const workbook = XLSX.read(file, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
}

try {
    const data = readExcel(file1);
    const headerRow = data.find(row => row.includes('Barkod'));
    console.log('Header Row:', headerRow);
    const barkodIndex = headerRow.indexOf('Barkod');
    const priceIndex = headerRow.findIndex(h => typeof h === 'string' && h.includes('Perakende Satış Fiyatı') && !h.includes('Para Birimi') && !h.includes('Taksitli'));
    
    console.log('Barkod Index:', barkodIndex);
    console.log('Price Index:', priceIndex);
    console.log('Price Header:', headerRow[priceIndex]);
    
    // Test mapping for first few items
    const prices = {};
    for (let i = data.indexOf(headerRow) + 1; i < data.length; i++) {
        const row = data[i];
        if (row && row[barkodIndex]) {
            prices[row[barkodIndex]] = row[priceIndex];
        }
    }
    console.log('Sample Prices:', Object.entries(prices).slice(0, 5));
    
} catch (e) {
    console.error(e);
}
