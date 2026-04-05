import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/constants";
import TurfCard from "../../components/TurfCard";
import { useFocusEffect } from "expo-router";

export default function HomeGround() {
  const { user } = useAuth();
  const [likedTurfs, setLikedTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async (isSilent = false) => {
    if (!user) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch(`${API_BASE}/favorites/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setLikedTurfs(data);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites(true);
    }, [user]),
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#fffaf9] justify-center items-center">
        <ActivityIndicator size="large" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fffaf9]">
      {likedTurfs.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <LottieView
            source={require("../../assets/animations/no-records.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text className="text-xl font-sans-bold text-primary text-center -mt-10">
            No Saved Turfs
          </Text>
          <Text className="text-sm font-sans-medium text-primary/40 mt-2 text-center">
            Your favorite HomeGrounds will appear here.
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <Text className="text-[26px] font-sans-bold text-primary px-6 pt-6 mb-6">
            Your <Text className="text-accent">HomeGrounds</Text>
          </Text>

          <FlatList
            data={likedTurfs}
            keyExtractor={(item: any) => item.id.toString()}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <TurfCard turf={item} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchFavorites(true)}
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
