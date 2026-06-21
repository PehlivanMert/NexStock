# NexStock PWA - Inventory Management System

NexStock is a modern, responsive, and robust Progressive Web Application (PWA) designed for advanced inventory management. It features a glassmorphism-inspired UI, real-time database synchronization via Firebase Firestore, offline capabilities, and built-in hardware integration for barcode scanning.

## Key Features
* **Progressive Web App (PWA)**: Installable on iOS and Android devices, offering a native app experience with offline support.
* **Firebase Integration**: Secure user authentication and real-time database updates via Firestore.
* **Role-Based Access Control (RBAC)**: Distinct permissions for Admins, Managers, and Staff members.
* **Barcode Scanning**: Built-in camera barcode scanner with flashlight (torch) support for quick inventory counts and transfers.
* **Bulk Data Import**: Smart Excel/CSV parsing engine with dynamic header detection for rapid stock initialization and updates.
* **Multi-Location Support**: Manage inventory seamlessly across different warehouses and stores.
* **Activity & Transfer Logging**: Comprehensive tracking of all inventory movements, user activities, and stock counts.
* **Modern UI/UX**: State-of-the-art glassmorphism design with responsive components and intuitive user flows.

## Technologies Used
* **Frontend**: React (Vite), TailwindCSS, Lucide React
* **Backend & Auth**: Firebase (Auth, Firestore)
* **State Management**: Zustand (with persistent storage)
* **Utilities**: XLSX (for Excel parsing), ZXing (for barcode scanning), Recharts (for analytics)

## Setup Instructions
1. Clone the repository and navigate to the root directory.
2. Run `npm install` to install all necessary dependencies.
3. Set up your Firebase project and update the configuration variables in `src/lib/firebase.js`.
4. Run `npm run dev` to start the development server.
5. Use `npm run build` to generate the production-ready PWA bundle.

---

# NexStock PWA - Envanter Yönetim Sistemi

NexStock, gelişmiş envanter ve stok yönetimi için tasarlanmış modern, duyarlı ve güçlü bir Progresif Web Uygulamasıdır (PWA). Şık glassmorphism arayüzü, Firebase Firestore ile gerçek zamanlı veri senkronizasyonu, çevrimdışı çalışma desteği ve barkod okuma özellikleri ile donatılmıştır.

## Temel Özellikler
* **Progresif Web Uygulaması (PWA)**: iOS ve Android cihazlara uygulama olarak yüklenebilir, çevrimdışı destek ile yerel uygulama deneyimi sunar.
* **Firebase Entegrasyonu**: Güvenli kullanıcı kimlik doğrulaması ve Firestore üzerinden anlık veri güncellemeleri.
* **Rol Bazlı Erişim Kontrolü**: Yöneticiler (Admin), Müdürler (Manager) ve Personeller (Staff) için özel yetkilendirme sistemi.
* **Barkod Tarayıcı**: Hızlı stok sayımı ve transfer işlemleri için el feneri (flaş) destekli dâhili kamera barkod okuyucusu.
* **Toplu Veri Aktarımı**: Akıllı başlık tanıma sistemine sahip Excel/CSV okuma motoru sayesinde saniyeler içinde binlerce ürünü sisteme ekleme veya mevcudu güncelleme.
* **Çoklu Lokasyon Desteği**: Envanterleri farklı depolar ve mağazalar arasında sorunsuz bir şekilde yönetin.
* **Aktivite ve Transfer Günlükleri**: Yapılan tüm stok hareketlerinin, personel işlemlerinin ve sayımların detaylı takibi.
* **Modern UI/UX Tasarım**: Tüm ekran boyutlarına tam uyumlu, akıcı ve yeni nesil glassmorphism odaklı modern tasarım.

## Kullanılan Teknolojiler
* **Arayüz**: React (Vite), TailwindCSS, Lucide React
* **Arka Uç & Giriş**: Firebase (Auth, Firestore)
* **Durum Yönetimi**: Zustand (Yerel depolama desteği ile)
* **Araçlar**: XLSX (Excel okuma), ZXing (Barkod tarama), Recharts (Analiz grafikleri)

## Kurulum Talimatları
1. Projeyi bilgisayarınıza indirin ve ana dizine gidin.
2. Bağımlılıkları yüklemek için `npm install` komutunu çalıştırın.
3. Kendi Firebase projenizi oluşturun ve bağlantı ayarlarını `src/lib/firebase.js` dosyasına ekleyin.
4. Geliştirme sunucusunu başlatmak için `npm run dev` komutunu kullanın.
5. Uygulamayı yayına hazırlamak için `npm run build` komutunu çalıştırın.
