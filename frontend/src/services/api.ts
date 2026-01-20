// API Configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://uptou-backend-378090131288.asia-southeast2.run.app/api');

const API_BASE_SERVER =
  process.env.REACT_APP_API_SERVER ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://uptou-backend-378090131288.asia-southeast2.run.app');

// Export helper functions for consistent URL usage
export const getApiBaseUrl = () => API_BASE_URL;
export const getApiServer = () => API_BASE_SERVER;
export const buildApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
export const buildServerUrl = (path: string) => `${API_BASE_SERVER}${path}`;

// Types
export interface User {
  id: string;
  email: string;
  role: 'seller' | 'buyer';
  full_name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  sku?: string;
  images?: string[];
  main_image?: string;
  additional_images?: string[];
  specifications?: Record<string, any>;
  weight?: number;
  dimensions?: string;
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  is_featured: boolean;
  view_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  edges?: {
    category?: Category;
    seller?: User;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  variant?: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  store_id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  payment_status: string;
  payment_method: string;
  shipping_address: string;
  shipping_courier?: string;
  shipping_cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  store?: any;
  user?: User;
}

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  label: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddAddressRequest {
  recipient_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  label?: string;
  is_primary?: boolean;
}

interface CheckoutRequest {
  items: {
    product_id: string;
    quantity: number;
    variant?: string;
  }[];
  shipping_address: string;
  payment_method: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  level: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface ProductReview {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  media_urls?: string[];
  is_anonymous: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  rating: number;
  review_count: number;
  store?: {
    name: string;
    location: string;
  } | null;
  main_image?: string | null;
}

export interface FavoriteStoreItem {
  id: string;
  store_name: string;
  city: string;
  province: string;
  average_rating: number;
  logo_url?: string | null;
}

export interface UserNotificationItem {
  id: string;
  user_id: string;
  type?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  channel?: string;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecommendationProduct {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  rating: number;
  review_count: number;
  store?: {
    name: string;
    location: string;
  } | null;
  main_image?: string | null;
}

export interface RefundRequestItem {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  description?: string | null;
  status: string;
  refund_amount?: number | null;
  evidence_urls?: string[] | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisputeItem {
  id: string;
  order_id: string;
  seller_id: string;
  buyer_id: string;
  status: string;
  reason?: string | null;
  resolution?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentInfo {
  id: string;
  order_id: string;
  courier_code?: string | null;
  courier_name?: string | null;
  service_name?: string | null;
  tracking_number?: string | null;
  status?: string | null;
  last_checked_at?: string | null;
  last_status?: string | null;
  estimated_delivery_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
}

export interface InvoiceData {
  order_number: string;
  issued_at: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  store?: {
    id: string;
    name: string;
    city: string;
  } | null;
  items: {
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  total_amount: number;
  shipping_cost: number;
  grand_total: number;
  payment_status: string;
  payment_method: string;
}

interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
}

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  bio: string;
  date_of_birth?: string;
  gender: string;
  avatar_url: string;
  email_verified: boolean;
  phone_verified: boolean;
  email_verified_at?: string;
  phone_verified_at?: string;
  two_factor_enabled: boolean;
  security_settings: Record<string, any>;
  notification_preferences: Record<string, any>;
  display_preferences: Record<string, any>;
  profile_completion: number;
  created_at: string;
  updated_at: string;
}

interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  avatar_url?: string;
}

interface AddProductRequest {
  category_id: string;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  sku?: string;
  images?: string[];
  main_image?: string;
  additional_images?: string[];
  specifications?: Record<string, any>;
  weight?: number;
  dimensions?: string;
  status?: 'draft' | 'active' | 'inactive' | 'out_of_stock';
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authorization token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Get default headers for API requests
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...options.headers,
    };
    const config: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(30000),
    };

    if (endpoint.includes('/auth/store/check')) {
      console.log('🔍 API Request Debug:');
      console.log('  URL:', url);
      console.log('  Headers:', headers);
      console.log('  Method:', config.method || 'GET');
    }

    try {
      const response = await fetch(url, config);
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If response is not JSON, treating it as an error is safer for API calls
        const text = await response.text();
        console.warn('API received non-JSON response:', url, response.status, text.substring(0, 100));
        return {
          error: true,
          message: 'Respon server tidak valid (bukan JSON). Coba login ulang.',
          data: undefined
        };
      }

      if (endpoint.includes('/auth/store/check')) {
        console.log('🔍 API Response Debug:');
        console.log('  Status:', response.status);
        console.log('  Data:', data);
      }

      if (!response.ok) {
        let message =
          (data && typeof data === 'object' && typeof data.message === 'string'
            ? data.message
            : `HTTP error! status: ${response.status}`) || 'Request failed';

        if (response.status === 401) {
          message = 'Sesi Anda telah berakhir. Silakan login kembali.';
          authUtils.logout();
        }

        return {
          error: true,
          message,
          data: data && typeof data === 'object' ? (data.data as T | undefined) : undefined,
        };
      }

      if (data && typeof data === 'object' && 'error' in data) {
        return {
            error: data.error,
            message: data.message || '',
            data: data.data
        } as ApiResponse<T>;
      }

      return {
        error: false,
        message: '',
        data: data as T,
      };
    } catch (error) {
      console.error('API request failed:', error);

      let message = 'Terjadi kesalahan jaringan';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          message = 'Request timeout - Backend service may tidak merespon';
        } else {
          message = error.message;
        }
      }

      return {
        error: true,
        message,
      };
    }
  }

  // Auth Methods
  async login(email: string): Promise<ApiResponse> {
    return this.request('/auth/login/otp/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email: string, token: string): Promise<ApiResponse> {
    return this.request('/auth/login/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    });
  }

  async verifyRegistrationOTP(email: string, token: string): Promise<ApiResponse> {
    return this.request('/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    });
  }

  async register(userData: {
    email: string;
    full_name: string;
    phone?: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/register/buyer', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerSeller(userData: {
    email: string;
    full_name: string;
    phone?: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/register/seller', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async createStore(storeData: {
    store_name: string;
    store_description?: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_holder: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/store/create', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  async checkSellerStore(): Promise<ApiResponse> {
    console.log('🏪 API - checkSellerStore called');
    console.log('🏪 API - Current token:', this.getAuthToken() ? 'EXISTS' : 'NULL');
    const response = await this.request('/auth/store/check', {
      method: 'GET',
    });
    console.log('🏪 API - checkSellerStore response:', response);
    return response;
  }

  // Profile Methods
  async getProfile(): Promise<ApiResponse<ProfileData>> {
    return this.request<ProfileData>('/profile');
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<ProfileData>> {
    const payload: UpdateProfileRequest = { ...profileData };

    if (payload.date_of_birth) {
      let dob = payload.date_of_birth;

      if (dob.includes('/')) {
        const parts = dob.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } else if (dob.includes('T')) {
        dob = new Date(dob).toISOString().slice(0, 10);
      }

      payload.date_of_birth = dob;
    }

    return this.request<ProfileData>('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    // Get headers without Content-Type for FormData
    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.request<{ avatar_url: string }>('/profile/avatar', {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  // Address Methods
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return this.request<Address[]>('/addresses');
  }

  async addAddress(data: AddAddressRequest): Promise<ApiResponse<Address>> {
    return this.request<Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAddress(id: string, data: Partial<AddAddressRequest>): Promise<ApiResponse<Address>> {
    return this.request<Address>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload product images to Google Cloud Storage
  async uploadProductImages(files: File[]): Promise<ApiResponse<{ images: string[] }>> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.request<{ images: string[] }>('/upload/product-images', {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  // Upload single image to Google Cloud Storage
  async uploadSingleImage(file: File): Promise<ApiResponse<{ image_url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.request<{ image_url: string }>('/upload/single-image', {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  // Utility Methods
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  removeAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Shopping Cart Methods
  async addToCart(productId: string, quantity: number): Promise<ApiResponse> {
    return this.request('/buyer/cart', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      }),
    });
  }

  async getCart(): Promise<ApiResponse> {
    const url = `${this.baseURL}/buyer/cart`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, { headers });
      
      // Handle 403 specifically for cart - return empty cart for unauthenticated users
      if (response.status === 403) {
        console.log('Cart API: 403 detected, returning empty cart for guest user');
        return {
          error: false,
          message: 'success',
          data: { items: [] }
        };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Cart API error:', error);
      throw error;
    }
  }

  async clearCart(): Promise<ApiResponse> {
    return this.request('/buyer/cart', {
        method: 'DELETE'
    });
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<ApiResponse> {
    return this.request(`/buyer/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({
        quantity: quantity
      }),
    });
  }

  async removeFromCart(cartItemId: string): Promise<ApiResponse> {
    return this.request(`/buyer/cart/${cartItemId}`, {
      method: 'DELETE',
    });
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_SERVER}/health`);
    return response.json();
  }

  // Categories
  async getCategories(params?: {
    level?: number;
    parent_id?: string;
    limit?: number;
    offset?: number;
    include_children?: boolean;
  }): Promise<ApiResponse<{ categories: Category[] }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ categories: Category[] }>(endpoint);
  }

  async getCategoryTree(): Promise<ApiResponse<{ categories: Category[] }>> {
    return this.request<{ categories: Category[] }>('/categories/tree');
  }

  // Seller endpoints
  async addProduct(data: AddProductRequest): Promise<ApiResponse<Product>> {
    return this.request<Product>('/seller/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSellerProducts(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ products: Product[]; total: number; limit: number; offset: number }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = `/seller/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ products: Product[]; total: number; limit: number; offset: number }>(endpoint);
  }

  async getSellerDashboardStats(): Promise<ApiResponse<{
    total_products: number;
    active_products: number;
    out_of_stock_products: number;
    draft_products: number;
  }>> {
    return this.request('/seller/dashboard/stats');
  }

  async getSellerStore(): Promise<ApiResponse<any>> {
    return this.request('/seller/store');
  }

  async updateSellerStore(data: any): Promise<ApiResponse<any>> {
    return this.request('/seller/store', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<AddProductRequest>): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/seller/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/seller/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Buyer endpoints
  async getBuyerProducts(params?: {
    category_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ products: Product[]; total: number; limit: number; offset: number }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = `/buyer/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ products: Product[]; total: number; limit: number; offset: number }>(endpoint);
  }

  async getBuyerDashboard(): Promise<ApiResponse<{
    featured_products: Product[];
    latest_products: Product[];
    top_rated_products: Product[];
  }>> {
    return this.request('/buyer/dashboard');
  }

  async getProductDetails(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/buyer/products/${id}`);
  }

  async getProductReviews(productId: string): Promise<ApiResponse<{ product_id: string; reviews: ProductReview[] }>> {
    return this.request<{ product_id: string; reviews: ProductReview[] }>(`/buyer/products/${productId}/reviews`);
  }

  async submitReview(
    productId: string,
    data: {
      rating: number;
      comment?: string;
      media_urls?: string[];
      is_anonymous?: boolean;
    }
  ): Promise<ApiResponse<ProductReview>> {
    return this.request<ProductReview>(`/buyer/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWishlistProducts(): Promise<ApiResponse<{ products: WishlistProduct[] }>> {
    return this.request<{ products: WishlistProduct[] }>('/buyer/wishlist/products');
  }

  async addWishlistProduct(productId: string): Promise<ApiResponse> {
    return this.request('/buyer/wishlist/products', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  async removeWishlistProduct(productId: string): Promise<ApiResponse> {
    return this.request(`/buyer/wishlist/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async getFavoriteStores(): Promise<ApiResponse<{ stores: FavoriteStoreItem[] }>> {
    return this.request<{ stores: FavoriteStoreItem[] }>('/buyer/wishlist/stores');
  }

  async addFavoriteStore(storeId: string): Promise<ApiResponse> {
    return this.request('/buyer/wishlist/stores', {
      method: 'POST',
      body: JSON.stringify({ store_id: storeId }),
    });
  }

  async removeFavoriteStore(storeId: string): Promise<ApiResponse> {
    return this.request(`/buyer/wishlist/stores/${storeId}`, {
      method: 'DELETE',
    });
  }

  async getRecommendations(): Promise<ApiResponse<{ products: RecommendationProduct[] }>> {
    return this.request<{ products: RecommendationProduct[] }>('/buyer/recommendations');
  }

  async getNotifications(onlyUnread: boolean = false): Promise<ApiResponse<{ notifications: UserNotificationItem[] }>> {
    const query = onlyUnread ? '?unread=1' : '';
    return this.request<{ notifications: UserNotificationItem[] }>(`/notifications${query}`);
  }

  async markNotificationRead(id: string): Promise<ApiResponse<UserNotificationItem>> {
    return this.request<UserNotificationItem>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async estimateShipping(payload: {
    destination_postal_code: string;
    items: { weight?: number; quantity: number }[];
  }): Promise<ApiResponse<{ options: { courier_code: string; courier_name: string; service_name: string; cost: number; estimated_days: number }[] }>> {
    return this.request<{ options: { courier_code: string; courier_name: string; service_name: string; cost: number; estimated_days: number }[] }>('/shipping/estimate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getOrderShipment(orderId: string): Promise<ApiResponse<{ order: Order; shipment: ShipmentInfo | null }>> {
    return this.request<{ order: Order; shipment: ShipmentInfo | null }>(`/orders/${orderId}/shipment`);
  }

  async getRefunds(): Promise<ApiResponse<{ refunds: RefundRequestItem[] }>> {
    return this.request<{ refunds: RefundRequestItem[] }>('/orders/refunds');
  }

  async getRefund(id: string): Promise<ApiResponse<RefundRequestItem>> {
    return this.request<RefundRequestItem>(`/orders/refunds/${id}`);
  }

  async requestRefund(
    orderId: string,
    data: {
      reason: string;
      description?: string;
      refund_amount?: number;
      evidence_urls?: string[];
    }
  ): Promise<ApiResponse<RefundRequestItem>> {
    return this.request<RefundRequestItem>(`/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDisputes(): Promise<ApiResponse<{ disputes: DisputeItem[] }>> {
    return this.request<{ disputes: DisputeItem[] }>('/orders/disputes');
  }

  async createDispute(
    orderId: string,
    data: {
      reason: string;
      description?: string;
    }
  ): Promise<ApiResponse> {
    return this.request(`/orders/${orderId}/dispute`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvoice(orderId: string): Promise<ApiResponse<InvoiceData>> {
    return this.request<InvoiceData>(`/orders/${orderId}/invoice`);
  }

  // Order Methods
  async checkout(data: CheckoutRequest): Promise<ApiResponse<Order[]>> {
    return this.request<Order[]>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    return this.request<Order[]>('/orders');
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}`);
  }

  async getSellerOrders(): Promise<ApiResponse<Order[]>> {
    return this.request<Order[]>('/seller/orders');
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/seller/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const apiService = new ApiService();
export type { ProfileData, UpdateProfileRequest, ApiResponse, AddProductRequest };

// Auth utilities
export const authUtils = {
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },
  
  removeToken: () => {
    localStorage.removeItem('auth_token');
  },
  
  setUser: (user: User) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
  },
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  removeUser: () => {
    localStorage.removeItem('auth_user');
  },
  
  logout: () => {
    authUtils.removeToken();
    authUtils.removeUser();
  },
  
  isAuthenticated: (): boolean => {
    return !!authUtils.getToken();
  },
  
  getUserRole: (): 'seller' | 'buyer' | null => {
    const user = authUtils.getUser();
    return user?.role || null;
  }
}; 
