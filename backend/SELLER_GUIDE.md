# Dokumentasi Fitur Seller - UPTOU

Dokumen ini berisi panduan teknis lengkap mengenai fitur Seller di platform UPTOU. Panduan ini mencakup alur autentikasi, manajemen toko, produk, hingga pemrosesan pesanan.

## 1. Pendahuluan

Sistem Seller di UPTOU memungkinkan pengguna terdaftar (Buyer) untuk meningkatkan akun mereka menjadi Seller dengan membuka Toko. Setelah memiliki toko, pengguna dapat mengelola produk dan pesanan mereka sendiri.

---

## 2. Autentikasi & Onboarding Toko

Sebelum dapat mengakses fitur seller, pengguna harus login dan mendaftarkan toko.

### A. Cek Status Toko
Digunakan untuk mengecek apakah user yang sedang login sudah memiliki toko atau belum.

*   **Endpoint:** `GET /api/auth/store/check`
*   **Header:** `Authorization: Bearer {token}`
*   **Response:**
    *   `has_store: true` -> User sudah punya toko.
    *   `has_store: false` -> User belum punya toko, arahkan ke form pembuatan toko.

### B. Registrasi Toko (Create Store)
Endpoint ini mengubah user biasa menjadi seller.

*   **Endpoint:** `POST /api/auth/store/create`
*   **Header:** `Authorization: Bearer {token}`
*   **Payload (JSON):**
    | Field | Tipe | Wajib | Keterangan |
    | :--- | :--- | :--- | :--- |
    | `store_name` | String | Ya | Nama toko yang akan ditampilkan. |
    | `store_description` | String | Tidak | Deskripsi singkat tentang toko. |
    | `bank_name` | String | Ya | Nama bank untuk pencairan dana (misal: BCA, Mandiri). |
    | `bank_account_number` | String | Ya | Nomor rekening bank. |
    | `bank_account_holder` | String | Ya | Nama pemilik rekening (harus sesuai buku tabungan). |
    | `city` | String | Tidak | Kota lokasi pengiriman (Default: Jakarta). |

*   **Contoh Request:**
    ```json
    {
        "store_name": "Fashion Store Jakarta",
        "store_description": "Menjual pakaian terkini",
        "bank_name": "BCA",
        "bank_account_number": "1234567890",
        "bank_account_holder": "Budi Santoso",
        "city": "Jakarta Selatan"
    }
    ```

---

## 3. Manajemen Produk (Product Management)

Seller memiliki kontrol penuh atas produk yang mereka jual.

### A. Tambah Produk Baru
*   **Endpoint:** `POST /api/seller/products`
*   **Header:** `Authorization: Bearer {token}`
*   **Payload (JSON):**

    **1. Informasi Dasar**
    | Field | Tipe | Wajib | Validasi/Keterangan |
    | :--- | :--- | :--- | :--- |
    | `name` | String | **Ya** | Maksimal 255 karakter. |
    | `description` | String | Tidak | Penjelasan detail produk (bisa HTML atau text). |
    | `category_id` | Integer | Tidak | ID dari kategori produk yang valid. |

    **2. Harga & Stok**
    | Field | Tipe | Wajib | Validasi/Keterangan |
    | :--- | :--- | :--- | :--- |
    | `price` | Number | **Ya** | Harga jual normal. Minimal 0. |
    | `discount_price` | Number | Tidak | Harga coret. Jika diisi, ini yang akan dibayar buyer. |
    | `stock_quantity` | Integer | **Ya** | Jumlah stok tersedia. Minimal 0. |

    **3. Detail Fisik & SKU**
    | Field | Tipe | Wajib | Validasi/Keterangan |
    | :--- | :--- | :--- | :--- |
    | `condition` | String | Tidak | Pilihan: `new` (default), `used`, `refurbished`. |
    | `weight` | Number | Tidak | Berat produk dalam gram/kg. |
    | `dimensions` | String | Tidak | Format bebas, misal "10x10x5 cm". |
    | `sku` | String | Tidak | Stock Keeping Unit (Kode unik internal toko). |

    **4. Gambar & Status**
    | Field | Tipe | Wajib | Validasi/Keterangan |
    | :--- | :--- | :--- | :--- |
    | `images` | Array | Tidak | Array berisi URL gambar (String). Gambar index ke-0 jadi cover. |
    | `status` | String | Tidak | `draft` (disimpan saja) atau `active` (tayang). |
    | `specifications` | Object | Tidak | Key-value pair untuk spek teknis. |

*   **Contoh Request Lengkap:**
    ```json
    {
        "name": "Kemeja Flannel Merah",
        "description": "Kemeja bahan katun nyaman dipakai.",
        "price": 150000,
        "stock_quantity": 50,
        "condition": "new",
        "sku": "KMJ-FL-001",
        "images": [
            "https://example.com/img1.jpg",
            "https://example.com/img2.jpg"
        ],
        "status": "active"
    }
    ```

### B. List Produk Seller
Melihat daftar produk milik seller yang sedang login.
*   **Endpoint:** `GET /api/seller/products`
*   **Parameter (Query):**
    *   `limit`: Jumlah data per halaman (default 20).
    *   `offset`: Mulai dari data ke berapa (default 0).
    *   `status`: Filter status (`active`, `draft`, dll).

### C. Update Produk
*   **Endpoint:** `PUT /api/seller/products/{id}`
*   **Payload:** Sama dengan Create Product, tapi semua field bersifat opsional (hanya kirim yang mau diubah).

### D. Hapus Produk
*   **Endpoint:** `DELETE /api/seller/products/{id}`
*   **Keterangan:** Menghapus produk secara permanen (Soft delete belum diterapkan di level API ini).

---

## 4. Manajemen Pesanan (Order Management)

Seller bertanggung jawab memproses pesanan yang masuk.

### A. Daftar Pesanan Masuk
*   **Endpoint:** `GET /api/seller/orders`
*   **Header:** `Authorization: Bearer {token}`
*   **Response:**
    *   Mengembalikan list pesanan yang masuk ke toko seller.
    *   Termasuk detail pembeli (`user`) dan item yang dibeli (`items`).

### B. Update Status Pesanan
Seller harus mengupdate status agar pembeli tahu progress pesanan.

*   **Endpoint:** `PUT /api/seller/orders/{id}/status`
*   **Payload:**
    ```json
    {
        "status": "processing"
    }
    ```
*   **Alur Status yang Disarankan:**
    1.  `pending` -> Default saat order baru masuk.
    2.  `processing` -> Seller mulai memproses/packing barang.
    3.  `shipped` -> Barang sudah diserahkan ke kurir/ekspedisi.
    4.  `delivered` -> Barang diterima pembeli (biasanya update otomatis dari sistem resi atau manual jika kurir internal).
    5.  `completed` -> Transaksi selesai, dana diteruskan ke seller.
    6.  `cancelled` -> Jika stok habis atau seller menolak pesanan.

---

## 5. Profil Toko (Store Profile)

### A. Lihat Profil Toko
*   **Endpoint:** `GET /api/seller/store`
*   **Response:** Mengembalikan detail lengkap toko (Rating, Total Penjualan, Info Bank, dll).

### B. Update Profil Toko
*   **Endpoint:** `PUT /api/seller/store`
*   **Payload:**
    *   Bisa mengupdate: `store_name`, `description`, `logo_url`, `banner_url`, `is_open` (buka/tutup toko), `opening_hours`.

---

## 6. Catatan Teknis Tambahan

### Validasi Stok
*   Saat Buyer melakukan checkout (`POST /api/orders/checkout`), sistem otomatis mengecek `stock_quantity`.
*   Jika stok cukup, stok akan **dikurangi otomatis**.
*   Jika stok kurang, checkout akan gagal dengan pesan error.

### Upload Gambar
*   Untuk produk dan logo toko, gunakan endpoint upload terpisah sebelum mengirim data produk.
*   **Endpoint:** `POST /api/upload/single-image` atau `POST /api/upload/product-images`.
*   Hasil URL dari upload tersebut yang dikirimkan ke payload `create product`.
