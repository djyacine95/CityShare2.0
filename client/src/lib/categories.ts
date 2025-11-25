import { 
  Wrench, 
  Laptop, 
  Home, 
  Bike, 
  Camera, 
  Gamepad2,
  Book,
  Music,
  Baby,
  Shirt,
  Package
} from "lucide-react";

export const CATEGORIES = [
  { value: "tools", label: "Tools & Equipment", icon: Wrench },
  { value: "electronics", label: "Electronics", icon: Laptop },
  { value: "home", label: "Home & Garden", icon: Home },
  { value: "sports", label: "Sports & Outdoor", icon: Bike },
  { value: "camera", label: "Camera & Photo", icon: Camera },
  { value: "gaming", label: "Gaming & Entertainment", icon: Gamepad2 },
  { value: "books", label: "Books & Media", icon: Book },
  { value: "music", label: "Musical Instruments", icon: Music },
  { value: "baby", label: "Baby & Kids", icon: Baby },
  { value: "fashion", label: "Fashion & Accessories", icon: Shirt },
  { value: "other", label: "Other", icon: Package },
] as const;
