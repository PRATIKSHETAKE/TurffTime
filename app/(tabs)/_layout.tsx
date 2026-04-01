import React from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, TouchableOpacity, Text, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../../global.css";

// 1. Define the TabName type to match your route names exactly
type TabName = "home" | "bookings" | "accounts";

// 2. Type the icons object using Record
const icons: Record<TabName, { solid: any; outlined: any }> = {
  home: {
    solid: require("../../assets/icons/home-solid.png"),
    outlined: require("../../assets/icons/home-outlined.png"),
  },
  bookings: {
    solid: require("../../assets/icons/calendar-solid.png"),
    outlined: require("../../assets/icons/calender-outlined.png"),
  },
  accounts: {
    solid: require("../../assets/icons/account-solid.png"),
    outlined: require("../../assets/icons/account-outlined.png"),
  },
};

function MyTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-16 right-16 flex-row items-center justify-around bg-primary rounded-[24px] px-2 shadow-2xl"
      style={{
        bottom: insets.bottom > 0 ? insets.bottom : 30,
        height: 64,
        elevation: 10,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        // 3. Cast route.name as TabName so TypeScript allows the indexing
        const routeName = route.name as TabName;

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

        // Now TypeScript is happy because routeName is guaranteed to be a key of icons
        const iconSource = isFocused
          ? icons[routeName].solid
          : icons[routeName].outlined;
        const iconColor = isFocused ? "#081126" : "#fff9e3";

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            className={`flex-row items-center justify-center px-5 py-2 rounded-[16px] ${
              isFocused ? "tabs-active" : "bg-transparent"
            }`}
          >
            <Image
              source={iconSource}
              style={{
                width: 26,
                height: 26,
                tintColor: iconColor,
              }}
              resizeMode="contain"
            />

            {isFocused && (
              <Text className="ml-2 text-xs font-sans-bold text-primary capitalize">
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
