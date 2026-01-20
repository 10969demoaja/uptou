<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Dispute extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_id',
        'buyer_id',
        'seller_id',
        'refund_request_id',
        'title',
        'description',
        'status',
        'resolution',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function refundRequest()
    {
        return $this->belongsTo(RefundRequest::class);
    }
}

