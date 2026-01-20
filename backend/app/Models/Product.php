<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'seller_id',
        'store_id',
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'discount_price',
        'stock_quantity',
        'sku',
        'images',
        'main_image',
        'additional_images',
        'specifications',
        'condition',
        'tags',
        'weight',
        'dimensions',
        'status',
        'is_featured',
        'view_count',
        'review_count',
        'rating',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'images' => 'array',
        'additional_images' => 'array',
        'specifications' => 'array',
        'tags' => 'array',
        'weight' => 'decimal:2',
        'rating' => 'decimal:2',
        'is_featured' => 'boolean',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function activities()
    {
        return $this->hasMany(UserProductActivity::class);
    }
}
