<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Store;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Disable foreign key checks to allow truncating tables
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::truncate();
        Store::truncate();
        Product::truncate();
        ProductCategory::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Create Categories
        $this->command->info('Creating categories from kategori.json...');
        $categories = $this->seedCategoriesFromJson();
        $electronics = ProductCategory::where('name', 'Elektronik')->first() ?? $categories->first();

        // 2. Create Buyer Account
        $this->command->info('Creating buyer account...');
        User::factory()->create([
            'email' => 'buyer@uptou.com',
            'password' => Hash::make('password'),
            'role' => 'buyer',
            'full_name' => 'Buyer Test Account',
            'phone' => '081234567890',
        ]);
        
        // 3. Create Seller Account (The Main Test Seller)
        $this->command->info('Creating main seller account...');
        $mainSeller = User::factory()->create([
            'email' => 'seller@uptou.com',
            'password' => Hash::make('password'),
            'role' => 'seller',
            'full_name' => 'Seller Test Account',
            'phone' => '081234567891',
        ]);

        $mainStore = Store::factory()->create([
            'owner_id' => $mainSeller->id,
            'store_name' => 'Toko Serba Ada',
            'store_slug' => 'toko-serba-ada',
            'description' => 'Menjual segala kebutuhan anda dengan harga terbaik.',
            'city' => 'Jakarta Selatan',
        ]);

        // Products for Main Seller
        Product::factory()->count(10)->create([
            'seller_id' => $mainSeller->id,
            'store_id' => $mainStore->id,
            'category_id' => $electronics?->id,
        ]);

        // 4. Create 10 Additional Sellers with Stores and Products
        $this->command->info('Creating 10 additional sellers with stores and products...');
        
        User::factory()
            ->count(10)
            ->create(['role' => 'seller'])
            ->each(function ($user) use ($categories) {
                // Create Store for this seller
                $store = Store::factory()->create([
                    'owner_id' => $user->id,
                    'email' => $user->email,
                ]);

                // Create 10 Products for this store
                Product::factory()
                    ->count(10)
                    ->create([
                        'seller_id' => $user->id,
                        'store_id' => $store->id,
                        'category_id' => $categories->random()->id,
                    ]);
            });

        $this->command->info('Database seeding completed successfully!');
        $this->command->info('Buyer: buyer@uptou.com / password');
        $this->command->info('Seller: seller@uptou.com / password');
    }

    protected function seedCategoriesFromJson()
    {
        $path = base_path('../frontend/KATEGORI/kategori.json');

        if (! file_exists($path)) {
            $this->command->warn('kategori.json not found, falling back to factory categories.');
            return ProductCategory::factory()->count(10)->create();
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        if (! is_array($data)) {
            $this->command->warn('kategori.json invalid, falling back to factory categories.');
            return ProductCategory::factory()->count(10)->create();
        }

        $allCategories = collect();

        foreach ($data as $i => $top) {
            $name1 = isset($top['kategori1']) ? html_entity_decode($top['kategori1'], ENT_QUOTES, 'UTF-8') : null;

            if (! $name1) {
                continue;
            }

            $level1 = ProductCategory::create([
                'name' => $name1,
                'slug' => Str::slug($name1),
                'description' => null,
                'icon' => null,
                'parent_id' => null,
                'level' => 1,
                'sort_order' => $i,
                'is_active' => true,
            ]);

            $allCategories->push($level1);

            $kategori2List = $top['kategori2'] ?? [];

            foreach ($kategori2List as $j => $cat2) {
                $name2 = isset($cat2['nama']) ? html_entity_decode($cat2['nama'], ENT_QUOTES, 'UTF-8') : null;

                if (! $name2) {
                    continue;
                }

                $level2 = ProductCategory::create([
                    'name' => $name2,
                    'slug' => Str::slug($level1->slug.'-'.$name2),
                    'description' => null,
                    'icon' => null,
                    'parent_id' => $level1->id,
                    'level' => 2,
                    'sort_order' => $j,
                    'is_active' => true,
                ]);

                $allCategories->push($level2);

                $kategori3List = $cat2['kategori3'] ?? [];

                foreach ($kategori3List as $k => $name3Raw) {
                    $name3 = $name3Raw ? html_entity_decode($name3Raw, ENT_QUOTES, 'UTF-8') : null;

                    if (! $name3) {
                        continue;
                    }

                    $level3 = ProductCategory::create([
                        'name' => $name3,
                        'slug' => Str::slug($level2->slug.'-'.$name3),
                        'description' => null,
                        'icon' => null,
                        'parent_id' => $level2->id,
                        'level' => 3,
                        'sort_order' => $k,
                        'is_active' => true,
                    ]);

                    $allCategories->push($level3);
                }
            }
        }

        return $allCategories;
    }
}
