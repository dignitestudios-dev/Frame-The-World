"use client";

import React, { useState } from "react";

interface NotificationItem {
  id: string;
  label: string;
  enabled: boolean;
}

export default function Notifications() {
  const [settings, setSettings] = useState<NotificationItem[]>([
    { id: "1", label: "Picture Saving Alert", enabled: false },
    { id: "2", label: "New Images Alert", enabled: true },
    { id: "4", label: "Subscription Plan", enabled: true },
  ]);

  const toggleSwitch = (id: string) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  return (
    <div className="flex-1 bg-white rounded-[32px] overflow-hidden shadow-sm min-h-[700px]">
      {/* Header */}
      <div className="py-6 border-b border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
      </div>

      <div className="p-6 space-y-6">
        {settings.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between px-8 py-3 rounded-[24px] transition-all duration-300 ${
              item.enabled 
                ? "bg-gradient-to-r from-[#E8F0FF] to-[#F3F7FF] border border-[#D0E0FF]" 
                : "bg-white border border-gray-100 shadow-sm"
            }`}
          >
            <span className={`text-[15px] font-bold ${item.enabled ? "text-gray-800" : "text-gray-500"}`}>
              {item.label}
            </span>

            {/* Custom Toggle Switch */}
            <button
              onClick={() => toggleSwitch(item.id)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                item.enabled ? "bg-[#4F6EF7]" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                  item.enabled ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}

       
      </div>
    </div>
  );
}