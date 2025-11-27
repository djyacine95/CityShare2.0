import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, TrendingUp, Leaf, MessageSquare, Heart, User, Trash2, Loader2 } from "lucide-react";
import type { Item } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. FETCH ITEMS
  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ["/api/items/recent"],
    queryFn: async () => {
      const res = await fetch("/api/items/recent");
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    staleTime: 0, 
    refetchOnMount: true,
  });

  // 2. DELETE LOGIC
  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items/my-items"] });
      toast({ title: "Item deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleDelete = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(itemId);
    }
  };

  // Fallback for broken images only
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1581539250439-c92302dae3b9?w=800&auto=format&fit=crop&q=60";
    e.currentTarget.onerror = null;
  };

  const itemsListedCount = user?.itemsListed || 0;
  const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Welcome Section */}
      <section className="bg-white border-b py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-gray-100">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback className="bg-gray-200 text-xl font-bold text-gray-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-heading text-3xl font-bold">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {user?.location || "Your Neighborhood"}
                </p>
              </div>
            </div>
            <Link href="/items/new">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
                <Package className="h-4 w-4" />
                List an Item
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{itemsListedCount}</div>
                  <div className="text-sm text-muted-foreground">Items Listed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{user?.itemsBorrowed || 0}</div>
                  <div className="text-sm text-muted-foreground">Items Borrowed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{user?.co2Saved || "0.0"}</div>
                  <div className="text-sm text-muted-foreground">kg CO₂ Saved</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feed Section */}
      <section className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold">Recently Shared Nearby</h2>
          <Link href="/browse">
            <Button variant="outline" size="sm">Browse All</Button>
          </Link>
        </div>

        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              return (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full border-gray-200 flex flex-col group relative">
                    
                    {/* DELETE BUTTON */}
                    {user?.id === item.ownerId && (
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute top-2 right-2 z-50 h-8 w-8 rounded-full shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDelete(e, item.id)}
                        disabled={deleteMutation.isPending}
                        title="Delete Item"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    <div className="aspect-[4/3] bg-gray-100 relative">
                      {/* IMAGE LOGIC: Direct display like Profile page */}
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                          <Package className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="mb-2 text-xs font-normal">
                          {item.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold line-clamp-1">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-grow">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </p>
                      <div className="mt-4 flex items-center gap-2 pt-3 border-t">
                         <Avatar className="h-5 w-5">
                           <AvatarFallback className="text-[9px] bg-gray-200">U</AvatarFallback>
                         </Avatar>
                         <span className="text-xs text-muted-foreground">Neighbor</span>
                      </div>
                    </CardContent>
                    <div className="bg-green-600 text-white text-center py-2 text-xs font-bold uppercase tracking-wider">
                      {item.status || "Available"}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <div className="flex justify-center mb-4">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-medium mb-2">No items shared yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to list an item in your area!
            </p>
            <Link href="/items/new">
              <Button className="bg-green-600 hover:bg-green-700 text-white">List the First Item</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Bottom Navigation Cards */}
      <section className="container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/wishlist">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Heart className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Wishlist</h3>
                  <p className="text-sm text-gray-500">Items you want to borrow</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/profile">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Profile</h3>
                  <p className="text-sm text-gray-500">View and edit your profile</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/impact">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Impact Tracker</h3>
                  <p className="text-sm text-gray-500">See your eco contribution</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}