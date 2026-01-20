<?php

namespace App\Http\Controllers;

use App\Models\Dispute;
use App\Models\Order;
use App\Models\RefundRequest;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RefundController extends Controller
{
    public function store(Request $request, $orderId)
    {
        $user = $request->user();

        $order = Order::where('id', $orderId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string',
            'refund_amount' => 'nullable|numeric|min:0',
            'evidence_urls' => 'nullable|array',
            'evidence_urls.*' => 'string',
        ]);

        if (in_array($order->status, ['cancelled'])) {
            return response()->json([
                'error' => true,
                'message' => 'Order sudah dibatalkan',
            ], 400);
        }

        $existing = RefundRequest::where('order_id', $order->id)
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved', 'processing'])
            ->first();

        if ($existing) {
            return response()->json([
                'error' => true,
                'message' => 'Refund untuk order ini sudah diajukan',
            ], 400);
        }

        $refund = RefundRequest::create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
            'refund_amount' => $validated['refund_amount'] ?? null,
            'evidence_urls' => $validated['evidence_urls'] ?? [],
        ]);

        $order->refund_status = 'requested';
        $order->save();

        return response()->json([
            'error' => false,
            'message' => 'Refund request dibuat',
            'data' => $refund,
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $refunds = RefundRequest::with('order.store')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'refunds' => $refunds,
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $refund = RefundRequest::with('order.store')
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'data' => $refund,
        ]);
    }

    public function dispute(Request $request, $orderId)
    {
        $user = $request->user();

        $order = Order::with('store')->where('id', $orderId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'refund_request_id' => 'nullable|exists:refund_requests,id',
        ]);

        $store = $order->store;

        if (!$store) {
            return response()->json([
                'error' => true,
                'message' => 'Toko untuk order ini tidak ditemukan',
            ], 400);
        }

        $dispute = Dispute::create([
            'order_id' => $order->id,
            'buyer_id' => $user->id,
            'seller_id' => $store->owner_id,
            'refund_request_id' => $validated['refund_request_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => 'open',
        ]);

        return response()->json([
            'error' => false,
            'message' => 'Dispute dibuat',
            'data' => $dispute,
        ], 201);
    }

    public function disputes(Request $request)
    {
        $user = $request->user();

        $disputes = Dispute::with('order.store')
            ->where('buyer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'disputes' => $disputes,
            ],
        ]);
    }
}

