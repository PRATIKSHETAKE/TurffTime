import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  LayoutAnimation,
} from "react-native";
import * as Location from "expo-location";

const CITIES = ["Kolhapur", "Pune", "Mumbai", "Satara", "Sangli"];
const PIN_ICON = require("../assets/icons/location-pin.png");

export default function CitySelector({
  onCityChange,
}: {
  onCityChange: (city: string) => void;
}) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    if (!selectedCity) setModalVisible(true);
  }, []);

  const selectCity = (city: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCity(city);
    onCityChange(city);
    setModalVisible(false);
  };

  const detectLocation = async () => {
    setLocLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocLoading(false);
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({});
      let reverse = await Location.reverseGeocodeAsync(location.coords);
      if (reverse.length > 0) {
        const addr = reverse[0];
        // Logic: subregion/district usually provides "Kolhapur" instead of "Morewadi"
        const detected =
          addr.subregion || addr.district || addr.city || "Kolhapur";
        selectCity(detected.replace(" District", ""));
      }
    } catch (e) {
      alert("Detection failed. Please select manually.");
    } finally {
      setLocLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-row items-center mt-1"
      >
        <Image
          source={PIN_ICON}
          className="size-3 mr-1"
          style={{ tintColor: "#ea7a53" }}
        />
        <Text className="font-sans-bold text-[13px] text-primary/50">
          {selectedCity || "Select City"}
        </Text>
        <Text className="text-primary/20 text-[8px] ml-1">▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px] p-8 h-[50%]">
            <Text className="text-2xl font-sans-extrabold text-primary mb-6">
              Where are you playing?
            </Text>
            <TouchableOpacity
              onPress={detectLocation}
              className="flex-row items-center bg-accent/5 p-4 rounded-2xl mb-4 border border-accent/10 justify-center"
            >
              {locLoading ? (
                <ActivityIndicator color="#ea7a53" />
              ) : (
                <Text className="font-sans-bold text-accent">
                  📍 Automatically detect my city
                </Text>
              )}
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CITIES.map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => selectCity(city)}
                  className="py-4 border-b border-border"
                >
                  <Text className="text-lg font-sans-medium text-primary/70">
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
