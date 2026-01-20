<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('seller_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreignUuid('store_id')->nullable()->references('id')->on('stores')->nullOnDelete();
            $table->foreignUuid('category_id')->nullable()->references('id')->on('product_categories')->nullOnDelete();
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->decimal('discount_price', 15, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->string('sku')->nullable()->unique();
            
            // Images
            $table->json('images')->nullable();
            $table->string('main_image')->nullable();
            $table->json('additional_images')->nullable();
            
            // Details
            $table->json('specifications')->nullable();
            $table->string('condition')->default('new');
            $table->json('tags')->nullable();
            $table->decimal('weight', 10, 2)->nullable();
            $table->string('dimensions')->nullable();
            
            // Status
            $table->enum('status', ['draft', 'active', 'inactive', 'out_of_stock'])->default('draft');
            $table->boolean('is_featured')->default(false);
            
            // Stats
            $table->integer('view_count')->default(0);
            $table->integer('review_count')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
