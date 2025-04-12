import Sidebar from "@/components/nav/sidebar";
import MobileNav from "@/components/nav/mobile-nav";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6 pb-20 md:pb-6">
        {children}
      </main>
      
      <MobileNav />
    </div>
  );
}
