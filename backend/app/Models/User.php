<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $fillable = [
        'email',
        'password',
        'role',
        'full_name',
        'phone',
        'avatar_url',
        'date_of_birth',
        'gender',
        'bio',
        'email_verified',
        'phone_verified',
        'email_verified_at',
        'phone_verified_at',
        'two_factor_enabled',
        'two_factor_secret',
        'backup_codes',
        'security_settings',
        'notification_preferences',
        'display_preferences',
        'password_changed_at',
        'login_attempts',
        'locked_until',
        'profile_completion',
        'is_active',
        'last_login',
        'otp_code',
        'otp_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'backup_codes',
        'otp_code', // Hide OTP from default serialization
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'backup_codes' => 'array',
            'security_settings' => 'array',
            'notification_preferences' => 'array',
            'display_preferences' => 'array',
            'password_changed_at' => 'datetime',
            'locked_until' => 'datetime',
            'last_login' => 'datetime',
            'email_verified' => 'boolean',
            'phone_verified' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'is_active' => 'boolean',
            'otp_expires_at' => 'datetime',
        ];
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function stores()
    {
        return $this->hasMany(Store::class, 'owner_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function wishlistItems()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function favoriteStores()
    {
        return $this->hasMany(FavoriteStore::class);
    }

    public function notifications()
    {
        return $this->hasMany(UserNotification::class);
    }

    public function refundRequests()
    {
        return $this->hasMany(RefundRequest::class);
    }

    public function productActivities()
    {
        return $this->hasMany(UserProductActivity::class);
    }
}
