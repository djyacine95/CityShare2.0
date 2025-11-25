import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Shield, Heart, TrendingUp, Leaf, Users, Package } from "lucide-react";
import heroImage from "@assets/generated_images/community_item_sharing_hero.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold">CityShare</span>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Log In</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Community sharing items" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-white md:text-6xl mb-6">
              Borrow, Lend, Share Locally
            </h1>
            <p className="text-lg text-white/90 md:text-xl mb-8">
              Join your community in sharing items sustainably. Save money, reduce waste, and build connections with verified neighbors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="backdrop-blur-sm bg-primary/90 hover:bg-primary border border-primary-border"
                asChild
                data-testid="button-get-started"
              >
                <a href="/api/login">Get Started</a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border-white/30"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-white" data-testid="stat-items">
                <div className="text-3xl font-bold font-heading">10K+</div>
                <div className="text-sm text-white/80">Items Shared</div>
              </div>
              <div className="text-white" data-testid="stat-co2">
                <div className="text-3xl font-bold font-heading">5 Tons</div>
                <div className="text-sm text-white/80">CO₂ Saved</div>
              </div>
              <div className="text-white" data-testid="stat-members">
                <div className="text-3xl font-bold font-heading">2.5K</div>
                <div className="text-sm text-white/80">Active Members</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">
            How CityShare Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 hover-elevate" data-testid="feature-browse">
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Browse & Search</h3>
              <p className="text-muted-foreground">
                Find items nearby with smart filters by category, distance, and availability.
              </p>
            </Card>

            <Card className="p-6 hover-elevate" data-testid="feature-trust">
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Trust & Verify</h3>
              <p className="text-muted-foreground">
                Connect with verified users and check ratings before borrowing or lending.
              </p>
            </Card>

            <Card className="p-6 hover-elevate" data-testid="feature-impact">
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Track Impact</h3>
              <p className="text-muted-foreground">
                See your environmental contribution with our green impact tracker.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-accent/20">
        <div className="container">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">
            Why Share with CityShare?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex gap-4" data-testid="benefit-save">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Save Money</h3>
                <p className="text-sm text-muted-foreground">
                  Borrow instead of buying items you only need occasionally.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="benefit-eco">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Reduce Waste</h3>
                <p className="text-sm text-muted-foreground">
                  Help the environment by maximizing item usage and reducing consumption.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="benefit-community">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Build Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with neighbors and strengthen local relationships.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="benefit-convenient">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Convenient & Safe</h3>
                <p className="text-sm text-muted-foreground">
                  Easy booking, verified users, and secure in-app messaging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Start Sharing?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90">
            Join thousands of community members saving money and the planet.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            asChild
            data-testid="button-join-now"
          >
            <a href="/api/login">Join CityShare Today</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CityShare. Share sustainably, build community.</p>
        </div>
      </footer>
    </div>
  );
}
