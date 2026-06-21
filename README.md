# NexStock PWA - Envanter Yönetim Sistemi

NexStock, gelişmiş envanter ve stok yönetimi için tasarlanmış modern, duyarlı ve güçlü bir Progresif Web Uygulamasıdır (PWA). Şık glassmorphism arayüzü, Firebase Firestore ile gerçek zamanlı veri senkronizasyonu, gelişmiş önbellekleme mekanizmaları ve barkod okuma özellikleri ile donatılmıştır.

---

## 📖 Kullanım Kılavuzu

Bu bölüm, uygulamanın günlük hayatta nasıl kullanılacağına ve modüllerin nasıl işlediğine dair bilgiler içerir.

### 1. Uygulamayı Cihaza Yükleme (PWA Olarak Kurulum)
Uygulama tam bir PWA altyapısına sahiptir. Tarayıcıdan açtıktan sonra:
* **iOS (Safari):** Tarayıcının alt menüsündeki "Paylaş" ikonuna tıklayıp **"Ana Ekrana Ekle"** seçeneğini seçin.
* **Android (Chrome):** Sağ üstteki menüden (üç nokta) **"Ana Ekrana Ekle"** veya sayfanın altındaki yükleme banner'ını kullanarak cihazınıza uygulama olarak yükleyin.
* **Web (Masaüstü Chrome/Edge):** Adres çubuğunun en sağında çıkan "Yükle (Install)" ikonuna tıklayarak bilgisayarınıza kurun.
* *Not:* Yüklendikten sonra uygulama cihazınızda tam ekran çalışacaktır. PWA Service Worker sayesinde internetiniz kopsa dahi uygulama saniyeler içinde açılır ve giriş ekranı yüklenir.

### 2. Ürün Ekleme (Yeni Stok Girişi)
Ürünlerinizi sisteme manuel olarak tek tek veya Excel üzerinden topluca ekleyebilirsiniz.
* **Tekil Ekleme:** 
  1. Alt menüden veya anasayfadan `+` (Ürün Ekle) ikonuna tıklayın.
  2. Ürün adı, miktarı ve lokasyon zorunlu alanlardır. Barkod alanının yanındaki "Kamera" ikonuna tıklayıp kameradan barkodu direkt okutabilirsiniz.
  3. Peş peşe ürün girecekseniz, **"Yeni Ekle"** butonunu kullanın. Bu sayede seçtiğiniz depo ve raf bilgisi korunur, sadece yeni ürünün ismini girip hızla sisteme kayıt eklemeye devam edersiniz.
  4. İşiniz bittiğinde "Kaydet & Çık" diyebilirsiniz.
* **Toplu Ekleme (Excel/CSV ile Import):**
  1. Anasayfadan `Toplu Aktarım` modülüne girin.
  2. Barkod, Ürün Adı ve Miktar bilgilerini içeren Excel dosyanızı yükleyin. 
  3. Sistem sütunları otomatik tanıyacaktır. Eşleşmeleri onaylayın. Sistemde var olan barkodlar tespit edilirse mevcut stokların üzerine ekleme yapılır.

### 3. Envanter (Stok Listesi) Görüntüleme ve Düzenleme
Sistemdeki mevcut stok durumunu görmek için alt menüden **Stok** (`Inventory`) ikonuna tıklayın.
* **Arama ve Filtreleme:** Yukarıdaki arama çubuğundan ürün veya barkod araması yapabilir; sağındaki "Filtre" butonuna basarak raf, lokasyon veya sadece tükenen (kritik) ürünlere göre listeyi daraltabilirsiniz.
* **Hızlı Stok Düzenleme:** Listede bir ürünün miktarını değiştirmek isterseniz ürünün üzerine tıklamanıza gerek yoktur. Ürün listesindeki miktar alanının yanındaki `- / +` butonlarına tıklayarak stokları saniyeler içinde güncelleyebilirsiniz. (Uygulama arka planda değişikliği buluta yazar).
* **Detaylı Düzenleme / Silme:** Ürünün üzerine tıkladığınızda açılan detay penceresinden raf/lokasyon bilgilerini düzenleyebilir veya stok kartını silebilirsiniz.

### 4. Stok Transferi (Depolar Arası Taşıma)
Bir lokasyondaki ürünleri başka bir lokasyona taşıyarak stok düşüm ve artırımlarını otomatikleştirmek için anasayfadan **Transfer** menüsüne girin.
1. **Yön Seçimi:** "Çıkış Deposu" ve "Hedef Lokasyon" seçin. İleri'ye tıklayın.
2. **Ürün Seçimi:** Çıkış deposunda bulunan ürünler listelenecektir. Listenin üstündeki **arama kutusunu** kullanarak yüzlerce ürün arasından aradığınızı anında bulun.
3. Listeden aktarmak istediğiniz ürüne tıkladığınızda ürün "Seçili" hale gelir ve altında "Transfer Adedi" paneli açılır.
4. Miktarı girin. Dilerseniz birden fazla ürünü seçip hepsine ayrı miktarlar girebilirsiniz.
5. **Transferi Başlat** dediğinizde ürünler çıkış deposundan düşülüp hedef depoya eklenir ve sistem günlüğüne kaydedilir.

### 5. Depo Sayımı
Fiziksel deponuzdaki stoklar ile sistemdeki stokları eşitlemek için anasayfadan **Sayım** menüsüne girin.
1. Lokasyonu (depoyu) seçtiğinizde o depodaki tüm ürünler ekrana gelir.
2. **Barkod ile Hızlı Sayım:** Ortadaki dev `Barkod Okut` butonuna basın. Kameraya gösterdiğiniz her ürün, listenizdeki ürünün sayılan miktarını 1 adet artırır. Ardı ardına okutarak hızlıca sayım yapabilirsiniz.
3. **Manuel Sayım:** Dilerseniz listedeki `- / +` butonlarını kullanarak da sayıları girebilirsiniz. Uzun listelerde aradığınızı bulmak için üstteki "Arama" kutusunu kullanabilirsiniz.
4. **Filtreleme:** Ekranın üstündeki kutucukları kullanarak listeyi sadece "Okutuldu", "Tümü" veya sadece "Fark Var" (Sistem ile sayılanın uyuşmadığı) olarak filtreleyebilirsiniz.
5. **Kayıt:** Sayım bitince `Rapor Kaydet` diyerek sonucu kayda geçirebilir veya `Stoku Güncelle` diyerek sistemdeki hatalı envanter rakamlarını saydığınız doğru rakamlarla ezebilirsiniz.

### 6. Barkod Okuyucu (Akıllı Tarayıcı)
Doğrudan işlem yapmak ve bilgi almak için ekranın alt ortasında bulunan büyük **Tarayıcı** butonuna dokunun.
* Kameraya bir ürün gösterdiğinizde sistem ürünü bulur ve hangi lokasyonlarda kaç adet olduğunu size raporlar.
* **Akıllı Aksiyon (Context-Aware):** Çıkan sonuçtaki **Transfer** butonuna basarsanız; sistem sizi otomatik olarak transfer sayfasına yönlendirir, ürünü ve ürünün bulunduğu en dolu depoyu otomatik olarak seçer. Size sadece miktar girip onaylamak kalır.

### 7. Yönetici Paneli ve Günlükler
(Sadece Admin ve Manager rolündeki kullanıcılar içindir)
* **Aktivite Kayıtları:** Anasayfada bulunan aktivite günlüğünde; "Hangi personel, saat kaçta, hangi ürünü ekledi, sildi veya transfer etti?" görebilirsiniz.
* **Kullanıcı & Lokasyon Yönetimi:** Anasayfadaki `Yönetim` (Admin) butonuyla sisteme yeni mağazalar/depolar tanımlayabilir, yeni personeller ekleyip rollerini ayarlayabilir ve uygulamanın genel raporlarına erişebilirsiniz.

---

## 🛠️ Teknik Özellikler ve Altyapı
* **Frontend**: React (Vite), TailwindCSS, Lucide React
* **Backend & Auth**: Firebase (Auth, Firestore)
* **Veri ve Performans Yönetimi (Caching)**: 
  * UI State ve Kullanıcı Oturumu Zustand `persist` (LocalStorage) ile saklanır.
  * Veritabanı (Ürün/Envanter) uygulamaya ilk girişte toplu olarak çekilir ve Zustand RAM Cache'de tutulur. Bu sayede sayfa içi aramalar, filtrelemeler ve sekme geçişlerinde 0 bekleme süresi (Sıfır Yükleme/Spinner) elde edilir.
  * `vite-plugin-pwa` ile tüm statik dosyalar ve Google fontları servis worker tarafından önbelleklenir.
* **Diğer Araçlar**: XLSX (Excel ayrıştırma), ZXing (Kamera / Barkod donanım entegrasyonu), Recharts (Grafikler)

## Geliştiriciler İçin Kurulum Talimatları
1. Projeyi bilgisayarınıza indirin ve ana dizine gidin.
2. Bağımlılıkları yüklemek için `npm install` komutunu çalıştırın.
3. Kendi Firebase projenizi oluşturun ve bağlantı ayarlarını `src/lib/firebase.js` dosyasına ekleyin.
4. Geliştirme sunucusunu başlatmak için `npm run dev` komutunu kullanın.
5. Uygulamayı yayına hazırlamak için `npm run build` komutunu çalıştırın.
