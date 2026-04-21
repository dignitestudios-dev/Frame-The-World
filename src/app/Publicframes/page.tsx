"use client";

import Image from "next/image";

export default function ProfilePage() {
  const stats = [
    { value: "350", label: "Upvotes" },
    { value: "32", label: "Framed" },
    { value: "64", label: "Posts" },
    { value: "64", label: "Frames" },
  ];

  const badges = [
    { id: 1, type: "bronze", locked: false },
    { id: 2, type: "bronze", locked: false },
    { id: 3, type: "bronze", locked: false },
    { id: 4, type: "lock", locked: true },
    { id: 5, type: "lock", locked: true },
    { id: 6, type: "lock", locked: true },
    { id: 7, type: "lock", locked: true },
    { id: 8, type: "lock", locked: true },
    { id: 9, type: "info", locked: true },
  ];

  return (
    <div className="">

    

        {/* Profile Info */}
        <div className="px-6 pt-16 pb-6 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">Leo Denzin</h1>
          <p className="text-sm text-gray-600 leading-relaxed px-4 mb-4">
            Lorem ipsum dolor sit amet consectetur. Dis malesuada mauris
            pellentesque eget tellus ut massa.
          </p>

          {/* Travel Info */}
          <div className="mb-6">
            <p className="text-base font-semibold text-black">Travel Mania</p>
            <p className="text-sm text-gray-500">Miami, FL</p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-[#5b8fd9]">{stat.value}</p>
                <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="px-6 pb-8">
          <h2 className="text-xl font-bold text-black mb-6">Achievements</h2>
          
          {/* Badges Grid */}
          <div className="grid grid-cols-4 gap-4">
           
                
          
          </div>
        </div>
      </div>
   
                
  );
}

