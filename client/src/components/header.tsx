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
import { Package, Plus, User, Heart, MessageSquare, Leaf, LogOut } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const [location] = useLocation();

  const userInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() 
    : 'U';

  const navItems = [
    { path: "/", label: "Home", testId: "link-home" },
    { path: "/browse", label: "Browse", testId: "link-browse" },
    { path: "/messages", label: "Messages", testId: "link-messages" },
    { path: "/wishlist", label: "Wishlist", testId: "link-wishlist" },
    { path: "/impact", label: "Impact", testId: "link-impact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md" data-testid="link-logo">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-bold">CityShare</span>
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

        <div className="flex items-center gap-3">
          <Button asChild data-testid="button-create-listing">
            <Link href="/items/new">
              <Plus className="h-4 w-4 mr-2" />
              List Item
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-profile-menu">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <a className="flex items-center w-full" data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/wishlist">
                  <a className="flex items-center w-full" data-testid="menu-wishlist">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/messages">
                  <a className="flex items-center w-full" data-testid="menu-messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/impact">
                  <a className="flex items-center w-full" data-testid="menu-impact">
                    <Leaf className="mr-2 h-4 w-4" />
                    Impact Tracker
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api/logout" className="flex items-center w-full" data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
