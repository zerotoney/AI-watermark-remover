import React from 'react';
import { Key, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Header: React.FC<HeaderProps> = ({ apiKey, setApiKey }) => {
  return (
    <header className="w-full border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-brand-500 to-indigo-600 p-2 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            WatermarkRemover AI
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className={`h-4 w-4 ${apiKey ? 'text-brand-500' : 'text-gray-500'}`} />
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Gemini API Key"
              className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-full focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 p-2.5 transition-all w-64 placeholder-gray-500 focus:w-80"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity">
              <span className="text-xs text-gray-500">Your key is never stored</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;