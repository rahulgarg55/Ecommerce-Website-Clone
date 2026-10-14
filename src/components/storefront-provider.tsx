"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "@firebase/auth";
import { firebaseAuth, firebaseConfigured } from "@/lib/firebase/client";
import type { Size } from "@/lib/catalog";

export type CartItem = {
  productId: string;
  size: Size;
  quantity: number;
};

type StorefrontContextValue = {
  user: User | null;
  authReady: boolean;
  cart: CartItem[];
  wishlist: string[];
  cartCount: number;
  addToCart: (productId: string, size: Size, quantity?: number) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, size: Size, quantity: number) => void;
  removeFromCart: (productId: string, size: Size) => void;
  toggleWishlist: (productId: string) => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);
const CART_STORAGE_KEY = "fashion-x-cart";
const WISHLIST_STORAGE_KEY = "fashion-x-wishlist";

function parseCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is CartItem =>
    typeof item === "object" &&
    item !== null &&
    typeof item.productId === "string" &&
    (item.size === "XS" || item.size === "S" || item.size === "M" || item.size === "L" || item.size === "XL" || item.size === "One size") &&
    Number.isInteger(item.quantity) &&
    item.quantity >= 1 &&
    item.quantity <= 10,
  );
}

function parseWishlist(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function createPersistentStore<T>(key: string, parse: (value: unknown) => T) {
  const emptySnapshot = [] as unknown as T;
  let snapshot = emptySnapshot;
  let cachedRaw: string | null | undefined;
  const listeners = new Set<() => void>();

  function getSnapshot() {
    if (typeof window === "undefined") return emptySnapshot;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === cachedRaw) return snapshot;
      cachedRaw = raw;
      snapshot = raw ? parse(JSON.parse(raw)) : emptySnapshot;
    } catch (error) {
      console.error(`Could not restore ${key} from browser storage.`, error);
      cachedRaw = null;
      snapshot = emptySnapshot;
    }
    return snapshot;
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    function onStorage(event: StorageEvent) {
      if (event.key !== key && event.key !== null) return;
      cachedRaw = undefined;
      getSnapshot();
      notify();
    }
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function set(next: T | ((current: T) => T)) {
    const current = getSnapshot();
    snapshot = typeof next === "function" ? (next as (value: T) => T)(current) : next;
    cachedRaw = JSON.stringify(snapshot);
    try {
      window.localStorage.setItem(key, cachedRaw);
    } catch (error) {
      console.error(`Could not save ${key} to browser storage.`, error);
    }
    notify();
  }

  return { getSnapshot, subscribe, set, emptySnapshot };
}

const cartStore = createPersistentStore(CART_STORAGE_KEY, parseCart);
const wishlistStore = createPersistentStore(WISHLIST_STORAGE_KEY, parseWishlist);

function requiredAuth() {
  if (!firebaseAuth || !firebaseConfigured) {
    throw new Error("Accounts are not enabled yet. The store owner needs to connect Firebase.");
  }
  return firebaseAuth;
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseAuth);
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, () => cartStore.emptySnapshot);
  const wishlist = useSyncExternalStore(wishlistStore.subscribe, wishlistStore.getSnapshot, () => wishlistStore.emptySnapshot);

  useEffect(() => {
    if (!firebaseAuth) return;
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  const addToCart = useCallback((productId: string, size: Size, quantity = 1) => {
    cartStore.set((items: CartItem[]) => {
      const existing = items.find((item) => item.productId === productId && item.size === size);
      if (existing) {
        return items.map((item) =>
          item === existing ? { ...item, quantity: Math.min(10, item.quantity + quantity) } : item,
        );
      }
      return [...items, { productId, size, quantity: Math.min(10, quantity) }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, size: Size, quantity: number) => {
    if (quantity < 1) {
      cartStore.set((items: CartItem[]) => items.filter((item) => item.productId !== productId || item.size !== size));
      return;
    }
    cartStore.set((items: CartItem[]) =>
      items.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: Math.min(10, quantity) }
          : item,
      ),
    );
  }, []);

  const removeFromCart = useCallback((productId: string, size: Size) => {
    cartStore.set((items: CartItem[]) => items.filter((item) => item.productId !== productId || item.size !== size));
  }, []);

  const clearCart = useCallback(() => {
    cartStore.set([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    wishlistStore.set((items: string[]) =>
      items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId],
    );
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const auth = requiredAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    setUser(credential.user);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(requiredAuth(), email, password);
    setUser(credential.user);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const credential = await signInWithPopup(requiredAuth(), new GoogleAuthProvider());
    setUser(credential.user);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(requiredAuth(), email);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(requiredAuth());
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authReady,
      cart,
      wishlist,
      cartCount: cart.reduce((total, item) => total + item.quantity, 0),
      addToCart,
      clearCart,
      updateQuantity,
      removeFromCart,
      toggleWishlist,
      signUp,
      signIn,
      signInWithGoogle,
      resetPassword,
      signOutUser,
    }),
    [user, authReady, cart, wishlist, addToCart, clearCart, updateQuantity, removeFromCart, toggleWishlist, signUp, signIn, signInWithGoogle, resetPassword, signOutUser],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) throw new Error("useStorefront must be used inside StorefrontProvider.");
  return context;
}
