import React from 'react';
import Image from 'next/image';

export function HKUMedLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center">
      <Image
        src="/HKU_LKS Faculty of Medicine_Master Full Logo_Black.png"
        alt="HKU LKS Faculty of Medicine"
        width={200}
        height={60}
        className={className}
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  );
}
