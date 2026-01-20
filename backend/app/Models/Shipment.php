<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Shipment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_id',
        'courier_code',
        'courier_name',
        'service_name',
        'tracking_number',
        'status',
        'last_checked_at',
        'last_status',
        'estimated_delivery_at',
        'shipped_at',
        'delivered_at',
        'raw_payload',
    ];

    protected $casts = [
        'last_checked_at' => 'datetime',
        'estimated_delivery_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'raw_payload' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

