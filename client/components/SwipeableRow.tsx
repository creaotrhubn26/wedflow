import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { EvendiIcon } from "@/components/EvendiIcon";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

const SWIPE_THRESHOLD = -80;
const ACTION_WIDTH = 140;

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  editLabel?: string;
  deleteLabel?: string;
  backgroundColor?: string;
}

export function SwipeableRow({
  children,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  editLabel = "Endre",
  deleteLabel = "Slett",
  backgroundColor,
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const isOpen = useSharedValue(false);

  const actionCount = (showEdit ? 1 : 0) + (showDelete ? 1 : 0);
  const totalActionWidth = actionCount * 70;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (isOpen.value) {
        translateX.value = Math.max(-totalActionWidth, Math.min(0, e.translationX - totalActionWidth));
      } else {
        translateX.value = Math.max(-totalActionWidth, Math.min(0, e.translationX));
      }
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-totalActionWidth, { damping: 20 });
        isOpen.value = true;
      } else {
        translateX.value = withSpring(0, { damping: 20 });
        isOpen.value = false;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleEdit = () => {
    translateX.value = withSpring(0, { damping: 20 });
    isOpen.value = false;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit?.();
  };

  const handleDelete = () => {
    translateX.value = withSpring(0, { damping: 20 });
    isOpen.value = false;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        {showEdit && onEdit ? (
          <Pressable style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
            <EvendiIcon name="edit-2" size={18} color="#FFF" />
            <ThemedText style={styles.actionText}>{editLabel}</ThemedText>
          </Pressable>
        ) : null}
        {showDelete && onDelete ? (
          <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
            <EvendiIcon name="trash-2" size={18} color="#FFF" />
            <ThemedText style={styles.actionText}>{deleteLabel}</ThemedText>
          </Pressable>
        ) : null}
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, backgroundColor ? { backgroundColor } : null, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: BorderRadius.md,
  },
  actionsContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
  },
  actionButton: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  editButton: {
    backgroundColor: Colors.dark.accent,
  },
  deleteButton: {
    backgroundColor: "#DC3545",
  },
  actionText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "500",
  },
  content: {
    borderRadius: BorderRadius.md,
  },
});
