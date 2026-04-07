import React from "react";
import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 shadow-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/40 mb-4">
          <ShieldX className="text-red-600 dark:text-red-400" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unauthorized</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          You do not have permission to access this page.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;

