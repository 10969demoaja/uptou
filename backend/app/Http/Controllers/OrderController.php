<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\UserProductActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // Buyer: Checkout (Create Orders)
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.variant' => 'nullable|string',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => true, 'message' => $validator->errors()->first()], 400);
        }

        $user = $request->user();
        $items = $request->items;
        $createdOrders = [];

        DB::beginTransaction();
        try {
            // Group items by store
            $itemsByStore = [];
            foreach ($items as $itemData) {
                $product = Product::find($itemData['product_id']);
                
                if (!$product) {
                    throw new \Exception("Product not found: " . $itemData['product_id']);
                }

                if ($product->stock_quantity < $itemData['quantity']) {
                    throw new \Exception("Insufficient stock for product: " . $product->name);
                }

                $storeId = $product->store_id;
                if (!isset($itemsByStore[$storeId])) {
                    $itemsByStore[$storeId] = [];
                }
                
                // Add product detail to item data
                $itemData['product'] = $product;
                $itemsByStore[$storeId][] = $itemData;
            }

            // Create Order per Store
            foreach ($itemsByStore as $storeId => $storeItems) {
                $totalAmount = 0;
                
                // Create Order
                $order = Order::create([
                    'user_id' => $user->id,
                    'store_id' => $storeId,
                    'order_number' => 'ORD-' . strtoupper(Str::random(4)) . '-' . time(),
                    'total_amount' => 0, // Calculate later
                    'status' => 'pending',
                    'payment_status' => 'unpaid',
                    'payment_method' => $request->payment_method,
                    'shipping_address' => $request->shipping_address,
                    'notes' => $request->notes ?? null,
                ]);

                foreach ($storeItems as $item) {
                    $product = $item['product'];
                    $quantity = $item['quantity'];
                    $price = $product->discount_price ?? $product->price; // Use discount price if available? Assuming logic here.
                    // If discount_price is null or 0, use price.
                    if (!$product->discount_price || $product->discount_price == 0) {
                        $price = $product->price;
                    } else {
                        $price = $product->discount_price;
                    }

                    $subtotal = $price * $quantity;
                    $totalAmount += $subtotal;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity' => $quantity,
                        'price' => $price,
                        'subtotal' => $subtotal,
                        'variant' => $item['variant'] ?? null,
                    ]);

                    // Decrement Stock
                    $product->decrement('stock_quantity', $quantity);

                    UserProductActivity::create([
                        'user_id' => $user->id,
                        'product_id' => $product->id,
                        'type' => 'order',
                        'meta' => [
                            'order_id' => $order->id,
                            'quantity' => $quantity,
                        ],
                    ]);
                }

                // Update Order Total
                $order->update(['total_amount' => $totalAmount]);
                $createdOrders[] = $order->load('items');
            }

            DB::commit();
            return response()->json([
                'error' => false,
                'message' => 'Order created successfully',
                'data' => $createdOrders
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => true, 'message' => $e->getMessage()], 400);
        }
    }

    // Buyer: List Orders
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = Order::where('user_id', $user->id)
            ->with(['items', 'store'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['error' => false, 'data' => $orders]);
    }

    // Common: Show Order Detail
    public function show($id)
    {
        $order = Order::with(['items', 'store', 'user'])->find($id);
        
        if (!$order) {
            return response()->json(['error' => true, 'message' => 'Order not found'], 404);
        }

        return response()->json(['error' => false, 'data' => $order]);
    }

    // Seller: List Orders
    public function sellerOrders(Request $request)
    {
        $user = $request->user();
        // Find store owned by user
        $store = Store::where('owner_id', $user->id)->first();
        
        if (!$store) {
            return response()->json(['error' => true, 'message' => 'Store not found'], 404);
        }

        $orders = Order::where('store_id', $store->id)
            ->with(['items', 'user']) // Load buyer info
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['error' => false, 'data' => $orders]);
    }

    // Seller: Update Order Status
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,paid,processing,shipped,delivered,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => true, 'message' => $validator->errors()->first()], 400);
        }

        $user = $request->user();
        $store = Store::where('owner_id', $user->id)->first();

        if (!$store) {
            return response()->json(['error' => true, 'message' => 'Store not found'], 404);
        }

        $order = Order::where('id', $id)->where('store_id', $store->id)->first();

        if (!$order) {
            return response()->json(['error' => true, 'message' => 'Order not found or unauthorized'], 404);
        }

        $order->update(['status' => $request->status]);

        return response()->json(['error' => false, 'message' => 'Order status updated', 'data' => $order]);
    }
}
