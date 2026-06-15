import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0a0814 0%, #0d0a1f 50%, #060d1f 100%)" }}
    >
      <Sidebar />
      <main className="md:ml-64 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
