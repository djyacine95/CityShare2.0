import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, error, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      // We manually fetch so we can handle the 401 explicitly
      const res = await fetch("/api/auth/user");
      
      // FIX: If server says 401 (Not Logged In), return null immediately.
      // Do NOT throw an error, do NOT retry.
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch user info");
      }
      
      return res.json();
    },
    // CRITICAL: specific settings for this query
    retry: false, 
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: any) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({ title: "Welcome back!" });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({ title: "Logged out successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    // Helper to refresh the state manually if needed
    refetchUser: refetch, 
    // Convenience boolean
    isAuthenticated: !!user, 
  };
}