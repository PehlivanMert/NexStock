# NexStock PWA — Akıllı Envanter & Stok Yönetim Sistemi

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.1.0-6c63ff?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-ffca28?style=for-the-badge&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/PWA-Ready-5a0fc8?style=for-the-badge&logo=pwa" alt="PWA" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite" alt="Vite" />
</p>

---

NexStock, çok lokasyonlu depo ve stok süreçlerini tek bir çatı altında yönetmek için geliştirilmiş, **gerçek zamanlı senkronizasyon**, **offline-first çalışma** ve **barkod okuma** özelliklerine sahip modern bir Progressive Web Application'dır (PWA). Hem masaüstü hem de mobil cihazlara kurulabilir; internet bağlantısı kesilse dahi çalışmaya devam eder.

---

## ✨ Öne Çıkan Özellikler

| Özellik | Açıklama |
|---|---|
| 📦 **Çok Lokasyonlu Stok** | Sınırsız depo/raf tanımlayın; stokları lokasyon bazında yönetin |
| 📷 **Barkod Tarama** | Kamera veya USB/Bluetooth fiziksel okuyucu desteği |
| 🔄 **Stok Transferi** | Depolar arası ürün hareketi; her transfer kayıt altına alınır |
| 🔢 **Depo Sayımı** | Fiziksel sayımı sisteme işleyin; uyuşmazlıkları anında görün |
| 📊 **Anlık Raporlama** | Aktivite günlüğü, tükenme uyarıları ve grafik analizler |
| 📥 **Excel Import** | Toplu stok girişi için Excel/CSV dosya içe aktarımı |
| 👥 **Rol Tabanlı Erişim** | Admin / Manager / Staff katmanlı yetki sistemi |
| ⚡ **Sıfır Yükleme** | RAM önbellek mimarisi sayesinde tüm sayfa geçişleri anında |
| 📱 **PWA Kurulumu** | iOS, Android ve masaüstüne uygulama olarak kurulum |

---

## 🚀 Kurulum

### Gereksinimler

- **Node.js** v18 veya üzeri
- **npm** v9 veya üzeri
- Bir **Firebase** projesi (Firestore + Authentication etkinleştirilmiş)

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/kullanici-adiniz/nexstock.git
cd nexstock
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Firebase Yapılandırması

`src/lib/firebase.js` dosyasını açın ve kendi Firebase projenizin bilgileriyle güncelleyin:

```js
// src/lib/firebase.js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

> **İpucu:** Firebase Console → Proje Ayarları → Genel → Uygulamalarınız bölümünden bu değerleri alabilirsiniz.

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresine gidin.

### 5. Üretim Derlemesi (Opsiyonel)

```bash
npm run build       # Üretim için derle
npm run preview     # Üretim derlemesini önizle
```

Derleme çıktısı `dist/` klasörüne oluşturulur. Bu klasörü herhangi bir statik hosting servisi (Firebase Hosting, Vercel, Netlify vb.) üzerinden yayına alabilirsiniz.

### 6. PWA Olarak Cihaza Kurulum

Uygulamanın yayınlandığı URL'yi tarayıcıda açtıktan sonra:

- **iOS (Safari):** Alt menüdeki **Paylaş** → **Ana Ekrana Ekle**
- **Android (Chrome):** Sağ üst menü → **Ana Ekrana Ekle** ya da ekranda çıkan yükleme banner'ı
- **Masaüstü (Chrome / Edge):** Adres çubuğu sağındaki **Yükle** ikonu

Kurulum sonrasında uygulama tam ekran çalışır. Service Worker sayesinde internet bağlantısı olmadan da saniyeler içinde açılır.

---

## 📖 Kullanım Kılavuzu

### Giriş ve Rol Sistemi

Uygulamaya ilk girişte e-posta ve şifre ile kimlik doğrulaması yapılır. Her kullanıcıya bir **rol** atanır:

| Rol | Yetkiler |
|---|---|
| **Admin** | Tüm özellikler + kullanıcı ve lokasyon yönetimi |
| **Manager** | Stok, transfer, sayım + aktivite günlüğü görüntüleme |
| **Staff** | Yalnızca atandığı lokasyonun stoğunu görüntüleme ve sayım |

---

### 1. Ürün Ekleme

**Tekil Ekleme:**

1. Ana ekrandaki **`+`** (Ürün Ekle) butonuna tıklayın.
2. Ürün adı, miktarı ve lokasyon alanlarını doldurun.
3. Barkod alanının yanındaki **Kamera** ikonuyla kameradan barkodu okutabilirsiniz.
4. Peş peşe birden fazla ürün eklemek için **"Yeni Ekle"** butonunu kullanın — seçili depo ve raf bilgisi korunur.
5. İşlem bittiğinde **"Kaydet & Çık"** ile kaydedip çıkın.

**Toplu Ekleme (Excel Import):**

1. Ana ekrandan **Toplu Aktarım** modülüne girin.
2. Barkod, Ürün Adı ve Miktar sütunlarını içeren Excel/CSV dosyanızı yükleyin.
3. Sistem sütunları otomatik olarak eşleştirir; mevcut barkodlarda stok miktarlarının üzerine ekleme yapılır.

---

### 2. Stok Listesi (Envanter)

Alt menüden **Stok** ikonuna tıklayarak mevcut envanteri görüntüleyin.

- **Arama:** Ürün adı veya barkod ile anlık arama yapın.
- **Filtreleme:** Lokasyon, raf veya tükenme durumuna göre listeyi filtreleyin.
- **Hızlı Güncelleme:** Ürün satırındaki **`-`** / **`+`** butonlarıyla miktarı anında değiştirin — değişiklik arka planda buluta kaydedilir.
- **Detaylı Düzenleme:** Ürün üzerine tıklayarak detay panelini açın; raf, lokasyon ve diğer bilgileri düzenleyin veya ürünü silin.

---

### 3. Stok Transferi (Depolar Arası)

Ana ekrandan **Transfer** menüsüne girin.

1. **Çıkış Deposu** ve **Hedef Lokasyon** seçin → **İleri**.
2. Arama kutusuyla listelenen ürünler arasında arama yapın.
3. Aktarmak istediğiniz ürüne tıklayın → **Transfer Adedi** paneli açılır.
4. Miktarı girin. Birden fazla ürün seçip her birine ayrı miktar girebilirsiniz.
5. **"Transferi Başlat"** ile işlemi tamamlayın. Ürünler çıkış deposundan düşülür, hedef depoya eklenir ve aktivite günlüğüne kaydedilir.

---

### 4. Depo Sayımı

Ana ekrandan **Sayım** menüsüne girin.

1. Sayım yapılacak **lokasyonu** seçin.
2. **Barkod ile Sayım:** "Barkod Okut" butonuna basın; kameraya gösterilen her ürün sayılan miktarı 1 artırır.
3. **Manuel Sayım:** Listedeki **`-`** / **`+`** butonları ya da doğrudan miktar alanına yazarak sayım yapın.
4. Üstteki filtrelerle listeyi **Tümü**, **Okutuldu** veya **Fark Var** olarak görüntüleyin.
5. Sayım bitince:
   - **"Rapor Kaydet"** → Sayım sonucunu raporlar bölümüne ekler.
   - **"Stoku Güncelle"** → Sistemdeki mevcut rakamları sayılan doğru değerlerle günceller.

---

### 5. Barkod Tarayıcı

Alt menünün ortasındaki büyük **Tarayıcı** butonuna dokunun.

- Kameraya ürün gösterildiğinde sistem ürünü bulur ve hangi lokasyonda kaç adet olduğunu listeler.
- Sonuç ekranındaki **Transfer** butonuna basarsanız sistem sizi transfer sayfasına yönlendirir, ürünü ve en dolu depoyu otomatik olarak seçer — size sadece miktarı onaylamak kalır.

> USB/Bluetooth fiziksel barkod okuyucular da desteklenir; tarayıcı sayfası açıkken okuyucudan gelen veri otomatik olarak işlenir.

---

### 6. Yönetici Paneli

*(Yalnızca Admin ve Manager rolleri)*

- **Aktivite Günlüğü:** Hangi personelin, saat kaçta, hangi işlemi gerçekleştirdiğini görün.
- **Kullanıcı Yönetimi:** Yeni personel ekleyin, rollerini ve lokasyon atamalarını düzenleyin.
- **Lokasyon Yönetimi:** Yeni depo / raf tanımlayın veya mevcutları düzenleyin.
- **Raporlar:** Stok hareketleri ve sayım geçmişini grafik ve tablo formatında inceleyin.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Stil** | TailwindCSS 4 |
| **İkon Kütüphanesi** | Lucide React |
| **State Yönetimi** | Zustand (persist + RAM cache) |
| **Backend & Auth** | Firebase (Firestore + Authentication) |
| **PWA Altyapısı** | vite-plugin-pwa + Workbox Service Worker |
| **Barkod Okuma** | ZXing / html5-qrcode (kamera + USB) |
| **Excel İşleme** | SheetJS (XLSX) |
| **Grafikler** | Recharts |
| **Bildirimler** | Sonner (toast) |

### Önbellek Mimarisi

```
İlk Giriş: Firestore → Zustand RAM Cache
Tüm Sonraki İşlemler: RAM Cache (0ms) + Firestore (arka planda)
Statik Dosyalar: Service Worker önbelleği (offline erişim)
Kullanıcı Oturumu: LocalStorage (Zustand persist)
```

Bu mimari sayesinde, veri yüklendikten sonra tüm arama ve sayfa geçişleri **sıfır bekleme süresi** ile gerçekleşir.

---

## 📁 Proje Yapısı

```
nexstock/
├── src/
│   ├── components/       # Yeniden kullanılabilir UI bileşenleri
│   ├── hooks/            # Özel React hook'ları (Firestore, auth vb.)
│   ├── lib/              # Firebase yapılandırması
│   ├── pages/            # Sayfa bileşenleri (Inventory, Transfer, Count…)
│   ├── store/            # Zustand store tanımları
│   └── main.jsx          # Uygulama giriş noktası
├── public/               # Statik dosyalar ve PWA manifest
├── dist/                 # Üretim derlemesi (git'e eklenmez)
├── vite.config.js
└── package.json
```

---

## 📄 Lisans

Bu proje özel kullanım için geliştirilmiştir. Kaynak kodu paylaşım veya kullanım için lütfen proje sahibiyle iletişime geçin.

---

<p align="center">
  <b>NexStock</b> — Stok yönetimini basit, hızlı ve güvenilir kılmak için tasarlandı.
</p>
