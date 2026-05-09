import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
              L
            </div>
            <span className="font-semibold tracking-tight">LeadFlow</span>
            <span className="ml-2 rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">
              Admin
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="mr-1 h-4 w-4" /> Leads
              </Button>
            </Link>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
