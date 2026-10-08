/**
 * Keyspace Products & App Data
 * Replicated exactly to match Keyspace.id visual design & layout
 */

const PRODUCTS_DATA = [
  // 1. Kaos Custom
  {
    id: "kp-1",
    name: "Sablon Kaos Custom Combed 30s - Kaos Sablon Satuan & Lusinan Bahan Cotton Combed 30s",
    shortTitle: "Sablon Kaos Custom Combed 30s - Kaos Sablon Satuan &...",
    category: "kaos-custom",
    categoryName: "Kaos Custom",
    price: 60000,
    originalPrice: 75000,
    discount: "-20%",
    soldCount: "1.487 terjual",
    isPreOrder: true,
    rating: 4.95,
    reviewsCount: 342,
    isFeatured: true,
    badge: "PRE-ORDER",
    description: "Sablon kaos custom Cotton Combed 30s satuan maupun lusinan. Menggunakan teknik cetak DTF (Direct To Film) premium dengan tinta elastis, warna tajam, dan tidak mudah retak walau dicuci berkali-kali.",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#121212" },
      { name: "Navy", hex: "#1B2A4A" },
      { name: "Maroon", hex: "#5B121A" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/prod_card_img_1.png",
      back: "assets/images/cat_kaos_custom.jpg",
      detail: "assets/images/keyspace/prod_card_img_1.png"
    }
  },
  {
    id: "kp-2",
    name: "Sablon Kaos Custom Combed 24s - Kaos Sablon Satuan & Lusinan Bahan Cotton Combed 24s",
    shortTitle: "Sablon Kaos Custom Combed 24s - Kaos Sablon Satuan &...",
    category: "kaos-custom",
    categoryName: "Kaos Custom",
    price: 75000,
    originalPrice: 85000,
    discount: "-12%",
    soldCount: "7.580 terjual",
    isPreOrder: true,
    rating: 4.98,
    reviewsCount: 289,
    isFeatured: true,
    badge: "PRE-ORDER",
    description: "Kaos custom bahan Combed 24s yang lebih tebal, kokoh, dan tidak tembus pandang. Menggunakan sablon DTF resolusi tinggi hingga 1440 DPI dan finishing press panas ganda.",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#121212" },
      { name: "Sage Green", hex: "#9CAF88" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/prod_card_img_2.png",
      back: "assets/images/cat_kaos_custom.jpg",
      detail: "assets/images/keyspace/prod_card_img_2.png"
    }
  },
  // 2. Polo Shirt
  {
    id: "kp-3",
    name: "Custom Poloshirt Lacoste Pique CVC Premium - Sablon & Bordir",
    shortTitle: "Custom Poloshirt Lacoste Pique CVC Premium - Sablon...",
    category: "polo-shirt",
    categoryName: 'Kaos Polo "Poloshirt"',
    price: 98000,
    originalPrice: 110000,
    discount: "-11%",
    soldCount: "7.711 terjual",
    isPreOrder: true,
    rating: 4.92,
    reviewsCount: 178,
    isFeatured: true,
    badge: "PRE-ORDER",
    description: "Polo shirt berkerah Lacoste Pique CVC Premium (campuran katun dan viscose premium) yang sejuk, berpori lembut, dan tahan susut. Sangat cocok untuk seragam kantor, gathering, atau apparel formal.",
    colors: [
      { name: "Navy Blue", hex: "#1C2D42" },
      { name: "Black", hex: "#181818" },
      { name: "White", hex: "#FFFFFF" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/prod_card_img_3.png",
      back: "assets/images/cat_polo_shirt.jpg",
      detail: "assets/images/keyspace/prod_card_img_3.png"
    }
  },
  {
    id: "kp-4",
    name: "Custom Poloshirt Lacoste Pique PE - Sablon Logo & Event Gathering",
    shortTitle: "Custom Poloshirt Lacoste Pique PE - Sablon Logo...",
    category: "polo-shirt",
    categoryName: 'Kaos Polo "Poloshirt"',
    price: 69000,
    originalPrice: null,
    discount: null,
    soldCount: "6.514 terjual",
    isPreOrder: true,
    rating: 4.88,
    reviewsCount: 125,
    isFeatured: true,
    badge: "PRE-ORDER",
    description: "Polo shirt ekonomis bahan Lacoste PE berkualitas tinggi untuk event massal, gathering karyawan, kampanye, atau promosi bisnis.",
    colors: [
      { name: "Maroon", hex: "#5B121A" },
      { name: "Navy", hex: "#1B2A4A" },
      { name: "Black", hex: "#1A1A1A" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/prod_card_img_4.png",
      back: "assets/images/cat_polo_shirt.jpg",
      detail: "assets/images/keyspace/prod_card_img_4.png"
    }
  },
  // 3. Kaos Polos
  {
    id: "kp-5",
    name: "Kaos Polos Cotton Combed 30s Lengan pendek — Regular Fit Distro",
    shortTitle: "Kaos Polos Cotton Combed 30s Lengan pendek —...",
    category: "kaos-polos",
    categoryName: "Kaos Polos",
    price: 37000,
    originalPrice: null,
    discount: null,
    soldCount: "17.231 terjual",
    isPreOrder: false,
    rating: 4.97,
    reviewsCount: 512,
    isFeatured: true,
    badge: "Ready Stock",
    description: "Kaos polos basic 100% Cotton Combed 30s super adem, menyerap keringat, dan jahitan rantai rapi standar distro Indonesia. Tersedia dalam lebih dari 30 pilihan warna.",
    colors: [
      { name: "Navy", hex: "#1B2A4A" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Mustard", hex: "#D4A373" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/prod_card_img_5.png",
      back: "assets/images/cat_kaos_polos.jpg",
      detail: "assets/images/keyspace/prod_card_img_5.png"
    }
  },
  {
    id: "kp-6",
    name: "Kaos Polos Cotton Combed 24s Lengan Pendek — Tebal & Nyaman",
    shortTitle: "Kaos Polos Cotton Combed 24s Lengan Pendek —...",
    category: "kaos-polos",
    categoryName: "Kaos Polos",
    price: 44000,
    originalPrice: null,
    discount: null,
    soldCount: "12.450 terjual",
    isPreOrder: false,
    rating: 4.94,
    reviewsCount: 388,
    isFeatured: true,
    badge: "Ready Stock",
    description: "Kaos polos katun combed 24s dengan gramasi lebih tebal, potongan regular fit presisi, jahitan rantai leher ganda, sangat awet untuk daily wear.",
    colors: [
      { name: "Maroon", hex: "#5B121A" },
      { name: "Navy", hex: "#1B2A4A" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Dark Grey", hex: "#333333" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/prod_card_img_6.png",
      back: "assets/images/cat_kaos_polos.jpg",
      detail: "assets/images/keyspace/prod_card_img_6.png"
    }
  },
  {
    id: "kp-7",
    name: "Kaos Polos Anak Cotton Combed 30s Unisex",
    shortTitle: "Kaos Polos Anak Cotton Combed 30s",
    category: "kaos-polos",
    categoryName: "Kaos Polos",
    price: 29000,
    originalPrice: 35000,
    discount: "-17%",
    soldCount: "3.240 terjual",
    isPreOrder: false,
    rating: 4.93,
    reviewsCount: 165,
    isFeatured: false,
    badge: "Kids Wear",
    description: "Kaos polos khusus anak-anak dengan serat katun ekstra halus ramah kulit anak. Tidak gatal dan tidak menyebabkan iritasi.",
    colors: [
      { name: "Red", hex: "#DC2626" },
      { name: "Yellow", hex: "#F59E0B" },
      { name: "Sky Blue", hex: "#38BDF8" }
    ],
    sizes: ["S (3-4 th)", "M (5-6 th)", "L (7-8 th)", "XL (9-10 th)"],
    images: {
      front: "assets/images/cat_kaos_polos.jpg",
      back: "assets/images/cat_kaos_polos.jpg",
      detail: "assets/images/cat_kaos_polos.jpg"
    }
  },
  {
    id: "kp-8",
    name: "Kaos Polos Lengan Panjang Combed 30s Rib Manset",
    shortTitle: "Kaos Polos Lengan Panjang Combed 30s",
    category: "kaos-polos",
    categoryName: "Kaos Polos",
    price: 49000,
    originalPrice: null,
    discount: null,
    soldCount: "5.820 terjual",
    isPreOrder: false,
    rating: 4.91,
    reviewsCount: 220,
    isFeatured: false,
    badge: "Long Sleeve",
    description: "Kaos polos lengan panjang dengan ujung lengan karet (rib) elastis nyaman. Cocok untuk seragam panitia, komunitas muslim, atau daily casual.",
    colors: [
      { name: "Black", hex: "#121212" },
      { name: "Navy", hex: "#1B2A4A" },
      { name: "White", hex: "#FFFFFF" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/cat_kaos_polos.jpg",
      back: "assets/images/cat_kaos_polos.jpg",
      detail: "assets/images/cat_kaos_polos.jpg"
    }
  },
  // 4. Hoodie & Sweater
  {
    id: "kp-9",
    name: "Hoodie Sweatshirt Cotton Fleece 330gsm Streetwear",
    shortTitle: "Hoodie Sweatshirt Cotton Fleece 330gsm",
    category: "hoodie",
    categoryName: "Hoodie & Sweater",
    price: 145000,
    originalPrice: 175000,
    discount: "-17%",
    soldCount: "4.890 terjual",
    isPreOrder: false,
    rating: 4.96,
    reviewsCount: 215,
    isFeatured: false,
    badge: "Bestseller",
    description: "Hoodie streetwear tebal berbahan katun Fleece 330gsm yang hangat dan lembut di kulit. Dilengkapi saku kanguru dan kupluk ganda.",
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Heather Grey", hex: "#A8A8A8" },
      { name: "Olive", hex: "#3B4A34" }
    ],
    sizes: ["M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/cat_hoodie.jpg",
      back: "assets/images/cat_hoodie.jpg",
      detail: "assets/images/cat_hoodie.jpg"
    }
  },
  {
    id: "kp-10",
    name: "Crewneck Sweater Basic Heavyweight Fleece 300gsm",
    shortTitle: "Crewneck Sweater Basic Heavyweight Fleece",
    category: "hoodie",
    categoryName: "Hoodie & Sweater",
    price: 125000,
    originalPrice: 145000,
    discount: "-14%",
    soldCount: "3.120 terjual",
    isPreOrder: false,
    rating: 4.92,
    reviewsCount: 145,
    isFeatured: false,
    badge: "Crewneck",
    description: "Sweater model crewneck leher bulat klasik. Bahan fleece bagian dalam berbulu lembut nyaman dipakai saat udara dingin.",
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Navy", hex: "#1B2A4A" },
      { name: "Cream", hex: "#EAE6DF" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/cat_hoodie.jpg",
      back: "assets/images/cat_hoodie.jpg",
      detail: "assets/images/cat_hoodie.jpg"
    }
  },
  // 5. Jersey
  {
    id: "kp-11",
    name: "Jersey Sports & Esports Custom Dry-Fit Milano Sublimation",
    shortTitle: "Jersey Sports & Esports Custom Dry-Fit Milano",
    category: "jersey",
    categoryName: "Jersey",
    price: 110000,
    originalPrice: 135000,
    discount: "-18%",
    soldCount: "5.430 terjual",
    isPreOrder: true,
    rating: 4.91,
    reviewsCount: 167,
    isFeatured: false,
    badge: "Sublimasi",
    description: "Jersey olahraga dan gaming berbahan Dry-Fit Milano dengan teknologi sirkulasi udara micro-mesh. Cetak full sublimation anti pudar.",
    colors: [
      { name: "Cyber Teal", hex: "#0E4D54" },
      { name: "Fire Red", hex: "#D32F2F" },
      { name: "Dark Navy", hex: "#16233B" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/cat_jersey.jpg",
      back: "assets/images/cat_jersey.jpg",
      detail: "assets/images/cat_jersey.jpg"
    }
  },
  {
    id: "kp-12",
    name: "Jersey Futsal & Sepakbola Dry-Fit Brazil Custom Nama",
    shortTitle: "Jersey Futsal & Sepakbola Dry-Fit Brazil",
    category: "jersey",
    categoryName: "Jersey",
    price: 115000,
    originalPrice: null,
    discount: null,
    soldCount: "4.120 terjual",
    isPreOrder: true,
    rating: 4.94,
    reviewsCount: 198,
    isFeatured: false,
    badge: "Full Printing",
    description: "Jersey setelan futsal bahan Dry-fit Brazil berpori tebal dan lentur. Bebas pasang logo tim, nomor punggung, dan nama pemain.",
    colors: [
      { name: "Electric Blue", hex: "#2563EB" },
      { name: "Neon Yellow", hex: "#EAB308" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/cat_jersey.jpg",
      back: "assets/images/cat_jersey.jpg",
      detail: "assets/images/cat_jersey.jpg"
    }
  },
  // 6. Kemeja
  {
    id: "kp-13",
    name: "Kemeja Kerja Oxford Short-Sleeve Custom Bordir Komputer",
    shortTitle: "Kemeja Kerja Oxford Short-Sleeve Custom Bordir",
    category: "kemeja",
    categoryName: "Kemeja",
    price: 125000,
    originalPrice: 150000,
    discount: "-16%",
    soldCount: "2.890 terjual",
    isPreOrder: true,
    rating: 4.89,
    reviewsCount: 94,
    isFeatured: false,
    badge: "Bordir",
    description: "Kemeja berbahan Oxford Cotton premium yang adem, rapi, dan mudah disetrika. Bisa disematkan bordir komputer logo kantor atau komunitas.",
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Sky Blue", hex: "#87CEEB" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/cat_circle_6.png",
      back: "assets/images/keyspace/cat_circle_6.png",
      detail: "assets/images/keyspace/cat_circle_6.png"
    }
  },
  {
    id: "kp-14",
    name: "Kemeja Lapangan PDH / PDL American Drill Premium",
    shortTitle: "Kemeja Lapangan PDH / PDL American Drill",
    category: "kemeja",
    categoryName: "Kemeja",
    price: 135000,
    originalPrice: null,
    discount: null,
    soldCount: "3.750 terjual",
    isPreOrder: true,
    rating: 4.93,
    reviewsCount: 140,
    isFeatured: false,
    badge: "PDH/PDL",
    description: "Kemeja outdoor lapangan berbahan American Drill tebal dan kuat. Dilengkapi saku ganda dada dan ventilasi udara punggung.",
    colors: [
      { name: "Khaki", hex: "#C2B280" },
      { name: "Army Green", hex: "#4B5320" },
      { name: "Navy", hex: "#1B2A4A" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/cat_circle_6.png",
      back: "assets/images/keyspace/cat_circle_6.png",
      detail: "assets/images/keyspace/cat_circle_6.png"
    }
  },
  // 7. Totebag
  {
    id: "kp-15",
    name: "Heavy Canvas Eco Totebag with Custom Print & Resleting",
    shortTitle: "Heavy Canvas Eco Totebag with Custom Print",
    category: "totebag",
    categoryName: "Totebag & Goodiebag",
    price: 35000,
    originalPrice: 45000,
    discount: "-22%",
    soldCount: "8.940 terjual",
    isPreOrder: false,
    rating: 4.93,
    reviewsCount: 240,
    isFeatured: false,
    badge: "Eco Bag",
    description: "Totebag kanvas tebal ramah lingkungan dengan penutup resleting dan saku dalam. Cocok untuk merchandise kantor, souvenir seminar, atau tas harian.",
    colors: [
      { name: "Natural White", hex: "#EAE6DF" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Navy", hex: "#1B2A4A" }
    ],
    sizes: ["Standard 35x40cm"],
    images: {
      front: "assets/images/keyspace/cat_circle_7.png",
      back: "assets/images/keyspace/cat_circle_7.png",
      detail: "assets/images/keyspace/cat_circle_7.png"
    }
  },
  {
    id: "kp-16",
    name: "Goodie Bag Spunbond Custom Sablon Souvenir Seminar",
    shortTitle: "Goodie Bag Spunbond Custom Sablon",
    category: "totebag",
    categoryName: "Totebag & Goodiebag",
    price: 12000,
    originalPrice: 15000,
    discount: "-20%",
    soldCount: "15.600 terjual",
    isPreOrder: true,
    rating: 4.88,
    reviewsCount: 310,
    isFeatured: false,
    badge: "Souvenir",
    description: "Tas spunbond murah tebal 75gsm untuk seminar kit, pameran produk, dan bingkisan event skala besar.",
    colors: [
      { name: "Royal Blue", hex: "#1D4ED8" },
      { name: "Red", hex: "#DC2626" },
      { name: "Black", hex: "#121212" }
    ],
    sizes: ["30x40cm Handle"],
    images: {
      front: "assets/images/keyspace/cat_circle_7.png",
      back: "assets/images/keyspace/cat_circle_7.png",
      detail: "assets/images/keyspace/cat_circle_7.png"
    }
  },
  // 8. Topi
  {
    id: "kp-17",
    name: "Topi Baseball Snapback Twill Custom Bordir 3D Komputer",
    shortTitle: "Topi Baseball Snapback Twill Custom Bordir 3D",
    category: "topi",
    categoryName: "Topi",
    price: 49000,
    originalPrice: 65000,
    discount: "-25%",
    soldCount: "4.510 terjual",
    isPreOrder: true,
    rating: 4.88,
    reviewsCount: 110,
    isFeatured: false,
    badge: "Bordir 3D",
    description: "Topi baseball bahan Katun Twill tebal dengan strap pengatur ukuran di belakang. Hasil bordir komputer timbul 3D presisi tinggi.",
    colors: [
      { name: "Yellow", hex: "#F59E0B" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Navy", hex: "#1B2A4A" }
    ],
    sizes: ["All Size Adjustable"],
    images: {
      front: "assets/images/keyspace/cat_circle_8.png",
      back: "assets/images/keyspace/cat_circle_8.png",
      detail: "assets/images/keyspace/cat_circle_8.png"
    }
  },
  {
    id: "kp-18",
    name: "Topi Trucker Jaring Custom Sablon DTF & Polyflex",
    shortTitle: "Topi Trucker Jaring Custom Sablon",
    category: "topi",
    categoryName: "Topi",
    price: 35000,
    originalPrice: null,
    discount: null,
    soldCount: "6.200 terjual",
    isPreOrder: false,
    rating: 4.90,
    reviewsCount: 185,
    isFeatured: false,
    badge: "Trucker Hat",
    description: "Topi jaring trucker adem dengan busa depan empuk dan sablon sablon grafis tajam.",
    colors: [
      { name: "Black White", hex: "#121212" },
      { name: "Full Black", hex: "#000000" }
    ],
    sizes: ["All Size Adjustable"],
    images: {
      front: "assets/images/keyspace/cat_circle_8.png",
      back: "assets/images/keyspace/cat_circle_8.png",
      detail: "assets/images/keyspace/cat_circle_8.png"
    }
  },
  // 9. Kaos Band
  {
    id: "kp-19",
    name: "Kaos Band Rock Vintage Bootleg Heavy Cotton 24s",
    shortTitle: "Kaos Band Rock Vintage Bootleg Heavy Cotton 24s",
    category: "kaos-band",
    categoryName: "Kaos Band",
    price: 85000,
    originalPrice: 105000,
    discount: "-19%",
    soldCount: "5.190 terjual",
    isPreOrder: false,
    rating: 4.97,
    reviewsCount: 318,
    isFeatured: false,
    badge: "Vintage",
    description: "Kaos band gaya vintage retro dengan efek washed dan sablon plastisol discharge bertekstur lembut tanpa efek kaku.",
    colors: [
      { name: "Washed Black", hex: "#222222" },
      { name: "Dark Charcoal", hex: "#333333" }
    ],
    sizes: ["M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/cat_circle_9.png",
      back: "assets/images/keyspace/cat_circle_9.png",
      detail: "assets/images/keyspace/cat_circle_9.png"
    }
  },
  {
    id: "kp-20",
    name: "Kaos Band Heavy Metal Acid Wash Oversized 20s",
    shortTitle: "Kaos Band Heavy Metal Acid Wash Oversized",
    category: "kaos-band",
    categoryName: "Kaos Band",
    price: 95000,
    originalPrice: 120000,
    discount: "-21%",
    soldCount: "2.840 terjual",
    isPreOrder: false,
    rating: 4.95,
    reviewsCount: 156,
    isFeatured: false,
    badge: "Acid Wash",
    description: "Kaos band potongan oversize dengan bahan katun 20s tebal dan efek acid wash autentik bergaya 90-an.",
    colors: [
      { name: "Acid Black", hex: "#181818" }
    ],
    sizes: ["M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/cat_circle_9.png",
      back: "assets/images/keyspace/cat_circle_9.png",
      detail: "assets/images/keyspace/cat_circle_9.png"
    }
  },
  // 10. Kaos Grafis
  {
    id: "kp-21",
    name: "Kaos Grafis Typography Streetwear Oversize 24s",
    shortTitle: "Kaos Grafis Typography Streetwear Oversize 24s",
    category: "kaos-grafis",
    categoryName: "Kaos Grafis",
    price: 79000,
    originalPrice: 95000,
    discount: "-17%",
    soldCount: "6.830 terjual",
    isPreOrder: false,
    rating: 4.93,
    reviewsCount: 184,
    isFeatured: false,
    badge: "Graphic Art",
    description: "Kaos ilustrasi dan tipografi streetwear kekinian. Potongan oversized fit dengan bahan Cotton Combed 24s mantap dan tidak terawang.",
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "White", hex: "#FFFFFF" }
    ],
    sizes: ["M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/cat_circle_10.png",
      back: "assets/images/keyspace/cat_circle_10.png",
      detail: "assets/images/keyspace/cat_circle_10.png"
    }
  },
  {
    id: "kp-22",
    name: "Kaos Grafis Japanese Ukiyo-e Cyberpunk Modern Art",
    shortTitle: "Kaos Grafis Japanese Ukiyo-e Cyberpunk",
    category: "kaos-grafis",
    categoryName: "Kaos Grafis",
    price: 82000,
    originalPrice: 99000,
    discount: "-17%",
    soldCount: "4.410 terjual",
    isPreOrder: false,
    rating: 4.96,
    reviewsCount: 210,
    isFeatured: false,
    badge: "Cyberpunk",
    description: "Kombinasi seni tradisional Jepang dan nuansa cyberpunk modern futuristik. Cetak full detail sablon DTF.",
    colors: [
      { name: "Black", hex: "#121212" },
      { name: "White", hex: "#FFFFFF" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/cat_circle_10.png",
      back: "assets/images/keyspace/cat_circle_10.png",
      detail: "assets/images/keyspace/cat_circle_10.png"
    }
  },
  {
    id: "kp-23",
    name: "Kaos Grafis Minimalist Geometry Nature Line Art",
    shortTitle: "Kaos Grafis Minimalist Geometry Nature Line Art",
    category: "kaos-grafis",
    categoryName: "Kaos Grafis",
    price: 72000,
    originalPrice: 85000,
    discount: "-15%",
    soldCount: "3.670 terjual",
    isPreOrder: false,
    rating: 4.91,
    reviewsCount: 130,
    isFeatured: false,
    badge: "Minimalist",
    description: "Kaos grafis bertema alam dan garis geometris minimalis elegan. Cocok untuk penampilan santai bergaya Scandinavian clean look.",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Sage", hex: "#9CAF88" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      front: "assets/images/keyspace/cat_circle_10.png",
      back: "assets/images/keyspace/cat_circle_10.png",
      detail: "assets/images/keyspace/cat_circle_10.png"
    }
  }
];

/**
 * 10 Category Items
 */
const CATEGORIES_DATA = [
  { id: "kaos-custom", name: "Kaos Custom", icon: "assets/images/keyspace/cat_circle_1.png", count: "18 Produk" },
  { id: "kaos-polos", name: "Kaos Polos", icon: "assets/images/keyspace/cat_circle_2.png", count: "24 Warna" },
  { id: "polo-shirt", name: 'Kaos Polo "Poloshirt"', icon: "assets/images/keyspace/cat_circle_3.png", count: "12 Model" },
  { id: "hoodie", name: "Hoodie & Sweater", icon: "assets/images/keyspace/cat_circle_4.png", count: "14 Model" },
  { id: "jersey", name: "Jersey", icon: "assets/images/keyspace/cat_circle_5.png", count: "16 Model" },
  { id: "kemeja", name: "Kemeja", icon: "assets/images/keyspace/cat_circle_6.png", count: "8 Model" },
  { id: "totebag", name: "Totebag & Goodiebag", icon: "assets/images/keyspace/cat_circle_7.png", count: "10 Model" },
  { id: "topi", name: "Topi", icon: "assets/images/keyspace/cat_circle_8.png", count: "15 Model" },
  { id: "kaos-band", name: "Kaos Band", icon: "assets/images/keyspace/cat_circle_9.png", count: "20 Desain" },
  { id: "kaos-grafis", name: "Kaos Grafis", icon: "assets/images/keyspace/cat_circle_10.png", count: "25 Desain" }
];

/**
 * Hero Banner Slides Data
 */
const HERO_SLIDES_DATA = [
  {
    id: "slide-1",
    image: "assets/images/keyspace/slide_streetwear.jpg",
    alt: "Koleksi Kaos Polos Keyspace.id - Soft Tee Kaos Polos Combed 30s",
    tag: "KOLEKSI KAOS POLOS KEYSPACE.ID",
    title: "SOFT TEE KAOS POLOS COMBED 30S",
    subtitle: "KEEP IT SIMPLE. MINIMALIST. MAXIMALIST."
  },
  {
    id: "slide-2",
    image: "assets/images/keyspace/slide_custom_dtf.jpg",
    alt: "Custom Sablon DTF High Resolution Keyspace.id",
    tag: "DIRECT-TO-FILM HIGH RESOLUTION",
    title: "CUSTOM SABLON DTF PREMIUM",
    subtitle: "WARNA TAJAM - DETAIL MAKSIMAL - BISA SATUAN & LUSINAN"
  },
  {
    id: "slide-3",
    image: "assets/images/keyspace/slide_polo_corporate.jpg",
    alt: "Polo Shirt & Seragam Kantor Keyspace.id",
    tag: "SERAGAM KANTOR & GATHERING RESMI",
    title: "POLO SHIRT LACOSTE PIQUE BORDIR",
    subtitle: "BAHAN DINGIN BERPORI - BORDIR TIMBUL PRESISI TINGGI"
  }
];

/**
 * Portfolio Items
 */
const PORTFOLIO_DATA = [
  {
    id: "port-1",
    tag: "CORPORATE",
    title: "Kaos Merchandise Edma",
    image: "assets/images/keyspace/port_card_img_1.png",
    client: "PT EDMA Electronics",
    specs: "Cotton Combed 30s Mustard Yellow + Sablon DTF High-Density Front & Back",
    qty: "350 Pcs"
  },
  {
    id: "port-2",
    tag: "KOMUNITAS",
    title: "Kaos Event Natal Kalteng",
    image: "assets/images/keyspace/port_card_img_2.png",
    client: "Panitia Event Natal Kalteng 2026",
    specs: "Cotton Combed 24s Pine Green + Sablon DTF Multi-Color Full Front",
    qty: "800 Pcs"
  },
  {
    id: "port-3",
    tag: "CORPORATE",
    title: "Kaos F&N Magniva",
    image: "assets/images/keyspace/port_card_img_3.png",
    client: "F&N Magniva Corporate",
    specs: "Cotton Combed 30s Pure White + Sablon Logo Dada & Punggung",
    qty: "500 Pcs"
  },
  {
    id: "port-4",
    tag: "CORPORATE",
    title: "Kaos Merchandise Livin By Mandiri",
    image: "assets/images/keyspace/port_card_img_4.png",
    client: "Bank Mandiri (Livin' App)",
    specs: "Cotton Combed 30s Baby Blue + Sablon Logo Livin By Mandiri",
    qty: "1.200 Pcs"
  },
  {
    id: "port-5",
    tag: "EVENT",
    title: "Jaket Kontingen PORNAS Korpri",
    image: "assets/images/keyspace/port_card_img_5.png",
    client: "Kontingen Atlet PORNAS Korpri",
    specs: "Jaket Parasut Micro Sublimasi Motif Ombak Api Merah Putih",
    qty: "250 Pcs"
  },
  {
    id: "port-6",
    tag: "CORPORATE",
    title: "Kaos Gathering PT. Tata Logam",
    image: "assets/images/keyspace/port_card_img_6.png",
    client: "PT Tata Logam Lestari",
    specs: "Cotton Combed 24s Magenta Pink + Sablon Discharge Gathering Nasional",
    qty: "600 Pcs"
  }
];

/**
 * Client Logos
 */
const CLIENTS_DATA = [
  { name: "Masako", logo: "assets/images/keyspace/client_masako.png" },
  { name: "PROTY Snack Protein", logo: "assets/images/keyspace/client_proty.png" },
  { name: "skyconnection", logo: "assets/images/keyspace/client_skyconnection.png" },
  { name: "KWIK KLIN", logo: "assets/images/keyspace/client_kwikklin.png" },
  { name: "APEKSI WJDA", logo: "assets/images/keyspace/client_apeksi.png" },
  { name: "F&N Magniva", logo: "assets/images/keyspace/client_magniva.png" },
  { name: "EDMA Electronics", logo: "assets/images/keyspace/client_edma.png" }
];

/**
 * Value Proposition Pillars
 */
const PILLARS_DATA = [
  {
    tag: "MOQ",
    title: "Free Desain",
    desc: "Konsultasi dan bantuan desain gratis untuk order massal.",
    icon: "pen"
  },
  {
    tag: null,
    title: "Harga Terbaik",
    desc: "Harga langsung dari konveksi, tanpa perantara.",
    icon: "money"
  },
  {
    tag: null,
    title: "Garansi Reject",
    desc: "Produk cacat atau tidak sesuai kami tanggung penuh.",
    icon: "shield"
  },
  {
    tag: "TERSEDIA",
    title: "Produksi Express",
    desc: "Layanan express tersedia. Kirim ke seluruh Indonesia.",
    icon: "bolt"
  }
];

/**
 * Testimonials Data
 */
const TESTIMONIALS_DATA = [
  {
    name: "Ardiansyah Pratama",
    company: "PT EDMA Electronics",
    role: "HR & General Affairs",
    rating: 5,
    date: "1 minggu lalu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    text: "Pesan 350 pcs kaos event untuk Edma di Keyspace, hasilnya sangat memuaskan! Bahan combed 30s adem, warna sablon persis pantone logo perusahaan kami. Pengerjaan cepat & tepat waktu."
  },
  {
    name: "Siska Wardani",
    company: "Panitia Event Livin'",
    role: "Event Coordinator",
    rating: 5,
    date: "2 minggu lalu",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
    text: "Sudah order kedua kalinya di Keyspace. Respon CS via WhatsApp super cepat, mock-up preview sangat membantu approval pimpinan, dan jahitannya kuat rapi."
  },
  {
    name: "Bambang Triyono",
    company: "KORPRI Daerah",
    role: "Official Atlet",
    rating: 5,
    date: "3 minggu lalu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    text: "Jaket kontingen PORNAS pesanan kami dipuji oleh kontingen provinsi lain. Sublimasinya tajam cerah, bahannya ringan dan anti gerah. Sukses terus Keyspace!"
  }
];

/**
 * Articles
 */
const ARTICLES_DATA = [
  {
    id: "art-1",
    title: "Perbedaan Karakteristik Cotton Combed 20s, 24s, dan 30s",
    excerpt: "Kenali perbedaan ketebalan, gramasi benang, serta penggunaan yang ideal antara kaos combed 20s, 24s, dan 30s.",
    date: "04 Okt 2026",
    category: "Panduan Bahan",
    image: "assets/images/cat_kaos_polos.jpg"
  },
  {
    id: "art-2",
    title: "Panduan Memilih Sablon: DTF vs Plastisol vs Bordir Komputer",
    excerpt: "Kelebihan dan kekurangan teknologi sablon modern DTF (Direct To Film) dibanding sablon plastisol manual dan bordir.",
    date: "28 Sep 2026",
    category: "Teknologi Sablon",
    image: "assets/images/cat_kaos_custom.jpg"
  },
  {
    id: "art-3",
    title: "5 Tips Mencuci dan Merawat Kaos Sablon Agar Tidak Mudah Retak",
    excerpt: "Cara merawat kaos sablon favorit Anda agar awet, warna tetap cemerlang, dan tidak rusak saat disetrika.",
    date: "15 Sep 2026",
    category: "Tips Perawatan",
    image: "assets/images/cat_polo_shirt.jpg"
  }
];

/**
 * Initial Orders for Tracking
 */
const INITIAL_ORDERS = [
  {
    orderId: "KEY-20261005-081",
    date: "05 Okt 2026",
    status: "Dikirim",
    statusClass: "badge-shipping",
    courier: "J&T Express (Resi: JT983716254)",
    totalAmount: 135000,
    items: [
      {
        id: "kp-1",
        name: "Sablon Kaos Custom Combed 30s",
        image: "assets/images/keyspace/prod_card_img_1.png",
        color: "Black",
        size: "L",
        qty: 1,
        price: 60000
      },
      {
        id: "kp-2",
        name: "Sablon Kaos Custom Combed 24s",
        image: "assets/images/keyspace/prod_card_img_2.png",
        color: "White",
        size: "XL",
        qty: 1,
        price: 75000
      }
    ]
  },
  {
    orderId: "KEY-20260928-044",
    date: "28 Sep 2026",
    status: "Selesai",
    statusClass: "badge-success",
    courier: "SiCepat REG (Resi: 00412895712)",
    totalAmount: 98000,
    items: [
      {
        id: "kp-3",
        name: "Custom Poloshirt Lacoste Pique CVC Premium",
        image: "assets/images/keyspace/prod_card_img_3.png",
        color: "Navy Blue",
        size: "L",
        qty: 1,
        price: 98000
      }
    ]
  }
];

/**
 * Format currency helper (IDR)
 */
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
}

/**
 * Fallback image renderer (SVG Data URI) to eliminate broken images
 */
function handleImageError(imgElement, fallbackTitle = "Keyspace Product") {
  if (imgElement.dataset.failed) return;
  imgElement.dataset.failed = "true";
  
  const width = imgElement.width || 400;
  const height = imgElement.height || 400;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" fill="#f8fafc"/>
    <path d="M140 120 C 140 100, 260 100, 260 120 L 320 160 L 290 200 L 260 180 L 260 320 L 140 320 L 140 180 L 110 200 L 80 160 Z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="3"/>
    <text x="50%" y="82%" text-anchor="middle" fill="#f59e0b" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="700">${fallbackTitle}</text>
    <text x="50%" y="88%" text-anchor="middle" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="13">Keyspace Apparel Studio</text>
  </svg>`;
  
  imgElement.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
