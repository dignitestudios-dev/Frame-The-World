import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function UpgradePlan({ onBack }: { onBack: () => void }) {
  const plans = [
    {
      name: "Monthly",
      price: "49.99",
      period: "/mo",
      active: true,
    },
    {
      name: "Annual",
      price: "499.99",
      period: "/year",
      active: false,
    },
  ];

  return (
    <div className="flex-1 bg-white rounded-[32px] overflow-hidden shadow-sm min-h-[700px]">
      {/* Header with Back Arrow */}
      <div className="relative py-6 border-b border-gray-100">
        <button 
          onClick={onBack}
          className="absolute left-8 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-black" />
        </button>
        <h2 className="text-center text-xl font-bold text-gray-800">Upgrade Plan</h2>
      </div>

      <div className="p-10">
        <p className="text-center text-gray-400 mb-10 font-medium">
          Choose your new subscription plan!
        </p>

        <div className="flex gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`flex-1 rounded-[24px] p-8 flex flex-col items-center transition-all cursor-pointer hover:shadow-md
                ${plan.active 
                  ? "border-2 border-[#4F6EF7] bg-[#E8F0FF]" 
                  : "bg-[#F0F4FF] border-2 border-transparent"
                }`}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">{plan.name}</h3>
              
              <div className="flex items-baseline mb-8">
                <span className="text-2xl font-bold mr-1">$</span>
                <span className="text-5xl font-black">{plan.price}</span>
                <span className="text-gray-400 font-medium ml-1">{plan.period}</span>
              </div>

              <div className="space-y-4 w-full px-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 
                      className="h-5 w-5 text-[#4F6EF7]" 
                      fill="currentColor" 
                      stroke="white" 
                    />
                    <span className="text-sm font-medium">Lorem ipsum dolor sit amet</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}