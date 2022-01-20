import { useRef, useState } from "react";
import {
  Animated,
  Button,
  LayoutChangeEvent,
  LayoutRectangle,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5 } from "@expo/vector-icons";

const TRACK_POINT_SIZE = 18;
const TRACK_LINE_WIDTH = 300;
const LIMIT_TRACK_LINE_OFFSET = TRACK_LINE_WIDTH - 10;
const DEFAULT_ELEMENT_LAYOUT = { height: 0, width: 0, x: 0, y: 0 };

function PlayPauseButton({
  isPlaying = false,
  onPress,
  pauseButtonTintColor = "black",
  playButtonTintColor = "black",
}: {
  isPlaying: boolean;
  onPress: () => void;
  pauseButtonTintColor?: string;
  playButtonTintColor?: string;
}) {
  return isPlaying ? (
    <FontAwesome5.Button
      name="pause"
      size={24}
      color={pauseButtonTintColor}
      backgroundColor="transparent"
      onPress={onPress}
    />
  ) : (
    <FontAwesome5.Button
      name="play"
      size={24}
      color={playButtonTintColor}
      backgroundColor="transparent"
      onPress={onPress}
    />
  );
}

export default function App() {
  const trackIndicatorAnimatedPosition = useRef(new Animated.ValueXY()).current;
  const elementLayout = useRef<LayoutRectangle>(DEFAULT_ELEMENT_LAYOUT);
  const [isPlaying, setIsPlaying] = useState(false);

  function hasTheTrackIndicatorReachedTheLimit() {
    return (
      elementLayout.current.x >= LIMIT_TRACK_LINE_OFFSET ||
      elementLayout.current.x < 0
    );
  }

  function resetTrackIndicatorLocation() {
    setIsPlaying(false);
    trackIndicatorAnimatedPosition.setValue({
      x: 0,
      y: 0,
    });
  }

  const trackIndicatorPositionController = PanResponder.create({
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: () => {
      resetTrackIndicatorLocation();
    },
    onPanResponderMove: Animated.event(
      [
        null,
        {
          dx: trackIndicatorAnimatedPosition.x,
        },
      ],
      { useNativeDriver: false }
    ),
    onPanResponderTerminationRequest: () => true,
    onPanResponderRelease: () => {
      if (hasTheTrackIndicatorReachedTheLimit()) {
        resetTrackIndicatorLocation();
      }

      trackIndicatorAnimatedPosition.flattenOffset();
    },
  });

  function onLayout(event: LayoutChangeEvent) {
    const { x, y, height, width } = event.nativeEvent.layout;
    elementLayout.current = { x, y, height, width };
  }

  const trackLineAnimationTiming = Animated.timing(
    trackIndicatorAnimatedPosition,
    {
      toValue: { x: LIMIT_TRACK_LINE_OFFSET, y: 0 },
      duration: 10000,
      isInteraction: true,
      useNativeDriver: false,
    }
  );

  function onPressPlay() {
    function onTrackLineAnimationTimingFinished() {
      setIsPlaying(false);
      resetTrackIndicatorLocation();
    }
    setIsPlaying(true);

    trackLineAnimationTiming.start(({ finished }) => {
      if (finished) {
        onTrackLineAnimationTimingFinished();
      }
    });
  }
  function onPressStop() {
    setIsPlaying(false);
    trackLineAnimationTiming.stop();
  }
  function onPressReset() {
    setIsPlaying(false);
    trackLineAnimationTiming.reset();
    resetTrackIndicatorLocation();
  }

  function onPressPlayPauseButton() {
    return isPlaying ? onPressStop : onPressPlay;
  }

  return (
    <View style={styles.container}>
      <Button title="Dar play" onPress={onPressPlay} />
      <Button title="Parar" onPress={onPressStop} />
      <Button title="Resetar" onPress={onPressReset} />
      <View style={styles.trackContainer}>
        <PlayPauseButton
          onPress={onPressPlayPauseButton}
          isPlaying={isPlaying}
        />
        <View style={styles.trackLine}>
          <Animated.View
            style={[
              styles.doubleTrackLine,
              {
                width: trackIndicatorAnimatedPosition.x.interpolate({
                  inputRange: [0, LIMIT_TRACK_LINE_OFFSET],
                  outputRange: [
                    TRACK_POINT_SIZE / 2,
                    LIMIT_TRACK_LINE_OFFSET + 10,
                  ],
                }),
              },
            ]}
          />
          <Animated.View
            onLayout={onLayout}
            {...trackIndicatorPositionController.panHandlers}
            style={[
              styles.trackPoint,
              trackIndicatorAnimatedPosition.getLayout(),
            ]}
          />
        </View>
      </View>
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
  trackPoint: {
    height: TRACK_POINT_SIZE,
    width: TRACK_POINT_SIZE,
    borderRadius: TRACK_POINT_SIZE / 2,
    backgroundColor: "#9cdafd",
    transform: [{ translateY: -3 }],
  },
  trackLine: {
    backgroundColor: "#4c616d",
    height: 5,
    width: TRACK_LINE_WIDTH,
    justifyContent: "center",
  },
  doubleTrackLine: {
    backgroundColor: "#61dafb",
    height: 5,
    transform: [{ translateY: 9 }],
  },
  draggableViewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#61dafb",
    width: 80,
    height: 80,
    borderRadius: 4,
  },
});
