import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  Image,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../constants/theme";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";

interface SubscriptionTier {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceNok: number;
  features: {
    maxPhotos: number;
    analytics: boolean;
    prioritizedInSearch: boolean;
  };
}

interface SubscriptionStatus {
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string;
  };
  tier: SubscriptionTier;
  daysRemaining: number;
  needsPayment: boolean;
  isPaused: boolean;
  isTrialing: boolean;
}

export default function VendorPaymentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch subscription status
  const { data: subscriptionStatus, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["vendor", "subscription", "status"],
    queryFn: async () => {
      const response = await fetch("/api/vendor/subscription/status", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vendor_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Kunne ikke hente abonnementsinformasjon");
      }
      return response.json();
    },
  });

  // Vipps Recurring payment mutation
  // Calls /api/subscription/vipps/initiate to start agreement
  // Follows Vipps brand guidelines for payment flow
  const vippsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription/vipps/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vendor_token")}`,
        },
        body: JSON.stringify({
          subscriptionId: subscriptionStatus?.subscription.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke initiere betaling");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      // Redirect to Vipps checkout
      // data.url should contain the Vipps agreement confirmation URL
      if (data.url || data.vippsConfirmationUrl) {
        const vippsUrl = data.url || data.vippsConfirmationUrl;
        const supported = await Linking.canOpenURL(vippsUrl);
        if (supported) {
          await Linking.openURL(vippsUrl);
        } else {
          showToast("Kunne ikke åpne Vipps");
        }
      }

      // Refresh subscription status after payment
      queryClient.invalidateQueries({ queryKey: ["vendor", "subscription"] });
    },
    onError: (error: Error) => {
      showToast(error.message);
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  /**
   * Handle Vipps payment flow
   * 
   * Flow:
   * 1. Show confirmation with price and tier
   * 2. Call /api/subscription/vipps/initiate
   * 3. Receive Vipps agreement URL
   * 4. Open Vipps app or web checkout
   * 5. User confirms agreement
   * 6. Webhook updates subscription to "active"
   * 7. Refresh status on return
   */
  const handleVippsPayment = async () => {
    const confirmed = await showConfirm({
      title: "Start abonnement med Vipps",
      message: `Du starter et abonnement på ${subscriptionStatus?.tier.displayName} for ${subscriptionStatus?.tier.priceNok} NOK/måned.\n\nDu kan administrere eller kansellere abonnementet når som helst i Vipps-appen.`,
      confirmLabel: "Bekreft betaling",
      cancelLabel: "Avbryt",
    });
    if (!confirmed) return;
    setIsProcessing(true);
    vippsMutation.mutate();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </ThemedView>
    );
  }

  if (!subscriptionStatus) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Kunne ikke hente abonnementsinformasjon</ThemedText>
      </ThemedView>
    );
  }

  const { tier, daysRemaining, isTrialing, isPaused } = subscriptionStatus;

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Sikre din plass</ThemedText>
        </View>

        {/* Status Banner */}
        {isTrialing && (
          <View style={[styles.statusBanner, { backgroundColor: "#FFA726" + "20" }]}>
            <Feather name="clock" size={20} color="#FFA726" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText style={styles.statusTitle}>
                {isPaused
                  ? "Prøveperioden har utløpt"
                  : `${daysRemaining} dager igjen av prøveperioden`}
              </ThemedText>
              {!isPaused && (
                <ThemedText style={styles.statusText}>
                  Sikre tilgang nå og fortsett å motta henvendelser fra brudepar
                </ThemedText>
              )}
            </View>
          </View>
        )}

        {isPaused && (
          <View style={[styles.statusBanner, { backgroundColor: "#EF5350" + "20" }]}>
            <Feather name="lock" size={20} color="#EF5350" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText style={styles.statusTitle}>Tilgangen din er låst</ThemedText>
              <ThemedText style={styles.statusText}>
                Du går glipp av nye henvendelser. Betal nå for å reaktivere.
              </ThemedText>
            </View>
          </View>
        )}

        {/* Tier Info */}
        <View style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <ThemedText style={styles.tierName}>{tier.displayName}</ThemedText>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.price}>{tier.priceNok}</ThemedText>
              <ThemedText style={styles.priceCurrency}>NOK/mnd</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.tierDescription}>{tier.description}</ThemedText>

          {/* Features */}
          <View style={styles.featuresSection}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Feather name="star" size={16} color={Colors.dark.accent} />
              <ThemedText style={styles.featuresTitle}>Inkludert i pakken:</ThemedText>
            </View>
            
            <View style={styles.feature}>
              <Feather name="check-circle" size={20} color={Colors.dark.accent} />
              <ThemedText style={styles.featureText}>
                Opptil {tier.features.maxPhotos} bilder i showcase-galleriet
              </ThemedText>
            </View>

            {tier.features.analytics && (
              <View style={styles.feature}>
                <Feather name="check-circle" size={20} color={Colors.dark.accent} />
                <ThemedText style={styles.featureText}>
                  Avansert statistikk og innsikt
                </ThemedText>
              </View>
            )}

            {tier.features.prioritizedInSearch && (
              <View style={styles.feature}>
                <Feather name="check-circle" size={20} color={Colors.dark.accent} />
                <ThemedText style={styles.featureText}>
                  Prioritert visning i søkeresultater
                </ThemedText>
              </View>
            )}

            <View style={styles.feature}>
              <Feather name="check-circle" size={20} color={Colors.dark.accent} />
              <ThemedText style={styles.featureText}>
                Ubegrenset meldinger med brudepar
              </ThemedText>
            </View>

            <View style={styles.feature}>
              <Feather name="check-circle" size={20} color={Colors.dark.accent} />
              <ThemedText style={styles.featureText}>
                Direktekontakt med potensielle kunder
              </ThemedText>
            </View>

            <View style={styles.feature}>
              <Feather name="check-circle" size={20} color={Colors.dark.accent} />
              <ThemedText style={styles.featureText}>
                Profesjonell profil med produkter og inspirasjon
              </ThemedText>
            </View>
          </View>
        </View>

        {/* What You're Missing */}
        {(isPaused || daysRemaining <= 7) && (
          <View style={styles.missingCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Feather name="x-circle" size={20} color="#EF5350" />
              <ThemedText style={styles.missingTitle}>Uten betaling mister du:</ThemedText>
            </View>
            
            <View style={styles.missingItem}>
              <Feather name="image" size={18} color="#EF5350" />
              <ThemedText style={styles.missingText}>
                Showcase-galleriet ditt blir skjult
              </ThemedText>
            </View>

            <View style={styles.missingItem}>
              <Feather name="message-circle" size={18} color="#EF5350" />
              <ThemedText style={styles.missingText}>
                Alle aktive samtaler stopper
              </ThemedText>
            </View>

            <View style={styles.missingItem}>
              <Feather name="mail" size={18} color="#EF5350" />
              <ThemedText style={styles.missingText}>
                Nye henvendelser fra brudepar blokkeres
              </ThemedText>
            </View>

            <View style={styles.missingItem}>
              <Feather name="bar-chart-2" size={18} color="#EF5350" />
              <ThemedText style={styles.missingText}>
                Statistikk og innsikt deaktiveres
              </ThemedText>
            </View>

            <View style={styles.missingItem}>
              <Feather name="eye-off" size={18} color="#EF5350" />
              <ThemedText style={styles.missingText}>
                Profilen din blir usynlig i søk
              </ThemedText>
            </View>
          </View>
        )}

        {/* Social Proof */}
        <View style={styles.proofCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Feather name="users" size={18} color={Colors.dark.accent} />
            <ThemedText style={styles.proofTitle}>Over 50 leverandører har sikret sin plass</ThemedText>
          </View>
          <ThemedText style={styles.proofText}>
            Bli med i Norges største bryllupsnettverk og nå tusenvis av brudepar som planlegger sitt drømmebryllup.
          </ThemedText>
        </View>

        {/* Payment Button - Vipps Brand Guidelines */}
        <Pressable
          style={[
            styles.vippsButton,
            isProcessing && styles.vippsButtonDisabled,
          ]}
          onPress={handleVippsPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.vippsButtonContent}>
              {/* Vipps MobilePay Official Logo */}
              <View style={styles.vippsLogoContainer}>
                <Image
                  source={require('@/assets/images/VippsMobilePay_Logo_Primary_RGB_Black.svg')}
                  style={{ width: 90, height: 24 }}
                  resizeMode="contain"
                />
              </View>
              <ThemedText style={styles.vippsButtonText}>
                {isPaused ? "Reaktiver abonnement" : "Start abonnement"}
              </ThemedText>
            </View>
          )}
        </Pressable>

        {/* Vipps Info - Brand Compliance */}
        <View style={styles.vippsInfo}>
          <Feather name="shield" size={14} color={Colors.dark.textSecondary} />
          <ThemedText style={styles.vippsInfoText}>
            Sikker betaling med Vipps Recurring. Du administrerer abonnementet direkte i Vipps-appen.
          </ThemedText>
        </View>

        {/* Additional Security Info */}
        <View style={styles.securityInfo}>
          <View style={styles.securityItem}>
            <Feather name="check" size={14} color={Colors.dark.accent} />
            <ThemedText style={styles.securityText}>Ingen kortnummer delt</ThemedText>
          </View>
          <View style={styles.securityItem}>
            <Feather name="lock" size={14} color={Colors.dark.accent} />
            <ThemedText style={styles.securityText}>Kryptert kommunikasjon</ThemedText>
          </View>
          <View style={styles.securityItem}>
            <Feather name="x-circle" size={14} color={Colors.dark.accent} />
            <ThemedText style={styles.securityText}>Lett å avbryte når som helst</ThemedText>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <ThemedText style={styles.terms}>
            Ved å fortsette godtar du vår{" "}
            <ThemedText 
              style={styles.termsLink}
              onPress={() => {
                const url = "https://evendi.no/terms-of-sale";
                Linking.openURL(url).catch(() => {
                  showToast("Kunne ikke åpne vilkårene");
                });
              }}
            >
              salgsbetingelser
            </ThemedText>
            . Abonnementet fornyes automatisk hver måned. Du kan når som helst kansellere i innstillinger.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    opacity: 0.8,
  },
  tierCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.dark.accent,
  },
  tierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tierName: {
    fontSize: 24,
    fontWeight: "700",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.dark.accent,
  },
  priceCurrency: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: -4,
  },
  tierDescription: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 20,
  },
  featuresSection: {
    gap: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  missingCard: {
    backgroundColor: "#EF5350" + "15",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EF5350" + "40",
  },
  missingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  missingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  missingText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.9,
  },
  proofCard: {
    backgroundColor: Colors.dark.accent + "20",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.accent + "40",
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  proofText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  vippsButton: {
    backgroundColor: "#FF5B24", // Vipps Official: rgb(255, 91, 36)
    borderRadius: 6, // Official Vipps button border-radius
    paddingVertical: 10, // Official Vipps button padding
    paddingHorizontal: 20, // Official Vipps button padding
    marginBottom: 12,
    shadowColor: "#FF5B24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  vippsButtonDisabled: {
    opacity: 0.6,
  },
  vippsButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  vippsLogoContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  vippsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5,
  },
  vippsInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  vippsInfoText: {
    flex: 1,
    fontSize: 12,
    opacity: 0.65,
    lineHeight: 18,
    fontStyle: "italic",
  },
  securityInfo: {
    backgroundColor: Colors.dark.accent + "10",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    opacity: 0.8,
    flex: 1,
  },
  termsContainer: {
    marginBottom: 20,
  },
  terms: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.dark.accent,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
