import { create } from 'zustand';

const getInitialCart = () => {
  try {
    const saved = localStorage.getItem('homemart_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const useCartStore = create((set, get) => ({
  cart: getInitialCart(),

  addToCart: (product, quantity = 1) => {
    const { cart } = get();
    const existingIndex = cart.findIndex(item => item.productId === product.id);
    let newCart;

    if (existingIndex > -1) {
      newCart = cart.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      newCart = [
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.finalPrice,
          originalPrice: product.price,
          imageUrl: product.imageUrl,
          quantity
        }
      ];
    }

    localStorage.setItem('homemart_cart', JSON.stringify(newCart));
    set({ cart: newCart });
  },

  updateQuantity: (productId, delta) => {
    const { cart } = get();
    const newCart = cart
      .map(item => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    localStorage.setItem('homemart_cart', JSON.stringify(newCart));
    set({ cart: newCart });
  },

  removeFromCart: (productId) => {
    const { cart } = get();
    const newCart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('homemart_cart', JSON.stringify(newCart));
    set({ cart: newCart });
  },

  clearCart: () => {
    localStorage.removeItem('homemart_cart');
    set({ cart: [] });
  },

  getTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}));
