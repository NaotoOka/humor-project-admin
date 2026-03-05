import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="mb-6">
          <span className="text-6xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access this admin portal. Only
          superadmins are allowed.
        </p>
        {user && (
          <p className="text-sm text-gray-500 mb-6">
            Signed in as: {user.email}
          </p>
        )}
        <LogoutButton />
      </div>
    </div>
  );
}
