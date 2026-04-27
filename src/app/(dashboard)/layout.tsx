import { getSession, logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-blue-600">DocFlow</h1>
            <nav className="hidden md:flex gap-6">
              {user.role === "EMPLOYEE" ? (
                <Link 
                  href="/my-documents" 
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Мои документы
                </Link>
              ) : (
                <>
                  <Link 
                    href="/inbox" 
                    className="text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Входящие
                  </Link>
                  <Link 
                    href="/my-documents" 
                    className="text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Все документы
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role === "MANAGER" ? "Руководитель" : "Сотрудник"}</p>
            </div>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                Выйти
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
