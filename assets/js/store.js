/**
 * Keyspace Mock Store Database (State Store)
 * Manages reactive state for:
 * - Current User & Auth State (Admin, Customer, Guest)
 * - Customers List
 * - Products Inventory (CRUD, Pricing, Stock, Category)
 * - Orders & Payments (Flow, Proof upload, Tracking History, Status transitions)
 * - Articles / Knowledge Base (CRUD, Full content, comments)
 * - Notifications (Role-based alerts)
 */

(function () {
  const STORAGE_KEYS = {
    AUTH_USER: "keyspace_auth_user",
    CUSTOMERS: "keyspace_customers_db",
    PRODUCTS: "keyspace_products_db",
    ORDERS: "keyspace_orders_db",
    ARTICLES: "keyspace_articles_db",
    NOTIFICATIONS: "keyspace_notifications_db"
  };

  // Seed default customers
  const DEFAULT_CUSTOMERS = [
    {
      id: "CUST-001",
      name: "Budi Santoso",
      email: "budi.santoso@gmail.com",
      phone: "081289123456",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      role: "customer",
      password: "password123",
      address: "Jl. Margonda Raya No. 120, Beji",
      city: "Kota Depok",
      postalCode: "16424",
      status: "Aktif",
      registeredAt: "12 Jan 2026",
      notes: "Pelanggan reguler kaos custom komunitas motor Depok."
    },
    {
      id: "CUST-002",
      name: "Siti Rahmawati",
      email: "siti.rahma@gmail.com",
      phone: "085712349876",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      role: "customer",
      password: "password123",
      address: "Jl. BSD Boulevard No. 88, Pagedangan",
      city: "Tangerang Selatan",
      postalCode: "15339",
      status: "Aktif",
      registeredAt: "04 Feb 2026",
      notes: "Sering order polo shirt untuk seragam EO."
    },
    {
      id: "CUST-003",
      name: "Ardiansyah Pratama",
      email: "ardiansyah@edma.co.id",
      phone: "081399887766",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
      role: "customer",
      password: "password123",
      address: "Kawasan Industri MM2100 Blok C-4",
      city: "Kabupaten Bekasi",
      postalCode: "17530",
      status: "Aktif",
      registeredAt: "18 Feb 2026",
      notes: "PIC pengadaan seragam PT EDMA Electronics."
    },
    {
      id: "CUST-004",
      name: "Bambang Triyono",
      email: "bambang.tri@gmail.com",
      phone: "087812903456",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      role: "customer",
      password: "password123",
      address: "Jl. Gajah Mada No. 15",
      city: "Kota Semarang",
      postalCode: "50134",
      status: "Nonaktif",
      registeredAt: "01 Mar 2026",
      notes: "Akun sementara nonaktif atas permintaan pengguna."
    }
  ];

  // Seed default admin
  const DEFAULT_ADMIN = {
    id: "ADM-001",
    name: "Keyspace Admin",
    email: "admin@keyspace.id",
    phone: "085762005247",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
    role: "admin",
    password: "admin123",
    status: "Aktif"
  };

  // Seed default articles with rich content
  const DEFAULT_ARTICLES = [
    {
      id: "art-1",
      title: "Perbedaan Karakteristik Cotton Combed 20s, 24s, dan 30s",
      slug: "perbedaan-karakteristik-cotton-combed-20s-24s-30s",
      category: "Panduan Bahan",
      date: "04 Okt 2026",
      author: "Tim Produksi Keyspace",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
      image: "assets/images/cat_kaos_polos.jpg",
      excerpt: "Kenali perbedaan ketebalan, gramasi benang, serta penggunaan yang ideal antara kaos combed 20s, 24s, dan 30s untuk bisnis apparel Anda.",
      content: `
        <p>Bagi pelaku bisnis distro, event organizer, atau konsumen pakaian kasual, istilah Cotton Combed tentu sudah sangat familiar. Namun, angka di belakang kata 'combed' seperti 20s, 24s, dan 30s sering kali membingungkan.</p>
        
        <h3>1. Apa Arti Huruf 's' pada Benang Katun?</h3>
        <p>Huruf 's' mengindikasikan jenis rajutan <em>single knit</em> (rajutan tunggal). Semakin besar angka sebelum huruf 's', maka benang yang digunakan semakin halus dan tipis. Sebaliknya, semakin kecil angkanya, benang semakin tebal dan berat.</p>
        
        <h3>2. Karakteristik Combed 30s (Gramasi 140 - 150 gsm)</h3>
        <p>Combed 30s adalah primadona pasar clothing streetwear di Indonesia. Bahannya ringan, sangat adem, menyerap keringat dengan prima, dan jatuh dengan rapi saat dipakai di iklim tropis.</p>
        
        <h3>3. Karakteristik Combed 24s (Gramasi 175 - 185 gsm)</h3>
        <p>Combed 24s berada di titik keseimbangan sempurna antara kenyamanan dan ketebalan. Tidak menerawang saat mengenakan warna putih, dan memiliki struktur lebih tegak untuk potongan oversized t-shirt modern.</p>
        
        <h3>4. Karakteristik Combed 20s (Gramasi 190 - 210 gsm)</h3>
        <p>Bahan paling tebal dan kokoh di antara ketiganya. Sangat awet dan cocok untuk seragam lapangan atau sablon ukuran besar yang membutuhkan permukaan kain padat.</p>
        
        <p>Di <strong>Keyspace.id</strong>, seluruh kain katun diproduksi dari 100% serat kapas murni tanpa campuran sintetis murahan, memastikan kelembutan maksimal dan anti-bakteri alami.</p>
      `,
      status: "Published",
      views: 1240
    },
    {
      id: "art-2",
      title: "Panduan Memilih Sablon: DTF vs Plastisol vs Bordir Komputer",
      slug: "panduan-memilih-sablon-dtf-plastisol-bordir",
      category: "Teknologi Sablon",
      date: "28 Sep 2026",
      author: "Rian Hendrawan (Chief Printmaker)",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
      image: "assets/images/cat_kaos_custom.jpg",
      excerpt: "Kelebihan dan kekurangan teknologi sablon modern DTF (Direct To Film) dibanding sablon plastisol manual dan bordir komputer.",
      content: `
        <p>Memilih teknik cetak yang tepat sangat menentukan keawetan, detail desain, dan efisiensi biaya cetak apparel Anda.</p>
        
        <h3>A. Sablon DTF (Direct To Film)</h3>
        <p>Teknologi sablon digital mutakhir yang mencetak tinta pigment langsung ke film PET khusus, ditaburi hot-melt powder, lalu di-press pada kain. Keunggulannya: resolusi cetak hingga 1440 DPI, gradasi warna penuh foto, tidak ada batasan jumlah warna, dan <strong>tanpa minimum order</strong>.</p>
        
        <h3>B. Sablon Plastisol Manual</h3>
        <p>Standar sablon distro legendaris berbahan dasar minyak (oil-based). Sangat awet dan elastis, namun membutuhkan proses pembuatan afdruk film screen terpisah untuk tiap warna, sehingga membutuhkan minimum order lusinan.</p>
        
        <h3>C. Bordir Komputer Otomatis</h3>
        <p>Menggunakan rajutan benang polyester dengan mesin bordir multi-head digital. Memberikan kesan mewah, formal, dan tahan panas setrika 100%. Sangat cocok untuk polo shirt berkerah, jaket bomber, dan kemeja korporat.</p>
      `,
      status: "Published",
      views: 954
    },
    {
      id: "art-3",
      title: "5 Tips Mencuci dan Merawat Kaos Sablon Agar Tidak Mudah Retak",
      slug: "5-tips-mencuci-merawat-kaos-sablon",
      category: "Tips Perawatan",
      date: "15 Sep 2026",
      author: "Keyspace Quality Assurance",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
      image: "assets/images/cat_polo_shirt.jpg",
      excerpt: "Cara merawat kaos sablon favorit Anda agar awet bertahun-tahun, warna tetap cemerlang, dan sablon tidak mengelupas atau rusak saat disetrika.",
      content: `
        <p>Agar kaos custom kesayangan Anda tetap tampak seperti baru dibeli meski sering dicuci, berikut 5 langkah mudah yang wajib Anda terapkan:</p>
        <ol>
          <li><strong>Balik Kaos Saat Dicuci:</strong> Pastikan sisi sablon berada di bagian dalam untuk mengurangi gesekan antar kain.</li>
          <li><strong>Hindari Pemutih Klorin:</strong> Gunakan deterjen lembut tanpa pemutih keras yang dapat memudarkan pigmen warna sablon.</li>
          <li><strong>Jangan Rendam Terlalu Lama:</strong> Rendam maksimal 20-30 menit agar serat kain tidak rapuh.</li>
          <li><strong>Jemur Tanpa Terpapar Terik Langsung:</strong> Sinar UV matahari berlebih dapat mengeringkan dan memecah lapisan tinta sablon.</li>
          <li><strong>Setrika dari Sisi Belakang:</strong> Jangan pernah meletakkan pelat setrika panas langsung di atas permukaan sablon. Setrika dari bagian dalam kaos atau lapisi dengan kain tipis.</li>
        </ol>
      `,
      status: "Published",
      views: 1832
    }
  ];

  // Seed default orders
  const DEFAULT_ORDERS = [
    {
      orderId: "KEY-20261005-081",
      customerId: "CUST-001",
      customerName: "Budi Santoso",
      customerEmail: "budi.santoso@gmail.com",
      customerPhone: "081289123456",
      shippingAddress: "Jl. Margonda Raya No. 120, Beji, Kota Depok 16424",
      createdAt: "05 Okt 2026, 14:20",
      updatedAt: "06 Okt 2026, 10:15",
      status: "Pesanan Dikirim", // Alur status pesanan
      paymentStatus: "Sudah Dibayar", // "Menunggu Pembayaran", "Menunggu Konfirmasi", "Sudah Dibayar", "Pembayaran Ditolak"
      paymentMethod: "QRIS Instant / e-Wallet",
      paymentProofUrl: "assets/images/keyspace/prod_card_img_1.png",
      paymentProofDate: "05 Okt 2026, 14:35",
      shippingMethod: "J&T Express (JT983716254)",
      shippingCourier: "J&T Express",
      shippingTrackingNo: "JT983716254",
      shippingCost: 15000,
      subtotal: 135000,
      discount: 0,
      totalAmount: 150000,
      adminNotes: "Paket sudah diserahkan ke kurir J&T cabang Margonda sore tadi.",
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
      ],
      trackingTimeline: [
        { status: "Pesanan Dibuat", timestamp: "05 Okt 2026, 14:20", note: "Pesanan dibuat oleh pelanggan melalui checkout website", done: true },
        { status: "Menunggu Konfirmasi Pembayaran", timestamp: "05 Okt 2026, 14:35", note: "Bukti pembayaran QRIS telah diunggah pelanggan", done: true },
        { status: "Pembayaran Dikonfirmasi", timestamp: "05 Okt 2026, 15:00", note: "Admin telah memverifikasi pembayaran masuk rekening", done: true },
        { status: "Pesanan Diproses", timestamp: "05 Okt 2026, 16:30", note: "File sablon masuk ke antrian RIP software mesin DTF", done: true },
        { status: "Pesanan Dikemas", timestamp: "06 Okt 2026, 09:00", note: "Kaos selesai di-press, quality control, dan di-polybag rapi", done: true },
        { status: "Pesanan Dikirim", timestamp: "06 Okt 2026, 10:15", note: "No. Resi JT983716254 telah diterbitkan J&T Express", done: true },
        { status: "Dalam Perjalanan", timestamp: "06 Okt 2026, 13:00", note: "Paket tiba di Hub Sortir Jakarta Selatan", done: false },
        { status: "Pesanan Sampai", timestamp: "-", note: "Menunggu konfirmasi kurir tiba di alamat tujuan", done: false },
        { status: "Pesanan Selesai", timestamp: "-", note: "Paket diterima pelanggan dan transaksi selesai", done: false }
      ]
    },
    {
      orderId: "KEY-20261007-112",
      customerId: "CUST-002",
      customerName: "Siti Rahmawati",
      customerEmail: "siti.rahma@gmail.com",
      customerPhone: "085712349876",
      shippingAddress: "Jl. BSD Boulevard No. 88, Pagedangan, Tangerang Selatan 15339",
      createdAt: "07 Okt 2026, 09:15",
      updatedAt: "07 Okt 2026, 09:20",
      status: "Menunggu Konfirmasi Pembayaran",
      paymentStatus: "Menunggu Konfirmasi",
      paymentMethod: "Transfer Bank BCA",
      paymentProofUrl: "assets/images/keyspace/prod_card_img_3.png",
      paymentProofDate: "07 Okt 2026, 09:20",
      shippingMethod: "Paxel / JNE YES Express 1 Hari",
      shippingCourier: "Paxel",
      shippingTrackingNo: "",
      shippingCost: 25000,
      subtotal: 196000,
      discount: 19600,
      totalAmount: 201400,
      adminNotes: "Menunggu admin mengecek mutasi internet banking BCA.",
      items: [
        {
          id: "kp-3",
          name: "Custom Poloshirt Lacoste Pique CVC Premium",
          image: "assets/images/keyspace/prod_card_img_3.png",
          color: "Navy Blue",
          size: "L",
          qty: 2,
          price: 98000
        }
      ],
      trackingTimeline: [
        { status: "Pesanan Dibuat", timestamp: "07 Okt 2026, 09:15", note: "Pesanan dibuat dengan voucher KEYSPACE10 (Diskon 10%)", done: true },
        { status: "Menunggu Konfirmasi Pembayaran", timestamp: "07 Okt 2026, 09:20", note: "Bukti transfer BCA senilai Rp 201.400 diunggah pelanggan", done: true },
        { status: "Pembayaran Dikonfirmasi", timestamp: "-", note: "Admin sedang memvalidasi mutasi bank", done: false },
        { status: "Pesanan Diproses", timestamp: "-", note: "Persiapan pengerjaan bordir / sablon", done: false },
        { status: "Pesanan Dikemas", timestamp: "-", note: "Pengemasan produk", done: false },
        { status: "Pesanan Dikirim", timestamp: "-", note: "Penyerahan ke ekspedisi", done: false },
        { status: "Dalam Perjalanan", timestamp: "-", note: "Dalam pengantaran", done: false },
        { status: "Pesanan Sampai", timestamp: "-", note: "Tiba di tujuan", done: false },
        { status: "Pesanan Selesai", timestamp: "-", note: "Selesai", done: false }
      ]
    },
    {
      orderId: "KEY-20260928-044",
      customerId: "CUST-001",
      customerName: "Budi Santoso",
      customerEmail: "budi.santoso@gmail.com",
      customerPhone: "081289123456",
      shippingAddress: "Ambil di Toko (Jl. Jombang Raya No.42, Tangerang Selatan)",
      createdAt: "28 Sep 2026, 11:00",
      updatedAt: "29 Sep 2026, 16:45",
      status: "Pesanan Selesai",
      paymentStatus: "Sudah Dibayar",
      paymentMethod: "QRIS Instant / e-Wallet",
      paymentProofUrl: "assets/images/keyspace/prod_card_img_3.png",
      paymentProofDate: "28 Sep 2026, 11:05",
      shippingMethod: "Ambil di Workshop Keyspace",
      shippingCourier: "Pickup Direct",
      shippingTrackingNo: "PICKUP-DONE",
      shippingCost: 0,
      subtotal: 98000,
      discount: 0,
      totalAmount: 98000,
      adminNotes: "Pesanan telah diambil langsung oleh pelanggan di workshop.",
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
      ],
      trackingTimeline: [
        { status: "Pesanan Dibuat", timestamp: "28 Sep 2026, 11:00", note: "Pesanan dibuat", done: true },
        { status: "Menunggu Konfirmasi Pembayaran", timestamp: "28 Sep 2026, 11:05", note: "Pembayaran terverifikasi otomatis", done: true },
        { status: "Pembayaran Dikonfirmasi", timestamp: "28 Sep 2026, 11:10", note: "Admin mengonfirmasi pembayaran", done: true },
        { status: "Pesanan Diproses", timestamp: "28 Sep 2026, 13:00", note: "Produksi selesai", done: true },
        { status: "Pesanan Dikemas", timestamp: "29 Sep 2026, 10:00", note: "Pesanan siap diambil", done: true },
        { status: "Pesanan Dikirim", timestamp: "29 Sep 2026, 14:00", note: "Notifikasi pickup dikirim ke WhatsApp pelanggan", done: true },
        { status: "Dalam Perjalanan", timestamp: "29 Sep 2026, 14:00", note: "Pelanggan menuju lokasi", done: true },
        { status: "Pesanan Sampai", timestamp: "29 Sep 2026, 16:30", note: "Fitting selesai di toko", done: true },
        { status: "Pesanan Selesai", timestamp: "29 Sep 2026, 16:45", note: "Serah terima barang selesai", done: true }
      ]
    }
  ];

  // Seed default notifications
  const DEFAULT_NOTIFICATIONS = [
    {
      id: "notif-1",
      targetRole: "admin",
      title: "Pembayaran Menunggu Konfirmasi",
      message: "Pesanan #KEY-20261007-112 dari Siti Rahmawati menunggu verifikasi bukti transfer BCA Rp 201.400.",
      timestamp: "10 menit lalu",
      read: false,
      link: "orders"
    },
    {
      id: "notif-2",
      targetRole: "admin",
      title: "Pesanan Baru Masuk",
      message: "Pesanan baru #KEY-20261007-112 berhasil dibuat oleh pelanggan Siti Rahmawati.",
      timestamp: "15 menit lalu",
      read: false,
      link: "orders"
    },
    {
      id: "notif-3",
      targetRole: "customer",
      customerId: "CUST-001",
      title: "Pesanan Anda Sedang Dikirim 🚚",
      message: "Pesanan #KEY-20261005-081 telah dikirim via J&T Express dengan No. Resi JT983716254.",
      timestamp: "Kemarin",
      read: true,
      link: "riwayat"
    }
  ];

  window.AppStore = {
    // Current logged in user: null, or { role: 'admin'|'customer', ... }
    currentUser: null,

    init() {
      // Initialize Auth
      const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          this.currentUser = null;
        }
      }

      // Initialize Products
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const STORE_VERSION = "2.1";
      const savedVersion = localStorage.getItem("keyspace_store_ver");
      if (typeof PRODUCTS_DATA !== "undefined") {
        if (!savedProducts || savedVersion !== STORE_VERSION) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(PRODUCTS_DATA));
          localStorage.setItem("keyspace_store_ver", STORE_VERSION);
        } else {
          try {
            const parsed = JSON.parse(savedProducts);
            if (!Array.isArray(parsed) || parsed.length < PRODUCTS_DATA.length) {
              localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(PRODUCTS_DATA));
            }
          } catch (e) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(PRODUCTS_DATA));
          }
        }
      }

      // Initialize Customers
      if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
      }

      // Initialize Orders
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
      }

      // Initialize Articles
      if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(DEFAULT_ARTICLES));
      }

      // Initialize Notifications
      if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
      }
    },

    // =========================================================================
    // AUTH METHODS
    // =========================================================================
    getAuthUser() {
      return this.currentUser;
    },

    login(email, password, roleHint) {
      email = (email || "").trim().toLowerCase();
      password = (password || "").trim();

      // Check Admin login
      if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        this.currentUser = { ...DEFAULT_ADMIN };
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser, message: "Selamat datang kembali, Admin Keyspace!" };
      }

      // Check Customer login
      const customers = this.getCustomers();
      const customer = customers.find(c => c.email.toLowerCase() === email && c.password === password);
      
      if (customer) {
        if (customer.status === "Nonaktif") {
          return { success: false, message: "Akun Anda saat ini dinonaktifkan oleh Admin. Silakan hubungi Customer Service." };
        }
        this.currentUser = { ...customer, role: "customer" };
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser, message: `Selamat datang kembali, ${customer.name}!` };
      }

      // Allow quick demo login if entered admin/admin or customer/customer
      if (roleHint === "admin" || (email === "admin" && password === "admin")) {
        this.currentUser = { ...DEFAULT_ADMIN };
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser, message: "Login sebagai Administrator Berhasil!" };
      }

      if (roleHint === "customer" || (email === "customer" && password === "customer")) {
        const firstCust = customers[0] || DEFAULT_CUSTOMERS[0];
        this.currentUser = { ...firstCust, role: "customer" };
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser, message: `Login sebagai ${firstCust.name} Berhasil!` };
      }

      return { success: false, message: "Email atau kata sandi tidak cocok. Silakan coba lagi." };
    },

    register(name, email, phone, password, address, city) {
      email = (email || "").trim().toLowerCase();
      const customers = this.getCustomers();

      if (customers.some(c => c.email.toLowerCase() === email)) {
        return { success: false, message: "Email sudah terdaftar. Silakan gunakan email lain atau login." };
      }

      const newId = `CUST-${String(customers.length + 1).padStart(3, "0")}`;
      const newCust = {
        id: newId,
        name: name.trim(),
        email: email,
        phone: phone.trim(),
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80`,
        role: "customer",
        password: password,
        address: address || "Alamat belum diatur",
        city: city || "Jakarta",
        postalCode: "10110",
        status: "Aktif",
        registeredAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        notes: "Pelanggan baru terdaftar via website."
      };

      customers.unshift(newCust);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

      // Push notification for Admin
      this.addNotification({
        targetRole: "admin",
        title: "Pelanggan Baru Terdaftar",
        message: `${newCust.name} (${newCust.email}) baru saja mendaftarkan akun baru.`,
        link: "customers"
      });

      // Auto login as newly registered customer
      this.currentUser = { ...newCust };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.currentUser));

      return { success: true, user: this.currentUser, message: `Pendaftaran berhasil! Selamat datang, ${newCust.name}.` };
    },

    logout() {
      this.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    },

    // =========================================================================
    // CUSTOMERS (CRUD for Admin)
    // =========================================================================
    getCustomers() {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : DEFAULT_CUSTOMERS;
    },

    getCustomerById(id) {
      return this.getCustomers().find(c => c.id === id);
    },

    saveCustomer(customer) {
      const list = this.getCustomers();
      const idx = list.findIndex(c => c.id === customer.id);
      if (idx > -1) {
        list[idx] = { ...list[idx], ...customer };
      } else {
        list.unshift(customer);
      }
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
      return list;
    },

    toggleCustomerStatus(id) {
      const list = this.getCustomers();
      const target = list.find(c => c.id === id);
      if (target) {
        target.status = target.status === "Aktif" ? "Nonaktif" : "Aktif";
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
        return target;
      }
      return null;
    },

    // =========================================================================
    // PRODUCTS (CRUD for Admin)
    // =========================================================================
    getProducts() {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) {
        try { return JSON.parse(data); } catch (e) {}
      }
      return typeof PRODUCTS_DATA !== "undefined" ? PRODUCTS_DATA : [];
    },

    getProductById(id) {
      return this.getProducts().find(p => p.id === id);
    },

    saveProduct(product) {
      const list = this.getProducts();
      const idx = list.findIndex(p => p.id === product.id);
      if (idx > -1) {
        list[idx] = { ...list[idx], ...product };
      } else {
        if (!product.id) product.id = `kp-${Date.now()}`;
        list.unshift(product);
      }
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
      return list;
    },

    deleteProduct(id) {
      let list = this.getProducts();
      list = list.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
      return list;
    },

    // =========================================================================
    // ORDERS & TRACKING (Hubungan Admin & Pelanggan)
    // =========================================================================
    getOrders() {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : DEFAULT_ORDERS;
    },

    getOrderById(id) {
      return this.getOrders().find(o => o.orderId === id);
    },

    getOrdersByCustomer(customerId, customerEmail) {
      const orders = this.getOrders();
      return orders.filter(o => 
        (customerId && o.customerId === customerId) ||
        (customerEmail && o.customerEmail && o.customerEmail.toLowerCase() === customerEmail.toLowerCase())
      );
    },

    createOrder(orderData) {
      const orders = this.getOrders();
      orders.unshift(orderData);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      // Admin notification
      this.addNotification({
        targetRole: "admin",
        title: "Pesanan Baru Masuk!",
        message: `Pesanan #${orderData.orderId} senilai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(orderData.totalAmount)} diterima dari ${orderData.customerName}.`,
        link: "orders"
      });

      // Customer notification
      this.addNotification({
        targetRole: "customer",
        customerId: orderData.customerId,
        title: "Pesanan Dibuat!",
        message: `Pesanan #${orderData.orderId} telah berhasil dibuat. Silakan lakukan pembayaran.`,
        link: "riwayat"
      });

      return orderData;
    },

    updateOrderStatus(orderId, newStatus, adminNote, courierInfo, trackingNo) {
      const orders = this.getOrders();
      const order = orders.find(o => o.orderId === orderId);
      if (!order) return null;

      const nowStr = new Date().toLocaleDateString("id-ID", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
      });

      order.status = newStatus;
      order.updatedAt = nowStr;
      if (adminNote) order.adminNotes = adminNote;
      if (courierInfo) order.shippingCourier = courierInfo;
      if (trackingNo) {
        order.shippingTrackingNo = trackingNo;
        order.shippingMethod = `${courierInfo || 'Ekspedisi'} (${trackingNo})`;
      }

      // Update or append tracking timeline
      if (!order.trackingTimeline) order.trackingTimeline = [];
      const existingStep = order.trackingTimeline.find(t => t.status === newStatus);
      if (existingStep) {
        existingStep.done = true;
        existingStep.timestamp = nowStr;
        if (adminNote) existingStep.note = adminNote;
      } else {
        order.trackingTimeline.push({
          status: newStatus,
          timestamp: nowStr,
          note: adminNote || `Status pesanan diperbarui menjadi ${newStatus}`,
          done: true
        });
      }

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      // Send notification to customer
      this.addNotification({
        targetRole: "customer",
        customerId: order.customerId,
        title: `Pembaruan Pesanan #${order.orderId}`,
        message: `Status pesanan Anda kini: "${newStatus}". ${adminNote ? `Catatan: ${adminNote}` : ''}`,
        link: "riwayat"
      });

      return order;
    },

    updatePaymentStatus(orderId, newPaymentStatus, adminNote) {
      const orders = this.getOrders();
      const order = orders.find(o => o.orderId === orderId);
      if (!order) return null;

      const nowStr = new Date().toLocaleDateString("id-ID", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
      });

      order.paymentStatus = newPaymentStatus;
      order.updatedAt = nowStr;

      if (newPaymentStatus === "Sudah Dibayar") {
        order.status = "Pembayaran Dikonfirmasi";
        this.updateOrderStatus(orderId, "Pembayaran Dikonfirmasi", adminNote || "Admin memvalidasi pembayaran dan dana telah diterima.", null, null);
        
        this.addNotification({
          targetRole: "customer",
          customerId: order.customerId,
          title: "Pembayaran Dikonfirmasi! ✅",
          message: `Pembayaran pesanan #${order.orderId} telah diverifikasi oleh Admin. Pesanan Anda segera diproses konveksi.`,
          link: "riwayat"
        });
      } else if (newPaymentStatus === "Pembayaran Ditolak") {
        order.status = "Pembayaran Ditolak";
        if (adminNote) order.adminNotes = adminNote;
        
        this.addNotification({
          targetRole: "customer",
          customerId: order.customerId,
          title: "Pembayaran Ditolak ⚠️",
          message: `Pembayaran pesanan #${order.orderId} ditolak. Alasan: ${adminNote || 'Bukti transfer tidak terbaca / mutasi tidak ditemukan'}. Silakan unggah bukti yang benar.`,
          link: "riwayat"
        });
      }

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return order;
    },

    uploadPaymentProof(orderId, proofDataUrl) {
      const orders = this.getOrders();
      const order = orders.find(o => o.orderId === orderId);
      if (!order) return null;

      const nowStr = new Date().toLocaleDateString("id-ID", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
      });

      order.paymentProofUrl = proofDataUrl;
      order.paymentProofDate = nowStr;
      order.paymentStatus = "Menunggu Konfirmasi";
      order.status = "Menunggu Konfirmasi Pembayaran";
      order.updatedAt = nowStr;

      // Update timeline
      if (!order.trackingTimeline) order.trackingTimeline = [];
      const step = order.trackingTimeline.find(t => t.status === "Menunggu Konfirmasi Pembayaran");
      if (step) {
        step.done = true;
        step.timestamp = nowStr;
        step.note = "Pelanggan telah mengunggah bukti pembayaran.";
      } else {
        order.trackingTimeline.push({
          status: "Menunggu Konfirmasi Pembayaran",
          timestamp: nowStr,
          note: "Pelanggan telah mengunggah bukti pembayaran.",
          done: true
        });
      }

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      // Admin notification
      this.addNotification({
        targetRole: "admin",
        title: "Bukti Pembayaran Baru Diunggah",
        message: `Pelanggan ${order.customerName} telah mengunggah bukti pembayaran untuk #${order.orderId}. Periksa dan konfirmasi sekarang.`,
        link: "orders"
      });

      return order;
    },

    // =========================================================================
    // ARTICLES (CRUD for Admin & Interactive Read)
    // =========================================================================
    getArticles() {
      const data = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      return data ? JSON.parse(data) : DEFAULT_ARTICLES;
    },

    getArticleById(id) {
      return this.getArticles().find(a => a.id === id);
    },

    saveArticle(article) {
      const list = this.getArticles();
      const idx = list.findIndex(a => a.id === article.id);
      if (idx > -1) {
        list[idx] = { ...list[idx], ...article };
      } else {
        if (!article.id) article.id = `art-${Date.now()}`;
        list.unshift(article);
      }
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(list));
      return list;
    },

    deleteArticle(id) {
      let list = this.getArticles();
      list = list.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(list));
      return list;
    },

    // =========================================================================
    // NOTIFICATIONS
    // =========================================================================
    getNotifications(role, customerId) {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const list = data ? JSON.parse(data) : DEFAULT_NOTIFICATIONS;
      if (role === "admin") {
        return list.filter(n => n.targetRole === "admin");
      }
      if (role === "customer") {
        return list.filter(n => n.targetRole === "customer" && (!n.customerId || n.customerId === customerId));
      }
      return [];
    },

    addNotification(notif) {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const list = data ? JSON.parse(data) : DEFAULT_NOTIFICATIONS;
      notif.id = `notif-${Date.now()}-${Math.floor(Math.random() * 100)}`;
      notif.timestamp = "Baru saja";
      notif.read = false;
      list.unshift(notif);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      return notif;
    },

    markNotificationsRead(role, customerId) {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      let list = data ? JSON.parse(data) : DEFAULT_NOTIFICATIONS;
      list.forEach(n => {
        if (role === "admin" && n.targetRole === "admin") n.read = true;
        if (role === "customer" && n.targetRole === "customer" && (!n.customerId || n.customerId === customerId)) n.read = true;
      });
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
  };

  // Auto-init on script load
  window.AppStore.init();
})();
