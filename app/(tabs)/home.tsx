import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
  const insets = useSafeAreaInsets();

  return (
    <View
      // This 'auth-safe-area' class sets your #fff9e3 background
      className="auth-safe-area flex-1"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-sans-bold text-primary">
          This is home page
        </Text>
      </View>
    </View>
  );
}
