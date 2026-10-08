/**
 * Keyspace Application Controller (AppManager & Auth & Dashboards)
 * Orchestrates:
 * - Public Pages Navigation (Landing, Katalog, Custom, Portofolio, Lacak Pesanan, Artikel, Tentang Kami)
 * - Role Authentication (Admin vs Pelanggan, Modal Login/Register/Forgot)
 * - Customer Dashboard (Stats, Orders, Recommendations, Direct Buy, Proof Upload)
 * - Admin Dashboard (Overview, Pelanggan CRUD, Produk CRUD, Pesanan & Pembayaran Verification, Status Transitions, Artikel CRUD, Laporan)
 * - Order Tracking with complete 9-stage Timeline
 * - Article Detailed Reading with back buttons
 * - Quick Search, Filter, Cart, Checkout, and Toasts
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize State Store & Managers
  if (window.AppStore) window.AppStore.init();
  CartManager.init();
  AppManager.init();

  // 2. Initialize Customizer if available
  if (typeof ApparelCustomizer !== "undefined") {
    const customizer = new ApparelCustomizer();
    customizer.init();
    window.customizerInstance = customizer;
  }
});

/**
 * Cart Manager (Integrated with LocalStorage)
 */
const CartManager = {
  items: [],
  appliedVoucher: null,

  init() {
    const saved = localStorage.getItem("keyspace_cart");
    if (saved) {
      try { this.items = JSON.parse(saved); } catch (e) { this.items = []; }
    }
    const savedVoucher = localStorage.getItem("keyspace_voucher");
    if (savedVoucher) {
      try { this.appliedVoucher = JSON.parse(savedVoucher); } catch (e) { this.appliedVoucher = null; }
    }
    this.render();
  },

  save() {
    localStorage.setItem("keyspace_cart", JSON.stringify(this.items));
    if (this.appliedVoucher) {
      localStorage.setItem("keyspace_voucher", JSON.stringify(this.appliedVoucher));
    } else {
      localStorage.removeItem("keyspace_voucher");
    }
    this.render();
  },

  addItem(product) {
    const existingIndex = this.items.findIndex(
      item => item.id === product.id && item.colorName === product.colorName && item.size === product.size
    );
    if (existingIndex > -1) {
      this.items[existingIndex].qty += product.qty || 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images ? product.images.front : (product.image || "assets/images/keyspace/prod_card_img_1.png"),
        colorName: product.colorName || (product.colors && product.colors[0] ? product.colors[0].name : "Standard"),
        size: product.size || (product.sizes && product.sizes[0] ? product.sizes[0] : "L"),
        qty: product.qty || 1
      });
    }
    this.save();
    window.showToast?.(`"${product.name}" (${product.size || 'L'}, ${product.colorName || 'Standar'}) berhasil ditambahkan ke keranjang! 🎉`);
  },

  removeItem(index) {
    this.items.splice(index, 1);
    this.save();
    if (document.getElementById("section-checkout")?.classList.contains("active")) {
      AppManager.renderCheckoutSummary();
    }
  },

  updateQty(index, delta) {
    if (this.items[index]) {
      this.items[index].qty += delta;
      if (this.items[index].qty <= 0) {
        this.items.splice(index, 1);
      }
      this.save();
      if (document.getElementById("section-checkout")?.classList.contains("active")) {
        AppManager.renderCheckoutSummary();
      }
    }
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  getDiscountAmount() {
    if (!this.appliedVoucher) return 0;
    const subtotal = this.getSubtotal();
    return Math.round(subtotal * (this.appliedVoucher.discountPercent / 100));
  },

  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    return Math.max(0, subtotal - discount);
  },

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  applyVoucher(code) {
    const cleanCode = (code || "").toUpperCase().trim();
    if (cleanCode === "KEYSPACE10") {
      this.appliedVoucher = { code: cleanCode, discountPercent: 10, desc: "Diskon 10% Spesial Pelanggan" };
      this.save();
      window.showToast?.("Voucher KEYSPACE10 berhasil digunakan! Diskon 10% aktif.");
      return { success: true, message: "Voucher Diskon 10% Aktif!" };
    } else if (cleanCode === "DISKON20") {
      this.appliedVoucher = { code: cleanCode, discountPercent: 20, desc: "Diskon 20% Promo Spesial" };
      this.save();
      window.showToast?.("Voucher DISKON20 berhasil digunakan! Diskon 20% aktif.");
      return { success: true, message: "Voucher Diskon 20% Aktif!" };
    } else {
      return { success: false, message: "Kode voucher tidak valid atau telah kedaluwarsa." };
    }
  },

  removeVoucher() {
    this.appliedVoucher = null;
    this.save();
    window.showToast?.("Voucher dibatalkan.");
  },

  render() {
    // Navbar badge count
    const badge = document.getElementById("cart-count-badge");
    if (badge) {
      const count = this.getItemCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    }

    // Drawer items list
    const cartList = document.getElementById("cart-drawer-items");
    const cartTotalElem = document.getElementById("cart-drawer-total");
    if (cartTotalElem) {
      cartTotalElem.textContent = formatRupiah(this.getTotal());
    }

    if (cartList) {
      if (this.items.length === 0) {
        cartList.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem; color: #94A3B8;">
            <div style="font-size: 3.5rem; margin-bottom: 0.75rem;">🛍️</div>
            <h4 style="font-weight: 800; color: #0F172A; margin-bottom: 0.4rem;">Keranjang Belanja Kosong</h4>
            <p style="font-size: 0.88rem; color: #64748B; margin-bottom: 1.25rem;">Pilih produk berkualitas di katalog Keyspace sekarang.</p>
            <button class="btn btn-primary btn-sm" onclick="AppManager.navigateTo('katalog'); AppManager.toggleCartDrawer(false);">Mulai Belanja</button>
          </div>
        `;
        return;
      }

      const itemsHtml = this.items.map((item, idx) => `
        <div class="cart-item-card">
          <div class="cart-item-thumb">
            <img src="${item.image}" alt="${item.name}" onerror="handleImageError(this, '${item.name}')" loading="lazy" />
          </div>
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-meta">
              <span style="background: #F1F5F9; padding: 1px 6px; border-radius: 4px; font-weight: 700;">${item.size}</span>
              <span style="color: #64748B; margin-left: 4px;">Warna: ${item.colorName}</span>
            </div>
            <div class="cart-item-price">${formatRupiah(item.price)}</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem;">
              <div style="display: flex; align-items: center; border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden; background: #FFFFFF;">
                <button style="padding: 2px 8px; background: #F8FAFC; font-weight: 800; color: #334155;" onclick="CartManager.updateQty(${idx}, -1)">-</button>
                <span style="padding: 2px 10px; font-size: 0.85rem; font-weight: 800; color: #1E293B;">${item.qty}</span>
                <button style="padding: 2px 8px; background: #F8FAFC; font-weight: 800; color: #334155;" onclick="CartManager.updateQty(${idx}, 1)">+</button>
              </div>
              <button style="color: #EF4444; font-size: 0.8rem; font-weight: 700; background: none; border: none; cursor: pointer;" onclick="CartManager.removeItem(${idx})">Hapus</button>
            </div>
          </div>
        </div>
      `).join("");

      const voucherHtml = `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.75rem; margin-top: 0.5rem;">
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="cart-voucher-input" placeholder="Kode Promo (KEYSPACE10)" style="flex: 1; padding: 0.4rem 0.6rem; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 0.82rem; text-transform: uppercase;" value="${this.appliedVoucher ? this.appliedVoucher.code : ''}" ${this.appliedVoucher ? 'disabled' : ''} />
            ${this.appliedVoucher ? `
              <button class="btn btn-secondary btn-sm" style="padding: 0.4rem 0.65rem; font-size: 0.75rem;" onclick="CartManager.removeVoucher()">Batal</button>
            ` : `
              <button class="btn btn-primary btn-sm" style="padding: 0.4rem 0.65rem; font-size: 0.75rem;" onclick="const code = document.getElementById('cart-voucher-input').value; const res = CartManager.applyVoucher(code); if(!res.success) alert(res.message);">Pakai</button>
            `}
          </div>
          ${this.appliedVoucher ? `
            <div style="font-size: 0.78rem; color: #16A34A; font-weight: 700; margin-top: 0.35rem;">✓ Diskon ${this.appliedVoucher.discountPercent}% Aktif (-${formatRupiah(this.getDiscountAmount())})</div>
          ` : `
            <div style="font-size: 0.72rem; color: #94A3B8; margin-top: 0.35rem;">Gunakan voucher <strong>KEYSPACE10</strong> untuk diskon 10%</div>
          `}
        </div>
      `;

      cartList.innerHTML = itemsHtml + voucherHtml;
    }
  }
};
window.CartManager = CartManager;

/**
 * Main Application Manager
 */
const AppManager = {
  currentCategory: "all",
  searchQuery: "",
  sortBy: "populer",
  
  // Hero Slider
  currentHeroIndex: 0,
  heroSlideCount: 3,
  heroAutoPlayTimer: null,

  // Checkout State
  shippingMethod: "store", // "store", "regular", "express"
  shippingCost: 0,
  paymentMethod: "online", // "online", "bank", "va", "cod"
  isAccordionCollapsed: false,

  // Admin Active Tab: 'dashboard' | 'customers' | 'products' | 'orders' | 'payments' | 'tracking' | 'articles' | 'reports' | 'settings'
  adminCurrentTab: "dashboard",
  adminSelectedOrderId: null,
  adminSelectedCustId: null,

  init() {
    this.bindGlobalEvents();
    this.initHeroSlider();
    this.updateAuthNavUI();
    this.renderCategoriesRow();
    this.renderFeaturedProducts();
    this.renderCatalogSidebar();
    this.renderCatalogProducts();
    this.renderPortfolio();
    this.renderPillars();
    this.renderClients();
    this.renderTestimonials();
    this.renderOrderHistory();
    this.renderArticles();

    // Check if initial load is admin
    const user = window.AppStore?.getAuthUser();
    const activeAdminSec = document.getElementById("section-admin-dashboard")?.classList.contains("active");
    if (activeAdminSec || (user && user.role === "admin" && window.location.hash === "#admin")) {
      this.navigateTo("admin-dashboard");
    }
  },

  bindGlobalEvents() {
    // Navigation Tabs
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.dataset.target;
        if (target) this.navigateTo(target);
      });
    });

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener("click", () => {
        navMenu.classList.toggle("mobile-open");
      });
    }

    // Cart Drawer Toggle
    const openCartBtn = document.getElementById("open-cart-btn");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartOverlay = document.getElementById("cart-drawer-overlay");

    if (openCartBtn) openCartBtn.addEventListener("click", () => this.toggleCartDrawer(true));
    if (closeCartBtn) closeCartBtn.addEventListener("click", () => this.toggleCartDrawer(false));
    if (cartOverlay) cartOverlay.addEventListener("click", () => this.toggleCartDrawer(false));

    // Close modals on overlay click or esc
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("active");
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
        this.toggleCartDrawer(false);
      }
    });
  },

  // =========================================================================
  // NAVIGATION & ROLE ROUTING
  // =========================================================================
  navigateTo(target) {
    const user = window.AppStore?.getAuthUser();

    // Role-based protection:
    // Admin attempting to view customer dashboard is directed to admin dashboard
    if (user && user.role === "admin" && target === "customer-dashboard") {
      target = "admin-dashboard";
    }

    // Customer or Guest attempting to view admin pages is blocked
    if (target.startsWith("admin-") && (!user || user.role !== "admin")) {
      window.showToast?.("Akses ditolak: Anda harus login sebagai Admin untuk membuka halaman ini. ⚠️");
      this.openAuthModal("admin");
      return;
    }

    // Non-logged-in user attempting to view customer dashboard
    if (target === "customer-dashboard" && (!user || user.role !== "customer")) {
      window.showToast?.("Silakan login sebagai Pelanggan terlebih dahulu.");
      this.openAuthModal("customer");
      return;
    }

    // Update active nav-link
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link.dataset.target === target);
    });

    // Hide all sections, show target section
    document.querySelectorAll(".app-section").forEach(sec => {
      sec.classList.remove("active");
    });

    const targetSection = document.getElementById(`section-${target}`);
    if (targetSection) {
      targetSection.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Role Layout Separation:
    // If target is admin-dashboard, hide customer navbar & footer completely
    if (target === "admin-dashboard") {
      document.body.classList.add("in-admin-portal");
    } else {
      document.body.classList.remove("in-admin-portal");
    }

    // Close mobile menu if open
    document.getElementById("nav-menu")?.classList.remove("mobile-open");

    // Dynamic triggers per view
    if (target === "customer-dashboard") {
      this.renderCustomerDashboard();
    } else if (target === "admin-dashboard") {
      this.renderAdminDashboard();
    } else if (target === "riwayat") {
      this.renderOrderHistory();
    } else if (target === "katalog") {
      this.renderCatalogProducts();
    } else if (target === "artikel") {
      this.renderArticles();
    }
  },

  // =========================================================================
  // AUTHENTICATION & ROLE MANAGEMENT
  // =========================================================================
  updateAuthNavUI() {
    const user = window.AppStore?.getAuthUser();
    const authGroup = document.getElementById("nav-auth-container");
    if (!authGroup) return;

    if (!user) {
      authGroup.innerHTML = `
        <button class="btn-nav-auth btn-nav-login" onclick="AppManager.openAuthModal('customer')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          <span>Masuk</span>
        </button>
        <button class="btn-nav-auth btn-nav-register" onclick="AppManager.openRegisterModal()">
          <span>Daftar</span>
        </button>
      `;
    } else if (user.role === "admin") {
      authGroup.innerHTML = `
        <div class="user-profile-badge" onclick="AppManager.navigateTo('admin-dashboard')">
          <img src="${user.avatar || 'assets/images/keyspace/logo.png'}" alt="Admin" class="user-avatar-sm" />
          <div class="user-badge-meta">
            <span class="user-badge-name">${user.name}</span>
            <span class="user-badge-role">ADMIN</span>
          </div>
        </div>
        <button class="btn-nav-auth btn-nav-login" onclick="AppManager.handleLogout()" title="Keluar">
          <span>Logout</span>
        </button>
      `;
    } else {
      // Customer
      authGroup.innerHTML = `
        <div class="user-profile-badge" onclick="AppManager.navigateTo('customer-dashboard')">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" alt="${user.name}" class="user-avatar-sm" />
          <div class="user-badge-meta">
            <span class="user-badge-name">${user.name.split(' ')[0]}</span>
            <span class="user-badge-role">PELANGGAN</span>
          </div>
        </div>
        <button class="btn-nav-auth btn-nav-login" onclick="AppManager.handleLogout()" title="Keluar">
          <span>Logout</span>
        </button>
      `;
    }
  },

  openAuthModal(roleTab = "customer") {
    const modal = document.getElementById("auth-login-modal");
    if (!modal) return;
    this.switchAuthTab(roleTab);
    modal.classList.add("active");
  },

  closeAuthModal() {
    document.getElementById("auth-login-modal")?.classList.remove("active");
    document.getElementById("auth-register-modal")?.classList.remove("active");
    document.getElementById("auth-forgot-modal")?.classList.remove("active");
  },

  switchAuthTab(role) {
    const tabCustomer = document.getElementById("auth-tab-customer");
    const tabAdmin = document.getElementById("auth-tab-admin");
    const roleHintInput = document.getElementById("auth-role-hint");
    const emailInput = document.getElementById("login-email");
    const pwdInput = document.getElementById("login-password");

    if (role === "admin") {
      tabCustomer?.classList.remove("active");
      tabAdmin?.classList.add("active");
      if (roleHintInput) roleHintInput.value = "admin";
      if (emailInput && !emailInput.value) emailInput.value = "admin@keyspace.id";
      if (pwdInput && !pwdInput.value) pwdInput.value = "admin123";
    } else {
      tabAdmin?.classList.remove("active");
      tabCustomer?.classList.add("active");
      if (roleHintInput) roleHintInput.value = "customer";
      if (emailInput && emailInput.value === "admin@keyspace.id") emailInput.value = "budi.santoso@gmail.com";
      if (pwdInput && pwdInput.value === "admin123") pwdInput.value = "password123";
    }
  },

  handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const email = document.getElementById("login-email")?.value;
    const password = document.getElementById("login-password")?.value;
    const roleHint = document.getElementById("auth-role-hint")?.value;
    const alertBox = document.getElementById("login-alert-msg");

    const res = window.AppStore.login(email, password, roleHint);

    if (res.success) {
      if (alertBox) {
        alertBox.className = "auth-alert-msg success";
        alertBox.textContent = res.message;
        alertBox.style.display = "block";
      }
      setTimeout(() => {
        this.closeAuthModal();
        this.updateAuthNavUI();
        window.showToast?.(res.message);
        if (res.user.role === "admin") {
          this.navigateTo("admin-dashboard");
        } else {
          this.navigateTo("customer-dashboard");
        }
      }, 500);
    } else {
      if (alertBox) {
        alertBox.className = "auth-alert-msg error";
        alertBox.textContent = res.message;
        alertBox.style.display = "block";
      }
    }
  },

  openRegisterModal() {
    this.closeAuthModal();
    document.getElementById("auth-register-modal")?.classList.add("active");
  },

  handleRegisterSubmit(e) {
    if (e) e.preventDefault();
    const name = document.getElementById("reg-name")?.value;
    const email = document.getElementById("reg-email")?.value;
    const phone = document.getElementById("reg-phone")?.value;
    const password = document.getElementById("reg-password")?.value;
    const address = document.getElementById("reg-address")?.value;
    const city = document.getElementById("reg-city")?.value;
    const alertBox = document.getElementById("reg-alert-msg");

    if (!name || !email || !phone || !password) {
      if (alertBox) {
        alertBox.className = "auth-alert-msg error";
        alertBox.textContent = "Mohon lengkapi seluruh kolom yang wajib diisi.";
        alertBox.style.display = "block";
      }
      return;
    }

    const res = window.AppStore.register(name, email, phone, password, address, city);

    if (res.success) {
      if (alertBox) {
        alertBox.className = "auth-alert-msg success";
        alertBox.textContent = res.message;
        alertBox.style.display = "block";
      }
      setTimeout(() => {
        this.closeAuthModal();
        this.updateAuthNavUI();
        window.showToast?.(res.message);
        this.navigateTo("customer-dashboard");
      }, 600);
    } else {
      if (alertBox) {
        alertBox.className = "auth-alert-msg error";
        alertBox.textContent = res.message;
        alertBox.style.display = "block";
      }
    }
  },

  openForgotModal() {
    this.closeAuthModal();
    document.getElementById("auth-forgot-modal")?.classList.add("active");
  },

  handleForgotSubmit(e) {
    if (e) e.preventDefault();
    const email = document.getElementById("forgot-email")?.value;
    const alertBox = document.getElementById("forgot-alert-msg");
    if (!email) return;

    if (alertBox) {
      alertBox.className = "auth-alert-msg success";
      alertBox.textContent = `Instruksi reset kata sandi telah dikirimkan ke alamat email ${email}.`;
      alertBox.style.display = "block";
    }
    setTimeout(() => {
      this.closeAuthModal();
      this.openAuthModal("customer");
    }, 2000);
  },

  handleLogout() {
    window.AppStore?.logout();
    this.updateAuthNavUI();
    window.showToast?.("Anda telah keluar dari akun. Sampai jumpa kembali!");
    this.navigateTo("home");
  },

  // =========================================================================
  // HERO SLIDER & PRESENTATION
  // =========================================================================
  initHeroSlider() {
    const track = document.getElementById("hero-slides-track");
    const prevBtn = document.getElementById("hero-prev-btn");
    const nextBtn = document.getElementById("hero-next-btn");
    const indicators = document.querySelectorAll(".hero-indicator-btn");

    if (!track) return;

    const updateSlider = (idx) => {
      this.currentHeroIndex = (idx + this.heroSlideCount) % this.heroSlideCount;
      track.style.transform = `translateX(-${this.currentHeroIndex * 100}%)`;
      indicators.forEach((btn, i) => {
        btn.classList.toggle("active", i === this.currentHeroIndex);
      });
    };

    if (prevBtn) prevBtn.addEventListener("click", () => updateSlider(this.currentHeroIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => updateSlider(this.currentHeroIndex + 1));

    indicators.forEach(btn => {
      btn.addEventListener("click", () => {
        const slideIdx = parseInt(btn.dataset.slide, 10);
        updateSlider(slideIdx);
      });
    });

    // Auto Play Slider every 5.5s
    if (this.heroAutoPlayTimer) clearInterval(this.heroAutoPlayTimer);
    this.heroAutoPlayTimer = setInterval(() => {
      updateSlider(this.currentHeroIndex + 1);
    }, 5500);
  },

  // =========================================================================
  // CATALOG, CATEGORIES & PRODUCTS DISPLAY
  // =========================================================================
  renderCategoriesRow() {
    const container = document.getElementById("keyspace-categories-row");
    if (!container || typeof CATEGORIES_DATA === "undefined") return;

    container.innerHTML = CATEGORIES_DATA.map(cat => `
      <div class="category-circle-item" onclick="AppManager.filterByCategory('${cat.id}')">
        <div class="category-icon-circle">
          <img src="${cat.icon || cat.image || 'assets/images/keyspace/cat_circle_1.png'}" alt="${cat.name}" onerror="handleImageError(this, '${cat.name}')" loading="lazy" />
        </div>
        <span class="category-item-label">${cat.name}</span>
      </div>
    `).join("");
  },

  renderFeaturedProducts() {
    const container = document.getElementById("keyspace-featured-products");
    if (!container) return;

    const products = window.AppStore ? window.AppStore.getProducts() : PRODUCTS_DATA;
    const featured = products.filter(p => p.isFeatured);
    const displayList = featured.length >= 8 ? featured.slice(0, 8) : products.slice(0, 8);

    container.innerHTML = displayList.map(p => this.createProductCardHtml(p)).join("");
  },

  createProductCardHtml(p) {
    return `
      <div class="product-card" onclick="AppManager.openProductDetail('${p.id}')">
        <div class="product-card-img-wrap">
          <img src="${p.images ? p.images.front : p.image}" alt="${p.name}" onerror="handleImageError(this, '${p.name}')" loading="lazy" />
          ${p.badge ? `<span class="product-card-badge">${p.badge}</span>` : ""}
          ${p.discount ? `<span class="product-card-discount-pill">${p.discount}</span>` : ""}
        </div>
        <div class="product-card-body">
          <span class="product-card-cat-tag">${p.categoryName || 'Apparel'}</span>
          <h3 class="product-card-title" title="${p.name}">${p.name}</h3>
          
          <div class="product-card-price-row">
            <div>
              ${p.originalPrice ? `<span class="product-card-strike-price">${formatRupiah(p.originalPrice)}</span>` : ""}
              <div class="product-card-current-price">${formatRupiah(p.price)}</div>
            </div>
          </div>

          <div class="product-card-meta-row">
            <span class="product-card-star-rating">★ ${p.rating || '4.95'}</span>
            <span class="product-card-sold-count">${p.soldCount || 'Terlaris'}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-top: 0.75rem;" onclick="event.stopPropagation()">
            <button class="btn btn-secondary btn-sm" style="padding: 0.35rem 0.5rem; font-size: 0.78rem;" onclick="CartManager.addItem(PRODUCTS_DATA.find(x => x.id === '${p.id}') || window.AppStore.getProductById('${p.id}'))">
              + Keranjang
            </button>
            <button class="btn btn-primary btn-sm" style="padding: 0.35rem 0.5rem; font-size: 0.78rem;" onclick="AppManager.directCheckoutProduct('${p.id}')">
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>
    `;
  },

  directCheckoutProduct(productId) {
    const p = (window.AppStore ? window.AppStore.getProductById(productId) : null) || PRODUCTS_DATA.find(x => x.id === productId);
    if (!p) return;
    CartManager.addItem(p);
    this.openCheckout();
  },

  renderCatalogSidebar() {
    const container = document.getElementById("catalog-categories-sidebar");
    if (!container || typeof CATEGORIES_DATA === "undefined") return;

    container.innerHTML = `
      <div class="sidebar-cat-pill ${this.currentCategory === 'all' ? 'active' : ''}" onclick="AppManager.filterByCategory('all')">
        <span>Semua Kategori</span>
      </div>
      ${CATEGORIES_DATA.map(c => `
        <div class="sidebar-cat-pill ${this.currentCategory === c.id ? 'active' : ''}" onclick="AppManager.filterByCategory('${c.id}')">
          <span>${c.name}</span>
        </div>
      `).join("")}
    `;
  },

  renderCatalogProducts() {
    const grid = document.getElementById("catalog-products-grid");
    const countLabel = document.getElementById("catalog-results-count");
    if (!grid) return;

    let products = window.AppStore ? window.AppStore.getProducts() : PRODUCTS_DATA;

    if (this.currentCategory !== "all") {
      products = products.filter(p => p.category === this.currentCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }

    // Sort
    if (this.sortBy === "harga-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === "harga-desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === "rating") {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (countLabel) countLabel.textContent = `Menampilkan ${products.length} produk`;

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: #94A3B8;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="font-weight: 800; color: #0F172A;">Produk Tidak Ditemukan</h3>
          <p style="font-size: 0.9rem; color: #64748B;">Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(p => this.createProductCardHtml(p)).join("");
  },

  filterByCategory(catId) {
    this.currentCategory = catId;
    this.renderCatalogSidebar();
    this.navigateTo("katalog");
    this.renderCatalogProducts();
  },

  handleCatalogSearch(e) {
    this.searchQuery = (e.target.value || "").trim();
    this.renderCatalogProducts();
  },

  changeSort(sortType) {
    this.sortBy = sortType;
    document.querySelectorAll(".sort-pill-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.sort === sortType);
    });
    this.renderCatalogProducts();
  },

  toggleCartDrawer(open) {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
      drawer.classList.toggle("active", open);
      overlay.classList.toggle("active", open);
    }
  },

  // =========================================================================
  // CHECKOUT & ORDER CREATION
  // =========================================================================
  openCheckout() {
    this.toggleCartDrawer(false);

    if (CartManager.items.length === 0) {
      const prods = window.AppStore ? window.AppStore.getProducts() : PRODUCTS_DATA;
      CartManager.addItem(prods[0]);
    }

    // Prefill customer profile if logged in
    const user = window.AppStore?.getAuthUser();
    if (user && user.role === "customer") {
      setTimeout(() => {
        const nameInp = document.getElementById("checkout-customer-name");
        const phoneInp = document.getElementById("checkout-customer-phone");
        const emailInp = document.getElementById("checkout-customer-email");
        const addrInp = document.getElementById("checkout-shipping-address");
        const cityInp = document.getElementById("checkout-shipping-city");
        if (nameInp && !nameInp.value) nameInp.value = user.name;
        if (phoneInp && !phoneInp.value) phoneInp.value = user.phone;
        if (emailInp && !emailInp.value) emailInp.value = user.email;
        if (addrInp && !addrInp.value) addrInp.value = user.address;
        if (cityInp && !cityInp.value) cityInp.value = user.city;
      }, 50);
    }

    this.navigateTo("checkout");
    this.renderCheckoutSummary();
  },

  renderCheckoutSummary() {
    const listContainer = document.getElementById("checkout-order-items-list");
    const summaryTitle = document.getElementById("checkout-summary-title");
    const subtotalText = document.getElementById("checkout-subtotal-amount");
    const calcSubtotal = document.getElementById("checkout-calc-subtotal");
    const calcDiscount = document.getElementById("checkout-calc-discount");
    const calcShipping = document.getElementById("checkout-calc-shipping");
    const calcTotal = document.getElementById("checkout-calc-total");

    if (!listContainer) return;

    const itemCount = CartManager.getItemCount();
    const subtotal = CartManager.getSubtotal();
    const discount = CartManager.getDiscountAmount();

    if (summaryTitle) summaryTitle.textContent = `Ringkasan Pesanan (${itemCount} produk)`;

    if (CartManager.items.length === 0) {
      listContainer.innerHTML = `<p style="padding: 1.5rem 0; color: #94A3B8; text-align: center;">Tidak ada produk di keranjang.</p>`;
      if (subtotalText) subtotalText.textContent = "Rp 0";
      if (calcSubtotal) calcSubtotal.textContent = "Rp 0";
      if (calcTotal) calcTotal.textContent = "Rp 0";
      return;
    }

    listContainer.innerHTML = CartManager.items.map(item => `
      <div class="checkout-item-row">
        <div class="checkout-item-thumb">
          <img src="${item.image}" alt="${item.name}" onerror="handleImageError(this, '${item.name}')" />
        </div>
        <div class="checkout-item-info">
          <h4 class="checkout-item-name">${item.name}</h4>
          <span class="checkout-item-size-badge">${item.size} | ${item.colorName}</span>
          <div class="checkout-item-price-calc">
            <span>${item.qty} × ${formatRupiah(item.price)}</span>
            <span class="checkout-item-total">${formatRupiah(item.price * item.qty)}</span>
          </div>
        </div>
      </div>
    `).join("");

    const grandTotal = Math.max(0, subtotal - discount + this.shippingCost);

    if (subtotalText) subtotalText.textContent = formatRupiah(subtotal);
    if (calcSubtotal) calcSubtotal.textContent = formatRupiah(subtotal);
    
    if (calcDiscount) {
      if (discount > 0) {
        calcDiscount.parentElement.style.display = "flex";
        calcDiscount.textContent = `- ${formatRupiah(discount)} (${CartManager.appliedVoucher.code})`;
      } else {
        calcDiscount.parentElement.style.display = "none";
      }
    }

    if (calcShipping) {
      if (this.shippingMethod === "store") {
        calcShipping.textContent = "Gratis (Ambil di Toko)";
      } else if (this.shippingMethod === "regular") {
        calcShipping.textContent = "Rp 15.000 (J&T / JNE Reguler)";
      } else if (this.shippingMethod === "express") {
        calcShipping.textContent = "Rp 25.000 (Express 1 Hari)";
      }
    }

    if (calcTotal) calcTotal.textContent = formatRupiah(grandTotal);
  },

  selectShippingMethod(method) {
    this.shippingMethod = method;
    const optStore = document.getElementById("opt-shipping-store");
    const optRegular = document.getElementById("opt-shipping-regular");
    const optExpress = document.getElementById("opt-shipping-express");
    const addressForm = document.getElementById("delivery-address-form");

    [optStore, optRegular, optExpress].forEach(el => el?.classList.remove("selected"));

    if (method === "store") {
      this.shippingCost = 0;
      optStore?.classList.add("selected");
      document.getElementById("radio-store").checked = true;
      if (addressForm) addressForm.style.display = "none";
    } else if (method === "regular") {
      this.shippingCost = 15000;
      optRegular?.classList.add("selected");
      document.getElementById("radio-regular").checked = true;
      if (addressForm) addressForm.style.display = "block";
    } else if (method === "express") {
      this.shippingCost = 25000;
      optExpress?.classList.add("selected");
      document.getElementById("radio-express").checked = true;
      if (addressForm) addressForm.style.display = "block";
    }

    this.renderCheckoutSummary();
  },

  selectPaymentMethod(method) {
    this.paymentMethod = method;
    const optOnline = document.getElementById("opt-pay-online");
    const optBank = document.getElementById("opt-pay-bank");
    const optVA = document.getElementById("opt-pay-va");
    const optCod = document.getElementById("opt-pay-cod");

    [optOnline, optBank, optVA, optCod].forEach(el => el?.classList.remove("selected"));

    if (method === "online") {
      optOnline?.classList.add("selected");
      document.getElementById("radio-pay-online").checked = true;
    } else if (method === "bank") {
      optBank?.classList.add("selected");
      document.getElementById("radio-pay-bank").checked = true;
    } else if (method === "va") {
      optVA?.classList.add("selected");
      document.getElementById("radio-pay-va").checked = true;
    } else if (method === "cod") {
      optCod?.classList.add("selected");
      document.getElementById("radio-pay-cod").checked = true;
    }
  },

  submitCheckoutOrder() {
    const nameInput = document.getElementById("checkout-customer-name");
    const phoneInput = document.getElementById("checkout-customer-phone");
    const emailInput = document.getElementById("checkout-customer-email");
    const notesInput = document.getElementById("checkout-customer-notes");

    const name = nameInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const email = emailInput?.value.trim() || "-";

    if (!name) {
      alert("Mohon isi Nama Lengkap Anda!");
      nameInput?.focus();
      return;
    }

    if (!phone) {
      alert("Mohon isi Nomor WhatsApp Anda untuk verifikasi pesanan!");
      phoneInput?.focus();
      return;
    }

    if (CartManager.items.length === 0) {
      alert("Keranjang belanja Anda masih kosong. Silakan pilih produk terlebih dahulu.");
      return;
    }

    let fullAddressText = "Ambil di Toko (Jl. Jombang Raya No.42, Tangerang Selatan)";
    if (this.shippingMethod !== "store") {
      const addr = document.getElementById("checkout-shipping-address")?.value.trim();
      const city = document.getElementById("checkout-shipping-city")?.value.trim();
      if (!addr || !city) {
        alert("Mohon lengkapi Alamat Lengkap dan Kota tujuan pengiriman!");
        document.getElementById("checkout-shipping-address")?.focus();
        return;
      }
      fullAddressText = `${addr}, ${city} ${document.getElementById("checkout-shipping-postal")?.value || ''}`;
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderId = `KEY-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${randomSuffix}`;
    const subtotal = CartManager.getSubtotal();
    const discount = CartManager.getDiscountAmount();
    const totalAmount = Math.max(0, subtotal - discount + this.shippingCost);

    let courierLabel = "Ambil di Toko (Workshop Tangerang Selatan)";
    if (this.shippingMethod === "regular") courierLabel = "J&T / JNE Reguler";
    if (this.shippingMethod === "express") courierLabel = "Paxel / JNE YES Express 1 Hari";

    let payLabel = "QRIS Instant / e-Wallet";
    if (this.paymentMethod === "bank") payLabel = "Transfer Bank BCA";
    if (this.paymentMethod === "va") payLabel = "BCA / Mandiri Virtual Account";
    if (this.paymentMethod === "cod") payLabel = "Bayar Tunai di Toko (COD)";

    const currentUser = window.AppStore?.getAuthUser();
    const customerId = currentUser ? currentUser.id : `CUST-GUEST-${randomSuffix}`;

    const newOrder = {
      orderId: orderId,
      customerId: customerId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: fullAddressText,
      createdAt: new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: "Menunggu Konfirmasi Pembayaran", // Mengikuti alur
      paymentStatus: "Menunggu Konfirmasi",
      paymentMethod: payLabel,
      paymentProofUrl: "assets/images/keyspace/prod_card_img_1.png",
      paymentProofDate: new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      shippingMethod: courierLabel,
      shippingCourier: this.shippingMethod === 'store' ? 'Pickup Store' : 'J&T Express',
      shippingTrackingNo: "",
      shippingCost: this.shippingCost,
      subtotal: subtotal,
      discount: discount,
      totalAmount: totalAmount,
      adminNotes: notesInput?.value ? `Catatan pemesan: ${notesInput.value}` : "Menunggu verifikasi admin.",
      items: [...CartManager.items],
      trackingTimeline: [
        { status: "Pesanan Dibuat", timestamp: new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), note: "Pesanan berhasil dibuat di sistem Keyspace.", done: true },
        { status: "Menunggu Konfirmasi Pembayaran", timestamp: new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), note: "Bukti instruksi bayar dikirim ke antrian Admin.", done: true },
        { status: "Pembayaran Dikonfirmasi", timestamp: "-", note: "Admin akan memvalidasi transfer.", done: false },
        { status: "Pesanan Diproses", timestamp: "-", note: "Proses produksi sablon & konveksi.", done: false },
        { status: "Pesanan Dikemas", timestamp: "-", note: "Quality control dan packaging rapi.", done: false },
        { status: "Pesanan Dikirim", timestamp: "-", note: "Penyerahan ke jasa ekspedisi.", done: false },
        { status: "Dalam Perjalanan", timestamp: "-", note: "Kurir mengantar ke alamat tujuan.", done: false },
        { status: "Pesanan Sampai", timestamp: "-", note: "Paket sampai di alamat penerima.", done: false },
        { status: "Pesanan Selesai", timestamp: "-", note: "Transaksi selesai sepenuhnya.", done: false }
      ]
    };

    // Save to AppStore
    window.AppStore?.createOrder(newOrder);

    // Clear cart
    CartManager.items = [];
    CartManager.appliedVoucher = null;
    CartManager.save();

    // WhatsApp Message URL
    const itemsFormatted = newOrder.items.map(it => `• ${it.name} (${it.size}, ${it.colorName}) x ${it.qty} = ${formatRupiah(it.price * it.qty)}`).join("%0A");
    const waMessage = `Halo%20Admin%20Keyspace!%20Saya%20sudah%20melakukan%20checkout:%0A%0A*No.%20Pesanan:*%20${orderId}%0A*Nama:*%20${encodeURIComponent(name)}%0A*Total:*%20${formatRupiah(totalAmount)}%0A*Metode%20Bayar:*%20${encodeURIComponent(payLabel)}%0A%0A*Barang:*%0A${itemsFormatted}%0A%0AMohon%20konfirmasi%20pembayaran.%20Terima%20kasih!`;

    // Show Invoice Modal
    const successModal = document.getElementById("order-success-modal");
    const content = document.getElementById("order-success-content");
    if (content) {
      content.innerHTML = `
        <div class="order-success-icon">✓</div>
        <h2 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin-bottom: 0.25rem;">Pesanan Berhasil Dibuat!</h2>
        <p style="font-size: 0.88rem; color: #64748B;">Terima kasih <strong>${name}</strong>, pesanan Anda telah tersimpan dengan status <strong>Menunggu Konfirmasi Pembayaran</strong>.</p>
        
        <div class="order-id-badge">${orderId}</div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 1.25rem; text-align: left; font-size: 0.88rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px dashed #CBD5E1; padding-bottom: 0.5rem;">
            <span style="color: #64748B;">Total Tagihan:</span>
            <strong style="color: #EA580C; font-size: 1.2rem;">${formatRupiah(totalAmount)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="color: #64748B;">Status Pembayaran:</span>
            <span class="badge-status menunggu-konfirmasi">Menunggu Konfirmasi Admin</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="color: #64748B;">Metode Bayar:</span>
            <span>${payLabel}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748B;">Pengiriman:</span>
            <span>${courierLabel}</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <a href="https://wa.me/6285762005247?text=${waMessage}" target="_blank" class="btn btn-primary btn-lg" style="width: 100%; background: #25D366; color: #FFFFFF; font-weight: 800; text-decoration: none;">
            💬 Konfirmasi Bukti via WhatsApp Admin
          </a>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.print();">🖨️ Cetak Invoice</button>
            <button class="btn btn-dark btn-sm" onclick="document.getElementById('order-success-modal').classList.remove('active'); AppManager.navigateTo('riwayat');">📦 Lacak Pesanan</button>
          </div>
        </div>
      `;
    }
    successModal?.classList.add("active");
  },

  // =========================================================================
  // ORDER TRACKING & TIMELINE (Lacak Pesanan Pelanggan)
  // =========================================================================
  renderOrderHistory() {
    const list = document.getElementById("order-history-list");
    if (!list) return;

    const user = window.AppStore?.getAuthUser();
    let orders = window.AppStore ? window.AppStore.getOrders() : [];

    // Filter by logged-in customer if applicable
    if (user && user.role === "customer") {
      orders = orders.filter(o => o.customerId === user.id || (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase()));
    }

    if (orders.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; background: #FFFFFF; border-radius: 16px; border: 1px solid var(--border-light);">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">📦</div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin-bottom: 0.4rem;">Belum Ada Riwayat Pesanan</h3>
          <p style="font-size: 0.88rem; color: #64748B; margin-bottom: 1.25rem;">Mulai belanja produk sablon dan custom apparel terbaik di Keyspace.</p>
          <button class="btn btn-primary btn-sm" onclick="AppManager.navigateTo('katalog')">Katalog Produk</button>
        </div>
      `;
      return;
    }

    list.innerHTML = orders.map(order => {
      const statusClass = order.status.toLowerCase().replace(/\s+/g, '-');
      const payStatusClass = (order.paymentStatus || 'menunggu-konfirmasi').toLowerCase().replace(/\s+/g, '-');
      const firstItem = order.items && order.items[0] ? order.items[0] : { name: 'Apparel Keyspace', qty: 1, image: 'assets/images/keyspace/prod_card_img_1.png' };
      const totalItemsCount = order.items ? order.items.reduce((s, it) => s + it.qty, 0) : 1;

      return `
        <div class="order-tracking-card">
          <div class="ot-card-top">
            <div>
              <span class="ot-card-id">${order.orderId}</span>
              <span class="ot-card-date"> · ${order.createdAt}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span class="badge-status ${payStatusClass}">💳 ${order.paymentStatus}</span>
              <span class="badge-status ${statusClass}">🚚 ${order.status}</span>
            </div>
          </div>

          <div class="ot-card-body">
            <div class="ot-items-preview">
              <div class="ot-item-thumb-row">
                <img src="${firstItem.image}" alt="${firstItem.name}" class="ot-item-thumb-img" onerror="handleImageError(this, '${firstItem.name}')" />
                <div>
                  <h4 style="font-size: 0.92rem; font-weight: 700; color: #0F172A;">${firstItem.name}</h4>
                  <span style="font-size: 0.8rem; color: #64748B;">${totalItemsCount} Produk · ${order.shippingMethod}</span>
                </div>
              </div>
            </div>

            <div style="text-align: right;">
              <span style="font-size: 0.78rem; color: #94A3B8; display: block;">Total Tagihan:</span>
              <strong style="font-size: 1.2rem; font-weight: 800; color: #EA580C;">${formatRupiah(order.totalAmount)}</strong>
            </div>
          </div>

          <div class="ot-card-footer">
            <span style="font-size: 0.82rem; color: #64748B;">
              ${order.shippingTrackingNo ? `No. Resi: <strong>${order.shippingTrackingNo}</strong>` : 'Pengiriman dalam proses'}
            </span>
            <div style="display: flex; gap: 0.5rem;">
              ${order.paymentStatus === 'Menunggu Konfirmasi' || order.paymentStatus === 'Menunggu Pembayaran' ? `
                <button class="btn btn-secondary btn-sm" onclick="AppManager.openUploadPaymentProofModal('${order.orderId}')">
                  📤 Unggah Bukti Bayar
                </button>
              ` : ''}
              <button class="btn btn-primary btn-sm" onclick="AppManager.openOrderDetailModal('${order.orderId}')">
                LIHAT DETAIL PESANAN
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  openOrderDetailModal(orderId) {
    const order = window.AppStore?.getOrderById(orderId);
    if (!order) return;

    const modal = document.getElementById("order-detail-view-modal");
    const container = document.getElementById("order-detail-view-content");
    if (!modal || !container) return;

    // Build timeline stages
    const standardStages = [
      "Pesanan Dibuat",
      "Menunggu Konfirmasi Pembayaran",
      "Pembayaran Dikonfirmasi",
      "Pesanan Diproses",
      "Pesanan Dikemas",
      "Pesanan Dikirim",
      "Dalam Perjalanan",
      "Pesanan Sampai",
      "Pesanan Selesai"
    ];

    const currentStatusIdx = standardStages.indexOf(order.status);

    const timelineHtml = standardStages.map((stageName, idx) => {
      const isDone = (currentStatusIdx >= idx) || (order.trackingTimeline && order.trackingTimeline.some(t => t.status === stageName && t.done));
      const isCurrent = (order.status === stageName);
      const matchedTimeline = order.trackingTimeline ? order.trackingTimeline.find(t => t.status === stageName) : null;
      const timestamp = matchedTimeline && matchedTimeline.timestamp ? matchedTimeline.timestamp : "-";
      const note = matchedTimeline && matchedTimeline.note ? matchedTimeline.note : `Tahap ${stageName}`;

      return `
        <div class="timeline-step-item ${isDone ? 'active' : ''} ${isCurrent ? 'current' : ''}">
          <div class="timeline-step-dot">${isDone ? '✓' : (idx + 1)}</div>
          <div class="timeline-step-content">
            <div class="timeline-step-header">
              <span class="timeline-step-title">${stageName}</span>
              <span class="timeline-step-time">${timestamp}</span>
            </div>
            <p class="timeline-step-desc">${note}</p>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div style="padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #E2E8F0; padding-bottom: 1.25rem; margin-bottom: 1.25rem;">
          <div>
            <span style="font-size: 0.8rem; font-weight: 800; color: #EA580C; text-transform: uppercase;">Detail Pelacakan Pesanan</span>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin: 0.2rem 0;">#${order.orderId}</h2>
            <span style="font-size: 0.82rem; color: #64748B;">Waktu Pemesanan: ${order.createdAt}</span>
          </div>
          <div style="text-align: right;">
            <span class="badge-status ${order.status.toLowerCase().replace(/\s+/g, '-')}">${order.status}</span>
            <div style="margin-top: 0.5rem; font-size: 1.15rem; font-weight: 800; color: #0F172A;">${formatRupiah(order.totalAmount)}</div>
          </div>
        </div>

        <!-- 2 Columns Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem; background: #F8FAFC; padding: 1.25rem; border-radius: 12px; border: 1px solid #E2E8F0; font-size: 0.85rem;">
          <div>
            <h4 style="font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">Informasi Pelanggan & Alamat</h4>
            <p style="color: #334155;"><strong>${order.customerName}</strong> (${order.customerPhone})</p>
            <p style="color: #64748B; margin-top: 0.25rem;">${order.customerEmail || '-'}</p>
            <p style="color: #475569; margin-top: 0.4rem;">📍 ${order.shippingAddress}</p>
          </div>
          <div>
            <h4 style="font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">Metode Bayar & Ekspedisi</h4>
            <p style="color: #334155;">💳 <strong>${order.paymentMethod}</strong> (Status: <span class="badge-status ${order.paymentStatus.toLowerCase().replace(/\s+/g, '-')}">${order.paymentStatus}</span>)</p>
            <p style="color: #334155; margin-top: 0.35rem;">🚚 Ekspedisi: <strong>${order.shippingCourier || 'J&T Express'}</strong></p>
            <p style="color: #64748B; margin-top: 0.25rem;">No. Resi: <strong>${order.shippingTrackingNo || 'Belum diterbitkan'}</strong></p>
            ${order.adminNotes ? `<p style="margin-top: 0.5rem; color: #9A3412; background: #FFF7ED; padding: 4px 8px; border-radius: 6px;">Catatan Admin: ${order.adminNotes}</p>` : ''}
          </div>
        </div>

        <!-- Items Ordered -->
        <h4 style="font-weight: 800; color: #0F172A; margin-bottom: 0.75rem;">Produk yang Dibeli</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
          ${(order.items || []).map(it => `
            <div style="display: flex; align-items: center; justify-content: space-between; background: #FFFFFF; border: 1px solid #E2E8F0; padding: 0.75rem 1rem; border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <img src="${it.image}" alt="${it.name}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" onerror="handleImageError(this, '${it.name}')" />
                <div>
                  <h5 style="font-size: 0.88rem; font-weight: 700; color: #0F172A;">${it.name}</h5>
                  <span style="font-size: 0.8rem; color: #64748B;">Ukuran: ${it.size} | Warna: ${it.colorName || 'Standar'} | ${it.qty} pcs</span>
                </div>
              </div>
              <strong style="font-size: 0.92rem; color: #1E293B;">${formatRupiah(it.price * it.qty)}</strong>
            </div>
          `).join("")}
        </div>

        <!-- TRACKING TIMELINE -->
        <h4 style="font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">Timeline Status Pengiriman & Pengerjaan</h4>
        <p style="font-size: 0.8rem; color: #64748B; margin-bottom: 1rem;">Perkembangan pesanan ini diperbarui secara langsung oleh Tim Konveksi & Admin Keyspace.</p>
        <div class="tracking-timeline-flow">
          ${timelineHtml}
        </div>

        <!-- Bottom Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #E2E8F0; padding-top: 1.25rem;">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('order-detail-view-modal').classList.remove('active');">Tutup</button>
          <button class="btn btn-primary btn-sm" onclick="window.print();">🖨️ Cetak Bukti</button>
        </div>
      </div>
    `;

    modal.classList.add("active");
  },

  openUploadPaymentProofModal(orderId) {
    const order = window.AppStore?.getOrderById(orderId);
    if (!order) return;

    const modal = document.getElementById("order-detail-view-modal");
    const container = document.getElementById("order-detail-view-content");
    if (!modal || !container) return;

    container.innerHTML = `
      <div style="padding: 1.75rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin-bottom: 0.25rem;">Unggah Bukti Pembayaran</h3>
        <p style="font-size: 0.85rem; color: #64748B; margin-bottom: 1.25rem;">Pesanan #${order.orderId} · Total: <strong>${formatRupiah(order.totalAmount)}</strong></p>

        <div style="background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem; font-size: 0.85rem;">
          <span style="font-weight: 700; color: #9A3412; display: block; margin-bottom: 0.35rem;">Informasi Rekening Pembayaran Keyspace:</span>
          <p>Bank BCA: <strong>8040-192-888</strong> a.n Keyspace Apparel Studio</p>
          <p style="margin-top: 0.25rem;">QRIS: Scan QRIS saat checkout atau kirim screenshot m-Banking Anda.</p>
        </div>

        <div class="auth-form-field">
          <label>Pilih File Foto Bukti Transfer / Resi ATM *</label>
          <input type="file" id="proof-file-input" accept="image/*" class="text-input" />
        </div>

        <div id="proof-preview-box" style="margin-bottom: 1.25rem; display: none; text-align: center;">
          <img id="proof-preview-img" src="" alt="Preview Bukti" style="max-height: 200px; border-radius: 8px; border: 1px solid #CBD5E1; margin: 0 auto;" />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('order-detail-view-modal').classList.remove('active');">Batal</button>
          <button class="btn btn-primary btn-sm" onclick="AppManager.submitUploadedProof('${order.orderId}')">Kirim ke Admin</button>
        </div>
      </div>
    `;

    setTimeout(() => {
      const fileInput = document.getElementById("proof-file-input");
      const previewBox = document.getElementById("proof-preview-box");
      const previewImg = document.getElementById("proof-preview-img");
      fileInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            if (previewImg && previewBox) {
              previewImg.src = re.target.result;
              previewBox.style.display = "block";
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }, 50);

    modal.classList.add("active");
  },

  submitUploadedProof(orderId) {
    const previewImg = document.getElementById("proof-preview-img");
    const proofUrl = (previewImg && previewImg.src) ? previewImg.src : "assets/images/keyspace/prod_card_img_2.png";

    window.AppStore?.uploadPaymentProof(orderId, proofUrl);
    window.showToast?.("Bukti pembayaran berhasil diunggah! Status berubah menjadi 'Menunggu Konfirmasi Pembayaran'. Admin akan memverifikasi. ✅");

    document.getElementById("order-detail-view-modal")?.classList.remove("active");
    this.renderOrderHistory();
  },

  // =========================================================================
  // CUSTOMER DASHBOARD
  // =========================================================================
  renderCustomerDashboard() {
    const user = window.AppStore?.getAuthUser();
    if (!user) return;

    const nameElem = document.getElementById("cust-dash-greeting-name");
    if (nameElem) nameElem.textContent = user.name;

    const orders = window.AppStore.getOrdersByCustomer(user.id, user.email);

    // Metrics
    const totalOrders = orders.length;
    const diprosesOrders = orders.filter(o => o.status === "Pesanan Diproses" || o.status === "Pesanan Dikemas").length;
    const dikirimOrders = orders.filter(o => o.status === "Pesanan Dikirim" || o.status === "Dalam Perjalanan").length;
    const selesaiOrders = orders.filter(o => o.status === "Pesanan Selesai").length;

    const mTotal = document.getElementById("cust-metric-total");
    const mDiproses = document.getElementById("cust-metric-diproses");
    const mDikirim = document.getElementById("cust-metric-dikirim");
    const mSelesai = document.getElementById("cust-metric-selesai");

    if (mTotal) mTotal.textContent = totalOrders;
    if (mDiproses) mDiproses.textContent = diprosesOrders;
    if (mDikirim) mDikirim.textContent = dikirimOrders;
    if (mSelesai) mSelesai.textContent = selesaiOrders;

    // Recent Orders in Customer Dashboard
    const recentList = document.getElementById("cust-dash-recent-orders");
    if (recentList) {
      if (orders.length === 0) {
        recentList.innerHTML = `<p style="padding: 1.5rem; text-align: center; color: #94A3B8;">Belum ada pesanan aktif.</p>`;
      } else {
        recentList.innerHTML = orders.slice(0, 3).map(order => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #F1F5F9;">
            <div>
              <span style="font-size: 0.85rem; font-weight: 800; color: #0F172A;">${order.orderId}</span>
              <span style="font-size: 0.78rem; color: #64748B; margin-left: 0.5rem;">${order.createdAt}</span>
              <div style="margin-top: 0.25rem;">
                <span class="badge-status ${order.status.toLowerCase().replace(/\s+/g, '-')}">${order.status}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <strong style="color: #EA580C; font-size: 0.95rem;">${formatRupiah(order.totalAmount)}</strong>
              <button class="btn btn-secondary btn-sm" onclick="AppManager.openOrderDetailModal('${order.orderId}')">Detail</button>
            </div>
          </div>
        `).join("");
      }
    }

    // Recommendation Products (Display 8 diverse apparel products)
    const recGrid = document.getElementById("cust-dash-recommended-products");
    if (recGrid) {
      const allProds = window.AppStore ? window.AppStore.getProducts() : PRODUCTS_DATA;
      const recProds = allProds.filter(p => p.isFeatured).length >= 8 ? allProds.filter(p => p.isFeatured).slice(0, 8) : allProds.slice(0, 8);
      recGrid.innerHTML = recProds.map(p => this.createProductCardHtml(p)).join("");
    }
  },

  // =========================================================================
  // ADMIN DASHBOARD & MANAGEMENT (PELANGGAN, PRODUK, PESANAN, ARTIKEL)
  // =========================================================================
  renderAdminDashboard() {
    this.switchAdminTab(this.adminCurrentTab || "dashboard");
  },

  switchAdminTab(tab) {
    this.adminCurrentTab = tab;

    // Update active nav item
    document.querySelectorAll(".admin-nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.tab === tab);
    });

    // Top title
    const topTitle = document.getElementById("admin-topbar-title");
    const titles = {
      dashboard: "Ringkasan Bisnis & Dashboard",
      customers: "Kelola Pelanggan",
      products: "Kelola Produk & Inventori",
      orders: "Kelola Pesanan Pelanggan",
      payments: "Konfirmasi & Validasi Pembayaran",
      tracking: "Pembaruan Status & Ekspedisi",
      articles: "Kelola Artikel & Edukasi",
      reports: "Laporan Penjualan & Transaksi",
      settings: "Pengaturan Toko Keyspace"
    };
    if (topTitle) topTitle.textContent = titles[tab] || "Admin Keyspace";

    // Hide all tabs, show active tab
    document.querySelectorAll(".admin-tab-pane").forEach(pane => {
      pane.style.display = "none";
    });

    const activePane = document.getElementById(`admin-pane-${tab}`);
    if (activePane) activePane.style.display = "block";

    // Tab-specific rendering
    if (tab === "dashboard") this.renderAdminMetricsAndActivities();
    if (tab === "customers") this.renderAdminCustomersTable();
    if (tab === "products") this.renderAdminProductsTable();
    if (tab === "orders" || tab === "payments" || tab === "tracking") this.renderAdminOrdersTable(tab);
    if (tab === "articles") this.renderAdminArticlesTable();
    if (tab === "reports") this.renderAdminReports();
  },

  renderAdminMetricsAndActivities() {
    const customers = window.AppStore.getCustomers();
    const products = window.AppStore.getProducts();
    const orders = window.AppStore.getOrders();

    const totalCust = customers.length;
    const totalProd = products.length;
    const newOrders = orders.filter(o => o.status === "Pesanan Dibuat" || o.status === "Menunggu Konfirmasi Pembayaran").length;
    const diproses = orders.filter(o => o.status === "Pesanan Diproses" || o.status === "Pesanan Dikemas").length;
    const dikirim = orders.filter(o => o.status === "Pesanan Dikirim" || o.status === "Dalam Perjalanan").length;
    const selesai = orders.filter(o => o.status === "Pesanan Selesai").length;
    const pendingPay = orders.filter(o => o.paymentStatus === "Menunggu Konfirmasi").length;
    const totalOmset = orders.reduce((sum, o) => sum + (o.paymentStatus === "Sudah Dibayar" ? o.totalAmount : 0), 0);

    // Populate metric cards
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setVal("adm-metric-customers", totalCust);
    setVal("adm-metric-products", totalProd);
    setVal("adm-metric-neworders", newOrders);
    setVal("adm-metric-diproses", diproses);
    setVal("adm-metric-dikirim", dikirim);
    setVal("adm-metric-selesai", selesai);
    setVal("adm-metric-pendingpay", pendingPay);
    setVal("adm-metric-omset", formatRupiah(totalOmset));

    // Recent orders table in dashboard overview
    const recentOrdersTbody = document.getElementById("adm-overview-orders-tbody");
    if (recentOrdersTbody) {
      recentOrdersTbody.innerHTML = orders.slice(0, 5).map(o => `
        <tr>
          <td><strong>${o.orderId}</strong></td>
          <td>${o.customerName}</td>
          <td>${o.createdAt}</td>
          <td><span class="badge-status ${o.paymentStatus.toLowerCase().replace(/\s+/g, '-')}">${o.paymentStatus}</span></td>
          <td><span class="badge-status ${o.status.toLowerCase().replace(/\s+/g, '-')}">${o.status}</span></td>
          <td><strong>${formatRupiah(o.totalAmount)}</strong></td>
          <td>
            <button class="btn-table-action view" onclick="AppManager.openAdminOrderDetail('${o.orderId}')">Kelola</button>
          </td>
        </tr>
      `).join("");
    }
  },

  // -------------------------------------------------------------------------
  // ADMIN - KELOLA PELANGGAN
  // -------------------------------------------------------------------------
  renderAdminCustomersTable() {
    const customers = window.AppStore.getCustomers();
    const orders = window.AppStore.getOrders();
    const tbody = document.getElementById("adm-customers-tbody");
    if (!tbody) return;

    tbody.innerHTML = customers.map(c => {
      const custOrders = orders.filter(o => o.customerId === c.id || (o.customerEmail && o.customerEmail.toLowerCase() === c.email.toLowerCase()));
      const totalBelanja = custOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Sudah Dibayar' ? o.totalAmount : 0), 0);
      const isAktif = c.status === "Aktif";

      return `
        <tr>
          <td><strong>${c.id}</strong></td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <img src="${c.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
              <div>
                <strong>${c.name}</strong>
                <span style="display: block; font-size: 0.75rem; color: #64748B;">Reg: ${c.registeredAt}</span>
              </div>
            </div>
          </td>
          <td>${c.email}</td>
          <td>${c.phone}</td>
          <td><strong>${custOrders.length}</strong> pesanan</td>
          <td><strong>${formatRupiah(totalBelanja)}</strong></td>
          <td>
            <span class="badge-status ${isAktif ? 'aktif' : 'nonaktif'}">${c.status}</span>
          </td>
          <td>
            <div class="table-actions-group">
              <button class="btn-table-action view" onclick="AppManager.openCustomerDetailModal('${c.id}')" title="Lihat Profil & Riwayat">Detail</button>
              <button class="btn-table-action ${isAktif ? 'delete' : 'edit'}" onclick="AppManager.toggleAdminCustomerStatus('${c.id}')">
                ${isAktif ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  openCustomerDetailModal(custId) {
    const cust = window.AppStore.getCustomerById(custId);
    if (!cust) return;
    const orders = window.AppStore.getOrdersByCustomer(cust.id, cust.email);
    const totalBelanja = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Sudah Dibayar' ? o.totalAmount : 0), 0);

    const modal = document.getElementById("admin-generic-modal");
    const content = document.getElementById("admin-generic-modal-content");
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="padding: 1.75rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid #E2E8F0; padding-bottom: 1rem;">
          <img src="${cust.avatar}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid #FFA800;" />
          <div>
            <h2 style="font-size: 1.3rem; font-weight: 800; color: #0F172A;">${cust.name}</h2>
            <span style="font-size: 0.82rem; color: #64748B;">ID: ${cust.id} · Terdaftar sejak ${cust.registeredAt}</span>
          </div>
          <span class="badge-status ${cust.status === 'Aktif' ? 'aktif' : 'nonaktif'}" style="margin-left: auto;">${cust.status}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #F8FAFC; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem; font-size: 0.85rem;">
          <div>
            <p><strong>Email:</strong> ${cust.email}</p>
            <p style="margin-top: 0.35rem;"><strong>No. HP/WA:</strong> ${cust.phone}</p>
            <p style="margin-top: 0.35rem;"><strong>Alamat:</strong> ${cust.address}, ${cust.city} ${cust.postalCode || ''}</p>
          </div>
          <div>
            <p><strong>Total Pesanan:</strong> ${orders.length} transaksi</p>
            <p style="margin-top: 0.35rem;"><strong>Total Belanja:</strong> <strong style="color: #EA580C;">${formatRupiah(totalBelanja)}</strong></p>
            <p style="margin-top: 0.35rem;"><strong>Catatan Admin:</strong> ${cust.notes || '-'}</p>
          </div>
        </div>

        <h4 style="font-size: 0.95rem; font-weight: 800; color: #0F172A; margin-bottom: 0.75rem;">Riwayat Seluruh Pesanan Pelanggan Ini:</h4>
        <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem;">
          ${orders.length === 0 ? `<p style="color: #94A3B8; text-align: center; padding: 1rem;">Pelanggan belum memiliki pesanan.</p>` : 
            orders.map(o => `
              <div style="display: flex; align-items: center; justify-content: space-between; background: #FFFFFF; border: 1px solid #E2E8F0; padding: 0.75rem 1rem; border-radius: 8px;">
                <div>
                  <strong>${o.orderId}</strong>
                  <span style="font-size: 0.75rem; color: #64748B; margin-left: 0.5rem;">${o.createdAt}</span>
                  <div style="margin-top: 0.25rem;">
                    <span class="badge-status ${o.status.toLowerCase().replace(/\s+/g, '-')}">${o.status}</span>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <strong>${formatRupiah(o.totalAmount)}</strong>
                  <button class="btn btn-secondary btn-sm" onclick="AppManager.openAdminOrderDetail('${o.orderId}')">Kelola Order</button>
                </div>
              </div>
            `).join("")
          }
        </div>

        <div style="display: flex; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('admin-generic-modal').classList.remove('active');">Tutup</button>
        </div>
      </div>
    `;

    modal.classList.add("active");
  },

  toggleAdminCustomerStatus(custId) {
    const res = window.AppStore.toggleCustomerStatus(custId);
    if (res) {
      window.showToast?.(`Status pelanggan ${res.name} diubah menjadi ${res.status}.`);
      this.renderAdminCustomersTable();
    }
  },

  // -------------------------------------------------------------------------
  // ADMIN - KELOLA PRODUK
  // -------------------------------------------------------------------------
  renderAdminProductsTable() {
    const products = window.AppStore.getProducts();
    const tbody = document.getElementById("adm-products-tbody");
    if (!tbody) return;

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <img src="${p.images ? p.images.front : p.image}" alt="${p.name}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" onerror="handleImageError(this, '${p.name}')" />
        </td>
        <td>
          <strong>${p.name}</strong>
          <span style="display: block; font-size: 0.75rem; color: #64748B;">ID: ${p.id}</span>
        </td>
        <td><span class="badge-status pesanan-diproses">${p.categoryName || p.category}</span></td>
        <td><strong>${formatRupiah(p.price)}</strong></td>
        <td>${p.isPreOrder ? '<span class="badge-status menunggu-konfirmasi">Pre-Order</span>' : '<span class="badge-status aktif">Ready Stock (150+)</span>'}</td>
        <td><span class="badge-status aktif">Aktif</span></td>
        <td>
          <div class="table-actions-group">
            <button class="btn-table-action edit" onclick="AppManager.openEditProductModal('${p.id}')">Edit</button>
            <button class="btn-table-action delete" onclick="AppManager.deleteAdminProduct('${p.id}')">Hapus</button>
          </div>
        </td>
      </tr>
    `).join("");
  },

  openEditProductModal(productId = null) {
    const isEdit = !!productId;
    const prod = isEdit ? window.AppStore.getProductById(productId) : {
      id: "",
      name: "",
      category: "kaos-custom",
      categoryName: "Kaos Custom",
      price: 65000,
      description: "",
      badge: "Ready Stock",
      image: "assets/images/keyspace/prod_card_img_1.png"
    };

    const modal = document.getElementById("admin-generic-modal");
    const content = document.getElementById("admin-generic-modal-content");
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="padding: 1.75rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin-bottom: 1.25rem;">
          ${isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h3>

        <form onsubmit="AppManager.saveAdminProduct(event, '${prod.id || ''}')">
          <div class="auth-form-field">
            <label>Nama Produk Apparel *</label>
            <input type="text" id="adm-p-name" class="checkout-text-input" value="${prod.name}" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="auth-form-field">
              <label>Kategori Produk *</label>
              <select id="adm-p-cat" class="select-input">
                <option value="kaos-custom" ${prod.category === 'kaos-custom' ? 'selected' : ''}>Kaos Custom DTF</option>
                <option value="kaos-polos" ${prod.category === 'kaos-polos' ? 'selected' : ''}>Kaos Polos Combed</option>
                <option value="polo-shirt" ${prod.category === 'polo-shirt' ? 'selected' : ''}>Polo Shirt</option>
                <option value="hoodie" ${prod.category === 'hoodie' ? 'selected' : ''}>Hoodie & Sweater</option>
                <option value="jersey" ${prod.category === 'jersey' ? 'selected' : ''}>Jersey Custom</option>
              </select>
            </div>
            <div class="auth-form-field">
              <label>Harga Satuan (IDR) *</label>
              <input type="number" id="adm-p-price" class="checkout-text-input" value="${prod.price}" required />
            </div>
          </div>

          <div class="auth-form-field">
            <label>Deskripsi & Spesifikasi Produk</label>
            <textarea id="adm-p-desc" class="checkout-textarea" rows="3">${prod.description || ''}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="auth-form-field">
              <label>Badge / Label Stok</label>
              <select id="adm-p-badge" class="select-input">
                <option value="Ready Stock" ${prod.badge === 'Ready Stock' ? 'selected' : ''}>Ready Stock</option>
                <option value="PRE-ORDER" ${prod.badge === 'PRE-ORDER' ? 'selected' : ''}>PRE-ORDER</option>
                <option value="TERLARIS" ${prod.badge === 'TERLARIS' ? 'selected' : ''}>TERLARIS</option>
              </select>
            </div>
            <div class="auth-form-field">
              <label>Foto Produk (URL/Asset Path)</label>
              <input type="text" id="adm-p-img" class="checkout-text-input" value="${prod.images ? prod.images.front : (prod.image || 'assets/images/keyspace/prod_card_img_1.png')}" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('admin-generic-modal').classList.remove('active');">Batal</button>
            <button type="submit" class="btn btn-primary btn-sm">Simpan Produk</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add("active");
  },

  saveAdminProduct(e, existingId) {
    e.preventDefault();
    const name = document.getElementById("adm-p-name")?.value;
    const cat = document.getElementById("adm-p-cat")?.value;
    const price = parseInt(document.getElementById("adm-p-price")?.value, 10);
    const desc = document.getElementById("adm-p-desc")?.value;
    const badge = document.getElementById("adm-p-badge")?.value;
    const imgUrl = document.getElementById("adm-p-img")?.value;

    const catLabels = {
      "kaos-custom": "Kaos Custom",
      "kaos-polos": "Kaos Polos",
      "polo-shirt": "Kaos Polo \"Poloshirt\"",
      "hoodie": "Hoodie & Sweater",
      "jersey": "Jersey Printing"
    };

    const newProd = {
      id: existingId || `kp-${Date.now()}`,
      name: name,
      category: cat,
      categoryName: catLabels[cat] || "Apparel",
      price: price,
      originalPrice: null,
      discount: null,
      soldCount: "0 terjual",
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
      badge: badge,
      description: desc,
      images: {
        front: imgUrl,
        back: imgUrl,
        detail: imgUrl
      }
    };

    window.AppStore.saveProduct(newProd);
    window.showToast?.(`Produk "${name}" berhasil disimpan!`);
    document.getElementById("admin-generic-modal")?.classList.remove("active");
    this.renderAdminProductsTable();
    this.renderFeaturedProducts();
    this.renderCatalogProducts();
  },

  deleteAdminProduct(id) {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini dari katalog?")) {
      window.AppStore.deleteProduct(id);
      window.showToast?.("Produk berhasil dihapus.");
      this.renderAdminProductsTable();
      this.renderFeaturedProducts();
      this.renderCatalogProducts();
    }
  },

  // -------------------------------------------------------------------------
  // ADMIN - KELOLA PESANAN, PEMBAYARAN, & STATUS TRACKING (SANGAT PENTING)
  // -------------------------------------------------------------------------
  renderAdminOrdersTable(subTab = "orders") {
    const orders = window.AppStore.getOrders();
    const tbody = document.getElementById("adm-orders-tbody");
    if (!tbody) return;

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>${o.orderId}</strong></td>
        <td>
          <strong>${o.customerName}</strong>
          <span style="display: block; font-size: 0.75rem; color: #64748B;">${o.customerPhone}</span>
        </td>
        <td>${o.createdAt}</td>
        <td>${o.items ? o.items.length : 1} barang</td>
        <td><strong>${formatRupiah(o.totalAmount)}</strong></td>
        <td>
          <span class="badge-status ${o.paymentStatus.toLowerCase().replace(/\s+/g, '-')}">
            ${o.paymentStatus}
          </span>
        </td>
        <td>
          <span class="badge-status ${o.status.toLowerCase().replace(/\s+/g, '-')}">
            ${o.status}
          </span>
        </td>
        <td>
          <div class="table-actions-group">
            <button class="btn-table-action view" onclick="AppManager.openAdminOrderDetail('${o.orderId}')">Detail & Proses</button>
          </div>
        </td>
      </tr>
    `).join("");
  },

  openAdminOrderDetail(orderId) {
    const order = window.AppStore.getOrderById(orderId);
    if (!order) return;

    this.adminSelectedOrderId = orderId;
    const modal = document.getElementById("admin-generic-modal");
    const content = document.getElementById("admin-generic-modal-content");
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="padding: 1.75rem; max-height: 85vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #E2E8F0; padding-bottom: 1.25rem; margin-bottom: 1.25rem;">
          <div>
            <span style="font-size: 0.8rem; font-weight: 800; color: #EA580C; text-transform: uppercase;">Pusat Kontrol Pesanan & Pembayaran</span>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin: 0.2rem 0;">#${order.orderId}</h2>
            <span style="font-size: 0.82rem; color: #64748B;">Dibuat: ${order.createdAt} · Update: ${order.updatedAt}</span>
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 0.35rem;">
              <span class="badge-status ${order.paymentStatus.toLowerCase().replace(/\s+/g, '-')}">💳 ${order.paymentStatus}</span>
              <span class="badge-status ${order.status.toLowerCase().replace(/\s+/g, '-')}">🚚 ${order.status}</span>
            </div>
            <strong style="font-size: 1.35rem; color: #EA580C;">${formatRupiah(order.totalAmount)}</strong>
          </div>
        </div>

        <!-- Section F: ALUR PEMBAYARAN - KONTROL ADMIN -->
        <div style="background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #92400E; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
            <span>⚡</span> Verifikasi Pembayaran Pelanggan
          </h4>
          <p style="font-size: 0.82rem; color: #78350F; margin-bottom: 1rem;">
            Periksa bukti transfer dan mutasi bank. Status pembayaran tidak berubah otomatis menjadi 'Sudah Dibayar' sebelum Admin menyetujui.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <p style="font-size: 0.82rem; color: #475569;">Metode Bayar: <strong>${order.paymentMethod}</strong></p>
              <p style="font-size: 0.82rem; color: #475569; margin-top: 0.25rem;">Waktu Upload: ${order.paymentProofDate || '-'}</p>
              ${order.paymentProofUrl ? `
                <div style="margin-top: 0.5rem;">
                  <span style="font-size: 0.78rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.25rem;">Bukti Pembayaran / Slip Transfer:</span>
                  <a href="${order.paymentProofUrl}" target="_blank">
                    <img src="${order.paymentProofUrl}" style="max-height: 120px; border-radius: 6px; border: 1px solid #CBD5E1; object-fit: contain; background: #FFFFFF;" />
                  </a>
                </div>
              ` : '<p style="color: #94A3B8; font-size: 0.8rem; margin-top: 0.5rem;">Belum ada foto bukti yang diunggah.</p>'}
            </div>

            <div style="display: flex; flex-direction: column; justify-content: center; gap: 0.6rem;">
              <button class="btn btn-primary btn-sm" style="background: #16A34A; color: #FFFFFF;" onclick="AppManager.adminConfirmPayment('${order.orderId}')">
                ✓ [Konfirmasi Pembayaran] &rarr; Ubah ke "Sudah Dibayar"
              </button>
              <button class="btn btn-secondary btn-sm" style="background: #FEE2E2; color: #DC2626; border-color: #FCA5A5;" onclick="AppManager.adminRejectPayment('${order.orderId}')">
                ✕ [Tolak Pembayaran] &rarr; Ubah ke "Pembayaran Ditolak"
              </button>
            </div>
          </div>
        </div>

        <!-- Section G: ALUR STATUS PESANAN (9 TAHAP) - KONTROL ADMIN -->
        <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">
            🔄 Perbarui Status Pesanan & Tracking (Otomatis Tampil di Pelanggan)
          </h4>
          <p style="font-size: 0.82rem; color: #64748B; margin-bottom: 1rem;">
            Admin adalah pihak yang mengontrol status pesanan. Setiap perubahan langsung tercermin pada timeline tracking Pelanggan.
          </p>

          <form onsubmit="AppManager.adminUpdateStatusSubmit(event, '${order.orderId}')">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="auth-form-field">
                <label>Pilih Tahapan Status Baru *</label>
                <select id="adm-status-select" class="select-input">
                  <option value="Menunggu Pembayaran" ${order.status === 'Menunggu Pembayaran' ? 'selected' : ''}>1. Menunggu Pembayaran</option>
                  <option value="Menunggu Konfirmasi Pembayaran" ${order.status === 'Menunggu Konfirmasi Pembayaran' ? 'selected' : ''}>2. Menunggu Konfirmasi Pembayaran</option>
                  <option value="Pembayaran Dikonfirmasi" ${order.status === 'Pembayaran Dikonfirmasi' ? 'selected' : ''}>3. Pembayaran Dikonfirmasi</option>
                  <option value="Pesanan Diproses" ${order.status === 'Pesanan Diproses' ? 'selected' : ''}>4. Pesanan Diproses (Konveksi)</option>
                  <option value="Pesanan Dikemas" ${order.status === 'Pesanan Dikemas' ? 'selected' : ''}>5. Pesanan Dikemas (Packaging QC)</option>
                  <option value="Pesanan Dikirim" ${order.status === 'Pesanan Dikirim' ? 'selected' : ''}>6. Pesanan Dikirim (Drop Ekspedisi)</option>
                  <option value="Dalam Perjalanan" ${order.status === 'Dalam Perjalanan' ? 'selected' : ''}>7. Dalam Perjalanan</option>
                  <option value="Pesanan Sampai" ${order.status === 'Pesanan Sampai' ? 'selected' : ''}>8. Pesanan Sampai</option>
                  <option value="Pesanan Selesai" ${order.status === 'Pesanan Selesai' ? 'selected' : ''}>9. Pesanan Selesai</option>
                  <option value="Dibatalkan" ${order.status === 'Dibatalkan' ? 'selected' : ''}>Dibatalkan</option>
                </select>
              </div>

              <div class="auth-form-field">
                <label>Nomor Resi Ekspedisi (Bila Dikirim)</label>
                <input type="text" id="adm-tracking-no" class="checkout-text-input" placeholder="Contoh: JT983716254" value="${order.shippingTrackingNo || ''}" />
              </div>
            </div>

            <div class="auth-form-field" style="margin-bottom: 1rem;">
              <label>Keterangan / Catatan Tambahan untuk Pelanggan</label>
              <input type="text" id="adm-status-note" class="checkout-text-input" placeholder="Contoh: Paket telah diserahkan ke J&T drop point cabang Tangsel." value="${order.adminNotes || ''}" />
            </div>

            <button type="submit" class="btn btn-primary btn-sm" style="width: 100%;">
              💾 Simpan Perubahan Status & Sinkronkan ke Pelanggan
            </button>
          </form>
        </div>

        <!-- Detail Pesanan Tambahan -->
        <div style="font-size: 0.85rem; color: #475569; margin-bottom: 1.25rem;">
          <h4 style="font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">Alamat & Penerima:</h4>
          <p><strong>${order.customerName}</strong> (${order.customerPhone}) · ${order.customerEmail}</p>
          <p style="margin-top: 0.25rem;">📍 ${order.shippingAddress}</p>
        </div>

        <div style="display: flex; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('admin-generic-modal').classList.remove('active');">Tutup Modal</button>
        </div>
      </div>
    `;

    modal.classList.add("active");
  },

  adminConfirmPayment(orderId) {
    const note = prompt("Catatan konfirmasi pembayaran (opsional):", "Pembayaran terverifikasi via mutasi bank.");
    window.AppStore?.updatePaymentStatus(orderId, "Sudah Dibayar", note);
    window.showToast?.("Pembayaran BERHASIL DIKONFIRMASI! Status pesanan otomatis menjadi 'Pembayaran Dikonfirmasi' dan tersinkron ke dashboard pelanggan. 🎉");
    this.openAdminOrderDetail(orderId);
    this.renderAdminMetricsAndActivities();
    this.renderAdminOrdersTable();
    this.renderOrderHistory();
  },

  adminRejectPayment(orderId) {
    const note = prompt("Alasan penolakan pembayaran:", "Bukti transfer tidak terbaca / dana belum masuk.");
    if (note === null) return;
    window.AppStore?.updatePaymentStatus(orderId, "Pembayaran Ditolak", note);
    window.showToast?.("Pembayaran DITOLAK. Notifikasi dan catatan telah diteruskan ke pelanggan.");
    this.openAdminOrderDetail(orderId);
    this.renderAdminMetricsAndActivities();
    this.renderAdminOrdersTable();
    this.renderOrderHistory();
  },

  adminUpdateStatusSubmit(e, orderId) {
    e.preventDefault();
    const newStatus = document.getElementById("adm-status-select")?.value;
    const trackingNo = document.getElementById("adm-tracking-no")?.value;
    const note = document.getElementById("adm-status-note")?.value;

    window.AppStore?.updateOrderStatus(orderId, newStatus, note, null, trackingNo);
    window.showToast?.(`Status #${orderId} berhasil diubah menjadi "${newStatus}" dan otomatis terlihat di Pelanggan! ✅`);
    
    this.openAdminOrderDetail(orderId);
    this.renderAdminMetricsAndActivities();
    this.renderAdminOrdersTable();
    this.renderOrderHistory();
  },

  // -------------------------------------------------------------------------
  // ADMIN - KELOLA ARTIKEL & EDUKASI
  // -------------------------------------------------------------------------
  renderAdminArticlesTable() {
    const articles = window.AppStore.getArticles();
    const tbody = document.getElementById("adm-articles-tbody");
    if (!tbody) return;

    tbody.innerHTML = articles.map(a => `
      <tr>
        <td><img src="${a.image}" style="width: 52px; height: 38px; border-radius: 6px; object-fit: cover;" /></td>
        <td><strong>${a.title}</strong></td>
        <td><span class="badge-status pesanan-diproses">${a.category}</span></td>
        <td>${a.author}</td>
        <td>${a.date}</td>
        <td><span class="badge-status aktif">${a.status || 'Published'}</span></td>
        <td>
          <div class="table-actions-group">
            <button class="btn-table-action view" onclick="AppManager.openArticleDetail('${a.id}')">Baca</button>
            <button class="btn-table-action edit" onclick="AppManager.openEditArticleModal('${a.id}')">Edit</button>
            <button class="btn-table-action delete" onclick="AppManager.deleteAdminArticle('${a.id}')">Hapus</button>
          </div>
        </td>
      </tr>
    `).join("");
  },

  openEditArticleModal(articleId = null) {
    const isEdit = !!articleId;
    const art = isEdit ? window.AppStore.getArticleById(articleId) : {
      id: "",
      title: "",
      category: "Panduan Bahan",
      excerpt: "",
      content: "<p>Tulis isi artikel di sini...</p>",
      image: "assets/images/cat_kaos_polos.jpg",
      author: "Admin Keyspace",
      date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    };

    const modal = document.getElementById("admin-generic-modal");
    const content = document.getElementById("admin-generic-modal-content");
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="padding: 1.75rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin-bottom: 1.25rem;">
          ${isEdit ? 'Edit Artikel' : 'Tulis Artikel Baru'}
        </h3>

        <form onsubmit="AppManager.saveAdminArticle(event, '${art.id || ''}')">
          <div class="auth-form-field">
            <label>Judul Artikel *</label>
            <input type="text" id="adm-art-title" class="checkout-text-input" value="${art.title}" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="auth-form-field">
              <label>Kategori Artikel *</label>
              <input type="text" id="adm-art-cat" class="checkout-text-input" value="${art.category}" required />
            </div>
            <div class="auth-form-field">
              <label>Penulis</label>
              <input type="text" id="adm-art-author" class="checkout-text-input" value="${art.author}" />
            </div>
          </div>

          <div class="auth-form-field">
            <label>Ringkasan (Excerpt) *</label>
            <textarea id="adm-art-excerpt" class="checkout-textarea" rows="2" required>${art.excerpt}</textarea>
          </div>

          <div class="auth-form-field">
            <label>Isi Lengkap Artikel (HTML / Text) *</label>
            <textarea id="adm-art-content" class="checkout-textarea" rows="6" required>${art.content}</textarea>
          </div>

          <div class="auth-form-field">
            <label>Gambar Utama (Path/URL)</label>
            <input type="text" id="adm-art-img" class="checkout-text-input" value="${art.image}" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('admin-generic-modal').classList.remove('active');">Batal</button>
            <button type="submit" class="btn btn-primary btn-sm">Publikasikan Artikel</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add("active");
  },

  saveAdminArticle(e, existingId) {
    e.preventDefault();
    const title = document.getElementById("adm-art-title")?.value;
    const cat = document.getElementById("adm-art-cat")?.value;
    const author = document.getElementById("adm-art-author")?.value;
    const excerpt = document.getElementById("adm-art-excerpt")?.value;
    const content = document.getElementById("adm-art-content")?.value;
    const img = document.getElementById("adm-art-img")?.value;

    const newArt = {
      id: existingId || `art-${Date.now()}`,
      title: title,
      category: cat,
      author: author || "Admin Keyspace",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
      date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
      excerpt: excerpt,
      content: content,
      image: img || "assets/images/cat_kaos_polos.jpg",
      status: "Published"
    };

    window.AppStore.saveArticle(newArt);
    window.showToast?.(`Artikel "${title}" berhasil disimpan & dipublikasikan!`);
    document.getElementById("admin-generic-modal")?.classList.remove("active");
    this.renderAdminArticlesTable();
    this.renderArticles();
  },

  deleteAdminArticle(id) {
    if (confirm("Hapus artikel ini?")) {
      window.AppStore.deleteArticle(id);
      window.showToast?.("Artikel berhasil dihapus.");
      this.renderAdminArticlesTable();
      this.renderArticles();
    }
  },

  // -------------------------------------------------------------------------
  // ADMIN - LAPORAN
  // -------------------------------------------------------------------------
  renderAdminReports() {
    const orders = window.AppStore.getOrders();
    const paidOrders = orders.filter(o => o.paymentStatus === "Sudah Dibayar");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const reportElem = document.getElementById("adm-reports-summary");
    if (reportElem) {
      reportElem.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem;">
          <div class="metric-card">
            <div>
              <span class="metric-label">Total Omset Sukses</span>
              <div class="metric-value" style="color: #059669;">${formatRupiah(totalRevenue)}</div>
              <span class="metric-subtext">${paidOrders.length} transaksi sukses</span>
            </div>
          </div>
          <div class="metric-card">
            <div>
              <span class="metric-label">Rata-Rata Order Value (AOV)</span>
              <div class="metric-value">${formatRupiah(paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0)}</div>
            </div>
          </div>
          <div class="metric-card">
            <div>
              <span class="metric-label">Tingkat Konversi Pembayaran</span>
              <div class="metric-value">${orders.length ? Math.round((paidOrders.length / orders.length) * 100) : 0}%</div>
            </div>
          </div>
        </div>
      `;
    }
  },

  // =========================================================================
  // ARTIKEL (INTERACTIVE PUBLIC READING & FULL DETAILS)
  // =========================================================================
  renderArticles() {
    const grid = document.getElementById("articles-grid");
    if (!grid) return;

    const articles = window.AppStore ? window.AppStore.getArticles() : [];

    grid.innerHTML = articles.map(art => `
      <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; transition: transform var(--transition-fast);" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
        <img src="${art.image}" alt="${art.title}" style="width: 100%; height: 180px; object-fit: cover;" onerror="this.src='assets/images/cat_kaos_polos.jpg';" />
        <div style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column;">
          <span style="font-size: 0.75rem; font-weight: 800; color: #FFA800; text-transform: uppercase;">${art.category}</span>
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin: 0.4rem 0 0.6rem; line-height: 1.35;">${art.title}</h3>
          <p style="font-size: 0.85rem; color: #64748B; line-height: 1.5; margin-bottom: 1.25rem; flex: 1;">${art.excerpt}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; border-top: 1px solid #F1F5F9; padding-top: 0.75rem;">
            <span style="color: #94A3B8;">📅 ${art.date}</span>
            <button class="btn btn-dark btn-sm" style="font-size: 0.78rem; padding: 4px 10px;" onclick="AppManager.openArticleDetail('${art.id}')">
              Baca Selengkapnya &rarr;
            </button>
          </div>
        </div>
      </div>
    `).join("");
  },

  openArticleDetail(articleId) {
    const art = window.AppStore?.getArticleById(articleId);
    if (!art) return;

    const modal = document.getElementById("article-detail-view-modal");
    const container = document.getElementById("article-detail-view-content");
    if (!modal || !container) return;

    const allArticles = window.AppStore.getArticles();
    const related = allArticles.filter(a => a.id !== art.id).slice(0, 2);

    container.innerHTML = `
      <div class="article-reader-container" style="padding: 2rem;">
        <div class="article-reader-header">
          <button class="btn btn-secondary btn-sm" style="margin-bottom: 1rem;" onclick="document.getElementById('article-detail-view-modal').classList.remove('active');">
            &larr; Kembali ke Daftar Artikel
          </button>
          <div><span class="article-reader-cat">${art.category}</span></div>
          <h1 class="article-reader-title">${art.title}</h1>
          <div class="article-reader-meta">
            <img src="${art.authorAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80'}" style="width: 32px; height: 32px; border-radius: 50%;" />
            <span>Oleh: <strong>${art.author}</strong></span>
            <span>· Tanggal: ${art.date}</span>
          </div>
        </div>

        <img src="${art.image}" alt="${art.title}" class="article-reader-hero-img" onerror="this.src='assets/images/cat_kaos_polos.jpg';" />

        <div class="article-reader-body">
          ${art.content}
        </div>

        <!-- Related Articles -->
        <div style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid #E2E8F0;">
          <h4 style="font-weight: 800; color: #0F172A; margin-bottom: 1rem;">Artikel Terkait Lainnya:</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            ${related.map(r => `
              <div style="display: flex; gap: 0.75rem; background: #F8FAFC; padding: 0.75rem; border-radius: 8px; cursor: pointer;" onclick="AppManager.openArticleDetail('${r.id}')">
                <img src="${r.image}" style="width: 60px; height: 60px; border-radius: 6px; object-fit: cover;" />
                <div>
                  <h5 style="font-size: 0.85rem; font-weight: 700; color: #0F172A; line-height: 1.3;">${r.title}</h5>
                  <span style="font-size: 0.75rem; color: #64748B;">📅 ${r.date}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div style="margin-top: 2rem; text-align: center;">
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('article-detail-view-modal').classList.remove('active');">
            Selesai Membaca & Tutup
          </button>
        </div>
      </div>
    `;

    modal.classList.add("active");
  },

  // =========================================================================
  // PORTOFOLIO, PILLARS, CLIENTS, TESTIMONIALS
  // =========================================================================
  renderPortfolio() {
    const homeContainer = document.getElementById("keyspace-portfolio-grid");
    const fullContainer = document.getElementById("portfolio-full-grid");
    if (typeof PORTFOLIO_DATA === "undefined") return;

    const cardsHtml = PORTFOLIO_DATA.map(item => `
      <div class="portfolio-card-item" onclick="AppManager.openPortfolioModal('${item.id}')">
        <div class="portfolio-card-img-box">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="portfolio-card-details">
          <span class="portfolio-tag-cat">${item.tag}</span>
          <h4 class="portfolio-card-title" title="${item.title}">${item.title}</h4>
        </div>
      </div>
    `).join("");

    if (homeContainer) homeContainer.innerHTML = cardsHtml;
    if (fullContainer) fullContainer.innerHTML = cardsHtml;
  },

  openPortfolioModal(itemId) {
    const item = PORTFOLIO_DATA.find(p => p.id === itemId);
    if (!item) return;
    alert(`[Portofolio Project Keyspace]\n\nJudul: ${item.title}\nKategori: ${item.tag}\nKlien: ${item.client}\nSpesifikasi: ${item.specs}\nJumlah Order: ${item.qty}`);
  },

  renderPillars() {
    const container = document.getElementById("keyspace-pillars-grid");
    if (!container || typeof PILLARS_DATA === "undefined") return;

    const icons = {
      pen: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-1.5"/><path d="M2 22l5-2 12-12-3-3L4 17l-2 5z"/></svg>`,
      money: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
      shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      bolt: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
    };

    container.innerHTML = PILLARS_DATA.map(p => `
      <div class="pillar-item">
        <div class="pillar-icon-box">${icons[p.icon] || '✓'}</div>
        <div class="pillar-text-box">
          <div class="pillar-heading-row">
            <h4 class="pillar-title">${p.title}</h4>
            ${p.tag ? `<span class="pillar-tag-badge">${p.tag}</span>` : ""}
          </div>
          <p class="pillar-desc">${p.desc}</p>
        </div>
      </div>
    `).join("");
  },

  renderClients() {
    const container = document.getElementById("keyspace-clients-logos");
    if (!container || typeof CLIENTS_DATA === "undefined") return;

    container.innerHTML = CLIENTS_DATA.map(c => `
      <div class="client-logo-card" title="${c.name}">
        <img src="${c.logo}" alt="${c.name}" onerror="this.parentElement.innerHTML='<span style=\\'font-weight:700; font-size:0.85rem; color:#1E293B;\\'>${c.name}</span>'" />
      </div>
    `).join("");
  },

  renderTestimonials() {
    const container = document.getElementById("keyspace-testimonials-grid");
    if (!container || typeof TESTIMONIALS_DATA === "undefined") return;

    container.innerHTML = TESTIMONIALS_DATA.map(t => `
      <div class="testimonial-card-box">
        <div class="t-stars-row">★★★★★</div>
        <p class="t-quote-text">"${t.text}"</p>
        <div class="t-author-row">
          <img src="${t.avatar}" alt="${t.name}" class="t-avatar-img" />
          <div>
            <h4 class="t-author-name">${t.name}</h4>
            <span class="t-author-meta">${t.role} - ${t.company}</span>
          </div>
        </div>
      </div>
    `).join("");
  },

  prevTestimonial() {
    this.renderTestimonials();
  },

  nextTestimonial() {
    this.renderTestimonials();
  },

  // =========================================================================
  // QUICK SEARCH MODAL
  // =========================================================================
  openSearchModal() {
    const modal = document.getElementById("search-modal");
    if (modal) {
      modal.classList.add("active");
      const input = document.getElementById("quick-search-input");
      if (input) {
        input.value = "";
        input.focus();
        this.handleQuickSearch({ target: input });
      }
    }
  },

  closeSearchModal() {
    document.getElementById("search-modal")?.classList.remove("active");
  },

  handleQuickSearch(e) {
    const term = (e.target.value || "").toLowerCase().trim();
    const resultsContainer = document.getElementById("quick-search-results");
    if (!resultsContainer) return;

    const products = window.AppStore ? window.AppStore.getProducts() : PRODUCTS_DATA;

    if (!term) {
      resultsContainer.innerHTML = `<p style="font-size: 0.85rem; color: #94A3B8; text-align: center; padding: 1rem;">Ketik kata kunci untuk mencari produk...</p>`;
      return;
    }

    const matches = products.filter(p => 
      p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)) || (p.categoryName && p.categoryName.toLowerCase().includes(term))
    );

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<p style="font-size: 0.85rem; color: #94A3B8; text-align: center; padding: 1rem;">Tidak ditemukan produk untuk "${term}".</p>`;
      return;
    }

    resultsContainer.innerHTML = matches.slice(0, 5).map(p => `
      <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 8px; background: #F8FAFC; cursor: pointer;" onclick="AppManager.closeSearchModal(); AppManager.openProductDetail('${p.id}')">
        <img src="${p.images ? p.images.front : p.image}" alt="${p.name}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" onerror="handleImageError(this, '${p.name}')" />
        <div style="flex: 1;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: #1E293B;">${p.name}</h4>
          <span style="font-size: 0.8rem; font-weight: 700; color: ${p.discount ? '#EF4444' : '#1E293B'};">${formatRupiah(p.price)}</span>
        </div>
      </div>
    `).join("");
  },

  // =========================================================================
  // DETAIL PRODUK MODAL
  // =========================================================================
  currentModalProduct: null,

  openProductDetail(productId) {
    const product = (window.AppStore ? window.AppStore.getProductById(productId) : null) || PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("product-detail-modal");
    const container = document.getElementById("modal-detail-content");
    if (!modal || !container) return;

    const defaultColor = (product.colors && product.colors.length > 0) ? product.colors[0].name : "Standard";
    const defaultSize = (product.sizes && product.sizes.length > 0) ? (product.sizes.includes("L") ? "L" : product.sizes[0]) : "All Size";

    this.currentModalProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images ? product.images.front : (product.image || "assets/images/keyspace/prod_card_img_1.png"),
      colorName: defaultColor,
      size: defaultSize,
      qty: 1
    };

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem;">
        <div>
          <div style="border-radius: 12px; overflow: hidden; background: #F8FAFC; border: 1px solid #E5E7EB; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center;">
            <img id="detail-active-img" src="${product.images ? product.images.front : product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="handleImageError(this, '${product.name}')" />
          </div>
        </div>

        <div>
          <span style="font-size: 0.75rem; font-weight: 800; color: #FFA800; text-transform: uppercase;">${product.categoryName || 'Apparel'}</span>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin: 0.25rem 0 0.5rem;">${product.name}</h2>
          
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            <span style="color: #F59E0B; font-weight: 700;">★ ${product.rating || '4.95'}</span>
            <span style="color: #64748B; font-size: 0.85rem;">(${product.reviewsCount || 120} Ulasan Terverifikasi | ${product.soldCount || 'Terlaris'})</span>
          </div>

          <div style="background: #F8FAFC; padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: baseline; gap: 0.75rem;">
              <span style="font-size: 1.6rem; font-weight: 800; color: #1E293B;">
                ${formatRupiah(product.price)}
              </span>
              ${product.badge ? `<span class="badge-preorder-tag">${product.badge}</span>` : ""}
            </div>
          </div>

          <p style="font-size: 0.88rem; color: #475569; line-height: 1.6; margin-bottom: 1.25rem;">${product.description}</p>

          <!-- Color options -->
          ${product.colors ? `
            <div style="margin-bottom: 1rem;">
              <label style="font-size: 0.85rem; font-weight: 700; color: #1E293B; display: block; margin-bottom: 0.4rem;">Pilihan Warna: ${defaultColor}</label>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${product.colors.map(c => `
                  <button type="button" style="width: 28px; height: 28px; border-radius: 50%; background: ${c.hex}; border: 2px solid #CBD5E1; cursor: pointer;" title="${c.name}"></button>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <!-- Size options -->
          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 700; color: #1E293B; display: block; margin-bottom: 0.4rem;">Pilihan Ukuran:</label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${(product.sizes || ["S", "M", "L", "XL"]).map(s => `
                <button type="button" style="padding: 0.35rem 0.85rem; border: 1.5px solid ${s === defaultSize ? '#FFA800' : '#CBD5E1'}; background: ${s === defaultSize ? '#FFF7ED' : '#FFFFFF'}; color: ${s === defaultSize ? '#EA580C' : '#1E293B'}; border-radius: 6px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">${s}</button>
              `).join("")}
            </div>
          </div>

          <!-- Quantity Stepper -->
          <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; background: #F8FAFC; padding: 0.75rem 1rem; border-radius: 8px;">
            <div>
              <span style="font-size: 0.85rem; font-weight: 700; color: #1E293B; display: block;">Jumlah Pesanan:</span>
              <span style="font-size: 0.8rem; color: #64748B;">Subtotal: <strong id="detail-calc-subtotal" style="color: #EA580C; font-weight: 800;">${formatRupiah(product.price)}</strong></span>
            </div>
            <div style="display: flex; align-items: center; border: 1.5px solid #CBD5E1; border-radius: 6px; overflow: hidden; background: #FFFFFF;">
              <button type="button" style="padding: 4px 12px; background: #F1F5F9; font-weight: 800; border: none; cursor: pointer;" onclick="AppManager.changeModalQty(-1)">-</button>
              <span id="detail-qty-val" style="padding: 4px 14px; font-weight: 800; font-size: 0.95rem; min-width: 32px; text-align: center;">1</span>
              <button type="button" style="padding: 4px 12px; background: #F1F5F9; font-weight: 800; border: none; cursor: pointer;" onclick="AppManager.changeModalQty(1)">+</button>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button type="button" class="btn btn-primary btn-lg" style="flex: 1;" onclick="AppManager.confirmModalAddToCart(true)">
              🚀 Beli Sekarang (Checkout)
            </button>
            <button type="button" class="btn btn-secondary btn-lg" onclick="AppManager.confirmModalAddToCart(false)">
              🛒 + Keranjang
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
  },

  changeModalQty(delta) {
    if (!this.currentModalProduct) return;
    const currentQty = this.currentModalProduct.qty || 1;
    const newQty = Math.max(1, currentQty + delta);
    this.currentModalProduct.qty = newQty;
    const qtyElem = document.getElementById("detail-qty-val");
    if (qtyElem) qtyElem.textContent = newQty;
    const subtotalElem = document.getElementById("detail-calc-subtotal");
    if (subtotalElem) subtotalElem.textContent = formatRupiah(this.currentModalProduct.price * newQty);
  },

  confirmModalAddToCart(isDirectCheckout) {
    if (!this.currentModalProduct) return;
    CartManager.addItem(this.currentModalProduct);
    document.getElementById("product-detail-modal")?.classList.remove("active");
    if (isDirectCheckout) {
      this.openCheckout();
    } else {
      this.toggleCartDrawer(true);
    }
  }
};

window.AppManager = AppManager;

/**
 * Toast Notification Helper
 */
window.showToast = function(message) {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "85px";
    toast.style.right = "24px";
    toast.style.background = "#0F172A";
    toast.style.color = "#FFFFFF";
    toast.style.padding = "0.85rem 1.35rem";
    toast.style.borderRadius = "10px";
    toast.style.fontSize = "0.9rem";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
    toast.style.zIndex = "9999";
    toast.style.transition = "all 0.3s ease";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
  }, 3200);
};
