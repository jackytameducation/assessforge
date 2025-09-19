'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HKUMedLogo } from '@/components/HKUMedLogo';
import { useTheme } from '@/components/theme-provider';
import { 
  Upload, 
  FileText, 
  Download, 
  Settings,
  Home,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Preview', href: '/preview', icon: FileText },
  { name: 'Convert', href: '/convert', icon: BookOpen },
  { name: 'Download', href: '/download', icon: Download },
];

interface SidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  // Explicit theme-aware classes
  const sidebarClasses = resolvedTheme === 'dark' 
    ? 'bg-gray-900 border-gray-700' 
    : 'bg-white border-gray-200';

  return (
    <div className={`flex h-full flex-col border-e overflow-hidden ${sidebarClasses}`}>
      <div className={`py-4 sm:py-6 overflow-y-auto flex-1 transition-all duration-300 ${
        collapsed ? 'px-2' : 'px-4'
      } ${sidebarClasses}`}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className={`flex items-center gap-2 flex-1 min-w-0 ${collapsed ? 'justify-center' : ''}`}>
            {collapsed ? (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            ) : (
              <HKUMedLogo className="h-6 sm:h-8 w-auto object-contain max-w-[140px] sm:max-w-[180px]" />
            )}
          </div>
          
          {/* Desktop collapse button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:block p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                resolvedTheme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
          
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors lg:hidden flex-shrink-0 ${
                resolvedTheme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => onClose && onClose()}
                  className={`block rounded-lg transition-colors touch-manipulation ${
                    collapsed 
                      ? 'p-2 mx-auto w-fit' 
                      : 'px-3 sm:px-4 py-2.5 sm:py-3'
                  } ${
                    isActive
                      ? resolvedTheme === 'dark'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                      : resolvedTheme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <div className={`flex items-center ${
                    collapsed ? 'justify-center' : 'gap-2.5 sm:gap-3'
                  }`}>
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm sm:text-base">{item.name}</span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Collapsed Progress Indicator */}
        {collapsed && (
          <div className="mt-auto mb-4">
            <div className={`text-xs text-center mb-2 ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>Progress</div>
            <div className="flex flex-col items-center gap-2">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href;
                const currentIndex = navigation.findIndex(nav => nav.href === pathname);
                const isCompleted = currentIndex > index && currentIndex !== -1;
                return (
                  <div
                    key={item.href}
                    className={`w-3 h-3 rounded-full transition-colors border-2 ${
                      isActive 
                        ? 'bg-blue-500 border-blue-500' 
                        : isCompleted 
                        ? 'bg-green-500 border-green-500' 
                        : resolvedTheme === 'dark'
                        ? 'bg-transparent border-gray-600'
                        : 'bg-transparent border-gray-300'
                    }`}
                    title={item.name}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
