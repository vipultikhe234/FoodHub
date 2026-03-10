<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Product Routes
Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index']);
Route::get('/products/{id}', [\App\Http\Controllers\ProductController::class, 'show']);
Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
Route::post('/webhooks/stripe', [\App\Http\Controllers\StripeWebhookController::class, 'handle']);

// Protected Routes (Require Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [\App\Http\Controllers\AuthController::class, 'profile']);
    Route::put('/profile', [\App\Http\Controllers\AuthController::class, 'updateProfile']);
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);

    // --- Admin Only Routes ---
    Route::middleware('admin')->group(function () {
        // Category Management
        Route::post('/categories', [\App\Http\Controllers\CategoryController::class, 'store']);
        Route::put('/categories/{id}', [\App\Http\Controllers\CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [\App\Http\Controllers\CategoryController::class, 'destroy']);

        // Product Management
        Route::post('/products', [\App\Http\Controllers\ProductController::class, 'store']);
        Route::put('/products/{id}', [\App\Http\Controllers\ProductController::class, 'update']);
        Route::delete('/products/{id}', [\App\Http\Controllers\ProductController::class, 'destroy']);
        
        // Image Upload
        Route::post('/upload', [\App\Http\Controllers\UploadController::class, 'store']);
        
        // Admin Dashboard Statistics
        Route::get('/admin/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);

        // User Management
        Route::get('/users', [\App\Http\Controllers\AuthController::class, 'listUsers']);

        // Order & Payment Status Management
        Route::patch('/orders/{id}/status', [\App\Http\Controllers\OrderController::class, 'updateStatus']);
        Route::patch('/orders/{id}/payment-status', [\App\Http\Controllers\OrderController::class, 'updatePaymentStatus']);
        Route::post('/orders/{id}/initiate-payment', [\App\Http\Controllers\OrderController::class, 'initiatePayment']);
    });
    // --- End Admin Routes ---
    
    // Authenticated User Routes
    Route::post('/products/{id}/reviews', [\App\Http\Controllers\ProductController::class, 'addReview']);
    
    // Cart Routes
    // Route::post('/cart/add', [CartController::class, 'add']);
    // Route::get('/cart', [CartController::class, 'index']);
    
    // Order Routes with Rate Limiting (10 requests per minute)
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/orders', [\App\Http\Controllers\OrderController::class, 'store']);
    });
    Route::get('/orders', [\App\Http\Controllers\OrderController::class, 'index']);
    Route::get('/orders/{id}', [\App\Http\Controllers\OrderController::class, 'show']);

    // Stripe Payment Confirmation (local dev alternative to webhook)
    Route::post('/payments/confirm', [\App\Http\Controllers\StripeWebhookController::class, 'confirmPayment']);
    
    // Coupon Routes
    Route::post('/coupons/validate', [\App\Http\Controllers\CouponController::class, 'validateCoupon']);
});
