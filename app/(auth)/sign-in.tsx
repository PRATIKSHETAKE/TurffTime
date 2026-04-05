import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { API_BASE, FAINT_COLOR } from "@/utils/constants";
import "../../global.css";

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useAuth(); // 1. Using 'login' from context

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    const loginUrl = `${API_BASE}/auth/login`;
    console.log("DEBUG: Attempting login at ->", loginUrl); // Check this in your laptop terminal!

    setLoading(true);
    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // 2. FIXED: Changed 'signIn' to 'login' to match your AuthContext
        // We pass 'result' which usually contains { user, access_token }
        await login(result.user);

        console.log("DEBUG: Login successful for", result.user?.email);
        router.replace("/home");
      } else {
        Alert.alert("Login Failed", result.detail || "Invalid credentials.");
      }
    } catch (error) {
      console.log("DEBUG: Network Error Detail ->", error); // Logs the specific fetch error
      Alert.alert(
        "Network Error",
        `Could not connect to ${API_BASE}. Ensure your laptop and phone are on the same Wi-Fi and Uvicorn is running with --host 0.0.0.0`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#fffaf9]"
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-8 pt-32"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-[32px] font-sans-bold text-primary mb-2">
          Welcome <Text className="text-accent">Back</Text>
        </Text>
        <Text className="text-primary/50 font-sans-medium mb-12">
          Log in to continue your game in Kolhapur.
        </Text>

        <View className="space-y-6">
          {/* Email Input */}
          <View>
            <Text className="text-[10px] font-sans-bold text-primary/40 uppercase mb-2 ml-1">
              Email Address
            </Text>
            <TextInput
              placeholderTextColor={FAINT_COLOR}
              className="bg-white border border-border h-14 rounded-2xl px-5 font-sans-medium text-primary"
              placeholder="name@mail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input with Eye Toggle */}
          <View className="mt-4">
            <Text className="text-[10px] font-sans-bold text-primary/40 uppercase mb-2 ml-1">
              Password
            </Text>
            <View className="flex-row items-center bg-white border border-border h-14 rounded-2xl px-5">
              <TextInput
                placeholderTextColor={FAINT_COLOR}
                className="flex-1 text-primary font-sans-medium"
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={FAINT_COLOR}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className={`bg-accent h-16 rounded-2xl items-center justify-center mt-10 shadow-lg shadow-accent/20 ${loading ? "opacity-70" : ""}`}
            activeOpacity={0.8}
          >
            <Text className="text-white font-sans-bold text-lg">
              {loading ? "Authenticating..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation to Sign Up */}
        <TouchableOpacity
          onPress={() => router.push("/sign-up")}
          className="mt-8 mb-10 items-center"
        >
          <Text className="font-sans-medium text-primary/60">
            {"Don't have an account? "}
            <Text className="text-accent font-sans-bold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
