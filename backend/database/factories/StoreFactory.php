<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Store>
 */
class StoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company() . ' Store';
        return [
            'owner_id' => User::factory(),
            'store_name' => $name,
            'store_slug' => Str::slug($name) . '-' . Str::random(5),
            'description' => fake()->paragraph(),
            'logo_url' => 'https://placehold.co/200x200?text=' . substr($name, 0, 1),
            'banner_url' => 'https://placehold.co/1200x400?text=' . Str::slug($name),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'website_url' => fake()->url(),
            'address_line1' => fake()->streetAddress(),
            'city' => fake()->city(),
            'province' => fake()->state(),
            'postal_code' => fake()->postcode(),
            'country' => 'Indonesia',
            'business_type' => fake()->randomElement(['individual', 'corporate']),
            'is_open' => true,
            'status' => 'active',
            'average_rating' => fake()->randomFloat(2, 3, 5),
            'total_reviews' => fake()->numberBetween(0, 1000),
            'total_sales' => fake()->numberBetween(0, 5000),
            'total_products' => 0, // Will be updated by observers or manual count
        ];
    }
}
