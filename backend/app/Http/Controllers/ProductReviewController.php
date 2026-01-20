<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductReviewController extends Controller
{
    public function index($productId)
    {
        $product = Product::findOrFail($productId);

        $reviews = ProductReview::with('user')
            ->where('product_id', $product->id)
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'product_id' => $product->id,
                'reviews' => $reviews,
            ],
        ]);
    }

    public function store(Request $request, $productId)
    {
        $user = $request->user();
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'media_urls' => 'nullable|array',
            'media_urls.*' => 'string',
            'is_anonymous' => 'boolean',
        ]);

        $hasBought = Order::where('user_id', $user->id)
            ->whereHas('items', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->whereIn('status', ['paid', 'processing', 'shipped', 'delivered', 'completed'])
            ->exists();

        if (!$hasBought) {
            return response()->json([
                'error' => true,
                'message' => 'Anda hanya bisa review produk yang pernah dibeli',
            ], 403);
        }

        return DB::transaction(function () use ($validated, $user, $product) {
            $review = ProductReview::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                ],
                [
                    'rating' => $validated['rating'],
                    'comment' => $validated['comment'] ?? null,
                    'media_urls' => $validated['media_urls'] ?? [],
                    'is_anonymous' => $validated['is_anonymous'] ?? false,
                    'status' => 'published',
                ]
            );

            $summary = ProductReview::where('product_id', $product->id)
                ->where('status', 'published')
                ->selectRaw('count(*) as review_count, avg(rating) as average_rating')
                ->first();

            $product->review_count = (int) ($summary->review_count ?? 0);
            $product->rating = (float) ($summary->average_rating ?? 0);
            $product->save();

            if ($product->store) {
                $storeSummary = Product::where('store_id', $product->store_id)
                    ->whereNotNull('rating')
                    ->where('review_count', '>', 0)
                    ->selectRaw('sum(review_count) as total_reviews, avg(rating) as average_rating')
                    ->first();

                $product->store->total_reviews = (int) ($storeSummary->total_reviews ?? 0);
                $product->store->average_rating = (float) ($storeSummary->average_rating ?? 0);
                $product->store->save();
            }

            return response()->json([
                'error' => false,
                'message' => 'Review tersimpan',
                'data' => $review,
            ], 201);
        });
    }
}

