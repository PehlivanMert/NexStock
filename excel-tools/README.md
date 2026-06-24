# Excel Data Processing Tools

Bu klasör, Excel dosyalarındaki ürün ve fiyat verilerini okuyarak birleştirme, eşleştirme ve toplu aktarım için uygun formata getirme amaçlı yazılmış betikleri (script'leri) içerir. 

## Dosyalar:
- **inspectExcel.js / inspectExcel2.js:** Gelen Excel dosyalarının yapısını, sütun isimlerini ve gizli/kaymış satırlarını analiz etmek için kullanılan okuma araçlarıdır.
- **updateExcel.js ... updateExcel5.js:** Önceki farklı eşleştirme senaryoları için yazılmış yedek versiyonlardır.
- **updateExcel6.js:** (En güncel ve gelişmiş versiyon). `ProductBasePrices.xlsx` dosyasındaki TRY fiyatlarını baz alarak, `InventoryProducts.xlsx` gibi diğer dosyalardaki barkodlarla fiyatları eşleştirir ve eksik sütunları tamamlayarak Excel'e geri yazar.

## Kullanım
İlerleyen zamanlarda ürünleri ve fiyatları tekrar eşleştirmek isterseniz, dosyaları `/public` klasörüne koyup terminalden şu komutu çalıştırabilirsiniz:

```bash
node excel-tools/updateExcel6.js
```
(İhtiyacınıza göre kod içindeki dosya isimlerini veya sütun başlıklarını değiştirebilirsiniz.)
