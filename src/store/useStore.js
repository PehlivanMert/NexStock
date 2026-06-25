import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  loadAppData, saveProducts, saveInventory, saveLocations,
  addTransferLog, loadTransferLog, addCountLog, loadCountLogs,
  loadAllUsers, logActivity
} from '../lib/firestoreService';

// ──────────────────────────────────────────────────────────────
// Role-based access control config
// ──────────────────────────────────────────────────────────────
export const ROLE_PERMISSIONS = {
  admin: {
    canAccessAdmin: true,
    canManageUsers: true,
    canManageLocations: true,
    canViewReports: true,
    canDeleteInventory: true,
    canImport: true,
    canTransfer: true,
    canCount: true,
  },
  manager: {
    canAccessAdmin: true,
    canManageUsers: false,
    canManageLocations: false,
    canViewReports: true,
    canDeleteInventory: true,
    canImport: true,
    canTransfer: true,
    canCount: true,
  },
  staff: {
    canAccessAdmin: false,
    canManageUsers: false,
    canManageLocations: false,
    canViewReports: false,
    canDeleteInventory: false,
    canImport: false,
    canTransfer: true,
    canCount: true,
  },
};

// Action labels for activity log
export const ACTION_LABELS = {
  ADD_PRODUCT: 'Ürün Eklendi',
  EDIT_PRODUCT: 'Ürün Düzenlendi',
  DELETE_PRODUCT: 'Ürün Silindi',
  TRANSFER: 'Transfer Yapıldı',
  COUNT: 'Sayım Tamamlandı',
  BULK_IMPORT: 'Toplu Aktarım',
  ADD_USER: 'Kullanıcı Eklendi',
  EDIT_USER: 'Kullanıcı Düzenlendi',
  DELETE_USER: 'Kullanıcı Silindi',
  ADD_LOCATION: 'Lokasyon Eklendi',
  EDIT_LOCATION: 'Lokasyon Düzenlendi',
  DELETE_LOCATION: 'Lokasyon Silindi',
};

export const useStore = create(
  persist(
    (set, get) => ({
      // ─── SESSION / AUTH ──────────────────────────────────────
      isLoggedIn: false,
      user: null,
      dataLoaded: false,

      login: (userData) => set({ isLoggedIn: true, user: userData }),
      logout: () => set({
        isLoggedIn: false, user: null, dataLoaded: false,
        // Reset transient data on logout
        transferLog: [], countLogs: [],
      }),
      updateProfile: (updates) => set((state) => ({
        user: { ...state.user, ...updates },
      })),

      setDataLoaded: (val) => set({ dataLoaded: val }),

      // ─── SEED / LOADED DATA ──────────────────────────────────
      locations: [],
      products: [],
      inventory: [],
      users: [],
      transferLog: [],
      countLogs: [],

      // ─── UI STATE ────────────────────────────────────────────
      activeLocation: null,
      isScanning: false,
      dismissedAlerts: [],
      readAlerts: [],

      setActiveLocation: (locationId) => set({ activeLocation: locationId }),
      setScanning: (status) => set({ isScanning: status }),
      setDismissedAlerts: (alerts) => set({ dismissedAlerts: typeof alerts === 'function' ? alerts(get().dismissedAlerts) : alerts }),
      setReadAlerts: (alerts) => set({ readAlerts: typeof alerts === 'function' ? alerts(get().readAlerts) : alerts }),

      // Load all data from Firestore (called once after login)
      loadFromFirestore: async () => {
        try {
          const state = get();
          const isPrivileged = state.user?.role === 'admin' || state.user?.role === 'manager';

          // Personel için kullanıcı listesi gerekmez — sorguyu atla (hız kazancı)
          const promises = [
            loadAppData().catch(err => {
              console.error('Failed to load appData:', err);
              return { products: [], inventory: [], locations: [] };
            }),
            loadTransferLog(100).catch(err => {
              console.error('Failed to load transfer logs:', err);
              return [];
            }),
            loadCountLogs(50).catch(err => {
              console.error('Failed to load count logs:', err);
              return [];
            }),
          ];

          if (isPrivileged) {
            promises.push(
              loadAllUsers().catch(err => {
                console.error('Failed to load users:', err);
                return [];
              })
            );
          }

          const results = await Promise.all(promises);
          const [appDataResult, transfersResult, countsResult, usersResult] = results;

          const loadedLocations = appDataResult.locations || [];

          set({
            products: appDataResult.products || [],
            inventory: appDataResult.inventory || [],
            locations: loadedLocations,
            transferLog: transfersResult || [],
            countLogs: countsResult || [],
            users: usersResult || [],
            dataLoaded: true,
          });

          // Mevcut kullanıcılarda activeLocationId eksik olabilir (eski hesaplar)
          // Lokasyonlar yüklendikten sonra hesapla ve düzelt
          const currentUser = get().user;
          if (currentUser && !currentUser.activeLocationId) {
            const isPrivilegedUser = currentUser.role === 'admin' || currentUser.role === 'manager';
            if (isPrivilegedUser) {
              set(state => ({ user: { ...state.user, activeLocationId: 'all' } }));
            } else if (currentUser.location) {
              const matchedLoc = loadedLocations.find(l => l.name === currentUser.location);
              if (matchedLoc) {
                set(state => ({ user: { ...state.user, activeLocationId: matchedLoc.id } }));
              }
            }
          }
        } catch (e) {
          console.error('Firestore load error:', e);
          set({ dataLoaded: true }); // continue even if load fails
        }
      },

      // ─── LOCATIONS ───────────────────────────────────────────
      addLocation: async (location) => {
        if (!get().dataLoaded) throw new Error("Data not loaded yet");
        const newLoc = { id: `loc-${Date.now()}`, ...location };
        const locations = [...get().locations, newLoc];
        set({ locations });
        await saveLocations(locations);
        const u = get().user;
        await logActivity({ action: 'ADD_LOCATION', userId: u?.uid, userName: u?.name, userRole: u?.role, details: { locationName: newLoc.name } });
      },
      updateLocation: async (id, updates) => {
        if (!get().dataLoaded) throw new Error("Data not loaded yet");
        const locations = get().locations.map(l => l.id === id ? { ...l, ...updates } : l);
        set({ locations });
        await saveLocations(locations);
        const u = get().user;
        await logActivity({ action: 'EDIT_LOCATION', userId: u?.uid, userName: u?.name, userRole: u?.role, details: { locationId: id, updates } });
      },
      deleteLocation: async (id) => {
        if (!get().dataLoaded) throw new Error("Data not loaded yet");
        const locations = get().locations.filter(l => l.id !== id);
        const inventory = get().inventory.filter(i => i.locationId !== id);
        set({ locations, inventory });
        await Promise.all([saveLocations(locations), saveInventory(inventory)]);
        const u = get().user;
        await logActivity({ action: 'DELETE_LOCATION', userId: u?.uid, userName: u?.name, userRole: u?.role, details: { locationId: id } });
      },

      // ─── PRODUCTS ────────────────────────────────────────────
      addProduct: async (product, locationId, quantity, shelf) => {
        if (!get().dataLoaded) throw new Error("Data not loaded yet");
        const newProductId = `p-${Date.now()}`;
        const newInvItem = {
          id: `inv-${Date.now()}`,
          locationId: locationId || get().locations[0]?.id,
          productId: newProductId,
          quantity: quantity || 0,
          shelf: shelf || 'Tanımsız',
        };
        const products = [...get().products, { id: newProductId, ...product }];
        const inventory = [...get().inventory, newInvItem];
        set({ products, inventory });
        await Promise.all([saveProducts(products), saveInventory(inventory)]);
        const u = get().user;
        await logActivity({ action: 'ADD_PRODUCT', userId: u?.uid, userName: u?.name, userRole: u?.role, details: { productName: product.name, sku: product.sku, quantity, locationId } });
      },

      updateProduct: async (productId, updates) => {
        if (!get().dataLoaded) throw new Error("Data not loaded yet");
        const products = get().products.map(p => p.id === productId ? { ...p, ...updates } : p);
        set({ products });
        await saveProducts(products);
        const u = get().user;
        await logActivity({ action: 'EDIT_PRODUCT', userId: u?.uid, userName: u?.name, userRole: u?.role, details: { productId, updates } });
      },

      deleteProduct: async (invId) => {
        if (!get().dataLoaded) throw new Error("Data not loaded yet");
        const item = get().inventory.find(i => i.id === invId);
        const product = item ? get().products.find(p => p.id === item.productId) : null;
        const inventory = get().inventory.filter(i => i.id !== invId);
        set({ inventory });
        await saveInventory(inventory);
        const u = get().user;
        await logActivity({ action: 'DELETE_PRODUCT', userId: u?.uid, userName: u?.name, userRole: u?.role, details: { productName: product?.name || invId, invId } });
      },

      // ─── INVENTORY ───────────────────────────────────────────
      updateInventoryCount: async (locationId, productId, newCount) => {
        if (!get().dataLoaded) throw new Error("Data not loaded yet");
        let inventory = [...get().inventory];
        const exists = inventory.find(inv => inv.locationId === locationId && inv.productId === productId);
        if (exists) {
          inventory = inventory.map(inv =>
            (inv.locationId === locationId && inv.productId === productId)
              ? { ...inv, quantity: Math.max(0, newCount) }
              : inv
          );
        } else {
          inventory.push({
            id: `inv-${Date.now()}`,
            locationId, productId,
            quantity: Math.max(0, newCount),
            shelf: 'Transfer Gelen',
          });
        }
        set({ inventory });
        await saveInventory(inventory);
      },

      updateInventoryItem: async (id, updates) => {
        if (!get().dataLoaded) throw new Error("Data not loaded yet");
        const item = get().inventory.find(i => i.id === id);
        const product = item ? get().products.find(p => p.id === item.productId) : null;
        const inventory = get().inventory.map(inv => inv.id === id ? { ...inv, ...updates } : inv);
        set({ inventory });
        await saveInventory(inventory);
        const u = get().user;
        await logActivity({ action: 'EDIT_PRODUCT', userId: u?.uid, userName: u?.name, userRole: u?.role, details: { productName: product?.name, invId: id, updates } });
      },

      saveCountLog: async (locationId, countData) => {
        const state = get();
        const locName = state.locations.find(l => l.id === locationId)?.name || locationId;
        const totalItems = countData.length;
        const discrepancies = countData.filter(c => c.counted !== c.expected).length;
        const newLog = {
          date: new Date().toISOString(),
          locationId,
          locationName: locName,
          user: state.user?.name || 'Bilinmeyen',
          userId: state.user?.uid,
          totalItems,
          discrepancies,
          items: countData,
        };
        set((s) => ({ countLogs: [...s.countLogs, { id: `count-${Date.now()}`, ...newLog }] }));
        await addCountLog(newLog);
        const u = state.user;
        await logActivity({
          action: 'COUNT',
          userId: u?.uid,
          userName: u?.name,
          userRole: u?.role,
          details: {
            locationName: locName,
            totalItems,
            discrepancies,
            items: countData.map(c => ({ name: c.name || '-', expected: c.expected || 0, counted: c.counted || 0 }))
          }
        });
      },

      // ─── TRANSFER ────────────────────────────────────────────
      performTransfer: async (sourceLocId, destLocId, selectedProducts) => {
        if (!get().dataLoaded) throw new Error("Data not loaded yet");
        const state = get();
        let inventory = [...state.inventory];

        selectedProducts.forEach(({ productId, transferQty }) => {
          inventory = inventory.map(inv =>
            (inv.locationId === sourceLocId && inv.productId === productId)
              ? { ...inv, quantity: Math.max(0, inv.quantity - transferQty) }
              : inv
          );
          const destExists = inventory.find(inv => inv.locationId === destLocId && inv.productId === productId);
          if (destExists) {
            inventory = inventory.map(inv =>
              (inv.locationId === destLocId && inv.productId === productId)
                ? { ...inv, quantity: inv.quantity + transferQty }
                : inv
            );
          } else {
            inventory.push({
              id: `inv-${Date.now()}-${productId}`,
              locationId: destLocId, productId,
              quantity: transferQty,
              shelf: 'Transfer Gelen',
            });
          }
        });

        const srcLoc = state.locations.find(l => l.id === sourceLocId)?.name || sourceLocId;
        const dstLoc = state.locations.find(l => l.id === destLocId)?.name || destLocId;
        const transferEntry = {
          from: srcLoc, to: dstLoc,
          items: selectedProducts,
          date: new Date().toISOString(),
          user: state.user?.name || 'Bilinmeyen',
          userId: state.user?.uid,
        };

        set((s) => ({
          inventory,
          transferLog: [...s.transferLog, { id: `tr-${Date.now()}`, ...transferEntry }],
        }));

        await Promise.all([
          saveInventory(inventory),
          addTransferLog(transferEntry),
        ]);

        const u = state.user;
        await logActivity({
          action: 'TRANSFER',
          userId: u?.uid,
          userName: u?.name,
          userRole: u?.role,
          details: {
            from: srcLoc,
            to: dstLoc,
            itemCount: selectedProducts.length,
            productNames: selectedProducts.map(p => `${p.name || p.productName} (${p.transferQty || p.quantity} adet)`).join(', '),
            items: selectedProducts.map(p => ({
              name: p.name || p.productName || '-',
              barcode: p.barcode || p.sku || '-',
              quantity: p.transferQty || p.quantity || 0
            }))
          }
        });
      },

      // ─── BULK IMPORT ─────────────────────────────────────────
      bulkImportProducts: async (productsArray, locationId) => {
        if (!get().dataLoaded) throw new Error("Data not loaded yet");
        const state = get();
        const products = [...state.products];
        const inventory = [...state.inventory];
        
        productsArray.forEach((p, idx) => {
          const pBarcode = (p.barcode || '').trim().toLowerCase();
          const pName = (p.name || '').trim().toLowerCase();
          
          let existingProduct = products.find(prod => 
            (pBarcode !== '-' && pBarcode !== '' && (prod.barcode || '').toLowerCase() === pBarcode) ||
            ((prod.name || '').toLowerCase() === pName)
          );

          let pid;
          if (existingProduct) {
            pid = existingProduct.id;
            // Optionally update empty fields
            if (!existingProduct.barcode || existingProduct.barcode === '-') existingProduct.barcode = p.barcode || '-';
            if (p.price !== undefined) existingProduct.price = p.price;
          } else {
            pid = `p-bulk-${Date.now()}-${idx}`;
            products.push({ id: pid, name: p.name, sku: p.sku || `SKU-${Date.now()}-${idx}`, barcode: p.barcode || '-', price: p.price || 0 });
          }

          let existingInv = inventory.find(inv => inv.productId === pid && inv.locationId === (locationId || state.locations[0]?.id));
          if (existingInv) {
            existingInv.quantity = (existingInv.quantity || 0) + (p.quantity || 0); // Adding to existing quantity
            if (p.shelf && p.shelf !== 'Toplu Aktarım') existingInv.shelf = p.shelf;
          } else {
            inventory.push({
              id: `inv-bulk-${Date.now()}-${idx}`,
              locationId: locationId || state.locations[0]?.id,
              productId: pid,
              quantity: p.quantity || 0,
              shelf: p.shelf || 'Toplu Aktarım',
            });
          }
        });

        set({ products, inventory });
        await Promise.all([saveProducts(products), saveInventory(inventory)]);
        const u = state.user;
        await logActivity({
          action: 'BULK_IMPORT',
          userId: u?.uid,
          userName: u?.name,
          userRole: u?.role,
          details: {
            count: productsArray.length,
            locationId,
            items: productsArray.map(p => ({
              name: p.name || 'İsimsiz Ürün',
              barcode: p.barcode || p.sku || '-',
              quantity: p.quantity || 0
            }))
          }
        });
      },

      // ─── USERS (Firestore-backed, admin only) ─────────────────
      setUsers: (users) => set({ users }),

      updateUserInList: (uid, updates) => set((state) => ({
        users: state.users.map(u => u.uid === uid ? { ...u, ...updates } : u),
        user: state.user?.uid === uid ? { ...state.user, ...updates } : state.user,
      })),

      removeUserFromList: (uid) => set((state) => ({
        users: state.users.filter(u => u.uid !== uid),
      })),
    }),
    {
      name: 'nexstock-v4',
      version: 4,
      migrate: () => ({}),
      // Only persist session & UI state, not full data (loaded from Firestore)
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        activeLocation: state.activeLocation,
        dismissedAlerts: state.dismissedAlerts,
        readAlerts: state.readAlerts,
      }),
    }
  )
);
