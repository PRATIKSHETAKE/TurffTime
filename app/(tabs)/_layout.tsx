import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeInDown,
  FadeOutDown,
} from "react-native-reanimated";
import { useAuth } from "../../context/AuthContext"; // Ensure this path is correct
import "../../global.css";

type TabName = "home" | "bookings" | "grounds" | "accounts";

// We keep the map for others, but accounts will be handled separately
const icons: Record<
  Exclude<TabName, "accounts">,
  { solid: any; outlined: any }
> = {
  home: {
    solid: require("../../assets/icons/home-solid.png"),
    outlined: require("../../assets/icons/home-outlined.png"),
  },
  bookings: {
    solid: require("../../assets/icons/calendar-solid.png"),
    outlined: require("../../assets/icons/calender-outlined.png"),
  },
  grounds: {
    solid: require("../../assets/icons/ground-solid.png"),
    outlined: require("../../assets/icons/ground-outlined.png"),
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NAV_WIDTH = (SCREEN_WIDTH - 48) * 0.9;
const TAB_WIDTH = NAV_WIDTH / 4;

function MyTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth(); // 1. Pull user data from context
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 110,
      stiffness: 1000,
    });
  }, [state.index]);

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // 2. Extract Initials Logic
  const getInitials = () => {
    const first = user?.first_name?.charAt(0) || "";
    const last = user?.last_name?.charAt(0) || "";
    return (first + last).toUpperCase() || "P";
  };

  return (
    <View
      className="nav-main"
      style={{
        width: NAV_WIDTH,
        height: 64,
        bottom: insets.bottom > 0 ? insets.bottom : 20,
      }}
    >
      <Animated.View
        className="nav-active-pill"
        style={[
          { width: TAB_WIDTH - 8, marginHorizontal: 4 },
          animatedPillStyle,
        ]}
      />

      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const routeName = route.name as TabName;

        const getLabel = (name: string) => {
          if (name === "grounds") return "Grounds";
          if (name === "accounts") return "Profile";
          return name;
        };

        const baseSize = routeName === "grounds" ? 29 : 23;
        const finalIconSize = isFocused ? baseSize * 0.8 : baseSize;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            className="nav-tab-item"
            style={{ width: TAB_WIDTH }}
          >
            <View className="items-center justify-center">
              {/* 3. DYNAMIC CONTENT: Avatar for Accounts, Icons for others */}
              {routeName === "accounts" ? (
                <View
                  style={{
                    width: finalIconSize + 2,
                    height: finalIconSize + 2,
                    borderRadius: 100,
                    backgroundColor: isFocused ? "#ea7a53" : "transparent",
                    borderWidth: isFocused ? 0 : 1.5,
                    borderColor: "#08112640",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: isFocused ? 9 : 10,
                      fontWeight: "900",
                      color: isFocused ? "white" : "#08112640",
                    }}
                  >
                    {getInitials()}
                  </Text>
                </View>
              ) : (
                <Animated.Image
                  source={
                    isFocused
                      ? (icons as any)[routeName].solid
                      : (icons as any)[routeName].outlined
                  }
                  style={{
                    width: finalIconSize,
                    height: finalIconSize,
                    tintColor: isFocused ? "#ea7a53" : "#08112640",
                  }}
                  resizeMode="contain"
                />
              )}

              {isFocused && (
                <Animated.Text
                  entering={FadeInDown.duration(200)}
                  exiting={FadeOutDown.duration(150)}
                  className="nav-label"
                  style={{ fontSize: 11, fontWeight: "900", marginTop: 2 }}
                >
                  {getLabel(route.name)}
                </Animated.Text>
              )}
            </View>
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
        <Tabs.Screen name="grounds" />
        <Tabs.Screen name="accounts" />
      </Tabs>
    </>
  );
}
