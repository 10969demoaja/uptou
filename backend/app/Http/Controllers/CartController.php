<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\UserProductActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    // Get user's cart
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Find or create cart
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        // Load items with product and seller (user)
        $cartItems = CartItem::where('cart_id', $cart->id)
            ->with(['product.seller', 'product.store'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform to frontend format
        $formattedItems = $cartItems->map(function ($item) {
            $product = $item->product;
            if (!$product) {
                // Handle case where product might be deleted
                return null;
            }

            return [
                'id' => $item->id, // Cart Item ID
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => (float) ($product->discount_price ?? $product->price),
                'original_price' => (float) $product->price,
                'image' => $product->main_image ?? ($product->images[0] ?? null),
                'quantity' => $item->quantity,
                'selectedVariant' => $item->variant,
                'seller' => optional($product->store)->store_name ?? ($product->seller->full_name ?? 'Unknown Seller'),
                'stock' => $product->stock_quantity,
                'isSelected' => false, // Default for frontend
            ];
        })->filter()->values(); // Remove nulls

        return response()->json([
            'error' => false,
            'data' => [
                'items' => $formattedItems,
                'total_items' => $formattedItems->sum('quantity'),
                'total_price' => $formattedItems->sum(fn($item) => $item['price'] * $item['quantity'])
            ]
        ]);
    }

    // Add item to cart
    public function addToCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'variant' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => true, 'message' => $validator->errors()->first()], 400);
        }

        $user = $request->user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        $product = Product::find($request->product_id);
        
        // Check stock
        if ($product->stock_quantity < $request->quantity) {
            return response()->json(['error' => true, 'message' => 'Stok tidak mencukupi'], 400);
        }

        // Check if item already exists in cart
        $existingItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->where('variant', $request->variant)
            ->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $request->quantity;
            if ($product->stock_quantity < $newQuantity) {
                 return response()->json(['error' => true, 'message' => 'Stok tidak mencukupi untuk penambahan ini'], 400);
            }
            $existingItem->update(['quantity' => $newQuantity]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'variant' => $request->variant,
            ]);
        }

        UserProductActivity::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'type' => 'cart',
            'meta' => [
                'quantity' => $request->quantity,
            ],
        ]);

        return response()->json([
            'error' => false,
            'message' => 'Produk berhasil ditambahkan ke keranjang',
            // Return updated cart data optionally, or just success
        ]);
    }

    // Update cart item quantity
    public function updateItem(Request $request, $itemId)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => true, 'message' => $validator->errors()->first()], 400);
        }

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();
        
        if (!$cart) {
            return response()->json(['error' => true, 'message' => 'Cart not found'], 404);
        }

        $item = CartItem::where('cart_id', $cart->id)->where('id', $itemId)->first();

        if (!$item) {
            return response()->json(['error' => true, 'message' => 'Item not found in cart'], 404);
        }

        // Check stock
        $product = $item->product;
        if ($product->stock_quantity < $request->quantity) {
            return response()->json(['error' => true, 'message' => 'Stok tidak mencukupi'], 400);
        }

        $item->update(['quantity' => $request->quantity]);

        return response()->json(['error' => false, 'message' => 'Keranjang diperbarui']);
    }

    // Remove item from cart
    public function removeItem(Request $request, $itemId)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();
        
        if (!$cart) {
            return response()->json(['error' => true, 'message' => 'Cart not found'], 404);
        }

        $item = CartItem::where('cart_id', $cart->id)->where('id', $itemId)->first();

        if ($item) {
            $item->delete();
        }

        return response()->json(['error' => false, 'message' => 'Item dihapus dari keranjang']);
    }

    // Clear cart
    public function clear(Request $request)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();
        
        if ($cart) {
            CartItem::where('cart_id', $cart->id)->delete();
        }

        return response()->json(['error' => false, 'message' => 'Keranjang dikosongkan']);
    }
}
