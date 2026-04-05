import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { API_BASE } from "@/utils/constants";
import { useAuth } from "../../context/AuthContext";

export default function TurfDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [turf, setTurf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPitchId, setSelectedPitchId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTurfDetails();
    }
  }, [id]);

  const fetchTurfDetails = async () => {
    try {
      // Backend expects /turfs?id=X or /turfs (filtered).
      // Assuming your main.py handle individual ID fetching:
      const response = await fetch(`${API_BASE}/turfs`);
      const allTurfs = await response.json();

      const details = allTurfs.find((t: any) => t.id === Number(id));

      if (details) {
        setTurf(details);
        if (details.pitches?.length > 0) {
          setSelectedPitchId(details.pitches[0].id);
        }
      } else {
        Alert.alert("Error", "Arena not found.");
        router.back();
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!user)
      return Alert.alert("Hold on", "You need to log in to save turfs.");
    setIsLiked(!isLiked);
    setLikeLoading(true);
    try {
      await fetch(`${API_BASE}/favorites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, turf_id: Number(id) }),
      });
    } catch (e) {
      setIsLiked(!isLiked);
      Alert.alert("Error", "Could not update favorites.");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookingRedirect = () => {
    if (!selectedPitchId)
      return Alert.alert("Selection Required", "Please select a pitch.");
    const selectedPitch = turf.pitches.find(
      (p: any) => p.id === selectedPitchId,
    );

    router.push({
      pathname: "/turf/book",
      params: {
        turfId: turf.id,
        turfName: turf.name,
        pitchId: selectedPitchId,
        pitchName: selectedPitch.name,
        price: selectedPitch.price_per_hour,
      },
    });
  };

  // Get current primary image
  const headerImage =
    turf?.images?.find((img: any) => img.is_primary)?.url ||
    turf?.images?.[0]?.url;

  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-[#fffaf9]">
        <ActivityIndicator size="large" color="#ea7a53" />
      </View>
    );

  return (
    <View className="flex-1 bg-[#fffaf9]">
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Header Image Section */}
        <View className="h-[440px] w-full relative bg-gray-300">
          <Animated.Image
            source={{ uri: headerImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-14 left-0 right-0 px-6 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="size-12 bg-black/30 rounded-2xl items-center justify-center border border-white/20"
            >
              <Ionicons name="chevron-back" size={26} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleLike}
              className="size-12 bg-white rounded-2xl items-center justify-center shadow-lg"
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#ef4444" : "#081126"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Details Section */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          className="flex-1 bg-[#fffaf9] -mt-20 rounded-t-[60px] px-6 pt-12 pb-40"
        >
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-sans-extrabold text-primary leading-9">
                {turf.name}
              </Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="location-sharp" size={14} color="#ea7a53" />
                <Text className="ml-1 text-primary/50 font-sans-medium text-sm">
                  {turf.location}, {turf.city}
                </Text>
              </View>
            </View>
            <View className="bg-accent/10 px-4 py-2 rounded-2xl flex-row items-center">
              <Ionicons name="star" size={16} color="#ea7a53" />
              <Text className="ml-1.5 text-accent font-sans-extrabold text-lg">
                4.5
              </Text>
            </View>
          </View>

          {/* Amenities Rendering */}
          <Text className="text-primary/30 font-sans-bold uppercase text-[10px] tracking-[3px] mt-10 mb-5">
            Facilities
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row -mx-6 px-6"
          >
            {turf.amenities?.map((name: string, index: number) => (
              <Animated.View
                entering={FadeInRight.delay(index * 100)}
                key={index}
                className="bg-white border border-border mr-3 px-5 py-3 rounded-2xl shadow-sm"
              >
                <Text className="text-primary font-sans-bold text-xs">
                  {name}
                </Text>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Pitch Selection Rendering */}
          <Text className="text-primary/30 font-sans-bold uppercase text-[10px] tracking-[3px] mt-10 mb-5">
            Select Pitch & Sport
          </Text>
          {turf.pitches?.map((pitch: any) => {
            const isSelected = selectedPitchId === pitch.id;
            return (
              <TouchableOpacity
                key={pitch.id}
                onPress={() => setSelectedPitchId(pitch.id)}
                className={`p-5 rounded-[32px] flex-row items-center mb-4 border-2 ${isSelected ? "bg-accent/5 border-accent shadow-md" : "bg-white border-border"}`}
              >
                <View
                  className={`size-14 rounded-[20px] items-center justify-center mr-4 ${isSelected ? "bg-accent" : "bg-primary/5"}`}
                >
                  <Ionicons
                    name="football"
                    size={28}
                    color={isSelected ? "white" : "#ea7a53"}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-sans-bold text-lg ${isSelected ? "text-accent" : "text-primary"}`}
                  >
                    {pitch.name}
                  </Text>
                  <View className="flex-row gap-1 mt-1">
                    {pitch.sports?.map((sport: string) => (
                      <Text
                        key={sport}
                        className="text-primary/40 text-[9px] font-sans-bold uppercase border border-primary/10 px-1 rounded"
                      >
                        {sport}
                      </Text>
                    ))}
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-sans-extrabold text-primary">
                    ₹{Math.round(pitch.price_per_hour)}
                  </Text>
                  <Text className="text-[9px] font-sans-bold text-primary/30 uppercase">
                    / hr
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </ScrollView>

      {/* Footer / Booking Bar */}
      <Animated.View
        entering={FadeInDown.delay(400)}
        className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-border flex-row items-center justify-between"
      >
        <View>
          <Text className="text-primary/30 font-sans-bold text-[10px] uppercase tracking-widest">
            Selected Pitch
          </Text>
          <Text className="text-2xl font-sans-extrabold text-primary">
            ₹
            {turf.pitches?.find((p: any) => p.id === selectedPitchId)
              ?.price_per_hour || "---"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleBookingRedirect}
          className="bg-accent px-10 h-16 rounded-[28px] items-center justify-center shadow-xl shadow-accent/40"
        >
          <Text className="text-white font-sans-bold text-lg">Book Now</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
