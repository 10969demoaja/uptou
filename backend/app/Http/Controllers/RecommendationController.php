<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\UserProductActivity;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $productIds = UserProductActivity::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->pluck('product_id')
            ->unique()
            ->values()
            ->all();

        if (empty($productIds)) {
            $products = Product::with('store')
                ->where('status', 'active')
                ->orderByDesc('rating')
                ->limit(20)
                ->get();
        } else {
            $products = Product::with('store')
                ->where('status', 'active')
                ->whereIn('id', $productIds)
                ->orderByDesc('rating')
                ->limit(20)
                ->get();
        }

        $transformed = $products->map(function ($product) {
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
        });

        return response()->json([
            'data' => [
                'products' => $transformed,
            ],
        ]);
    }
}

