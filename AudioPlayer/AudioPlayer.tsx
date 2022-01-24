import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Slider, { SliderProps } from "@react-native-community/slider";
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

function millisecondsToMinutesAndSeconds(millis: number) {
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.round((millis % 60000) / 1000);
  const zeroBeforeSeconds = seconds < 10 ? "0" : "";
  return minutes + ":" + zeroBeforeSeconds + seconds;
}
function formatRemainTimeText(remainTime: number) {
  return millisecondsToMinutesAndSeconds(remainTime);
}
function defaultEmptyFunction() {
  return null;
}

type SliderWithOmittedProps = Omit<
  SliderProps,
  | "style"
  | "minimumValue"
  | "maximumValue"
  | "value"
  | "minimumTrackTintColor"
  | "maximumTrackTintColor"
  | "thumbTintColor"
  | "onSlidingComplete"
  | "onSlidingStart"
  | "ref"
>;

export type AudioPlayerProps = {
  onFinished?: () => void;
  onReset?: () => void;
  onStart?: () => void;
  onStop?: () => void;
  onSlidingChangeComplete?: (value: number) => void;
  onSlidingChangeStart?: (value: number) => void;
  source: AVPlaybackNativeSource;
  trackLineStyle?: StyleProp<ViewStyle>;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  playPauseButton?: ({
    isPlaying,
    onPressTogglePlayPauseButton,
  }: {
    isPlaying: boolean;
    onPressTogglePlayPauseButton: () => void;
  }) => JSX.Element;
  remainTimeComponent?: ({ remainTime }: { remainTime: string }) => JSX.Element;
} & SliderWithOmittedProps;

export default function AudioPlayer({
  source,
  onFinished = defaultEmptyFunction,
  onReset = defaultEmptyFunction,
  onStart = defaultEmptyFunction,
  onStop = defaultEmptyFunction,
  onSlidingChangeComplete,
  onSlidingChangeStart,
  trackLineStyle = DEFAULT_TRACK_LINE_STYLE,
  minimumTrackTintColor = "#61dafb",
  maximumTrackTintColor = "#9cdafd",
  thumbTintColor = "#61dafb",
  playPauseButton,
  remainTimeComponent,
  ...props
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Sound>();
  const [soundStatus, setSoundStatus] =
    useState<SoundStatus>(DEFAULT_SOUND_STATUS);

  if (!source) {
    throw new Error("To use AudioPlayer component need the source property");
  }

  const loadSound = useCallback(async () => {
    const { sound } = await Audio.Sound.createAsync(source);
    setSound(sound);
  }, [source]);

  useLayoutEffect(() => {
    loadSound();
  }, [loadSound]);

  function resetSound() {
    onReset();
    setIsPlaying(false);
    sound?.setPositionAsync(0);
    sound?.stopAsync();
  }
  function stopSound() {
    onStop();
    setIsPlaying(false);
    sound?.pauseAsync();
  }
  function startSound() {
    onStart();
    setIsPlaying(true);
    sound?.playAsync();
  }

  function onPressPlay() {
    startSound();
  }
  function onPressStop() {
    stopSound();
  }
  function onPressTogglePlayPauseButton() {
    return isPlaying ? onPressStop() : onPressPlay();
  }
  function onSlidingComplete(value: number) {
    onSlidingChangeComplete && onSlidingChangeComplete(value);
    sound?.setPositionAsync(value);
    onPressPlay();
  }
  function onSlidingStart(value: number) {
    onSlidingChangeStart && onSlidingChangeStart(value);
    stopSound();
  }

  const isSoundFinished =
    soundStatus?.positionMillis === soundStatus?.durationMillis;
  const remainTime =
    soundStatus?.durationMillis &&
    formatRemainTimeText(
      soundStatus?.durationMillis - soundStatus?.positionMillis
    );

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

  function renderPlayPauseButton() {
    return playPauseButton ? (
      playPauseButton({ isPlaying, onPressTogglePlayPauseButton })
    ) : (
      <PlayPauseButton
        onPress={onPressTogglePlayPauseButton}
        isPlaying={isPlaying}
      />
    );
  }
  function renderRemainTimeComponent() {
    if (remainTime) {
      return remainTimeComponent ? (
        remainTimeComponent({ remainTime })
      ) : (
        <Text>{remainTime}</Text>
      );
    }
  }

  return (
    <View style={styles.trackContainer}>
      {renderPlayPauseButton()}
      <Slider
        {...props}
        style={trackLineStyle}
        minimumValue={0}
        maximumValue={soundStatus.durationMillis}
        value={soundStatus.positionMillis}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor}
        onSlidingComplete={onSlidingComplete}
        onSlidingStart={onSlidingStart}
      />
      {renderRemainTimeComponent()}
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
