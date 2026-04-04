import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  LayoutAnimation,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import TurfCard from "../../components/TurfCard";
import DateSelector from "../../components/DateSelector";
import CitySelector from "../../components/CitySelector";
import "../../global.css";

const SEARCH_ICON = require("../../assets/icons/search.png");
const API_BASE = "http://192.168.31.243:8000";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCity, setCurrentCity] = useState("");

  const fetchTurfs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/turfs`);
      const data = await response.json();
      setTurfs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  const toggleSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) setSearchQuery("");
  };

  // --- DUAL FILTER: NAME OR LOCATION ---
  const filteredData = turfs.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(q) || t.location.toLowerCase().includes(q);
    const matchesCity = currentCity
      ? t.location.toLowerCase().includes(currentCity.toLowerCase())
      : true;
    return matchesSearch && matchesCity;
  });

  return (
    <View className="flex-1 bg-[#fffaf9]" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* HEADER: Single Line + City Integrated */}
      <View className="px-6 flex-row justify-between items-start h-16 mt-2 mb-1">
        {!isSearchActive ? (
          <View className="flex-1">
            <Text
              className="text-[22px] font-sans-bold text-primary leading-tight"
              numberOfLines={1}
            >
              Welcome to the field, <Text className="text-accent">Pratik</Text>
            </Text>
            <CitySelector onCityChange={(city) => setCurrentCity(city)} />
          </View>
        ) : (
          <View className="flex-1 bg-white border border-border rounded-2xl h-11 px-4 justify-center mr-4">
            <TextInput
              autoFocus
              placeholder="Search name or area..."
              className="font-sans-medium text-primary text-sm"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={toggleSearch}
          className="w-11 h-11 rounded-2xl bg-white border border-border items-center justify-center mt-1"
        >
          <Image
            source={SEARCH_ICON}
            className="size-5"
            style={{ tintColor: isSearchActive ? "#ea7a53" : "#0f172a" }}
          />
        </TouchableOpacity>
      </View>

      <View className="mt-1">
        <DateSelector onDateChange={fetchTurfs} />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ea7a53" size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TurfCard turf={item} />}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={fetchTurfs}
              tintColor="#ea7a53"
            />
          }
        />
      )}
    </View>
  );
}
