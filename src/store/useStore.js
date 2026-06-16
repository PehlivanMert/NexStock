import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useStore = create(
  persist(
    (set, get) => ({
      // ─── SESSION / AUTH ──────────────────────────────────────
      isLoggedIn: false,
      user: null,

      login: (userData) => set({ isLoggedIn: true, user: userData }),
      logout: () => set({ isLoggedIn: false, user: null }),
      updateProfile: (updates) => set((state) => ({
        user: { ...state.user, ...updates },
        users: state.users.map(u => u.id === state.user?.id ? { ...u, ...updates } : u),
      })),

      // ─── SEED DATA ───────────────────────────────────────────
      locations: [
        { id: 'loc-1', name: 'Merkez Depo', type: 'warehouse', address: 'Ataşehir, İstanbul', status: 'active' },
        { id: 'loc-2', name: 'Kadıköy Mağaza', type: 'store', address: 'Moda Cad. No: 12', status: 'active' },
        { id: 'loc-3', name: 'Şişli Mağaza', type: 'store', address: 'Halaskargazi Cad.', status: 'inactive' },
      ],

      products: [
        { id: 'p-1', name: 'iPhone 15 Pro', sku: 'IP15P-256-BLK', barcode: '123456789' },
        { id: 'p-2', name: 'MacBook Air M2', sku: 'MBA-M2-512-SLV', barcode: '987654321' },
        { id: 'p-3', name: 'AirPods Pro 2', sku: 'APP2-WHT', barcode: '456123789' },
      ],

      inventory: [
        { id: 'inv-1', locationId: 'loc-1', productId: 'p-1', quantity: 45, shelf: 'A-12' },
        { id: 'inv-2', locationId: 'loc-1', productId: 'p-2', quantity: 12, shelf: 'B-04' },
        { id: 'inv-3', locationId: 'loc-2', productId: 'p-1', quantity: 5, shelf: 'Vitrin' },
        { id: 'inv-4', locationId: 'loc-2', productId: 'p-3', quantity: 15, shelf: 'Kasa' },
      ],

      users: [
        { id: 1, name: 'Ali Yılmaz', email: 'ali@nexstock.com', password: '1234', role: 'admin', location: 'Tüm Lokasyonlar', activeLocationId: 'loc-1', status: 'Aktif', phone: '+90 532 111 22 33', notifications: { lowStock: true, transfer: true, count: false } },
        { id: 2, name: 'Ayşe Kaya', email: 'ayse@nexstock.com', password: '1234', role: 'manager', location: 'Merkez Depo', activeLocationId: 'loc-1', status: 'Aktif', phone: '', notifications: { lowStock: true, transfer: false, count: true } },
        { id: 3, name: 'Mehmet Demir', email: 'mehmet@nexstock.com', password: '1234', role: 'staff', location: 'Kadıköy Mağaza', activeLocationId: 'loc-2', status: 'Aktif', phone: '', notifications: { lowStock: false, transfer: true, count: true } },
      ],

      transferLog: [],

      // ─── UI STATE ────────────────────────────────────────────
      activeLocation: null,
      isScanning: false,

      setActiveLocation: (locationId) => set({ activeLocation: locationId }),
      setScanning: (status) => set({ isScanning: status }),

      // ─── LOCATIONS ───────────────────────────────────────────
      addLocation: (location) => set((state) => ({
        locations: [...state.locations, { id: `loc-${Date.now()}`, ...location }],
      })),
      updateLocation: (id, updates) => set((state) => ({
        locations: state.locations.map(l => l.id === id ? { ...l, ...updates } : l),
      })),
      deleteLocation: (id) => set((state) => ({
        locations: state.locations.filter(l => l.id !== id),
        inventory: state.inventory.filter(i => i.locationId !== id),
      })),

      // ─── PRODUCTS ────────────────────────────────────────────
      addProduct: (product, locationId, quantity, shelf) => set((state) => {
        const newProductId = `p-${Date.now()}`;
        return {
          products: [...state.products, { id: newProductId, ...product }],
          inventory: [...state.inventory, {
            id: `inv-${Date.now()}`,
            locationId: locationId || state.locations[0]?.id,
            productId: newProductId,
            quantity: quantity || 0,
            shelf: shelf || 'Tanımsız',
          }],
        };
      }),

      deleteProduct: (invId) => set((state) => ({
        inventory: state.inventory.filter(i => i.id !== invId),
      })),

      // ─── INVENTORY ───────────────────────────────────────────
      updateInventoryCount: (locationId, productId, newCount) => set((state) => {
        const exists = state.inventory.find(inv => inv.locationId === locationId && inv.productId === productId);
        if (exists) {
          return {
            inventory: state.inventory.map(inv =>
              (inv.locationId === locationId && inv.productId === productId)
                ? { ...inv, quantity: Math.max(0, newCount) }
                : inv
            ),
          };
        }
        return {
          inventory: [...state.inventory, {
            id: `inv-${Date.now()}`,
            locationId,
            productId,
            quantity: Math.max(0, newCount),
            shelf: 'Transfer Gelen',
          }],
        };
      }),

      updateInventoryItem: (id, updates) => set((state) => ({
        inventory: state.inventory.map(inv => inv.id === id ? { ...inv, ...updates } : inv),
      })),

      // ─── TRANSFER ────────────────────────────────────────────
      performTransfer: (sourceLocId, destLocId, selectedProducts) => set((state) => {
        let newInventory = [...state.inventory];

        selectedProducts.forEach(({ productId, transferQty }) => {
          newInventory = newInventory.map(inv =>
            (inv.locationId === sourceLocId && inv.productId === productId)
              ? { ...inv, quantity: Math.max(0, inv.quantity - transferQty) }
              : inv
          );
          const destExists = newInventory.find(inv => inv.locationId === destLocId && inv.productId === productId);
          if (destExists) {
            newInventory = newInventory.map(inv =>
              (inv.locationId === destLocId && inv.productId === productId)
                ? { ...inv, quantity: inv.quantity + transferQty }
                : inv
            );
          } else {
            newInventory.push({
              id: `inv-${Date.now()}-${productId}`,
              locationId: destLocId,
              productId,
              quantity: transferQty,
              shelf: 'Transfer Gelen',
            });
          }
        });

        const srcLoc = state.locations.find(l => l.id === sourceLocId)?.name || sourceLocId;
        const dstLoc = state.locations.find(l => l.id === destLocId)?.name || destLocId;

        return {
          inventory: newInventory,
          transferLog: [...state.transferLog, {
            id: `tr-${Date.now()}`,
            from: srcLoc,
            to: dstLoc,
            items: selectedProducts,
            date: new Date().toISOString(),
            user: state.user?.name || 'Bilinmeyen',
          }],
        };
      }),

      // ─── BULK IMPORT ─────────────────────────────────────────
      bulkImportProducts: (productsArray, locationId) => set((state) => {
        const newProducts = [];
        const newInventory = [];
        productsArray.forEach((p, idx) => {
          const pid = `p-bulk-${Date.now()}-${idx}`;
          newProducts.push({ id: pid, name: p.name, sku: p.sku || `SKU-${Date.now()}-${idx}`, barcode: p.barcode || '-' });
          newInventory.push({
            id: `inv-bulk-${Date.now()}-${idx}`,
            locationId: locationId || state.locations[0]?.id,
            productId: pid,
            quantity: p.quantity || 10,
            shelf: 'Toplu Aktarım',
          });
        });
        return {
          products: [...state.products, ...newProducts],
          inventory: [...state.inventory, ...newInventory],
        };
      }),

      // ─── USERS ───────────────────────────────────────────────
      addUser: (user) => set((state) => ({
        users: [...state.users, { id: Date.now(), password: '1234', notifications: { lowStock: true, transfer: true, count: false }, ...user }],
      })),
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...updates } : u),
        // Also update logged-in user if it's them
        user: state.user?.id === id ? { ...state.user, ...updates } : state.user,
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id),
      })),
    }),
    {
      name: 'nexstock-local-db',
      version: 3, // bump this whenever the schema changes to auto-migrate
      migrate: (persistedState, fromVersion) => {
        // On schema upgrade, reset to fresh seed data
        return {}; // returning empty forces store to use initial state
      },
    }
  )
);
