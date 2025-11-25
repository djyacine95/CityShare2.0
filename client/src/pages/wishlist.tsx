import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Bell, BellOff } from "lucide-react";
import { ItemCard } from "@/components/item-card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Item, User, WishlistItem } from "@shared/schema";

export default function Wishlist() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: wishlistItems, isLoading } = useQuery<(WishlistItem & { item?: Item & { owner?: User } })[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/wishlist/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item removed from your wishlist",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const toggleAlertsMutation = useMutation({
    mutationFn: async ({ itemId, alertsEnabled }: { itemId: string; alertsEnabled: boolean }) => {
      await apiRequest("PATCH", `/api/wishlist/${itemId}`, { alertsEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update alerts",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            Items you want to borrow. You'll be notified when similar items are posted.
          </p>
        </div>

        {wishlistItems && wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((wishlistItem) => {
              if (!wishlistItem.item) return null;
              
              return (
                <div key={wishlistItem.id} className="relative">
                  <ItemCard
                    item={wishlistItem.item}
                    onWishlist={true}
                    onToggleWishlist={() => removeFromWishlistMutation.mutate(wishlistItem.itemId)}
                    onClick={() => window.location.href = `/items/${wishlistItem.itemId}`}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAlertsMutation.mutate({
                        itemId: wishlistItem.itemId,
                        alertsEnabled: !wishlistItem.alertsEnabled
                      })}
                      className="text-xs"
                      data-testid={`button-alerts-${wishlistItem.id}`}
                    >
                      {wishlistItem.alertsEnabled ? (
                        <>
                          <Bell className="h-3.5 w-3.5 mr-1.5" />
                          Alerts On
                        </>
                      ) : (
                        <>
                          <BellOff className="h-3.5 w-3.5 mr-1.5" />
                          Alerts Off
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="p-20 text-center" data-testid="empty-wishlist">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Browse items and add them to your wishlist to get notified when similar items are posted
            </p>
            <Button asChild data-testid="button-browse">
              <a href="/browse">Browse Items</a>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
