import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const file1 = path.join(process.cwd(), 'public', 'ProductBasePrices.xlsx');
const file2 = path.join(process.cwd(), 'public', 'InventoryProducts.xlsx');
const file3 = path.join(process.cwd(), 'public', 'Yeni Microsoft Excel Çalışma Sayfası1.xlsx');

function readExcel(filePath) {
    const file = fs.readFileSync(filePath);
    const workbook = XLSX.read(file, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
}

try {
    const pricesData = readExcel(file1);
    
    let headerRowIdx = -1;
    let barkodKey = null;
    let priceKey = null;
    
    for (let i = 0; i < pricesData.length; i++) {
        const row = pricesData[i];
        let bKey = null;
        let pKey = null;
        for (const key in row) {
            const val = row[key];
            if (typeof val === 'string' && val.trim() === 'Barkod') {
                bKey = key;
            }
            if (typeof val === 'string' && val.includes('Perakende Satış Fiyatı') && !val.includes('Para Birimi') && !val.includes('Taksitli')) {
                pKey = key;
            }
        }
        if (bKey && pKey) {
            headerRowIdx = i;
            barkodKey = bKey;
            priceKey = pKey;
            break;
        }
    }
    
    console.log('Header Row:', headerRowIdx, 'Barkod Key:', barkodKey, 'Price Key:', priceKey);
    
    const prices = {};
    for (let i = headerRowIdx + 1; i < pricesData.length; i++) {
        const row = pricesData[i];
        if (row && row[barkodKey]) {
            const barkod = String(row[barkodKey]).trim();
            prices[barkod] = row[priceKey] || 0;
        }
    }
    
    console.log('Sample Prices:', Object.entries(prices).slice(0, 5));
    
    function updateFile(filePath) {
        const data = readExcel(filePath);
        let hIdx = -1;
        let bKey = null;
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            for (const key in row) {
                if (typeof row[key] === 'string' && row[key].trim() === 'Ürün Kodu') {
                    hIdx = i;
                    bKey = key;
                    break;
                }
            }
            if (hIdx !== -1) break;
        }
        
        if (hIdx !== -1) {
            // Find a free key for Fiyat
            let fKey = 'Fiyat';
            for (const key in data[hIdx]) {
                if (data[hIdx][key] === 'Fiyat') {
                    fKey = key;
                }
            }
            
            if (!data[hIdx][fKey] || data[hIdx][fKey] !== 'Fiyat') {
                // Generate a new empty key
                fKey = '__EMPTY_' + Object.keys(data[hIdx]).length;
                data[hIdx][fKey] = 'Fiyat';
            }
            
            for (let i = hIdx + 1; i < data.length; i++) {
                const row = data[i];
                if (row && row[bKey]) {
                    const barkod = String(row[bKey]).trim();
                    if (prices[barkod] !== undefined) {
                        row[fKey] = prices[barkod];
                    } else {
                        row[fKey] = 0;
                    }
                }
            }
            
            const newWorkbook = XLSX.utils.book_new();
            const newSheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");
            XLSX.writeFile(newWorkbook, filePath);
            console.log('Updated', filePath);
        } else {
            console.log('No header found for', filePath);
        }
    }
    
    updateFile(file2);
    updateFile(file3);
    
} catch (e) {
    console.error(e);
}
