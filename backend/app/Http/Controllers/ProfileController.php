<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'error' => false,
            'data' => $request->user()
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $data = $request->all();

        if (!empty($data['date_of_birth'])) {
            try {
                if (strpos($data['date_of_birth'], '/') !== false) {
                    $data['date_of_birth'] = Carbon::createFromFormat('d/m/Y', $data['date_of_birth'])->format('Y-m-d');
                } elseif (strpos($data['date_of_birth'], 'T') !== false) {
                    $data['date_of_birth'] = Carbon::parse($data['date_of_birth'])->format('Y-m-d');
                }
            } catch (\Exception $e) {
            }
        }

        $validator = Validator::make($data, [
            'full_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ], 400);
        }

        $fields = ['full_name', 'phone', 'bio', 'date_of_birth', 'gender'];
        $user->update(array_intersect_key($data, array_flip($fields)));

        return response()->json([
            'error' => false,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|max:2048', // Max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ], 400);
        }

        $user = $request->user();
        $file = $request->file('avatar');
        
        // Store file
        $path = $file->store('avatars', 'public');
        $url = Storage::url($path);

        $user->avatar_url = $url;
        $user->save();

        return response()->json([
            'error' => false,
            'message' => 'Avatar uploaded successfully',
            'data' => ['avatar_url' => $url]
        ]);
    }
}
