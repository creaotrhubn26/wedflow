import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  RefreshControl,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown, FadeInRight, SlideInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { QaWordCloud } from "@/components/QaWordCloud";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getQaSessions, saveQaSessions, generateId } from "@/lib/storage";
import { QaQuestion, QaSession, QaSettings, GameScore } from "@/lib/types";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";
import PersistentTextInput from "@/components/PersistentTextInput";
import {
  type QaGameConfig,
  type QaGameMode,
  SHOE_GAME_QUESTIONS,
  ICEBREAKER_QUESTIONS,
  TWO_TRUTHS_QUESTIONS,
} from "@shared/event-types";
import {
  getGameImage,
  getGameAccent,
  getQaSessionIcon,
  SHOE_TURN_IMAGES,
  QA_GAMES_LOGO,
  ALL_DEFAULT_GAME_ICONS,
  GAME_ACCENT_COLORS,
} from "@/lib/qa-game-icons";

// ─────────────────────── Tabs ───────────────────────
type QaTab = "audience" | "games" | "cloud" | "admin";

const TAB_CONFIG: { key: QaTab; label: string; icon: string }[] = [
  { key: "audience", label: "Still spørsmål", icon: "message-circle" },
  { key: "cloud", label: "Populært", icon: "bar-chart-2" },
  { key: "admin", label: "Administrer", icon: "settings" },
];

// ─────────────────────── Game question helpers ───────────────────────
function getPresetQuestions(mode: QaGameMode) {
  switch (mode) {
    case "shoe_game": return SHOE_GAME_QUESTIONS;
    case "icebreaker": return ICEBREAKER_QUESTIONS;
    case "two_truths": return TWO_TRUTHS_QUESTIONS;
    default: return [];
  }
}

// ─────────────────────── Status helpers ───────────────────────
const STATUS_LABELS: Record<QaQuestion["status"], string> = {
  pending: "Venter",
  approved: "Godkjent",
  answered: "Besvart",
  rejected: "Avvist",
  highlighted: "Uthevet",
};

const STATUS_COLORS: Record<QaQuestion["status"], string> = {
  pending: "#f59e0b",
  approved: Colors.dark.accent,
  answered: "#16a34a",
  rejected: "#ef4444",
  highlighted: "#8b5cf6",
};

// ─────────────────────── Default Settings ───────────────────────
const DEFAULT_QA_SETTINGS: QaSettings = {
  showAuthorName: true,
  showScore: true,
  showUpvoteCount: true,
  showTimestamp: true,
  allowAnonymous: true,
  gameTimerEnabled: false,
  gameTimerSeconds: 15,
  showGameScore: true,
  showGameLeaderboard: true,
  shuffleQuestions: true,
  audienceCanSeeAnswers: true,
};

function getSettings(session: QaSession): QaSettings {
  return { ...DEFAULT_QA_SETTINGS, ...session.settings };
}

// ─────────────────────── Default Session ───────────────────────
function createDefaultSession(): QaSession {
  return {
    id: generateId(),
    title: "Spørsmål og svar",
    isActive: true,
    createdAt: new Date().toISOString(),
    moderationEnabled: true,
    anonymousAllowed: true,
    questions: [],
  };
}

// ─────────────────────── Main Component ───────────────────────
export default function QaSystemScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { eventType, config, isWedding, isCorporate } = useEventType();

  // Event-type-aware games
  const availableGames: QaGameConfig[] = config.qaGames ?? [];
  const hasGames = availableGames.length > 0;

  // Build tabs dynamically based on event type
  const tabConfig = useMemo(() => {
    const tabs: { key: QaTab; label: string; icon: string }[] = [
      { key: "audience", label: "Still spørsmål", icon: "message-circle" },
    ];
    if (hasGames) {
      const primaryGame = availableGames[0];
      tabs.push({ key: "games", label: primaryGame.labelNo, icon: "zap" });
    }
    tabs.push({ key: "cloud", label: "Populært", icon: "bar-chart-2" });
    tabs.push({ key: "admin", label: "Administrer", icon: "settings" });
    return tabs;
  }, [hasGames, availableGames]);

  const [session, setSession] = useState<QaSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<QaTab>("audience");

  // Audience state
  const [newQuestion, setNewQuestion] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [newTags, setNewTags] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedCloudTag, setSelectedCloudTag] = useState<string | null>(null);

  // Admin filter
  const [adminFilter, setAdminFilter] = useState<QaQuestion["status"] | "all">("all");

  // Game state
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [shoeGameActive, setShoeGameActive] = useState(false);
  const [shoeGameQuestionIndex, setShoeGameQuestionIndex] = useState(0);
  const [showGameInstructions, setShowGameInstructions] = useState(true);
  const [gameQuestionPool, setGameQuestionPool] = useState<typeof SHOE_GAME_QUESTIONS>([]);

  // Unique user ID (persisted per session)
  const [userId] = useState(() => generateId());

  // ── Load data ──
  const loadData = useCallback(async () => {
    const sessions = await getQaSessions();
    if (sessions.length === 0) {
      const defaultSession = createDefaultSession();
      await saveQaSessions([defaultSession]);
      setSession(defaultSession);
    } else {
      // Use the first active session
      const active = sessions.find((s) => s.isActive) || sessions[0];
      setSession(active);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ── Save helper ──
  const saveSession = useCallback(async (updated: QaSession) => {
    setSession(updated);
    const sessions = await getQaSessions();
    const idx = sessions.findIndex((s) => s.id === updated.id);
    if (idx >= 0) {
      sessions[idx] = updated;
    } else {
      sessions.push(updated);
    }
    await saveQaSessions(sessions);
  }, []);

  // ── Computed ──
  const visibleQuestions = useMemo(() => {
    if (!session) return [];
    let questions = session.questions;

    // For audience: only show approved/highlighted/answered
    if (activeTab === "audience") {
      questions = questions.filter(
        (q) => q.status === "approved" || q.status === "answered" || q.status === "highlighted"
      );
    }

    // Admin filter
    if (activeTab === "admin" && adminFilter !== "all") {
      questions = questions.filter((q) => q.status === adminFilter);
    }

    // Cloud tag filter
    if (selectedCloudTag) {
      questions = questions.filter(
        (q) =>
          q.tags.some((t) => t.toLowerCase() === selectedCloudTag.toLowerCase()) ||
          q.text.toLowerCase().includes(selectedCloudTag.toLowerCase())
      );
    }

    // Sort: highlighted first, then by upvotes, then newest
    return [...questions].sort((a, b) => {
      if (a.status === "highlighted" && b.status !== "highlighted") return -1;
      if (b.status === "highlighted" && a.status !== "highlighted") return 1;
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [session, activeTab, adminFilter, selectedCloudTag]);

  const stats = useMemo(() => {
    if (!session) return { total: 0, pending: 0, answered: 0, highlighted: 0 };
    const qs = session.questions;
    return {
      total: qs.length,
      pending: qs.filter((q) => q.status === "pending").length,
      answered: qs.filter((q) => q.status === "answered").length,
      highlighted: qs.filter((q) => q.status === "highlighted").length,
    };
  }, [session]);

  // ── Actions ──
  const handleSubmitQuestion = async () => {
    if (!session) return;
    if (!newQuestion.trim()) {
      showToast("Skriv inn spørsmålet ditt");
      return;
    }

    const tags = newTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const question: QaQuestion = {
      id: generateId(),
      text: newQuestion.trim(),
      authorName: isAnonymous ? "Anonym" : newAuthor.trim() || "Gjest",
      authorId: userId,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
      status: session.moderationEnabled ? "pending" : "approved",
      tags,
      isAnonymous,
    };

    const updated: QaSession = {
      ...session,
      questions: [...session.questions, question],
    };
    await saveSession(updated);

    setNewQuestion("");
    setNewAuthor("");
    setNewTags("");
    setShowSubmitForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (session.moderationEnabled) {
      showToast("Spørsmålet er sendt inn og venter på godkjenning ✓");
    } else {
      showToast("Spørsmålet er publisert! ✓");
    }
  };

  const handleUpvote = async (questionId: string) => {
    if (!session) return;
    const updated: QaSession = {
      ...session,
      questions: session.questions.map((q) => {
        if (q.id !== questionId) return q;
        const alreadyVoted = q.upvotedBy.includes(userId);
        return {
          ...q,
          upvotes: alreadyVoted ? q.upvotes - 1 : q.upvotes + 1,
          upvotedBy: alreadyVoted
            ? q.upvotedBy.filter((id) => id !== userId)
            : [...q.upvotedBy, userId],
        };
      }),
    };
    await saveSession(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSetStatus = async (questionId: string, status: QaQuestion["status"]) => {
    if (!session) return;
    const updated: QaSession = {
      ...session,
      questions: session.questions.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          status,
          ...(status === "answered"
            ? { answeredAt: new Date().toISOString(), answeredBy: "Admin" }
            : {}),
        };
      }),
    };
    await saveSession(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!session) return;
    const confirmed = await showConfirm({
      title: "Slett spørsmål",
      message: "Er du sikker på at du vil slette dette spørsmålet?",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;

    const updated: QaSession = {
      ...session,
      questions: session.questions.filter((q) => q.id !== questionId),
    };
    await saveSession(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleToggleModeration = async () => {
    if (!session) return;
    const updated: QaSession = {
      ...session,
      moderationEnabled: !session.moderationEnabled,
    };
    await saveSession(updated);
    showToast(
      updated.moderationEnabled
        ? "Moderering aktivert - spørsmål må godkjennes"
        : "Moderering av - spørsmål publiseres direkte"
    );
  };

  const handleUpdateSetting = async (key: keyof QaSettings, value: boolean | number | string | Record<string, string> | undefined) => {
    if (!session) return;
    const currentSettings = getSettings(session);
    const updated: QaSession = {
      ...session,
      settings: { ...currentSettings, [key]: value },
    };
    await saveSession(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  /** Update a single key inside a nested settings record (customGameIcons, customGameAccents). */
  const handleUpdateGameIconSetting = async (
    settingsKey: "customGameIcons" | "customGameAccents",
    gameMode: string,
    value: string | undefined,
  ) => {
    if (!session) return;
    const currentSettings = getSettings(session);
    const current = currentSettings[settingsKey] ?? {};
    const next = { ...current };
    if (value === undefined) {
      delete next[gameMode];
    } else {
      next[gameMode] = value;
    }
    await handleUpdateSetting(settingsKey, Object.keys(next).length > 0 ? next : undefined);
  };

  /** Pick an image from the device library and store its local URI as the custom icon. */
  const pickGameIcon = async (gameMode?: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Vi trenger tilgang til bildebiblioteket for å velge ikon.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    if (gameMode) {
      await handleUpdateGameIconSetting("customGameIcons", gameMode, uri);
    } else {
      await handleUpdateSetting("customQaIcon", uri);
    }
  };

  const handleAddGameScore = async (score: GameScore) => {
    if (!session) return;
    const updated: QaSession = {
      ...session,
      gameScores: [...(session.gameScores || []), score],
    };
    await saveSession(updated);
  };

  const handleClearGameScores = async () => {
    if (!session) return;
    const confirmed = await showConfirm({
      title: "Nullstill poeng",
      message: "Vil du slette alle poengresultater?",
      confirmLabel: "Nullstill",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    const updated: QaSession = { ...session, gameScores: [] };
    await saveSession(updated);
    showToast("Poeng nullstilt");
  };

  const handleClearCloudFilter = () => {
    setSelectedCloudTag(null);
  };

  // ── Loading ──
  if (loading || !session) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={{ color: theme.textSecondary }}>Laster...</ThemedText>
      </View>
    );
  }

  // ── Audience Question Card ──
  const renderQuestionCard = (question: QaQuestion, index: number) => {
    const isHighlighted = question.status === "highlighted";
    const isAnswered = question.status === "answered";
    const hasUpvoted = question.upvotedBy.includes(userId);
    const settings = getSettings(session);

    return (
      <Animated.View
        key={question.id}
        entering={FadeInRight.delay(index * 60).duration(300)}
      >
        <View
          style={[
            styles.questionCard,
            {
              backgroundColor: isHighlighted
                ? "#8b5cf620"
                : theme.backgroundDefault,
              borderColor: isHighlighted ? "#8b5cf6" : theme.border,
              borderWidth: isHighlighted ? 2 : 1,
            },
          ]}
        >
          {isHighlighted && (
            <View style={styles.highlightBanner}>
              <EvendiIcon name="star" size={14} color="#8b5cf6" />
              <ThemedText style={[styles.highlightText, { color: "#8b5cf6" }]}>
                Uthevet spørsmål
              </ThemedText>
            </View>
          )}

          <ThemedText style={[styles.questionText, { color: theme.text }]}>
            {question.text}
          </ThemedText>

          <View style={styles.questionMeta}>
            {settings.showAuthorName && (
              <View style={styles.authorRow}>
                <EvendiIcon
                  name={question.isAnonymous ? "eye-off" : "user"}
                  size={12}
                  color={theme.textMuted}
                />
                <ThemedText style={[styles.authorName, { color: theme.textSecondary }]}>
                  {question.authorName}
                </ThemedText>
                {settings.showTimestamp && (
                  <ThemedText style={[styles.timestamp, { color: theme.textMuted }]}>
                    {formatTime(question.createdAt)}
                  </ThemedText>
                )}
              </View>
            )}

            {!settings.showAuthorName && settings.showTimestamp && (
              <ThemedText style={[styles.timestamp, { color: theme.textMuted }]}>
                {formatTime(question.createdAt)}
              </ThemedText>
            )}

            {question.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {question.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[styles.tagChip, { backgroundColor: Colors.dark.accent + "20" }]}
                  >
                    <ThemedText style={[styles.tagText, { color: Colors.dark.accent }]}>
                      #{tag}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}

            {isAnswered && question.answer && (
              <View style={[styles.answerBlock, { backgroundColor: "#16a34a15", borderColor: "#16a34a40" }]}>
                <EvendiIcon name="check-circle" size={14} color="#16a34a" />
                <ThemedText style={[styles.answerText, { color: theme.text }]}>
                  {question.answer}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.questionActions}>
            {settings.showUpvoteCount && (
              <Pressable
                onPress={() => handleUpvote(question.id)}
                style={[
                  styles.upvoteButton,
                  {
                    backgroundColor: hasUpvoted ? Colors.dark.accent + "20" : theme.backgroundSecondary,
                    borderColor: hasUpvoted ? Colors.dark.accent : "transparent",
                  },
                ]}
              >
                <EvendiIcon
                  name="thumbs-up"
                  size={16}
                  color={hasUpvoted ? Colors.dark.accent : theme.textSecondary}
                />
                <ThemedText
                  style={[
                    styles.upvoteCount,
                    { color: hasUpvoted ? Colors.dark.accent : theme.textSecondary },
                  ]}
                >
                  {question.upvotes}
                </ThemedText>
              </Pressable>
            )}

            {isAnswered && (
              <View style={[styles.answeredBadge, { backgroundColor: "#16a34a20" }]}>
                <EvendiIcon name="check" size={14} color="#16a34a" />
                <ThemedText style={{ fontSize: 12, color: "#16a34a", fontWeight: "600" }}>
                  Besvart
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  // ── Admin Question Card ──
  const renderAdminCard = (question: QaQuestion, index: number) => {
    const statusCol = STATUS_COLORS[question.status];

    return (
      <Animated.View
        key={question.id}
        entering={FadeInRight.delay(index * 50).duration(250)}
      >
        <View
          style={[
            styles.adminCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
              borderLeftColor: statusCol,
              borderLeftWidth: 4,
            },
          ]}
        >
          <View style={styles.adminCardHeader}>
            <View style={[styles.statusPill, { backgroundColor: statusCol + "20" }]}>
              <ThemedText style={[styles.statusPillText, { color: statusCol }]}>
                {STATUS_LABELS[question.status]}
              </ThemedText>
            </View>
            <View style={styles.adminMeta}>
              <ThemedText style={[styles.authorName, { color: theme.textSecondary }]}>
                {question.authorName}
              </ThemedText>
              <ThemedText style={[styles.timestamp, { color: theme.textMuted }]}>
                {formatTime(question.createdAt)}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.questionText, { color: theme.text }]}>
            {question.text}
          </ThemedText>

          <View style={styles.upvoteRow}>
            <EvendiIcon name="thumbs-up" size={14} color={theme.textMuted} />
            <ThemedText style={{ color: theme.textMuted, fontSize: 13, marginLeft: 4 }}>
              {question.upvotes} stemmer
            </ThemedText>
          </View>

          {/* Admin action buttons */}
          <View style={styles.adminActions}>
            {question.status === "pending" && (
              <>
                <Pressable
                  onPress={() => handleSetStatus(question.id, "approved")}
                  style={[styles.adminBtn, { backgroundColor: Colors.dark.accent + "20" }]}
                >
                  <EvendiIcon name="check" size={14} color={Colors.dark.accent} />
                  <ThemedText style={{ color: Colors.dark.accent, fontSize: 12, fontWeight: "600" }}>
                    Godkjenn
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => handleSetStatus(question.id, "rejected")}
                  style={[styles.adminBtn, { backgroundColor: "#ef444420" }]}
                >
                  <EvendiIcon name="x" size={14} color="#ef4444" />
                  <ThemedText style={{ color: "#ef4444", fontSize: 12, fontWeight: "600" }}>
                    Avvis
                  </ThemedText>
                </Pressable>
              </>
            )}

            {(question.status === "approved" || question.status === "highlighted") && (
              <>
                <Pressable
                  onPress={() => handleSetStatus(question.id, "answered")}
                  style={[styles.adminBtn, { backgroundColor: "#16a34a20" }]}
                >
                  <EvendiIcon name="check-circle" size={14} color="#16a34a" />
                  <ThemedText style={{ color: "#16a34a", fontSize: 12, fontWeight: "600" }}>
                    Besvart
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() =>
                    handleSetStatus(
                      question.id,
                      question.status === "highlighted" ? "approved" : "highlighted"
                    )
                  }
                  style={[styles.adminBtn, { backgroundColor: "#8b5cf620" }]}
                >
                  <EvendiIcon name="star" size={14} color="#8b5cf6" />
                  <ThemedText style={{ color: "#8b5cf6", fontSize: 12, fontWeight: "600" }}>
                    {question.status === "highlighted" ? "Fjern uthev." : "Uthev"}
                  </ThemedText>
                </Pressable>
              </>
            )}

            <Pressable
              onPress={() => handleDeleteQuestion(question.id)}
              style={[styles.adminBtn, { backgroundColor: "#ef444410" }]}
            >
              <EvendiIcon name="trash-2" size={14} color="#ef4444" />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    );
  };

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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
      }
    >
      {/* ── Event Type Banner ── */}
      <View style={[styles.eventBanner, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <Image source={getQaSessionIcon(getSettings(session).customQaIcon)} style={{ width: 40, height: 40, borderRadius: 8 }} resizeMode="cover" />
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <ThemedText style={[styles.eventBannerTitle, { color: theme.text }]}>
            Q&A – {config.labelNo}
          </ThemedText>
          <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
            {hasGames
              ? `${availableGames.length} ${availableGames.length === 1 ? "lek" : "leker"} tilgjengelig`
              : "Åpne spørsmål og svar"}
          </ThemedText>
        </View>
      </View>

      {/* ── Tab Switcher ── */}
      <View style={[styles.tabBar, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        {tabConfig.map((tab) => {
          const isActive = activeTab === tab.key;
          const tabColor = tab.key === "games" ? "#f59e0b" : Colors.dark.accent;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                setActiveTab(tab.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.tabItem,
                {
                  backgroundColor: isActive ? tabColor + "20" : "transparent",
                  borderColor: isActive ? tabColor : "transparent",
                },
              ]}
            >
              <EvendiIcon
                name={tab.icon as any}
                size={16}
                color={isActive ? tabColor : theme.textSecondary}
              />
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: isActive ? tabColor : theme.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* ── Stats Bar ── */}
      <View style={styles.statsBar}>
        <StatBadge label="Totalt" value={stats.total} color={theme.text} bg={theme.backgroundSecondary} />
        <StatBadge label="Venter" value={stats.pending} color="#f59e0b" bg="#f59e0b15" />
        <StatBadge label="Besvart" value={stats.answered} color="#16a34a" bg="#16a34a15" />
        <StatBadge label="Uthevet" value={stats.highlighted} color="#8b5cf6" bg="#8b5cf615" />
      </View>

      {/* ── Cloud Tag Filter Active ── */}
      {selectedCloudTag && (
        <View style={[styles.filterBanner, { backgroundColor: Colors.dark.accent + "15", borderColor: Colors.dark.accent + "40" }]}>
          <ThemedText style={{ color: Colors.dark.accent, flex: 1 }}>
            Filtrerer etter: <ThemedText style={{ fontWeight: "700" }}>#{selectedCloudTag}</ThemedText>
          </ThemedText>
          <Pressable onPress={handleClearCloudFilter}>
            <EvendiIcon name="x" size={18} color={Colors.dark.accent} />
          </Pressable>
        </View>
      )}

      {/* ══════════ AUDIENCE TAB ══════════ */}
      {activeTab === "audience" && (
        <>
          {/* Submit Form */}
          {showSubmitForm ? (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={[
                styles.formCard,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <ThemedText type="h3" style={styles.formTitle}>
                Still et spørsmål
              </ThemedText>

              {!isAnonymous && (
                <PersistentTextInput
                  draftKey="QaSystem-author"
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="Ditt navn (valgfritt)"
                  placeholderTextColor={theme.textMuted}
                  value={newAuthor}
                  onChangeText={setNewAuthor}
                />
              )}

              <PersistentTextInput
                draftKey="QaSystem-question"
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Skriv spørsmålet ditt her..."
                placeholderTextColor={theme.textMuted}
                value={newQuestion}
                onChangeText={setNewQuestion}
                multiline
                numberOfLines={3}
              />

              <PersistentTextInput
                draftKey="QaSystem-tags"
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Tags (kommaseparert, f.eks. mat, musikk)"
                placeholderTextColor={theme.textMuted}
                value={newTags}
                onChangeText={setNewTags}
              />

              {/* Anonymous toggle */}
              {getSettings(session).allowAnonymous && (
                <Pressable
                  onPress={() => setIsAnonymous(!isAnonymous)}
                style={[
                  styles.anonymousToggle,
                  {
                    backgroundColor: isAnonymous ? Colors.dark.accent + "20" : theme.backgroundSecondary,
                    borderColor: isAnonymous ? Colors.dark.accent : theme.border,
                  },
                ]}
              >
                <EvendiIcon
                  name={isAnonymous ? "eye-off" : "eye"}
                  size={16}
                  color={isAnonymous ? Colors.dark.accent : theme.textSecondary}
                />
                <ThemedText
                  style={{
                    color: isAnonymous ? Colors.dark.accent : theme.textSecondary,
                    fontWeight: "600",
                    marginLeft: Spacing.sm,
                  }}
                >
                  {isAnonymous ? "Anonym (aktivert)" : "Still anonymt"}
                </ThemedText>
              </Pressable>
              )}

              <View style={styles.formButtons}>
                <Pressable
                  onPress={() => {
                    setShowSubmitForm(false);
                    setNewQuestion("");
                    setNewAuthor("");
                    setNewTags("");
                  }}
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                >
                  <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
                </Pressable>
                <Button onPress={handleSubmitQuestion} style={styles.saveButton}>
                  Send inn
                </Button>
              </View>
            </Animated.View>
          ) : (
            <Pressable
              onPress={() => {
                setShowSubmitForm(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.askButton, { backgroundColor: Colors.dark.accent }]}
            >
              <EvendiIcon name="message-circle" size={20} color="#fff" />
              <ThemedText style={styles.askButtonText}>Still et spørsmål</ThemedText>
            </Pressable>
          )}

          {/* Questions list */}
          {visibleQuestions.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: theme.border }]}>
              <EvendiIcon name="message-circle" size={40} color={theme.textMuted} />
              <ThemedText style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                Ingen spørsmål ennå
              </ThemedText>
              <ThemedText style={{ color: theme.textMuted, textAlign: "center" }}>
                Vær den første til å stille et spørsmål!
              </ThemedText>
            </View>
          ) : (
            <View style={styles.questionList}>
              {visibleQuestions.map((q, i) => renderQuestionCard(q, i))}
            </View>
          )}
        </>
      )}

      {/* ══════════ GAMES TAB ══════════ */}
      {activeTab === "games" && hasGames && (
        <GamesTab
          games={availableGames}
          selectedGameIndex={selectedGameIndex}
          setSelectedGameIndex={setSelectedGameIndex}
          shoeGameActive={shoeGameActive}
          setShoeGameActive={setShoeGameActive}
          shoeGameQuestionIndex={shoeGameQuestionIndex}
          setShoeGameQuestionIndex={setShoeGameQuestionIndex}
          showGameInstructions={showGameInstructions}
          setShowGameInstructions={setShowGameInstructions}
          gameQuestionPool={gameQuestionPool}
          setGameQuestionPool={setGameQuestionPool}
          theme={theme}
          roleLabels={config.roleLabels}
          settings={getSettings(session)}
          gameScores={session.gameScores || []}
          onAddScore={handleAddGameScore}
        />
      )}

      {/* ══════════ CLOUD TAB ══════════ */}
      {activeTab === "cloud" && (
        <>
          <QaWordCloud
            questions={session.questions.filter(
              (q) => q.status !== "rejected" && q.status !== "pending"
            )}
            onTagPress={(tag) =>
              setSelectedCloudTag(selectedCloudTag === tag ? null : tag)
            }
            selectedTag={selectedCloudTag}
          />

          {/* Filtered questions under cloud */}
          {selectedCloudTag && visibleQuestions.length > 0 && (
            <View style={styles.questionList}>
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                Spørsmål om «{selectedCloudTag}»
              </ThemedText>
              {visibleQuestions.map((q, i) => renderQuestionCard(q, i))}
            </View>
          )}

          {!selectedCloudTag && (
            <View style={[styles.emptyState, { borderColor: theme.border }]}>
              <EvendiIcon name="bar-chart-2" size={40} color={theme.textMuted} />
              <ThemedText style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                Trykk på et ord i skyen
              </ThemedText>
              <ThemedText style={{ color: theme.textMuted, textAlign: "center" }}>
                for å se relaterte spørsmål
              </ThemedText>
            </View>
          )}
        </>
      )}

      {/* ══════════ ADMIN TAB ══════════ */}
      {activeTab === "admin" && (
        <>
          {/* ── Q&A Settings ── */}
          <View style={[styles.adminControls, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText style={[styles.settingsSectionTitle, { color: theme.text }]}>
              Innstillinger – Spørsmål
            </ThemedText>

            <SettingToggle
              label="Moderering"
              hint="Spørsmål må godkjennes før de vises"
              icon={session.moderationEnabled ? "shield" : "shield-off"}
              value={session.moderationEnabled}
              onToggle={handleToggleModeration}
              color={Colors.dark.accent}
              theme={theme}
            />
            <SettingToggle
              label="Vis hvem som spør"
              hint="Vis navnet på den som stiller spørsmål"
              icon="user"
              value={getSettings(session).showAuthorName}
              onToggle={(v) => handleUpdateSetting("showAuthorName", v)}
              color={Colors.dark.accent}
              theme={theme}
            />
            <SettingToggle
              label="Vis stemmetall"
              hint="Vis antall stemmer på hvert spørsmål"
              icon="thumbs-up"
              value={getSettings(session).showUpvoteCount}
              onToggle={(v) => handleUpdateSetting("showUpvoteCount", v)}
              color={Colors.dark.accent}
              theme={theme}
            />
            <SettingToggle
              label="Vis tidspunkt"
              hint="Vis når spørsmål ble stilt"
              icon="clock"
              value={getSettings(session).showTimestamp}
              onToggle={(v) => handleUpdateSetting("showTimestamp", v)}
              color={Colors.dark.accent}
              theme={theme}
            />
            <SettingToggle
              label="Tillat anonyme spørsmål"
              hint="La gjester stille spørsmål anonymt"
              icon="eye-off"
              value={getSettings(session).allowAnonymous}
              onToggle={(v) => handleUpdateSetting("allowAnonymous", v)}
              color={Colors.dark.accent}
              theme={theme}
            />
            <SettingToggle
              label="Vis poeng"
              hint="Vis oppsummering av poeng og statistikk"
              icon="award"
              value={getSettings(session).showScore}
              onToggle={(v) => handleUpdateSetting("showScore", v)}
              color={Colors.dark.accent}
              theme={theme}
            />
          </View>

          {/* ── Game Settings ── */}
          {hasGames && (
            <View style={[styles.adminControls, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, marginTop: Spacing.md }]}>
              <ThemedText style={[styles.settingsSectionTitle, { color: theme.text }]}>
                Innstillinger – Spill
              </ThemedText>

              <SettingToggle
                label="Vis spillpoeng"
                hint="Vis poeng og scorer under spill"
                icon="bar-chart-2"
                value={getSettings(session).showGameScore}
                onToggle={(v) => handleUpdateSetting("showGameScore", v)}
                color="#f59e0b"
                theme={theme}
              />
              <SettingToggle
                label="Vis ledertavle"
                hint="Vis topplisten etter spill"
                icon="award"
                value={getSettings(session).showGameLeaderboard}
                onToggle={(v) => handleUpdateSetting("showGameLeaderboard", v)}
                color="#f59e0b"
                theme={theme}
              />
              <SettingToggle
                label="Stokk spørsmål"
                hint="Vis spørsmålene i tilfeldig rekkefølge"
                icon="shuffle"
                value={getSettings(session).shuffleQuestions}
                onToggle={(v) => handleUpdateSetting("shuffleQuestions", v)}
                color="#f59e0b"
                theme={theme}
              />
              <SettingToggle
                label="Tidtaker"
                hint={`${getSettings(session).gameTimerSeconds}s per spørsmål`}
                icon="clock"
                value={getSettings(session).gameTimerEnabled}
                onToggle={(v) => handleUpdateSetting("gameTimerEnabled", v)}
                color="#f59e0b"
                theme={theme}
              />
              {getSettings(session).gameTimerEnabled && (
                <View style={styles.timerAdjust}>
                  {[10, 15, 20, 30].map((sec) => {
                    const isActive = getSettings(session).gameTimerSeconds === sec;
                    return (
                      <Pressable
                        key={sec}
                        onPress={() => handleUpdateSetting("gameTimerSeconds", sec)}
                        style={[
                          styles.timerChip,
                          {
                            backgroundColor: isActive ? "#f59e0b20" : theme.backgroundSecondary,
                            borderColor: isActive ? "#f59e0b" : theme.border,
                          },
                        ]}
                      >
                        <ThemedText style={{ color: isActive ? "#f59e0b" : theme.text, fontSize: 13, fontWeight: "600" }}>
                          {sec}s
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              <SettingToggle
                label="Publikum ser svar"
                hint="La publikum se fasiten etter hvert spørsmål"
                icon="eye"
                value={getSettings(session).audienceCanSeeAnswers}
                onToggle={(v) => handleUpdateSetting("audienceCanSeeAnswers", v)}
                color="#f59e0b"
                theme={theme}
              />

              {/* Score summary / leaderboard */}
              {(session.gameScores || []).length > 0 && (
                <View style={styles.leaderboardSection}>
                  <View style={styles.leaderboardHeader}>
                    <ThemedText style={[styles.settingsSectionTitle, { color: theme.text, marginBottom: 0 }]}>
                      Poengtavle
                    </ThemedText>
                    <Pressable onPress={handleClearGameScores}>
                      <ThemedText style={{ color: "#ef4444", fontSize: 12, fontWeight: "600" }}>
                        Nullstill
                      </ThemedText>
                    </Pressable>
                  </View>
                  {[...(session.gameScores || [])]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10)
                    .map((s, i) => (
                      <View key={s.id} style={[styles.leaderboardRow, { borderBottomColor: theme.border }]}>
                        <ThemedText style={[styles.leaderboardRank, {
                          color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#d97706" : theme.textSecondary,
                        }]}>
                          {i === 0 ? "1." : i === 1 ? "2." : i === 2 ? "3." : `${i + 1}.`}
                        </ThemedText>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>
                            {s.playerName}
                          </ThemedText>
                          <ThemedText style={{ color: theme.textMuted, fontSize: 11 }}>
                            {s.correctAnswers}/{s.totalQuestions} riktige
                          </ThemedText>
                        </View>
                        <ThemedText style={[styles.leaderboardScore, { color: "#f59e0b" }]}>
                          {s.score} p
                        </ThemedText>
                      </View>
                    ))}
                </View>
              )}
            </View>
          )}

          {/* ── Icon & Accent Customization ── */}
          {hasGames && (
            <View style={[styles.adminControls, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, marginTop: Spacing.md }]}>
              <ThemedText style={[styles.settingsSectionTitle, { color: theme.text }]}>
                Tilpass ikoner og farger
              </ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12, marginBottom: Spacing.md }}>
                Trykk pa ikonet for a velge nytt bilde fra bildebiblioteket.
              </ThemedText>

              {availableGames.map((g) => {
                const currentIcon = getSettings(session).customGameIcons?.[g.mode];
                const currentAccent = getSettings(session).customGameAccents?.[g.mode] ?? getGameAccent(g.mode);
                return (
                  <View key={g.mode} style={[styles.iconCustomRow, { borderBottomColor: theme.border }]}>
                    <Pressable onPress={() => pickGameIcon(g.mode)}>
                      <Image
                        source={getGameImage(g.mode, getSettings(session).customGameIcons)}
                        style={{ width: 40, height: 40, borderRadius: 8 }}
                      />
                      <View style={styles.iconPickerBadge}>
                        <EvendiIcon name="camera" size={10} color="#fff" />
                      </View>
                    </Pressable>
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <ThemedText style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>
                        {g.labelNo}
                      </ThemedText>
                      <ThemedText style={{ color: theme.textMuted, fontSize: 11 }}>
                        {currentIcon ? "Egendefinert ikon" : "Standard ikon"}
                      </ThemedText>
                    </View>
                    {/* Accent color indicator */}
                    <Pressable
                      onPress={() => {
                        const colors = Object.values(GAME_ACCENT_COLORS);
                        const idx = colors.indexOf(currentAccent);
                        const next = colors[(idx + 1) % colors.length];
                        handleUpdateGameIconSetting("customGameAccents", g.mode, next);
                      }}
                      style={[styles.accentDot, { backgroundColor: currentAccent }]}
                    />
                    {/* Reset icon */}
                    {currentIcon && (
                      <Pressable
                        onPress={() => handleUpdateGameIconSetting("customGameIcons", g.mode, undefined)}
                        style={{ padding: Spacing.xs }}
                      >
                        <EvendiIcon name="x" size={16} color={theme.textMuted} />
                      </Pressable>
                    )}
                  </View>
                );
              })}

              {/* Custom Q&A session icon */}
              <View style={[styles.iconCustomRow, { borderBottomColor: "transparent" }]}>
                <Pressable onPress={() => pickGameIcon()}>
                  <Image
                    source={getQaSessionIcon(getSettings(session).customQaIcon)}
                    style={{ width: 40, height: 40, borderRadius: 8 }}
                  />
                  <View style={styles.iconPickerBadge}>
                    <EvendiIcon name="camera" size={10} color="#fff" />
                  </View>
                </Pressable>
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <ThemedText style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>
                    Q&A Hovedikon
                  </ThemedText>
                  <ThemedText style={{ color: theme.textMuted, fontSize: 11 }}>
                    {getSettings(session).customQaIcon ? "Egendefinert" : "Standard logo"}
                  </ThemedText>
                </View>
                {getSettings(session).customQaIcon && (
                  <Pressable
                    onPress={() => handleUpdateSetting("customQaIcon", undefined)}
                    style={{ padding: Spacing.xs }}
                  >
                    <EvendiIcon name="x" size={16} color={theme.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Admin filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={{ marginBottom: Spacing.md }}
          >
            {(["all", "pending", "approved", "highlighted", "answered", "rejected"] as const).map(
              (filter) => {
                const isActive = adminFilter === filter;
                const color =
                  filter === "all" ? theme.text : STATUS_COLORS[filter as QaQuestion["status"]];
                const label =
                  filter === "all" ? "Alle" : STATUS_LABELS[filter as QaQuestion["status"]];
                const count =
                  filter === "all"
                    ? stats.total
                    : session.questions.filter((q) => q.status === filter).length;

                return (
                  <Pressable
                    key={filter}
                    onPress={() => setAdminFilter(filter)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: isActive ? color + "20" : theme.backgroundSecondary,
                        borderColor: isActive ? color : "transparent",
                      },
                    ]}
                  >
                    <ThemedText style={{ color, fontWeight: "600", fontSize: 13 }}>
                      {label}
                    </ThemedText>
                    <View style={[styles.filterCount, { backgroundColor: color + "30" }]}>
                      <ThemedText style={{ color, fontSize: 11, fontWeight: "700" }}>
                        {count}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              }
            )}
          </ScrollView>

          {/* Admin question list */}
          {visibleQuestions.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: theme.border }]}>
              <EvendiIcon name="inbox" size={40} color={theme.textMuted} />
              <ThemedText style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                Ingen spørsmål å vise
              </ThemedText>
            </View>
          ) : (
            <View style={styles.questionList}>
              {visibleQuestions.map((q, i) => renderAdminCard(q, i))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

// ── Games Tab Component ──
function GamesTab({
  games,
  selectedGameIndex,
  setSelectedGameIndex,
  shoeGameActive,
  setShoeGameActive,
  shoeGameQuestionIndex,
  setShoeGameQuestionIndex,
  showGameInstructions,
  setShowGameInstructions,
  gameQuestionPool,
  setGameQuestionPool,
  theme,
  roleLabels,
  settings,
  gameScores,
  onAddScore,
}: {
  games: QaGameConfig[];
  selectedGameIndex: number;
  setSelectedGameIndex: (i: number) => void;
  shoeGameActive: boolean;
  setShoeGameActive: (v: boolean) => void;
  shoeGameQuestionIndex: number;
  setShoeGameQuestionIndex: (i: number) => void;
  showGameInstructions: boolean;
  setShowGameInstructions: (v: boolean) => void;
  gameQuestionPool: typeof SHOE_GAME_QUESTIONS;
  setGameQuestionPool: (q: typeof SHOE_GAME_QUESTIONS) => void;
  theme: any;
  roleLabels: { primary: { no: string; en: string }; secondary: { no: string; en: string }; guestLabel: { no: string; en: string } };
  settings: QaSettings;
  gameScores: GameScore[];
  onAddScore: (score: GameScore) => Promise<void>;
}) {
  const game = games[selectedGameIndex] || games[0];
  const accent = getGameAccent(game.mode, settings.customGameAccents);
  const presetQuestions = getPresetQuestions(game.mode);

  // Score tracking
  const [currentScore, setCurrentScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [timerValue, setTimerValue] = useState(settings.gameTimerSeconds);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  React.useEffect(() => {
    if (shoeGameActive && settings.gameTimerEnabled) {
      setTimerValue(settings.gameTimerSeconds);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimerValue((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [shoeGameQuestionIndex, shoeGameActive, settings.gameTimerEnabled, settings.gameTimerSeconds]);

  const startGame = () => {
    const pool = settings.shuffleQuestions
      ? [...presetQuestions].sort(() => Math.random() - 0.5)
      : [...presetQuestions];
    setGameQuestionPool(pool);
    setShoeGameQuestionIndex(0);
    setShoeGameActive(true);
    setShowGameInstructions(false);
    setCurrentScore(0);
    setCorrectCount(0);
    setShowGameComplete(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const addPoints = (points: number) => {
    setCurrentScore((prev) => prev + points);
    setCorrectCount((prev) => prev + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const nextQuestion = () => {
    if (shoeGameQuestionIndex < gameQuestionPool.length - 1) {
      setShoeGameQuestionIndex(shoeGameQuestionIndex + 1);
      setTimerValue(settings.gameTimerSeconds);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const prevQuestion = () => {
    if (shoeGameQuestionIndex > 0) {
      setShoeGameQuestionIndex(shoeGameQuestionIndex - 1);
      setTimerValue(settings.gameTimerSeconds);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const finishGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowGameComplete(true);
    setShoeGameActive(false);

    if (settings.showGameScore) {
      const score: GameScore = {
        id: generateId(),
        gameMode: game.mode,
        playerName: roleLabels.primary.no + " & " + roleLabels.secondary.no,
        playerId: "couple",
        score: currentScore,
        correctAnswers: correctCount,
        totalQuestions: gameQuestionPool.length,
        completedAt: new Date().toISOString(),
      };
      await onAddScore(score);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShoeGameActive(false);
    setShoeGameQuestionIndex(0);
    setShowGameInstructions(true);
    setGameQuestionPool([]);
    setCurrentScore(0);
    setCorrectCount(0);
    setShowGameComplete(false);
  };

  const currentQ = gameQuestionPool[shoeGameQuestionIndex];

  // Top scores for this game
  const topScores = gameScores
    .filter((s) => s.gameMode === game.mode)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <>
      {/* Game selector (if multiple games) */}
      {games.length > 1 && (
        <View style={{ marginBottom: Spacing.lg }}>
          <ThemedText style={{ color: theme.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: Spacing.sm, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Velg aktivitet
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.md }}
          >
            {games.map((g, i) => {
              const isActive = i === selectedGameIndex;
              const accent = getGameAccent(g.mode, settings.customGameAccents);
              return (
                <Pressable
                  key={g.mode}
                  onPress={() => {
                    setSelectedGameIndex(i);
                    resetGame();
                  }}
                  style={[
                    styles.gamePickerCard,
                    {
                      backgroundColor: isActive ? accent + "12" : theme.backgroundSecondary,
                      borderColor: isActive ? accent : theme.border,
                    },
                  ]}
                >
                  <Image
                    source={getGameImage(g.mode, settings.customGameIcons)}
                    style={styles.gamePickerImage}
                    resizeMode="cover"
                  />
                  <ThemedText
                    numberOfLines={1}
                    style={{
                      color: isActive ? accent : theme.text,
                      fontWeight: "700",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    {g.labelNo}
                  </ThemedText>
                  {isActive && (
                    <View style={[styles.gamePickerDot, { backgroundColor: accent }]} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Instructions view */}
      {showGameInstructions && !shoeGameActive && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.gameCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={styles.gameHeader}>
            <Image source={getGameImage(game.mode, settings.customGameIcons)} style={{ width: 56, height: 56, borderRadius: 12 }} />
            <ThemedText style={[styles.gameTitle, { color: theme.text }]}>
              {game.labelNo}
            </ThemedText>
            <ThemedText style={[styles.gameDesc, { color: theme.textSecondary }]}>
              {game.descriptionNo}
            </ThemedText>
          </View>

          <View style={styles.instructionsList}>
            <ThemedText style={[styles.instructionsTitle, { color: theme.text }]}>
              Slik fungerer det:
            </ThemedText>
            {game.instructionsNo.map((step, i) => (
              <Animated.View
                key={i}
                entering={FadeInRight.delay(i * 100).duration(300)}
                style={styles.instructionStep}
              >
                <View style={[styles.stepNumber, { backgroundColor: accent + "20" }]}>
                  <ThemedText style={{ color: accent, fontWeight: "700", fontSize: 14 }}>
                    {i + 1}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.stepText, { color: theme.text }]}>
                  {step}
                </ThemedText>
              </Animated.View>
            ))}
          </View>

          {presetQuestions.length > 0 && (
            <Pressable
              onPress={startGame}
              style={[styles.startGameButton, { backgroundColor: accent }]}
            >
              <EvendiIcon name="play" size={20} color="#fff" />
              <ThemedText style={styles.startGameText}>
                Start {game.labelNo} ({presetQuestions.length} spørsmål)
              </ThemedText>
            </Pressable>
          )}

          {/* Previous top scores */}
          {settings.showGameLeaderboard && topScores.length > 0 && (
            <View style={styles.miniLeaderboard}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: Spacing.sm }}>
                Tidligere resultater
              </ThemedText>
              {topScores.map((s, i) => (
                <View key={s.id} style={styles.miniScoreRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    {i === 0 ? <EvendiIcon name="award" size={13} color={accent} /> : <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>{i + 1}.</ThemedText>}
                    <ThemedText style={{ color: i === 0 ? accent : theme.textSecondary, fontSize: 13 }}>
                      {s.playerName}
                    </ThemedText>
                  </View>
                  <ThemedText style={{ color: accent, fontWeight: "700", fontSize: 13 }}>
                    {s.score}p
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      )}

      {/* Active game — Shoe game / Quiz display */}
      {shoeGameActive && currentQ && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.gameCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          {/* Progress + Score Line */}
          <View style={styles.gameProgressRow}>
            <View style={styles.scoreLineRow}>
              <ThemedText style={{ color: theme.textMuted, fontSize: 12 }}>
                Spørsmål {shoeGameQuestionIndex + 1} av {gameQuestionPool.length}
              </ThemedText>
              {settings.showGameScore && (
                <View style={styles.scoreBadge}>
                  <EvendiIcon name="award" size={12} color={accent} />
                  <ThemedText style={{ color: accent, fontWeight: "700", fontSize: 14 }}>
                    {currentScore} p
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: accent,
                    width: `${((shoeGameQuestionIndex + 1) / gameQuestionPool.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Timer */}
          {settings.gameTimerEnabled && (
            <View style={[styles.timerDisplay, { backgroundColor: timerValue <= 5 ? "#ef444420" : theme.backgroundSecondary }]}>
              <EvendiIcon name="clock" size={16} color={timerValue <= 5 ? "#ef4444" : accent} />
              <ThemedText style={{
                color: timerValue <= 5 ? "#ef4444" : accent,
                fontWeight: "800",
                fontSize: 18,
                fontVariant: ["tabular-nums"],
              }}>
                {timerValue}s
              </ThemedText>
            </View>
          )}

          {/* Category chip */}
          {currentQ.category && (
            <View style={[styles.categoryChip, { backgroundColor: accent + "15" }]}>
              <ThemedText style={{ color: accent, fontSize: 11, fontWeight: "600" }}>
                {currentQ.category}
              </ThemedText>
            </View>
          )}

          {/* Question card */}
          <View style={styles.shoeGameQuestion}>
            <ThemedText style={[styles.bigQuestion, { color: theme.text }]}>
              {currentQ.textNo}
            </ThemedText>
          </View>

          {/* Shoe game: show bride/groom indicators */}
          {game.mode === "shoe_game" && (
            <View style={styles.shoeIndicators}>
              <View style={[styles.shoeIndicator, { backgroundColor: "#ec489920" }]}>
                <Image source={SHOE_TURN_IMAGES.bride} style={{ width: 36, height: 36 }} />
                <ThemedText style={{ color: "#ec4899", fontWeight: "700", fontSize: 16 }}>
                  {roleLabels.primary.no}
                </ThemedText>
              </View>
              <ThemedText style={{ color: theme.textMuted, fontSize: 24 }}>eller</ThemedText>
              <View style={[styles.shoeIndicator, { backgroundColor: Colors.dark.accent + "20" }]}>
                <Image source={SHOE_TURN_IMAGES.groom} style={{ width: 36, height: 36 }} />
                <ThemedText style={{ color: Colors.dark.accent, fontWeight: "700", fontSize: 16 }}>
                  {roleLabels.secondary.no}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Score buttons – award points for matching answers */}
          {settings.showGameScore && (
            <View style={styles.scoreButtonsRow}>
              <Pressable
                onPress={() => addPoints(10)}
                style={[styles.scoreBtn, { backgroundColor: "#16a34a20", borderColor: "#16a34a" }]}
              >
                <EvendiIcon name="check" size={14} color="#16a34a" />
                <ThemedText style={{ color: "#16a34a", fontWeight: "700", fontSize: 13 }}>
                  Match! +10p
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => addPoints(5)}
                style={[styles.scoreBtn, { backgroundColor: accent + "20", borderColor: accent }]}
              >
                <EvendiIcon name="minus" size={14} color={accent} />
                <ThemedText style={{ color: accent, fontWeight: "700", fontSize: 13 }}>
                  Delvis +5p
                </ThemedText>
              </Pressable>
            </View>
          )}

          {/* Navigation buttons */}
          <View style={styles.gameNavButtons}>
            <Pressable
              onPress={prevQuestion}
              disabled={shoeGameQuestionIndex === 0}
              style={[
                styles.gameNavBtn,
                {
                  borderColor: theme.border,
                  opacity: shoeGameQuestionIndex === 0 ? 0.3 : 1,
                },
              ]}
            >
              <EvendiIcon name="chevron-left" size={20} color={theme.text} />
              <ThemedText style={{ color: theme.text }}>Forrige</ThemedText>
            </Pressable>

            {shoeGameQuestionIndex < gameQuestionPool.length - 1 ? (
              <Pressable
                onPress={nextQuestion}
                style={[styles.gameNavBtn, { backgroundColor: accent, borderColor: accent }]}
              >
                <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Neste</ThemedText>
                <EvendiIcon name="chevron-right" size={20} color="#fff" />
              </Pressable>
            ) : (
              <Pressable
                onPress={finishGame}
                style={[styles.gameNavBtn, { backgroundColor: "#16a34a", borderColor: "#16a34a" }]}
              >
                <EvendiIcon name="check" size={18} color="#fff" />
                <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Ferdig!</ThemedText>
              </Pressable>
            )}
          </View>

          {/* Reset/exit at bottom */}
          <Pressable onPress={resetGame} style={styles.resetLink}>
            <ThemedText style={{ color: theme.textMuted, fontSize: 13 }}>
              Avslutt og start på nytt
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}

      {/* ── Game Complete Summary ── */}
      {showGameComplete && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.gameCard, { backgroundColor: theme.backgroundDefault, borderColor: accent }]}
        >
          <View style={styles.gameHeader}>
            <Image source={getGameImage(game.mode, settings.customGameIcons)} style={{ width: 64, height: 64, borderRadius: 16 }} />
            <ThemedText style={[styles.gameTitle, { color: theme.text }]}>
              {game.labelNo} fullført!
            </ThemedText>
          </View>

          {settings.showGameScore && (
            <View style={styles.completeSummary}>
              <View style={[styles.completeScoreCard, { backgroundColor: accent + "15" }]}>
                <ThemedText style={{ color: accent, fontSize: 40, fontWeight: "800" }}>
                  {currentScore}
                </ThemedText>
                <ThemedText style={{ color: accent, fontSize: 14, fontWeight: "600" }}>
                  poeng totalt
                </ThemedText>
              </View>
              <View style={styles.completeStats}>
                <View style={[styles.completeStatItem, { backgroundColor: "#16a34a15" }]}>
                  <ThemedText style={{ color: "#16a34a", fontSize: 20, fontWeight: "700" }}>
                    {correctCount}
                  </ThemedText>
                  <ThemedText style={{ color: "#16a34a", fontSize: 11 }}>
                    poenggivende
                  </ThemedText>
                </View>
                <View style={[styles.completeStatItem, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText style={{ color: theme.text, fontSize: 20, fontWeight: "700" }}>
                    {gameQuestionPool.length}
                  </ThemedText>
                  <ThemedText style={{ color: theme.textMuted, fontSize: 11 }}>
                    spørsmål
                  </ThemedText>
                </View>
                <View style={[styles.completeStatItem, { backgroundColor: "#8b5cf615" }]}>
                  <ThemedText style={{ color: "#8b5cf6", fontSize: 20, fontWeight: "700" }}>
                    {gameQuestionPool.length > 0 ? Math.round((correctCount / gameQuestionPool.length) * 100) : 0}%
                  </ThemedText>
                  <ThemedText style={{ color: "#8b5cf6", fontSize: 11 }}>
                    treffsikkerhet
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          <Pressable
            onPress={resetGame}
            style={[styles.startGameButton, { backgroundColor: accent }]}
          >
            <EvendiIcon name="refresh-cw" size={18} color="#fff" />
            <ThemedText style={styles.startGameText}>
              Spill igjen
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}
    </>
  );
}

// ── Setting Toggle ──
function SettingToggle({
  label,
  hint,
  icon,
  value,
  onToggle,
  color,
  theme,
}: {
  label: string;
  hint: string;
  icon: string;
  value: boolean;
  onToggle: (newValue: boolean) => void;
  color: string;
  theme: any;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View style={styles.settingLabelRow}>
          <EvendiIcon name={icon as any} size={14} color={value ? color : theme.textSecondary} />
          <ThemedText style={[styles.settingLabel, { color: theme.text }]}>{label}</ThemedText>
        </View>
        <ThemedText style={[styles.settingHint, { color: theme.textMuted }]}>{hint}</ThemedText>
      </View>
      <Pressable
        onPress={() => onToggle(!value)}
        style={[
          styles.settingToggle,
          { backgroundColor: value ? color : theme.backgroundSecondary },
        ]}
      >
        <View
          style={[
            styles.settingToggleKnob,
            { transform: [{ translateX: value ? 20 : 0 }] },
          ]}
        />
      </Pressable>
    </View>
  );
}

// ── Small stat badge ──
function StatBadge({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.statBadge, { backgroundColor: bg }]}>
      <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: color + "BB" }]}>{label}</ThemedText>
    </View>
  );
}

// ── Format time ──
function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "nå";
    if (diffMin < 60) return `${diffMin}m siden`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}t siden`;
    return date.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

// ── Styles ──
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },

  tabBar: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  tabLabel: { fontSize: 12, fontWeight: "600" },

  statsBar: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statBadge: {
    flex: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },

  filterBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },

  // Audience
  askButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  askButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  questionList: { gap: Spacing.sm, marginBottom: Spacing.lg },

  questionCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  highlightBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  highlightText: { fontSize: 12, fontWeight: "700" },
  questionText: { fontSize: 15, fontWeight: "500", lineHeight: 22 },
  questionMeta: { marginTop: Spacing.sm },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  authorName: { fontSize: 12 },
  timestamp: { fontSize: 11, marginLeft: "auto" },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tagChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  tagText: { fontSize: 11, fontWeight: "600" },
  answerBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  answerText: { flex: 1, fontSize: 14, lineHeight: 20 },
  questionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  upvoteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  upvoteCount: { fontSize: 14, fontWeight: "700" },
  answeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginLeft: "auto",
  },

  // Admin
  adminControls: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  adminControlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adminControlLabel: { fontSize: 15, fontWeight: "600" },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterRow: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  adminCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  adminCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  adminMeta: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusPillText: { fontSize: 11, fontWeight: "700" },
  upvoteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  adminActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },

  // Form
  formCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  formTitle: { marginBottom: Spacing.lg },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: Spacing.md,
  },
  anonymousToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  saveButton: { flex: 1 },

  // Empty
  emptyState: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: Spacing.xl + Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.sm,
  },

  // Event banner
  eventBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  eventBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  // Games
  gamePickerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  gameCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  gameHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: Spacing.md,
    textAlign: "center",
  },
  gameDesc: {
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  gamePickerCard: {
    alignItems: "center",
    width: 100,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  gamePickerImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  gamePickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  instructionsList: {
    marginBottom: Spacing.xl,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  instructionStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  startGameButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  startGameText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  gameProgressRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  categoryChip: {
    alignSelf: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  shoeGameQuestion: {
    paddingVertical: Spacing.xl + Spacing.lg,
    alignItems: "center",
  },
  bigQuestion: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 32,
  },
  shoeIndicators: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  shoeIndicator: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  gameNavButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  gameNavBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  resetLink: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },

  // Settings
  settingsSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  iconCustomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  accentDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  iconPickerBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  settingHint: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: Spacing.sm + 14, // icon width + gap
  },
  settingToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  settingToggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
  },
  timerAdjust: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.sm + 14,
    marginBottom: Spacing.sm,
  },
  timerChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },

  // Leaderboard
  leaderboardSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leaderboardRank: {
    width: 28,
    textAlign: "center",
    fontSize: 14,
  },
  leaderboardScore: {
    fontWeight: "800",
    fontSize: 16,
  },

  // Score line in game
  scoreLineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: "#f59e0b15",
  },
  timerDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  scoreButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  scoreBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },

  // Mini leaderboard on instructions
  miniLeaderboard: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  miniScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },

  // Game complete summary
  completeSummary: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  completeScoreCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  completeStats: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  completeStatItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
});
