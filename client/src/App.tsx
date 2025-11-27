import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Browse from "@/pages/browse";
import ItemDetail from "@/pages/item-detail";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import Wishlist from "@/pages/wishlist";
import Impact from "@/pages/impact";
import CreateItem from "@/pages/create-item";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth"; // <--- NOW THIS EXISTS!

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const ProtectedRoute = ({ component: Component, ...rest }: any) => (
    <Route {...rest}>
      {isAuthenticated ? <Component /> : (setLocation("/auth"), null)}
    </Route>
  );

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      
      {/* THIS IS THE FIX: Route /auth to the visual Login Page */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />

      <ProtectedRoute path="/browse" component={Browse} />
      <ProtectedRoute path="/items/new" component={CreateItem} />
      <ProtectedRoute path="/items/:id" component={ItemDetail} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/wishlist" component={Wishlist} />
      <ProtectedRoute path="/impact" component={Impact} />

      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <>
      {!isLoading && isAuthenticated && <Header />}
      <Router />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;