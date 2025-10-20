import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, LogOut, Sun, Moon } from "lucide-react";
import { logger } from "@/lib/logger";

export const Header = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore();

  const handleLogout = () => {
    logout();
    logger.info("User logged out");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Restaurant Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
        )}

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
