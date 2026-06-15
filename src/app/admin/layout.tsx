import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #060410 0%, #0a0814 50%, #060d1f 100%)" }}
    >
      <AdminSidebar />
      <main className="flex-1 md:ml-64 overflow-auto">{children}</main>
    </div>
  );
}
