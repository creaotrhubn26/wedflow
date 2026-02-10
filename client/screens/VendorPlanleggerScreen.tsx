import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, RefreshControl, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getVendorConfig } from "@/lib/vendor-adapter";
import { showToast } from "@/lib/toast";
import { showConfirm, showOptions } from "@/lib/dialogs";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

type Navigation = NativeStackNavigationProp<any>;

type VendorProduct = {
  id: string;
  title: string;
  description: string | null;
  unitPrice: number;
  unitType: string;
  imageUrl: string | null;
};

type VendorOffer = {
  id: string;
  title: string;
  status: string;
  totalAmount: number;
  currency: string | null;
  createdAt: string;
};

// Planner admin types (vendor-side)
interface PlannerMeeting {
  id: string;
  coupleName: string;
  date: string;
  time?: string;
  location?: string;
  topic?: string;
  notes?: string;
  completed: boolean;
}

interface PlannerTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  notes?: string;
  completed: boolean;
}

interface PlannerTimeline {
  onboardingComplete?: boolean;
  firstMeetingDone?: boolean;
  contractSigned?: boolean;
  depositReceived?: boolean;
  masterTimelineCreated?: boolean;
}

const PRIORITY_COLORS = {
  high: '#DC2626',
  medium: '#F59E0B',
  low: '#10B981',
};

const PRIORITY_LABELS = {
  high: 'Høy',
  medium: 'Gjennomsnitt',
  low: 'Lav',
};

export default function VendorPlanleggerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isWedding } = useEventType();
  const navigation = useNavigation<Navigation>();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Local admin state
  const [meetings, setMeetings] = useState<PlannerMeeting[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [timeline, setTimeline] = useState<PlannerTimeline>({});

  // Modals + forms
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<PlannerMeeting | null>(null);
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);

  const [coupleName, setCoupleName] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  const vendorConfig = getVendorConfig(null, "Planlegger");

  useEffect(() => {
    const loadSession = async () => {
      const data = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!data) {
        navigation.replace("VendorLogin");
        return;
      }
      const parsed = JSON.parse(data);
      setSessionToken(parsed?.sessionToken || null);
    };
    loadSession();
  }, [navigation]);

  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery<VendorProduct[]>({
    queryKey: ["/api/vendor/products"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const res = await fetch(new URL("/api/vendor/products", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!sessionToken,
  });

  const { data: offers = [], isLoading: offersLoading, refetch: refetchOffers } = useQuery<VendorOffer[]>({
    queryKey: ["/api/vendor/offers"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const res = await fetch(new URL("/api/vendor/offers", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!sessionToken,
  });

  const apiBase = getApiUrl();

  const meetingsQuery = useQuery<PlannerMeeting[]>({
    queryKey: ["/api/vendor/planner/meetings", sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      const res = await fetch(new URL(`/api/vendor/planner/meetings`, apiBase).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [] as PlannerMeeting[];
      return res.json();
    },
  });

  useEffect(() => {
    if (meetingsQuery.data) {
      setMeetings(Array.isArray(meetingsQuery.data) ? meetingsQuery.data : []);
    }
  }, [meetingsQuery.data]);

  const tasksQuery = useQuery<PlannerTask[]>({
    queryKey: ["/api/vendor/planner/tasks", sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      const res = await fetch(new URL(`/api/vendor/planner/tasks`, apiBase).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [] as PlannerTask[];
      return res.json();
    },
  });

  useEffect(() => {
    if (tasksQuery.data) {
      setTasks(Array.isArray(tasksQuery.data) ? tasksQuery.data : []);
    }
  }, [tasksQuery.data]);

  const timelineQuery = useQuery<PlannerTimeline>({
    queryKey: ["/api/vendor/planner/timeline", sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      const res = await fetch(new URL(`/api/vendor/planner/timeline`, apiBase).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return {} as PlannerTimeline;
      return res.json();
    },
  });

  useEffect(() => {
    if (timelineQuery.data) {
      setTimeline(timelineQuery.data || {});
    }
  }, [timelineQuery.data]);

  const plannerMutation = useMutation({
    mutationFn: async ({ kind, payload }: { kind: "meetings" | "tasks" | "timeline"; payload: any }) => {
      if (!sessionToken) return;
      await fetch(new URL(`/api/vendor/planner/${kind}`, apiBase).toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    },
  });

  const persistAndCache = (kind: "meetings" | "tasks" | "timeline", payload: any) => {
    if (!sessionToken) return;
    const key = [`/api/vendor/planner/${kind}`, sessionToken];
    queryClient.setQueryData(key, payload);
    plannerMutation.mutate({ kind, payload });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchProducts(), refetchOffers(), meetingsQuery.refetch(), tasksQuery.refetch(), timelineQuery.refetch()]);
    setIsRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Meeting handlers
  const openMeetingModal = (meeting?: PlannerMeeting) => {
    if (meeting) {
      setEditingMeeting(meeting);
      setCoupleName(meeting.coupleName);
      setMeetingDate(meeting.date);
      setMeetingTime(meeting.time || '');
      setMeetingLocation(meeting.location || '');
      setMeetingTopic(meeting.topic || '');
      setMeetingNotes(meeting.notes || '');
    } else {
      setEditingMeeting(null);
      setCoupleName('');
      setMeetingDate('');
      setMeetingTime('');
      setMeetingLocation('');
      setMeetingTopic('');
      setMeetingNotes('');
    }
    setShowMeetingModal(true);
  };

  const saveMeeting = () => {
    if (!coupleName.trim() || !meetingDate.trim()) {
      showToast(isWedding ? 'Vennligst fyll inn parnavn og dato' : 'Vennligst fyll inn kundenavn og dato');
      return;
    }

    const meeting: PlannerMeeting = {
      id: editingMeeting?.id || Date.now().toString(),
      coupleName,
      date: meetingDate,
      time: meetingTime,
      location: meetingLocation,
      topic: meetingTopic,
      notes: meetingNotes,
      completed: editingMeeting?.completed || false,
    };

    let next = meetings;
    if (editingMeeting) {
      next = meetings.map(m => m.id === editingMeeting.id ? meeting : m);
    } else {
      next = [...meetings, meeting];
    }
    setMeetings(next);
    persistAndCache("meetings", next);

    setShowMeetingModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteMeeting = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Slett møte',
      message: 'Er du sikker på at du vil slette dette møtet?',
      confirmLabel: 'Slett',
      cancelLabel: 'Avbryt',
      destructive: true,
    });
    if (!confirmed) return;
    const next = meetings.filter(m => m.id !== id);
    setMeetings(next);
    persistAndCache("meetings", next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const duplicateMeeting = (meeting: PlannerMeeting) => {
    const newMeeting: PlannerMeeting = {
      ...meeting,
      id: Date.now().toString(),
      coupleName: `Kopi av ${meeting.coupleName}`,
      completed: false,
    };
    const next = [...meetings, newMeeting];
    setMeetings(next);
    persistAndCache("meetings", next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleMeetingComplete = (id: string) => {
    const next = meetings.map(m => m.id === id ? { ...m, completed: !m.completed } : m);
    setMeetings(next);
    persistAndCache("meetings", next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Task handlers
  const openTaskModal = (task?: PlannerTask) => {
    if (task) {
      setEditingTask(task);
      setTaskTitle(task.title);
      setTaskDueDate(task.dueDate);
      setTaskPriority(task.priority);
      setTaskCategory(task.category || '');
      setTaskNotes(task.notes || '');
    } else {
      setEditingTask(null);
      setTaskTitle('');
      setTaskDueDate('');
      setTaskPriority('medium');
      setTaskCategory('');
      setTaskNotes('');
    }
    setShowTaskModal(true);
  };

  const saveTask = () => {
    if (!taskTitle.trim() || !taskDueDate.trim()) {
      showToast('Vennligst fyll inn oppgavenavn og forfallsdato');
      return;
    }

    const task: PlannerTask = {
      id: editingTask?.id || Date.now().toString(),
      title: taskTitle,
      dueDate: taskDueDate,
      priority: taskPriority,
      category: taskCategory,
      notes: taskNotes,
      completed: editingTask?.completed || false,
    };

    let next = tasks;
    if (editingTask) {
      next = tasks.map(t => t.id === editingTask.id ? task : t);
    } else {
      next = [...tasks, task];
    }
    setTasks(next);
    persistAndCache("tasks", next);

    setShowTaskModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteTask = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Slett oppgave',
      message: 'Er du sikker på at du vil slette denne oppgaven?',
      confirmLabel: 'Slett',
      cancelLabel: 'Avbryt',
      destructive: true,
    });
    if (!confirmed) return;
    const next = tasks.filter(t => t.id !== id);
    setTasks(next);
    persistAndCache("tasks", next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const duplicateTask = (task: PlannerTask) => {
    const newTask: PlannerTask = {
      ...task,
      id: Date.now().toString(),
      title: `Kopi av ${task.title}`,
      completed: false,
    };
    const next = [...tasks, newTask];
    setTasks(next);
    persistAndCache("tasks", next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleTaskComplete = (id: string) => {
    const next = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(next);
    persistAndCache("tasks", next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const goToProducts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ProductCreate");
  };

  const goToOffers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("OfferCreate");
  };

  const handleDelete = async (id: string, type: 'product' | 'offer') => {
    const confirmed = await showConfirm({
      title: `Slett ${type === 'product' ? 'produkt' : 'tilbud'}`,
      message: "Er du sikker?",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!sessionToken) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xl + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
      >
      <ThemedText style={[styles.title, { color: theme.text }]}>Planlegger dashboard</ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>Publiser planleggingspakker, tjenester og priser, og send tilbud raskt.</ThemedText>

      <View style={styles.cardRow}>
        <Pressable
          onPress={goToProducts}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            pressed && { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Planleggingspakker</ThemedText>
            <EvendiIcon name="clipboard" size={18} color={theme.textSecondary} />
          </View>
          <ThemedText style={[styles.cardBody, { color: theme.textSecondary }]}>Legg til pakker for full planlegging, delvis hjelp eller dagskoordinering.</ThemedText>
          <Button style={styles.cardButton} onPress={goToProducts}>Opprett pakke</Button>
        </Pressable>

        <Pressable
          onPress={goToOffers}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            pressed && { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Tilbud</ThemedText>
            <EvendiIcon name="file-text" size={18} color={theme.textSecondary} />
          </View>
          <ThemedText style={[styles.cardBody, { color: theme.textSecondary }]}>Send tilbud med pakkepriser og tilgjengelighet.</ThemedText>
          <Button style={styles.cardButton} onPress={goToOffers}>Send tilbud</Button>
        </Pressable>
      </View>

      <View style={[styles.infoBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <EvendiIcon name="info" size={16} color={theme.textSecondary} />
        <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>Legg til bilder av tidligere arrangementer og anmeldelser for å øke konvertering.</ThemedText>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Produkter</ThemedText>
          {productsLoading ? <ActivityIndicator size="small" color={theme.accent} /> : null}
        </View>
        {products.length === 0 ? (
          <View style={styles.emptyRow}>
            <EvendiIcon name="clipboard" size={18} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen pakker ennå</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Legg til planleggingspakker for å komme i gang</ThemedText>
            </View>
            <Button onPress={goToProducts}>Opprett</Button>
          </View>
        ) : (
          products.map((p, idx) => (
            <Animated.View key={p.id} entering={FadeInDown.delay(idx * 30)}>
              <SwipeableRow onDelete={() => handleDelete(p.id, 'product')}>
                <Pressable onPress={goToProducts} style={[styles.listRow, { borderBottomColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ color: theme.text, fontWeight: "600" }}>{p.title}</ThemedText>
                    <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>{p.unitPrice} {p.unitType}</ThemedText>
                    {p.description ? <ThemedText numberOfLines={1} style={{ color: theme.textSecondary, fontSize: 12 }}>{p.description}</ThemedText> : null}
                  </View>
                  <EvendiIcon name="chevron-right" size={18} color={theme.textSecondary} />
                </Pressable>
              </SwipeableRow>
            </Animated.View>
          ))
        )}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Tilbud</ThemedText>
          {offersLoading ? <ActivityIndicator size="small" color={theme.accent} /> : null}
        </View>
        {offers.length === 0 ? (
          <View style={styles.emptyRow}>
            <EvendiIcon name="file-text" size={18} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen tilbud ennå</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Send tilbud til kunden</ThemedText>
            </View>
            <Button onPress={goToOffers}>Send tilbud</Button>
          </View>
        ) : (
          offers.map((o, idx) => (
            <Animated.View key={o.id} entering={FadeInDown.delay(idx * 30)}>
              <SwipeableRow onDelete={() => handleDelete(o.id, 'offer')}>
                <Pressable onPress={goToOffers} style={[styles.listRow, { borderBottomColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ color: theme.text, fontWeight: "600" }}>{o.title}</ThemedText>
                    <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>{o.totalAmount} {o.currency || 'NOK'}</ThemedText>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{o.status}</ThemedText>
                    <EvendiIcon name="chevron-right" size={18} color={theme.textSecondary} />
                  </View>
                </Pressable>
              </SwipeableRow>
            </Animated.View>
          ))
        )}
      </View>

      {/* Admin: Meetings with couples */}
      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>{isWedding ? "Møter med par" : "Møter med kunder"}</ThemedText>
          <Pressable onPress={() => openMeetingModal()} style={styles.addIconBtn}>
            <EvendiIcon name="plus" size={18} color={theme.text} />
          </Pressable>
        </View>
        {meetings.length === 0 ? (
          <View style={styles.emptyRow}>
            <EvendiIcon name="users" size={18} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen møter ennå</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Planlegg møte med kunden</ThemedText>
            </View>
            <Button onPress={() => openMeetingModal()}>Legg til</Button>
          </View>
        ) : (
          meetings.map((m, idx) => (
            <Animated.View key={m.id} entering={FadeInDown.delay(idx * 30)}>
              <SwipeableRow onDelete={() => deleteMeeting(m.id)}>
                <Pressable
                  onPress={() => openMeetingModal(m)}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    showOptions({
                      title: 'Alternativer',
                      message: m.coupleName,
                      cancelLabel: 'Avbryt',
                      options: [
                        { label: 'Rediger', onPress: () => openMeetingModal(m) },
                        { label: 'Dupliser', onPress: () => duplicateMeeting(m) },
                        { label: 'Slett', destructive: true, onPress: () => deleteMeeting(m.id) },
                      ],
                    });
                  }}
                  style={[styles.meetingRow, { backgroundColor: theme.backgroundDefault }]}
                >
                  <Pressable
                    onPress={() => toggleMeetingComplete(m.id)}
                    style={[
                      styles.checkbox,
                      { borderColor: theme.border },
                      m.completed && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                  >
                    {m.completed && <EvendiIcon name="check" size={14} color="#fff" />}
                  </Pressable>
                  <View style={styles.cardInfo}>
                    <ThemedText style={[styles.cardTitle, m.completed && styles.completedText]}>{m.coupleName}</ThemedText>
                    <ThemedText style={[styles.cardDate, { color: theme.textSecondary }]}>{m.date} {m.time && `kl. ${m.time}`}</ThemedText>
                    {m.topic ? (
                      <ThemedText style={[styles.cardDate, { color: theme.textSecondary }]}>Tema: {m.topic}</ThemedText>
                    ) : null}
                  </View>
                  <Pressable onPress={() => duplicateMeeting(m)} style={styles.quickActionButton}>
                    <EvendiIcon name="copy" size={16} color={theme.textSecondary} />
                  </Pressable>
                  <EvendiIcon name="chevron-right" size={18} color={theme.textSecondary} />
                </Pressable>
              </SwipeableRow>
            </Animated.View>
          ))
        )}
      </View>

      {/* Admin: Planner tasks */}
      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Oppgaver</ThemedText>
          <Pressable onPress={() => openTaskModal()} style={styles.addIconBtn}>
            <EvendiIcon name="plus" size={18} color={theme.text} />
          </Pressable>
        </View>
        {tasks.length === 0 ? (
          <View style={styles.emptyRow}>
            <EvendiIcon name="check-square" size={18} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen oppgaver ennå</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Opprett oppgaver for planleggingen</ThemedText>
            </View>
            <Button onPress={() => openTaskModal()}>Legg til</Button>
          </View>
        ) : (
          tasks.map((t, idx) => (
            <Animated.View key={t.id} entering={FadeInDown.delay(idx * 30)}>
              <SwipeableRow onDelete={() => deleteTask(t.id)}>
                <Pressable
                  onPress={() => openTaskModal(t)}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    showOptions({
                      title: 'Alternativer',
                      message: t.title,
                      cancelLabel: 'Avbryt',
                      options: [
                        { label: 'Rediger', onPress: () => openTaskModal(t) },
                        { label: 'Dupliser', onPress: () => duplicateTask(t) },
                        { label: 'Slett', destructive: true, onPress: () => deleteTask(t.id) },
                      ],
                    });
                  }}
                  style={[styles.meetingRow, { backgroundColor: theme.backgroundDefault }]}
                >
                  <Pressable
                    onPress={() => toggleTaskComplete(t.id)}
                    style={[
                      styles.checkbox,
                      { borderColor: theme.border },
                      t.completed && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                  >
                    {t.completed && <EvendiIcon name="check" size={14} color="#fff" />}
                  </Pressable>
                  <View style={styles.cardInfo}>
                    <ThemedText style={[styles.cardTitle, t.completed && styles.completedText]}>{t.title}</ThemedText>
                    <View style={styles.taskMeta}>
                      <ThemedText style={[styles.cardDate, { color: theme.textSecondary }]}>{t.dueDate}</ThemedText>
                      <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[t.priority] }]}>
                        <ThemedText style={styles.priorityText}>{PRIORITY_LABELS[t.priority]}</ThemedText>
                      </View>
                      {t.category ? (
                        <ThemedText style={[styles.categoryLabel, { color: theme.textSecondary }]}>{t.category}</ThemedText>
                      ) : null}
                    </View>
                  </View>
                  <Pressable onPress={() => duplicateTask(t)} style={styles.quickActionButton}>
                    <EvendiIcon name="copy" size={16} color={theme.textSecondary} />
                  </Pressable>
                  <EvendiIcon name="chevron-right" size={18} color={theme.textSecondary} />
                </Pressable>
              </SwipeableRow>
            </Animated.View>
          ))
        )}
      </View>

      {/* Admin: Timeline */}
      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      >
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Tidslinje</ThemedText>
        </View>
        <View style={[styles.timelineCard]}
        >
          {[
            { key: 'onboardingComplete', label: 'Onboarding fullført', icon: 'check-circle' as const },
            { key: 'firstMeetingDone', label: 'Første møte gjennomført', icon: 'users' as const },
            { key: 'contractSigned', label: 'Kontrakt signert', icon: 'file-text' as const },
            { key: 'depositReceived', label: 'Depositum mottatt', icon: 'credit-card' as const },
            { key: 'masterTimelineCreated', label: 'Master-tidslinje opprettet', icon: 'calendar' as const },
          ].map((step) => (
            <Pressable
              key={step.key}
              onPress={() => {
                const next = { ...timeline, [step.key]: !timeline[step.key as keyof PlannerTimeline] };
                setTimeline(next);
                persistAndCache("timeline", next);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.timelineStep}
            >
              <View
                style={[
                  styles.timelineCheckbox,
                  timeline[step.key as keyof PlannerTimeline] && { backgroundColor: Colors.light.success, borderColor: Colors.light.success },
                ]}
              >
                {timeline[step.key as keyof PlannerTimeline] && <EvendiIcon name="check" size={12} color="#fff" />}
              </View>
              <View style={styles.timelineStepContent}>
                <EvendiIcon name={step.icon} size={16} color={theme.textSecondary} />
                <ThemedText style={styles.timelineLabel}>{step.label}</ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      </ScrollView>
      {/* Modals */}
      {/* Meeting Modal */}
      <Modal visible={showMeetingModal} animationType="slide" onRequestClose={() => setShowMeetingModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}> 
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}> 
            <Pressable onPress={() => setShowMeetingModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.primary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>{editingMeeting ? 'Rediger møte' : 'Legg til møte'}</ThemedText>
            <Pressable onPress={saveMeeting}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>{isWedding ? "Parnavn *" : "Kundenavn *"}</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder={isWedding ? "f.eks. Anna & Jonas" : "f.eks. Bedrift AS"}
                placeholderTextColor={theme.textSecondary}
                value={coupleName}
                onChangeText={setCoupleName}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Dato *</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="DD.MM.YYYY"
                placeholderTextColor={theme.textSecondary}
                value={meetingDate}
                onChangeText={setMeetingDate}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Tid</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="HH:MM"
                  placeholderTextColor={theme.textSecondary}
                  value={meetingTime}
                  onChangeText={setMeetingTime}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
                <ThemedText style={styles.formLabel}>Sted</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="f.eks. Kontor"
                  placeholderTextColor={theme.textSecondary}
                  value={meetingLocation}
                  onChangeText={setMeetingLocation}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Tema</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="f.eks. Budsjett og leverandører"
                placeholderTextColor={theme.textSecondary}
                value={meetingTopic}
                onChangeText={setMeetingTopic}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, minHeight: 80 }]}
                placeholder="Møtenotater..."
                placeholderTextColor={theme.textSecondary}
                value={meetingNotes}
                onChangeText={setMeetingNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
      
      {/* Task Modal */}
      <Modal visible={showTaskModal} animationType="slide" onRequestClose={() => setShowTaskModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}> 
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}> 
            <Pressable onPress={() => setShowTaskModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.primary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>{editingTask ? 'Rediger oppgave' : 'Legg til oppgave'}</ThemedText>
            <Pressable onPress={saveTask}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Oppgavenavn *</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="f.eks. Sende tidslinjeutkast"
                placeholderTextColor={theme.textSecondary}
                value={taskTitle}
                onChangeText={setTaskTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Forfallsdato *</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="DD.MM.YYYY"
                placeholderTextColor={theme.textSecondary}
                value={taskDueDate}
                onChangeText={setTaskDueDate}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Prioritet</ThemedText>
              <View style={styles.priorityGroup}>
                {(['high', 'medium', 'low'] as const).map((priority) => (
                  <Pressable
                    key={priority}
                    onPress={() => setTaskPriority(priority)}
                    style={[styles.priorityOption, taskPriority === priority && { backgroundColor: PRIORITY_COLORS[priority] + '30' }]}
                  >
                    <ThemedText style={styles.priorityOptionText}>{PRIORITY_LABELS[priority]}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Kategori</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {['Møter','Dokumenter','Leverandører','Budget','Betalinger','Annet'].map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setTaskCategory(taskCategory === cat ? '' : cat)}
                    style={[styles.categoryChip, taskCategory === cat && { backgroundColor: Colors.light.success }]}
                  >
                    <ThemedText style={styles.categoryChipText}>{cat}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, minHeight: 80 }]}
                placeholder="Oppgavedetaljer..."
                placeholderTextColor={theme.textSecondary}
                value={taskNotes}
                onChangeText={setTaskNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "700", marginBottom: Spacing.xs },
  subtitle: { fontSize: 14, marginBottom: Spacing.lg },
  cardRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.lg },
  card: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardBody: { fontSize: 13, marginBottom: Spacing.md },
  cardButton: { marginTop: Spacing.sm },
  infoBox: { flexDirection: "row", gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.lg },
  infoText: { flex: 1, fontSize: 13 },
  sectionCard: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.md },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  emptyRow: { flexDirection: "row", gap: Spacing.md, alignItems: "center", paddingVertical: Spacing.md },
  emptyTitle: { fontSize: 14, fontWeight: "600" },
  emptySubtitle: { fontSize: 12, marginTop: 2 },
  listRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  addIconBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  meetingRow: { borderRadius: BorderRadius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardDate: { fontSize: 12 },
  completedText: { textDecorationLine: 'line-through', opacity: 0.6 },
  quickActionButton: { padding: Spacing.sm, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  priorityBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: 4 },
  priorityText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  categoryLabel: { fontSize: 11 },
  timelineCard: { borderRadius: BorderRadius.md },
  timelineStep: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  timelineCheckbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timelineStepContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  timelineLabel: { fontSize: 14, fontWeight: '500' },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalSave: { fontSize: 16, fontWeight: '600' },
  modalContent: { flex: 1, padding: Spacing.lg },
  formGroup: { marginBottom: Spacing.lg },
  formLabel: { fontSize: 14, fontWeight: '500', marginBottom: Spacing.sm },
  formRow: { flexDirection: 'row' },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: 14 },
  priorityGroup: { flexDirection: 'row', gap: Spacing.sm },
  priorityOption: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
  priorityOptionText: { fontSize: 13, fontWeight: '500' },
  categoryScroll: { marginRight: -Spacing.lg },
  categoryChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginRight: Spacing.sm, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ccc' },
  categoryChipText: { fontSize: 12, fontWeight: '500' },
});
