/**
 * Interactive Apparel Customizer Studio
 * Supports dynamic product switching, color changes, design placement, text/logo upload, & live price calculation.
 */

class ApparelCustomizer {
  constructor() {
    this.productType = "kaos"; // kaos, hoodie, polo, jersey, totebag, topi
    this.garmentColor = "#1A1A1A"; // default black
    this.activeView = "front"; // front, back, chest, sleeve
    this.textInput = "CUSTOM PRINT";
    this.fontFamily = "Outfit";
    this.textColor = "#FFFFFF";
    this.textSize = 24;
    this.textRotation = 0;
    this.uploadedImageSrc = null;
    this.selectedClipart = null;
    this.basePrices = {
      kaos: 55000,
      hoodie: 145000,
      polo: 95000,
      jersey: 115000,
      totebag: 35000,
      topi: 49000
    };
    this.printCostPerSide = 25000;
  }

  init() {
    this.bindEvents();
    this.renderMockup();
    this.updatePrice();
  }

  bindEvents() {
    // Product Type Selector
    const productSelect = document.getElementById("customizer-product-type");
    if (productSelect) {
      productSelect.addEventListener("change", (e) => {
        this.productType = e.target.value;
        this.renderMockup();
        this.updatePrice();
      });
    }

    // Color Swatches
    const colorButtons = document.querySelectorAll(".customizer-color-btn");
    colorButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        colorButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.garmentColor = btn.dataset.color;
        this.renderMockup();
      });
    });

    // View Positions (Depan, Belakang, Dada Kiri, Lengan)
    const viewButtons = document.querySelectorAll(".customizer-view-btn");
    viewButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        viewButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeView = btn.dataset.view;
        this.renderMockup();
      });
    });

    // Text Input & Style Controls
    const textElem = document.getElementById("customizer-text-input");
    if (textElem) {
      textElem.addEventListener("input", (e) => {
        this.textInput = e.target.value;
        this.renderMockup();
      });
    }

    const fontElem = document.getElementById("customizer-font-select");
    if (fontElem) {
      fontElem.addEventListener("change", (e) => {
        this.fontFamily = e.target.value;
        this.renderMockup();
      });
    }

    const colorElem = document.getElementById("customizer-text-color");
    if (colorElem) {
      colorElem.addEventListener("input", (e) => {
        this.textColor = e.target.value;
        this.renderMockup();
      });
    }

    const sizeElem = document.getElementById("customizer-text-size");
    if (sizeElem) {
      sizeElem.addEventListener("input", (e) => {
        this.textSize = parseInt(e.target.value, 10);
        this.renderMockup();
      });
    }

    const rotateElem = document.getElementById("customizer-text-rotate");
    if (rotateElem) {
      rotateElem.addEventListener("input", (e) => {
        this.textRotation = parseInt(e.target.value, 10);
        this.renderMockup();
      });
    }

    // Image / Logo Upload
    const uploadInput = document.getElementById("customizer-image-upload");
    if (uploadInput) {
      uploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.uploadedImageSrc = event.target.result;
            this.renderMockup();
            this.updatePrice();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Clipart selector
    const clipartBtns = document.querySelectorAll(".customizer-clipart-btn");
    clipartBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        clipartBtns.forEach(b => b.classList.remove("active"));
        if (btn.classList.contains("active-clipart")) {
          btn.classList.remove("active-clipart");
          this.selectedClipart = null;
        } else {
          btn.classList.add("active-clipart");
          this.selectedClipart = btn.dataset.clipart;
        }
        this.renderMockup();
      });
    });

    // Add Custom Product to Cart
    const addCartBtn = document.getElementById("customizer-add-cart-btn");
    if (addCartBtn) {
      addCartBtn.addEventListener("click", () => {
        this.addToCart();
      });
    }
  }

  calculateTotalPrice() {
    let price = this.basePrices[this.productType] || 55000;
    // Add print price for active custom design
    if (this.textInput.trim() || this.uploadedImageSrc || this.selectedClipart) {
      price += this.printCostPerSide;
    }
    return price;
  }

  updatePrice() {
    const priceDisplay = document.getElementById("customizer-total-price");
    if (priceDisplay) {
      priceDisplay.textContent = formatRupiah(this.calculateTotalPrice());
    }
  }

  renderMockup() {
    const canvasContainer = document.getElementById("customizer-svg-container");
    if (!canvasContainer) return;

    const color = this.garmentColor;
    const view = this.activeView;
    const type = this.productType;

    // Build SVG template based on Garment Type & View
    let svgGarmentPath = "";
    let shadowOverlay = "";
    let printAreaX = 140;
    let printAreaY = 160;
    let printAreaW = 220;
    let printAreaH = 220;

    if (type === "kaos") {
      if (view === "front" || view === "back") {
        svgGarmentPath = `<path d="M 130,50 Q 250,90 370,50 L 450,140 L 380,210 L 370,170 L 370,450 Q 250,460 130,450 L 130,170 L 120,210 L 50,140 Z" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        <path d="M 180,50 Q 250,110 320,50" fill="none" stroke="${view === 'front' ? '#000' : 'rgba(0,0,0,0.4)'}" stroke-width="3" opacity="0.3"/>`;
        printAreaX = 170;
        printAreaY = 140;
        printAreaW = 160;
        printAreaH = 240;
      } else if (view === "chest") {
        svgGarmentPath = `<path d="M 130,50 Q 250,90 370,50 L 450,140 L 380,210 L 370,170 L 370,450 Q 250,460 130,450 L 130,170 L 120,210 L 50,140 Z" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>`;
        printAreaX = 180;
        printAreaY = 130;
        printAreaW = 80;
        printAreaH = 80;
      } else if (view === "sleeve") {
        svgGarmentPath = `<path d="M 120,100 L 380,100 L 350,400 L 150,400 Z" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>`;
        printAreaX = 180;
        printAreaY = 180;
        printAreaW = 140;
        printAreaH = 140;
      }
    } else if (type === "hoodie") {
      svgGarmentPath = `
        <path d="M 160,30 Q 250,10 340,30 Q 380,90 340,110 Q 250,120 160,110 Q 120,90 160,30 Z" fill="${color}" opacity="0.9"/>
        <path d="M 140,100 Q 250,130 360,100 L 460,190 L 400,260 L 370,220 L 370,460 Q 250,470 130,460 L 130,220 L 100,260 L 40,190 Z" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        <rect x="180" y="340" width="140" height="90" rx="8" fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.1)"/>
      `;
      printAreaX = 170;
      printAreaY = 150;
      printAreaW = 160;
      printAreaH = 170;
    } else if (type === "polo") {
      svgGarmentPath = `
        <path d="M 130,60 Q 250,90 370,60 L 440,140 L 380,200 L 370,170 L 370,450 Q 250,460 130,450 L 130,170 L 120,200 L 60,140 Z" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        <polygon points="180,60 250,110 210,150 170,90" fill="rgba(0,0,0,0.2)"/>
        <polygon points="320,60 250,110 290,150 330,90" fill="rgba(0,0,0,0.2)"/>
        <rect x="235" y="100" width="30" height="90" fill="rgba(0,0,0,0.15)"/>
        <circle cx="250" cy="120" r="3" fill="#fff"/>
        <circle cx="250" cy="150" r="3" fill="#fff"/>
      `;
      printAreaX = 160;
      printAreaY = 200;
      printAreaW = 180;
      printAreaH = 200;
    } else if (type === "jersey") {
      svgGarmentPath = `
        <path d="M 130,50 Q 250,80 370,50 L 450,140 L 380,210 L 370,170 L 370,450 Q 250,460 130,450 L 130,170 L 120,210 L 50,140 Z" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        <path d="M 50,140 L 130,170 L 130,450 L 50,140" fill="rgba(255,255,255,0.1)"/>
        <path d="M 450,140 L 370,170 L 370,450 L 450,140" fill="rgba(255,255,255,0.1)"/>
      `;
      printAreaX = 170;
      printAreaY = 130;
      printAreaW = 160;
      printAreaH = 240;
    } else if (type === "totebag") {
      svgGarmentPath = `
        <path d="M 180,40 C 180,120 220,140 220,140 M 320,40 C 320,120 280,140 280,140" stroke="rgba(0,0,0,0.4)" stroke-width="12" fill="none"/>
        <rect x="130" y="140" width="240" height="300" rx="12" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      `;
      printAreaX = 160;
      printAreaY = 170;
      printAreaW = 180;
      printAreaH = 220;
    } else if (type === "topi") {
      svgGarmentPath = `
        <path d="M 100,260 Q 250,100 400,260 Z" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        <path d="M 70,260 Q 250,290 430,260 C 420,290 250,330 70,260 Z" fill="${color}" opacity="0.8" stroke="rgba(0,0,0,0.3)"/>
        <circle cx="250" cy="180" r="10" fill="rgba(0,0,0,0.2)"/>
      `;
      printAreaX = 190;
      printAreaY = 180;
      printAreaW = 120;
      printAreaH = 70;
    }

    // Build Graphics Layer inside Print Area
    let graphicsContent = "";
    
    // Uploaded Image Layer
    if (this.uploadedImageSrc) {
      graphicsContent += `<image href="${this.uploadedImageSrc}" x="${printAreaX + (printAreaW - 120) / 2}" y="${printAreaY + 10}" width="120" height="120" preserveAspectRatio="xMidYMid meet" />`;
    }

    // Clipart Layer
    if (this.selectedClipart) {
      const clipartSvgs = {
        star: `<polygon points="250,150 265,185 300,185 270,205 285,240 250,220 215,240 230,205 200,185 235,185" fill="#FFD700"/>`,
        badge: `<circle cx="250" cy="200" r="45" fill="#E63946"/><circle cx="250" cy="200" r="35" fill="none" stroke="#FFF" stroke-width="3"/><text x="250" y="206" text-anchor="middle" fill="#FFF" font-size="14" font-weight="bold">VIP CRAFT</text>`,
        skull: `<path d="M 230,180 Q 250,150 270,180 Q 280,210 270,230 L 230,230 Z" fill="#FFF"/><circle cx="240" cy="195" r="5" fill="#000"/><circle cx="260" cy="195" r="5" fill="#000"/>`,
        lion: `<circle cx="250" cy="200" r="40" fill="#D4AF37"/><text x="250" y="208" text-anchor="middle" fill="#000" font-size="28">🦁</text>`
      };
      if (clipartSvgs[this.selectedClipart]) {
        graphicsContent += clipartSvgs[this.selectedClipart];
      }
    }

    // Text Layer
    if (this.textInput.trim()) {
      const textX = printAreaX + printAreaW / 2;
      const textY = printAreaY + (this.uploadedImageSrc || this.selectedClipart ? 160 : printAreaH / 2);
      graphicsContent += `
        <g transform="rotate(${this.textRotation}, ${textX}, ${textY})">
          <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" 
                fill="${this.textColor}" font-family="${this.fontFamily}, sans-serif" 
                font-size="${this.textSize}" font-weight="bold" 
                style="letter-spacing: 1px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
            ${this.escapeHtml(this.textInput)}
          </text>
        </g>
      `;
    }

    const fullSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" class="customizer-svg">
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#334155" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9"/>
          </radialGradient>
        </defs>
        <rect width="500" height="500" fill="url(#bgGlow)" rx="16"/>
        
        <!-- Print Area Guideline Border -->
        <rect x="${printAreaX}" y="${printAreaY}" width="${printAreaW}" height="${printAreaH}" 
              fill="none" stroke="rgba(56, 189, 248, 0.4)" stroke-dasharray="4,4" rx="4"/>
        <text x="${printAreaX + 6}" y="${printAreaY + 16}" fill="rgba(56, 189, 248, 0.7)" font-size="10" font-family="sans-serif">Area Cetak (${view.toUpperCase()})</text>
        
        <!-- Garment Vector Base -->
        ${svgGarmentPath}
        
        <!-- Custom Printed Graphic & Text Layer -->
        ${graphicsContent}
      </svg>
    `;

    canvasContainer.innerHTML = fullSvg;
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  addToCart() {
    const total = this.calculateTotalPrice();
    const typeNames = {
      kaos: "Kaos Custom Premium",
      hoodie: "Hoodie Custom Fleece",
      polo: "Polo Shirt Custom",
      jersey: "Jersey Custom Sublimasi",
      totebag: "Totebag Canvas Custom",
      topi: "Topi Snapback Custom"
    };

    // Generate SVG thumbnail URI for cart display
    const svgElem = document.querySelector(".customizer-svg");
    let thumbnailUri = "assets/images/cat_kaos_custom.jpg";
    if (svgElem) {
      const svgData = new XMLSerializer().serializeToString(svgElem);
      thumbnailUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
    }

    const customCartItem = {
      id: "custom-" + Date.now(),
      name: `${typeNames[this.productType]} (${this.activeView.toUpperCase()})`,
      category: "kaos-custom",
      price: total,
      qty: 1,
      size: document.getElementById("customizer-size-select")?.value || "L",
      colorName: this.getColorName(this.garmentColor),
      image: thumbnailUri,
      customSpecs: {
        text: this.textInput,
        font: this.fontFamily,
        view: this.activeView,
        type: this.productType
      }
    };

    if (window.CartManager) {
      window.CartManager.addItem(customCartItem);
      window.showToast("Produk Custom berhasil ditambahkan ke keranjang! 🎉");
    }
  }

  getColorName(hex) {
    const map = {
      "#1A1A1A": "Hitam",
      "#FFFFFF": "Putih",
      "#1B2A4A": "Navy Blue",
      "#5B121A": "Maroon",
      "#3B4A34": "Olive",
      "#D4A373": "Mustard",
      "#A8A8A8": "Heather Grey"
    };
    return map[hex.toUpperCase()] || hex;
  }
}

window.ApparelCustomizer = ApparelCustomizer;
