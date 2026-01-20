<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RefundController;
use App\Http\Controllers\ShippingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\UploadController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth Routes
Route::prefix('auth')->group(function () {
    Route::post('login/otp/request', [AuthController::class, 'requestOtp']);
    Route::post('login/otp/verify', [AuthController::class, 'verifyOtp']);
    Route::post('register/buyer', [AuthController::class, 'registerBuyer']);
    Route::post('register/verify', [AuthController::class, 'verifyRegistrationOtp']);
    
    // Protected Auth Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::get('store/check', [AuthController::class, 'checkSellerStore']);
        Route::post('store/create', [AuthController::class, 'createStore']);
    });
});

// Order Routes (Protected)
Route::middleware('auth:sanctum')->group(function () {
    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);

    // Address Routes
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);

    // Buyer
    Route::post('/orders/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/orders/{id}/invoice', [InvoiceController::class, 'show']);

    // Refunds and disputes
    Route::get('/orders/refunds', [RefundController::class, 'index']);
    Route::get('/orders/refunds/{id}', [RefundController::class, 'show']);
    Route::post('/orders/{id}/refund', [RefundController::class, 'store']);
    Route::get('/orders/disputes', [RefundController::class, 'disputes']);
    Route::post('/orders/{id}/dispute', [RefundController::class, 'dispute']);

    // Shipping and tracking
    Route::post('/shipping/estimate', [ShippingController::class, 'estimate']);
    Route::get('/orders/{id}/shipment', [ShippingController::class, 'showOrderShipment']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Wishlist products
    Route::get('/buyer/wishlist/products', [WishlistController::class, 'productIndex']);
    Route::post('/buyer/wishlist/products', [WishlistController::class, 'productStore']);
    Route::delete('/buyer/wishlist/products/{productId}', [WishlistController::class, 'productDestroy']);

    // Favorite stores
    Route::get('/buyer/wishlist/stores', [WishlistController::class, 'storeIndex']);
    Route::post('/buyer/wishlist/stores', [WishlistController::class, 'storeStore']);
    Route::delete('/buyer/wishlist/stores/{storeId}', [WishlistController::class, 'storeDestroy']);

    // Recommendations
    Route::get('/buyer/recommendations', [RecommendationController::class, 'index']);

    // Seller
    Route::get('/seller/orders', [OrderController::class, 'sellerOrders']);
    Route::put('/seller/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Chat Routes
    Route::prefix('chat')->group(function () {
        Route::get('conversations', [ChatController::class, 'index']);
        Route::get('conversations/{id}', [ChatController::class, 'show']);
        Route::post('conversations/start', [ChatController::class, 'startConversation']);
        Route::get('conversations/{id}/messages', [ChatController::class, 'getMessages']);
        Route::post('conversations/{id}/messages', [ChatController::class, 'sendMessage']);
    });

    // Upload Routes
    Route::post('/upload/single-image', [UploadController::class, 'uploadImage']);
    Route::post('/upload/product-images', [UploadController::class, 'uploadImages']);

    // Seller Products Routes
    Route::prefix('seller')->group(function () {
        Route::get('/store', [StoreController::class, 'myStore']);
        Route::put('/store', [StoreController::class, 'update']);
        Route::get('/dashboard/stats', [StoreController::class, 'stats']);
        Route::get('/products', [ProductController::class, 'sellerIndex']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    });
});

// Cart Routes (Protected)
Route::middleware('auth:sanctum')->prefix('buyer/cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/', [CartController::class, 'addToCart']);
    Route::delete('/', [CartController::class, 'clear']);
    Route::put('/{itemId}', [CartController::class, 'updateItem']);
    Route::delete('/{itemId}', [CartController::class, 'removeItem']);
});

Route::get('/categories', [ProductCategoryController::class, 'index']);

Route::get('/buyer/products', [ProductController::class, 'index']);
Route::get('/buyer/products/{id}', [ProductController::class, 'show']);
Route::get('/buyer/products/{id}/reviews', [ProductReviewController::class, 'index']);
Route::post('/buyer/products/{id}/reviews', [ProductReviewController::class, 'store'])->middleware('auth:sanctum');
Route::get('/buyer/stores/{id}', [StoreController::class, 'show']);

// Payment webhook (from payment gateway)
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);
