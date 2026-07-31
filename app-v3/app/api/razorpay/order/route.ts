import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, fullName } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required user payload" },
        { status: 400 }
      );
    }

    const options = {
      amount: 49900,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        email,
        fullName,
        membershipType: "Founding Member",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
