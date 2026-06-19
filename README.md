# NexStock - Akıllı Envanter ve Stok Takip PWA

NexStock, mağazalar ve depolar arası envanter/stok takibini sağlamak amacıyla geliştirilmiş, "offline-first" (çevrimdışı çalışabilen) modern bir PWA (Progressive Web App) projesidir. Sistem, masaüstünde kapsamlı bir "Yönetim Paneli", mobil cihazlarda ise "El Terminali" hissiyatıyla çalışacak şekilde tasarlanmıştır.

## 🚀 Sürüm Durumu: Production-Ready (v1.1.0)

Bu sürüm ile birlikte uygulama kullanıcı deneyimi ve arayüz tutarlılığı açısından büyük iyileştirmeler aldı. Özellikle iOS cihazlardaki tasarım problemleri giderildi, tablo ve liste bazlı veri yönetimleri daha fonksiyonel hale getirildi.

### ✨ Yeni Eklenen Özellikler
- **Detaylı İşlem Kayıtları ve Modallar:** İşlem kayıtlarındaki transfer logları tek satır özet yerine, tıklanabilir detaylı bir modal penceresiyle ürün dökümü olarak sunuldu.
- **Toplu Düzenleme ve Seçim Modu (Multi-Select):** PWA üzerinden uzun basılı tutarak veya seçim moduyla birden fazla ürün seçilebilir, raflar ve lokasyonlar **toplu olarak** aktarılabilir.
- **Gelişmiş Raporlar:** Haftalık stok hareketlerinde kalem bazlı detaylandırılmış veri görünümü sağlandı, personel performansına sayım istatistikleri entegre edildi.
- **Yönetilebilir Uyarılar:** Kritik stok bildirimleri gibi sistem uyarıları artık kullanıcı tarafından silinebilir/gizlenebilir yapıya kavuşturuldu.
- **iOS SafeArea ve PWA Layout Optimizasyonu:** iOS cihazlardaki ekranın alt bölümünde içeriklerin kesilmesi problemi, `TerminalLayout` ve CSS güncellemeleriyle tamamen düzeltildi.
- **Gelişmiş Filtre ve Sıralama:** Envanter ekranına depo bazlı, rafa göre ve stok seviyesine göre gelişmiş çoklu filtreleme ile sıralama algoritması eklendi.

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
