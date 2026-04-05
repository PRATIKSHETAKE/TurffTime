import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function BookingSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Destructure the params passed from the booking screen
  const { turfName, pitchName, date, time, receipt } = params;

  useEffect(() => {
    // Auto-redirect to Home after 5 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fffaf9" }}>
      <View className="flex-1 items-center justify-center px-8">
        {/* --- LOTTIE ANIMATION --- */}
        <LottieView
          source={require("../assets/animations/Verified.json")}
          autoPlay
          loop={false}
          style={styles.lottie}
        />

        <Text className="text-3xl font-sans-extrabold text-primary text-center mt-4">
          Booking Confirmed!
        </Text>
        <Text className="text-primary/40 font-sans-medium text-center mt-2">
          Your slot has been locked in.
        </Text>

        {/* --- TICKET DETAILS CARD --- */}
        <View className="w-full bg-white rounded-[32px] p-6 mt-10 border border-border shadow-sm">
          <View className="flex-row items-center mb-6 border-b border-gray-50 pb-4">
            <View className="size-12 bg-accent/10 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="football" size={24} color="#ea7a53" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-sans-extrabold text-primary">
                {turfName}
              </Text>
              <Text className="text-xs font-sans-medium text-primary/40">
                {pitchName}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-[10px] font-sans-bold text-primary/30 uppercase tracking-widest mb-1">
                Date
              </Text>
              <Text className="font-sans-bold text-primary">{date}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[10px] font-sans-bold text-primary/30 uppercase tracking-widest mb-1">
                Time
              </Text>
              <Text className="font-sans-bold text-primary">{time}</Text>
            </View>
          </View>

          <View className="bg-primary/5 rounded-2xl p-4 flex-row justify-between items-center">
            <Text className="text-[10px] font-sans-bold text-primary/40 uppercase tracking-widest">
              Receipt ID
            </Text>
            <Text className="font-sans-bold text-primary text-xs">
              {receipt}
            </Text>
          </View>
        </View>

        {/* --- AUTO REDIRECT FOOTER --- */}
        <View className="mt-12 items-center">
          <Text className="text-primary/20 font-sans-medium text-xs">
            Redirecting to home in a few seconds...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lottie: {
    width: 200,
    height: 200,
  },
});
