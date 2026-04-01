import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Bookings() {
  const insets = useSafeAreaInsets();

  return (
    <View
      // This class from your global.css applies the #fff9e3 background
      className="auth-safe-area flex-1"
      style={{
        paddingTop: insets.top, // Manually handle the notch padding
        paddingBottom: insets.bottom, // Ensure bottom space is accounted for
      }}
    >
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-sans-bold text-primary">
          This is bookings page
        </Text>
      </View>
    </View>
  );
}
