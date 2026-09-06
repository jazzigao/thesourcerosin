import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type CartItem = {
  id: string;
  name: string;
  grams: number;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isReady: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, grams: number, quantity: number) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = 'the-source-mobile-cart';
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then((stored) => {
        if (stored) setItems(JSON.parse(stored) as CartItem[]);
      })
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(() => {
        // The cart remains available for the current session if storage is unavailable.
      });
    }
  }, [isReady, items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      subtotal,
      isReady,
      addItem: (nextItem) => {
        setItems((current) => {
          const index = current.findIndex(
            (item) => item.id === nextItem.id && item.grams === nextItem.grams,
          );
          if (index === -1) return [...current, { ...nextItem, quantity: 1 }];
          return current.map((item, itemIndex) =>
            itemIndex === index
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        });
      },
      updateQuantity: (id, grams, quantity) => {
        setItems((current) =>
          current.flatMap((item) => {
            if (item.id !== id || item.grams !== grams) return [item];
            return quantity > 0 ? [{ ...item, quantity }] : [];
          }),
        );
      },
      clearCart: () => setItems([]),
    };
  }, [isReady, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}