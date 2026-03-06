"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Hash, Plus, Bookmark, Contact2, Lock } from "lucide-react";
import Image from "next/image";

type ModalState = "menu" | "frames" | "storage" | "success_frame" | "success_storage";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveModal = ({ isOpen, onClose }: SaveModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ModalState>("menu");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) setView("menu");
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const frames = [
    { id: 1, title: "Paris Diaries", img: "https://picsum.photos/id/101/100", locked: false },
    { id: 2, title: "London Visit", img: "https://picsum.photos/id/102/100", locked: true },
    { id: 3, title: "Amalfi Coast", img: "https://picsum.photos/id/103/100", locked: false },
    { id: 4, title: "Amazon", img: "https://picsum.photos/id/104/100", locked: true },
  ];

  const privateFolders = [
    { id: 1, title: "Private 1", img: "https://picsum.photos/id/105/100" },
    { id: 2, title: "Private 2", img: "https://picsum.photos/id/106/100" },
    { id: 3, title: "Private 3", img: "https://picsum.photos/id/107/100" },
    { id: 4, title: "Private 4", img: "https://picsum.photos/id/108/100" },
  ];

  const renderHeader = (title: string, showBack = true) => (
    <div className="relative h-28 flex items-end justify-center pb-6 bg-blue-100">
      {showBack && (
        <button 
          onClick={() => setView("menu")}
          className="absolute left-6 bottom-6 p-1 hover:bg-black/5 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}
      <h2 className="text-[22px] font-semibold text-gray-800">{title}</h2>
    </div>
  );

  const ListItem = ({ title, img, locked, onClick }: any) => (
    <button 
      onClick={onClick}
      className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12">
          {/* Stacked background effect */}
          <div className="absolute inset-0 bg-gray-200 rounded-lg translate-x-1 -translate-y-1 rotate-2" />
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white shadow-sm">
            <img src={img} alt={title} className="w-full h-full object-cover" />
          </div>
        </div>
        <span className="text-[15px] font-bold text-gray-800">{title}</span>
      </div>
      {locked && <span className="text-xl">🔒</span>}
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[380px] h-auto bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* VIEW: MAIN MENU */}
        {view === "menu" && (
          <div className="pb-8">
            {renderHeader("Save To", false)}
            <div className="px-4 space-y-2">
              <button onClick={() => setView("frames")} className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 rounded-2xl group transition-all">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Hash className="w-6 h-6" /></div>
                <div className="text-left"><p className="font-bold text-gray-900 leading-tight">Save to Frames</p><p className="text-xs text-gray-400">Shared with everyone.</p></div>
              </button>
              <button className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 rounded-2xl group transition-all">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Plus className="w-6 h-6" /></div>
                <div className="text-left"><p className="font-bold text-gray-900 leading-tight">Create New Frame & Add</p><p className="text-xs text-gray-400">Start a new frame for this memory.</p></div>
              </button>
              <button onClick={() => setView("storage")} className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 rounded-2xl group transition-all">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Contact2 className="w-6 h-6" /></div>
                <div className="text-left"><p className="font-bold text-gray-900 leading-tight">Save to Personal Storage</p><p className="text-xs text-gray-400">Save before posting.</p></div>
              </button>
            </div>
          </div>
        )}

        {/* VIEW: FRAMES LIST */}
        {view === "frames" && (
          <div className="pb-6">
            {renderHeader("Frames")}
            <div className="max-h-[500px] overflow-y-auto ">
              {frames.map(f => <ListItem key={f.id} {...f} onClick={() => setView("success_frame")} />)}
            </div>
          </div>
        )}

        {/* VIEW: STORAGE LIST */}
        {view === "storage" && (
          <div className="pb-6">
            {renderHeader("Private Storage Folders")}
            <div className="max-h-[500px] overflow-y-auto">
              {privateFolders.map(f => <ListItem key={f.id} {...f} onClick={() => setView("success_storage")} />)}
            </div>
          </div>
        )}

        {/* VIEW: SUCCESS STATES */}
       {(view === "success_frame" || view === "success_storage") && (
  <div className="pb-6">
    <div className="h-30 bg-blue-100 flex items-center justify-center">
      <div className="w-20 h-20 rounded-full bg-[#96AFFF] border-4 border-white shadow-lg flex items-center justify-center text-white">
        <Bookmark className="w-10 h-10 fill-current" />
      </div>
    </div>
    <div className="text-center px-8 space-y-2 mt-4">
      <h2 className="text-3xl font-bold text-gray-900">Successfully Saved</h2>
      <p className="text-gray-400 text-sm leading-relaxed">
        {view === "success_frame" 
          ? "Picture has been successfully saved to the ABC frame" 
          : "Your picture has been successfully saved to the Personal Storage"}
      </p>
    </div>
  </div>
)}

      </div>
    </div>,
    document.body
  );
};

export default SaveModal;