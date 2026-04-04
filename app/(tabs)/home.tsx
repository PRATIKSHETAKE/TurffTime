import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  LayoutAnimation,
  Animated,
  StyleSheet,
  Platform,
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

  // --- REFERENCES ---
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null); // 1. Create a reference for the FlatList

  // --- STATE ---
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- ANIMATIONS ---
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const dateSelectorOpacity = scrollY.interpolate({
    inputRange: [40, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const stickyDateOpacity = scrollY.interpolate({
    inputRange: [120, 160],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const fetchTurfs = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE}/turfs`);
      const data = await response.json();
      setTurfs(data);
    } catch (e) {
      console.error("Fetch failed:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  // 2. Function to scroll to the very top
  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const toggleSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) setSearchQuery("");
  };

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
    <View className="flex-1 bg-[#fffaf9]">
      <StatusBar style="dark" />

      {/* --- PERSISTENT TOP BAR --- */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 24,
          right: 24,
          zIndex: 100,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* 3. Wrap Sticky Date in TouchableOpacity to trigger scrollToTop */}
        <Animated.View style={{ opacity: stickyDateOpacity }}>
          {!isSearchActive && (
            <TouchableOpacity
              onPress={scrollToTop}
              activeOpacity={0.8}
              className="bg-white border border-border px-3 py-1.5 rounded-2xl flex-row items-center"
              style={styles.searchShadow}
            >
              <View className="mr-2 pr-2 border-r border-border">
                <Text className="text-accent font-sans-extrabold text-[14px]">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    day: "2-digit",
                  })}
                </Text>
              </View>
              <Text className="text-primary/40 text-[10px] font-sans-bold uppercase tracking-widest">
                {currentCity || "Kolhapur"}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View
          style={styles.searchShadow}
          className={`bg-white border border-border rounded-2xl h-11 flex-row items-center overflow-hidden ${isSearchActive ? "flex-1 pl-4" : "w-11 justify-center"}`}
        >
          {isSearchActive && (
            <TextInput
              autoFocus
              placeholder="Search..."
              className="flex-1 font-sans-medium text-primary text-sm h-full"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          )}
          <TouchableOpacity
            onPress={toggleSearch}
            className="w-11 h-11 items-center justify-center"
          >
            <Image
              source={SEARCH_ICON}
              className="size-5"
              style={{ tintColor: isSearchActive ? "#ea7a53" : "#0f172a" }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- CONTENT --- */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ea7a53" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          ref={listRef} // 4. Connect the reference here
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <View style={{ paddingTop: insets.top + 10 }}>
              <Animated.View
                style={{ opacity: isSearchActive ? 0 : headerOpacity }}
                className="px-6 mb-6 pr-14"
              >
                <Text className="text-[22px] font-sans-bold text-primary leading-tight">
                  Welcome to the field,{" "}
                  <Text className="text-accent">Pratik</Text>
                </Text>
                <CitySelector onCityChange={(city) => setCurrentCity(city)} />
              </Animated.View>

              <Animated.View style={{ opacity: dateSelectorOpacity }}>
                <DateSelector
                  onDateChange={(d) => {
                    setSelectedDate(d);
                    fetchTurfs(true);
                  }}
                />
              </Animated.View>

              {refreshing && (
                <View className="items-center mb-4">
                  <ActivityIndicator color="#ea7a53" size="small" />
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View className="px-6">
              <TurfCard turf={item} />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 140 }}
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

const styles = StyleSheet.create({
  searchShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
});
