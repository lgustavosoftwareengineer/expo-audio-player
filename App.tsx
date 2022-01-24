import { Button, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { AudioPlayer } from "./AudioPlayer";

export default function App() {
  return (
    <View style={styles.container}>
      <AudioPlayer source={require("./assets/test-audio.mp3")} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  trackContainer: {
    margin: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});
