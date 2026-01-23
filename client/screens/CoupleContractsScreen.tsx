import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  RefreshControl,
  FlatList,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getCoupleContracts, updateContract, CoupleContract } from "@/lib/api-couple-data";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentProps<typeof Feather>["name"] }> = {
  active: { label: "Aktiv", color: "#4CAF50", icon: "check-circle" },
  pending: { label: "Venter", color: "#FF9800", icon: "clock" },
  completed: { label: "Fullført", color: "#2196F3", icon: "award" },
  cancelled: { label: "Kansellert", color: "#F44336", icon: "x-circle" },
};

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  "Fotograf": "camera",
  "Videograf": "video",
  "Catering": "coffee",
  "Lokale": "home",
  "Musikk": "music",
  "Blomster": "aperture",
  "Pynt": "gift",
  "Bryllupskake": "heart",
  "Annet": "more-horizontal",
};

// Map vendor categories to planning screens
const CATEGORY_PLANNING_SCREENS: Record<string, { screen: string; label: string }> = {
  "Catering": { screen: "Catering", label: "Planlegg catering" },
  "Blomster": { screen: "Blomster", label: "Planlegg blomster" },
  "Bryllupskake": { screen: "Kake", label: "Planlegg bryllupskake" },
  "Transport": { screen: "Transport", label: "Planlegg transport" },
  "Hår/Makeup": { screen: "HaarMakeup", label: "Planlegg styling" },
};

export default function CoupleContractsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const { data: contracts = [], isLoading, refetch } = useQuery({
    queryKey: ["couple-contracts"],
    queryFn: getCoupleContracts,
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => updateContract(id, { status: "completed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["couple-contracts"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const [expandedContract, setExpandedContract] = useState<string | null>(null);

  const handleComplete = (contract: CoupleContract) => {
    Alert.alert(
      "Fullfør avtale",
      `Er du sikker på at du vil markere avtalen med ${contract.vendorName} som fullført? Dette betyr at jobben er utført og leveransen mottatt.`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Fullfør",
          style: "default",
          onPress: () => completeMutation.mutate(contract.id),
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Ikke satt";
    const date = new Date(dateString);
    return date.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "Ikke oppgitt";
    return amount.toLocaleString("nb-NO") + " kr";
  };

  const renderContract = ({ item: contract, index }: { item: CoupleContract; index: number }) => {
    const status = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending;
    const isExpanded = expandedContract === contract.id;
    const categoryIcon = CATEGORY_ICONS[contract.vendorCategory || ""] || "briefcase";

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => {
            setExpandedContract(isExpanded ? null : contract.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <View style={[styles.contractCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            {/* Header */}
            <View style={styles.contractHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: Colors.dark.accent + "20" }]}>
                <Feather name={categoryIcon} size={20} color={Colors.dark.accent} />
              </View>
              <View style={styles.contractInfo}>
                <ThemedText style={styles.vendorName} numberOfLines={1}>
                  {contract.vendorName || "Ukjent leverandør"}
                </ThemedText>
                {contract.vendorCategory && (
                  <ThemedText style={[styles.categoryText, { color: theme.textSecondary }]}>
                    {contract.vendorCategory}
                  </ThemedText>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
                <Feather name={status.icon} size={12} color={status.color} />
                <ThemedText style={[styles.statusText, { color: status.color }]}>
                  {status.label}
                </ThemedText>
              </View>
            </View>

            {/* Summary Row */}
            <View style={[styles.summaryRow, { borderTopColor: theme.border }]}>
              <View style={styles.summaryItem}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textMuted }]}>Total</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: Colors.dark.accent }]}>
                  {formatCurrency(contract.offerTotalAmount)}
                </ThemedText>
              </View>
              <View style={styles.summaryItem}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textMuted }]}>Dato</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {formatDate(contract.createdAt)}
                </ThemedText>
              </View>
              <Feather
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.textMuted}
              />
            </View>

            {/* Expanded Content */}
            {isExpanded && (
              <Animated.View entering={FadeInRight.duration(200)} style={styles.expandedContent}>
                <View style={[styles.detailsSection, { borderTopColor: theme.border }]}>
                  {/* Notification Settings */}
                  <View style={styles.notificationRow}>
                    <View style={styles.notificationItem}>
                      <Feather
                        name={contract.canViewSchedule ? "calendar" : "calendar-off" as any}
                        size={16}
                        color={contract.canViewSchedule ? Colors.dark.accent : theme.textMuted}
                      />
                      <ThemedText style={[styles.notificationText, { color: theme.textSecondary }]}>
                        {contract.canViewSchedule ? "Kan se kjøreplan" : "Ingen tilgang til kjøreplan"}
                      </ThemedText>
                    </View>
                    <View style={styles.notificationItem}>
                      <Feather
                        name={contract.canViewSpeeches ? "mic" : "mic-off"}
                        size={16}
                        color={contract.canViewSpeeches ? Colors.dark.accent : theme.textMuted}
                      />
                      <ThemedText style={[styles.notificationText, { color: theme.textSecondary }]}>
                        {contract.canViewSpeeches ? "Kan se taler" : "Ingen tilgang til taler"}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Start Planning Button - only show if category has a planning screen */}
                  {contract.status === "active" && contract.vendorCategory && CATEGORY_PLANNING_SCREENS[contract.vendorCategory] && (
                    <Pressable
                      onPress={() => {
                        const planningScreen = CATEGORY_PLANNING_SCREENS[contract.vendorCategory!];
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        // Navigate to Planning tab and then to the specific planning screen
                        navigation.dispatch(
                          CommonActions.navigate({
                            name: "Planning",
                            params: {
                              screen: planningScreen.screen,
                            },
                          })
                        );
                      }}
                      style={[styles.startPlanningButton, { backgroundColor: Colors.dark.accent + "15" }]}
                    >
                      <Feather name="clipboard" size={18} color={Colors.dark.accent} />
                      <ThemedText style={[styles.startPlanningText, { color: Colors.dark.accent }]}>
                        {CATEGORY_PLANNING_SCREENS[contract.vendorCategory].label}
                      </ThemedText>
                      <Feather name="arrow-right" size={16} color={Colors.dark.accent} />
                    </Pressable>
                  )}

                  {/* Complete Button */}
                  {contract.status === "active" && (
                    <Button
                      onPress={() => handleComplete(contract)}
                      style={styles.completeButton}
                      disabled={completeMutation.isPending}
                    >
                      Merk som fullført
                    </Button>
                  )}

                  {contract.status === "completed" && (
                    <View style={[styles.completedBanner, { backgroundColor: "#4CAF5015" }]}>
                      <Feather name="award" size={20} color="#4CAF50" />
                      <ThemedText style={[styles.completedText, { color: "#4CAF50" }]}>
                        Avtale fullført
                      </ThemedText>
                    </View>
                  )}
                </View>
              </Animated.View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const activeContracts = contracts.filter((c) => c.status === "active");
  const completedContracts = contracts.filter((c) => c.status === "completed");

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={{ color: theme.textSecondary }}>Laster avtaler...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={contracts}
        keyExtractor={(item) => item.id}
        renderItem={renderContract}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.accent} />
        }
        ListHeaderComponent={
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <View style={[styles.statIcon, { backgroundColor: "#4CAF5020" }]}>
                <Feather name="check-circle" size={20} color="#4CAF50" />
              </View>
              <View>
                <ThemedText style={[styles.statValue, { color: "#4CAF50" }]}>{activeContracts.length}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Aktive</ThemedText>
              </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <View style={[styles.statIcon, { backgroundColor: "#2196F320" }]}>
                <Feather name="award" size={20} color="#2196F3" />
              </View>
              <View>
                <ThemedText style={[styles.statValue, { color: "#2196F3" }]}>{completedContracts.length}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Fullført</ThemedText>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="file-text" size={48} color={theme.textMuted} />
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen avtaler ennå</ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              Når du aksepterer tilbud fra leverandører, vises avtalene her
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  contractCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  contractHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  contractInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryText: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  expandedContent: {
    overflow: "hidden",
  },
  detailsSection: {
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  notificationRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  notificationText: {
    fontSize: 12,
  },
  completeButton: {
    marginTop: Spacing.sm,
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  completedText: {
    fontSize: 14,
    fontWeight: "600",
  },
  startPlanningButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  startPlanningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl * 2,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
