'use client';

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ProgressIndicator from "@/components/ProgressIndicator";
import { WorkflowProvider } from "@/contexts/WorkflowContext";
import { HKUMedLogo } from "@/components/HKUMedLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExternalLink, Menu } from "lucide-react";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const closeSidebar = () => {
    setIsAnimating(true);
    setSidebarOpen(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <WorkflowProvider>
      <div className="flex h-screen">
        {/* Mobile sidebar overlay */}
        <div 
          className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
            sidebarOpen || isAnimating ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
              sidebarOpen ? 'bg-opacity-50' : 'bg-opacity-0'
            }`}
            onClick={closeSidebar}
            aria-hidden="true"
          />
          
          {/* Sidebar Container */}
          <div className="absolute inset-y-0 left-0 flex w-64 max-w-sm">
            <div className={`relative flex w-full flex-col transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className="relative flex w-full flex-col shadow-2xl bg-background border-r border-border">
                <Sidebar onClose={closeSidebar} />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
          desktopSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <Sidebar 
            collapsed={desktopSidebarCollapsed} 
            onToggleCollapse={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
          />
        </div>

        <main className="flex-1 overflow-auto flex flex-col">
          {/* Header */}
          <div className="bg-background border-b border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={openSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-foreground">AssessForge</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ThemeToggle />
              <a
                href="https://hku.inspera.com/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Open Inspera</span>
                <span className="sm:hidden">Inspera</span>
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </div>
          </div>
          
          <ProgressIndicator />
          <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            {children}
          </div>
        </main>
      </div>
    </WorkflowProvider>
  );
}
