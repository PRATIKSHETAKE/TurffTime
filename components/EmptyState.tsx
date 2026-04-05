import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

interface EmptyStateProps {
  message: string;
  subMessage?: string;
  animationPath: any; // e.g., require('../assets/animation/empty.json')
}

export default function EmptyState({
  message,
  subMessage,
  animationPath,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <LottieView
        source={animationPath}
        autoPlay
        loop
        style={styles.animation}
      />
      <Text className="text-xl font-sans-bold text-primary mt-4 text-center">
        {message}
      </Text>
      {subMessage && (
        <Text className="text-sm font-sans-medium text-primary/40 mt-2 text-center px-10">
          {subMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100, // Centers it visually above the tab bar
  },
  animation: {
    width: 250,
    height: 250,
  },
});
