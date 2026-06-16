# NexStock - Akıllı Envanter ve Stok Takip PWA

NexStock, mağazalar ve depolar arası envanter/stok takibini sağlamak amacıyla geliştirilmiş, "offline-first" (çevrimdışı çalışabilen) modern bir PWA (Progressive Web App) projesidir. Sistem, masaüstünde kapsamlı bir "Yönetim Paneli", mobil cihazlarda ise "El Terminali" hissiyatıyla çalışacak şekilde tasarlanmıştır.

## 🚀 Sürüm Durumu: Production-Ready (v1.0.0)

Bu sürüm ile birlikte uygulama tüm yerel (local) fonksiyonlarıyla **canlı ortama (production) hazır** hale gelmiştir. Firebase entegrasyonu öncesinde tüm veri mantığı, yetkilendirmeler ve raporlamalar LocalStorage üzerinde eksiksiz çalışmaktadır.

### ✨ Temel Özellikler
- **Kamera Tabanlı Barkod Okuma:** `html5-qrcode` ile entegre edilen yüksek performanslı, sesli ("bip") ve dokunsal titreşimli barkod/karekod okuyucu. Barkoddan direkt ürün bulma ve hızlı işlem.
- **PWA Desteği:** Ana ekrana eklenebilme, otomatik güncelleme, servis worker üzerinden önbellekleme ve çevrimdışı kullanım.
- **Responsive Tasarım (Glassmorphism):** Tailwind CSS ile kurgulanan modern tasarım. İki farklı görünüme sahiptir:
  - **Terminal (Mobil) Layout:** Sahada çalışan personel için sekmeli alt bar ve hız odaklı tasarım.
  - **Dashboard (Masaüstü) Layout:** Yönetici ve müdürler için geniş istatistik, tablo ve ayar ekranları.
- **Kapsamlı Raporlama:** Tarih filtreli, akıllı isimlendirmeli ve geçmiş kaydı tutan gerçek **Excel (.xlsx)** dışa aktarım sistemi.
- **Dinamik Yönetim Özeti:** Aktif depoların durumu, gerçek zamanlı toplam transfer ve kritik ürün sayıları analizleri.

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
