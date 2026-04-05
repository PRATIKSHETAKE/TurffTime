import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE, FAINT_COLOR } from "@/utils/constants";
import "../../global.css";

export default function SignUpScreen() {
  const router = useRouter();

  // Form State
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // UI Toggle States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Strength State
  const [strength, setStrength] = useState({
    label: "Too Short",
    color: "bg-gray-200",
    width: "w-0",
  });

  // Password Strength Calculator
  useEffect(() => {
    const pass = form.password;
    if (!pass) {
      setStrength({ label: "Too Short", color: "bg-gray-200", width: "w-0" });
      return;
    }

    let score = 0;
    if (pass.length > 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;

    if (score <= 1)
      setStrength({ label: "Weak", color: "bg-red-400", width: "w-1/4" });
    else if (score === 2)
      setStrength({ label: "Fair", color: "bg-yellow-400", width: "w-2/4" });
    else if (score === 3)
      setStrength({ label: "Good", color: "bg-blue-400", width: "w-3/4" });
    else
      setStrength({ label: "Strong", color: "bg-green-500", width: "w-full" });
  }, [form.password]);

  // Submit Handler
  const handleSignUp = async () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
    if (form.phone.length < 10) {
      Alert.alert("Error", "Please enter a valid mobile number.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone_number: form.phone,
          password: form.password,
        }),
      });

      if (res.ok) {
        router.replace("/sign-in");
      } else {
        const errorData = await res.json();
        Alert.alert(
          "Registration Failed",
          errorData.detail || "Email or phone might already be taken.",
        );
      }
    } catch (e) {
      Alert.alert("Network Error", "Check your API_BASE IP connection.");
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
        className="px-8 pt-20 pb-10"
      >
        <Text className="text-[32px] font-sans-bold text-primary mb-2">
          Join the <Text className="text-accent">Field</Text>
        </Text>
        <Text className="text-primary/50 font-sans-medium mb-8">
          Create your profile to book turfs and manage your games.
        </Text>

        <View className="space-y-4">
          {/* Names Row */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-[10px] font-sans-bold text-primary/40 uppercase mb-2 ml-1">
                First Name
              </Text>
              <TextInput
                placeholderTextColor={FAINT_COLOR}
                className="bg-white border border-border h-14 rounded-2xl px-5 text-primary font-sans-medium"
                onChangeText={(t) => setForm({ ...form, firstName: t })}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-sans-bold text-primary/40 uppercase mb-2 ml-1">
                Last Name
              </Text>
              <TextInput
                placeholderTextColor={FAINT_COLOR}
                className="bg-white border border-border h-14 rounded-2xl px-5 text-primary font-sans-medium"
                onChangeText={(t) => setForm({ ...form, lastName: t })}
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-[10px] font-sans-bold text-primary/40 uppercase mb-2 ml-1">
              Email Address
            </Text>
            <TextInput
              placeholderTextColor={FAINT_COLOR}
              className="bg-white border border-border h-14 rounded-2xl px-5 text-primary font-sans-medium"
              placeholder="name@mail.in"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(t) => setForm({ ...form, email: t })}
            />
          </View>

          {/* Mobile Number */}
          <View className="mb-4">
            <Text className="text-[10px] font-sans-bold text-primary/40 uppercase mb-2 ml-1">
              Mobile Number
            </Text>
            <TextInput
              placeholderTextColor={FAINT_COLOR}
              className="bg-white border border-border h-14 rounded-2xl px-5 text-primary font-sans-medium"
              placeholder="0123456789"
              keyboardType="phone-pad"
              onChangeText={(t) => setForm({ ...form, phone: t })}
            />
          </View>

          {/* Password with Eye Toggle & Strength Meter */}
          <View className="mb-2">
            <Text className="text-[10px] font-sans-bold text-primary/40 uppercase mb-2 ml-1">
              Password
            </Text>
            <View className="flex-row items-center bg-white border border-border h-14 rounded-2xl px-5">
              <TextInput
                placeholderTextColor={FAINT_COLOR}
                className="flex-1 text-primary font-sans-medium"
                placeholder="Min. 8 characters"
                secureTextEntry={!showPassword}
                onChangeText={(t) => setForm({ ...form, password: t })}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={FAINT_COLOR}
                />
              </TouchableOpacity>
            </View>

            {/* Strength Indicator Bar */}
            <View className="flex-row items-center justify-between mt-2 px-1">
              <View className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-3">
                <View
                  className={`h-full ${strength.color} ${strength.width}`}
                />
              </View>
              <Text className="text-[10px] font-sans-bold text-primary/40 uppercase">
                {strength.label}
              </Text>
            </View>
          </View>

          {/* Confirm Password with Eye Toggle */}
          <View className="mb-8">
            <Text className="text-[10px] font-sans-bold text-primary/40 uppercase mb-2 ml-1">
              Confirm Password
            </Text>
            <View className="flex-row items-center bg-white border border-border h-14 rounded-2xl px-5">
              <TextInput
                placeholderTextColor={FAINT_COLOR}
                className="flex-1 text-primary font-sans-medium"
                placeholder=""
                secureTextEntry={!showConfirmPassword}
                onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={FAINT_COLOR}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            className="bg-accent h-16 rounded-2xl items-center justify-center shadow-lg shadow-accent/20"
            activeOpacity={0.8}
          >
            <Text className="text-white font-sans-bold text-lg">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation to Sign In */}
        <TouchableOpacity
          onPress={() => router.push("/sign-in")}
          className="mt-8 items-center"
        >
          <Text className="font-sans-medium text-primary/60">
            {"Already have an account? "}
            <Text className="text-accent font-sans-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
