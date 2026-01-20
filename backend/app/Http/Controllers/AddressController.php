<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->orderBy('is_primary', 'desc')->get();
        
        return response()->json([
            'error' => false,
            'data' => $addresses
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Check max 3 addresses
        if ($user->addresses()->count() >= 3) {
            return response()->json([
                'error' => true,
                'message' => 'Maksimal 3 alamat yang diperbolehkan.'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'recipient_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'address_line1' => 'required|string',
            'city' => 'required|string',
            'province' => 'required|string',
            'postal_code' => 'required|string',
            'label' => 'nullable|string',
            'is_primary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ], 400);
        }

        $data = $request->all();
        $data['user_id'] = $user->id;

        // If this is the first address, make it primary
        if ($user->addresses()->count() === 0) {
            $data['is_primary'] = true;
        }

        // If setting as primary, unset others
        if (isset($data['is_primary']) && $data['is_primary']) {
            $user->addresses()->update(['is_primary' => false]);
        }

        $address = Address::create($data);

        return response()->json([
            'error' => false,
            'message' => 'Alamat berhasil ditambahkan',
            'data' => $address
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $address = $user->addresses()->find($id);

        if (!$address) {
            return response()->json([
                'error' => true,
                'message' => 'Alamat tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'recipient_name' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'address_line1' => 'nullable|string',
            'city' => 'nullable|string',
            'province' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'label' => 'nullable|string',
            'is_primary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => $validator->errors()->first()
            ], 400);
        }

        $data = $request->all();

        // If setting as primary, unset others
        if (isset($data['is_primary']) && $data['is_primary']) {
            $user->addresses()->where('id', '!=', $id)->update(['is_primary' => false]);
        }

        $address->update($data);

        return response()->json([
            'error' => false,
            'message' => 'Alamat berhasil diupdate',
            'data' => $address
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $address = $user->addresses()->find($id);

        if (!$address) {
            return response()->json([
                'error' => true,
                'message' => 'Alamat tidak ditemukan'
            ], 404);
        }

        $address->delete();

        return response()->json([
            'error' => false,
            'message' => 'Alamat berhasil dihapus'
        ]);
    }
}
