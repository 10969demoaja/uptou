<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\UserProductActivity;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('store')->where('status', 'active');

        $search = $request->query('search');
        if (!$search) {
            $search = $request->query('q');
        }
        $minPrice = $request->query('min_price');
        $maxPrice = $request->query('max_price');
        $minRating = $request->query('min_rating');
        $city = $request->query('city');
        $promo = $request->query('promo');
        $sortBy = $request->query('sort_by');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if ($minPrice !== null) {
            $query->where('price', '>=', $minPrice);
        }

        if ($maxPrice !== null) {
            $query->where('price', '<=', $maxPrice);
        }

        if ($minRating !== null) {
            $query->where('rating', '>=', $minRating);
        }

        if ($city) {
            $query->whereHas('store', function ($q) use ($city) {
                $q->where('city', 'like', '%' . $city . '%');
            });
        }

        if ($promo === '1') {
            $query->whereNotNull('discount_price');
        }

        if ($sortBy === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($sortBy === 'price_desc') {
            $query->orderBy('price', 'desc');
        } elseif ($sortBy === 'rating') {
            $query->orderByDesc('rating');
        } elseif ($sortBy === 'popular') {
            $query->orderByDesc('view_count');
        } else {
            $query->orderByDesc('created_at');
        }

        $products = $query->get();

        $transformed = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'discount_price' => $product->discount_price ? (float) $product->discount_price : null,
                'rating' => (float) ($product->rating ?? 0),
                'review_count' => (int) ($product->review_count ?? 0),
                'store' => [
                    'name' => $product->store->store_name ?? 'Unknown Store',
                    'location' => $product->store->city ?? 'Indonesia',
                ],
                'main_image' => $product->images[0] ?? null,
                'images' => $product->images,
            ];
        });

        return response()->json([
            'data' => [
                'products' => $transformed
            ]
        ]);
    }

    public function show(Request $request, $id)
    {
        $product = Product::with(['store', 'seller', 'category'])->where('id', $id)->firstOrFail();

        if ($request->user()) {
            UserProductActivity::create([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
                'type' => 'view',
                'meta' => [
                    'source' => 'product_detail',
                ],
            ]);
        }

        // Transform to match frontend expectations
        // Specifically for ProductDetail.tsx which expects:
        // product.edges.store.name, product.edges.store.location
        $data = [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'price' => (float) $product->price,
            'discount_price' => $product->discount_price ? (float) $product->discount_price : null,
            'stock_quantity' => (int) $product->stock_quantity,
            'sku' => $product->sku,
            'images' => $product->images ?? [],
            'main_image' => $product->images[0] ?? null,
            'additional_images' => array_slice($product->images ?? [], 1),
            'specifications' => $product->specifications,
            'weight' => (float) $product->weight,
            'dimensions' => $product->dimensions,
            'status' => $product->status,
            'is_featured' => (boolean) $product->is_featured,
            'view_count' => (int) $product->view_count,
            'rating' => (float) ($product->rating ?? 0),
            'review_count' => (int) ($product->review_count ?? 0),
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
            'edges' => [
                'store' => $product->store ? [
                    'id' => $product->store->id,
                    'name' => $product->store->store_name,
                    'store_name' => $product->store->store_name,
                    'location' => $product->store->city,
                    'city' => $product->store->city,
                    'average_rating' => (float) $product->store->average_rating,
                    'logo_url' => $product->store->logo_url,
                ] : null,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
                'seller' => [
                    'id' => $product->seller->id,
                    'full_name' => $product->seller->full_name,
                ]
            ]
        ];

        return response()->json(['data' => $data]);
    }

    public function sellerIndex(Request $request)
    {
        $user = $request->user();
        $limit = $request->query('limit', 20);
        $offset = $request->query('offset', 0);
        $status = $request->query('status');

        $query = Product::where('seller_id', $user->id);

        if ($status) {
            $query->where('status', $status);
        }

        $total = $query->count();
        $products = $query->latest()
            ->skip($offset)
            ->take($limit)
            ->get();

        return response()->json([
            'data' => [
                'products' => $products,
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $store = \App\Models\Store::where('owner_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'You must have a store to create products'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:product_categories,id',
            'images' => 'nullable|array',
            'specifications' => 'nullable|array',
            'condition' => 'string|in:new,used,refurbished',
            'status' => 'string|in:draft,active',
            'weight' => 'nullable|numeric',
            'dimensions' => 'nullable|string',
            'sku' => 'nullable|string|unique:products,sku',
        ]);

        $slug = \Illuminate\Support\Str::slug($validated['name']) . '-' . \Illuminate\Support\Str::random(6);

        $product = Product::create([
            ...$validated,
            'id' => \Illuminate\Support\Str::uuid(),
            'seller_id' => $user->id,
            'store_id' => $store->id,
            'slug' => $slug,
            'main_image' => $validated['images'][0] ?? null,
        ]);
        
        $store->increment('total_products');

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $product = Product::where('id', $id)->where('seller_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'category_id' => 'nullable|exists:product_categories,id',
            'images' => 'nullable|array',
            'specifications' => 'nullable|array',
            'condition' => 'string|in:new,used,refurbished',
            'status' => 'string|in:draft,active,inactive,out_of_stock',
            'weight' => 'nullable|numeric',
            'dimensions' => 'nullable|string',
            'sku' => 'nullable|string|unique:products,sku,' . $id,
        ]);

        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']) . '-' . \Illuminate\Support\Str::random(6);
        }

        if (isset($validated['images']) && count($validated['images']) > 0) {
            $validated['main_image'] = $validated['images'][0];
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $product = Product::where('id', $id)->where('seller_id', $user->id)->firstOrFail();
        
        $product->delete();
        
        // Decrement store total products count
        if ($product->store_id) {
            \App\Models\Store::where('id', $product->store_id)->decrement('total_products');
        }

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
