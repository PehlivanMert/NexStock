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
    
    // Find the header row in default parsing
    const headerRowIdx = pricesData.findIndex(row => row.__EMPTY === 'Barkod');
    
    let barkodKey = '__EMPTY';
    let priceKey = '__EMPTY_19'; // from previous output
    
    // We can just iterate from headerRowIdx + 1
    const prices = {};
    for (let i = headerRowIdx + 1; i < pricesData.length; i++) {
        const row = pricesData[i];
        if (row && row[barkodKey]) {
            prices[row[barkodKey]] = row[priceKey];
        }
    }
    
    console.log('Sample Prices:', Object.entries(prices).slice(0, 5));
    
    // Now update file2
    const inventoryData = readExcel(file2);
    // Let's add a "Fiyat" column
    const inventoryHeaderRowIdx = inventoryData.findIndex(row => row.__EMPTY === 'Ürün Kodu' || row.__EMPTY_1 === 'Ürün Kodu');
    let invBarkodKey = '__EMPTY';
    
    if (inventoryHeaderRowIdx !== -1) {
        // update header
        inventoryData[inventoryHeaderRowIdx]['Fiyat'] = 'Fiyat';
        for (let i = inventoryHeaderRowIdx + 1; i < inventoryData.length; i++) {
            const barkod = inventoryData[i][invBarkodKey];
            if (barkod && prices[barkod]) {
                inventoryData[i]['Fiyat'] = prices[barkod];
            } else if (barkod) {
                inventoryData[i]['Fiyat'] = 0; // or empty
            }
        }
    }
    
    // Now write it back
    function writeExcel(data, filePath) {
        const newWorkbook = XLSX.utils.book_new();
        const newSheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");
        XLSX.writeFile(newWorkbook, filePath);
    }
    
    writeExcel(inventoryData, file2);
    console.log('Updated', file2);
    
    // update file3
    const yeniData = readExcel(file3);
    const yeniHeaderRowIdx = yeniData.findIndex(row => row.__EMPTY === 'Ürün Kodu' || row.__EMPTY_1 === 'Ürün Kodu');
    if (yeniHeaderRowIdx !== -1) {
        yeniData[yeniHeaderRowIdx]['Fiyat'] = 'Fiyat';
        for (let i = yeniHeaderRowIdx + 1; i < yeniData.length; i++) {
            const barkod = yeniData[i][invBarkodKey];
            if (barkod && prices[barkod]) {
                yeniData[i]['Fiyat'] = prices[barkod];
            } else if (barkod) {
                yeniData[i]['Fiyat'] = 0;
            }
        }
    }
    
    writeExcel(yeniData, file3);
    console.log('Updated', file3);
    
} catch (e) {
    console.error(e);
}
