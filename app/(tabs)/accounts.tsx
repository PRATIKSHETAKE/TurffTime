import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext"; // Ensure this path is correct
import { useRouter } from "expo-router";

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // 1. EXTRACT INITIALS LOGIC (First + Last)
  // Pratik Shetake -> "PS"
  const getInitials = () => {
    const first = user?.first_name?.charAt(0) || "";
    const last = user?.last_name?.charAt(0) || "";
    return (first + last).toUpperCase() || "P"; // Fallback to "P" if no names
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            // AuthContext handles state, but pushing to login ensures clean navigation
            router.replace("/sign-in");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fffaf9]">
      <View className="px-6 pt-10">
        {/* --- PROFILE HEADER --- */}
        <View className="items-center mb-10">
          {/* 2. DYNAMIC AVATAR CONTAINER */}
          {/* Using professional gray border/bg matching your inactive navbar theme */}
          <View className="size-24 rounded-full bg-primary/10 items-center justify-center border-4 border-white shadow-sm mb-4">
            <Text className="text-3xl font-sans-extrabold text-accent">
              {getInitials()} {/* Display "PS" */}
            </Text>
          </View>

          <Text className="text-2xl font-sans-extrabold text-primary">
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-sm font-sans-medium text-primary/40">
            {user?.email}
          </Text>
        </View>

        {/* --- ACCOUNT OPTIONS LIST --- */}
        <View className="bg-white rounded-[32px] p-2 border border-border shadow-sm">
          <AccountOption icon="person-outline" title="Edit Profile" />
          <AccountOption icon="notifications-outline" title="Notifications" />
          <AccountOption
            icon="shield-checkmark-outline"
            title="Privacy & Security"
          />
          <AccountOption icon="help-circle-outline" title="Support" />

          {/* LOGOUT BUTTON */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="flex-row items-center p-4 mt-2"
          >
            <View className="size-10 rounded-full bg-red-50 items-center justify-center mr-4">
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </View>
            <Text className="flex-1 font-sans-bold text-red-500 text-base">
              Logout
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#ef444455" />
          </TouchableOpacity>
        </View>

        {/* --- VERSION INFO --- */}
        <Text className="text-center text-[10px] font-sans-bold text-primary/20 uppercase tracking-widest mt-8">
          Turf Reservation v1.0.4
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Simple Helper Component for the list rows
function AccountOption({ icon, title }: { icon: any; title: string }) {
  return (
    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50">
      <View className="size-10 rounded-full bg-primary/5 items-center justify-center mr-4">
        <Ionicons name={icon} size={20} color="#0f172a" />
      </View>
      <Text className="flex-1 font-sans-bold text-primary text-base">
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#0f172a22" />
    </TouchableOpacity>
  );
}
