import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { insertItemSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

// FIX: We exclude ownerId (server handles it) and images (handled manually)
const formSchema = insertItemSchema.omit({ 
  ownerId: true, 
  images: true 
}).extend({
  location: z.string().min(1, "Location is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateItem() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "tools",
      location: user?.location || "",
    },
  });

  // Pre-fill location if user has one
  useEffect(() => {
    if (user && user.location && !form.getValues("location")) {
      form.setValue("location", user.location);
    }
  }, [user, form]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth"; // FIX: Redirect to /auth, not /api/login
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const createItemMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Submitting Data:", data); // Debug log
      const response = await apiRequest("POST", "/api/items", {
        ...data,
        images: imageUrls,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your item has been listed successfully",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      console.error("Submission Error:", error);
      if (isUnauthorizedError(error)) {
        window.location.href = "/auth";
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map(file => URL.createObjectURL(file));
    setImageUrls(prev => [...prev, ...urls].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormData) => {
    createItemMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold mb-2">List an Item</h1>
            <p className="text-muted-foreground">
              Share something you're not using and help your community
            </p>
          </div>

          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Form Errors:", errors))} className="space-y-6">
                
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Power Drill" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the item..." 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., San Jose, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Images */}
                <div className="space-y-3">
                  <FormLabel>Images (Optional)</FormLabel>
                  <div className="grid grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={url} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {imageUrls.length < 5 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 flex flex-col items-center justify-center cursor-pointer hover-elevate">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createItemMutation.isPending}
                  >
                    {createItemMutation.isPending ? "Creating..." : "List Item"}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}