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
    return XLSX.utils.sheet_to_json(sheet, { header: 1 }); // array of arrays
}

try {
    const pricesData = readExcel(file1);
    
    // Find the header row in array
    let headerRowIdx = -1;
    let barkodIdx = -1;
    let priceIdx = -1;
    
    for (let i = 0; i < pricesData.length; i++) {
        const row = pricesData[i];
        if (Array.isArray(row)) {
            const bIdx = row.indexOf('Barkod');
            const pIdx = row.findIndex(c => typeof c === 'string' && c.includes('Perakende Satış Fiyatı') && !c.includes('Para Birimi') && !c.includes('Taksitli'));
            
            if (bIdx !== -1 && pIdx !== -1) {
                headerRowIdx = i;
                barkodIdx = bIdx;
                priceIdx = pIdx;
                break;
            }
        }
    }
    
    console.log('Found Header at', headerRowIdx, 'Barkod:', barkodIdx, 'Price:', priceIdx);
    
    const prices = {};
    for (let i = headerRowIdx + 1; i < pricesData.length; i++) {
        const row = pricesData[i];
        if (row && row[barkodIdx]) {
            prices[row[barkodIdx]] = row[priceIdx];
        }
    }
    
    console.log('Sample Prices:', Object.entries(prices).slice(0, 5));
    
    function updateFile(filePath) {
        const data = readExcel(filePath);
        let headerRowIdx = -1;
        let barkodIdx = -1;
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (Array.isArray(row)) {
                const bIdx = row.indexOf('Ürün Kodu');
                if (bIdx !== -1) {
                    headerRowIdx = i;
                    barkodIdx = bIdx;
                    break;
                }
            }
        }
        
        if (headerRowIdx !== -1) {
            // Append Fiyat to header
            data[headerRowIdx].push('Fiyat');
            const newPriceIdx = data[headerRowIdx].length - 1;
            
            for (let i = headerRowIdx + 1; i < data.length; i++) {
                const row = data[i];
                if (Array.isArray(row) && row[barkodIdx]) {
                    const barkod = String(row[barkodIdx]).trim();
                    if (prices[barkod] !== undefined) {
                        row[newPriceIdx] = prices[barkod];
                    } else {
                        row[newPriceIdx] = 0;
                    }
                }
            }
            
            const newWorkbook = XLSX.utils.book_new();
            const newSheet = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");
            XLSX.writeFile(newWorkbook, filePath);
            console.log('Updated', filePath);
        }
    }
    
    updateFile(file2);
    updateFile(file3);
    
} catch (e) {
    console.error(e);
}
