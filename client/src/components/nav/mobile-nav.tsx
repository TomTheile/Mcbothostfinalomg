import { Link, useLocation } from "wouter";

export default function MobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center p-2 ${
            location === "/" ? "text-primary" : "text-muted-foreground"
          }`}>
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
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/bots">
          <a className={`flex flex-col items-center p-2 ${
            location === "/bots" ? "text-primary" : "text-muted-foreground"
          }`}>
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
            <span className="text-xs mt-1">Bots</span>
          </a>
        </Link>
        
        <Link href="/logs">
          <a className={`flex flex-col items-center p-2 ${
            location === "/logs" ? "text-primary" : "text-muted-foreground"
          }`}>
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
            <span className="text-xs mt-1">Logs</span>
          </a>
        </Link>
        
        <Link href="/settings">
          <a className={`flex flex-col items-center p-2 ${
            location === "/settings" ? "text-primary" : "text-muted-foreground"
          }`}>
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
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
