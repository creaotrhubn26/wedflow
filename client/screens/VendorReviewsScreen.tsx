import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest, queryClient } from "@/lib/query-client";
import { showToast } from "@/lib/toast";

interface ReviewableContract {
  id: string;
  vendorId: string;
  vendorRole: string | null;
  completedAt: string | null;
  businessName: string;
  imageUrl: string | null;
  hasReview: boolean;
}

interface ExistingReview {
  id: string;
  contractId: string;
  vendorId: string;
  rating: number;
  title: string | null;
  body: string | null;
  isAnonymous: boolean;
  isApproved: boolean;
  editableUntil: string | null;
  createdAt: string;
  businessName: string;
}

export default function VendorReviewsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [selectedContract, setSelectedContract] = useState<ReviewableContract | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: contracts = [], isLoading: loadingContracts } = useQuery<ReviewableContract[]>({
    queryKey: ["/api/couple/reviewable-contracts"],
  });

  const { data: myReviews = [], isLoading: loadingReviews } = useQuery<ExistingReview[]>({
    queryKey: ["/api/couple/reviews"],
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: {
      contractId: string;
      rating: number;
      title: string;
      body: string;
      isAnonymous: boolean;
    }) => {
      return apiRequest("POST", "/api/couple/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couple/reviewable-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/couple/reviews"] });
      setSelectedContract(null);
      setRating(5);
      setTitle("");
      setBody("");
      setIsAnonymous(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Din anmeldelse er sendt og vil bli gjennomgått før publisering.");
    },
    onError: (error: any) => {
      showToast(error.message || "Kunne ikke sende anmeldelse");
    },
  });

  const handleSubmitReview = () => {
    if (!selectedContract) return;
    if (rating < 1 || rating > 5) {
      showToast("Velg antall stjerner (1-5)");
      return;
    }

    submitReviewMutation.mutate({
      contractId: selectedContract.id,
      rating,
      title,
      body,
      isAnonymous,
    });
  };

  const unreviewedContracts = contracts.filter((c) => !c.hasReview);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const canEdit = (review: ExistingReview) => {
    if (!review.editableUntil) return false;
    return new Date() < new Date(review.editableUntil);
  };

  if (loadingContracts || loadingReviews) {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight + Spacing.lg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </ThemedView>
    );
  }

  if (selectedContract) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <Card style={styles.reviewForm}>
          <ThemedText style={Typography.h3}>
            Anmeld {selectedContract.businessName}
          </ThemedText>

          <View style={styles.ratingContainer}>
            <ThemedText style={styles.label}>Din vurdering</ThemedText>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => {
                    setRating(star);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={styles.starButton}
                >
                  <EvendiIcon
                    name="star"
                    size={32}
                    color={star <= rating ? theme.accent : theme.border}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Tittel (valgfritt)</ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="F.eks. Fantastisk opplevelse!"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Din anmeldelse</ThemedText>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
              ]}
              value={body}
              onChangeText={setBody}
              placeholder="Fortell andre kunder om din erfaring..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.anonymousRow}>
            <View style={styles.anonymousTextContainer}>
              <ThemedText style={styles.label}>Anonym anmeldelse</ThemedText>
              <ThemedText style={Typography.caption}>
                Navnet ditt vil ikke vises offentlig
              </ThemedText>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor={theme.backgroundDefault}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={() => setSelectedContract(null)}
            >
              <ThemedText style={Typography.body}>Avbryt</ThemedText>
            </Pressable>
            <Button
              onPress={handleSubmitReview}
              disabled={submitReviewMutation.isPending}
              style={styles.submitButton}
            >
              {submitReviewMutation.isPending ? "Sender..." : "Send anmeldelse"}
            </Button>
          </View>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      {unreviewedContracts.length > 0 ? (
        <>
          <ThemedText style={Typography.h3}>Gi anmeldelse</ThemedText>
          <ThemedText style={[Typography.small, { opacity: 0.7, marginBottom: Spacing.lg }]}>
            Hjelp andre kunder ved å dele din erfaring
          </ThemedText>
          {unreviewedContracts.map((contract) => (
            <Card key={contract.id} style={styles.contractCard}>
              <View style={styles.contractInfo}>
                <ThemedText style={Typography.h4}>{contract.businessName}</ThemedText>
                {contract.vendorRole ? (
                  <ThemedText style={[Typography.caption, { opacity: 0.7 }]}>{contract.vendorRole}</ThemedText>
                ) : null}
              </View>
              <Pressable
                style={[styles.reviewButton, { backgroundColor: theme.accent }]}
                onPress={() => setSelectedContract(contract)}
              >
                <EvendiIcon name="star" size={16} color={theme.buttonText} />
                <ThemedText style={[Typography.small, { color: theme.buttonText, fontWeight: "600" }]}>
                  Gi anmeldelse
                </ThemedText>
              </Pressable>
            </Card>
          ))}
        </>
      ) : null}

      {myReviews.length > 0 ? (
        <>
          <ThemedText style={[Typography.h3, { marginTop: Spacing.xl }]}>
            Dine anmeldelser
          </ThemedText>
          {myReviews.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <ThemedText style={Typography.h4}>{review.businessName}</ThemedText>
                <View style={styles.ratingBadge}>
                  <EvendiIcon name="star" size={14} color={theme.accent} />
                  <ThemedText style={[Typography.body, { color: theme.accent, fontWeight: "700" }]}>
                    {review.rating}
                  </ThemedText>
                </View>
              </View>
              {review.title ? (
                <ThemedText style={[Typography.body, { fontWeight: "600", marginBottom: Spacing.xs }]}>{review.title}</ThemedText>
              ) : null}
              {review.body ? (
                <ThemedText style={[Typography.small, { opacity: 0.8, marginBottom: Spacing.sm }]}>{review.body}</ThemedText>
              ) : null}
              <View style={styles.reviewMeta}>
                <ThemedText style={[Typography.caption, { opacity: 0.6 }]}>{formatDate(review.createdAt)}</ThemedText>
                {review.isApproved ? (
                  <View style={[styles.statusBadge, { backgroundColor: theme.success + "20" }]}>
                    <ThemedText style={[Typography.caption, { color: theme.success }]}>
                      Publisert
                    </ThemedText>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: theme.accent + "20" }]}>
                    <ThemedText style={[Typography.caption, { color: theme.accent }]}>
                      Under gjennomgang
                    </ThemedText>
                  </View>
                )}
              </View>
              {canEdit(review) ? (
                <ThemedText style={[Typography.caption, { opacity: 0.6, marginTop: Spacing.sm, fontStyle: "italic" }]}>
                  Kan redigeres til {formatDate(review.editableUntil!)}
                </ThemedText>
              ) : null}
            </Card>
          ))}
        </>
      ) : null}

      {unreviewedContracts.length === 0 && myReviews.length === 0 ? (
        <Card style={styles.emptyCard}>
          <EvendiIcon name="star" size={48} color={theme.textSecondary} />
          <ThemedText style={[Typography.h3, { marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>Ingen anmeldelser ennå</ThemedText>
          <ThemedText style={[Typography.small, { opacity: 0.7, textAlign: "center", paddingHorizontal: Spacing.lg }]}>
            Når du fullfører en avtale med en leverandør, kan du gi dem en anmeldelse her.
          </ThemedText>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contractCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  contractInfo: {
    flex: 1,
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  reviewCard: {
    marginTop: Spacing.md,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  reviewForm: {
    marginBottom: Spacing.xl,
  },
  ratingContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.small,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  starsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  starButton: {
    padding: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Typography.body,
  },
  textArea: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Typography.body,
    minHeight: 120,
  },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  anonymousTextContainer: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    flex: 2,
  },
});
