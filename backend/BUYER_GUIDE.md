# Dokumentasi Fitur Buyer - UPTOU

Dokumen ini menjelaskan alur dan API untuk sisi **Buyer** di UPTOU: mulai dari registrasi, login, pengelolaan profil, alamat, eksplorasi produk, keranjang (cart), checkout, sampai komunikasi dengan seller (chat).

---

## 1. Autentikasi Buyer (Register & Login OTP)

Semua fitur buyer yang bersifat pribadi (profile, alamat, cart, orders, chat) membutuhkan **Bearer Token** dari proses login / verifikasi OTP.

### 1.1 Register Buyer

- **Endpoint:** `POST /api/auth/register/buyer`
- **Body (JSON):**
  - `email` (string, wajib, format email, unik)
  - `full_name` (string, wajib, max 255)
  - `phone` (string, opsional, max 20)
- **Respons:**
  - Mengembalikan `otp` (untuk testing/dev) dan `email`.
  - User dibuat dengan `role = "buyer"` dan `email_verified = false`.

Contoh:

```json
{
  "email": "user@example.com",
  "full_name": "Budi Santoso",
  "phone": "08123456789"
}
```

### 1.2 Verifikasi Registrasi (Aktivasi Akun)

- **Endpoint:** `POST /api/auth/register/verify`
- **Body (JSON):**
  - `email` (string, wajib)
  - `token` (string, wajib) → kode OTP yang dikirim/diterima pada step register
- **Respons:**
  - Jika sukses: `email_verified = true`, dibuatkan token Sanctum.
  - Mengembalikan:
    - `token` (Bearer token)
    - `user` (data user yang sudah aktif)

Contoh:

```json
{
  "email": "user@example.com",
  "token": "123456"
}
```

### 1.3 Login: Request OTP

- **Endpoint:** `POST /api/auth/login/otp/request`
- **Body (JSON):**
  - `email` (string, wajib)
- **Respons:**
  - Jika user ditemukan: generate OTP baru dan kembalikan di field `data.otp` (mode dev).

```json
{
  "email": "user@example.com"
}
```

### 1.4 Login: Verify OTP

- **Endpoint:** `POST /api/auth/login/otp/verify`
- **Body (JSON):**
  - `email` (string, wajib)
  - `token` (string, wajib) → OTP
- **Respons sukses:**
  - `token` (Bearer token)
  - `user` (profil user)

Setelah login, semua request privat harus menyertakan:

```http
Authorization: Bearer {token}
```

### 1.5 Get User Aktif

- **Endpoint:** `GET /api/auth/me`
- **Header:** Bearer token
- **Respons:** Data user yang sedang login.

---

## 2. Profil Buyer (Profile)

Semua endpoint di bawah ini butuh Bearer token.

### 2.1 Lihat Profil

- **Endpoint:** `GET /api/profile`
- **Respons:** data user yang sedang login (`full_name`, `email`, dll).

### 2.2 Update Profil

- **Endpoint:** `PUT /api/profile`
- **Body (JSON):**
  - `full_name` (string, opsional, max 255)
  - `phone` (string, opsional, max 20)
  - `bio` (string, opsional)
  - `date_of_birth` (date, opsional, format `YYYY-MM-DD`)
  - `gender` (string, opsional, salah satu: `male`, `female`, `other`)

Hanya field yang dikirim yang akan diupdate.

### 2.3 Upload Avatar

- **Endpoint:** `POST /api/profile/avatar`
- **Tipe:** multipart/form-data
- **Field:**
  - `avatar` (file image, wajib, max 2 MB)
- **Respons:**
  - `avatar_url` → URL publik avatar yang bisa dipakai di frontend.

---

## 3. Alamat Pengiriman (Address Book)

Alamat digunakan saat checkout pesanan.

### 3.1 List Alamat

- **Endpoint:** `GET /api/addresses`
- **Respons:** daftar alamat milik user, diurutkan `is_primary` (utama) lalu yang lain.

### 3.2 Tambah Alamat

- **Endpoint:** `POST /api/addresses`
- **Catatan:** Maksimal **3 alamat** per user.
- **Body (JSON):**
  - `recipient_name` (string, wajib) → Nama penerima barang.
  - `phone_number` (string, wajib, max 20) → Nomor HP penerima.
  - `address_line1` (string, wajib) → Alamat detail (jalan, no, RT/RW).
  - `city` (string, wajib)
  - `province` (string, wajib)
  - `postal_code` (string, wajib)
  - `label` (string, opsional) → misal: "Rumah", "Kantor".
  - `is_primary` (boolean, opsional) → Jika `true`, alamat ini jadi utama.

Jika ini adalah alamat pertama user, sistem otomatis set `is_primary = true`.

### 3.3 Update Alamat

- **Endpoint:** `PUT /api/addresses/{id}`
- **Body (JSON):** semua field sama seperti create, tapi opsional.
  - Jika `is_primary = true`, alamat lain akan otomatis diset `is_primary = false`.

### 3.4 Hapus Alamat

- **Endpoint:** `DELETE /api/addresses/{id}`
- **Respons:** pesan sukses jika alamat milik user dan berhasil dihapus.

---

## 4. Eksplorasi Produk & Toko (Public Buyer)

Bagian ini tidak butuh login (public API).

### 4.1 List Produk Buyer

- **Endpoint:** `GET /api/buyer/products`
- **Respons:** list produk aktif, dengan data:
  - `id`, `name`, `price`, `discount_price`, `rating`, `review_count`
  - `store` → nama toko & kota
  - `main_image`, `images`

### 4.2 Detail Produk

- **Endpoint:** `GET /api/buyer/products/{id}`
- **Respons:** detail lengkap produk termasuk:
  - Info dasar: `name`, `slug`, `description`, `price`, `discount_price`, `stock_quantity`, `sku`
  - Media: `images`, `main_image`, `additional_images`
  - Spesifikasi: `specifications`, `weight`, `dimensions`
  - Status: `status`, `is_featured`, `view_count`, `rating`, `review_count`
  - Relasi `edges`:
    - `store`: info toko (nama, kota, rating, logo)
    - `category`: kategori produk
    - `seller`: info singkat penjual

### 4.3 Detail Toko

- **Endpoint:** `GET /api/buyer/stores/{id}`
- **Query optional:**
  - `limit` (default 60) → jumlah produk per halaman
  - `offset` (default 0) → index awal
- **Respons:** data toko + list produk milik toko tersebut.

---

## 5. Keranjang Belanja (Buyer Cart)

Semua endpoint berikut butuh Bearer token dan berada di prefix:  
`/api/buyer/cart`

### 5.1 Lihat Keranjang

- **Endpoint:** `GET /api/buyer/cart/`
- **Respons:**
  - `items`: array item dengan struktur:
    - `id`: ID item keranjang
    - `product_id`
    - `name`
    - `price`: harga yang dipakai (discount/harga normal)
    - `original_price`
    - `image`
    - `quantity`
    - `selectedVariant`: varian yang dipilih (jika ada)
    - `seller`: nama toko/seller
    - `stock`: stok produk saat ini
    - `isSelected`: default `false` (untuk frontend)
  - `total_items`: total quantity semua item
  - `total_price`: total harga (price * qty)

### 5.2 Tambah ke Keranjang

- **Endpoint:** `POST /api/buyer/cart/`
- **Body (JSON):**
  - `product_id` (string/uuid, wajib, harus ada di `products`)
  - `quantity` (integer, wajib, min 1)
  - `variant` (string, opsional) → contoh: warna/ukuran yang dipilih
- **Validasi tambahan:**
  - Akan dicek stok: jika stok kurang dari quantity, request ditolak.
  - Jika item dengan kombinasi `(product_id, variant)` sudah ada di cart:
    - Quantity akan ditambahkan (selama stok cukup).

Contoh:

```json
{
  "product_id": "uuid-produk",
  "quantity": 2,
  "variant": "Size L / Warna Biru"
}
```

### 5.3 Update Quantity Item

- **Endpoint:** `PUT /api/buyer/cart/{itemId}`
- **Body (JSON):**
  - `quantity` (integer, wajib, min 1)
- **Validasi:**
  - Dicek stok produk; jika kurang, ditolak dengan pesan error.

### 5.4 Hapus Satu Item

- **Endpoint:** `DELETE /api/buyer/cart/{itemId}`
- **Efek:** menghapus item tersebut dari keranjang user.

### 5.5 Kosongkan Keranjang

- **Endpoint:** `DELETE /api/buyer/cart/`
- **Efek:** menghapus semua item dari keranjang user.

---

## 6. Checkout & Riwayat Pesanan Buyer

### 6.1 Checkout (Buat Pesanan)

- **Endpoint:** `POST /api/orders/checkout`
- **Body (JSON):**
  - `items` (array, wajib, minimal 1):
    - Setiap item:
      - `product_id` (wajib, harus ada di `products`)
      - `quantity` (wajib, integer ≥ 1)
      - `variant` (opsional)
  - `shipping_address` (string, wajib)  
    → biasanya gabungan dari alamat utama buyer (bisa disusun di frontend).
  - `payment_method` (string, wajib)  
    → misal: `"cod"`, `"bank_transfer"`, `"ewallet"` (tidak diforce di backend).
  - `notes` (string, opsional) → catatan ke seller.

### 6.1.1 Perilaku Sistem Saat Checkout

- Sistem akan:
  - Validasi semua produk dan stok.
  - **Mengelompokkan items per toko (`store_id`)**.
  - Membuat **1 order per toko**:
    - `status` awal: `pending`
    - `payment_status`: `unpaid`
  - Membuat `OrderItem` untuk setiap item.
  - Mengurangi `stock_quantity` produk sesuai quantity yang dibeli.

Jika ada produk yang stoknya tidak cukup, seluruh proses dibatalkan (rollback) dan mengembalikan error.

### 6.2 List Order Buyer

- **Endpoint:** `GET /api/orders`
- **Respons:**
  - List semua pesanan milik buyer (user_id), beserta:
    - `items` (produk di dalam order)
    - `store` (toko yang memproses order)
  - Diurutkan berdasarkan `created_at` terbaru.

### 6.3 Detail Order

- **Endpoint:** `GET /api/orders/{id}`
- **Respons:**
  - Detail lengkap order, termasuk buyer (`user`), `store`, dan `items`.

---

## 7. Chat Buyer - Seller

Buyer dapat menghubungi seller untuk bertanya sebelum/ setelah membeli produk.

Prefix: `/api/chat` (butuh Bearer token).

### 7.1 List Conversations

- **Endpoint:** `GET /api/chat/conversations`
- **Respons:** daftar percakapan di mana user berperan sebagai `buyer` atau `seller`.

### 7.2 Detail Satu Conversation

- **Endpoint:** `GET /api/chat/conversations/{id}`
- **Akses:**
  - Hanya boleh diakses jika user adalah `buyer_id` atau `seller_id` pada conversation tersebut.

### 7.3 List Messages

- **Endpoint:** `GET /api/chat/conversations/{id}/messages`
- **Respons:** list pesan dalam satu conversation, diurutkan `created_at` ascending.

### 7.4 Kirim Pesan

- **Endpoint:** `POST /api/chat/conversations/{id}/messages`
- **Body (JSON):**
  - `content` (string, wajib)
- **Perilaku:**
  - `sender_type` otomatis di-set jadi `buyer` atau `seller` tergantung siapa yang mengirim.
  - `is_read` awalnya `false`.

### 7.5 Mulai Percakapan Baru

- **Endpoint:** `POST /api/chat/conversations/start`
- **Body (JSON):**
  - Minimal salah satu:
    - `store_id` (uuid, opsional)
    - `product_id` (uuid, opsional)
- **Perilaku:**
  - Jika `product_id` dikirim:
    - Backend akan cari `store_id` dari produk tersebut.
  - Tidak boleh chat dengan toko milik sendiri (dicek `store.owner_id !== user.id`).
  - Jika conversation buyer-store sudah ada → pakai yang lama.
  - Jika belum → dibuat baru dengan:
    - `buyer_id` = user sekarang
    - `seller_id` = owner toko
    - `store_id` = toko terkait

---

## 8. Ringkasan Alur Buyer dari Awal Sampai Akhir

1. **Registrasi & Aktivasi**
   - `POST /api/auth/register/buyer`
   - `POST /api/auth/register/verify`
2. **Login**
   - `POST /api/auth/login/otp/request`
   - `POST /api/auth/login/otp/verify`
3. **Set Profil & Alamat**
   - Update profile → `PUT /api/profile`
   - Kelola alamat → `/api/addresses` (GET/POST/PUT/DELETE)
4. **Eksplorasi Produk**
   - List produk → `GET /api/buyer/products`
   - Detail produk → `GET /api/buyer/products/{id}`
   - Lihat toko → `GET /api/buyer/stores/{id}`
5. **Keranjang**
   - Add to cart → `POST /api/buyer/cart/`
   - Lihat cart → `GET /api/buyer/cart/`
   - Update / hapus item → `PUT` / `DELETE /api/buyer/cart/{itemId}`
   - Kosongkan cart → `DELETE /api/buyer/cart/`
6. **Checkout & Orders**
   - Checkout → `POST /api/orders/checkout`
   - List orders → `GET /api/orders`
   - Detail order → `GET /api/orders/{id}`
7. **Chat dengan Seller**
   - Mulai chat dari produk / toko → `POST /api/chat/conversations/start`
   - Lihat percakapan & kirim pesan → endpoint pada bagian Chat di atas.

