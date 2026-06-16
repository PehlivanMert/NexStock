# NexStock - Akıllı Envanter ve Stok Takip PWA

NexStock, mağazalar ve depolar arası envanter/stok takibini sağlamak amacıyla geliştirilmiş, "offline-first" (çevrimdışı çalışabilen) modern bir PWA (Progressive Web App) projesidir. Sistem, masaüstünde kapsamlı bir "Yönetim Paneli", mobil cihazlarda ise "El Terminali" hissiyatıyla çalışacak şekilde tasarlanmıştır.

## Özellikler (Production-Ready)
- **Kamera Tabanlı Barkod Okuma:** `html5-qrcode` ile entegre edilen yüksek performanslı, sesli ("bip") geribildirime sahip barkod/karekod okuyucu.
- **PWA Desteği (vite-plugin-pwa):** Ana ekrana eklenebilme, otomatik güncelleme, servis worker üzerinden önbellekleme ve çevrimdışı kullanım.
- **Responsive & Adaptif Tasarım:** Tailwind CSS v4 ile kurgulanan iki ayrı Layout (Terminal ve Dashboard).
- **El Terminali Modülleri:** Stok Tarama, Hızlı Sayım, Depo Transferleri, Uyarılar ve Hızlı Ürün Ekleme (Manuel veya Kamera ile).
- **Zustand State Management:** Hızlı ve esnek global durum (state) yönetimi.
- **Gelecek Entegrasyon:** Firebase (Firestore, Auth, Storage) bağlantısına hazır mimari yapı (`src/lib/firebase.js`).

## Kurulum ve Çalıştırma

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

## Klasör Yapısı
- `src/components/layout/`: Masaüstü ve Mobil layout bileşenleri.
- `src/components/scanner/`: Barkod tarayıcı mantığı.
- `src/pages/`: Terminal ekranları (Ana Sayfa, Sayım, Transfer, Profil, Ekleme).
- `src/store/`: Zustand state dosyaları.
- `src/lib/`: Firebase konfigürasyonları.

## Versiyon Geçmişi
- **v1.0.0-beta:** Temel UI/UX yapısı, Router, Tailwind konfigürasyonları, Barkod okuma mantığı ve eksik modüllerin eklenmesi tamamlandı.

## Sıradaki Geliştirmeler
- Firebase JSON veritabanı yedeği / kimlik bilgilerinin entegrasyonu.
- Excel/PDF ayrıştırma algoritması (Cloud Functions & Cloud Vision / LLM API).
- Dashboard istatistiklerinin dinamik hale getirilmesi.
