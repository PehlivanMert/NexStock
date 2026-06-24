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
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
}

function parsePrice(raw) {
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
        const cleaned = raw.replace(/,/g, '');
        return parseFloat(cleaned) || 0;
    }
    return 0;
}

function getBarcode(row, baseIdx) {
    let b = String(row[baseIdx] || '').trim();
    if (b && b !== 'undefined') return b;
    b = String(row[baseIdx + 1] || '').trim();
    if (b && b !== 'undefined') return b;
    b = String(row[baseIdx + 2] || '').trim();
    if (b && b !== 'undefined') return b;
    return null;
}

try {
    const pricesData = readExcel(file1);
    
    let headerRowIdx = -1;
    let barkodIdx = -1;
    let priceIdx = -1;
    
    for (let i = 0; i < pricesData.length; i++) {
        const row = pricesData[i];
        if (Array.isArray(row)) {
            const bIdx = row.findIndex(c => typeof c === 'string' && c.trim() === 'Ürün Kodu');
            const pIdx = row.findIndex(c => typeof c === 'string' && c.includes('Perakende Satış Fiyatı') && !c.includes('Para Birimi') && !c.includes('Taksitli'));
            
            if (bIdx !== -1 && pIdx !== -1) {
                headerRowIdx = i;
                barkodIdx = bIdx;
                priceIdx = pIdx;
                break;
            }
        }
    }
    
    console.log('Prices Header found at', headerRowIdx, 'Barkod:', barkodIdx, 'Price:', priceIdx);
    
    const prices = {};
    let validPricesCount = 0;
    
    for (let i = headerRowIdx + 1; i < pricesData.length; i++) {
        const row = pricesData[i];
        if (!Array.isArray(row)) continue;
        const barcode = getBarcode(row, barkodIdx);
        if (barcode && /^[0-9A-Za-z-]{3,}$/.test(barcode)) { // simple sanity check
            const priceNum = parsePrice(row[priceIdx]);
            if (priceNum > 0) {
                prices[barcode] = priceNum;
                validPricesCount++;
            }
        }
    }
    
    console.log('Valid prices extracted:', validPricesCount);
    console.log('Sample Prices:', Object.entries(prices).slice(0, 5));
    
    function updateFile(filePath) {
        if (!fs.existsSync(filePath)) return;
        const data = readExcel(filePath);
        let hIdx = -1;
        let bIdx = -1;
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (Array.isArray(row)) {
                const idx = row.findIndex(c => typeof c === 'string' && (c.trim() === 'Ürün Kodu' || c.trim() === 'Barkod'));
                if (idx !== -1) {
                    hIdx = i;
                    bIdx = idx;
                    break;
                }
            }
        }
        
        if (hIdx !== -1) {
            let priceColIdx = data[hIdx].findIndex(c => typeof c === 'string' && c.trim() === 'Fiyat');
            
            // If there are duplicate "Fiyat" columns, find the first one and use it.
            // Remove other "Fiyat" columns from header if they exist by mistake
            for(let c = priceColIdx + 1; c < data[hIdx].length; c++) {
                if (data[hIdx][c] === 'Fiyat') {
                    data[hIdx][c] = ''; // clear duplicate
                }
            }

            if (priceColIdx === -1) {
                data[hIdx].push('Fiyat');
                priceColIdx = data[hIdx].length - 1;
            }
            
            let matchCount = 0;
            for (let i = hIdx + 1; i < data.length; i++) {
                const row = data[i];
                if (!Array.isArray(row)) continue;
                const barkod = getBarcode(row, bIdx);
                
                if (barkod) {
                    if (prices[barkod] !== undefined) {
                        row[priceColIdx] = prices[barkod];
                        matchCount++;
                    } else {
                        row[priceColIdx] = 0;
                    }
                }
            }
            
            const newWorkbook = XLSX.utils.book_new();
            const newSheet = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");
            XLSX.writeFile(newWorkbook, filePath);
            console.log('Updated', filePath, '| Matched:', matchCount);
        }
    }
    
    updateFile(file2);
    updateFile(file3);
    
} catch (e) {
    console.error(e);
}
