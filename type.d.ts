import type { ImageSourcePropType } from "react-native";

declare global {
  // THE NEW RULE FOR YOUR TURFS
  interface Turf {
    id: number;
    name: string;
    location: string;
    price_per_hour: number;
    description: string;
    rating: number;
    amenities: {
      lights?: boolean;
      parking?: boolean;
      water?: boolean;
      washrooms?: boolean;
      gallery?: boolean;
      [key: string]: any;
    };
    is_available: boolean;
  }

  // Keep these if you're using them for your Tab Bar logic
  interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
  }

  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }
}

export {};
