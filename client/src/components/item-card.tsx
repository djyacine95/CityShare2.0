import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Heart, Star } from "lucide-react";
import type { Item, User } from "@shared/schema";
import { CATEGORIES } from "@/lib/categories";

interface ItemCardProps {
  item: Item & { owner?: User };
  onWishlist?: boolean;
  onToggleWishlist?: () => void;
  onClick?: () => void;
}

export function ItemCard({ item, onWishlist, onToggleWishlist, onClick }: ItemCardProps) {
  const category = CATEGORIES.find(c => c.value === item.category);
  const CategoryIcon = category?.icon;
  const imageUrl = item.images?.[0];
  const ownerInitials = item.owner 
    ? `${item.owner.firstName?.[0] || ''}${item.owner.lastName?.[0] || ''}`.toUpperCase() 
    : 'U';

  return (
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group relative"
      onClick={onClick}
      data-testid={`card-item-${item.id}`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
            {CategoryIcon && <CategoryIcon className="h-16 w-16 text-muted-foreground/20" />}
          </div>
        )}
        
        {/* Wishlist button */}
        <Button
          size="icon"
          variant="secondary"
          className={`absolute top-2 right-2 h-9 w-9 rounded-full shadow-md ${onWishlist ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.();
          }}
          data-testid={`button-wishlist-${item.id}`}
        >
          <Heart className={`h-4 w-4 ${onWishlist ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Category */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1" data-testid={`text-title-${item.id}`}>
              {item.title}
            </h3>
          </div>
          {category && (
            <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${item.id}`}>
              {category.label}
            </Badge>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid={`text-location-${item.id}`}>
          <MapPin className="h-4 w-4" />
          <span>{item.location}</span>
          {item.distance && <span className="text-xs">• {item.distance.toFixed(1)} mi away</span>}
        </div>

        {/* Owner info */}
        {item.owner && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={item.owner.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback className="text-xs">{ownerInitials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{item.owner.firstName || 'User'}</span>
            </div>
            {item.owner.rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="font-medium">{item.owner.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <Badge 
          variant={item.status === 'available' ? 'default' : 'secondary'}
          className="w-full justify-center"
          data-testid={`badge-status-${item.id}`}
        >
          {item.status === 'available' ? 'Available' : item.status === 'borrowed' ? 'Borrowed' : 'Pending'}
        </Badge>
      </div>
    </Card>
  );
}
