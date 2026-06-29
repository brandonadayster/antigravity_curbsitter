import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal | CurbSitter",
  description: "Manage your CurbSitter valet service, access credentials, billing, and view timestamped Proof-of-Work photos.",
};

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-deep-onyx text-foreground font-sans relative overflow-hidden bg-grid">
      {/* Soft Midnight Blue gradient ambient back-drops */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-electric-cyan/5 rounded-full blur-3xl pointer-events-none z-0" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
