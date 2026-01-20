<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function show(Request $request, $orderId)
    {
        $user = $request->user();

        $order = Order::with(['items.product', 'store'])
            ->where('id', $orderId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $invoice = [
            'order_number' => $order->order_number,
            'issued_at' => $order->created_at,
            'buyer' => [
                'id' => $order->user_id,
                'name' => $user->full_name,
                'email' => $user->email,
            ],
            'store' => $order->store ? [
                'id' => $order->store->id,
                'name' => $order->store->store_name,
                'city' => $order->store->city,
            ] : null,
            'items' => $order->items->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'subtotal' => (float) $item->subtotal,
                ];
            }),
            'total_amount' => (float) $order->total_amount,
            'shipping_cost' => (float) $order->shipping_cost,
            'grand_total' => (float) ($order->total_amount + $order->shipping_cost),
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
        ];

        return response()->json([
            'data' => $invoice,
        ]);
    }
}

