import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeGrounds() {
  const insets = useSafeAreaInsets();

  return (
    <View className="auth-safe-area flex-1" style={{ paddingTop: insets.top }}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-sans-bold text-primary">
          Your Home Grounds
        </Text>
        <Text className="text-sm font-sans-medium text-muted-foreground text-center mt-2">
          Your most frequently booked turfs will appear here.
        </Text>
      </View>
    </View>
  );
}
