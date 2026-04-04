import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import TurfCard from "../../components/TurfCard";
import DateSelector from "../../components/DateSelector"; // Import the new component
import "../../global.css";

const API_BASE = "http://192.168.31.243:8000";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchTurfs = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      // You can eventually send the date to your backend here
      const response = await fetch(`${API_BASE}/turfs`);
      const data = await response.json();
      setTurfs(data);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  return (
    <View className="screen-container" style={{ paddingTop: insets.top + 10 }}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View className="px-6 flex-row justify-between items-end mb-6">
        <View>
          <Text className="text-primary/40 font-sans-medium text-sm">
            Pick a slot,
          </Text>
          <Text className="text-3xl font-sans-extrabold text-primary">
            Pratik
          </Text>
        </View>
        <TouchableOpacity className="size-12 rounded-2xl bg-white border border-border items-center justify-center">
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* NEW DATE SELECTOR (Replaced City Cards) */}
      <DateSelector
        onDateChange={(date) => {
          setSelectedDate(date);
          fetchTurfs(true); // Re-fetch or filter based on date
        }}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ea7a53" size="large" />
        </View>
      ) : (
        <FlatList
          data={turfs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TurfCard turf={item} />}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchTurfs(true)}
              tintColor="#ea7a53"
            />
          }
        />
      )}
    </View>
  );
}
