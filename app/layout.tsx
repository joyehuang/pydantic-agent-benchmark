import './globals.css';
import type { Metadata } from 'next';
import { Geist, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMonoHeading = JetBrains_Mono({subsets:['latin'],variable:'--font-heading'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Pydantic Agent Benchmark',
  description: 'Benchmark schema-constrained agent loops and visualize results.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, jetbrainsMonoHeading.variable)}>
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
