"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Step A: Create order via backend API route
      const tempUserId = `usr_${Date.now()}`; // Placeholder until Supabase auth session is attached
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tempUserId,
          email,
          fullName,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.id) {
        throw new Error(orderData.error || "Failed to initialize payment order.");
      }

      // Step B: Configure Razorpay Checkout Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "People & Youth",
        description: "Founding Member Dissent Card (Lifetime)",
        order_id: orderData.id,
        prefill: {
          name: fullName,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#0891b2", // Cyan accent
        },
        handler: async function (response: any) {
          // Step C: Verify payment signature via backend API route
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: tempUserId,
              email,
              fullName,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.membershipId) {
            onClose();
            // Redirect to public card verification page
            router.push(`/verify/${verifyData.membershipId}`);
          } else {
            setErrorMessage("Payment verification failed. Please contact support.");
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      console.error("Checkout Error:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-cyan-500/30 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
        >
          ✕
        </button>

        <div className="mb-6">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">
            FOUNDING MEMBERSHIP ACTIVATION
          </span>
          <h3 className="text-2xl font-bold text-white">Claim Dissent Card</h3>
          <p className="text-xs text-slate-300 mt-1">
            Enter your details to generate your verified digital ID card and membership credentials.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">FULL NAME</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Swaraj Shandilya"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="swaraj@peopleandyouth.org"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">PHONE NUMBER</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Initializing Razorpay...</span>
              ) : (
                <>
                  <span>Pay ₹499 & Generate Card</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded">₹499</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
