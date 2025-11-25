import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  Star, 
  Package, 
  TrendingUp, 
  MapPin,
  Mail,
  Calendar
} from "lucide-react";
import type { Item, Rating, User } from "@shared/schema";
import { ItemCard } from "@/components/item-card";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: userItems, isLoading: itemsLoading } = useQuery<(Item & { owner?: User })[]>({
    queryKey: ["/api/items/my-items"],
    enabled: isAuthenticated,
  });

  const { data: ratings, isLoading: ratingsLoading } = useQuery<(Rating & { rater?: User })[]>({
    queryKey: ["/api/ratings/user", user?.id],
    enabled: !!user?.id,
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

  if (authLoading || !user) {
    return (
      <div className="container py-8">
        <Skeleton className="h-64 w-full rounded-lg mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Cover and Avatar Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/20 h-48 relative">
        <div className="container h-full flex items-end">
          <div className="relative pb-6 flex items-end gap-6">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback className="text-3xl font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-heading text-3xl font-bold" data-testid="text-user-name">
                  {user.firstName} {user.lastName}
                </h1>
                {user.isVerified && (
                  <Badge variant="default" data-testid="badge-verified">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              {user.rating > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium" data-testid="text-rating">{user.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm">({user.totalRatings} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4" data-testid="stat-listed">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{user.itemsListed}</p>
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
                <p className="text-2xl font-bold font-heading">{user.itemsBorrowed}</p>
                <p className="text-xs text-muted-foreground">Items Borrowed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4" data-testid="stat-rating">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{user.rating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <Button variant="outline" className="w-full h-full" data-testid="button-edit-profile">
              Edit Profile
            </Button>
          </Card>
        </div>

        {/* About Section */}
        <Card className="p-6 mb-8">
          <h2 className="font-heading text-xl font-semibold mb-4">About</h2>
          <div className="space-y-3 text-sm">
            {user.bio && (
              <p className="text-muted-foreground" data-testid="text-bio">{user.bio}</p>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span data-testid="text-location">{user.location || 'Location not set'}</span>
            </div>
            {user.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span data-testid="text-email">{user.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="listings" data-testid="tab-listings">My Listings</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            {itemsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : userItems && userItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => window.location.href = `/items/${item.id}`}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center" data-testid="empty-listings">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No items listed yet</p>
                <Button asChild>
                  <a href="/items/new">List Your First Item</a>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {ratingsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : ratings && ratings.length > 0 ? (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <Card key={rating.id} className="p-4" data-testid={`review-${rating.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {rating.rater && (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={rating.rater.profileImageUrl || undefined} className="object-cover" />
                            <AvatarFallback>
                              {`${rating.rater.firstName?.[0] || ''}${rating.rater.lastName?.[0] || ''}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <p className="font-medium">
                            {rating.rater?.firstName || 'User'} {rating.rater?.lastName || ''}
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3.5 w-3.5 ${i < rating.rating ? 'fill-primary text-primary' : 'text-muted'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(rating.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.review && (
                      <p className="text-sm text-muted-foreground">{rating.review}</p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center" data-testid="empty-reviews">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reviews yet</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
