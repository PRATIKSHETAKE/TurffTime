import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

// --- IMPORT YOUR CALENDAR ICON ---
const CALENDAR_ICON = require("../assets/icons/calendar-solid.png");

interface DateSelectorProps {
  onDateChange: (date: Date) => void;
}

export default function DateSelector({ onDateChange }: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Generate 4 days starting from today
  const dates = Array.from({ length: 4 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const onPickerChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
      onDateChange(date);
    }
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  return (
    <View className="mb-6">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const dayNum = date.getDate().toString().padStart(2, "0");

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedDate(date);
                onDateChange(date);
              }}
              className={`w-20 h-24 rounded-[24px] border-2 items-center justify-center bg-white ${
                isSelected ? "border-accent" : "border-primary/10"
              }`}
            >
              <Text
                className={`font-sans-bold text-sm ${isSelected ? "text-accent" : "text-primary/30"}`}
              >
                {dayName}
              </Text>
              <Text
                className={`font-sans-extrabold text-2xl mt-1 ${isSelected ? "text-accent" : "text-primary/60"}`}
              >
                {dayNum}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* --- CUSTOM CALENDAR PICKER CARD --- */}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="w-20 h-24 rounded-[24px] border-2 border-primary/10 items-center justify-center bg-white"
        >
          <Image
            source={CALENDAR_ICON}
            className="size-8"
            resizeMode="contain"
            style={{ tintColor: "#94a3b8" }} // This gives it that nice muted blue-gray look from your screenshot
          />
        </TouchableOpacity>
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)} // 15-day limit
          onChange={onPickerChange}
        />
      )}
    </View>
  );
}
