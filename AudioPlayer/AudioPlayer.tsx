import React, { useEffect, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Slider from "@react-native-community/slider";
import { Audio, AVPlaybackNativeSource } from "expo-av";

import PlayPauseButton from "./PlayPauseButton";

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

const DEFAULT_TRACK_LINE_WIDTH = 300;
const DEFAULT_TRACK_LINE_STYLE: ViewStyle = {
  width: DEFAULT_TRACK_LINE_WIDTH,
};

function defaultEmptyFunction() {
  return null;
}

export type AudioPlayerProps = {
  onFinished?: () => void;
  onReset?: () => void;
  onStart?: () => void;
  onTrackValueChange?: (value: number) => void;
  source: AVPlaybackNativeSource;
  trackLineStyle?: StyleProp<ViewStyle>;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
};

export default function AudioPlayer({
  source,
  onFinished = defaultEmptyFunction,
  onReset = defaultEmptyFunction,
  onStart = defaultEmptyFunction,
  onTrackValueChange,
  trackLineStyle = DEFAULT_TRACK_LINE_STYLE,
  minimumTrackTintColor = "#61dafb",
  maximumTrackTintColor = "#9cdafd",
  thumbTintColor = "#61dafb",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Sound>();
  const [soundStatus, setSoundStatus] =
    useState<SoundStatus>(DEFAULT_SOUND_STATUS);

  if (!source) {
    throw new Error("To use AudioPlayer component need the source property");
  }

  async function loadAndPlaySound() {
    const { sound } = await Audio.Sound.createAsync(source);
    setSound(sound);
    await sound.playAsync();
  }
  function resetSound() {
    onReset();
    setIsPlaying(false);
    sound?.setPositionAsync(0);
    sound?.stopAsync();
  }
  function onPressPlay() {
    onStart();
    if (!sound) {
      loadAndPlaySound();
    }
    setIsPlaying(true);
    sound?.playAsync();
  }
  function onPressStop() {
    setIsPlaying(false);
    sound?.pauseAsync();
  }
  function onPressPlayPauseButton() {
    return isPlaying ? onPressStop() : onPressPlay();
  }
  function onTrackIndicatorChange(value: number) {
    onTrackValueChange && onTrackValueChange(value);
    sound?.setPositionAsync(value);
  }

  const isSoundFinished =
    soundStatus?.positionMillis === soundStatus?.durationMillis;

  useEffect(() => {
    if (sound) {
      sound
        .getStatusAsync()
        .then((data) => setSoundStatus(data as SoundStatus));
    }
    return;
  }, [sound, soundStatus]);
  useEffect(() => {
    return () => {
      sound && sound.unloadAsync();
    };
  }, [sound]);
  useEffect(() => {
    if (isSoundFinished) {
      onFinished();
      resetSound();
    }
  }, [isSoundFinished]);

  return (
    <View style={styles.trackContainer}>
      <PlayPauseButton onPress={onPressPlayPauseButton} isPlaying={isPlaying} />
      <Slider
        style={trackLineStyle}
        minimumValue={0}
        maximumValue={soundStatus.durationMillis}
        value={soundStatus.positionMillis}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor}
        onValueChange={onTrackIndicatorChange}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  trackContainer: {
    margin: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});
