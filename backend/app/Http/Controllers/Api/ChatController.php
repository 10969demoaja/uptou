<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $conversations = ChatConversation::where('buyer_id', $user->id)
            ->orWhere('seller_id', $user->id)
            ->with(['buyer', 'seller', 'store'])
            ->orderByDesc('updated_at')
            ->get();
            
        return response()->json([
            'error' => false,
            'data' => $conversations
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $conversation = ChatConversation::with(['buyer', 'seller', 'store'])->find($id);

        if (!$conversation) {
            return response()->json(['error' => true, 'message' => 'Conversation not found'], 404);
        }

        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            return response()->json(['error' => true, 'message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'error' => false,
            'data' => $conversation
        ]);
    }

    public function getMessages(Request $request, $conversationId)
    {
        $user = $request->user();
        $conversation = ChatConversation::find($conversationId);

        if (!$conversation) {
            return response()->json(['error' => true, 'message' => 'Conversation not found'], 404);
        }

        // Check access
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            return response()->json(['error' => true, 'message' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()->orderBy('created_at', 'asc')->get();

        return response()->json([
            'error' => false,
            'data' => $messages
        ]);
    }

    public function sendMessage(Request $request, $conversationId)
    {
        $user = $request->user();
        $conversation = ChatConversation::find($conversationId);

        if (!$conversation) {
            return response()->json(['error' => true, 'message' => 'Conversation not found'], 404);
        }

        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            return response()->json(['error' => true, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => 'required|string',
        ]);

        $senderType = ($user->id === $conversation->buyer_id) ? 'buyer' : 'seller';

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'sender_type' => $senderType,
            'content' => $request->content,
            'is_read' => false,
        ]);

        // Update conversation updated_at
        $conversation->touch();

        return response()->json([
            'error' => false,
            'data' => $message
        ]);
    }

    public function startConversation(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'store_id' => 'required_without:product_id|exists:stores,id',
            'product_id' => 'required_without:store_id|exists:products,id',
        ]);

        $storeId = $request->store_id;
        
        if ($request->has('product_id')) {
            $product = Product::find($request->product_id);
            if ($product->store_id) {
                $storeId = $product->store_id;
            } else {
                // If product doesn't have store_id, try to find store by seller_id
                $store = Store::where('owner_id', $product->seller_id)->first();
                if ($store) {
                    $storeId = $store->id;
                } else {
                     return response()->json(['error' => true, 'message' => 'Store not found for this product'], 404);
                }
            }
        }
        
        $store = Store::find($storeId);

        if (!$store) {
            return response()->json(['error' => true, 'message' => 'Store not found'], 404);
        }
        
        // Prevent chatting with yourself
        if ($store->owner_id === $user->id) {
             return response()->json(['error' => true, 'message' => 'Cannot chat with yourself'], 400);
        }

        // Check if conversation exists
        $conversation = ChatConversation::where('buyer_id', $user->id)
            ->where('store_id', $storeId)
            ->first();

        if (!$conversation) {
            $conversation = ChatConversation::create([
                'buyer_id' => $user->id,
                'seller_id' => $store->owner_id,
                'store_id' => $storeId,
            ]);
        }

        return response()->json([
            'error' => false,
            'data' => $conversation
        ]);
    }
}
