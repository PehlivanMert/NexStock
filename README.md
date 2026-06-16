# NexStock - Akıllı Envanter ve Stok Takip PWA

NexStock, mağazalar ve depolar arası envanter/stok takibini sağlamak amacıyla geliştirilmiş, "offline-first" (çevrimdışı çalışabilen) modern bir PWA (Progressive Web App) projesidir. Sistem, masaüstünde kapsamlı bir "Yönetim Paneli", mobil cihazlarda ise "El Terminali" hissiyatıyla çalışacak şekilde tasarlanmıştır.

## 🚀 Sürüm Durumu: Production-Ready (v1.1.0)

Bu sürüm ile birlikte uygulama PWA tarafında tam mobil uyumluluk, yüksek hızlı kamera optimizasyonları ve kusursuz sayım mantığı ile güncellenmiştir.

### ✨ Temel Özellikler
- **Yüksek Hızlı Barkod Okuyucu (60 FPS):** `html5-qrcode` kütüphanesi; 60 FPS tarama hızı, `qrbox` (kutucuk) sınırlamasının kaldırılarak tüm ekranın tarama alanına çevrilmesi ve kameranın direkt arka-makro lense (zoom: 3.0) zorlanmasıyla muazzam hızlandırıldı. Barkodu ekranda gördüğü salise algılar.
- **Kesintisiz Sayım Modülü & Raporlama:** Depo sayımlarında her okutmada ürünü otomatik olarak "+1" sayar. Sayım esnasında ana stoku bozmaz; sayım tamamlanıp "Kaydet" denildiğinde ise sistem stoku ile sayılan stok arasındaki farkları net şekilde göstererek günceller.
- **Responsive Yönetim Paneli (PWA Admin Layout):** Yönetim (Admin) paneli artık PWA mobil görünümüne %100 uyumludur. Yan menü (sidebar) mobil ekranlarda akıllıca gizlenerek "Hamburger Menu" yapısına geçirilmiş, ekran ferahlatılmıştır.
- **PWA Otomatik Güncelleme:** `vite-plugin-pwa` ile arka planda sessizce (autoUpdate ve immediate) güncellenir. Kullanıcı hiçbir şey yapmadan hep en güncel sürümü kullanır.
- **iOS Kusursuz Uyumluluk:** PWA ikonlarının iOS cihazlarda (iPhone) etrafında beyaz çerçeve çıkması problemi Apple'a özel `<link rel="apple-touch-icon">` etiketleri kullanılarak ve ikon alt yapısı şeffaflıktan arındırılarak engellenmiştir.

---

## 🔐 Rol Bazlı Yetki Kontrolü (RBAC)

Uygulama içerisinde sıkı bir güvenlik matrisi (`ROLE_PERMISSIONS`) uygulanmaktadır. Arayüz ve sayfalar kullanıcı rolüne göre şekillenir:

### 1. Yönetici (Admin)
Sistemin mutlak sahibidir. Tüm alanlara, tüm ayarlara ve tüm lokasyonların istatistiklerine sınırsız erişimi vardır. 
* *Yapabildikleri:* Yeni kullanıcı ekleme/silme, yeni depo tanımlama, ürün/stok silme, rapor indirme, tüm transferleri ve sayımları yönetme.

### 2. Müdür (Manager)
Operasyonlardan sorumlu kişidir. Terminal ekranına ve Yönetim Paneli'nin operasyonel kısımlarına erişebilir.
* *Yapabildikleri:* Stok ekleme, sayım, transfer, envanter düzenleme, Excel raporları indirme.
* *Yapamadıkları:* Sistem kullanıcılarını yönetemez, sistem depolarını kapatıp açamaz.

### 3. Personel (Staff)
Saha veya kasa çalışanlarıdır. **Kesinlikle Yönetim Paneli'ne erişimleri yoktur.** Uygulamayı sadece "Terminal" (Mobil Uygulama) modunda kullanabilirler.
* *Yapabildikleri:* Kendilerine atanmış **Aktif Lokasyon**'daki stokları görüntüleme, barkod okutma, sayım yapma, diğer mağaza/depolara transfer başlatma.
* *Yapamadıkları:* Yönetim paneline girme, excel raporu alma, var olan bir ürün kaydını sistemden komple silme, başka deponun verisine müdahale etme.

---

## 🛠️ Kurulum ve Çalıştırma

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```
3. PWA özellikleri dahil tam derleme için:
   ```bash
   npm run build
   ```

## 📂 Klasör Yapısı
- `src/components/layout/`: Masaüstü ve Mobil layout bileşenleri (`TerminalLayout`, `DashboardLayout`).
- `src/components/scanner/`: Barkod tarayıcı mantığı.
- `src/pages/`: Terminal ekranları (Ana Sayfa, Sayım, Transfer, Profil).
- `src/pages/admin/`: Yönetim ekranları (Dashboard, Users, Locations, Reports).
- `src/store/`: Zustand state dosyaları (Veritabanı işlemleri ve Auth).

## 🔮 Sıradaki Geliştirmeler (Next Steps)
- Firebase JSON veritabanı / kimlik bilgilerinin (`Auth`) entegrasyonu (Tüm fonksiyonlar altyapı olarak Firebase mantığıyla asenkron kullanıma uygundur, sadece store servisleri değişecektir).
- Excel/PDF ayrıştırma algoritması (Cloud Functions & Cloud Vision / LLM API).
