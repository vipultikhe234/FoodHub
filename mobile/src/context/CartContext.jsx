import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('cart');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Cart data corruption:", e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return removeFromCart(id);
        setCartItems(prev =>
            prev.map(item => item.id === id ? { ...item, quantity } : item)
        );
    };

    const clearCart = () => setCartItems([]);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, updateQuantity, clearCart, subtotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
