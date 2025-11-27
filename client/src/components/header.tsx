import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, Plus, User, Heart, MessageSquare, Leaf, LogOut, Search } from "lucide-react"; // Added Search icon
import { Input } from "@/components/ui/input"; // Added Input for search
import { useState } from "react";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchValue, setSearchValue] = useState("");

  // FIX: Smarter initials logic
  // 1. Try First Name + Last Name
  // 2. If missing, use the first letter of Username
  // 3. Fallback to 'U'
  const userInitials = (() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase(); // Takes first 2 letters of username
    }
    return 'U';
  })();

  const handleLogout = () => {
    logoutMutation.mutate();
    setTimeout(() => setLocation("/"), 100);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setLocation(`/browse?search=${encodeURIComponent(searchValue)}`);
    }
  };

  const navItems = [
    { path: "/", label: "Home", testId: "link-home" },
    { path: "/browse", label: "Browse", testId: "link-browse" },
    { path: "/messages", label: "Messages", testId: "link-messages" },
    { path: "/wishlist", label: "Wishlist", testId: "link-wishlist" },
    { path: "/impact", label: "Impact", testId: "link-impact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        
        {/* LEFT: Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md" data-testid="link-logo">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-bold hidden sm:inline">CityShare</span>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                    location === item.path
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={item.testId}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>

        {/* MIDDLE: Search Bar (Added back based on previous request) */}
        <div className="flex-1 max-w-sm hidden lg:block">
           <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search items..." 
              className="w-full pl-9 h-9"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          <Button asChild data-testid="button-create-listing" size="sm" className="hidden sm:flex">
            <Link href="/items/new">
              <Plus className="h-4 w-4 mr-2" />
              List Item
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 border border-border" data-testid="button-profile-menu">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                  {/* Shows 'YA' (for Yacine) if username is set */}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.location || "No location set"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <a className="flex items-center w-full cursor-pointer" data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/wishlist">
                  <a className="flex items-center w-full cursor-pointer" data-testid="menu-wishlist">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/messages">
                  <a className="flex items-center w-full cursor-pointer" data-testid="menu-messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/impact">
                  <a className="flex items-center w-full cursor-pointer" data-testid="menu-impact">
                    <Leaf className="mr-2 h-4 w-4" />
                    Impact Tracker
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-600 focus:text-red-600 cursor-pointer" 
                data-testid="menu-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}