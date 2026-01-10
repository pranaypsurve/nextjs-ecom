import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole={Role.ADMIN}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

