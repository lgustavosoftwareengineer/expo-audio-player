import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  LayoutChangeEvent,
  LayoutRectangle,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5 } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio, AVPlaybackStatus } from "expo-av";
import React from "react";
import { AudioPlayer } from "./AudioPlayer";

const TRACK_POINT_SIZE = 18;
const TRACK_LINE_WIDTH = 300;
const LIMIT_TRACK_LINE_OFFSET = TRACK_LINE_WIDTH - 10;
const DEFAULT_ELEMENT_LAYOUT = { height: 0, width: 0, x: 0, y: 0 };

export type Sound = Audio.Sound;

export type SoundStatus = {
  isLoaded: true;
  androidImplementation?: string;
  uri: string;
  progressUpdateIntervalMillis: number;
  durationMillis?: number;
  positionMillis: number;
  playableDurationMillis?: number;
  seekMillisToleranceBefore?: number;
  seekMillisToleranceAfter?: number;
  shouldPlay: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  rate: number;
  shouldCorrectPitch: boolean;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  didJustFinish: boolean;
};

const DEFAULT_SOUND_STATUS: SoundStatus = {
  isLoaded: true,
  androidImplementation: "",
  uri: "",
  progressUpdateIntervalMillis: 0,
  durationMillis: 0,
  positionMillis: 0,
  playableDurationMillis: 0,
  seekMillisToleranceBefore: 0,
  seekMillisToleranceAfter: 0,
  shouldPlay: false,
  isPlaying: false,
  isBuffering: false,
  rate: 0,
  shouldCorrectPitch: false,
  volume: 0,
  isMuted: false,
  isLooping: false,
  didJustFinish: false,
};

export default function App() {
  return (
    <View style={styles.container}>
      <AudioPlayer
        source={require("./assets/test-audio.mp3")}
        trackLineStyle={{ height: 100, width: 300, backgroundColor: "red" }}
      />
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
