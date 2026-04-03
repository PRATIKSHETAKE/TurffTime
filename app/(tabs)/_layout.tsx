import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, TouchableOpacity, Text, Image, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import "../../global.css";

// 1. Match the filename: 'home_grounds'
type TabName = "home" | "bookings" | "home_grounds" | "accounts";

const icons: Record<TabName, { solid: any; outlined: any }> = {
  home: {
    solid: require("../../assets/icons/home-solid.png"),
    outlined: require("../../assets/icons/home-outlined.png"),
  },
  bookings: {
    solid: require("../../assets/icons/calendar-solid.png"),
    outlined: require("../../assets/icons/calender-outlined.png"),
  },
  home_grounds: {
    // Updated key to match filename
    solid: require("../../assets/icons/ground-solid.png"),
    outlined: require("../../assets/icons/ground-outlined.png"),
  },
  accounts: { solid: null, outlined: null },
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ORIGINAL_WIDTH = SCREEN_WIDTH - 48;
const NAV_WIDTH = ORIGINAL_WIDTH * 0.85; // Slightly wider for 4 tabs
const TAB_WIDTH = NAV_WIDTH / 4;

function MyTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 14,
      stiffness: 150,
      mass: 0.8,
    });
  }, [state.index]);

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      className="absolute self-center flex-row items-center bg-white rounded-full shadow-2xl border border-black/5"
      style={{
        width: NAV_WIDTH,
        bottom: insets.bottom > 0 ? insets.bottom : 20,
        height: 72,
      }}
    >
      <Animated.View
        className="absolute h-[80%] bg-accent/10 rounded-full"
        style={[
          { width: TAB_WIDTH - 8, marginHorizontal: 4 },
          animatedPillStyle,
        ]}
      />

      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const routeName = route.name as TabName;

        // SAFE CHECK: If the route isn't in our icon list, skip rendering to prevent crash
        if (!icons[routeName] && routeName !== "accounts") return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented)
            navigation.navigate(route.name);
        };

        const getLabel = (name: string) => {
          if (name === "home_grounds") return "Grounds";
          if (name === "accounts") return "Profile";
          return name;
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.6}
            style={{ width: TAB_WIDTH }}
            className="items-center justify-center pt-1"
          >
            <View className="items-center justify-center mb-0.5">
              {routeName === "accounts" ? (
                <View
                  className={`size-7 rounded-full items-center justify-center ${isFocused ? "bg-accent" : "bg-primary/10"}`}
                >
                  <Text
                    className={`text-[8px] font-sans-bold ${isFocused ? "text-white" : "text-primary"}`}
                  >
                    PS
                  </Text>
                </View>
              ) : (
                <Image
                  source={
                    isFocused
                      ? icons[routeName].solid
                      : icons[routeName].outlined
                  }
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: isFocused ? "#ea7a53" : "#08112640",
                  }}
                  resizeMode="contain"
                />
              )}
            </View>
            <Text
              style={{ fontSize: 9 }}
              className={`font-sans-bold capitalize ${isFocused ? "text-accent" : "text-primary/30"}`}
            >
              {getLabel(route.name)}
            </Text>
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
        <Tabs.Screen name="home_grounds" />
        <Tabs.Screen name="accounts" />
      </Tabs>
    </>
  );
}
