"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowLeft, Pencil, AlertCircle, X } from "lucide-react";

// --- Mock Data ---
const transactions = [
  { date: "Aug/15/2025", plan: "Monthly", amount: "$49.99", status: "Paid", color: "text-[#4F6EF7]" },
  { date: "Jun/01/2025", plan: "Monthly", amount: "$49.99", status: "Failed", color: "text-red-500" },
  { date: "Jun/15/2025", plan: "Monthly", amount: "$49.99", status: "Paid", color: "text-[#4F6EF7]" },
  { date: "Pay/01/2025", plan: "Monthly", amount: "$49.99", status: "Paid", color: "text-[#4F6EF7]" },
];

export default function Subscription() {
  const [view, setView] = useState<"main" | "upgrade" | "review">("main");
  const [isCancelled, setIsCancelled] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: "Monthly", price: "49.99", period: "/mo" });

  const handlePlanSelection = (name: string, price: string, period: string) => {
    setSelectedPlan({ name, price, period });
    setView("review");
  };

  const handleConfirmCancel = () => {
    setIsCancelled(true);
    setShowCancelModal(false);
  };

  // --- VIEW 3: REVIEW YOUR NEW PLAN ---
  if (view === "review") {
    return (
      <div className="flex-1 bg-white rounded-[32px] overflow-hidden shadow-sm min-h-[700px] animate-in fade-in duration-300">
        <div className="relative py-6 border-b border-gray-100">
          <button onClick={() => setView("upgrade")} className="absolute left-8 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6 text-black" />
          </button>
          <h2 className="text-center text-xl font-bold text-gray-800">Review Your New Plan</h2>
        </div>

        <div className="p-10 flex flex-col items-center">
          <div className="w-full max-w-md rounded-[24px] border-2 border-[#4F6EF7] bg-[#E8F0FF] p-6 flex flex-col items-center mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{selectedPlan.name}</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-xl font-bold mr-0.5">$</span>
              <span className="text-4xl font-black">{selectedPlan.price}</span>
              <span className="text-gray-400 font-medium ml-1">{selectedPlan.period}</span>
            </div>
            <div className="space-y-2 text-left w-full px-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#4F6EF7]" fill="currentColor" stroke="white" />
                  <span>Lorem ipsum dolor sit amet</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-gray-800">Payment Method</label>
              <Pencil className="h-4 w-4 text-gray-500 cursor-pointer" />
            </div>
            <div className="w-full rounded-full bg-[#F3F4F6] px-6 py-3.5 flex justify-between items-center">
              <span className="text-gray-400 text-sm tracking-widest font-medium">*** *** *** 482</span>
              <div className="bg-white px-2 py-0.5 rounded border border-gray-200 flex items-center shadow-sm">
                 <span className="text-[10px] font-bold text-blue-600">G</span>
                 <span className="text-[10px] font-bold text-gray-600 ml-0.5">Pay</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl bg-[#E8F0FF] p-5 space-y-2 mb-8">
            <div className="flex justify-between text-gray-400 font-medium text-sm">
              <span>Subtotal</span>
              <span>${selectedPlan.price}</span>
            </div>
            <div className="flex justify-between text-[#4F6EF7] font-bold text-sm">
              <span>Subtotal</span>
              <span>${selectedPlan.price}</span>
            </div>
          </div>

          <button className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white font-bold text-lg shadow-[0_8px_20px_rgba(59,84,240,0.3)]">
            Pay Now
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 2: UPGRADE PLAN SELECTION ---
  if (view === "upgrade") {
    return (
      <div className="flex-1 bg-white rounded-[32px] overflow-hidden shadow-sm min-h-[700px] animate-in fade-in duration-300">
        <div className="relative py-6 border-b border-gray-100">
          <button onClick={() => setView("main")} className="absolute left-8 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6 text-black" />
          </button>
          <h2 className="text-center text-xl font-bold text-gray-800">Upgrade Plan</h2>
        </div>
        <div className="p-10">
          <p className="text-center text-gray-400 mb-10 font-medium text-sm">Choose your new subscription plan!</p>
          <div className="flex gap-6 max-w-5xl mx-auto">
            <div onClick={() => handlePlanSelection("Monthly", "49.99", "/mo")} className="flex-1 rounded-[24px] p-8 border-2 border-[#4F6EF7] bg-[#E8F0FF] flex flex-col items-center cursor-pointer">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-2xl font-bold mr-1">$</span>
                <span className="text-5xl font-black">49.99</span>
                <span className="text-gray-400 font-medium ml-1">/mo</span>
              </div>
              <div className="space-y-4 w-full">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 className="h-5 w-5 text-[#4F6EF7]" fill="currentColor" stroke="white" />
                    <span className="text-sm font-medium">Lorem ipsum dolor sit amet</span>
                  </div>
                ))}
              </div>
            </div>
            <div onClick={() => handlePlanSelection("Annual", "499.99", "/year")} className="flex-1 rounded-[24px] p-8 bg-[#F0F4FF] flex flex-col items-center cursor-pointer">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Annual</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-2xl font-bold mr-1">$</span>
                <span className="text-5xl font-black">499.99</span>
                <span className="text-gray-400 font-medium ml-1">/year</span>
              </div>
               <div className="space-y-4 w-full">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 className="h-5 w-5 text-[#4F6EF7]" fill="currentColor" stroke="white" />
                    <span className="text-sm font-medium">Lorem ipsum dolor sit amet</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 1: MAIN SUBSCRIPTION & CANCELLATION LOGIC ---
  return (
    <div className="flex-1 bg-white rounded-[32px] overflow-hidden shadow-sm min-h-[700px] relative">
      <div className="py-6 border-b border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800">Subscription</h2>
      </div>

      <div className="p-8">
        <div className="rounded-[24px] border-2 border-[#A5C0FF] bg-[#E8F0FF] p-8 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Monthly</h3>
          <div className="flex items-baseline mb-6">
            <span className="text-xl font-bold mr-0.5">$</span>
            <span className="text-5xl font-black">49.99</span>
            <span className="text-gray-400 font-medium ml-1">/mo</span>
          </div>

          <div className="space-y-3 mb-8 text-left">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-600">
                <CheckCircle2 className="h-5 w-5 text-[#4F6EF7]" fill="currentColor" stroke="white" />
                <span className="text-sm font-medium">Lorem ipsum dolor sit amet</span>
              </div>
            ))}
          </div>

          {!isCancelled ? (
            <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
              <button onClick={() => setShowCancelModal(true)} className="py-3.5 rounded-full border border-red-300 bg-[#F5D7E3] text-red-500 font-bold text-sm">Cancel</button>
              <button onClick={() => setView("upgrade")} className="py-3.5 rounded-full border border-orange-200 bg-[#F0E6D2] text-orange-400 font-bold text-sm">Downgrade</button>
              <button onClick={() => setView("upgrade")} className="py-3.5 rounded-full bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white font-bold text-sm shadow-md">Upgrade</button>
            </div>
          ) : (
            <button onClick={() => setIsCancelled(false)} className="w-full max-w-2xl py-3.5 rounded-full bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white font-bold text-sm shadow-lg">Renew</button>
          )}
        </div>

        {isCancelled && (
          <div className="mt-6 p-4 bg-[#FEE2E2] border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-[13px] font-semibold leading-tight">Subscription has been cancelled. You can continue using the app until your current plan ends on Sept 15</p>
          </div>
        )}

        <div className="mt-10">
          <h3 className="text-lg font-bold text-black mb-4">Transaction History</h3>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white">
                  <th className="px-6 py-4 text-xs font-semibold uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase">Plan</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-center">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="bg-[#EEF2FF]">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-white last:border-0">
                    <td className="px-6 py-4 text-sm text-gray-700">{tx.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{tx.plan}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">{tx.amount}</td>
                    <td className={`px-6 py-4 text-sm font-bold text-right underline cursor-pointer ${tx.color}`}>{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- CANCEL MODAL --- */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-red-50 p-4 rounded-full"><AlertCircle className="h-8 w-8 text-red-500" /></div>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Subscription?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing cycle.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3.5 rounded-full border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors">Go Back</button>
              <button onClick={handleConfirmCancel} className="flex-1 py-3.5 rounded-full bg-red-500 text-white font-bold shadow-lg shadow-red-200 hover:bg-red-600">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}