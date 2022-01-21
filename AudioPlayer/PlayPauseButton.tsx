import { TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export type PlayPauseButtonProps = {
  isPlaying: boolean;
  onPress: () => void;
  pauseButtonTintColor?: string;
  playButtonTintColor?: string;
  iconSize?: number;
};

const DEFAULT_ICON_SIZE = 24;

export default function PlayPauseButton({
  isPlaying = false,
  onPress,
  pauseButtonTintColor = "black",
  playButtonTintColor = "black",
  iconSize = DEFAULT_ICON_SIZE,
}: PlayPauseButtonProps) {
  const iconName = isPlaying ? "pause" : "play";
  const iconColor = isPlaying ? pauseButtonTintColor : playButtonTintColor;

  return (
    <TouchableOpacity onPress={onPress}>
      <FontAwesome5 name={iconName} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
}
