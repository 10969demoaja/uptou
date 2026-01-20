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
        Schema::create('stores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('store_name');
            $table->string('store_slug')->unique();
            $table->text('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('banner_url')->nullable();
            
            // Contact
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website_url')->nullable();
            
            // Address
            $table->text('address_line1')->nullable();
            $table->text('address_line2')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Indonesia');
            
            // Business
            $table->string('business_type')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('business_license')->nullable();
            
            // Bank
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_holder')->nullable();
            
            // Settings
            $table->boolean('is_open')->default(true);
            $table->json('opening_hours')->nullable();
            $table->json('shipping_methods')->nullable();
            
            // Stats
            $table->integer('total_products')->default(0);
            $table->integer('total_sales')->default(0);
            $table->integer('total_reviews')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            
            // Status
            $table->enum('status', ['pending', 'active', 'suspended', 'rejected'])->default('pending');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
