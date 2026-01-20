<?php

namespace App\Http\Controllers;

use App\Models\FavoriteStore;
use App\Models\Product;
use App\Models\Store;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function productIndex(Request $request)
    {
        $user = $request->user();

        $items = Wishlist::with('product.store')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $products = $items->map(function ($item) {
            $product = $item->product;

            if (!$product) {
                return null;
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'discount_price' => $product->discount_price ? (float) $product->discount_price : null,
                'rating' => (float) ($product->rating ?? 0),
                'review_count' => (int) ($product->review_count ?? 0),
                'store' => $product->store ? [
                    'name' => $product->store->store_name,
                    'location' => $product->store->city,
                ] : null,
                'main_image' => $product->images[0] ?? null,
            ];
        })->filter()->values();

        return response()->json([
            'data' => [
                'products' => $products,
            ],
        ]);
    }

    public function productStore(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $item = Wishlist::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        return response()->json([
            'error' => false,
            'message' => 'Produk disimpan ke wishlist',
            'data' => $item,
        ], 201);
    }

    public function productDestroy(Request $request, $productId)
    {
        $user = $request->user();

        Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json([
            'error' => false,
            'message' => 'Produk dihapus dari wishlist',
        ]);
    }

    public function storeIndex(Request $request)
    {
        $user = $request->user();

        $items = FavoriteStore::with('store')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $stores = $items->map(function ($item) {
            $store = $item->store;

            if (!$store) {
                return null;
            }

            return [
                'id' => $store->id,
                'store_name' => $store->store_name,
                'city' => $store->city,
                'province' => $store->province,
                'average_rating' => (float) $store->average_rating,
                'logo_url' => $store->logo_url,
            ];
        })->filter()->values();

        return response()->json([
            'data' => [
                'stores' => $stores,
            ],
        ]);
    }

    public function storeStore(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
        ]);

        $store = Store::findOrFail($validated['store_id']);

        $item = FavoriteStore::firstOrCreate([
            'user_id' => $user->id,
            'store_id' => $store->id,
        ]);

        return response()->json([
            'error' => false,
            'message' => 'Toko disimpan ke favorit',
            'data' => $item,
        ], 201);
    }

    public function storeDestroy(Request $request, $storeId)
    {
        $user = $request->user();

        FavoriteStore::where('user_id', $user->id)
            ->where('store_id', $storeId)
            ->delete();

        return response()->json([
            'error' => false,
            'message' => 'Toko dihapus dari favorit',
        ]);
    }
}

