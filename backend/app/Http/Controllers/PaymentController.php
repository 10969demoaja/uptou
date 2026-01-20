<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function webhook(Request $request)
    {
        $validated = $request->validate([
            'order_number' => 'required|string',
            'status' => 'required|string',
            'payment_reference' => 'nullable|string',
            'paid_at' => 'nullable|date',
        ]);

        $order = Order::where('order_number', $validated['order_number'])->first();

        if (!$order) {
            return response()->json([
                'error' => true,
                'message' => 'Order tidak ditemukan',
            ], 404);
        }

        $status = strtolower($validated['status']);

        if ($status === 'paid' || $status === 'success') {
            $order->payment_status = 'paid';
            $order->status = $order->status === 'pending' ? 'paid' : $order->status;
            $order->paid_at = $validated['paid_at'] ? new \DateTime($validated['paid_at']) : now();
        } elseif ($status === 'expired') {
            $order->payment_status = 'expired';
            $order->status = 'cancelled';
            $order->payment_expired_at = now();
        } elseif ($status === 'failed') {
            $order->payment_status = 'failed';
        }

        if (!empty($validated['payment_reference'])) {
            $order->payment_reference = $validated['payment_reference'];
        }

        $order->save();

        return response()->json([
            'error' => false,
            'message' => 'Status pembayaran diperbarui',
        ]);
    }
}

