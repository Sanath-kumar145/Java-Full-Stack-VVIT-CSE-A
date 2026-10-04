/**
 * ThinkMart Main Application Script
 * Controls interactive UI, catalog rendering, cart page, forms validation & checkout.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Helper references
  const cartUtil = window.ThinkMartCart || {};

  /* ==========================================================================
     1. GLOBAL NAVIGATION & HEADER LOGIC
     ========================================================================== */

  // Active link highlighter based on location
  const currentPath = window.location.pathname.toLowerCase();
  document.querySelectorAll('.main-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.endsWith(href.replace('./', '').replace('../', '').toLowerCase())) {
      link.classList.add('active');
    }
  });

  // Global search input handling in header or hero
  document.querySelectorAll('.header-search-form, .hero-search-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = form.querySelector('input[type="search"], input[type="text"]');
      if (searchInput && searchInput.value.trim()) {
        const query = encodeURIComponent(searchInput.value.trim());
        // Determine relative path to Products page
        const targetPage = window.location.pathname.includes('/pages/') ? 'Products.html' : 'pages/Products.html';
        window.location.href = `${targetPage}?search=${query}`;
      }
    });
  });

  // Check demo user login status
  const currentUser = localStorage.getItem('thinkmart_user');
  const userAccountNav = document.querySelector('.nav-login');
  if (userAccountNav && currentUser) {
    userAccountNav.textContent = `👤 ${currentUser}`;
    userAccountNav.href = window.location.pathname.includes('/pages/') ? 'Login.html' : 'pages/Login.html';
  }

  /* ==========================================================================
     2. PRODUCTS PAGE (pages/Products.html)
     ========================================================================== */

  const productGrid = document.getElementById('products-grid');
  if (productGrid && typeof THINKMART_PRODUCTS !== 'undefined') {
    const searchInput = document.getElementById('product-search-input');
    const categoryContainer = document.getElementById('category-filters');
    const sortSelect = document.getElementById('sort-select');
    const clearBtn = document.getElementById('clear-filters-btn');
    const resultsCountEl = document.getElementById('results-count');

    // Read URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    let currentSearch = urlParams.get('search') || '';
    let currentCategory = urlParams.get('category') || 'All';
    let currentSort = 'default';

    if (searchInput && currentSearch) {
      searchInput.value = currentSearch;
    }

    // Set initial category active state
    if (categoryContainer) {
      categoryContainer.querySelectorAll('.filter-pill').forEach(btn => {
        if (btn.dataset.category && btn.dataset.category.toLowerCase() === currentCategory.toLowerCase()) {
          btn.classList.add('active');
        } else if (!currentCategory && btn.dataset.category === 'All') {
          btn.classList.add('active');
        }
      });
    }

    function renderProducts() {
      let filtered = [...THINKMART_PRODUCTS];

      // Filter by search query
      if (currentSearch) {
        const q = currentSearch.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }

      // Filter by category
      if (currentCategory && currentCategory !== 'All') {
        filtered = filtered.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
      }

      // Sort products
      if (currentSort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (currentSort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (currentSort === 'rating-desc') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (currentSort === 'discount-desc') {
        filtered.sort((a, b) => {
          const discA = ((a.originalPrice - a.price) / a.originalPrice);
          const discB = ((b.originalPrice - b.price) / b.originalPrice);
          return discB - discA;
        });
      }

      // Update count element
      if (resultsCountEl) {
        resultsCountEl.textContent = `Showing ${filtered.length} of ${THINKMART_PRODUCTS.length} products`;
      }

      // Render cards
      if (filtered.length === 0) {
        productGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;" class="no-results">
            <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
            <h3>No products found</h3>
            <p style="color: var(--muted); font-size: 14px; margin: 8px 0 20px;">Try adjusting your search terms or filter criteria.</p>
            <button type="button" class="btn btn-primary" id="reset-search-btn">Reset All Filters</button>
          </div>
        `;
        const resetBtn = document.getElementById('reset-search-btn');
        if (resetBtn) resetBtn.addEventListener('click', resetFilters);
        return;
      }

      productGrid.innerHTML = filtered.map(p => {
        const moneyPrice = cartUtil.formatMoney ? cartUtil.formatMoney(p.price) : `₹${p.price}`;
        const moneyOrig = cartUtil.formatMoney ? cartUtil.formatMoney(p.originalPrice) : `₹${p.originalPrice}`;

        return `
          <article class="product-card" data-id="${p.id}">
            <div class="product-image">
              <span class="discount">${p.discountTag || 'SALE'}</span>
              <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'">
            </div>
            <div class="product-info">
              <div class="category">${p.brand.toUpperCase()} • ${p.category.toUpperCase()}</div>
              <h2>${p.name}</h2>
              <div class="rating">
                ★ ${p.rating} <span>(${p.reviews} reviews)</span>
              </div>
              <div class="price-row">
                <strong>${moneyPrice}</strong>
                <del>${moneyOrig}</del>
              </div>
              <button type="button" class="btn btn-primary add-to-cart-btn" data-id="${p.id}">
                🛒 Add to Cart
              </button>
            </div>
          </article>
        `;
      }).join('');
    }

    function resetFilters() {
      currentSearch = '';
      currentCategory = 'All';
      currentSort = 'default';
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'default';
      if (categoryContainer) {
        categoryContainer.querySelectorAll('.filter-pill').forEach(b => {
          b.classList.toggle('active', b.dataset.category === 'All');
        });
      }
      renderProducts();
    }

    // Category button clicks
    if (categoryContainer) {
      categoryContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.filter-pill');
        if (pill) {
          categoryContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
          pill.classList.add('active');
          currentCategory = pill.dataset.category || 'All';
          renderProducts();
        }
      });
    }

    // Live search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim();
        renderProducts();
      });
    }

    // Sort select
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderProducts();
      });
    }

    // Clear filters button
    if (clearBtn) {
      clearBtn.addEventListener('click', resetFilters);
    }

    // Add to cart delegated listener
    productGrid.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.add-to-cart-btn');
      if (addBtn) {
        const prodId = addBtn.dataset.id;
        if (cartUtil.addToCart) {
          cartUtil.addToCart(prodId);
          addBtn.textContent = '✓ Added!';
          addBtn.style.background = '#10b981';
          setTimeout(() => {
            addBtn.textContent = '🛒 Add to Cart';
            addBtn.style.background = '';
          }, 1200);
        }
      }
    });

    renderProducts();
  }

  /* ==========================================================================
     3. CART PAGE (pages/Cart.html)
     ========================================================================== */

  const cartItemsContainer = document.getElementById('cart-items-list');
  if (cartItemsContainer) {
    function renderCartPage() {
      const cart = cartUtil.getCart ? cartUtil.getCart() : [];
      const totals = cartUtil.getCartTotals ? cartUtil.getCartTotals(cart) : { subtotal: 0, tax: 0, shipping: 0, grandTotal: 0 };

      // Subtotal & summary updates
      const subtotalEl = document.getElementById('cart-subtotal');
      const taxEl = document.getElementById('cart-tax');
      const shippingEl = document.getElementById('cart-shipping');
      const totalEl = document.getElementById('cart-total');
      const checkoutBtn = document.getElementById('proceed-checkout-btn');
      const clearCartBtn = document.getElementById('clear-cart-btn');

      if (subtotalEl) subtotalEl.textContent = cartUtil.formatMoney(totals.subtotal);
      if (taxEl) taxEl.textContent = cartUtil.formatMoney(totals.tax);
      if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'FREE' : cartUtil.formatMoney(totals.shipping);
      if (totalEl) totalEl.textContent = cartUtil.formatMoney(totals.grandTotal);

      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
          <div class="empty-cart">
            <div class="empty-icon">🛍️</div>
            <h3>Your Cart is Empty</h3>
            <p>Looks like you haven't added any items to your shopping cart yet.</p>
            <a class="btn btn-primary" href="./Products.html" style="margin-top: 15px;">Explore Products</a>
          </div>
        `;
        if (checkoutBtn) checkoutBtn.disabled = true;
        if (clearCartBtn) clearCartBtn.style.display = 'none';
        return;
      }

      if (checkoutBtn) checkoutBtn.disabled = false;
      if (clearCartBtn) clearCartBtn.style.display = 'inline-block';

      cartItemsContainer.innerHTML = cart.map(item => `
        <article class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'">
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p class="item-price">${cartUtil.formatMoney(item.price)}</p>
            <div class="quantity-control">
              <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="remove-item" data-id="${item.id}">Remove</button>
          </div>
          <div class="cart-item-total" style="text-align: right;">
            <strong style="font-size: 16px; color: var(--ink);">${cartUtil.formatMoney(item.price * item.quantity)}</strong>
          </div>
        </article>
      `).join('');
    }

    // Delegated actions for cart items
    cartItemsContainer.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      const removeBtn = e.target.closest('.remove-item');

      if (actionBtn) {
        const id = actionBtn.dataset.id;
        const action = actionBtn.dataset.action;
        const cart = cartUtil.getCart();
        const item = cart.find(i => i.id === id);

        if (item) {
          if (action === 'increase') {
            cartUtil.updateQuantity(id, item.quantity + 1);
          } else if (action === 'decrease') {
            cartUtil.updateQuantity(id, item.quantity - 1);
          }
          renderCartPage();
        }
      } else if (removeBtn) {
        const id = removeBtn.dataset.id;
        cartUtil.removeFromCart(id);
        renderCartPage();
      }
    });

    // Clear cart button
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
          cartUtil.clearCart();
          renderCartPage();
        }
      });
    }

    // Listen to global cart update event
    window.addEventListener('thinkmart:cart-updated', renderCartPage);

    renderCartPage();

    /* --- Checkout Modal Logic --- */
    const checkoutBtn = document.getElementById('proceed-checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModalBtn = document.getElementById('close-checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const confirmationModal = document.getElementById('order-confirmation-modal');

    if (checkoutBtn && checkoutModal) {
      checkoutBtn.addEventListener('click', () => {
        const cart = cartUtil.getCart();
        if (cart.length === 0) {
          cartUtil.showToast('Your cart is empty!', 'error');
          return;
        }
        // Update summary inside modal
        const totals = cartUtil.getCartTotals(cart);
        const modalTotalEl = document.getElementById('modal-checkout-total');
        if (modalTotalEl) modalTotalEl.textContent = cartUtil.formatMoney(totals.grandTotal);
        checkoutModal.style.display = 'flex';
      });
    }

    if (closeModalBtn && checkoutModal) {
      closeModalBtn.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
      });
    }

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('checkout-name').value.trim();
        const address = document.getElementById('checkout-address').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();

        if (!name || !address || !phone) {
          cartUtil.showToast('Please fill in all required shipping fields.', 'error');
          return;
        }

        const cart = cartUtil.getCart();
        const totals = cartUtil.getCartTotals(cart);
        const orderId = 'TM-' + Math.floor(100000 + Math.random() * 900000);

        // Hide checkout modal
        if (checkoutModal) checkoutModal.style.display = 'none';

        // Populate order confirmation modal
        const confIdEl = document.getElementById('conf-order-id');
        const confNameEl = document.getElementById('conf-customer-name');
        const confTotalEl = document.getElementById('conf-order-total');

        if (confIdEl) confIdEl.textContent = orderId;
        if (confNameEl) confNameEl.textContent = name;
        if (confTotalEl) confTotalEl.textContent = cartUtil.formatMoney(totals.grandTotal);

        // Clear cart
        cartUtil.clearCart();
        renderCartPage();

        // Show order confirmation modal
        if (confirmationModal) confirmationModal.style.display = 'flex';
      });
    }

    const closeConfBtn = document.getElementById('close-confirmation-btn');
    if (closeConfBtn && confirmationModal) {
      closeConfBtn.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
        window.location.href = './Products.html';
      });
    }
  }

  /* ==========================================================================
     4. LOGIN PAGE (index.html / Login.html)
     ========================================================================== */

  const loginForm = document.getElementById('thinkmart-login-form');
  if (loginForm) {
    const togglePassBtn = document.getElementById('toggle-login-password');
    const passInput = document.getElementById('login-password');

    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', () => {
        const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passInput.setAttribute('type', type);
        togglePassBtn.textContent = type === 'password' ? '👁️ Show' : '🙈 Hide';
      });
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = passInput.value.trim();
      const errorFeedback = document.getElementById('login-feedback');

      if (!email || !password) {
        if (errorFeedback) {
          errorFeedback.textContent = 'Please enter both your email and password.';
          errorFeedback.style.color = '#ef4444';
        }
        return;
      }

      // Store demo user session
      const userName = email.split('@')[0];
      localStorage.setItem('thinkmart_user', userName);

      if (cartUtil.showToast) {
        cartUtil.showToast(`Welcome back, ${userName}! (Demo Login)`, 'success');
      }

      setTimeout(() => {
        const targetHome = window.location.pathname.includes('/pages/') ? 'Home-Page.html' : 'pages/Home-Page.html';
        window.location.href = targetHome;
      }, 1000);
    });
  }

  /* ==========================================================================
     5. REGISTRATION PAGE (Register-Page.html / Register.html)
     ========================================================================== */

  const registerForm = document.getElementById('thinkmart-register-form');
  if (registerForm) {
    const passInput = document.getElementById('reg-password');
    const confirmInput = document.getElementById('reg-confirm-password');
    const toggleRegPassBtn = document.getElementById('toggle-reg-password');

    if (toggleRegPassBtn && passInput && confirmInput) {
      toggleRegPassBtn.addEventListener('click', () => {
        const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passInput.setAttribute('type', type);
        confirmInput.setAttribute('type', type);
        toggleRegPassBtn.textContent = type === 'password' ? '👁️ Show' : '🙈 Hide';
      });
    }

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-fullname').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();
      const password = passInput.value;
      const confirmPassword = confirmInput.value;
      const termsChecked = document.getElementById('reg-terms').checked;
      const feedbackEl = document.getElementById('reg-feedback');

      if (!name || !email || !phone || !password || !confirmPassword) {
        if (feedbackEl) {
          feedbackEl.textContent = 'Please fill out all required fields.';
          feedbackEl.style.color = '#ef4444';
        }
        return;
      }

      if (password !== confirmPassword) {
        if (feedbackEl) {
          feedbackEl.textContent = 'Passwords do not match! Please check again.';
          feedbackEl.style.color = '#ef4444';
        }
        return;
      }

      if (!termsChecked) {
        if (feedbackEl) {
          feedbackEl.textContent = 'You must accept the Terms & Conditions.';
          feedbackEl.style.color = '#ef4444';
        }
        return;
      }

      // Save user demo state
      localStorage.setItem('thinkmart_user', name.split(' ')[0]);

      if (cartUtil.showToast) {
        cartUtil.showToast('Account registered successfully! Redirecting to Home...', 'success');
      }

      setTimeout(() => {
        const targetHome = window.location.pathname.includes('/pages/') ? 'Home-Page.html' : 'pages/Home-Page.html';
        window.location.href = targetHome;
      }, 1200);
    });
  }

  /* ==========================================================================
     6. CONTACT PAGE (pages/Contact.html)
     ========================================================================== */

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const msgTextarea = document.getElementById('contact-message');
    const charCounter = document.getElementById('char-count');

    if (msgTextarea && charCounter) {
      msgTextarea.addEventListener('input', () => {
        const currentLength = msgTextarea.value.length;
        charCounter.textContent = `${currentLength} / 500 characters`;
        if (currentLength > 450) {
          charCounter.style.color = '#ef4444';
        } else {
          charCounter.style.color = 'var(--muted)';
        }
      });
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value;
      const message = msgTextarea ? msgTextarea.value.trim() : '';
      const feedbackEl = document.getElementById('contact-feedback');

      if (!name || !email || !subject || !message) {
        if (feedbackEl) {
          feedbackEl.textContent = 'Please complete all required fields.';
          feedbackEl.style.color = '#ef4444';
        }
        return;
      }

      if (feedbackEl) {
        feedbackEl.textContent = `Thank you, ${name}! Your message regarding "${subject}" has been received. (Frontend Demo Notice: Message validated successfully).`;
        feedbackEl.style.color = '#10b981';
      }

      if (cartUtil.showToast) {
        cartUtil.showToast('Message submitted successfully!', 'success');
      }

      contactForm.reset();
      if (charCounter) charCounter.textContent = '0 / 500 characters';
    });
  }

  /* ==========================================================================
     7. HOME PAGE FEATURED PRODUCTS & BUTTONS
     ========================================================================== */

  const homeFeaturedContainer = document.getElementById('home-featured-products');
  if (homeFeaturedContainer && typeof THINKMART_PRODUCTS !== 'undefined') {
    const featuredList = THINKMART_PRODUCTS.filter(p => p.featured).slice(0, 4);

    homeFeaturedContainer.innerHTML = featuredList.map(p => {
      const moneyPrice = cartUtil.formatMoney ? cartUtil.formatMoney(p.price) : `₹${p.price}`;
      const moneyOrig = cartUtil.formatMoney ? cartUtil.formatMoney(p.originalPrice) : `₹${p.originalPrice}`;

      return `
        <article class="product-card">
          <div class="product-image">
            <span class="discount">${p.discountTag || 'FEATURED'}</span>
            <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'">
          </div>
          <div class="product-info">
            <div class="category">${p.brand.toUpperCase()} • ${p.category.toUpperCase()}</div>
            <h2>${p.name}</h2>
            <div class="rating">
              ★ ${p.rating} <span>(${p.reviews})</span>
            </div>
            <div class="price-row">
              <strong>${moneyPrice}</strong>
              <del>${moneyOrig}</del>
            </div>
            <button type="button" class="btn btn-primary add-to-cart-btn" data-id="${p.id}">
              🛒 Add to Cart
            </button>
          </div>
        </article>
      `;
    }).join('');

    homeFeaturedContainer.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.add-to-cart-btn');
      if (addBtn && cartUtil.addToCart) {
        cartUtil.addToCart(addBtn.dataset.id);
        addBtn.textContent = '✓ Added!';
        addBtn.style.background = '#10b981';
        setTimeout(() => {
          addBtn.textContent = '🛒 Add to Cart';
          addBtn.style.background = '';
        }, 1200);
      }
    });
  }

});
