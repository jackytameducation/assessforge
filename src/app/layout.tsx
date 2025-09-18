import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "AssessForge - HKU Medicine",
  description: "Transform educational assessments to QTI 2.1 format for HKU Medical School",
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="qti-transformer-theme"
        >
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
