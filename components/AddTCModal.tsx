"use client";

import React from "react";

type AddTCModalProps = {
  neededTC: number;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AddTCModal({ neededTC, onClose, onConfirm }: AddTCModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a2e] border border-purple-400/40 rounded-2xl p-6 w-[90%] max-w-md shadow-2xl text-white">
        <h2 className="text-lg font-orbitron font-bold mb-4">
          Insufficient Balance
        </h2>
        <p className="mb-4 text-sm text-gray-300">
          You need <span className="text-yellow-400 font-bold">{neededTC} TC</span> more 
          to join this match.  
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-bold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
          >
            Add TC
          </button>
        </div>
      </div>
    </div>
  );
}
