import React from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, CalendarDays, UserCircle } from "lucide-react-native";
import "../../global.css";

function MyTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-16 right-16 flex-row items-center justify-around bg-primary rounded-full px-2 shadow-2xl"
      style={{
        // Handles the bottom spacing dynamically
        bottom: insets.bottom > 0 ? insets.bottom : 30,
        height: 64,
        elevation: 10,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getIcon = (name: string, color: string) => {
          const props = { size: 24, color };
          if (name === "home") return <Home {...props} />;
          if (name === "bookings") return <CalendarDays {...props} />;
          if (name === "accounts") return <UserCircle {...props} />;
          return null;
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            className={`flex-row items-center justify-center px-4 py-3 rounded-full ${
              isFocused ? "tabs-active" : "bg-transparent"
            }`}
          >
            {getIcon(route.name, isFocused ? "#081126" : "#fff9e3")}

            {isFocused && (
              <Text className="ml-2 text-sx font-bold text-primary capitalize">
                {route.name}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <>
      {/* This makes top icons (time/battery) dark and visible on your cream background */}
      <StatusBar style="dark" />
      <Tabs
        tabBar={(props) => <MyTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="bookings" />
        <Tabs.Screen name="accounts" />
      </Tabs>
    </>
  );
}
