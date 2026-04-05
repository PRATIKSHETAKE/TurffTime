import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../context/AuthContext";

export function DynamicAvatar({ focused }: { focused: boolean }) {
  const { user } = useAuth();

  // Extract Initials (e.g., "Pratik Shetake" -> "PS")
  const initials =
    `${user?.first_name?.charAt(0) || ""}${user?.last_name?.charAt(0) || "U"}`.toUpperCase();

  return (
    <View
      className={`size-7 rounded-full items-center justify-center border ${
        focused ? "bg-accent border-accent" : "bg-primary/10 border-primary/20"
      }`}
    >
      <Text
        className={`text-[10px] font-sans-bold ${
          focused ? "text-white" : "text-primary"
        }`}
      >
        {initials}
      </Text>
    </View>
  );
}
