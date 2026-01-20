<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $onlyUnread = $request->query('unread') === '1';

        $query = UserNotification::where('user_id', $user->id)->latest();

        if ($onlyUnread) {
            $query->whereNull('read_at');
        }

        $notifications = $query->get();

        return response()->json([
            'data' => [
                'notifications' => $notifications,
            ],
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = UserNotification::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        if (!$notification->read_at) {
            $notification->read_at = now();
            $notification->save();
        }

        return response()->json([
            'error' => false,
            'message' => 'Notifikasi dibaca',
            'data' => $notification,
        ]);
    }
}

