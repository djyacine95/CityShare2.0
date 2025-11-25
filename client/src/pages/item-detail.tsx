import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Shield, 
  Star, 
  MessageSquare, 
  Calendar as CalendarIcon,
  Heart,
  ArrowLeft
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Item, User } from "@shared/schema";
import { useState } from "react";

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<{
    pickup?: Date;
    return?: Date;
  }>({});

  const { data: item, isLoading } = useQuery<Item & { owner?: User }>({
    queryKey: ["/api/items", id],
    enabled: !!id,
  });

  const { data: isWishlisted } = useQuery<boolean>({
    queryKey: ["/api/wishlist/check", id],
    enabled: !!id && isAuthenticated,
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        await apiRequest("DELETE", `/api/wishlist/${id}`);
      } else {
        await apiRequest("POST", "/api/wishlist", { itemId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/check", id] });
      toast({
        title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
        description: isWishlisted ? "Item removed from your wishlist" : "You'll be notified when similar items are posted",
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
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDates.pickup || !selectedDates.return) {
        throw new Error("Please select both pickup and return dates");
      }
      await apiRequest("POST", "/api/bookings", {
        itemId: id,
        ownerId: item?.ownerId,
        borrowerId: user?.id,
        pickupDate: selectedDates.pickup.toISOString(),
        returnDate: selectedDates.return.toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking request sent!",
        description: "The owner will be notified. Check your messages for updates.",
      });
      setLocation("/");
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
        description: error.message,
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
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Item not found</p>
        <Button onClick={() => setLocation("/browse")} className="mt-4">
          Back to Browse
        </Button>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.value === item.category);
  const CategoryIcon = category?.icon;
  const ownerInitials = item.owner 
    ? `${item.owner.firstName?.[0] || ''}${item.owner.lastName?.[0] || ''}`.toUpperCase() 
    : 'U';

  const isOwnItem = user?.id === item.ownerId;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/browse")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              {item.images?.[0] ? (
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="h-full w-full object-cover"
                  data-testid="img-item"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                  {CategoryIcon && <CategoryIcon className="h-32 w-32 text-muted-foreground/20" />}
                </div>
              )}
            </div>
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={img} alt={`${item.title} ${idx + 2}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="font-heading text-3xl font-bold" data-testid="text-title">{item.title}</h1>
                {!isOwnItem && (
                  <Button
                    size="icon"
                    variant={isWishlisted ? "destructive" : "outline"}
                    onClick={() => toggleWishlistMutation.mutate()}
                    disabled={toggleWishlistMutation.isPending}
                    data-testid="button-wishlist"
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                )}
              </div>
              {category && (
                <Badge variant="secondary" data-testid="badge-category">
                  {category.label}
                </Badge>
              )}
            </div>

            {/* Status */}
            <Badge 
              variant={item.status === 'available' ? 'default' : 'secondary'}
              className="text-sm"
              data-testid="badge-status"
            >
              {item.status === 'available' ? 'Available' : item.status === 'borrowed' ? 'Currently Borrowed' : 'Pending'}
            </Badge>

            {/* Location */}
            <div className="flex items-center gap-2 text-muted-foreground" data-testid="text-location">
              <MapPin className="h-5 w-5" />
              <span>{item.location}</span>
              {item.distance && <span className="text-sm">• {item.distance.toFixed(1)} miles away</span>}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground" data-testid="text-description">{item.description}</p>
            </div>

            {/* Owner Info */}
            {item.owner && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Owner</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={item.owner.profileImageUrl || undefined} className="object-cover" />
                      <AvatarFallback>{ownerInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium" data-testid="text-owner-name">
                          {item.owner.firstName} {item.owner.lastName}
                        </span>
                        {item.owner.isVerified && (
                          <Badge variant="default" className="text-xs" data-testid="badge-verified">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {item.owner.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          <span>{item.owner.rating.toFixed(1)}</span>
                          <span>({item.owner.totalRatings} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {!isOwnItem && (
                    <Button variant="outline" size="sm" data-testid="button-message-owner">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Booking Calendar */}
            {!isOwnItem && item.status === 'available' && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Select Pickup & Return Dates
                </h3>
                <div className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDates.pickup}
                    onSelect={(date) => setSelectedDates(prev => ({ ...prev, pickup: date }))}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                    data-testid="calendar-pickup"
                  />
                  {selectedDates.pickup && (
                    <Calendar
                      mode="single"
                      selected={selectedDates.return}
                      onSelect={(date) => setSelectedDates(prev => ({ ...prev, return: date }))}
                      disabled={(date) => !selectedDates.pickup || date <= selectedDates.pickup}
                      className="rounded-md border"
                      data-testid="calendar-return"
                    />
                  )}
                  {selectedDates.pickup && selectedDates.return && (
                    <div className="p-4 rounded-lg bg-accent/20 text-sm">
                      <p className="font-medium mb-1">Booking Summary</p>
                      <p className="text-muted-foreground">
                        Pickup: {selectedDates.pickup.toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">
                        Return: {selectedDates.return.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => createBookingMutation.mutate()}
                    disabled={!selectedDates.pickup || !selectedDates.return || createBookingMutation.isPending}
                    data-testid="button-request-booking"
                  >
                    Request to Borrow
                  </Button>
                </div>
              </Card>
            )}

            {isOwnItem && (
              <Card className="p-4 bg-accent/20">
                <p className="text-sm text-muted-foreground">This is your listing</p>
                <Button variant="outline" className="w-full mt-4" data-testid="button-edit-listing">
                  Edit Listing
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
