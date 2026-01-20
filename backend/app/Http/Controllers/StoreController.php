<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function show(Request $request, $id)
    {
        $store = Store::find($id);

        if (!$store) {
            return response()->json(['error' => true, 'message' => 'Store not found'], 404);
        }

        // Fetch products if needed
        $limit = $request->query('limit', 60);
        $offset = $request->query('offset', 0);

        $products = $store->products()
            ->skip($offset)
            ->take($limit)
            ->get();
        
        $total = $store->products()->count();

        return response()->json([
            'error' => false,
            'data' => [
                'store' => $store,
                'products' => $products,
                'total' => $total
            ]
        ]);
    }

    public function myStore(Request $request)
    {
        $user = $request->user();
        $store = Store::where('owner_id', $user->id)->first();

        if (!$store) {
            return response()->json(['error' => true, 'message' => 'Store not found'], 404);
        }

        return response()->json([
            'error' => false,
            'data' => $store
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $store = Store::where('owner_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'store_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'banner_url' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'website_url' => 'nullable|url',
            'address_line1' => 'nullable|string',
            'city' => 'nullable|string',
            'province' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'is_open' => 'boolean',
            'opening_hours' => 'nullable|array',
            'shipping_methods' => 'nullable|array',
        ]);

        if (isset($validated['store_name']) && $validated['store_name'] !== $store->store_name) {
            $validated['store_slug'] = \Illuminate\Support\Str::slug($validated['store_name']) . '-' . \Illuminate\Support\Str::random(6);
        }

        $store->update($validated);

        return response()->json([
            'message' => 'Store updated successfully',
            'data' => $store
        ]);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        $store = Store::where('owner_id', $user->id)->first();

        if (!$store) {
            return response()->json(['error' => true, 'message' => 'Store not found'], 404);
        }

        $stats = [
            'total_products' => $store->products()->count(),
            'active_products' => $store->products()->where('status', 'active')->count(),
            'out_of_stock_products' => $store->products()->where('status', 'out_of_stock')->orWhere('stock_quantity', 0)->count(),
            'draft_products' => $store->products()->where('status', 'draft')->count(),
        ];

        return response()->json([
            'error' => false,
            'data' => $stats
        ]);
    }
}
