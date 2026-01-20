<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Store extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'owner_id',
        'store_name',
        'store_slug',
        'description',
        'logo_url',
        'banner_url',
        'phone',
        'email',
        'website_url',
        'address_line1',
        'address_line2',
        'city',
        'province',
        'postal_code',
        'country',
        'business_type',
        'tax_id',
        'business_license',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'is_open',
        'opening_hours',
        'shipping_methods',
        'total_products',
        'total_sales',
        'total_reviews',
        'average_rating',
        'status',
    ];

    protected $casts = [
        'is_open' => 'boolean',
        'opening_hours' => 'array',
        'shipping_methods' => 'array',
        'average_rating' => 'decimal:2',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function favorites()
    {
        return $this->hasMany(FavoriteStore::class);
    }
}
