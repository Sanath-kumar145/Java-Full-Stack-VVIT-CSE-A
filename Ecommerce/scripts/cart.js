/**
 * ThinkMart Shared Cart Utility
 * Handles localStorage operations under 'thinkmart_cart'
 */

(function (window) {
  'use strict';

  const PRIMARY_CART_KEY = 'thinkmart_cart';
  const LEGACY_CART_KEY = 'thinkmart-cart';

  function formatMoney(amount) {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  function getCart() {
    try {
      const stored = localStorage.getItem(PRIMARY_CART_KEY) || localStorage.getItem(LEGACY_CART_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('ThinkMart Cart: failed to parse cart data, resetting.', e);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      const cleanCart = Array.isArray(cart) ? cart.filter(item => item && item.id && item.quantity > 0) : [];
      const stringified = JSON.stringify(cleanCart);
      localStorage.setItem(PRIMARY_CART_KEY, stringified);
      localStorage.setItem(LEGACY_CART_KEY, stringified);
      updateCartBadges(cleanCart);
      window.dispatchEvent(new CustomEvent('thinkmart:cart-updated', { detail: { cart: cleanCart } }));
    } catch (e) {
      console.error('ThinkMart Cart: failed to save cart.', e);
    }
  }

  function getCartCount(cart = getCart()) {
    return cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }

  function updateCartBadges(cart = getCart()) {
    const count = getCartCount(cart);
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.add('has-items');
      } else {
        badge.classList.remove('has-items');
      }
    });
  }

  function addToCart(productOrId, quantityToAdd = 1) {
    let product = null;

    if (typeof productOrId === 'string') {
      if (typeof window.getProductById === 'function') {
        product = window.getProductById(productOrId);
      }
      if (!product && typeof THINKMART_PRODUCTS !== 'undefined') {
        product = THINKMART_PRODUCTS.find(p => p.id === productOrId);
      }
    } else if (typeof productOrId === 'object' && productOrId !== null) {
      product = productOrId;
    }

    if (!product || !product.id) {
      showToast('Could not add item to cart.', 'error');
      return false;
    }

    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += (Number(quantityToAdd) || 1);
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image || '',
        category: product.category || 'Tech',
        quantity: Number(quantityToAdd) || 1
      });
    }

    saveCart(cart);
    showToast(`Added "${product.name}" to cart!`, 'success');
    return true;
  }

  function updateQuantity(productId, newQty) {
    const cart = getCart();
    const qty = Number(newQty);
    if (isNaN(qty) || qty <= 0) {
      return removeFromCart(productId);
    }
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity = qty;
      saveCart(cart);
    }
  }

  function removeFromCart(productId) {
    const cart = getCart();
    const filtered = cart.filter(i => i.id !== productId);
    saveCart(filtered);
    showToast('Item removed from cart.', 'info');
  }

  function clearCart() {
    saveCart([]);
    showToast('Cart cleared.', 'info');
  }

  function getCartTotals(cart = getCart()) {
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const shipping = (subtotal === 0 || subtotal >= 999) ? 0 : 99; // Free shipping on orders >= ₹999
    const grandTotal = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      grandTotal,
      isFreeShipping: subtotal >= 999 || subtotal === 0
    };
  }

  function showToast(message, type = 'info') {
    let container = document.getElementById('thinkmart-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'thinkmart-toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `thinkmart-toast toast-${type}`;
    toast.style.cssText = `
      background: #172033;
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
      animation: thinkmartSlideIn 0.3s ease forwards;
      border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6855e8'};
    `;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="font-weight: bold; color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#a78bfa'}">${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Expose global ThinkMartCart namespace and individual functions
  window.ThinkMartCart = {
    getCart,
    saveCart,
    getCartCount,
    updateCartBadges,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotals,
    formatMoney,
    showToast
  };

  // Global helper shortcuts for inline or direct handler calls
  window.formatMoney = formatMoney;
  window.updateCartCounts = updateCartBadges;

  document.addEventListener('DOMContentLoaded', () => {
    updateCartBadges();
  });

})(window);
