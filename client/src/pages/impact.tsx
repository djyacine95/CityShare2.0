import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Package, Scale, TrendingUp, Trees } from "lucide-react";
import type { ImpactStats } from "@shared/schema";
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Impact() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: impactStats, isLoading } = useQuery<ImpactStats>({
    queryKey: ["/api/impact/stats"],
    enabled: isAuthenticated,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const stats = impactStats || { itemsReused: 0, co2Saved: 0, wastePrevented: 0 };
  
  // Calculate tree equivalents (1 tree absorbs ~21kg CO2/year)
  const treeEquivalent = (stats.co2Saved / 21).toFixed(1);
  
  // Mock historical data for the chart
  const historicalData = [
    { month: 'Jan', co2: 0 },
    { month: 'Feb', co2: stats.co2Saved * 0.2 },
    { month: 'Mar', co2: stats.co2Saved * 0.4 },
    { month: 'Apr', co2: stats.co2Saved * 0.6 },
    { month: 'May', co2: stats.co2Saved * 0.8 },
    { month: 'Jun', co2: stats.co2Saved },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">Environmental Impact</h1>
          <p className="text-muted-foreground">
            Track your positive contribution to sustainability
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5" data-testid="stat-items-reused">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-4xl font-bold font-heading mb-1">{stats.itemsReused}</p>
              <p className="text-sm text-muted-foreground">Items Reused</p>
              <p className="text-xs text-muted-foreground mt-2">
                Through sharing and borrowing
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-1/5" data-testid="stat-co2-saved">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-chart-1/20 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-chart-1" />
              </div>
              <Trees className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="text-4xl font-bold font-heading mb-1">{stats.co2Saved.toFixed(1)} kg</p>
              <p className="text-sm text-muted-foreground">CO₂ Saved</p>
              <p className="text-xs text-muted-foreground mt-2">
                Equivalent to {treeEquivalent} trees for a year
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-chart-4/10 to-chart-4/5" data-testid="stat-waste-prevented">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <Scale className="h-6 w-6 text-chart-4" />
              </div>
              <TrendingUp className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-4xl font-bold font-heading mb-1">{stats.wastePrevented.toFixed(1)} kg</p>
              <p className="text-sm text-muted-foreground">Waste Prevented</p>
              <p className="text-xs text-muted-foreground mt-2">
                By avoiding unnecessary purchases
              </p>
            </div>
          </Card>
        </div>

        {/* Impact Over Time Chart */}
        <Card className="p-6 mb-8">
          <h2 className="font-heading text-xl font-semibold mb-6">CO₂ Savings Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="co2" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Community Goals */}
        <Card className="p-6">
          <h2 className="font-heading text-xl font-semibold mb-6">Community Goals</h2>
          <div className="space-y-6">
            <div data-testid="goal-items">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">10,000 Items Shared</p>
                <p className="text-sm text-muted-foreground">7,243 / 10,000</p>
              </div>
              <Progress value={72.43} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">72% complete</p>
            </div>

            <div data-testid="goal-co2">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">5 Tons CO₂ Saved</p>
                <p className="text-sm text-muted-foreground">3.8 / 5 tons</p>
              </div>
              <Progress value={76} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">76% complete</p>
            </div>

            <div data-testid="goal-members">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">5,000 Active Members</p>
                <p className="text-sm text-muted-foreground">2,543 / 5,000</p>
              </div>
              <Progress value={50.86} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">51% complete</p>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-6 mt-8 bg-accent/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Maximize Your Impact
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• List items you're not using regularly to help others save resources</li>
            <li>• Borrow instead of buying for one-time or occasional needs</li>
            <li>• Share tools and equipment with multiple neighbors</li>
            <li>• Leave reviews to build trust and encourage more sharing</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
