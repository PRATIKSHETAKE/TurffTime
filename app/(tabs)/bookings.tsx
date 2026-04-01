import { View, Text } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Bookings() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="auth-safe-area flex-1 items-center justify-center">
        <Text className="text-xl font-sans-bold text-primary">
          This is bookings page
        </Text>
      </View>
    </SafeAreaView>
  );
}
