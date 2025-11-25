import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ItemCard } from "@/components/item-card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import type { Item, User } from "@shared/schema";

export default function Browse() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState([10]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: items, isLoading } = useQuery<(Item & { owner?: User })[]>({
    queryKey: ["/api/items", { search: searchQuery, category, maxDistance: maxDistance[0], verifiedOnly }],
  });

  const filteredItems = items || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">Browse Items</h1>
          <p className="text-muted-foreground">Discover what your community is sharing</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-filters"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {showFilters && <X className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-3 gap-6 p-6 rounded-lg border bg-card" data-testid="filter-panel">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Distance: {maxDistance[0]} miles</Label>
                <Slider
                  value={maxDistance}
                  onValueChange={setMaxDistance}
                  max={50}
                  min={1}
                  step={1}
                  className="pt-2"
                  data-testid="slider-distance"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="verified"
                  checked={verifiedOnly}
                  onCheckedChange={setVerifiedOnly}
                  data-testid="switch-verified"
                />
                <Label htmlFor="verified" className="cursor-pointer">
                  Verified owners only
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-state">
            <p className="text-lg text-muted-foreground mb-4">No items found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => setLocation(`/items/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
