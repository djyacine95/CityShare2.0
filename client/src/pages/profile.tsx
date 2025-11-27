import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter"; // <--- FIX: Added 'Link' back here
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, TrendingUp, Star, Calendar, Settings, Trash2, Loader2 } from "lucide-react";
import type { Item } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // 1. FETCH ITEMS
  const { data: myItems, isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/items/my-items"],
    queryFn: async () => {
      const res = await fetch("/api/items/my-items");
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
      queryClient.invalidateQueries({ queryKey: ["/api/items/my-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items/recent"] });
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

  const handleCardClick = (itemId: string) => {
    setLocation(`/items/${itemId}`);
  };

  const handleDelete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(itemId);
    }
  };

  // 3. SAFETY CHECKS
  if (authLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.username 
    ? user.username.substring(0, 2).toUpperCase() 
    : "U";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
              <AvatarImage src={user.profileImageUrl || ""} />
              <AvatarFallback className="text-2xl bg-gray-200">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading text-3xl font-bold">{user.username}</h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    {user.location || "Location not set"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Content */}
      <div className="container py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">{myItems?.length || user.itemsListed || 0}</div>
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
                <div className="text-2xl font-bold">{user.itemsBorrowed || 0}</div>
                <div className="text-sm text-muted-foreground">Items Borrowed</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{user.rating || "0.0"}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">My Listings</h2>
          </div>

          {myItems && myItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {myItems.map((item) => (
                <div key={item.id} className="h-full">
                  <Card 
                    className="overflow-hidden hover:shadow-md transition-all cursor-pointer group h-full flex flex-col relative"
                    onClick={() => handleCardClick(item.id)}
                  >
                    <div className="aspect-[4/3] bg-gray-100 relative">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                          <Package className="h-12 w-12" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2">
                         <Badge variant="secondary" className="bg-white/90 hover:bg-white text-xs font-normal">
                           {item.category}
                         </Badge>
                      </div>
                    </div>

                    <CardHeader className="p-3 pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-semibold line-clamp-1 pt-1">
                          {item.title}
                        </CardTitle>
                        
                        {/* DELETE BUTTON */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 -mt-1 -mr-2"
                          onClick={(e) => handleDelete(e, item.id)}
                          title="Delete this item"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>

                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-3 pt-1 flex-grow">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-2 pt-3 border-t">
                         <Avatar className="h-5 w-5">
                           <AvatarFallback className="text-[9px] bg-gray-200">
                             {initials}
                           </AvatarFallback>
                         </Avatar>
                         <span className="text-xs text-muted-foreground">{user.username}</span>
                      </div>
                    </CardContent>

                    <div className="bg-green-600 text-white text-center py-1.5 text-xs font-medium uppercase tracking-wide">
                      {item.status || "Available"}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-dashed">
              <div className="flex justify-center mb-4">
                <Package className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-medium mb-2">No items listed yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't listed anything to share.
              </p>
              <Link href="/items/new">
                <Button>List Your First Item</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}