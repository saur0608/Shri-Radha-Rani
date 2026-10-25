const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('radha_rani_session_id');
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('radha_rani_session_id', sessionId);
  }
  return sessionId;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('radha_rani_token');
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('radha_rani_token', token);
  } else {
    localStorage.removeItem('radha_rani_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const sessionId = getSessionId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...(sessionId ? { 'x-session-id': sessionId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // sends httpOnly cookies
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: any;
}

export const api = {
  // Products
  getProducts: (params?: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          query.append(key, String(value));
        }
      });
    }
    const qStr = query.toString();
    return request<ApiResponse<any[]>>(`/products${qStr ? `?${qStr}` : ''}`);
  },

  getProduct: (slugOrId: string) => {
    return request<ApiResponse<any>>(`/products/${slugOrId}`);
  },

  getCollections: () => {
    return request<ApiResponse<{ bestsellers: any[]; newArrivals: any[]; featured: any[] }>>(
      '/products/collections'
    );
  },

  getSearchSuggestions: (query: string) => {
    return request<ApiResponse<any[]>>(`/products/search/suggestions?q=${encodeURIComponent(query)}`);
  },

  // Categories
  getCategories: () => {
    return request<ApiResponse<any[]>>('/categories');
  },

  getCategory: (slug: string) => {
    return request<ApiResponse<any>>(`/categories/${slug}`);
  },

  // Cart
  getCart: () => {
    const sessionId = getSessionId();
    return request<ApiResponse<any>>(`/cart?sessionId=${sessionId}`);
  },

  addToCart: (productId: string, variantId?: string | null, quantity = 1) => {
    const sessionId = getSessionId();
    return request<ApiResponse<any>>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, variantId, quantity, sessionId }),
    });
  },

  updateCartQuantity: (itemId: string, quantity: number) => {
    const sessionId = getSessionId();
    return request<ApiResponse<any>>(`/cart/items/${itemId}?sessionId=${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeCartItem: (itemId: string) => {
    const sessionId = getSessionId();
    return request<ApiResponse<any>>(`/cart/items/${itemId}?sessionId=${sessionId}`, {
      method: 'DELETE',
    });
  },

  clearCart: () => {
    const sessionId = getSessionId();
    return request<ApiResponse<any>>(`/cart?sessionId=${sessionId}`, {
      method: 'DELETE',
    });
  },

  mergeCart: () => {
    const sessionId = getSessionId();
    return request<ApiResponse<any>>('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },

  // Coupons
  validateCoupon: (code: string, subtotal: number) => {
    return request<ApiResponse<any>>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },

  // Orders & Checkout
  getQuote: (body: { items?: any[]; couponCode?: string | null }) => {
    const sessionId = getSessionId();
    return request<ApiResponse<any>>('/orders/quote', {
      method: 'POST',
      body: JSON.stringify({ ...body, sessionId }),
    });
  },

  createOrder: (body: any) => {
    const sessionId = getSessionId();
    return request<ApiResponse<any>>('/orders', {
      method: 'POST',
      body: JSON.stringify({ ...body, sessionId }),
    });
  },

  getOrder: (idOrNumber: string) => {
    return request<ApiResponse<any>>(`/orders/${idOrNumber}`);
  },

  getUserOrders: (page = 1) => {
    return request<ApiResponse<any[]>>(`/orders/user?page=${page}`);
  },

  // Auth
  register: (body: {
    name: string;
    phone: string;
    email: string;
    password: string;
    phoneVerificationToken?: string;
    emailVerificationToken?: string;
  }) => {
    return request<ApiResponse<{ user: any; token: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  login: (body: { phoneOrEmail: string; password: string }) => {
    return request<ApiResponse<{ user: any; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  sendOtp: (body: { target: string; channel?: 'SMS' | 'EMAIL'; purpose: string }) => {
    return request<ApiResponse<{
      target: string;
      channel: 'SMS' | 'EMAIL';
      cooldownSeconds: number;
      expiresInSeconds: number;
    }>>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  verifyOtp: (body: { target: string; otp: string; purpose: string }) => {
    return request<ApiResponse<{
      verified: boolean;
      verificationToken: string;
      token?: string;
      user?: any;
    }>>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  loginWithOtp: (body: { target: string; otp: string }) => {
    return request<ApiResponse<{ user: any; token: string }>>('/auth/otp/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  resetPassword: (body: { target: string; resetToken: string; newPassword: string }) => {
    return request<ApiResponse<null>>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateProfile: (body: {
    name?: string;
    phone?: string;
    email?: string;
    phoneVerificationToken?: string;
    emailVerificationToken?: string;
  }) => {
    return request<ApiResponse<any>>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  logout: () => {
    return request<ApiResponse<null>>('/auth/logout', { method: 'POST' });
  },

  getMe: () => {
    return request<ApiResponse<any>>('/auth/me');
  },

  // Payments
  createRazorpayOrder: (orderId: string) => {
    return request<ApiResponse<any>>('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  verifyRazorpayPayment: (params: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    return request<ApiResponse<any>>('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
