import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pydantic Agent Benchmark',
  description: 'Benchmark schema-constrained agent loops and visualize results.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
