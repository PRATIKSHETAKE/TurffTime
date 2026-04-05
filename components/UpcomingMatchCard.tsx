import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// 🎨 Use a generic high-quality sports fallback if match image is missing
const MATCH_FALLBACK =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800";

export default function UpcomingMatchCard({ match }: { match: any }) {
  const matchDate = new Date(match.booking_date);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="mr-4 w-[240px] h-[150px] rounded-[32px] overflow-hidden border border-white/10 shadow-lg bg-black"
    >
      <ImageBackground
        source={{ uri: MATCH_FALLBACK }} // Link this to match.turf_image if you add it to the backend later
        className="w-full h-full"
      >
        {/* Scrim for contrast */}
        <View className="absolute inset-0 bg-black/20" />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)"]}
          className="flex-1 justify-between p-5"
        >
          {/* Top Row: Just the Status Badge */}
          <View className="flex-row items-center justify-between">
            <View className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-full flex-row items-center">
              <View className="size-1.5 rounded-full bg-[#ea7a53] mr-1.5" />
              <Text className="text-white text-[9px] font-sans-bold uppercase tracking-widest">
                Confirmed
              </Text>
            </View>
          </View>

          {/* Bottom Section: Name + Date in one row */}
          <View>
            <View className="flex-row justify-between items-end mb-2">
              <Text
                style={styles.textShadow}
                className="text-white font-sans-extrabold text-lg flex-1 mr-2"
                numberOfLines={1}
              >
                {match.turf_name}
              </Text>

              {/* 📅 Date now sits right next to the name */}
              <Text
                style={styles.textShadow}
                className="text-[#ea7a53] font-sans-bold text-[11px] mb-0.5"
              >
                {matchDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>

            <View className="flex-row items-center pt-2 border-t border-white/10">
              <View className="flex-row items-center mr-4">
                <Ionicons
                  name="time-outline"
                  size={12}
                  color="white"
                  style={{ opacity: 0.7 }}
                />
                <Text className="text-white/80 font-sans-medium text-[11px] ml-1">
                  {match.start_time}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons
                  name="location-outline"
                  size={12}
                  color="white"
                  style={{ opacity: 0.7 }}
                />
                <Text
                  className="text-white/80 font-sans-medium text-[11px] ml-1"
                  numberOfLines={1}
                >
                  {match.pitch_name}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  textShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
