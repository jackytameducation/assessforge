'use client';

import { HKUMedLogo } from '@/components/HKUMedLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="sticky bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="text-center text-xs text-muted-foreground">
          © {currentYear} LKS Faculty of Medicine, The University of Hong Kong
        </div>
      </div>
    </footer>
  );
}
