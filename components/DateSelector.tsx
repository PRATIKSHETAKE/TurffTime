import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const CALENDAR_ICON = require("../assets/icons/calendar-solid.png");

interface DateSelectorProps {
  onDateChange: (date: Date) => void;
}

export default function DateSelector({ onDateChange }: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // 1. Generate the standard 4 quick-access days
  const quickDates = Array.from({ length: 4 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  // 2. Check if the current selectedDate is one of the 4 quick dates
  const isSelectedInQuickDates = quickDates.some((d) =>
    isSameDay(d, selectedDate),
  );

  const onPickerChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
      onDateChange(date);
    }
  };

  return (
    <View className="mb-6">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 13 }}
      >
        {/* Render Quick Access Dates */}
        {quickDates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <DateCard
              key={index}
              date={date}
              isSelected={isSelected}
              onPress={() => {
                setSelectedDate(date);
                onDateChange(date);
              }}
            />
          );
        })}

        {/* --- DYNAMIC CALENDAR CARD --- */}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className={`w-16 h-20 rounded-[19px] border-2 items-center justify-center bg-white ${
            !isSelectedInQuickDates ? "border-accent" : "border-primary/10"
          }`}
        >
          {!isSelectedInQuickDates ? (
            // If a custom date is picked, show the date instead of the icon
            <View className="items-center">
              <Text className="font-sans-extraboldbold text-xl text-accent">
                {selectedDate.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <Text className="font-sans-extrabold text-2xl mt-1 text-accent">
                {selectedDate.getDate().toString().padStart(2, "0")}
              </Text>
            </View>
          ) : (
            // Otherwise, show the default calendar icon
            <Image
              source={CALENDAR_ICON}
              className="size-7"
              resizeMode="contain"
              style={{ tintColor: "#94a3b8" }}
            />
          )}
        </TouchableOpacity>
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)}
          onChange={onPickerChange}
        />
      )}
    </View>
  );
}

// Reusable Sub-component for the 4 quick dates
function DateCard({
  date,
  isSelected,
  onPress,
}: {
  date: Date;
  isSelected: boolean;
  onPress: () => void;
}) {
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = date.getDate().toString().padStart(2, "0");

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-16 h-20 rounded-[19px] border-2 items-center justify-center bg-white ${
        isSelected ? "border-accent" : "border-primary/10"
      }`}
    >
      <Text
        className={`font-sans-extraboldbold text-xl ${isSelected ? "text-accent" : "text-primary/30"}`}
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
}
