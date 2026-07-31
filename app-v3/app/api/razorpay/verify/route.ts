import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      email,
      fullName,
    } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        email: email,
        is_founding_member: true,
        dissent_card_verified: true,
        razorpay_order_id,
        razorpay_payment_id,
        payment_status: "completed",
        amount_paid: 499,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Update Error:", error);
      return NextResponse.json(
        { error: "Payment verified but database update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Founding Membership Activated!",
      membershipId: data.membership_id,
    });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
