<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function estimate(Request $request)
    {
        $validated = $request->validate([
            'destination_postal_code' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.weight' => 'nullable|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $totalWeight = 0;

        foreach ($validated['items'] as $item) {
            $weight = $item['weight'] ?? 1;
            $totalWeight += $weight * $item['quantity'];
        }

        $baseCost = 10000;
        $perKg = 2000;
        $weightKg = max(1, $totalWeight);
        $cost = $baseCost + ($perKg * $weightKg);

        $options = [
            [
                'courier_code' => 'REG',
                'courier_name' => 'Regular',
                'service_name' => 'Reguler',
                'cost' => $cost,
                'estimated_days' => 3,
            ],
            [
                'courier_code' => 'EXP',
                'courier_name' => 'Express',
                'service_name' => 'Express',
                'cost' => $cost + 5000,
                'estimated_days' => 1,
            ],
        ];

        return response()->json([
            'data' => [
                'options' => $options,
            ],
        ]);
    }

    public function showOrderShipment(Request $request, $orderId)
    {
        $user = $request->user();

        $order = Order::where('id', $orderId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $shipment = Shipment::where('order_id', $order->id)->first();

        return response()->json([
            'data' => [
                'order' => $order,
                'shipment' => $shipment,
            ],
        ]);
    }
}

