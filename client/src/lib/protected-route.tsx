import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Nutze try-catch, um den Fehler zu umgehen, wenn AuthProvider nicht gefunden wird
  try {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <Route path={path}>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Route>
      );
    }

    if (!user) {
      return (
        <Route path={path}>
          <Redirect to="/auth" />
        </Route>
      );
    }

    return <Route path={path} component={Component} />;
  } catch (error) {
    // Fallback, wenn AuthProvider nicht verfügbar ist
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
}
