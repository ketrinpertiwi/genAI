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

    // Build SVG template based on Garment Type & View with realistic folds, seams & collar curves
    let svgGarmentPath = "";
    let printAreaX = 140;
    let printAreaY = 160;
    let printAreaW = 220;
    let printAreaH = 220;

    if (type === "kaos") {
      if (view === "front") {
        svgGarmentPath = `
          <!-- Drop Shadow underneath -->
          <filter id="garmentShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
          </filter>

          <g filter="url(#garmentShadow)">
            <!-- Inner Back Neck Depth -->
            <path d="M 188,72 C 218,60 282,60 312,72 C 300,105 200,105 188,72 Z" fill="#111111" opacity="0.6"/>
            <path d="M 210,68 Q 250,75 290,68" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" fill="none"/>
            <!-- Brand Tag inside collar -->
            <rect x="238" y="66" width="24" height="14" rx="2" fill="#E2E8F0" opacity="0.8"/>
            <text x="250" y="76" font-size="6" font-family="sans-serif" font-weight="bold" fill="#333" text-anchor="middle">KEYSPACE</text>

            <!-- Main T-Shirt Body Shape (Realistic Anatomical Curves) -->
            <path d="
              M 188,72 
              C 152,78 118,98 86,120
              C 74,129 65,142 56,158
              L 44,210
              C 40,224 50,238 64,240
              L 108,246
              C 122,248 134,238 138,225
              L 146,192
              C 144,250 142,320 138,438
              C 137,448 145,456 155,456
              C 185,458 315,458 345,456
              C 355,456 363,448 362,438
              C 358,320 356,250 354,192
              L 362,225
              C 366,238 378,248 392,246
              L 436,240
              C 450,238 460,224 456,210
              L 444,158
              C 435,142 426,129 414,120
              C 382,98 348,78 312,72
              C 292,108 208,108 188,72 Z
            " fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" />

            <!-- Realistic 3D Fabric Shading Overlay (Light / Shadow) -->
            <!-- Left & Right Body Side Shadows -->
            <path d="M 146,192 C 144,250 142,320 138,438 C 148,442 165,442 170,438 C 166,320 168,250 170,192 Z" fill="black" opacity="0.12"/>
            <path d="M 354,192 C 356,250 358,320 362,438 C 352,442 335,442 330,438 C 334,320 332,250 330,192 Z" fill="black" opacity="0.12"/>
            <!-- Underarm Shadows -->
            <path d="M 108,246 C 122,248 134,238 138,225 L 146,192 C 135,210 120,230 108,246 Z" fill="black" opacity="0.2"/>
            <path d="M 392,246 C 378,248 366,238 362,225 L 354,192 C 365,210 380,230 392,246 Z" fill="black" opacity="0.2"/>
            <!-- Chest Soft Light Gradient -->
            <ellipse cx="250" cy="220" rx="90" ry="120" fill="white" opacity="${color === '#FFFFFF' || color === '#ffffff' ? '0.04' : '0.08'}"/>

            <!-- Ribbed Collar Band (Realistic Curvature) -->
            <path d="
              M 188,72 
              C 208,108 292,108 312,72
              C 302,118 198,118 188,72 Z
            " fill="rgba(0,0,0,0.18)" stroke="rgba(0,0,0,0.35)" stroke-width="1.2"/>
            <path d="M 194,82 C 212,112 288,112 306,82" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="2,2" fill="none"/>

            <!-- Shoulder Seams -->
            <path d="M 188,72 C 152,78 118,98 86,120" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none"/>
            <path d="M 312,72 C 348,78 382,98 414,120" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none"/>
            <path d="M 190,75 C 154,81 120,101 88,123" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2,2" fill="none"/>
            <path d="M 310,75 C 346,81 380,101 412,123" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2,2" fill="none"/>

            <!-- Armhole Seams (Set-in Sleeve) -->
            <path d="M 86,120 C 110,145 130,170 146,192" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none"/>
            <path d="M 414,120 C 390,145 370,170 354,192" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none"/>
            <path d="M 88,122 C 112,147 132,172 148,194" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="3,2" fill="none"/>
            <path d="M 412,122 C 388,147 368,172 352,194" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="3,2" fill="none"/>

            <!-- Sleeve Hem Folds & Double Stitches -->
            <path d="M 44,210 L 108,246" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" fill="none"/>
            <path d="M 49,202 L 109,236" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="2,2" fill="none"/>
            <path d="M 456,210 L 392,246" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" fill="none"/>
            <path d="M 451,202 L 391,236" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="2,2" fill="none"/>

            <!-- Bottom Hem Curve & Double Stitching -->
            <path d="M 139,442 C 185,446 315,446 361,442" stroke="rgba(0,0,0,0.3)" stroke-width="1.2" fill="none"/>
            <path d="M 141,446 C 185,450 315,450 359,446" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3,2" fill="none"/>

            <!-- Soft Natural Fabric Crease Lines -->
            <path d="M 146,210 Q 170,235 158,270" stroke="rgba(0,0,0,0.1)" stroke-width="2" fill="none"/>
            <path d="M 354,210 Q 330,235 342,270" stroke="rgba(0,0,0,0.1)" stroke-width="2" fill="none"/>
            <path d="M 152,380 Q 175,395 150,420" stroke="rgba(0,0,0,0.08)" stroke-width="2" fill="none"/>
            <path d="M 348,380 Q 325,395 350,420" stroke="rgba(0,0,0,0.08)" stroke-width="2" fill="none"/>
          </g>
        `;
        printAreaX = 180;
        printAreaY = 140;
        printAreaW = 140;
        printAreaH = 220;
      } else if (view === "back") {
        svgGarmentPath = `
          <filter id="garmentShadowBack" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
          </filter>

          <g filter="url(#garmentShadowBack)">
            <!-- Main T-Shirt Body Shape Back View -->
            <path d="
              M 188,72 
              C 152,78 118,98 86,120
              C 74,129 65,142 56,158
              L 44,210
              C 40,224 50,238 64,240
              L 108,246
              C 122,248 134,238 138,225
              L 146,192
              C 144,250 142,320 138,438
              C 137,448 145,456 155,456
              C 185,458 315,458 345,456
              C 355,456 363,448 362,438
              C 358,320 356,250 354,192
              L 362,225
              C 366,238 378,248 392,246
              L 436,240
              C 450,238 460,224 456,210
              L 444,158
              C 435,142 426,129 414,120
              C 382,98 348,78 312,72
              C 282,62 218,62 188,72 Z
            " fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" />

            <!-- Back Collar High Rib -->
            <path d="
              M 188,72 
              C 218,62 282,62 312,72
              C 292,80 208,80 188,72 Z
            " fill="rgba(0,0,0,0.2)" stroke="rgba(0,0,0,0.35)" stroke-width="1.2"/>
            <path d="M 194,74 C 218,66 282,66 306,74" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="2,2" fill="none"/>

            <!-- Shoulder Stitch Line & Neck Moon Patch -->
            <path d="M 188,72 C 152,78 118,98 86,120" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none"/>
            <path d="M 312,72 C 348,78 382,98 414,120" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none"/>
            <path d="M 86,120 C 110,145 130,170 146,192" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none"/>
            <path d="M 414,120 C 390,145 370,170 354,192" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none"/>

            <!-- Hem Lines -->
            <path d="M 44,210 L 108,246" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" fill="none"/>
            <path d="M 456,210 L 392,246" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" fill="none"/>
            <path d="M 139,442 C 185,446 315,446 361,442" stroke="rgba(0,0,0,0.3)" stroke-width="1.2" fill="none"/>
            <path d="M 141,446 C 185,450 315,450 359,446" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3,2" fill="none"/>
          </g>
        `;
        printAreaX = 180;
        printAreaY = 110;
        printAreaW = 140;
        printAreaH = 260;
      } else if (view === "chest") {
        svgGarmentPath = `
          <filter id="garmentShadowChest" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
          </filter>

          <g filter="url(#garmentShadowChest)">
            <path d="M 188,72 C 218,60 282,60 312,72 C 300,105 200,105 188,72 Z" fill="#111111" opacity="0.6"/>
            <path d="
              M 188,72 
              C 152,78 118,98 86,120
              C 74,129 65,142 56,158
              L 44,210
              C 40,224 50,238 64,240
              L 108,246
              C 122,248 134,238 138,225
              L 146,192
              C 144,250 142,320 138,438
              C 137,448 145,456 155,456
              C 185,458 315,458 345,456
              C 355,456 363,448 362,438
              C 358,320 356,250 354,192
              L 362,225
              C 366,238 378,248 392,246
              L 436,240
              C 450,238 460,224 456,210
              L 444,158
              C 435,142 426,129 414,120
              C 382,98 348,78 312,72
              C 292,108 208,108 188,72 Z
            " fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" />
            <path d="M 188,72 C 208,108 292,108 312,72 C 302,118 198,118 188,72 Z" fill="rgba(0,0,0,0.18)" stroke="rgba(0,0,0,0.35)" stroke-width="1.2"/>
            <path d="M 188,72 C 152,78 118,98 86,120" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none"/>
            <path d="M 86,120 C 110,145 130,170 146,192" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none"/>
          </g>
        `;
        printAreaX = 180;
        printAreaY = 135;
        printAreaW = 70;
        printAreaH = 70;
      } else if (view === "sleeve") {
        svgGarmentPath = `
          <filter id="garmentShadowSleeve" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.4"/>
          </filter>
          <g filter="url(#garmentShadowSleeve)">
            <!-- Realistic Sleeve Close-Up -->
            <path d="
              M 170,80 
              C 210,65 290,65 330,80 
              C 350,140 365,260 360,390 
              C 360,405 348,415 332,415 
              L 168,415 
              C 152,415 140,405 140,390 
              C 135,260 150,140 170,80 Z
            " fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>
            <!-- Shoulder Cap Seam Curve -->
            <path d="M 170,80 C 210,65 290,65 330,80" stroke="rgba(0,0,0,0.25)" stroke-width="2" fill="none"/>
            <path d="M 172,83 C 210,70 290,70 328,83" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3,2" fill="none"/>
            <!-- Sleeve Cuff Rib & Stitch -->
            <path d="M 140,390 L 360,390" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" fill="none"/>
            <path d="M 142,396 L 358,396" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3,2" fill="none"/>
          </g>
        `;
        printAreaX = 180;
        printAreaY = 160;
        printAreaW = 140;
        printAreaH = 160;
      }
    } else if (type === "hoodie") {
      svgGarmentPath = `
        <filter id="hoodieShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
        </filter>
        <g filter="url(#hoodieShadow)">
          <!-- Hoodie Hood Outer -->
          <path d="M 160,50 C 170,18 330,18 340,50 C 375,95 345,130 320,135 C 250,145 180,135 160,50 Z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>
          <!-- Hood Inner Depth -->
          <path d="M 205,52 C 225,32 275,32 295,52 C 305,95 285,115 250,118 C 215,115 195,95 205,52 Z" fill="#111111" opacity="0.65"/>
          
          <!-- Hoodie Main Body -->
          <path d="
            M 170,120 
            C 142,128 112,148 84,172
            L 40,245
            C 36,258 45,272 58,274
            L 98,280
            C 112,282 122,274 128,260
            L 138,230
            L 134,435
            C 134,448 144,458 158,458
            L 342,458
            C 356,458 366,448 366,435
            L 362,230
            L 372,260
            C 378,274 388,282 402,280
            L 442,274
            C 455,272 464,258 460,245
            L 416,172
            C 388,148 358,128 330,120
            Z
          " fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>

          <!-- Drawstrings -->
          <path d="M 226,120 Q 220,195 215,225" stroke="#F8FAFC" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <circle cx="215" cy="227" r="2.5" fill="#94A3B8"/>
          <path d="M 274,120 Q 280,195 285,225" stroke="#F8FAFC" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <circle cx="285" cy="227" r="2.5" fill="#94A3B8"/>

          <!-- Kangaroo Pocket -->
          <path d="M 175,325 L 325,325 L 348,425 L 152,425 Z" fill="rgba(0,0,0,0.15)" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>
          <path d="M 175,325 L 152,425" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3,2" fill="none"/>
          <path d="M 325,325 L 348,425" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3,2" fill="none"/>
          
          <!-- Bottom Ribbed Hem -->
          <rect x="134" y="438" width="232" height="20" rx="3" fill="rgba(0,0,0,0.2)" stroke="rgba(0,0,0,0.35)" stroke-width="1.2"/>
        </g>
      `;
      printAreaX = 180;
      printAreaY = 150;
      printAreaW = 140;
      printAreaH = 150;
    } else if (type === "polo") {
      svgGarmentPath = `
        <filter id="poloShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
        </filter>
        <g filter="url(#poloShadow)">
          <!-- Inner Neck -->
          <path d="M 188,72 C 218,60 282,60 312,72 C 300,105 200,105 188,72 Z" fill="#111111" opacity="0.6"/>
          
          <!-- Polo Body Shape -->
          <path d="
            M 188,72 
            C 152,78 118,98 86,120
            L 50,185
            C 44,198 52,212 66,215
            L 104,222
            C 118,224 128,215 132,202
            L 142,175
            L 138,438
            C 137,448 145,456 155,456
            C 185,458 315,458 345,456
            C 355,456 363,448 362,438
            L 358,175
            L 368,202
            C 372,215 382,224 396,222
            L 434,215
            C 448,212 456,198 450,185
            L 414,120
            C 382,98 348,78 312,72
            Z
          " fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>

          <!-- Polo Collar Lapels / Wings -->
          <polygon points="175,70 250,118 200,165 158,105" fill="rgba(0,0,0,0.22)" stroke="rgba(0,0,0,0.35)" stroke-width="1.2"/>
          <polygon points="325,70 250,118 300,165 342,105" fill="rgba(0,0,0,0.22)" stroke="rgba(0,0,0,0.35)" stroke-width="1.2"/>

          <!-- Button Placket -->
          <rect x="238" y="112" width="24" height="90" fill="rgba(0,0,0,0.18)" rx="2" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
          <circle cx="250" cy="130" r="3.5" fill="#FFFFFF" stroke="#64748B" stroke-width="1"/>
          <circle cx="250" cy="158" r="3.5" fill="#FFFFFF" stroke="#64748B" stroke-width="1"/>
          <circle cx="250" cy="186" r="3.5" fill="#FFFFFF" stroke="#64748B" stroke-width="1"/>

          <!-- Ribbed Sleeve Cuffs -->
          <path d="M 50,185 L 104,222" stroke="rgba(0,0,0,0.35)" stroke-width="2" fill="none"/>
          <path d="M 450,185 L 396,222" stroke="rgba(0,0,0,0.35)" stroke-width="2" fill="none"/>
        </g>
      `;
      printAreaX = 175;
      printAreaY = 215;
      printAreaW = 150;
      printAreaH = 180;
    } else if (type === "jersey") {
      svgGarmentPath = `
        <filter id="jerseyShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
        </filter>
        <g filter="url(#jerseyShadow)">
          <!-- Main Jersey Body -->
          <path d="
            M 188,72 
            C 152,78 118,98 86,120
            L 48,185
            C 42,198 50,212 64,215
            L 104,222
            C 118,224 128,215 132,202
            L 142,175
            L 138,438
            C 137,448 145,456 155,456
            C 185,458 315,458 345,456
            C 355,456 363,448 362,438
            L 358,175
            L 368,202
            C 372,215 382,224 396,222
            L 436,215
            C 450,212 458,198 452,185
            L 414,120
            C 382,98 348,78 312,72
            Z
          " fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>

          <!-- Dynamic Side Mesh Panels -->
          <path d="M 142,175 L 165,190 L 160,438 L 138,438 Z" fill="rgba(255,255,255,0.18)"/>
          <path d="M 358,175 L 335,190 L 340,438 L 362,438 Z" fill="rgba(255,255,255,0.18)"/>

          <!-- Modern Athletic V-Neck Collar -->
          <polygon points="195,72 250,128 305,72 285,72 250,110 215,72" fill="rgba(255,255,255,0.4)" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
        </g>
      `;
      printAreaX = 180;
      printAreaY = 145;
      printAreaW = 140;
      printAreaH = 220;
    } else if (type === "totebag") {
      svgGarmentPath = `
        <filter id="toteShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
        </filter>
        <g filter="url(#toteShadow)">
          <!-- Handles -->
          <path d="M 180,45 C 180,140 220,150 220,150 M 320,45 C 320,140 280,150 280,150" stroke="rgba(0,0,0,0.5)" stroke-width="14" fill="none" stroke-linecap="round"/>
          <path d="M 180,45 C 180,140 220,150 220,150 M 320,45 C 320,140 280,150 280,150" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
          
          <!-- Canvas Body -->
          <rect x="130" y="145" width="240" height="300" rx="16" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>
          <line x1="130" y1="168" x2="370" y2="168" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="4,2"/>
        </g>
      `;
      printAreaX = 165;
      printAreaY = 185;
      printAreaW = 170;
      printAreaH = 210;
    } else if (type === "topi") {
      svgGarmentPath = `
        <filter id="capShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
        </filter>
        <g filter="url(#capShadow)">
          <!-- Snapback Crown Dome -->
          <path d="M 110,265 Q 250,85 390,265 Z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>
          <!-- Seam Lines on Crown -->
          <path d="M 250,120 L 250,265" stroke="rgba(0,0,0,0.25)" stroke-width="1.5" fill="none"/>
          <path d="M 250,120 Q 180,180 140,265" stroke="rgba(0,0,0,0.2)" stroke-width="1.2" fill="none"/>
          <path d="M 250,120 Q 320,180 360,265" stroke="rgba(0,0,0,0.2)" stroke-width="1.2" fill="none"/>
          
          <!-- Cap Visor Brim Curve -->
          <path d="M 75,265 Q 250,305 425,265 C 415,305 250,345 75,265 Z" fill="${color}" stroke="rgba(0,0,0,0.35)" stroke-width="1.5"/>
          <!-- Top Button -->
          <circle cx="250" cy="120" r="8" fill="rgba(0,0,0,0.35)"/>
        </g>
      `;
      printAreaX = 190;
      printAreaY = 160;
      printAreaW = 120;
      printAreaH = 85;
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
      window.AppManager?.toggleCartDrawer(true);
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
