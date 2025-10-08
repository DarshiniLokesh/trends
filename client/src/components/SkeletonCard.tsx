import React from "react";

export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow animate-pulse">
      <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-xl mb-3" />
      <div className="h-5 bg-gray-300 dark:bg-gray-700 w-3/4 mb-2 rounded" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 w-1/2 rounded" />
    </div>
  );
}
