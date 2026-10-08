/**
 * Keyspace E-Commerce Application Logic
 * Comprehensive, detailed purchasing flow and brand management
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Global Managers
  CartManager.init();
  AppManager.init();
  
  // Customizer Instance
  if (typeof ApparelCustomizer !== "undefined") {
    const customizer = new ApparelCustomizer();
    customizer.init();
    window.customizerInstance = customizer;
  }
});

/**
 * Cart Manager (LocalStorage & State)
 */
const CartManager = {
  items: [],
  appliedVoucher: null, // { code: 'KEYSPACE10', discountPercent: 10 }

  init() {
    const saved = localStorage.getItem("keyspace_cart");
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch (e) {
        this.items = [];
      }
    }
    const savedVoucher = localStorage.getItem("keyspace_voucher");
    if (savedVoucher) {
      try {
        this.appliedVoucher = JSON.parse(savedVoucher);
      } catch (e) {
        this.appliedVoucher = null;
      }
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
    // Update Badge in Navbar
    const badge = document.getElementById("cart-count-badge");
    if (badge) {
      const count = this.getItemCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    }

    // Render Drawer List
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
            <h4 style="font-weight: 800; color: #1E293B; margin-bottom: 0.4rem;">Keranjang Belanja Kosong</h4>
            <p style="font-size: 0.88rem; color: #64748B; margin-bottom: 1.25rem;">Pilih produk favorit Anda di katalog Keyspace sekarang.</p>
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

      // Voucher box in cart
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
 * Keyspace Application UI Manager
 */
const AppManager = {
  currentCategory: "all",
  searchQuery: "",
  sortBy: "populer",
  
  // Hero Slider State
  currentHeroIndex: 0,
  heroSlideCount: 3,
  heroAutoPlayTimer: null,
  touchStartX: 0,
  touchEndX: 0,

  // Checkout State
  shippingMethod: "store", // "store", "regular", "express"
  shippingCost: 0,
  paymentMethod: "online", // "online", "bank", "va", "cod"
  isAccordionCollapsed: false,

  // Testimonials Slider State
  testimonialIndex: 0,

  init() {
    this.bindGlobalEvents();
    this.initHeroSlider();
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
  },

  bindGlobalEvents() {
    // Navigation Tabs
    const navLinks = document.querySelectorAll(".nav-link[data-target]");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.dataset.target;
        this.navigateTo(target);

        // Close mobile menu if open
        const menu = document.getElementById("nav-menu");
        if (menu) menu.classList.remove("mobile-open");
      });
    });

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById("mobile-menu-toggle");
    if (mobileBtn) {
      mobileBtn.addEventListener("click", () => {
        const menu = document.getElementById("nav-menu");
        if (menu) menu.classList.toggle("mobile-open");
      });
    }

    // Cart Drawer Controls
    const cartBtn = document.getElementById("open-cart-btn");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartOverlay = document.getElementById("cart-drawer-overlay");

    if (cartBtn) cartBtn.addEventListener("click", () => this.toggleCartDrawer(true));
    if (closeCartBtn) closeCartBtn.addEventListener("click", () => this.toggleCartDrawer(false));
    if (cartOverlay) cartOverlay.addEventListener("click", () => this.toggleCartDrawer(false));

    // Catalog Top Search
    const searchInput = document.getElementById("catalog-main-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCatalogProducts();
      });
    }

    // Modal Close
    const productModal = document.getElementById("product-detail-modal");
    if (productModal) {
      productModal.addEventListener("click", (e) => {
        if (e.target === productModal || e.target.classList.contains("modal-close-btn")) {
          productModal.classList.remove("active");
        }
      });
    }

    const searchModal = document.getElementById("search-modal");
    if (searchModal) {
      searchModal.addEventListener("click", (e) => {
        if (e.target === searchModal || e.target.classList.contains("modal-close-btn")) {
          searchModal.classList.remove("active");
        }
      });
    }

    const successModal = document.getElementById("order-success-modal");
    if (successModal) {
      successModal.addEventListener("click", (e) => {
        if (e.target === successModal) {
          successModal.classList.remove("active");
        }
      });
    }
  },

  navigateTo(viewId) {
    const sections = document.querySelectorAll(".app-section");
    sections.forEach(sec => sec.classList.remove("active"));
    
    const targetSec = document.getElementById(`section-${viewId}`);
    if (targetSec) {
      targetSec.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Update active nav link
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(l => l.classList.remove("active"));
    const activeLink = document.querySelector(`.nav-link[data-target="${viewId}"]`);
    if (activeLink) activeLink.classList.add("active");

    // If opening checkout, refresh checkout summary
    if (viewId === "checkout") {
      this.renderCheckoutSummary();
    }
  },

  toggleCartDrawer(show) {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
      if (show) {
        drawer.classList.add("open");
        overlay.classList.add("active");
      } else {
        drawer.classList.remove("open");
        overlay.classList.remove("active");
      }
    }
  },

  // =========================================================================
  // 1. HERO BANNER SLIDER
  // =========================================================================
  initHeroSlider() {
    const track = document.getElementById("hero-slides-track");
    const prevBtn = document.getElementById("hero-prev-btn");
    const nextBtn = document.getElementById("hero-next-btn");
    const wrapper = document.getElementById("hero-slider-wrapper");
    const indicatorBtns = document.querySelectorAll(".hero-indicator-btn");

    if (!track || !wrapper) return;

    if (prevBtn) prevBtn.addEventListener("click", () => this.prevHeroSlide());
    if (nextBtn) nextBtn.addEventListener("click", () => this.nextHeroSlide());

    indicatorBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const slideIdx = parseInt(btn.dataset.slide, 10);
        this.goToHeroSlide(slideIdx);
      });
    });

    wrapper.addEventListener("touchstart", (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.stopHeroAutoPlay();
    }, { passive: true });

    wrapper.addEventListener("touchend", (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleHeroSwipe();
      this.startHeroAutoPlay();
    }, { passive: true });

    let isDragging = false;
    let dragStartX = 0;

    wrapper.addEventListener("mousedown", (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      this.stopHeroAutoPlay();
    });

    wrapper.addEventListener("mouseup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diffX = e.clientX - dragStartX;
      if (diffX < -50) this.nextHeroSlide();
      else if (diffX > 50) this.prevHeroSlide();
      this.startHeroAutoPlay();
    });

    wrapper.addEventListener("mouseleave", () => {
      isDragging = false;
      this.startHeroAutoPlay();
    });

    wrapper.addEventListener("mouseenter", () => {
      this.stopHeroAutoPlay();
    });

    this.startHeroAutoPlay();
  },

  goToHeroSlide(index) {
    this.currentHeroIndex = (index + this.heroSlideCount) % this.heroSlideCount;
    const track = document.getElementById("hero-slides-track");
    if (track) {
      track.style.transform = `translateX(-${this.currentHeroIndex * 100}%)`;
    }

    const indicatorBtns = document.querySelectorAll(".hero-indicator-btn");
    indicatorBtns.forEach((btn, idx) => {
      btn.classList.toggle("active", idx === this.currentHeroIndex);
    });
  },

  nextHeroSlide() {
    this.goToHeroSlide(this.currentHeroIndex + 1);
  },

  prevHeroSlide() {
    this.goToHeroSlide(this.currentHeroIndex - 1);
  },

  handleHeroSwipe() {
    const swipeDistance = this.touchEndX - this.touchStartX;
    if (swipeDistance < -45) {
      this.nextHeroSlide();
    } else if (swipeDistance > 45) {
      this.prevHeroSlide();
    }
  },

  startHeroAutoPlay() {
    this.stopHeroAutoPlay();
    this.heroAutoPlayTimer = setInterval(() => {
      this.nextHeroSlide();
    }, 5000);
  },

  stopHeroAutoPlay() {
    if (this.heroAutoPlayTimer) {
      clearInterval(this.heroAutoPlayTimer);
      this.heroAutoPlayTimer = null;
    }
  },

  // =========================================================================
  // 2. KATEGORI & PRODUK UNGGULAN
  // =========================================================================
  renderCategoriesRow() {
    const container = document.getElementById("keyspace-categories-row");
    if (!container) return;

    container.innerHTML = CATEGORIES_DATA.map(cat => `
      <button class="category-circle-item" onclick="AppManager.filterByCategory('${cat.id}')">
        <div class="category-icon-circle">
          <img src="${cat.icon}" alt="${cat.name}" onerror="handleImageError(this, '${cat.name}')" loading="lazy" />
        </div>
        <span class="category-item-label">${cat.name}</span>
      </button>
    `).join("");
  },

  renderFeaturedProducts() {
    const container = document.getElementById("keyspace-featured-products");
    if (!container) return;

    const featured = PRODUCTS_DATA.filter(p => p.isFeatured);
    container.innerHTML = featured.map(p => this.createProductCardHtml(p)).join("");
  },

  createProductCardHtml(product) {
    const displayTitle = product.shortTitle || product.name;
    const hasDiscount = Boolean(product.originalPrice && product.discount);

    return `
      <div class="product-card" onclick="AppManager.openProductDetail('${product.id}')">
        <div class="product-card-img-wrap">
          <img src="${product.images.front}" alt="${product.name}" onerror="handleImageError(this, '${product.name}')" loading="lazy" />
        </div>
        <div class="product-card-body">
          <h3 class="product-card-title" title="${product.name}">${displayTitle}</h3>
          
          <div class="product-card-prices">
            ${hasDiscount ? `
              <div class="price-discount-row">
                <span class="price-original-striked">${formatRupiah(product.originalPrice)}</span>
                <span class="discount-tag-red">${product.discount}</span>
              </div>
            ` : ""}
            <div class="price-active-val ${hasDiscount ? 'has-discount' : ''}">
              ${formatRupiah(product.price)}
            </div>
            <div class="product-card-bottom-meta">
              ${product.badge ? `<span class="badge-preorder-tag">${product.badge}</span>` : `<span></span>`}
              <span class="product-sold-label">${product.soldCount || 'Terlaris'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // 3. KATALOG PAGE WITH SIDEBAR
  // =========================================================================
  renderCatalogSidebar() {
    const container = document.getElementById("catalog-sidebar-categories");
    if (!container) return;

    const allItem = `
      <li>
        <a href="#" class="sidebar-category-link ${this.currentCategory === 'all' ? 'active' : ''}" onclick="AppManager.filterByCategory('all'); return false;">
          Semua
        </a>
      </li>
    `;

    const catItems = CATEGORIES_DATA.map(c => `
      <li>
        <a href="#" class="sidebar-category-link ${this.currentCategory === c.id ? 'active' : ''}" onclick="AppManager.filterByCategory('${c.id}'); return false;">
          ${c.name}
        </a>
      </li>
    `).join("");

    container.innerHTML = allItem + catItems;
  },

  renderCatalogProducts() {
    const grid = document.getElementById("catalog-products-grid");
    const countBadge = document.getElementById("catalog-items-count-text");
    if (!grid) return;

    let filtered = PRODUCTS_DATA.filter(p => {
      const matchCat = this.currentCategory === "all" || p.category === this.currentCategory;
      const matchSearch = p.name.toLowerCase().includes(this.searchQuery) || p.description.toLowerCase().includes(this.searchQuery);
      return matchCat && matchSearch;
    });

    if (this.sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === "terlaris") {
      filtered.sort((a, b) => parseInt(b.soldCount.replace(/\D/g, '') || 0) - parseInt(a.soldCount.replace(/\D/g, '') || 0));
    } else if (this.sortBy === "terbaru") {
      filtered.reverse();
    }

    if (countBadge) {
      countBadge.textContent = `${filtered.length} produk ditemukan`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB;">
          <p style="color: #64748B; font-weight: 600; margin-bottom: 1rem;">Tidak ada produk yang cocok dengan pencarian / kategori ini.</p>
          <button class="btn btn-secondary btn-sm" onclick="AppManager.filterByCategory('all')">Lihat Semua Produk</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => this.createProductCardHtml(p)).join("");
  },

  filterByCategory(catId) {
    this.currentCategory = catId;
    this.navigateTo("katalog");
    this.renderCatalogSidebar();
    this.renderCatalogProducts();
  },

  changeSort(sortType) {
    this.sortBy = sortType;
    
    const pillBtns = document.querySelectorAll(".sort-pill-btn");
    pillBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.sort === sortType);
    });

    this.renderCatalogProducts();
  },

  // =========================================================================
  // 4. CHECKOUT ALUR DETAIL & SELESAI
  // =========================================================================
  openCheckout() {
    this.toggleCartDrawer(false);

    if (CartManager.items.length === 0) {
      CartManager.addItem(PRODUCTS_DATA[0]);
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

    if (summaryTitle) {
      summaryTitle.textContent = `Ringkasan Pesanan (${itemCount} produk)`;
    }

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

  toggleCheckoutAccordion() {
    this.isAccordionCollapsed = !this.isAccordionCollapsed;
    const list = document.getElementById("checkout-order-items-list");
    const arrow = document.getElementById("checkout-accordion-arrow");
    
    if (list) list.style.display = this.isAccordionCollapsed ? "none" : "block";
    if (arrow) arrow.textContent = this.isAccordionCollapsed ? "▼" : "▲";
  },

  selectShippingMethod(method) {
    this.shippingMethod = method;
    const optStore = document.getElementById("opt-shipping-store");
    const optRegular = document.getElementById("opt-shipping-regular");
    const optExpress = document.getElementById("opt-shipping-express");
    const addressForm = document.getElementById("delivery-address-form");

    // Clear all selected states
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

    // Shipping address validation if delivery
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

    // Generate Order ID & Totals
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderId = `KEY-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${randomSuffix}`;
    const subtotal = CartManager.getSubtotal();
    const discount = CartManager.getDiscountAmount();
    const totalAmount = Math.max(0, subtotal - discount + this.shippingCost);

    // Courier label
    let courierLabel = "Ambil di Toko (Workshop Tangerang Selatan)";
    if (this.shippingMethod === "regular") courierLabel = "J&T / JNE Reguler (No. Resi dalam proses)";
    if (this.shippingMethod === "express") courierLabel = "Paxel / JNE YES Express 1 Hari";

    // Payment method label
    let payLabel = "QRIS / e-Wallet (Midtrans)";
    if (this.paymentMethod === "bank") payLabel = "Transfer Bank BCA (8040-192-888 a.n Keyspace Apparel)";
    if (this.paymentMethod === "va") payLabel = "BCA / Mandiri Virtual Account";
    if (this.paymentMethod === "cod") payLabel = "Bayar Tunai di Toko (COD)";

    // Create Order Record
    const newOrder = {
      orderId: orderId,
      date: new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: "Menunggu Pembayaran",
      statusClass: "badge-shipping",
      courier: courierLabel,
      paymentMethod: payLabel,
      totalAmount: totalAmount,
      subtotal: subtotal,
      discount: discount,
      shippingCost: this.shippingCost,
      items: [...CartManager.items],
      customer: {
        name: name,
        phone: phone,
        email: emailInput?.value || "-",
        address: fullAddressText,
        notes: notesInput?.value || "-"
      }
    };

    // Save to Orders List
    INITIAL_ORDERS.unshift(newOrder);
    localStorage.setItem("keyspace_orders", JSON.stringify(INITIAL_ORDERS));
    this.renderOrderHistory();

    // Prepare WhatsApp Message to 085762005247
    const itemsFormatted = CartManager.items.map(it => `• ${it.name}%0A  (Ukuran: ${it.size}, Warna: ${it.colorName}) x ${it.qty} = ${formatRupiah(it.price * it.qty)}`).join("%0A%0A");
    const waMessage = `Halo%20Admin%20Keyspace!%20Saya%20sudah%20melakukan%20checkout%20pesanan%20di%20website:%0A%0A*No.%20Pesanan:*%20${orderId}%0A*Nama:*%20${encodeURIComponent(name)}%0A*No.%20WA:*%20${phone}%0A*Metode%20Kirim:*%20${encodeURIComponent(courierLabel)}%0A*Alamat:*%20${encodeURIComponent(fullAddressText)}%0A*Metode%20Bayar:*%20${encodeURIComponent(payLabel)}%0A%0A*Rincian%20Barang:*%0A${itemsFormatted}%0A%0A*Subtotal:*%20${formatRupiah(subtotal)}%0A*Diskon:*%20${discount > 0 ? formatRupiah(discount) : 'Rp 0'}%0A*Ongkir:*%20${formatRupiah(this.shippingCost)}%0A*TOTAL%20TAGIHAN:*%20*${formatRupiah(totalAmount)}*%0A%0AMohon%20konfirmasi%20dan%20instruksi%20pembayaran.%20Terima%20kasih!`;

    // Clear Cart
    CartManager.items = [];
    CartManager.appliedVoucher = null;
    CartManager.save();

    // Show Detailed Success Modal & Invoice
    const successModal = document.getElementById("order-success-modal");
    const content = document.getElementById("order-success-content");

    if (content) {
      content.innerHTML = `
        <div class="order-success-icon">✓</div>
        <h2 style="font-size: 1.45rem; font-weight: 800; color: #0F172A; margin-bottom: 0.25rem;">Pesanan Berhasil Dibuat!</h2>
        <p style="font-size: 0.88rem; color: #64748B;">Terima kasih <strong>${name}</strong>, pesanan Anda telah tersimpan dan siap diproses oleh Keyspace.</p>
        
        <div class="order-id-badge">${orderId}</div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 1.25rem; text-align: left; font-size: 0.88rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px dashed #CBD5E1; padding-bottom: 0.5rem;">
            <span style="color: #64748B;">Total Tagihan:</span>
            <strong style="color: #EA580C; font-size: 1.2rem;">${formatRupiah(totalAmount)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="color: #64748B;">Pengiriman:</span>
            <span>${courierLabel}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="color: #64748B;">Pembayaran:</span>
            <span>${payLabel}</span>
          </div>
          ${this.paymentMethod === 'bank' ? `
            <div style="margin-top: 0.75rem; background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; padding: 0.75rem;">
              <span style="font-size: 0.78rem; color: #9A3412; font-weight: 700; display: block; margin-bottom: 0.25rem;">Rekening Pembayaran BCA:</span>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 1.15rem; font-weight: 800; color: #1E293B;">8040-192-888</span>
                <button style="padding: 2px 8px; font-size: 0.75rem; background: #EA580C; color: #FFFFFF; border-radius: 4px; font-weight: 700; border: none; cursor: pointer;" onclick="navigator.clipboard.writeText('8040192888'); alert('Nomor Rekening BCA 8040192888 berhasil disalin!');">Salin</button>
              </div>
              <span style="font-size: 0.75rem; color: #64748B;">a.n Keyspace Apparel Studio</span>
            </div>
          ` : ""}
          ${this.paymentMethod === 'online' ? `
            <div style="margin-top: 0.75rem; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 0.75rem; text-align: center;">
              <span style="font-size: 0.78rem; color: #1E40AF; font-weight: 700; display: block; margin-bottom: 0.4rem;">Scan QRIS Keyspace via GoPay / BCA / ShopeePay / OVO:</span>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=KEYSPACE-${orderId}-${totalAmount}" alt="QRIS Code" style="margin: 0 auto; width: 120px; height: 120px; border-radius: 6px; border: 1px solid #CBD5E1;" />
            </div>
          ` : ""}
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <a href="https://wa.me/6285762005247?text=${waMessage}" target="_blank" class="btn btn-primary btn-lg" style="width: 100%; background: #25D366; color: #FFFFFF; font-weight: 800; text-decoration: none;">
            💬 Kirim Bukti & Konfirmasi via WhatsApp
          </a>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.print();">
              🖨️ Cetak Invoice
            </button>
            <button class="btn btn-dark btn-sm" onclick="document.getElementById('order-success-modal').classList.remove('active'); AppManager.navigateTo('riwayat');">
              📦 Lacak Pesanan
            </button>
          </div>
        </div>
      `;
    }

    if (successModal) {
      successModal.classList.add("active");
    }
  },

  // =========================================================================
  // 5. DETAIL PRODUK MODAL & PURCHASING CONTROLS
  // =========================================================================
  currentModalProduct: null,

  openProductDetail(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
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
            <img id="detail-active-img" src="${product.images.front}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="handleImageError(this, '${product.name}')" />
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
            <img src="${product.images.front}" style="width: 60px; height: 60px; border-radius: 8px; border: 2px solid var(--keyspace-yellow); cursor: pointer; object-fit: cover;" onclick="document.getElementById('detail-active-img').src='${product.images.front}'" onerror="handleImageError(this, '${product.name}')" />
            ${product.images.back ? `<img src="${product.images.back}" style="width: 60px; height: 60px; border-radius: 8px; border: 1px solid #E5E7EB; cursor: pointer; object-fit: cover;" onclick="document.getElementById('detail-active-img').src='${product.images.back}'" onerror="handleImageError(this, '${product.name}')" />` : ''}
            ${product.images.detail && product.images.detail !== product.images.front ? `<img src="${product.images.detail}" style="width: 60px; height: 60px; border-radius: 8px; border: 1px solid #E5E7EB; cursor: pointer; object-fit: cover;" onclick="document.getElementById('detail-active-img').src='${product.images.detail}'" onerror="handleImageError(this, '${product.name}')" />` : ''}
          </div>
        </div>

        <div>
          <span style="font-size: 0.75rem; font-weight: 800; color: #FFA800; text-transform: uppercase;">${product.categoryName}</span>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin: 0.25rem 0 0.5rem;">${product.name}</h2>
          
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            <span style="color: #F59E0B; font-weight: 700;">★ ${product.rating || '4.95'}</span>
            <span style="color: #64748B; font-size: 0.85rem;">(${product.reviewsCount || 120} Ulasan Terverifikasi | ${product.soldCount || 'Terlaris'})</span>
          </div>

          <div style="background: #F8FAFC; padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem;">
            ${product.originalPrice ? `
              <div style="font-size: 0.85rem; color: #94A3B8; text-decoration: line-through;">${formatRupiah(product.originalPrice)}</div>
            ` : ""}
            <div style="display: flex; align-items: baseline; gap: 0.75rem;">
              <span style="font-size: 1.6rem; font-weight: 800; color: ${product.discount ? '#EF4444' : '#1E293B'};">
                ${formatRupiah(product.price)}
              </span>
              ${product.discount ? `<span style="background: #FEE2E2; color: #DC2626; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 0.82rem;">${product.discount}</span>` : ""}
              ${product.badge ? `<span class="badge-preorder-tag">${product.badge}</span>` : ""}
            </div>
          </div>

          <p style="font-size: 0.88rem; color: #475569; line-height: 1.6; margin-bottom: 1.25rem;">${product.description}</p>

          <!-- Color options -->
          ${product.colors ? `
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                <label style="font-size: 0.85rem; font-weight: 700; color: #1E293B;">Pilihan Warna:</label>
                <span id="detail-selected-color-name" style="font-size: 0.82rem; color: #64748B; font-weight: 600;">${defaultColor}</span>
              </div>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${product.colors.map((c, i) => `
                  <button type="button" style="width: 30px; height: 30px; border-radius: 50%; background: ${c.hex}; border: 2.5px solid ${i === 0 ? '#FFA800' : '#CBD5E1'}; cursor: pointer; transition: all 0.2s;" title="${c.name}" onclick="AppManager.setModalColor('${c.name}', this)" class="modal-color-opt"></button>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <!-- Size options -->
          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 700; color: #1E293B; display: block; margin-bottom: 0.4rem;">Ukuran Baju / Garment:</label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${(product.sizes || ["All Size"]).map(s => `
                <button type="button" style="padding: 0.35rem 0.85rem; border: 1.5px solid ${s === defaultSize ? '#FFA800' : '#CBD5E1'}; background: ${s === defaultSize ? '#FFF7ED' : '#FFFFFF'}; color: ${s === defaultSize ? '#EA580C' : '#1E293B'}; border-radius: 6px; font-weight: 700; font-size: 0.85rem; cursor: pointer;" class="modal-size-opt" onclick="AppManager.setModalSize('${s}', this)">${s}</button>
              `).join("")}
            </div>
          </div>

          <!-- Quantity Stepper & Subtotal -->
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

          <!-- Action Buttons -->
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

  setModalColor(colorName, btn) {
    if (!this.currentModalProduct) return;
    this.currentModalProduct.colorName = colorName;
    document.querySelectorAll(".modal-color-opt").forEach(b => {
      b.style.borderColor = "#CBD5E1";
      b.style.transform = "scale(1)";
    });
    if (btn) {
      btn.style.borderColor = "#FFA800";
      btn.style.transform = "scale(1.15)";
    }
    const nameLabel = document.getElementById("detail-selected-color-name");
    if (nameLabel) nameLabel.textContent = colorName;
  },

  setModalSize(size, btn) {
    if (!this.currentModalProduct) return;
    this.currentModalProduct.size = size;
    document.querySelectorAll(".modal-size-opt").forEach(b => {
      b.style.borderColor = "#CBD5E1";
      b.style.background = "#FFFFFF";
      b.style.color = "#1E293B";
    });
    if (btn) {
      btn.style.borderColor = "#FFA800";
      btn.style.background = "#FFF7ED";
      btn.style.color = "#EA580C";
    }
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
    CartManager.addItem({
      id: this.currentModalProduct.id,
      name: this.currentModalProduct.name,
      price: this.currentModalProduct.price,
      image: this.currentModalProduct.image,
      colorName: this.currentModalProduct.colorName,
      size: this.currentModalProduct.size,
      qty: this.currentModalProduct.qty
    });
    document.getElementById("product-detail-modal")?.classList.remove("active");
    if (isDirectCheckout) {
      this.openCheckout();
    } else {
      this.toggleCartDrawer(true);
    }
  },

  applyCheckoutVoucher() {
    const input = document.getElementById("checkout-voucher-input");
    const msg = document.getElementById("checkout-voucher-msg");
    if (!input) return;
    const res = CartManager.applyVoucher(input.value);
    if (msg) {
      msg.textContent = res.message;
      msg.style.color = res.success ? "#16A34A" : "#EF4444";
      msg.style.fontWeight = "700";
    }
    this.renderCheckoutSummary();
  },

  // =========================================================================
  // 6. PORTOFOLIO, PILLARS, CLIENTS, TESTIMONIALS
  // =========================================================================
  renderPortfolio() {
    const homeContainer = document.getElementById("keyspace-portfolio-grid");
    const fullContainer = document.getElementById("portfolio-full-grid");

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
    if (!container) return;

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
    if (!container) return;

    container.innerHTML = CLIENTS_DATA.map(c => `
      <div class="client-logo-card" title="${c.name}">
        <img src="${c.logo}" alt="${c.name}" onerror="this.parentElement.innerHTML='<span style=\\'font-weight:700; font-size:0.85rem; color:#1E293B;\\'>${c.name}</span>'" />
      </div>
    `).join("");
  },

  renderTestimonials() {
    const container = document.getElementById("keyspace-testimonials-grid");
    if (!container) return;

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
    this.testimonialIndex = (this.testimonialIndex - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length;
    this.renderTestimonials();
  },

  nextTestimonial() {
    this.testimonialIndex = (this.testimonialIndex + 1) % TESTIMONIALS_DATA.length;
    this.renderTestimonials();
  },

  renderOrderHistory() {
    const list = document.getElementById("order-history-list");
    if (!list) return;

    const saved = localStorage.getItem("keyspace_orders");
    const orders = saved ? JSON.parse(saved) : INITIAL_ORDERS;

    list.innerHTML = orders.map(order => `
      <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <div>
            <span style="font-size: 0.85rem; font-weight: 700; color: #1E293B;">No. Pesanan: ${order.orderId}</span>
            <span style="font-size: 0.8rem; color: #94A3B8; margin-left: 0.75rem;">Tanggal: ${order.date}</span>
          </div>
          <span style="padding: 2px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; background: ${order.status === 'Selesai' ? '#DCFCE7' : '#E0F2FE'}; color: ${order.status === 'Selesai' ? '#15803D' : '#0369A1'};">
            ● ${order.status}
          </span>
        </div>
        <div style="font-size: 0.85rem; color: #475569; margin-bottom: 0.35rem;">
          <strong>Pengiriman:</strong> ${order.courier}
        </div>
        <div style="font-size: 0.85rem; color: #475569; margin-bottom: 0.5rem;">
          <strong>Pembayaran:</strong> ${order.paymentMethod || 'Online Payment'}
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; background: #F8FAFC; padding: 0.75rem; border-radius: 8px;">
          ${order.items.map(it => `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.85rem; color: #1E293B;">${it.name} (${it.size}, ${it.colorName || 'Standar'}) x ${it.qty}</span>
              <span style="font-size: 0.85rem; font-weight: 700;">${formatRupiah(it.price * it.qty)}</span>
            </div>
          `).join("")}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F1F5F9; padding-top: 0.75rem; margin-top: 0.75rem;">
          <span style="font-weight: 700;">Total Biaya:</span>
          <span style="font-size: 1.15rem; font-weight: 800; color: #FFA800;">${formatRupiah(order.totalAmount)}</span>
        </div>
      </div>
    `).join("");
  },

  renderArticles() {
    const grid = document.getElementById("articles-grid");
    if (!grid) return;

    grid.innerHTML = ARTICLES_DATA.map(art => `
      <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm);">
        <img src="${art.image}" alt="${art.title}" style="width: 100%; height: 180px; object-fit: cover;" />
        <div style="padding: 1.25rem;">
          <span style="font-size: 0.75rem; font-weight: 800; color: #FFA800; text-transform: uppercase;">${art.category}</span>
          <h3 style="font-size: 1rem; font-weight: 800; color: #0F172A; margin: 0.4rem 0 0.6rem; line-height: 1.35;">${art.title}</h3>
          <p style="font-size: 0.85rem; color: #64748B; line-height: 1.5; margin-bottom: 1rem;">${art.excerpt}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #94A3B8;">
            <span>📅 ${art.date}</span>
            <span style="color: #11203E; font-weight: 700; cursor: pointer;" onclick="alert('Artikel lengkap: ' + '${art.title}')">Baca Selengkapnya &rarr;</span>
          </div>
        </div>
      </div>
    `).join("");
  },

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
    const modal = document.getElementById("search-modal");
    if (modal) modal.classList.remove("active");
  },

  handleQuickSearch(e) {
    const term = (e.target.value || "").toLowerCase().trim();
    const resultsContainer = document.getElementById("quick-search-results");
    if (!resultsContainer) return;

    if (!term) {
      resultsContainer.innerHTML = `<p style="font-size: 0.85rem; color: #94A3B8; text-align: center; padding: 1rem;">Ketik kata kunci untuk mencari produk...</p>`;
      return;
    }

    const matches = PRODUCTS_DATA.filter(p => 
      p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.categoryName.toLowerCase().includes(term)
    );

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<p style="font-size: 0.85rem; color: #94A3B8; text-align: center; padding: 1rem;">Tidak ditemukan produk untuk "${term}".</p>`;
      return;
    }

    resultsContainer.innerHTML = matches.slice(0, 5).map(p => `
      <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 8px; background: #F8FAFC; cursor: pointer;" onclick="AppManager.closeSearchModal(); AppManager.openProductDetail('${p.id}')">
        <img src="${p.images.front}" alt="${p.name}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" />
        <div style="flex: 1;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: #1E293B;">${p.name}</h4>
          <span style="font-size: 0.8rem; font-weight: 700; color: ${p.discount ? '#EF4444' : '#1E293B'};">${formatRupiah(p.price)}</span>
        </div>
      </div>
    `).join("");
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
    toast.style.background = "#11203E";
    toast.style.color = "#FFFFFF";
    toast.style.padding = "0.75rem 1.25rem";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "0.9rem";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
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
  }, 2800);
};
