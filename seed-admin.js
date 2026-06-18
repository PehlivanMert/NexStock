/**
 * seed-admin.js
 *
 * Bu script, Firebase projesinde test@test.com kullanıcısını
 * Firestore'a admin olarak kayıt eder.
 *
 * Kullanım:
 *   node seed-admin.js
 *
 * NOT: Bu scripti çalıştırmadan önce aşağıdakileri yapın:
 *   1. npm install firebase-admin
 *   2. Firebase Console > Project Settings > Service Accounts > Generate Key
 *   3. İndirilen JSON dosyasını bu dizine kopyalayın ve adını 'serviceAccount.json' yapın
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'nexstock-9353e',
});

const db = admin.firestore();
const auth = admin.auth();

async function seedAdmin() {
  try {
    // Find user by email
    const userRecord = await auth.getUserByEmail('test@test.com');
    console.log('✅ Firebase Auth kullanıcı bulundu:', userRecord.uid);

    // Write admin profile to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name: 'Admin',
      email: 'test@test.com',
      role: 'admin',
      location: 'Tüm Lokasyonlar',
      status: 'Aktif',
      phone: '',
      notifications: { lowStock: true, transfer: true, count: false },
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Firestore profili oluşturuldu!');
    console.log('   UID:', userRecord.uid);
    console.log('   E-posta: test@test.com');
    console.log('   Rol: admin');
    console.log('');
    console.log('🎉 Artık test@test.com / test123 ile giriş yapabilirsiniz.');

    // Initialize default locations if not exists
    const locDoc = await db.collection('appdata').doc('locations').get();
    if (!locDoc.exists) {
      await db.collection('appdata').doc('locations').set({
        list: [
          { id: 'loc-1', name: 'Merkez Depo', type: 'warehouse', address: 'İstanbul', status: 'active' },
          { id: 'loc-2', name: 'Şube Mağaza', type: 'store', address: 'İstanbul', status: 'active' },
        ],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Varsayılan lokasyonlar oluşturuldu.');
    }

    // Initialize empty products and inventory if not exists
    const prodDoc = await db.collection('appdata').doc('products').get();
    if (!prodDoc.exists) {
      await db.collection('appdata').doc('products').set({ list: [], updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      await db.collection('appdata').doc('inventory').set({ list: [], updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      console.log('✅ Boş envanter koleksiyonları oluşturuldu.');
    }

  } catch (err) {
    console.error('❌ Hata:', err.message);
    if (err.code === 'auth/user-not-found') {
      console.log('💡 test@test.com kullanıcısı Firebase Auth\'ta bulunamadı.');
      console.log('   Lütfen Firebase Console\'dan bu kullanıcıyı oluşturun.');
    }
  }

  process.exit(0);
}

seedAdmin();
