<?php

namespace Database\Factories;

use App\Models\ProductCategory;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Use simpler faker methods that are guaranteed to exist
        $adjective = fake()->word(); 
        $noun = fake()->word();
        $name = ucfirst($adjective . ' ' . $noun . ' ' . fake()->word());
        
        $price = fake()->numberBetween(50000, 5000000);
        
        // Placeholder images
        $imageKeyword = explode(' ', $name)[0];
        $images = [
            "https://placehold.co/800x800?text={$imageKeyword}",
            "https://placehold.co/800x800?text=Product",
            "https://placehold.co/800x800?text=Shop"
        ];

        return [
            'seller_id' => User::factory(),
            'store_id' => Store::factory(),
            'category_id' => ProductCategory::factory(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::random(8),
            'description' => fake()->paragraphs(3, true),
            'price' => $price,
            'discount_price' => fake()->boolean(30) ? $price * 0.8 : null,
            'stock_quantity' => fake()->numberBetween(0, 100),
            'sku' => fake()->ean13(),
            'weight' => fake()->randomFloat(2, 0.1, 10),
            'dimensions' => json_encode([
                'length' => fake()->numberBetween(10, 50),
                'width' => fake()->numberBetween(10, 30),
                'height' => fake()->numberBetween(5, 20)
            ]),
            'images' => $images,
            'status' => 'active',
            'condition' => fake()->randomElement(['new', 'used']),
            'is_featured' => fake()->boolean(10),
            'rating' => fake()->randomFloat(2, 3, 5),
            'review_count' => fake()->numberBetween(0, 500),
            'view_count' => fake()->numberBetween(0, 5000),
        ];
    }
}
