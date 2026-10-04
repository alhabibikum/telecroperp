import React from 'react';
import {
  LayoutGrid,
  Smartphone,
  BadgeDollarSign,
  Users2,
  Settings2,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface IOSFloatingDockProps {
  currentView: string;
  onSelectView: (view: string) => void;
}

export const IOSFloatingDock: React.FC<IOSFloatingDockProps> = ({
  currentView,
  onSelectView
}) => {
  const dockItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Layers
    },
    {
      id: 'wholesale-sales',
      label: 'Sales',
      icon: BadgeDollarSign
    },
    {
      id: 'customers',
      label: 'Dealers',
      icon: Users2
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings2
    }
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <nav
        aria-label="Quick Dock Navigation"
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white/90 backdrop-blur-2xl rounded-full sm:rounded-3xl border border-white/80 shadow-[0_12px_36px_rgba(15,23,42,0.12),0_0_0_1px_rgba(0,0,0,0.04)]"
      >
        {dockItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'wholesale-sales' && (currentView === 'wholesale-sales' || currentView === 'retail-pos'));

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center px-3 sm:px-4 py-1.5 rounded-2xl sm:rounded-2xl transition-all duration-200 cursor-pointer min-w-[56px] sm:min-w-[64px] ${
                isActive
                  ? 'text-emerald-600 scale-105 font-black'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 font-semibold'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
