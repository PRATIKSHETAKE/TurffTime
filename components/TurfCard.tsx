import React from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// --- ICONS FROM ASSETS/ICONS ---
const PARKING_ICON = require("../assets/icons/parking_white.png");
const LIGHT_ICON = require("../assets/icons/light_white.png");
const WATER_ICON = require("../assets/icons/water_white.png");
const RESTROOM_ICON = require("../assets/icons/restroom_white.png");
const SEAT_ICON = require("../assets/icons/seat_white.png");
const STAR_FULL = require("../assets/icons/star-white.png");
const STAR_HALF = require("../assets/icons/half-star-white.png");

interface TurfCardProps {
  turf: Turf;
  onPress?: () => void;
}

export default function TurfCard({ turf, onPress }: TurfCardProps) {
  // NORMALIZE RATING: Handles strings from PostgreSQL and prevents 'NaN'
  const ratingValue = parseFloat(turf.rating as any) || 0;

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(ratingValue)) {
        // FULL STAR
        stars.push(
          <Image
            key={`f-${i}`}
            source={STAR_FULL}
            className="size-4 mr-0.5"
            resizeMode="contain"
            style={{ tintColor: "white" }}
          />,
        );
      } else if (i === Math.ceil(ratingValue) && ratingValue % 1 !== 0) {
        // HALF STAR
        stars.push(
          <Image
            key="h"
            source={STAR_HALF}
            className="size-4 mr-0.5"
            resizeMode="contain"
            style={{ tintColor: "white" }}
          />,
        );
      }
    }
    return stars;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      className="mb-6 rounded-[32px] border border-border overflow-hidden"
    >
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
        }}
        className="h-[180px] w-full"
        resizeMode="cover"
      >
        <View className="flex-1 justify-end">
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.9)"]}
            className="p-5 pt-12"
          >
            <View className="flex-row justify-between items-end">
              {/* LEFT: INFO & DYNAMIC STARS */}
              <View className="flex-1 mr-4">
                <Text
                  className="text-2xl font-sans-extrabold text-white mb-0.5"
                  numberOfLines={1}
                >
                  {turf.name}
                </Text>
                <Text
                  className="text-sm font-sans-medium text-white/70 mb-2"
                  numberOfLines={1}
                >
                  {turf.location}
                </Text>
                <View className="flex-row items-center mt-1">
                  {renderStars()}
                  <Text className="text-white/50 text-[10px] font-sans-bold ml-1">
                    {ratingValue.toFixed(1)}
                  </Text>
                </View>
              </View>

              {/* RIGHT: PRICE & AMENITIES */}
              <View className="items-end">
                <Text className="text-xl font-sans-extrabold text-white mb-4">
                  ₹{Math.round(turf.price_per_hour)}
                </Text>
                <View className="flex-row gap-2.5 items-center">
                  {turf.amenities?.parking && (
                    <AmenityIcon source={PARKING_ICON} />
                  )}
                  {turf.amenities?.gallery && (
                    <AmenityIcon source={SEAT_ICON} />
                  )}
                  {turf.amenities?.washrooms && (
                    <AmenityIcon source={RESTROOM_ICON} />
                  )}
                  {turf.amenities?.water && <AmenityIcon source={WATER_ICON} />}
                  {turf.amenities?.lights && (
                    <AmenityIcon source={LIGHT_ICON} />
                  )}
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

function AmenityIcon({ source }: { source: any }) {
  return (
    <Image
      source={source}
      className="size-4"
      style={{ tintColor: "white" }}
      resizeMode="contain"
    />
  );
}
