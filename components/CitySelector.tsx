import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { API_BASE } from "@/utils/constants";

interface CitySelectorProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  onLocationDetect: (lat: number, lng: number) => void;
}

export default function CitySelector({
  currentCity,
  onCityChange,
  onLocationDetect,
}: CitySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${API_BASE}/cities`);
        if (response.ok) {
          const cities = await response.json();
          setAvailableCities(cities);

          if (!currentCity && cities.length > 0) {
            onCityChange(cities[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch cities", error);
        setAvailableCities(["Kolhapur"]);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  const detectLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow location access.");
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const address = geocode[0];

        // Creates a net to catch neighborhoods (Morewadi), districts (Kolhapur), etc.
        const possibleNames = [
          address.city,
          address.subregion,
          address.district,
          address.name,
        ].filter(Boolean) as string[];

        const matchedDbCity = availableCities.find((dbCity) =>
          possibleNames.some(
            (detectedName) =>
              detectedName.toLowerCase() === dbCity.toLowerCase(),
          ),
        );

        if (matchedDbCity) {
          onCityChange(matchedDbCity);
          // Pass coordinates to calculate distances
          onLocationDetect(location.coords.latitude, location.coords.longitude);
          setModalVisible(false);
        } else {
          const detectedString =
            possibleNames.length > 0 ? possibleNames[0] : "an unknown area";
          Alert.alert(
            "Out of Service Area",
            `We detected you are near ${detectedString}, but we currently only serve specific areas. Please select manually.`,
          );
        }
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch your location.");
    } finally {
      setLoadingLocation(false);
    }
  };

  const selectCity = (city: string) => {
    onCityChange(city);
    onLocationDetect(0, 0); // Reset distances if manually selecting a city
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-row items-center mt-1"
      >
        <Ionicons name="location" size={16} color="#ea7a53" />
        <Text className="font-sans-bold text-primary/60 ml-1 text-sm uppercase tracking-wider">
          {currentCity || "Select City"}
        </Text>
        <Ionicons
          name="chevron-down"
          size={14}
          color="#0f172a55"
          className="ml-1"
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-t-3xl p-6 min-h-[50%] shadow-lg">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[20px] font-sans-bold text-primary">
                Select your city
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#0f172a33" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={detectLocation}
              disabled={loadingLocation}
              className="bg-[#fffaf9] border border-accent/20 rounded-2xl p-4 flex-row items-center mb-6"
            >
              <View className="bg-accent/10 p-2 rounded-full mr-4">
                <Ionicons name="navigate" size={20} color="#ea7a53" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-primary text-base">
                  Use Current Location
                </Text>
                <Text className="font-sans-medium text-primary/50 text-xs">
                  Enable GPS to find nearest turfs
                </Text>
              </View>
              {loadingLocation && <ActivityIndicator color="#ea7a53" />}
            </TouchableOpacity>

            <Text className="text-[12px] font-sans-bold text-primary/40 uppercase mb-4 ml-1">
              Available Cities
            </Text>

            {loadingCities ? (
              <ActivityIndicator color="#ea7a53" />
            ) : (
              <FlatList
                data={availableCities}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => selectCity(item)}
                    className={`p-4 rounded-2xl mb-2 flex-row justify-between items-center ${currentCity === item ? "bg-accent/10 border border-accent/20" : "bg-gray-50 border border-transparent"}`}
                  >
                    <Text
                      className={`font-sans-bold text-base ${currentCity === item ? "text-accent" : "text-primary"}`}
                    >
                      {item}
                    </Text>
                    {currentCity === item && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#ea7a53"
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
