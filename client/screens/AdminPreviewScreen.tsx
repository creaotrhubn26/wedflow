import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { AdminHeader } from "@/components/AdminHeader";
import { getApiUrl } from "@/lib/query-client";
import { showToast } from "@/lib/toast";

interface PreviewMode {
  type: "couple" | "vendor";
  label: string;
  description: string;
  icon: keyof typeof EvendiIconGlyphMap;
  color: string;
}

interface PreviewUser {
  id: string;
  name: string;
  email: string;
  category?: string;
}

type Theme = ReturnType<typeof useTheme>["theme"];

export default function AdminPreviewScreen({ route }: { route: RouteProp<RootStackParamList, "AdminPreview"> }) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { isWedding } = useEventType();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { adminKey } = route.params || {};

  const [selectedMode, setSelectedMode] = useState<"couple" | "vendor" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<PreviewUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PreviewUser | null>(null);
  const [searchText, setSearchText] = useState("");

  const previewModes: PreviewMode[] = [
    {
      type: "couple",
      label: isWedding ? "Brudepar-visning" : "Kunde-visning",
      description: isWedding
        ? "Se appen slik brudepar ser den. Velg et brudepar og se nøyaktig det de ser."
        : "Se appen slik kunder ser den. Velg en kunde og se nøyaktig det de ser.",
      icon: "heart",
      color: "#FF6B9D",
    },
    {
      type: "vendor",
      label: "Leverandør-visning",
      description: "Se appen slik leverandører ser den. Velg en leverandør og test deres dashboard.",
      icon: "briefcase",
      color: "#4A90E2",
    },
  ];

  const loadUsers = async (mode: "couple" | "vendor") => {
    if (!adminKey) {
      showToast("Logg inn som admin for å bruke forhåndsvisning.");
      return;
    }
    setIsLoading(true);
    try {
      const url = new URL(`/api/admin/preview/${mode}/users`, getApiUrl());

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${adminKey}` },
      });

      if (!response.ok) {
        throw new Error(`Kunne ikke hente ${mode}-liste`);
      }

      const data = await response.json();
      setUsers(data.users || []);
      setSelectedMode(mode);
      setSelectedUser(null);
      setSearchText("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(`Kunne ikke laste ${mode}-liste. Sjekk at det finnes data i systemet.`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterAsUser = async (user: PreviewUser) => {
    if (!selectedMode) return;
    if (!adminKey) {
      showToast("Logg inn som admin for å bruke forhåndsvisning.");
      return;
    }

    setIsLoading(true);
    try {
      const url = new URL(`/api/admin/preview/${selectedMode}/impersonate`, getApiUrl());

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Kunne ikke logge inn som denne brukeren");
      }

      const data = await response.json();
      const { sessionToken } = data;

      // Store the impersonation session
      await AsyncStorage.setItem("preview_session_token", sessionToken);
      await AsyncStorage.setItem("preview_admin_key", adminKey);
      await AsyncStorage.setItem("preview_mode", selectedMode);
      await AsyncStorage.setItem("preview_user_id", user.id);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to the appropriate screen
      navigation.reset({
        index: 0,
        routes: [{ name: selectedMode === "couple" ? "Main" : "VendorDashboard" }],
      });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Kunne ikke logge inn som denne brukeren");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const useCases: Array<{ icon: keyof typeof EvendiIconGlyphMap; text: string }> = [
    { icon: "eye", text: "Kvalitetssikre nye funksjoner uten å endre ekte data" },
    { icon: "message-square", text: "Se nøyaktig hva brukeren rapporterer i support" },
    { icon: "shield", text: "Test tilganger og flyt for både par og leverandorer" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <AdminHeader
        title="Forhandsvisning"
        subtitle="Logg inn som par eller leverandor"
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {!selectedMode ? (
        // Mode selection view
        <>
          <View style={{ marginBottom: Spacing.xl }}>
            <ThemedText style={styles.title}>Preview-modus</ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
              Velg en rolle for å se og teste appen fra det perspektivet.
            </ThemedText>
          </View>

          {previewModes.map((mode) => (
            <Pressable
              key={mode.type}
              style={[
                styles.modeCard,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => loadUsers(mode.type)}
            >
              <View style={styles.modeCardContent}>
                <View
                  style={[
                    styles.modeIcon,
                    { backgroundColor: mode.color + "20" },
                  ]}
                >
                  <EvendiIcon name={mode.icon} size={28} color={mode.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.modeLabel}>{mode.label}</ThemedText>
                  <ThemedText
                    style={[
                      styles.modeDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {mode.description}
                  </ThemedText>
                </View>

                <EvendiIcon name="chevron-right" size={20} color={theme.textMuted} />
              </View>
            </Pressable>
          ))}

          <View style={[styles.infoBox, { backgroundColor: Colors.dark.accent + "10", borderColor: Colors.dark.accent }]}> 
            <EvendiIcon name="alert-circle" size={18} color={Colors.dark.accent} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <ThemedText style={[styles.infoBoxTitle, { color: Colors.dark.accent }]}>
                Du vil se alt som brukeren ser
              </ThemedText>
              <ThemedText
                style={[
                  styles.infoBoxText,
                  { color: Colors.dark.accent, opacity: 0.8 },
                ]}
              >
                Når du velger en bruker, vil du bli logget inn som dem. Du vil se alle deres data, innstillinger og funksjoner eksakt som de ser det.
              </ThemedText>
            </View>
          </View>

          <View style={[styles.useCaseBox, { borderColor: theme.border, backgroundColor: theme.backgroundDefault }]}> 
            <ThemedText style={styles.useCaseTitle}>Typiske brukstilfeller</ThemedText>
            <View style={styles.useCaseList}>
              {useCases.map((useCase) => (
                <UseCaseItem key={useCase.text} icon={useCase.icon} text={useCase.text} theme={theme} />
              ))}
            </View>
          </View>
        </>
      ) : (
        // User selection view
        <>
          <View style={{ marginBottom: Spacing.lg }}>
            <Pressable
              onPress={() => {
                setSelectedMode(null);
                setUsers([]);
                setSelectedUser(null);
                setSearchText("");
              }}
              style={styles.backButton}
            >
              <EvendiIcon name="chevron-left" size={20} color={Colors.dark.accent} />
              <ThemedText style={{ color: Colors.dark.accent, fontWeight: "600" }}>
                Tilbake
              </ThemedText>
            </Pressable>
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <ThemedText style={styles.subtitle}>
              Velg {selectedMode === "couple" ? (isWedding ? "brudepar" : "kunde") : "leverandør"}:
            </ThemedText>
          </View>

          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder={`Søk etter ${selectedMode === "couple" ? (isWedding ? "brudepar" : "kunde") : "leverandør"}...`}
            placeholderTextColor={theme.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />

          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator color={Colors.dark.accent} size="large" />
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EvendiIcon name="inbox" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                {users.length === 0
                  ? `Ingen ${selectedMode === "couple" ? (isWedding ? "brudepar" : "kunder") : "leverandører"} funnet`
                  : "Ingen resultater på søket"}
              </ThemedText>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    if (selectedUser?.id === item.id) {
                      handleEnterAsUser(item);
                      return;
                    }
                    setSelectedUser(item);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  disabled={isLoading}
                  style={[
                    styles.userCard,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: theme.border,
                      borderWidth: selectedUser?.id === item.id ? 2 : 1,
                      opacity: isLoading ? 0.5 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.userAvatar,
                      {
                        backgroundColor:
                          selectedMode === "couple"
                            ? "#FF6B9D" + "30"
                            : "#4A90E2" + "30",
                      },
                    ]}
                  >
                    <EvendiIcon
                      name={selectedMode === "couple" ? "heart" : "briefcase"}
                      size={20}
                      color={selectedMode === "couple" ? "#FF6B9D" : "#4A90E2"}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.userName}>{item.name}</ThemedText>
                    <ThemedText
                      style={[
                        styles.userEmail,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {item.email}
                    </ThemedText>
                    {item.category && (
                      <ThemedText
                        style={[
                          styles.userCategory,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {item.category}
                      </ThemedText>
                    )}
                  </View>

                  <EvendiIcon
                    name="arrow-right"
                    size={18}
                    color={Colors.dark.accent}
                  />
                </Pressable>
              )}
            />
          )}

          {selectedUser && (
            <View style={[styles.selectedCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}> 
              <ThemedText style={styles.selectedTitle}>Valgt bruker</ThemedText>
              <ThemedText style={styles.selectedName}>{selectedUser.name}</ThemedText>
              <ThemedText style={[styles.selectedMeta, { color: theme.textSecondary }]}> 
                {selectedUser.email}
              </ThemedText>
              <Pressable
                onPress={() => handleEnterAsUser(selectedUser)}
                style={[styles.enterButton, { backgroundColor: Colors.dark.accent }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <EvendiIcon name="log-in" size={16} color="#000" />
                    <ThemedText style={styles.enterButtonText}>Logg inn som valgt</ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          )}

          <View
            style={[
              styles.infoBox,
              { backgroundColor: Colors.dark.accent + "10", borderColor: Colors.dark.accent, marginTop: Spacing.lg },
            ]}
          >
            <EvendiIcon name="info" size={18} color={Colors.dark.accent} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <ThemedText
                style={[
                  styles.infoBoxText,
                  { color: Colors.dark.accent, opacity: 0.8 },
                ]}
              >
                Når du velger en bruker, blir du logget inn som dem. Du kan logg ut når som helst for å returnere til admin.
              </ThemedText>
            </View>
          </View>
        </>
      )}
      </ScrollView>
    </View>
  );
}

function UseCaseItem({ icon, text, theme }: { icon: keyof typeof EvendiIconGlyphMap; text: string; theme: Theme }) {
  return (
    <View style={styles.useCaseItem}>
      <EvendiIcon name={icon} size={16} color={Colors.dark.accent} />
      <ThemedText
        style={[
          styles.useCaseItemText,
          { color: theme.textSecondary, marginLeft: Spacing.md },
        ]}
      >
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  modeCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  modeCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
    flexShrink: 0,
  },
  modeLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  modeDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  userCategory: {
    fontSize: 11,
  },
  infoBox: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  infoBoxText: {
    fontSize: 12,
    lineHeight: 16,
  },
  useCaseBox: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  useCaseTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  useCaseList: {
    gap: Spacing.md,
  },
  useCaseItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  useCaseItemText: {
    fontSize: 13,
    lineHeight: 18,
  },
  selectedCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  selectedTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  selectedName: {
    fontSize: 16,
    fontWeight: "700",
  },
  selectedMeta: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  enterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  enterButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
  },
});
