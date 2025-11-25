import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Package, Plus, Heart, MessageSquare, TrendingUp, Leaf } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Item, User, ImpactStats } from "@shared/schema";
import { ItemCard } from "@/components/item-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user } = useAuth();
  
  const { data: recentItems, isLoading: itemsLoading } = useQuery<(Item & { owner?: User })[]>({
    queryKey: ["/api/items/recent"],
  });

  const { data: impactStats } = useQuery<ImpactStats>({
    queryKey: ["/api/impact/stats"],
  });

  const userInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() 
    : 'U';

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback className="text-lg font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-3xl font-bold">
                Welcome back, {user?.firstName || 'there'}!
              </h1>
              <p className="text-muted-foreground">
                {user?.location || 'Your neighborhood'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild data-testid="button-create-listing">
              <Link href="/items/new">
                <Plus className="h-4 w-4 mr-2" />
                List an Item
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4" data-testid="stat-listed">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{user?.itemsListed || 0}</p>
                <p className="text-xs text-muted-foreground">Items Listed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4" data-testid="stat-borrowed">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{user?.itemsBorrowed || 0}</p>
                <p className="text-xs text-muted-foreground">Items Borrowed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4" data-testid="stat-impact">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{impactStats?.co2Saved?.toFixed(1) || 0}</p>
                <p className="text-xs text-muted-foreground">kg CO₂ Saved</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <Button variant="outline" className="w-full h-full" asChild data-testid="button-messages">
              <Link href="/messages">
                <MessageSquare className="h-5 w-5 mr-2" />
                Messages
              </Link>
            </Button>
          </Card>
        </div>

        {/* Recent Items */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-semibold">Recently Shared Nearby</h2>
            <Button variant="outline" asChild data-testid="button-browse-all">
              <Link href="/browse">Browse All</Link>
            </Button>
          </div>

          {itemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (recentItems && recentItems.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.slice(0, 6).map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => window.location.href = `/items/${item.id}`}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center" data-testid="empty-state">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No items shared yet in your area</p>
              <Button asChild data-testid="button-list-first">
                <Link href="/items/new">List the First Item</Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 hover-elevate cursor-pointer" asChild>
            <Link href="/wishlist" data-testid="card-wishlist">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                  <Heart className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Wishlist</h3>
                  <p className="text-sm text-muted-foreground">Items you want to borrow</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover-elevate cursor-pointer" asChild>
            <Link href="/profile" data-testid="card-profile">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold mb-1">Profile</h3>
                  <p className="text-sm text-muted-foreground">View and edit your profile</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover-elevate cursor-pointer" asChild>
            <Link href="/impact" data-testid="card-impact">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Impact Tracker</h3>
                  <p className="text-sm text-muted-foreground">See your eco contribution</p>
                </div>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
