<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('order_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->json('media_urls')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->string('status')->default('published');
            $table->timestamps();

            $table->unique(['user_id', 'product_id', 'order_id']);
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'product_id']);
        });

        Schema::create('favorite_stores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('store_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'store_id']);
        });

        Schema::create('user_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->nullable();
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable();
            $table->string('channel')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('refund_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('reason');
            $table->text('description')->nullable();
            $table->string('status')->default('pending');
            $table->decimal('refund_amount', 12, 2)->nullable();
            $table->json('evidence_urls')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('disputes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('refund_request_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('status')->default('open');
            $table->text('resolution')->nullable();
            $table->timestamps();
        });

        Schema::create('shipments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained()->cascadeOnDelete();
            $table->string('courier_code')->nullable();
            $table->string('courier_name')->nullable();
            $table->string('service_name')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('status')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->text('last_status')->nullable();
            $table->timestamp('estimated_delivery_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();
        });

        Schema::create('user_product_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index(['product_id', 'type']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_reference')->nullable()->after('payment_method');
            $table->timestamp('payment_expired_at')->nullable()->after('payment_reference');
            $table->timestamp('paid_at')->nullable()->after('payment_expired_at');
            $table->timestamp('cancelled_at')->nullable()->after('paid_at');
            $table->string('escrow_status')->nullable()->after('notes');
            $table->timestamp('escrow_released_at')->nullable()->after('escrow_status');
            $table->string('refund_status')->nullable()->after('escrow_released_at');
            $table->timestamp('shipping_eta')->nullable()->after('shipping_cost');
            $table->integer('shipping_sla_days')->nullable()->after('shipping_eta');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_reference',
                'payment_expired_at',
                'paid_at',
                'cancelled_at',
                'escrow_status',
                'escrow_released_at',
                'refund_status',
                'shipping_eta',
                'shipping_sla_days',
            ]);
        });

        Schema::dropIfExists('user_product_activities');
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('disputes');
        Schema::dropIfExists('refund_requests');
        Schema::dropIfExists('user_notifications');
        Schema::dropIfExists('favorite_stores');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('product_reviews');
    }
};

