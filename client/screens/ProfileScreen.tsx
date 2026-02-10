import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getWeddingDetails, saveWeddingDetails, getAppLanguage, type AppLanguage } from "@/lib/storage";
import { rescheduleAllNotifications } from "@/lib/notifications";
import { WeddingDetails } from "@/lib/types";
import type { AppSetting } from "../../shared/schema";
import { getApiUrl } from "@/lib/query-client";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";
import { useAuth } from "@/lib/AuthContext";

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  const [wedding, setWedding] = useState<WeddingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editCoupleNames, setEditCoupleNames] = useState("");
  const [editWeddingDate, setEditWeddingDate] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [appLanguage, setAppLanguage] = useState<AppLanguage>("nb");

  useEffect(() => {
    async function loadLanguage() {
      const language = await getAppLanguage();
      setAppLanguage(language);
    }
    loadLanguage();
  }, []);

  const t = useCallback((nb: string, en: string) => (appLanguage === "en" ? en : nb), [appLanguage]);
  const locale = appLanguage === "en" ? "en-US" : "nb-NO";

  const { data: appSettings } = useQuery<AppSetting[]>({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/app-settings`);
      if (!res.ok) throw new Error(t("Kunne ikke hente app-innstillinger", "Failed to fetch app settings"));
      return res.json();
    },
  });

  const settingsByKey = useMemo(() => {
    return (
      appSettings?.reduce<Record<string, string>>((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {}) ?? {}
    );
  }, [appSettings]);

  const getSetting = useCallback(
    (key: string, fallback = "") => settingsByKey[key] ?? fallback,
    [settingsByKey]
  );

  const formatDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseDateInput = (value: string) => {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  };

  const getDateBounds = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const defaultMax = new Date(today);
    defaultMax.setFullYear(today.getFullYear() + 5);

    const adminMin = parseDateInput(getSetting("wedding_date_min"));
    const adminMax = parseDateInput(getSetting("wedding_date_max"));
    const minDate = adminMin || today;
    const maxDate = adminMax && adminMax >= minDate ? adminMax : defaultMax;

    return { minDate, maxDate };
  }, [getSetting]);

  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "coupleNames":
        if (!value.trim()) return t("Navn er påkrevd", "Name is required");
        if (value.trim().length < 3) return t("Navn må være minst 3 tegn", "Name must be at least 3 characters");
        return "";
      case "weddingDate": {
        if (!value.trim()) return t("Dato er påkrevd", "Date is required");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return t("Bruk format ÅÅÅÅ-MM-DD", "Use format YYYY-MM-DD");
        const parsed = parseDateInput(value.trim());
        if (!parsed) return t("Ugyldig dato", "Invalid date");
        const { minDate, maxDate } = getDateBounds();
        if (parsed < minDate) return t(
          `Dato kan ikke være før ${formatDate(formatDateInput(minDate))}`,
          `Date cannot be before ${formatDate(formatDateInput(minDate))}`
        );
        if (parsed > maxDate) return t(
          `Dato kan ikke være etter ${formatDate(formatDateInput(maxDate))}`,
          `Date cannot be after ${formatDate(formatDateInput(maxDate))}`
        );
        return "";
      }
      default:
        return "";
    }
  }, [getDateBounds, t]);

  const handleBlur = useCallback((field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, [validateField]);

  const getFieldStyle = useCallback((field: string) => {
    if (touched[field] && errors[field]) {
      return { borderColor: "#DC3545" };
    }
    return {};
  }, [touched, errors]);

  const loadData = useCallback(async () => {
    const data = await getWeddingDetails();
    setWedding(data);
    if (data) {
      setEditCoupleNames(data.coupleNames);
      setEditWeddingDate(data.weddingDate);
      setEditVenue(data.venue);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    const nextTouched: Record<string, boolean> = {
      coupleNames: true,
      weddingDate: true,
    };
    const nextErrors: Record<string, string> = {
      coupleNames: validateField("coupleNames", editCoupleNames),
      weddingDate: validateField("weddingDate", editWeddingDate),
    };
    setTouched((prev) => ({ ...prev, ...nextTouched }));
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    const hasError = Object.values(nextErrors).some((error) => error);
    if (hasError) {
      showToast(t("Vennligst rett opp feilene før du lagrer", "Please fix the errors before saving"));
      return;
    }

    const updatedWedding: WeddingDetails = {
      coupleNames: editCoupleNames.trim(),
      weddingDate: editWeddingDate.trim(),
      venue: editVenue.trim(),
    };

    await saveWeddingDetails(updatedWedding);
    await rescheduleAllNotifications(true);
    setWedding(updatedWedding);
    setEditing(false);
    setTouched({});
    setErrors({});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCancel = () => {
    setEditCoupleNames(wedding?.coupleNames || "");
    setEditWeddingDate(wedding?.weddingDate || "");
    setEditVenue(wedding?.venue || "");
    setTouched({});
    setErrors({});
    setEditing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== "ios" && event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    setShowDatePicker(Platform.OS === "ios");
    if (!selectedDate) return;
    const nextValue = formatDateInput(selectedDate);
    setEditWeddingDate(nextValue);
    setTouched((prev) => ({ ...prev, weddingDate: true }));
    setErrors((prev) => ({ ...prev, weddingDate: validateField("weddingDate", nextValue) }));
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const dateBounds = getDateBounds();

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText style={{ color: theme.textSecondary }}>{t("Laster...", "Loading...")}</ThemedText>
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
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View
          style={[
            styles.profileHeader,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.avatarLarge,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="heart" size={32} color={Colors.dark.accent} />
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                    getFieldStyle("coupleNames"),
                  ]}
                  placeholder={t("Navn (f.eks. Emma & Erik)", "Names (e.g. Emma & Erik)")}
                  placeholderTextColor={theme.textMuted}
                  value={editCoupleNames}
                  onChangeText={setEditCoupleNames}
                  onBlur={() => handleBlur("coupleNames", editCoupleNames)}
                />
                {touched.coupleNames && errors.coupleNames ? (
                  <ThemedText style={[styles.errorText, { color: theme.error }]}>{errors.coupleNames}</ThemedText>
                ) : null}
              </View>
              <View>
                {Platform.OS === "web" ? (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                      getFieldStyle("weddingDate"),
                    ]}
                    placeholder={t("Dato (ÅÅÅÅ-MM-DD)", "Date (YYYY-MM-DD)")}
                    placeholderTextColor={theme.textMuted}
                    value={editWeddingDate}
                    onChangeText={setEditWeddingDate}
                    onBlur={() => handleBlur("weddingDate", editWeddingDate)}
                  />
                ) : (
                  <>
                    <Pressable
                      onPress={() => setShowDatePicker(true)}
                      onFocus={() => {
                        if (Platform.OS === "ios") {
                          setShowDatePicker(true);
                        }
                      }}
                      onBlur={() => {
                        if (Platform.OS === "ios") {
                          setShowDatePicker(false);
                        }
                        handleBlur("weddingDate", editWeddingDate);
                      }}
                      style={[
                        styles.dateButton,
                        {
                          backgroundColor: theme.backgroundSecondary,
                          borderColor: theme.border,
                        },
                        getFieldStyle("weddingDate"),
                      ]}
                    >
                      <Feather name="calendar" size={18} color={theme.accent} />
                      <ThemedText style={[styles.dateButtonText, { color: theme.text }]}
                      >
                        {editWeddingDate ? formatDate(editWeddingDate) : t("Velg dato", "Select date")}
                      </ThemedText>
                    </Pressable>
                    {showDatePicker ? (
                      <DateTimePicker
                        value={parseDateInput(editWeddingDate) || dateBounds.minDate}
                        mode="date"
                        display={Platform.OS === "ios" ? "inline" : "default"}
                        onChange={handleDateChange}
                        minimumDate={dateBounds.minDate}
                        maximumDate={dateBounds.maxDate}
                      />
                    ) : null}
                  </>
                )}
                <ThemedText style={[styles.helperText, { color: theme.textMuted }]}
                >
                  {t(
                    `Tillatt dato: ${formatDate(formatDateInput(dateBounds.minDate))} - ${formatDate(formatDateInput(dateBounds.maxDate))}`,
                    `Allowed date: ${formatDate(formatDateInput(dateBounds.minDate))} - ${formatDate(formatDateInput(dateBounds.maxDate))}`
                  )}
                </ThemedText>
                {touched.weddingDate && errors.weddingDate ? (
                  <ThemedText style={[styles.errorText, { color: theme.error }]}>{errors.weddingDate}</ThemedText>
                ) : null}
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder={t("Lokale", "Venue")}
                placeholderTextColor={theme.textMuted}
                value={editVenue}
                onChangeText={setEditVenue}
              />
              <View style={styles.editButtons}>
                <Pressable
                  onPress={handleCancel}
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                >
                  <ThemedText style={{ color: theme.textSecondary }}>
                    {t("Avbryt", "Cancel")}
                  </ThemedText>
                </Pressable>
                <Button onPress={handleSave} style={styles.saveButton}>
                  {t("Lagre", "Save")}
                </Button>
              </View>
            </View>
          ) : (
            <>
              <ThemedText type="h2" style={styles.coupleNames}>
                {wedding?.coupleNames || t("Legg til navn", "Add names")}
              </ThemedText>
              <ThemedText
                style={[styles.weddingDate, { color: Colors.dark.accent }]}
              >
                {wedding?.weddingDate ? formatDate(wedding.weddingDate) : t("Legg til dato", "Add date")}
              </ThemedText>
              <ThemedText
                style={[styles.venue, { color: theme.textSecondary }]}
              >
                {wedding?.venue || t("Legg til lokale", "Add venue")}
              </ThemedText>
              <Pressable
                onPress={() => {
                  setEditing(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.editButton, { borderColor: Colors.dark.accent }]}
              >
                <Feather name="edit-2" size={16} color={Colors.dark.accent} />
                <ThemedText style={[styles.editButtonText, { color: Colors.dark.accent }]}>
                  {t("Rediger", "Edit")}
                </ThemedText>
              </Pressable>
            </>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          {t("Verktøy", "Tools")}
        </ThemedText>
        <View style={styles.toolsGrid}>
          <Card
            elevation={1}
            onPress={() => navigation.navigate("PhotoPlan")}
            style={{ ...styles.toolCard, borderColor: theme.border }}
          >
            <View
              style={[
                styles.toolIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="camera" size={20} color={Colors.dark.accent} />
            </View>
            <ThemedText style={styles.toolLabel}>{t("Fotoplan", "Photo plan")}</ThemedText>
            <ThemedText style={[styles.toolDescription, { color: theme.textSecondary }]}>
              {t("Planlegg hvilke bilder du vil ha", "Plan the photos you want")}
            </ThemedText>
          </Card>

          <Card
            elevation={1}
            onPress={() => navigation.navigate("Settings")}
            style={{ ...styles.toolCard, borderColor: theme.border }}
          >
            <View
              style={[
                styles.toolIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="settings" size={20} color={Colors.dark.accent} />
            </View>
            <ThemedText style={styles.toolLabel}>{t("Innstillinger", "Settings")}</ThemedText>
            <ThemedText style={[styles.toolDescription, { color: theme.textSecondary }]}>
              {t("App-innstillinger", "App settings")}
            </ThemedText>
          </Card>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={styles.menuSection}>
          <MenuItem
            icon="help-circle"
            label={t("Hjelp & FAQ", "Help & FAQ")}
            theme={theme}
            onPress={() => navigation.navigate("CoupleHelp")}
          />
          <MenuItem
            icon="message-circle"
            label={t("Meldinger", "Messages")}
            theme={theme}
            onPress={() => navigation.navigate("CoupleMessagesHub")}
          />
          <MenuItem
            icon="info"
            label={t("Om Wedflow", "About Wedflow")}
            theme={theme}
            onPress={() => navigation.navigate("About")}
          />
          <MenuItem
            icon="bell"
            label={t("Varsler og påminnelser", "Notifications and reminders")}
            theme={theme}
            onPress={() => navigation.navigate("NotificationSettings")}
          />
          <MenuItem
            icon="share-2"
            label={t("Del med partner", "Share with partner")}
            theme={theme}
            onPress={() => navigation.navigate("SharePartner")}
          />
          <MenuItem
            icon="star"
            label={t("Anmeld leverandører", "Review vendors")}
            theme={theme}
            onPress={() => navigation.navigate("VendorReviews")}
          />
          <MenuItem
            icon="message-square"
            label={t("Tilbakemelding til Wedflow", "Feedback to Wedflow")}
            theme={theme}
            onPress={() => navigation.navigate("Feedback")}
          />
          <MenuItem
            icon="log-out"
            label={t("Logg ut", "Log out")}
            theme={theme}
            destructive
            onPress={async () => {
              const confirmed = await showConfirm({
                title: t("Logg ut", "Log out"),
                message: t("Er du sikker på at du vil logge ut?", "Are you sure you want to log out?"),
                confirmLabel: t("Logg ut", "Log out"),
                cancelLabel: t("Avbryt", "Cancel"),
                destructive: true,
              });
              if (confirmed) {
                logout();
              }
            }}
          />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  theme: any;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({ icon, label, theme, onPress, destructive }: MenuItemProps) {
  const iconColor = destructive ? "#DC3545" : Colors.dark.accent;
  return (
    <Pressable
      onPress={() => {
        onPress();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        pressed && { opacity: 0.9 },
      ]}
    >
      <View
        style={[styles.menuIcon, { backgroundColor: destructive ? "#DC354515" : theme.backgroundSecondary }]}
      >
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <ThemedText style={[styles.menuLabel, destructive && { color: "#DC3545" }]}>{label}</ThemedText>
      <Feather name="chevron-right" size={18} color={theme.textMuted} />
    </Pressable>
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
  profileHeader: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing["2xl"],
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  coupleNames: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  weddingDate: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  venue: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  editButtonText: {
    marginLeft: Spacing.xs,
    fontWeight: "500",
  },
  editForm: {
    width: "100%",
    marginTop: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  editButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  saveButton: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  toolsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  toolCard: {
    flex: 1,
    borderWidth: 1,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  toolLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  toolDescription: {
    fontSize: 12,
  },
  menuSection: {
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: "#DC3545",
    marginTop: -8,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  helperText: {
    fontSize: 12,
    marginTop: -6,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
