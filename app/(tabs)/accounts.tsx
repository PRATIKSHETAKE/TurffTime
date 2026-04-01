import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Accounts() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="auth-safe-area flex-1"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-sans-bold text-primary">
          This is accounts page
        </Text>
      </View>
    </View>
  );
}
