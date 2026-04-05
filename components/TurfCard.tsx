import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet, // Added for text shadow
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

// Asset Imports (Keep your existing icons)
const PARKING_ICON = require("../assets/icons/parking_white.png");
const LIGHT_ICON = require("../assets/icons/light_white.png");
const WATER_ICON = require("../assets/icons/water_white.png");
const RESTROOM_ICON = require("../assets/icons/restroom_white.png");
const STAR_FULL = require("../assets/icons/star-white.png");

const FALLBACK_CARTOON =
  "https://img.freepik.com/free-vector/flat-design-football-field-background_23-2149033285.jpg";

export default function TurfCard({ turf }: { turf: any }) {
  const router = useRouter();

  const dbImage =
    turf.images?.find((img: any) => img.is_primary)?.url ||
    turf.images?.[0]?.url;
  const [imageUri, setImageUri] = useState(dbImage || FALLBACK_CARTOON);

  const startingPrice =
    turf.pitches?.length > 0
      ? Math.min(...turf.pitches.map((p: any) => p.price_per_hour))
      : null;

  const allSports = Array.from(
    new Set(turf.pitches?.flatMap((p: any) => p.sports) || []),
  );
  const hasAmenity = (name: string) => turf.amenities?.includes(name);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/turf/${turf.id}`)}
      className="mb-6 rounded-[32px] border border-white/10 overflow-hidden bg-[#1a1a1a]"
    >
      <ImageBackground
        source={{ uri: imageUri }}
        className="h-[220px] w-full"
        onError={() => setImageUri(FALLBACK_CARTOON)}
      >
        {/* 🛠️ STEP 1: Added an absolute overlay for consistent base contrast */}
        <View className="absolute inset-0 bg-black/20" />

        <View className="flex-1 justify-end">
          {/* 🛠️ STEP 2: Taller and more aggressive gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.98)"]}
            style={{ height: "70%" }} // Gradient covers more area now
            className="p-5 justify-end"
          >
            {/* Top Row: Name and Price */}
            <View className="flex-row justify-between items-start mb-1">
              <View className="flex-1 mr-2">
                <Text
                  style={styles.textShadow} // 🛠️ STEP 3: Applied text shadow
                  className="text-2xl font-sans-extrabold text-white"
                  numberOfLines={1}
                >
                  {turf.name}
                </Text>
                <Text className="text-sm font-sans-medium text-white/80">
                  {turf.location}, {turf.city}
                </Text>
              </View>

              <View className="items-end">
                {startingPrice ? (
                  <Text
                    style={styles.textShadow}
                    className="text-xl font-sans-extrabold text-white"
                  >
                    ₹{Math.round(startingPrice)}
                    <Text className="text-[10px] text-white"> /hr</Text>
                  </Text>
                ) : (
                  <Text className="text-xs text-white/60">Price TBD</Text>
                )}
              </View>
            </View>

            {/* Middle Row: Sports Badges */}
            <View className="flex-row flex-wrap gap-2 mb-3 mt-1">
              {allSports.slice(0, 3).map((sport: any) => (
                <View
                  key={sport}
                  className="bg-white/20 px-2 py-0.5 rounded-full border border-white/10"
                >
                  <Text className="text-[10px] text-white font-sans-bold">
                    {sport}
                  </Text>
                </View>
              ))}
            </View>

            {/* Bottom Row: Distance & Amenities */}
            <View className="flex-row justify-between items-center border-t border-white/20 pt-3">
              <View className="flex-row items-center">
                <Image
                  source={STAR_FULL}
                  className="size-3 mr-1"
                  style={{ tintColor: "#FFD700" }}
                />
                <Text className="text-xs font-sans-bold text-white mr-3">
                  4.5
                </Text>

                {turf.distance != null && (
                  <Text className="text-xs font-sans-medium text-[#ea7a53]">
                    {turf.distance.toFixed(1)} km away
                  </Text>
                )}
              </View>

              <View className="flex-row gap-3">
                {hasAmenity("Parking") && (
                  <Image
                    source={PARKING_ICON}
                    className="size-3.5"
                    style={{ tintColor: "white", opacity: 0.9 }}
                  />
                )}
                {hasAmenity("Floodlights") && (
                  <Image
                    source={LIGHT_ICON}
                    className="size-3.5"
                    style={{ tintColor: "white", opacity: 0.9 }}
                  />
                )}
                {hasAmenity("Drinking Water") && (
                  <Image
                    source={WATER_ICON}
                    className="size-3.5"
                    style={{ tintColor: "white", opacity: 0.9 }}
                  />
                )}
                {hasAmenity("Washrooms") && (
                  <Image
                    source={RESTROOM_ICON}
                    className="size-3.5"
                    style={{ tintColor: "white", opacity: 0.9 }}
                  />
                )}
              </View>
            </View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

// 🛠️ STEP 4: Added a custom style for the text shadow
const styles = StyleSheet.create({
  textShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
