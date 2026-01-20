<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete(); // Buyer
            $table->foreignUuid('store_id')->constrained()->cascadeOnDelete(); // Seller Store
            $table->string('order_number')->unique(); // Human readable ID like ORD-20240101-XXXX
            $table->decimal('total_amount', 12, 2);
            $table->string('status')->default('pending'); // pending, paid, processing, shipped, delivered, completed, cancelled
            $table->string('payment_status')->default('unpaid');
            $table->string('payment_method')->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('shipping_courier')->nullable();
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->string('product_name'); // Snapshot of name
            $table->integer('quantity');
            $table->decimal('price', 12, 2); // Snapshot of price at purchase
            $table->decimal('subtotal', 12, 2);
            $table->string('variant')->nullable(); // Color, Size, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
