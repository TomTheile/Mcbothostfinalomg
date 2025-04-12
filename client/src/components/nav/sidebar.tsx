import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Moon, Sun } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();

  // Format username for avatar
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2" />
              <path d="M14 5h6a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8.5" />
              <path d="M4 14h.01" />
              <path d="M4 18h.01" />
              <path d="M8 17h4" />
              <path d="M11 14h1" />
              <path d="M18 12v8" />
              <path d="M9 18v2" />
              <path d="M12 18v2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-primary">MinecraftBot</h1>
        </div>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          <li>
            <Link href="/">
              <a
                className={`flex items-center space-x-3 px-4 py-2 rounded-md ${
                  location === "/" 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
                <span>Dashboard</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/bots">
              <a
                className={`flex items-center space-x-3 px-4 py-2 rounded-md ${
                  location === "/bots" 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2" />
                  <path d="M14 5h6a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8.5" />
                  <path d="M4 14h.01" />
                  <path d="M4 18h.01" />
                  <path d="M8 17h4" />
                  <path d="M11 14h1" />
                  <path d="M18 12v8" />
                  <path d="M9 18v2" />
                  <path d="M12 18v2" />
                </svg>
                <span>My Bots</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/logs">
              <a
                className={`flex items-center space-x-3 px-4 py-2 rounded-md ${
                  location === "/logs" 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                  <path d="M9 22h6" />
                  <path d="M16 5h2" />
                  <path d="M19 17v5" />
                  <path d="M15 19h8" />
                </svg>
                <span>Logs</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <a
                className={`flex items-center space-x-3 px-4 py-2 rounded-md ${
                  location === "/settings" 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Settings</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Dark Mode</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user && getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.username}</p>
            <Button
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
              onClick={() => logoutMutation.mutate()}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
