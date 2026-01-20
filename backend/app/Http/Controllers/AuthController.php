<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    // Login: Request OTP
    public function requestOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'error' => true,
                'message' => 'User not found. Please register first.'
            ], 404);
        }

        // Generate OTP
        $otp = rand(100000, 999999);
        $user->otp_code = Hash::make($otp); // Store hashed OTP for security? 
        // Wait, standard practice for OTP is short lived. 
        // Frontend sends OTP back. If I hash it, I can verify with Hash::check.
        // But for development/testing ease, user wants to see it in response.
        // So I will store hashed but return plain.
        
        $user->otp_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        // In production, send email. Here, return in response.
        return response()->json([
            'error' => false,
            'message' => 'OTP sent successfully',
            'data' => [
                'otp' => (string)$otp, // For testing purposes
                'email' => $user->email
            ]
        ]);
    }

    // Login: Verify OTP
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string', // Frontend sends 'token' as the OTP code
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'error' => true,
                'message' => 'User not found'
            ], 404);
        }

        // Check expiry
        if ($user->otp_expires_at && Carbon::now()->gt($user->otp_expires_at)) {
            return response()->json([
                'error' => true,
                'message' => 'OTP has expired'
            ], 400);
        }

        // Check OTP
        if (!Hash::check($request->token, $user->otp_code)) {
             // Fallback for simple testing if hash fails or if I decide to store plain text for debugging
             // But Hash::make is better.
             // Let's support both for now if needed, but stick to Hash::check.
             return response()->json([
                'error' => true,
                'message' => 'Invalid OTP'
            ], 400);
        }

        // Clear OTP
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        // Create Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'error' => false,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user' => $user
            ]
        ]);
    }

    // Register Buyer
    public function registerBuyer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            // Check if user exists but not verified?
            // For now, simple unique check.
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ], 400);
        }

        $user = User::create([
            'email' => $request->email,
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'role' => 'buyer',
            'email_verified' => false,
        ]);

        // Generate OTP
        $otp = rand(100000, 999999);
        $user->otp_code = Hash::make($otp);
        $user->otp_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        return response()->json([
            'error' => false,
            'message' => 'Registration successful, please verify OTP',
            'data' => [
                'otp' => (string)$otp,
                'email' => $user->email
            ]
        ]);
    }

    // Verify Registration OTP
    public function verifyRegistrationOtp(Request $request)
    {
        // Same logic as verifyOtp but sets email_verified = true
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'error' => true,
                'message' => 'User not found'
            ], 404);
        }

        if ($user->otp_expires_at && Carbon::now()->gt($user->otp_expires_at)) {
            return response()->json([
                'error' => true,
                'message' => 'OTP has expired'
            ], 400);
        }

        if (!Hash::check($request->token, $user->otp_code)) {
            return response()->json([
                'error' => true,
                'message' => 'Invalid OTP'
            ], 400);
        }

        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->email_verified = true;
        $user->email_verified_at = Carbon::now();
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'error' => false,
            'message' => 'Verification successful',
            'data' => [
                'token' => $token,
                'user' => $user
            ]
        ]);
    }

    // Get Current User
    public function me(Request $request)
    {
        return response()->json([
            'error' => false,
            'data' => $request->user()
        ]);
    }

    // Check Seller Store
    public function checkSellerStore(Request $request)
    {
        $user = $request->user();
        $store = Store::where('owner_id', $user->id)->first();

        if ($store) {
            return response()->json([
                'error' => false,
                'has_store' => true,
                'data' => $store
            ]);
        } else {
            return response()->json([
                'error' => false,
                'has_store' => false,
                'message' => 'Store not found'
            ]);
        }
    }

    // Create Store
    public function createStore(Request $request)
    {
        $user = $request->user();

        // Basic validation
        $validator = Validator::make($request->all(), [
            'store_name' => 'required|string|max:255',
            'store_description' => 'nullable|string',
            'bank_name' => 'required|string',
            'bank_account_number' => 'required|string',
            'bank_account_holder' => 'required|string',
            'city' => 'nullable|string',
            // Add other fields as needed
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ], 400);
        }
        
        // Check if already has store
        if (Store::where('owner_id', $user->id)->exists()) {
             return response()->json([
                'error' => true,
                'message' => 'User already has a store'
            ], 400);
        }

        // Create store
        $store = Store::create([
            'owner_id' => $user->id,
            'store_name' => $request->store_name,
            'description' => $request->store_description,
            'bank_name' => $request->bank_name,
            'bank_account_number' => $request->bank_account_number,
            'bank_account_holder' => $request->bank_account_holder,
            'city' => $request->city ?? 'Jakarta', // Default or required
            'status' => 'active',
            'rating' => 0,
            // Add defaults
        ]);

        // Update user role
        $user->role = 'seller';
        $user->save();

        // Refresh token to reflect new role? 
        // Or just return user.
        // Frontend updates user in local storage.

        return response()->json([
            'error' => false,
            'message' => 'Store created successfully',
            'data' => [
                'store' => $store,
                'user' => $user,
                'token' => $request->bearerToken() // Return same token
            ]
        ]);
    }
}
