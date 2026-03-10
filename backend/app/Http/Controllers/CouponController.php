<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CouponController extends Controller
{
    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'order_amount' => 'required|numeric'
        ]);

        $coupon = Coupon::where('code', $request->code)
                        ->where('is_active', true)
                        ->where('expires_at', '>', Carbon::now())
                        ->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid or expired coupon code'], 404);
        }

        if ($request->order_amount < $coupon->min_order_amount) {
            return response()->json([
                'message' => 'Minimum order amount for this coupon is $' . $coupon->min_order_amount
            ], 400);
        }

        $discount = 0;
        if ($coupon->type === 'percentage') {
            $discount = ($request->order_amount * $coupon->value) / 100;
        } else {
            $discount = $coupon->value;
        }

        return response()->json([
            'message' => 'Coupon applied!',
            'discount' => round($discount, 2),
            'code' => $coupon->code
        ]);
    }
}
