import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/constants";

// Helper to generate the next 14 days
const getNextDays = (count: number) => {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

// Generate time slots from 6 AM to 11 PM
const ALL_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6;
  return `${hour.toString().padStart(2, "0")}:00`;
});

export default function BookingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Extract parameters passed from the Details screen
  const { turfId, turfName, pitchId, pitchName, price } = useLocalSearchParams<{
    turfId: string;
    turfName: string;
    pitchId: string;
    pitchName: string;
    price: string;
  }>();

  // --- STATE ---
  const [dates] = useState(getNextDays(14));
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [slotStatuses, setSlotStatuses] = useState<Record<string, string>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);

  // --- FETCH SLOT STATUSES ---
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedTime(null); // Reset selected time when date changes

      const dateString = selectedDate.toISOString().split("T")[0];

      try {
        const response = await fetch(
          `${API_BASE}/bookings/booked-slots?pitch_id=${pitchId}&target_date=${dateString}`,
        );
        if (response.ok) {
          const data = await response.json();
          setSlotStatuses(data); // Save the dictionary of statuses
        }
      } catch (error) {
        console.error("Failed to fetch slots", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (pitchId) fetchSlots();
  }, [selectedDate, pitchId]);

  // --- HANDLE BOOKING CREATION ---
  const confirmBooking = async () => {
    if (!user) return Alert.alert("Error", "You must be logged in.");

    setIsProcessing(true);
    const dateString = selectedDate.toISOString().split("T")[0];
    const startHour = parseInt(selectedTime!.split(":")[0]);
    const endTimeStr = `${(startHour + 1).toString().padStart(2, "0")}:00`;

    try {
      const response = await fetch(`${API_BASE}/bookings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          turf_id: parseInt(turfId),
          pitch_id: parseInt(pitchId),
          booking_date: dateString,
          start_time: `${selectedTime}:00`,
          end_time: `${endTimeStr}:00`,
          total_price: parseFloat(price),
          payment_method: paymentMethod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowPaymentModal(false);

        // ✅ NEW: Route to the Success Screen with all the ticket data
        router.push({
          pathname: "/booking-success",
          params: {
            turfName: turfName,
            pitchName: pitchName,
            date: selectedDate.toDateString(),
            time: selectedTime,
            receipt: data.transaction_ref,
          },
        });
      } else {
        Alert.alert(
          "Booking Failed",
          data.detail || "Slot might have just been taken.",
        );
        setShowPaymentModal(false);
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not process transaction.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fffaf9" }}
      edges={["top", "bottom"]}
    >
      {/* --- HEADER --- */}
      <View className="px-6 py-4 flex-row items-center border-b border-border bg-white mt-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="size-10 bg-primary/5 rounded-full items-center justify-center mr-4"
        >
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-sans-extrabold text-primary">
            {turfName}
          </Text>
          <Text className="text-xs font-sans-medium text-primary/50">
            {pitchName} • ₹{price}/hr
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* --- DATE SELECTOR --- */}
        <Text className="px-6 pt-6 pb-4 text-primary/40 font-sans-bold uppercase text-[10px] tracking-[3px]">
          Select Date
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6 pb-2"
        >
          {dates.map((d, i) => {
            const isSelected = selectedDate.toDateString() === d.toDateString();
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedDate(d)}
                className={`items-center justify-center mr-3 w-16 h-20 rounded-2xl border ${
                  isSelected
                    ? "bg-accent border-accent shadow-md"
                    : "bg-white border-border"
                }`}
              >
                <Text
                  className={`font-sans-bold text-xs uppercase mb-1 ${isSelected ? "text-white/80" : "text-primary/40"}`}
                >
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
                <Text
                  className={`font-sans-extrabold text-xl ${isSelected ? "text-white" : "text-primary"}`}
                >
                  {d.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* --- TIME SELECTOR (TRAFFIC LIGHT SYSTEM) --- */}
        <Text className="px-6 pt-8 pb-4 text-primary/40 font-sans-bold uppercase text-[10px] tracking-[3px]">
          Select Time Slot
        </Text>

        {loadingSlots ? (
          <ActivityIndicator color="#ea7a53" className="mt-10" />
        ) : (
          <View className="px-6 flex-row flex-wrap justify-between pb-10">
            {ALL_SLOTS.map((time) => {
              const status = slotStatuses[time];
              const isSelected = selectedTime === time;

              // Default state: GREEN (Available)
              let bgColor = "bg-green-50 border-green-200";
              let textColor = "text-green-700";
              let disabled = false;

              // Override 1: RED (Confirmed/Booked)
              if (status === "confirmed") {
                bgColor = "bg-red-50 border-red-200 opacity-60";
                textColor = "text-red-700 line-through";
                disabled = true;
              }
              // Override 2: YELLOW (Pending/Processing)
              else if (status === "pending") {
                bgColor = "bg-yellow-50 border-yellow-300 opacity-80";
                textColor = "text-yellow-700";
                disabled = true;
              }
              // Override 3: ACCENT (Currently Selected by User)
              else if (isSelected) {
                bgColor = "bg-accent border-accent shadow-md";
                textColor = "text-white";
              }

              return (
                <TouchableOpacity
                  key={time}
                  disabled={disabled}
                  onPress={() => setSelectedTime(time)}
                  className={`w-[31%] mb-4 py-4 rounded-2xl border items-center justify-center ${bgColor}`}
                >
                  <Text className={`font-sans-bold ${textColor}`}>{time}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* --- STICKY FOOTER --- */}
      {selectedTime && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-border flex-row items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <View>
            <Text className="text-primary/40 font-sans-bold text-[10px] uppercase tracking-widest">
              Total to Pay
            </Text>
            <Text className="text-2xl font-sans-extrabold text-primary">
              ₹{price}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowPaymentModal(true)}
            className="bg-accent px-10 h-14 rounded-2xl items-center justify-center shadow-lg shadow-accent/30"
          >
            <Text className="text-white font-sans-bold text-lg">Proceed</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- PAYMENT MODAL --- */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => !isProcessing && setShowPaymentModal(false)}
        >
          <View className="bg-white rounded-t-[40px] p-8 pb-12">
            <Text className="text-2xl font-sans-extrabold text-primary mb-6">
              Complete Payment
            </Text>

            <View className="bg-primary/5 rounded-2xl p-5 mb-6">
              <Text className="text-primary/50 font-sans-medium text-xs mb-1">
                Booking Summary
              </Text>
              <Text className="text-primary font-sans-bold text-base">
                {turfName} - {pitchName}
              </Text>
              <Text className="text-primary font-sans-bold text-base mt-1">
                {selectedDate.toDateString()} at {selectedTime}
              </Text>
            </View>

            <Text className="text-primary/40 font-sans-bold text-[10px] uppercase tracking-widest mb-4">
              Payment Method
            </Text>

            {["UPI", "Credit/Debit Card", "Pay at Venue"].map((method) => (
              <TouchableOpacity
                key={method}
                onPress={() => setPaymentMethod(method)}
                className={`flex-row items-center p-4 rounded-2xl border mb-3 ${paymentMethod === method ? "border-accent bg-accent/5" : "border-border bg-white"}`}
              >
                <Ionicons
                  name={
                    paymentMethod === method
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={paymentMethod === method ? "#ea7a53" : "#0f172a55"}
                />
                <Text className="ml-3 font-sans-bold text-primary">
                  {method}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={confirmBooking}
              disabled={isProcessing}
              className={`bg-primary h-16 rounded-2xl items-center justify-center mt-6 ${isProcessing ? "opacity-70" : ""}`}
            >
              <Text className="text-white font-sans-bold text-lg">
                {isProcessing ? "Processing..." : `Pay ₹${price}`}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
