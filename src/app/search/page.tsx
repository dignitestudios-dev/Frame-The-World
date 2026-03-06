"use client";

import Image from "next/image";
import { Search, X, Filter, Clock, ChevronRight } from "lucide-react";
import { useState } from "react";
import Header from "@/components/global/header";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const recentSearches = ["Paris", "London", "Culture"];

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Search title */}
      <Header title="Search" subtitle="" />

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Search Input Area */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
            )}
          </div>
          {/* Filter button */}
          <button className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md flex items-center justify-center hover:shadow-lg transition-shadow flex-shrink-0">
            <Filter className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Recent Searches Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent</h2>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(search)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{search}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-blue-600" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

