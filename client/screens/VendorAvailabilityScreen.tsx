import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon, EvendiIconGlyphMap, type EvendiIconName } from "@/components/EvendiIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { AppSetting } from "../../shared/schema";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface VendorSession {
  sessionToken: string;
  vendorId: string;
  email: string;
  businessName: string;
}

interface VendorAvailability {
  id: string;
  vendorId: string;
  date: string;
  name: string | null;
  status: "available" | "blocked" | "limited";
  maxBookings: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BookingInfo {
  date: string;
  acceptedBookings: number;
}

type AvailabilityStatus = VendorAvailability["status"];

const STATUS_OPTIONS: Array<{
  value: AvailabilityStatus;
  label: string;
  icon: EvendiIconName;
  color: string;
}> = [
  { value: "available", label: "Tilgjengelig", icon: "check-circle", color: "#4CAF50" },
  { value: "blocked", label: "Blokkert", icon: "x-circle", color: "#EF5350" },
  { value: "limited", label: "Begrenset", icon: "alert-circle", color: "#FF9800" },
];

export default function VendorAvailabilityScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {
  const { theme } = useTheme();
  const { isWedding } = useEventType();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStatus, setEditStatus] = useState<AvailabilityStatus>("available");
  const [editMaxBookings, setEditMaxBookings] = useState("");
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [calendarLayout, setCalendarLayout] = useState<{ y: number; width: number } | null>(null);
  const [pendingScrollToToday, setPendingScrollToToday] = useState(false);
  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(null);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getVendorSession = useCallback(async (): Promise<VendorSession> => {
    const session = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (!session) throw new Error("Not authenticated");
    const parsed = JSON.parse(session) as VendorSession;
    if (!parsed?.sessionToken) throw new Error("Invalid session");
    return parsed;
  }, []);

  const { data: appSettings } = useQuery<AppSetting[]>({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/app-settings`);
      if (!res.ok) throw new Error("Failed to fetch app settings");
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

  const highlightDurationMs = useMemo(() => {
    const raw = Number.parseInt(getSetting("vendor_availability_highlight_ms", "1200"), 10);
    if (Number.isNaN(raw)) return 1200;
    return Math.min(Math.max(raw, 300), 3000);
  }, [getSetting]);

  const highlightIntensity = useMemo(() => {
    const raw = Number.parseFloat(getSetting("vendor_availability_highlight_intensity", "0.12"));
    if (Number.isNaN(raw)) return 0.12;
    return Math.min(Math.max(raw, 0.05), 0.3);
  }, [getSetting]);

  const highlightAlphaHex = useMemo(() => {
    const alpha = Math.round(highlightIntensity * 255);
    return alpha.toString(16).padStart(2, "0");
  }, [highlightIntensity]);

  const { data: availability = [], isLoading } = useQuery<VendorAvailability[]>({
    queryKey: ["vendor-availability"],
    queryFn: async () => {
      const { sessionToken } = await getVendorSession();
      const res = await fetch(`${getApiUrl()}/api/vendor/availability`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch availability");
      return res.json();
    },
  });

  const { data: bookings = {} } = useQuery<Record<string, BookingInfo>>({
    queryKey: ["vendor-bookings-by-date"],
    queryFn: async () => {
      const { sessionToken } = await getVendorSession();
      
      // Get bookings for visible dates
      const dates = getDatesInMonth(currentMonth);
      const bookingsMap: Record<string, BookingInfo> = {};
      
      for (const date of dates) {
        try {
          const res = await fetch(
            `${getApiUrl()}/api/vendor/availability/${date}/bookings`,
            { headers: { Authorization: `Bearer ${sessionToken}` } }
          );
          if (res.ok) {
            const data = await res.json();
            bookingsMap[date] = data;
          }
        } catch (error) {
          // Ignore errors for individual dates
        }
      }
      
      return bookingsMap;
    },
    enabled: !!currentMonth,
  });

  const saveAvailabilityMutation = useMutation({
    mutationFn: async (data: { date: string; status: AvailabilityStatus; maxBookings: number | null; notes: string | null; name: string | null }) => {
      const { sessionToken } = await getVendorSession();
      
      const res = await fetch(`${getApiUrl()}/api/vendor/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save availability");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-availability"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-bookings-by-date"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowEditModal(false);
      setSelectedDate(null);
      showToast("Tilgjengelighet oppdatert");
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message);
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (date: string) => {
      const { sessionToken } = await getVendorSession();
      
      const res = await fetch(`${getApiUrl()}/api/vendor/availability/date/${date}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      
      if (!res.ok) throw new Error("Failed to delete availability");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-availability"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-bookings-by-date"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowEditModal(false);
      setSelectedDate(null);
    },
  });

  // Bulk save mutation for multiple dates
  const bulkSaveAvailabilityMutation = useMutation({
    mutationFn: async (data: { dates: string[]; status: AvailabilityStatus; maxBookings: number | null; notes: string | null; name: string | null }) => {
      const { sessionToken } = await getVendorSession();
      
      const res = await fetch(`${getApiUrl()}/api/vendor/availability/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save availability");
      }
      
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-availability"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-bookings-by-date"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowBulkModal(false);
      setSelectedDates(new Set());
      setIsMultiSelectMode(false);
      showToast(`${variables.dates.length} datoer oppdatert`);
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message);
    },
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    await queryClient.invalidateQueries({ queryKey: ["vendor-availability"] });
    await queryClient.invalidateQueries({ queryKey: ["vendor-bookings-by-date"] });
    setIsRefreshing(false);
  }, [queryClient]);

  const getDatesInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates: string[] = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startPadding = (firstDay.getDay() + 6) % 7; // Monday = 0
    const days: (Date | null)[] = [];
    
    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  const getAvailabilityForDate = (date: Date | null): VendorAvailability | undefined => {
    if (!date) return undefined;
    const dateStr = date.toISOString().split("T")[0];
    return availability.find(a => a.date === dateStr);
  };

  const getBookingsForDate = (date: Date | null): number => {
    if (!date) return 0;
    const dateStr = date.toISOString().split("T")[0];
    return bookings[dateStr]?.acceptedBookings || 0;
  };

  const openEditModal = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const existing = availability.find(a => a.date === dateStr);
    
    setSelectedDate(dateStr);
    setEditStatus(existing?.status || "available");
    setEditMaxBookings(existing?.maxBookings?.toString() || "");
    setEditName(existing?.name || "");
    setEditNotes(existing?.notes || "");
    setShowEditModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleDateSelection = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
    }
    setSelectedDates(newSelected);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openBulkEditModal = () => {
    if (selectedDates.size === 0) {
      showToast("Velg minst én dato for å fortsette");
      return;
    }
    setEditStatus("blocked");
    setEditMaxBookings("");
    setEditName("");
    setEditNotes("");
    setShowBulkModal(true);
  };

  const handleBulkSave = () => {
    if (selectedDates.size === 0) return;
    
    if (editStatus === "limited" && !editMaxBookings) {
      showToast("Angi maksimalt antall bookinger for begrenset tilgjengelighet");
      return;
    }
    
    bulkSaveAvailabilityMutation.mutate({
      dates: Array.from(selectedDates),
      status: editStatus,
      maxBookings: editStatus === "limited" && editMaxBookings ? parseInt(editMaxBookings) : null,
      name: editName.trim() || null,
      notes: editNotes.trim() || null,
    });
  };

  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false);
    setSelectedDates(new Set());
  };

  const selectAllDatesInMonth = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = getCalendarDays()
      .filter(date => date && date >= today)
      .map(date => date!.toISOString().split("T")[0]);
    setSelectedDates(new Set(dates));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSave = () => {
    if (!selectedDate) return;
    
    if (editStatus === "limited" && !editMaxBookings) {
      showToast("Angi maksimalt antall bookinger for begrenset tilgjengelighet");
      return;
    }
    
    saveAvailabilityMutation.mutate({
      date: selectedDate,
      status: editStatus,
      maxBookings: editStatus === "limited" && editMaxBookings ? parseInt(editMaxBookings) : null,
      name: editName.trim() || null,
      notes: editNotes.trim() || null,
    });
  };

  const handleDelete = async () => {
    if (!selectedDate) return;
    const confirmed = await showConfirm({
      title: "Slett tilgjengelighet",
      message: "Dette vil tilbakestille datoen til standard (tilgjengelig). Er du sikker?",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    deleteAvailabilityMutation.mutate(selectedDate);
  };

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const jumpToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!isSameMonth(currentMonth, today)) {
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      setPendingScrollToToday(true);
    } else {
      setPendingScrollToToday(true);
    }
    setPendingScrollTarget(today.toISOString().split("T")[0]);
    if (!isMultiSelectMode) {
      setSelectedDate(today.toISOString().split("T")[0]);
    }
  };

  const isSameMonth = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

  const getStartPaddingForMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return (firstDay.getDay() + 6) % 7;
  };

  const getRowIndexForDate = (date: Date) => {
    const startPadding = getStartPaddingForMonth(date);
    const dayIndex = date.getDate() - 1;
    const cellIndex = startPadding + dayIndex;
    return Math.floor(cellIndex / 7);
  };

  const highlightRow = useCallback((rowIndex: number) => {
    setHighlightedRow(rowIndex);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedRow(null);
    }, highlightDurationMs);
  }, [highlightDurationMs]);

  const scrollToToday = useCallback(() => {
    if (!calendarLayout) return;
    const today = new Date();
    if (!isSameMonth(currentMonth, today)) return;

    const rowIndex = getRowIndexForDate(today);
    const cellSize = calendarLayout.width / 7;
    const rowHeight = cellSize + Spacing.xs;
    const targetY = Math.max(calendarLayout.y + rowIndex * rowHeight - Spacing.md, 0);

    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
    highlightRow(rowIndex);
  }, [calendarLayout, currentMonth]);

  const scrollToDate = useCallback((dateString: string) => {
    if (!calendarLayout) return;
    const target = new Date(dateString);
    if (Number.isNaN(target.getTime())) return;
    if (!isSameMonth(currentMonth, target)) return;

    const rowIndex = getRowIndexForDate(target);
    const cellSize = calendarLayout.width / 7;
    const rowHeight = cellSize + Spacing.xs;
    const targetY = Math.max(calendarLayout.y + rowIndex * rowHeight - Spacing.md, 0);

    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
    highlightRow(rowIndex);
  }, [calendarLayout, currentMonth, highlightRow]);

  useEffect(() => {
    if (!pendingScrollToToday) return;
    scrollToToday();
    setPendingScrollToToday(false);
  }, [pendingScrollToToday, scrollToToday]);

  useEffect(() => {
    if (!pendingScrollTarget) return;
    const targetDate = new Date(pendingScrollTarget);
    if (Number.isNaN(targetDate.getTime())) {
      setPendingScrollTarget(null);
      return;
    }

    if (!isSameMonth(currentMonth, targetDate)) {
      setCurrentMonth(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
      return;
    }

    scrollToDate(pendingScrollTarget);
    setPendingScrollTarget(null);
  }, [pendingScrollTarget, currentMonth, scrollToDate]);

  useEffect(() => {
    if (!isMultiSelectMode || selectedDates.size === 0) return;
    const firstSelected = Array.from(selectedDates).sort()[0];
    if (firstSelected) setPendingScrollTarget(firstSelected);
  }, [isMultiSelectMode, selectedDates]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const isPastDate = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderDay = (date: Date | null, index: number) => {
    const rowIndex = Math.floor(index / 7);
    const isHighlightedRow = highlightedRow === rowIndex;
    const highlightStyle = isHighlightedRow
      ? { backgroundColor: `${Colors.dark.accent}${highlightAlphaHex}` }
      : null;
    if (!date) {
      return (
        <View
          key={`empty-${index}`}
          style={[styles.dayCell, isHighlightedRow && styles.highlightRowCell, highlightStyle]}
        />
      );
    }
    
    const availability = getAvailabilityForDate(date);
    const bookingCount = getBookingsForDate(date);
    const past = isPastDate(date);
    
    let bgColor = theme.backgroundDefault;
    let borderColor = theme.border;
    let statusColor = theme.textMuted;
    let statusIcon: EvendiIconName | null = null;
    
    if (availability) {
      if (availability.status === "blocked") {
        bgColor = "#EF535015";
        borderColor = "#EF5350";
        statusColor = "#EF5350";
        statusIcon = "x-circle";
      } else if (availability.status === "limited") {
        bgColor = "#FF980015";
        borderColor = "#FF9800";
        statusColor = "#FF9800";
        statusIcon = "alert-circle";
      }
    }
    
    if (bookingCount > 0) {
      bgColor = "#4CAF5015";
      borderColor = "#4CAF50";
    }

    const dateStr = date.toISOString().split("T")[0];
    const isSelected = selectedDates.has(dateStr);
    const todayStr = new Date().toISOString().split("T")[0];
    const isToday = dateStr === todayStr;

    return (
      <Pressable
        key={date.toISOString()}
        onPress={() => {
          if (past) return;
          if (isMultiSelectMode) {
            toggleDateSelection(date);
          } else {
            openEditModal(date);
          }
        }}
        onLongPress={() => {
          if (past) return;
          if (!isMultiSelectMode) {
            setIsMultiSelectMode(true);
            toggleDateSelection(date);
          }
        }}
        disabled={past}
        style={({ pressed }) => [
          styles.dayCell,
          { backgroundColor: bgColor, borderColor },
          pressed && !past && { opacity: 0.7 },
          past && { opacity: 0.4 },
          isSelected && styles.selectedDay,
          isToday && styles.todayDay,
          isHighlightedRow && styles.highlightRowCell,
          highlightStyle,
          isSelected && { borderColor: Colors.dark.accent, borderWidth: 2 },
        ]}
      >
        <ThemedText style={[styles.dayNumber, past && { color: theme.textMuted }]}>
          {date.getDate()}
        </ThemedText>
        
        {isSelected && (
          <View style={styles.selectedCheckmark}>
            <EvendiIcon name="check" size={10} color="#FFFFFF" />
          </View>
        )}
        
        {statusIcon && !past && !isSelected && (
          <EvendiIcon name={statusIcon} size={12} color={statusColor} style={styles.statusIcon} />
        )}
        
        {bookingCount > 0 && !isSelected && (
          <View style={[styles.bookingBadge, { backgroundColor: "#4CAF50" }]}>
            <ThemedText style={styles.bookingCount}>{bookingCount}</ThemedText>
          </View>
        )}
        
        {availability?.status === "limited" && availability.maxBookings && !isSelected && (
          <ThemedText style={[styles.limitText, { color: statusColor }]}>
            Max {availability.maxBookings}
          </ThemedText>
        )}
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header Info */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <EvendiIcon name="calendar" size={24} color={Colors.dark.accent} />
            <ThemedText type="h3" style={styles.infoTitle}>Kalender & Tilgjengelighet</ThemedText>
            <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
              Administrer tilgjengelighet for datoer. Blokkerte datoer vil ikke kunne motta tilbud.
            </ThemedText>
            <Pressable
              onPress={() => navigation.navigate("VendorDashboard")}
              style={[styles.quickActionBtn, { borderColor: theme.border }]}
            >
              <EvendiIcon name="layout" size={16} color={theme.text} />
              <ThemedText style={[styles.quickActionText, { color: theme.text }]}>Til dashboard</ThemedText>
            </Pressable>
          </View>
        </Animated.View>

        {/* Legend */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <View style={[styles.legendCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText style={[styles.legendTitle, { color: theme.textSecondary }]}>Forklaring:</ThemedText>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: "#4CAF50" }]} />
              <ThemedText style={styles.legendText}>Har bookinger</ThemedText>
            </View>
            <View style={styles.legendRow}>
              <EvendiIcon name="x-circle" size={14} color="#EF5350" />
              <ThemedText style={styles.legendText}>Blokkert</ThemedText>
            </View>
            <View style={styles.legendRow}>
              <EvendiIcon name="alert-circle" size={14} color="#FF9800" />
              <ThemedText style={styles.legendText}>Begrenset kapasitet</ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Multi-select controls */}
        {isMultiSelectMode ? (
          <View style={[styles.multiSelectBar, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.multiSelectInfo}>
              <EvendiIcon name="check-square" size={20} color={Colors.dark.accent} />
              <ThemedText style={styles.multiSelectText}>
                {selectedDates.size} dato{selectedDates.size !== 1 ? "er" : ""} valgt
              </ThemedText>
            </View>
            <View style={styles.multiSelectActions}>
              <Pressable
                onPress={selectAllDatesInMonth}
                style={[styles.multiSelectBtn, { borderColor: theme.border }]}
              >
                <ThemedText style={[styles.multiSelectBtnText, { color: theme.text }]}>Velg alle</ThemedText>
              </Pressable>
              <Pressable
                onPress={openBulkEditModal}
                disabled={selectedDates.size === 0}
                style={[styles.multiSelectBtn, { backgroundColor: Colors.dark.accent, opacity: selectedDates.size === 0 ? 0.5 : 1 }]}
              >
                <ThemedText style={[styles.multiSelectBtnText, { color: "#1A1A1A" }]}>Rediger</ThemedText>
              </Pressable>
              <Pressable onPress={exitMultiSelectMode} style={styles.cancelMultiBtn}>
                <EvendiIcon name="x" size={20} color={theme.textMuted} />
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setIsMultiSelectMode(true)}
            style={[styles.enableMultiSelectBtn, { borderColor: theme.border }]}
          >
            <EvendiIcon name="check-square" size={18} color={Colors.dark.accent} />
            <ThemedText style={[styles.enableMultiSelectText, { color: theme.text }]}>
              Velg flere datoer
            </ThemedText>
          </Pressable>
        )}

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <Pressable onPress={() => changeMonth(-1)} style={styles.monthButton}>
            <EvendiIcon name="chevron-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h3">
            {currentMonth.toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}
          </ThemedText>
          <Pressable onPress={() => changeMonth(1)} style={styles.monthButton}>
            <EvendiIcon name="chevron-right" size={24} color={theme.text} />
          </Pressable>
        </View>

        <Pressable
          onPress={jumpToToday}
          disabled={isSameMonth(currentMonth, new Date())}
          style={({ pressed }) => [
            styles.todayBtn,
            { borderColor: theme.border },
            isSameMonth(currentMonth, new Date()) && styles.todayBtnDisabled,
            pressed && !isSameMonth(currentMonth, new Date()) && { opacity: 0.7 },
          ]}
        >
          <EvendiIcon name="calendar" size={16} color={theme.text} />
          <ThemedText style={[styles.todayBtnText, { color: theme.text }]}>Hopp til i dag</ThemedText>
        </Pressable>

        {/* Calendar */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <View
            onLayout={(event) => {
              const { y, width } = event.nativeEvent.layout;
              setCalendarLayout({ y, width });
            }}
            style={[styles.calendar, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          >
          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map(day => (
              <View key={day} style={styles.weekdayCell}>
                <ThemedText style={[styles.weekdayText, { color: theme.textMuted }]}>{day}</ThemedText>
              </View>
            ))}
          </View>
          
          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {getCalendarDays().map((date, index) => renderDay(date, index))}
          </View>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
          <View style={[styles.statsCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}> 
            <ThemedText type="h4" style={styles.statsTitle}>Statistikk</ThemedText>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: "#EF5350" }]}> 
                  {availability.filter(a => a.status === "blocked").length}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Blokkerte</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: "#FF9800" }]}> 
                  {availability.filter(a => a.status === "limited").length}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Begrensede</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: "#4CAF50" }]}> 
                  {Object.values(bookings).reduce((sum, b) => sum + b.acceptedBookings, 0)}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Bookinger</ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">
                {selectedDate && new Date(selectedDate).toLocaleDateString("nb-NO", { 
                  day: "numeric", 
                  month: "long", 
                  year: "numeric" 
                })}
              </ThemedText>
              <Pressable onPress={() => setShowEditModal(false)}>
                <EvendiIcon name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Navn (valgfritt)</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                value={editName}
                onChangeText={setEditName}
                placeholder={isWedding ? "F.eks. 'Hansen bryllup' eller 'Opptatt'" : "F.eks. 'Firmakonferanse' eller 'Opptatt'"}
                placeholderTextColor={theme.textMuted}
                maxLength={100}
              />

              <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Status</ThemedText>
              <View style={styles.statusButtons}>
                {STATUS_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setEditStatus(option.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.statusButton,
                      { borderColor: editStatus === option.value ? option.color : theme.border },
                      editStatus === option.value && { backgroundColor: option.color + "15" },
                    ]}
                  >
                    <EvendiIcon 
                      name={option.icon} 
                      size={20} 
                      color={editStatus === option.value ? option.color : theme.textMuted} 
                    />
                    <ThemedText 
                      style={[
                        styles.statusButtonText,
                        { color: editStatus === option.value ? option.color : theme.text }
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {editStatus === "limited" && (
                <>
                  <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                    Maks antall bookinger
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                    ]}
                    value={editMaxBookings}
                    onChangeText={setEditMaxBookings}
                    keyboardType="number-pad"
                    placeholder="F.eks. 2"
                    placeholderTextColor={theme.textMuted}
                  />
                </>
              )}

              <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                Notater (valgfritt)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.notesInput,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                value={editNotes}
                onChangeText={setEditNotes}
                multiline
                numberOfLines={3}
                placeholder={isWedding ? "F.eks. 'Annet bryllup samme dag'" : "F.eks. 'Annet arrangement samme dag'"}
                placeholderTextColor={theme.textMuted}
              />

              {selectedDate && getBookingsForDate(new Date(selectedDate)) > 0 && (
                <View style={[styles.warningBox, { backgroundColor: "#FF980015", borderColor: "#FF9800" }]}>
                  <EvendiIcon name="alert-triangle" size={16} color="#FF9800" />
                  <ThemedText style={[styles.warningText, { color: "#FF9800" }]}>
                    Denne datoen har {getBookingsForDate(new Date(selectedDate))} aktiv(e) booking(er)
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              {availability.find(a => a.date === selectedDate) && (
                <Pressable
                  onPress={handleDelete}
                  disabled={deleteAvailabilityMutation.isPending}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.deleteBtn,
                    { borderColor: "#EF5350" },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <ThemedText style={[styles.actionBtnText, { color: "#EF5350" }]}>Slett</ThemedText>
                </Pressable>
              )}
              <Pressable
                onPress={handleSave}
                disabled={saveAvailabilityMutation.isPending}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.saveBtn,
                  { backgroundColor: theme.accent },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <ThemedText style={[styles.actionBtnText, { color: "#FFFFFF" }]}>
                  {saveAvailabilityMutation.isPending ? "Lagrer..." : "Lagre"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Bulk Edit Modal */}
      <Modal visible={showBulkModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">
                Rediger {selectedDates.size} dato{selectedDates.size !== 1 ? "er" : ""}
              </ThemedText>
              <Pressable onPress={() => setShowBulkModal(false)}>
                <EvendiIcon name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {/* Show selected dates preview */}
              <View style={[styles.selectedDatesPreview, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}>
                <ThemedText style={[styles.selectedDatesLabel, { color: theme.textSecondary }]}>
                  Valgte datoer:
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {Array.from(selectedDates).sort().map(dateStr => (
                    <View key={dateStr} style={[styles.selectedDateChip, { backgroundColor: Colors.dark.accent + "20" }]}>
                      <ThemedText style={[styles.selectedDateChipText, { color: Colors.dark.accent }]}>
                        {new Date(dateStr).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                      </ThemedText>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Navn (valgfritt)</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                value={editName}
                onChangeText={setEditName}
                placeholder="F.eks. 'Privat booking' eller 'Reservert'"
                placeholderTextColor={theme.textMuted}
                maxLength={100}
              />

              <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Status</ThemedText>
              <View style={styles.statusButtons}>
                {STATUS_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setEditStatus(option.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.statusButton,
                      { borderColor: editStatus === option.value ? option.color : theme.border },
                      editStatus === option.value && { backgroundColor: option.color + "15" },
                    ]}
                  >
                    <EvendiIcon 
                      name={option.icon} 
                      size={20} 
                      color={editStatus === option.value ? option.color : theme.textMuted} 
                    />
                    <ThemedText 
                      style={[
                        styles.statusButtonText,
                        { color: editStatus === option.value ? option.color : theme.text }
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {editStatus === "limited" && (
                <>
                  <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                    Maks antall bookinger
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                    ]}
                    value={editMaxBookings}
                    onChangeText={setEditMaxBookings}
                    keyboardType="number-pad"
                    placeholder="F.eks. 2"
                    placeholderTextColor={theme.textMuted}
                  />
                </>
              )}

              <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                Notater (valgfritt)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.notesInput,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                value={editNotes}
                onChangeText={setEditNotes}
                multiline
                numberOfLines={3}
                placeholder="F.eks. 'Ferie' eller 'Fullt booket'"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowBulkModal(false)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.deleteBtn,
                  { borderColor: theme.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <ThemedText style={[styles.actionBtnText, { color: theme.text }]}>Avbryt</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleBulkSave}
                disabled={bulkSaveAvailabilityMutation.isPending}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.saveBtn,
                  { backgroundColor: theme.accent },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <ThemedText style={[styles.actionBtnText, { color: "#FFFFFF" }]}>
                  {bulkSaveAvailabilityMutation.isPending ? "Lagrer..." : `Lagre ${selectedDates.size} datoer`}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  infoCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  infoTitle: { marginTop: Spacing.sm, textAlign: "center" },
  infoText: { marginTop: Spacing.sm, textAlign: "center", lineHeight: 20 },
  legendCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  legendTitle: { fontSize: 12, fontWeight: "600", marginBottom: Spacing.sm },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: { fontSize: 13 },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  monthButton: {
    padding: Spacing.sm,
  },
  calendar: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    padding: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusIcon: {
    position: "absolute",
    top: 2,
    right: 2,
  },
  bookingBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  bookingCount: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  limitText: {
    fontSize: 8,
    fontWeight: "600",
    position: "absolute",
    bottom: 2,
    left: 2,
  },
  statsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  statsTitle: { marginBottom: Spacing.md },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalBody: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  statusButtons: {
    gap: Spacing.sm,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  warningBox: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  warningText: {
    fontSize: 13,
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    borderWidth: 2,
  },
  saveBtn: {},
  actionBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Multi-select styles
  selectedDay: {
    backgroundColor: Colors.dark.accent + "20",
  },
  todayDay: {
    borderColor: Colors.dark.accent,
    borderWidth: 1,
  },
  highlightRowCell: {
    borderColor: Colors.dark.accent,
    borderWidth: 1,
  },
  selectedCheckmark: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.dark.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  multiSelectBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  multiSelectInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  multiSelectText: {
    fontSize: 14,
    fontWeight: "600",
  },
  multiSelectActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  multiSelectBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  multiSelectBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cancelMultiBtn: {
    padding: Spacing.xs,
  },
  enableMultiSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: Spacing.lg,
  },
  enableMultiSelectText: {
    fontSize: 14,
    fontWeight: "500",
  },
  todayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  todayBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  todayBtnDisabled: {
    opacity: 0.5,
  },
  selectedDatesPreview: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  selectedDatesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  selectedDateChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
  },
  selectedDateChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  quickActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
