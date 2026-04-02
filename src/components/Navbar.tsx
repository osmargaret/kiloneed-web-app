import { Search, ShoppingBag, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="font-heading text-2xl font-bold text-primary">
          Kiloneed
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Browse
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Categories
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden text-muted-foreground md:inline-flex">
            <User className="h-5 w-5" />
          </Button>
          <Button size="sm" className="hidden md:inline-flex">
            Start Selling
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t bg-card px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">Browse</a>
            <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">Categories</a>
            <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">How It Works</a>
            <Button size="sm" className="mt-1 w-full">Start Selling</Button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
