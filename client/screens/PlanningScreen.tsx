import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import {
  getWeddingDetails,
  getSchedule,
  getImportantPeople,
  saveWeddingDetails,
  saveSchedule,
  saveImportantPeople,
} from "@/lib/storage";
import { WeddingDetails, ScheduleEvent, ImportantPerson } from "@/lib/types";

type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const DEFAULT_WEDDING: WeddingDetails = {
  coupleNames: "Emma & Erik",
  weddingDate: "2026-06-20",
  venue: "Oslo Domkirke",
};

const DEFAULT_SCHEDULE: ScheduleEvent[] = [
  { id: "1", time: "14:00", title: "Brudevielse", icon: "heart" },
  { id: "2", time: "16:00", title: "Gratulasjoner", icon: "users" },
  { id: "3", time: "18:00", title: "Fotografering", icon: "camera" },
  { id: "4", time: "19:00", title: "Middag", icon: "coffee" },
];

const DEFAULT_PEOPLE: ImportantPerson[] = [
  { id: "1", name: "Lars Hansen", role: "Toastmaster" },
  { id: "2", name: "Anna Berg", role: "Forlover" },
];

function getDaysUntilWedding(dateStr: string): number {
  const weddingDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weddingDate.setHours(0, 0, 0, 0);
  const diffTime = weddingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatWeddingDate(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("nb-NO", options);
}

export default function PlanningScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [wedding, setWedding] = useState<WeddingDetails | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [people, setPeople] = useState<ImportantPerson[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [weddingData, scheduleData, peopleData] = await Promise.all([
      getWeddingDetails(),
      getSchedule(),
      getImportantPeople(),
    ]);

    if (!weddingData) {
      await saveWeddingDetails(DEFAULT_WEDDING);
      setWedding(DEFAULT_WEDDING);
    } else {
      setWedding(weddingData);
    }

    if (scheduleData.length === 0) {
      await saveSchedule(DEFAULT_SCHEDULE);
      setSchedule(DEFAULT_SCHEDULE);
    } else {
      setSchedule(scheduleData);
    }

    if (peopleData.length === 0) {
      await saveImportantPeople(DEFAULT_PEOPLE);
      setPeople(DEFAULT_PEOPLE);
    } else {
      setPeople(peopleData);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [loadData]);

  const daysLeft = wedding ? getDaysUntilWedding(wedding.weddingDate) : 0;

  const getScheduleIcon = (iconName: ScheduleEvent["icon"]) => {
    return iconName;
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText style={{ color: theme.textSecondary }}>
          Laster...
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.dark.accent}
        />
      }
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={styles.countdownCard}>
          <View style={styles.countdownContent}>
            <ThemedText
              style={[styles.daysNumber, { color: Colors.dark.accent }]}
            >
              {daysLeft}
            </ThemedText>
            <ThemedText
              style={[styles.daysLabel, { color: theme.textSecondary }]}
            >
              dager igjen
            </ThemedText>
          </View>
          <View style={styles.weddingInfo}>
            <ThemedText style={styles.coupleNames}>
              {wedding?.coupleNames}
            </ThemedText>
            <ThemedText
              style={[styles.weddingDate, { color: theme.textSecondary }]}
            >
              {wedding ? formatWeddingDate(wedding.weddingDate) : ""}
            </ThemedText>
            <ThemedText
              style={[styles.venue, { color: theme.textSecondary }]}
            >
              {wedding?.venue}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Card
          elevation={1}
          onPress={() => navigation.navigate("Schedule")}
          style={[styles.sectionCard, { borderColor: theme.border }]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather
                name="clock"
                size={20}
                color={Colors.dark.accent}
                style={styles.sectionIcon}
              />
              <ThemedText type="h3">Kjøreplan</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </View>
          <ThemedText
            style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
          >
            {wedding ? formatWeddingDate(wedding.weddingDate) : ""}
          </ThemedText>

          <View style={styles.schedulePreview}>
            {schedule.slice(0, 3).map((event) => (
              <View key={event.id} style={styles.scheduleItem}>
                <ThemedText
                  style={[styles.scheduleTime, { color: Colors.dark.accent }]}
                >
                  {event.time}
                </ThemedText>
                <Feather
                  name={getScheduleIcon(event.icon)}
                  size={16}
                  color={theme.textSecondary}
                  style={styles.scheduleIcon}
                />
                <ThemedText style={styles.scheduleTitle}>
                  {event.title}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Card
          elevation={1}
          onPress={() => navigation.navigate("ImportantPeople")}
          style={[styles.sectionCard, { borderColor: theme.border }]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather
                name="users"
                size={20}
                color={Colors.dark.accent}
                style={styles.sectionIcon}
              />
              <ThemedText type="h3">Viktige personer</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </View>

          <View style={styles.peoplePreview}>
            {people.slice(0, 3).map((person) => (
              <View key={person.id} style={styles.personItem}>
                <View
                  style={[
                    styles.personAvatar,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <Feather name="user" size={16} color={theme.textSecondary} />
                </View>
                <View style={styles.personInfo}>
                  <ThemedText style={styles.personName}>
                    {person.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.personRole, { color: theme.textSecondary }]}
                  >
                    {person.role}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <View style={styles.quickActions}>
          <QuickActionCard
            icon="camera"
            label="Fotoplan"
            theme={theme}
            onPress={() => {}}
          />
          <QuickActionCard
            icon="users"
            label="Bordplassering"
            theme={theme}
            onPress={() => {}}
          />
          <QuickActionCard
            icon="mic"
            label="Taleliste"
            theme={theme}
            onPress={() => {}}
          />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

interface QuickActionCardProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  theme: any;
  onPress: () => void;
}

function QuickActionCard({ icon, label, theme, onPress }: QuickActionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.quickActionCard,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.quickActionIcon,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name={icon} size={20} color={Colors.dark.accent} />
        </View>
        <ThemedText style={styles.quickActionLabel}>{label}</ThemedText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  countdownCard: {
    flexDirection: "row",
    marginBottom: Spacing["2xl"],
    alignItems: "center",
  },
  countdownContent: {
    alignItems: "center",
    marginRight: Spacing["2xl"],
  },
  daysNumber: {
    fontSize: 56,
    fontWeight: "700",
  },
  daysLabel: {
    fontSize: 14,
    marginTop: -8,
  },
  weddingInfo: {
    flex: 1,
  },
  coupleNames: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  weddingDate: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  venue: {
    fontSize: 14,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.lg,
  },
  schedulePreview: {
    gap: Spacing.md,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: "600",
    width: 50,
  },
  scheduleIcon: {
    marginHorizontal: Spacing.sm,
  },
  scheduleTitle: {
    fontSize: 15,
  },
  peoplePreview: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  personItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  personAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: "500",
  },
  personRole: {
    fontSize: 13,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
