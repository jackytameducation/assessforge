'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  const currentThemeIndex = themes.findIndex((t) => t.value === theme);
  const nextTheme = themes[(currentThemeIndex + 1) % themes.length];

  const CurrentIcon = themes.find((t) => t.value === theme)?.icon || Monitor;

  return (
    <button
      onClick={() => setTheme(nextTheme.value)}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:hover:bg-gray-900 transition-colors"
      title={`Switch to ${nextTheme.label} mode`}
    >
      <CurrentIcon className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
