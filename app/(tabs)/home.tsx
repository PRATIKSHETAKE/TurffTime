import React, { useState, useCallback, useRef } from "react";
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
  Animated,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";

// Components
import TurfCard from "../../components/TurfCard";
import DateSelector from "../../components/DateSelector";
import CitySelector from "../../components/CitySelector";
import UpcomingMatchCard from "../../components/UpcomingMatchCard";

// Context & Utils
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/constants";
import "../../global.css";

const SEARCH_ICON = require("../../assets/icons/search.png");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);

  const [turfs, setTurfs] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const stickyDateOpacity = scrollY.interpolate({
    inputRange: [120, 160],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const turfRes = await fetch(`${API_BASE}/turfs`);
      if (turfRes.ok) setTurfs(await turfRes.json());

      if (user?.id) {
        const bookRes = await fetch(`${API_BASE}/bookings/user/${user.id}`);
        if (bookRes.ok) {
          const allBookings = await bookRes.json();

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const upcoming = allBookings.filter((b: any) => {
            const bDate = new Date(b.booking_date);
            return b.status.toLowerCase() === "confirmed" && bDate >= today;
          });

          upcoming.sort(
            (a: any, b: any) =>
              new Date(a.booking_date).getTime() -
              new Date(b.booking_date).getTime(),
          );

          setUpcomingBookings(upcoming);
        }
      }
    } catch (e) {
      console.error("Dashboard Fetch failed:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData(true);
    }, [user]),
  );

  const scrollToTop = () =>
    listRef.current?.scrollToOffset({ offset: 0, animated: true });

  const toggleSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) setSearchQuery("");
  };

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const processedTurfs = turfs
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q);
      const matchesCity = currentCity
        ? t.city.toLowerCase() === currentCity.toLowerCase()
        : true;
      return matchesSearch && matchesCity;
    })
    .map((t) => {
      if (userLocation && userLocation.lat !== 0 && t.latitude && t.longitude) {
        return {
          ...t,
          distance: getDistance(
            userLocation.lat,
            userLocation.lng,
            t.latitude,
            t.longitude,
          ),
        };
      }
      return { ...t, distance: null };
    })
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null)
        return a.distance - b.distance;
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return 0;
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
                {currentCity || "City"}
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

      {/* --- MAIN CONTENT LIST --- */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ea7a53" size="large" />
        </View>
      ) : (
        <Animated.FlatList
          ref={listRef}
          data={processedTurfs}
          keyExtractor={(item) => item.id.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <View style={{ paddingTop: insets.top + 10 }}>
              {/* 1. WELCOME HEADER */}
              <Animated.View
                style={{ opacity: isSearchActive ? 0 : headerOpacity }}
                className="px-6 pr-14"
              >
                <Text className="text-[22px] font-sans-bold text-primary leading-tight">
                  Welcome to the field,{" "}
                  <Text className="text-accent">
                    {user?.first_name || "Player"}
                  </Text>
                </Text>
              </Animated.View>

              {/* 2. LOCATION SELECTOR */}
              <Animated.View
                style={{ opacity: isSearchActive ? 0 : headerOpacity }}
                className="px-6 mb-3"
              >
                <CitySelector
                  currentCity={currentCity}
                  onCityChange={(city) => setCurrentCity(city)}
                  onLocationDetect={(lat, lng) => setUserLocation({ lat, lng })}
                />
              </Animated.View>

              {/* 3. DATE SELECTOR */}
              <View className="">
                <DateSelector
                  onDateChange={(d) => {
                    setSelectedDate(d);
                    fetchDashboardData(true);
                  }}
                />
              </View>

              {/* 4. UPCOMING MATCHES */}
              {!isSearchActive && upcomingBookings.length > 0 && (
                <View className="mb-8 mt-2">
                  <Text className="px-6 text-primary font-sans-bold uppercase text-[12px] tracking-[3px] mb-3">
                    Your Next Matches
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: 24,
                      paddingRight: 40,
                    }}
                  >
                    {upcomingBookings.map((match) => (
                      <UpcomingMatchCard key={match.id} match={match} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {refreshing && (
                <View className="items-center mb-4 mt-2">
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
          ListEmptyComponent={
            <View className="px-6 py-10 items-center">
              <Text className="font-sans-medium text-primary/50 text-center">
                {currentCity
                  ? `No turfs currently available in ${currentCity}.`
                  : "No turfs found."}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchDashboardData(true)}
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
