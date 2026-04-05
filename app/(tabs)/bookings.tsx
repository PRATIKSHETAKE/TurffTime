import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/constants";

export default function BookingScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async (isSilent = false) => {
    if (!user) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch(`${API_BASE}/bookings/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings(true);
    }, [user]),
  );

  const renderBookingCard = ({ item }: { item: any }) => {
    // Determine status styling
    const isConfirmed = item.status.toLowerCase() === "confirmed";
    const statusColor = isConfirmed
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

    // Format Date safely
    const dateObj = new Date(item.booking_date);
    const dateString = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    return (
      <View className="bg-white rounded-3xl p-5 mb-4 border border-border shadow-sm">
        {/* Header: Status and Date */}
        <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
          <View
            className={`px-3 py-1 rounded-full ${statusColor.split(" ")[0]}`}
          >
            <Text
              className={`font-sans-bold text-[10px] uppercase tracking-widest ${statusColor.split(" ")[1]}`}
            >
              {item.status}
            </Text>
          </View>
          <Text className="font-sans-bold text-primary/40 text-xs uppercase tracking-wider">
            {dateString}
          </Text>
        </View>

        {/* Body: Turf Info */}
        <View className="flex-row items-center mb-4">
          <View className="size-16 rounded-2xl bg-gray-100 mr-4 overflow-hidden">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=200",
              }}
              className="w-full h-full"
            />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-sans-extrabold text-primary mb-0.5">
              {item.turf_name}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="location" size={12} color="#ea7a53" />
              <Text className="text-xs font-sans-medium text-primary/50 ml-1">
                {item.turf_location}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer: Time, Pitch, and Price */}
        <View className="flex-row items-center justify-between bg-primary/5 rounded-2xl p-4">
          <View>
            <Text className="text-[10px] font-sans-bold text-primary/40 uppercase tracking-widest mb-1">
              Time & Pitch
            </Text>
            <Text className="font-sans-bold text-primary text-sm">
              {item.start_time} - {item.end_time}
            </Text>
            <Text className="font-sans-medium text-primary/60 text-xs mt-0.5">
              {item.pitch_name} ({item.pitch_type})
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] font-sans-bold text-primary/40 uppercase tracking-widest mb-1">
              Paid
            </Text>
            <Text className="text-lg font-sans-extrabold text-accent">
              ₹{item.total_price}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#fffaf9",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fffaf9" }}>
      {bookings.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <LottieView
            source={require("../../assets/animations/no-records.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text className="text-xl font-sans-bold text-primary text-center -mt-10">
            No Bookings Yet
          </Text>
          <Text className="text-sm font-sans-medium text-primary/40 mt-2 text-center">
            You haven't scheduled any matches yet. Head to the home tab to find
            a turf!
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <Text className="text-[26px] font-sans-bold text-primary px-6 pt-6 mb-6">
            Your <Text className="text-accent">Matches</Text>
          </Text>

          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={renderBookingCard}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchBookings(true)}
                tintColor="#ea7a53"
              />
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lottie: {
    width: 300,
    height: 300,
  },
});
