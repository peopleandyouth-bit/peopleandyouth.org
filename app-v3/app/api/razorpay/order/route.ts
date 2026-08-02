import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    // 1. Safe fallback values prevent build-time crashes when env variables aren't set
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

    // 2. Initialize Razorpay inside the request handler
    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    const body = await req.json();
    const { amount, currency = "INR", receipt } = body;

    const options = {
      amount: amount ? Math.round(amount * 100) : 50000, // Amount in paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}