import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable, TextInput, Modal, ScrollView, PanResponder, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { EvendiIcon } from '@/components/EvendiIcon';
import * as Haptics from 'expo-haptics';
import { nanoid } from 'nanoid';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Speech } from '@/lib/types';
import { showToast } from '@/lib/toast';
import { showConfirm } from '@/lib/dialogs';

export type TableShape = 'round' | 'rectangle' | 'square';
export type TableCategory = 'family' | 'friends' | 'speakers' | 'kids' | 'groomsmen' | 'bridesmaids' | 'other';

const GRID_SIZE = 8; // Snap-to-grid in pixels

const TABLE_CATEGORY_COLORS: Record<TableCategory, string> = {
  family: '#ec4899',     // Pink
  friends: '#8b5cf6',   // Purple
  speakers: '#f59e0b',  // Orange
  kids: '#10b981',      // Green
  groomsmen: '#3b82f6', // Blue
  bridesmaids: '#f472b6', // Rose
  other: '#6b7280',     // Gray
};

const TABLE_CATEGORY_LABELS: Record<TableCategory, string> = {
  family: 'Family',
  friends: 'Friends',
  speakers: 'Speakers',
  kids: 'Kids',
  groomsmen: 'Groomsmen',
  bridesmaids: 'Bridesmaids',
  other: 'Other',
};

export type Table = {
  id: string;
  name: string;
  shape: TableShape;
  seats: number;
  x: number;
  y: number;
  locked?: boolean;
  category?: TableCategory;
  reserved?: boolean;
};

export type Guest = {
  id: string;
  name: string;
  tableId?: string;
};

interface SeatingChartProps {
  tables: Table[];
  guests: Guest[];
  onTablesChange: (tables: Table[]) => void;
  onGuestsChange: (guests: Guest[]) => void;
  editable?: boolean;
  speeches?: Speech[];
}

export function SeatingChart({ 
  tables, 
  guests, 
  onTablesChange, 
  onGuestsChange,
  editable = true,
  speeches = []
}: SeatingChartProps) {
  const { theme } = useTheme();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showAddTableMenu, setShowAddTableMenu] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [draggingGuestId, setDraggingGuestId] = useState<string | null>(null);
  const [dropTargetTableId, setDropTargetTableId] = useState<string | null>(null);
  const [chartLayout, setChartLayout] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<'seating' | 'guestlist' | 'speakers'>('seating');
  
  // Refs for drag state and hit-testing
  const dragStartPos = useRef<{ x: number; y: number; tableId: string } | null>(null);
  const canvasRef = useRef<View>(null);
  const tableHitboxes = useRef<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());
  const currentDropTarget = useRef<string | null>(null);
  const dragOverlayPos = useRef<{ x: number; y: number } | null>(null);
  
  // Undo/Redo history
  const historyStack = useRef<{ tables: Table[]; guests: Guest[] }[]>([]);
  const historyIndex = useRef(0);
  const draggedTableState = useRef<Table | null>(null);
  
  // Initialize history stack on mount or when initial data loads
  useEffect(() => {
    if (tables.length > 0 || guests.length > 0) {
      // Only initialize once if history is empty
      if (historyStack.current.length === 0) {
        historyStack.current = [{ tables: [...tables], guests: [...guests] }];
        historyIndex.current = 0;
      }
    }
  }, [tables.length, guests.length]);
  
  // Table form state
  const [tableName, setTableName] = useState('');
  const [tableSeats, setTableSeats] = useState('8');
  const [tableShape, setTableShape] = useState<TableShape>('round');
  const [tableLocked, setTableLocked] = useState(false);
  const [tableReserved, setTableReserved] = useState(false);
  const [tableCategory, setTableCategory] = useState<TableCategory>('other');

  // Guest form state
  const [guestName, setGuestName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Snap to grid helper
  const snapToGrid = (value: number): number => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  // Memoize guest filtering for performance
  const unassignedGuests = useMemo(() => 
    guests.filter(g => !g.tableId),
    [guests]
  );
  
  const filteredGuests = useMemo(() => 
    searchQuery 
      ? unassignedGuests.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : unassignedGuests,
    [unassignedGuests, searchQuery]
  );

  // Memoize guests by table for performance
  const guestsByTable = useMemo(() => {
    const map = new Map<string, Guest[]>();
    guests.forEach(guest => {
      if (guest.tableId) {
        const existing = map.get(guest.tableId) || [];
        map.set(guest.tableId, [...existing, guest]);
      }
    });
    return map;
  }, [guests]);

  // Memoize speakers by table for performance
  const speechesByTable = useMemo(() => {
    const map = new Map<string, Speech[]>();
    speeches.forEach(speech => {
      if (speech.tableId) {
        const existing = map.get(speech.tableId) || [];
        map.set(speech.tableId, [...existing, speech]);
      }
    });
    return map;
  }, [speeches]);

  // Undo/Redo helpers
  const pushHistory = useCallback(() => {
    const newHistory = historyStack.current.slice(0, historyIndex.current + 1);
    newHistory.push({ tables: [...tables], guests: [...guests] });
    historyStack.current = newHistory;
    historyIndex.current = newHistory.length - 1;
    
    // Limit history to 50 items
    if (historyStack.current.length > 50) {
      historyStack.current.shift();
      historyIndex.current--;
    }
  }, [tables, guests]);

  const undo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      const state = historyStack.current[historyIndex.current];
      onTablesChange(state.tables);
      onGuestsChange(state.guests);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [onTablesChange, onGuestsChange]);

  const redo = useCallback(() => {
    if (historyIndex.current < historyStack.current.length - 1) {
      historyIndex.current++;
      const state = historyStack.current[historyIndex.current];
      onTablesChange(state.tables);
      onGuestsChange(state.guests);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [onTablesChange, onGuestsChange]);

  // Validate and clamp table seats
  const validateSeats = (value: string): number => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) return 1;
    if (parsed > 30) return 30;
    return parsed;
  };

  const addTable = (shape: TableShape) => {
    pushHistory();
    const newTable: Table = {
      id: nanoid(),
      name: `Table ${tables.length + 1}`,
      shape,
      seats: shape === 'round' ? 8 : shape === 'rectangle' ? 10 : 4,
      x: 50,
      y: 50 + (tables.length * 100),
      category: 'other',
    };
    onTablesChange([...tables, newTable]);
    setShowAddTableMenu(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const openTableEditor = (table: Table) => {
    setSelectedTable(table);
    setTableName(table.name);
    setTableSeats(table.seats.toString());
    setTableShape(table.shape);
    setTableLocked(table.locked || false);
    setTableReserved(table.reserved || false);
    setTableCategory(table.category || 'other');
    setShowTableModal(true);
  };

  const saveTable = () => {
    if (!selectedTable) return;
    const validatedSeats = validateSeats(tableSeats);
    pushHistory();
    const updated = tables.map(t => 
      t.id === selectedTable.id 
        ? { ...t, name: tableName, seats: validatedSeats, shape: tableShape, locked: tableLocked, reserved: tableReserved, category: tableCategory }
        : t
    );
    onTablesChange(updated);
    setShowTableModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // PanResponder for table drag - one instance for all tables
  const tablePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editable,
      onMoveShouldSetPanResponder: () => editable,
      
      onPanResponderGrant: (evt, gestureState) => {
        // Find which table was touched based on the touch position
        // This is handled by individual table touch handlers
      },
      
      onPanResponderMove: (evt, gestureState) => {
        if (!dragStartPos.current) return;
        
        const { tableId, x: startX, y: startY } = dragStartPos.current;
        const table = tables.find(t => t.id === tableId);
        if (!table || table.locked) return;
        
        // Calculate new position from start position + gesture delta
        const rawX = startX + gestureState.dx;
        const rawY = startY + gestureState.dy;
        
        // Apply snap-to-grid and bounds checking
        const newX = snapToGrid(Math.max(0, Math.min(rawX, chartLayout.width - 120)));
        const newY = snapToGrid(Math.max(0, Math.min(rawY, chartLayout.height - 100)));
        
        // Store in ref during drag - don't update parent state on every move
        // This prevents spam of state updates (60+ per second)
        draggedTableState.current = { ...table, x: newX, y: newY };
      },
      
      onPanResponderRelease: () => {
        // Commit dragged table position to parent state once on release
        if (draggedTableState.current && dragStartPos.current) {
          const { tableId } = dragStartPos.current;
          const updated = tables.map(t =>
            t.id === tableId ? draggedTableState.current! : t
          );
          pushHistory();
          onTablesChange(updated);
        }
        draggedTableState.current = null;
        dragStartPos.current = null;
        setDraggingTableId(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      
      onPanResponderTerminate: () => {
        dragStartPos.current = null;
        setDraggingTableId(null);
      },
    })
  ).current;

  const deleteTable = async (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    const assignedGuestsCount = guests.filter(g => g.tableId === tableId).length;
    
    const message = assignedGuestsCount > 0 
      ? `This table has ${assignedGuestsCount} assigned guest${assignedGuestsCount > 1 ? 's' : ''}. All guests will be unassigned.`
      : 'Remove this table?';
    
    const confirmed = await showConfirm({
      title: 'Delete Table',
      message,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      destructive: true,
    });
    if (!confirmed) return;

    pushHistory();
    const updatedGuests = guests.map(g =>
      g.tableId === tableId ? { ...g, tableId: undefined } : g
    );
    onGuestsChange(updatedGuests);
    onTablesChange(tables.filter(t => t.id !== tableId));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const addGuest = () => {
    if (!guestName.trim()) {
      showToast('Guest name is required');
      return;
    }
    const newGuest: Guest = {
      id: nanoid(),
      name: guestName.trim(),
    };
    onGuestsChange([...guests, newGuest]);
    setGuestName('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const assignGuestToTable = (guestId: string, tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // Use memoized guestsByTable for O(1) lookup
    const assignedCount = (guestsByTable.get(tableId) || []).length;
    if (assignedCount >= table.seats) {
      showToast(`This table only has ${table.seats} seats`);
      return;
    }

    pushHistory();
    const updatedGuests = guests.map(g => 
      g.id === guestId ? { ...g, tableId } : g
    );
    onGuestsChange(updatedGuests);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Close modal if open
    if (showAssignModal) {
      setShowAssignModal(false);
      setSelectedGuest(null);
    }
  };

  const openAssignModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowAssignModal(true);
  };

  const unassignGuest = (guestId: string) => {
    pushHistory();
    const updatedGuests = guests.map(g => 
      g.id === guestId ? { ...g, tableId: undefined } : g
    );
    onGuestsChange(updatedGuests);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderTable = useCallback((table: Table) => {
    const isDragging = draggingTableId === table.id;
    
    // Use dragged position during drag, otherwise use table position
    const displayTable = isDragging && draggedTableState.current 
      ? draggedTableState.current 
      : table;
    
    const assignedGuests = guestsByTable.get(table.id) || [];
    const filledSeats = assignedGuests.length;
    const availableSeats = table.seats - filledSeats;
    
    // Get speakers assigned to this table (using memoized map)
    const tableSpeakers = speechesByTable.get(table.id) || [];
    const speakerCount = tableSpeakers.length;
    const speakingNow = tableSpeakers.find(s => s.status === 'speaking');

    const isDropTarget = dropTargetTableId === table.id && draggingGuestId !== null;
    const canAcceptDrop = availableSeats > 0;
    const isSelected = selectedTable?.id === table.id;
    const categoryColor = table.category ? TABLE_CATEGORY_COLORS[table.category] : theme.border;

    const handleTouchStart = () => {
      if (!editable || table.locked) return;
      dragStartPos.current = { x: table.x, y: table.y, tableId: table.id };
      draggedTableState.current = null;
      setDraggingTableId(table.id);
      setSelectedTable(table);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
      <View
        key={table.id}
        {...(editable && !table.locked ? tablePanResponder.panHandlers : {})}
        onStartShouldSetResponder={() => {
          handleTouchStart();
          return editable && !table.locked;
        }}
        onLayout={(e) => {
          // Measure table hitbox for accurate hit-testing
          const { x, y, width, height } = e.nativeEvent.layout;
          tableHitboxes.current.set(table.id, { x: displayTable.x, y: displayTable.y, width, height });
        }}
        style={[
          styles.tableContainer,
          { 
            backgroundColor: theme.backgroundDefault, 
            borderColor: speakingNow ? '#f59e0b' : 
                        isDropTarget && canAcceptDrop ? '#10b981' : 
                        isDropTarget && !canAcceptDrop ? '#ef4444' :
                        isSelected ? categoryColor :
                        table.locked ? theme.primary : 
                        table.category ? categoryColor + '60' : theme.border,
            borderWidth: speakingNow ? 3 : 
                        isDropTarget ? 3 :
                        isSelected ? 3 :
                        table.locked ? 2 : 1,
            left: displayTable.x,
            top: displayTable.y,
            opacity: isDragging ? 0.9 : 
                    selectedTable && !isSelected ? 0.6 : 1,
            transform: isDropTarget ? [{ scale: 1.05 }] : 
                      isDragging ? [{ scale: 0.98 }] : 
                      [{ scale: 1 }],
            shadowColor: isSelected ? categoryColor : '#000',
            shadowOffset: isSelected ? { width: 0, height: 4 } : { width: 0, height: 2 },
            shadowOpacity: isSelected ? 0.3 : 0.1,
            shadowRadius: isSelected ? 8 : 4,
            elevation: isSelected ? 8 : 2,
          }
        ]}
      >
        <Pressable
          onPress={() => !isDragging && editable && openTableEditor(table)}
          onLongPress={() => editable && deleteTable(table.id)}
          style={styles.tablePressableContent}
        >
        <View style={[
          styles.tableShape,
          table.shape === 'round' && styles.tableRound,
          table.shape === 'rectangle' && styles.tableRectangle,
          table.shape === 'square' && styles.tableSquare,
          { borderColor: categoryColor }
        ]}>
          {table.category && table.category !== 'other' && (
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <ThemedText style={styles.categoryBadgeText}>
                {TABLE_CATEGORY_LABELS[table.category]}
              </ThemedText>
            </View>
          )}
          <ThemedText style={[styles.tableName, { color: theme.text }]}>{table.name}</ThemedText>
          <ThemedText style={[styles.tableSeats, { color: isDropTarget && !canAcceptDrop ? '#ef4444' : theme.textSecondary }]}>
            {filledSeats}/{table.seats}
          </ThemedText>
          {isDropTarget && canAcceptDrop && (
            <ThemedText style={[styles.dropHint, { color: '#10b981' }]}>Drop here</ThemedText>
          )}
          {isDropTarget && !canAcceptDrop && (
            <ThemedText style={[styles.dropHint, { color: '#ef4444' }]}>Full!</ThemedText>
          )}
          {table.locked && (
            <View style={styles.lockBadge}>
              <EvendiIcon name="lock" size={12} color="#fff" />
            </View>
          )}
          {table.reserved && (
            <View style={styles.reservedBadge}>
              <EvendiIcon name="bookmark" size={12} color="#fff" />
            </View>
          )}
          {speakerCount > 0 && (
            <View style={styles.speakerBadge}>
              <EvendiIcon name="mic" size={12} color="#fff" />
              <ThemedText style={styles.speakerBadgeText}>{speakerCount}</ThemedText>
            </View>
          )}
        </View>
        {assignedGuests.slice(0, 3).map((guest, idx) => (
          <ThemedText 
            key={guest.id} 
            style={[styles.guestChip, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {guest.name}
          </ThemedText>
        ))}
        {filledSeats > 3 && (
          <ThemedText style={[styles.moreGuests, { color: theme.textSecondary }]}>
            +{filledSeats - 3} more
          </ThemedText>
        )}
        {speakerCount > 0 && (
          <View style={[styles.speakersList, { borderTopColor: theme.border }]}>
            {tableSpeakers.slice(0, 2).map((speaker) => (
              <View 
                key={speaker.id}
                style={styles.speakerChipRow}
              >
                <EvendiIcon 
                  name="mic" 
                  size={10} 
                  color={speaker.status === 'speaking' ? '#f59e0b' : '#6b7280'} 
                />
                <ThemedText 
                  style={[styles.speakerChip, { color: speaker.status === 'speaking' ? '#f59e0b' : '#6b7280' }]}
                  numberOfLines={1}
                >
                  {speaker.speakerName}
                </ThemedText>
              </View>
            ))}
            {speakerCount > 2 && (
              <ThemedText style={[styles.speakerChip, { color: theme.textSecondary }]}>
                +{speakerCount - 2} speakers
              </ThemedText>
            )}
          </View>
        )}
      </Pressable>
      </View>
    );
  }, [guestsByTable, speechesByTable, draggingTableId, dropTargetTableId, draggingGuestId, selectedTable, theme, editable, tablePanResponder, dragStartPos]);

  return (
    <View style={styles.container}>
      <View style={[styles.sidebar, { backgroundColor: theme.backgroundDefault, borderRightColor: theme.border }]}>
        <View style={styles.sidebarHeader}>
          <ThemedText style={[styles.sidebarTitle, { color: theme.text }]}>
            Guests ({unassignedGuests.length})
          </ThemedText>
          {editable && (
            <Pressable onPress={() => setShowGuestModal(true)} style={styles.addButton}>
              <EvendiIcon name="plus" size={20} color={theme.primary} />
            </Pressable>
          )}
        </View>

        <View style={styles.searchBox}>
          <EvendiIcon name="search" size={16} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search guests..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          style={styles.guestList}
          scrollEnabled={!draggingGuestId}
        >
          {filteredGuests.map(guest => {
            const isDragging = draggingGuestId === guest.id;
            return (
              <Pressable
                key={guest.id}
                onPress={() => editable && openAssignModal(guest)}
                onLongPress={() => {
                  pushHistory();
                  setDraggingGuestId(guest.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                style={[
                  styles.guestItem,
                  { 
                    backgroundColor: isDragging ? theme.primary + '20' : 'transparent',
                    opacity: isDragging ? 0.7 : 1,
                  }
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm }}>
                  <EvendiIcon 
                    name={isDragging ? "move" : "user"} 
                    size={14} 
                    color={isDragging ? theme.primary : theme.textSecondary} 
                  />
                  <ThemedText style={[styles.guestName, { color: theme.text }]} numberOfLines={1}>
                    {guest.name}
                  </ThemedText>
                </View>
                <Pressable 
                  onPress={() => openAssignModal(guest)}
                  style={[styles.assignFullButton, { backgroundColor: theme.primary }]}
                >
                  <ThemedText style={styles.assignFullButtonText}>Assign</ThemedText>
                  <EvendiIcon name="chevron-right" size={14} color="#fff" />
                </Pressable>
              </Pressable>
            );
          })}
          {filteredGuests.length === 0 && (
            <View style={styles.emptyState}>
              <EvendiIcon name="users" size={32} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                {searchQuery ? 'No guests found' : 'All guests assigned'}
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.chartArea}>
        <View style={[styles.chartHeader, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
          {/* Undo/Redo buttons */}
          {editable && (
            <View style={styles.undoRedoContainer}>
              <Pressable
                onPress={undo}
                disabled={historyIndex.current === 0}
                style={[
                  styles.undoRedoButton,
                  { borderColor: theme.border },
                  historyIndex.current === 0 && { opacity: 0.3 }
                ]}
              >
                <EvendiIcon name="rotate-ccw" size={16} color={theme.text} />
              </Pressable>
              <Pressable
                onPress={redo}
                disabled={historyIndex.current >= historyStack.current.length - 1}
                style={[
                  styles.undoRedoButton,
                  { borderColor: theme.border },
                  historyIndex.current >= historyStack.current.length - 1 && { opacity: 0.3 }
                ]}
              >
                <EvendiIcon name="rotate-cw" size={16} color={theme.text} />
              </Pressable>
            </View>
          )}
          
          <View style={styles.viewModeToggle}>
            <Pressable
              onPress={() => setViewMode('seating')}
              style={[
                styles.viewModeButton,
                { borderColor: theme.border },
                viewMode === 'seating' && { backgroundColor: theme.primary }
              ]}
            >
              <EvendiIcon name="grid" size={16} color={viewMode === 'seating' ? '#fff' : theme.textSecondary} />
              <ThemedText style={[styles.viewModeText, { color: viewMode === 'seating' ? '#fff' : theme.textSecondary }]}>
                Seating
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('guestlist')}
              style={[
                styles.viewModeButton,
                { borderColor: theme.border },
                viewMode === 'guestlist' && { backgroundColor: theme.primary }
              ]}
            >
              <EvendiIcon name="list" size={16} color={viewMode === 'guestlist' ? '#fff' : theme.textSecondary} />
              <ThemedText style={[styles.viewModeText, { color: viewMode === 'guestlist' ? '#fff' : theme.textSecondary }]}>
                Guest List
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('speakers')}
              style={[
                styles.viewModeButton,
                { borderColor: theme.border },
                viewMode === 'speakers' && { backgroundColor: theme.primary }
              ]}
            >
              <EvendiIcon name="mic" size={16} color={viewMode === 'speakers' ? '#fff' : theme.textSecondary} />
              <ThemedText style={[styles.viewModeText, { color: viewMode === 'speakers' ? '#fff' : theme.textSecondary }]}>
                Speakers
              </ThemedText>
            </Pressable>
          </View>
          {editable && viewMode === 'seating' && (
            <Pressable 
              onPress={() => setShowAddTableMenu(!showAddTableMenu)}
              style={[styles.addTableButton, { backgroundColor: theme.primary }]}
            >
              <EvendiIcon name="plus" size={20} color="#fff" />
              <ThemedText style={styles.addTableText}>Add Table</ThemedText>
            </Pressable>
          )}
        </View>

        {showAddTableMenu && (
          <View style={[styles.tableShapeMenu, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Pressable onPress={() => addTable('round')} style={styles.shapeOption}>
              <View style={[styles.shapePreview, styles.shapeRound, { borderColor: theme.primary }]} />
              <ThemedText style={{ color: theme.text }}>Round</ThemedText>
            </Pressable>
            <Pressable onPress={() => addTable('rectangle')} style={styles.shapeOption}>
              <View style={[styles.shapePreview, styles.shapeRect, { borderColor: theme.primary }]} />
              <ThemedText style={{ color: theme.text }}>Rectangle</ThemedText>
            </Pressable>
            <Pressable onPress={() => addTable('square')} style={styles.shapeOption}>
              <View style={[styles.shapePreview, styles.shapeSq, { borderColor: theme.primary }]} />
              <ThemedText style={{ color: theme.text }}>Square</ThemedText>
            </Pressable>
          </View>
        )}

        <ScrollView 
          style={styles.chartScroll}
          scrollEnabled={!draggingGuestId}
        >
          {viewMode === 'seating' ? (
            <View 
              ref={canvasRef}
              style={[styles.chartCanvas, { backgroundColor: theme.backgroundRoot }]}
              onLayout={(e) => {
                setChartLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
              }}
              onTouchMove={(e) => {
                // Detect which table is under the touch when dragging a guest
                if (draggingGuestId) {
                  // Use locationX/Y which is relative to the canvas, not pageX/Y
                  const touchX = e.nativeEvent.locationX;
                  const touchY = e.nativeEvent.locationY;
                  
                  // Update drag overlay position in ref only (no state update)
                  dragOverlayPos.current = { x: touchX, y: touchY };
                  
                  // Hit-test against measured hitboxes (deferred render)
                  let targetTableId: string | null = null;
                  for (const [tableId, hitbox] of tableHitboxes.current) {
                    if (touchX >= hitbox.x && 
                        touchX <= hitbox.x + hitbox.width && 
                        touchY >= hitbox.y && 
                        touchY <= hitbox.y + hitbox.height) {
                      targetTableId = tableId;
                      break;
                    }
                  }

                  // Only update state if target actually changed
                  if (currentDropTarget.current !== targetTableId) {
                    currentDropTarget.current = targetTableId;
                    setDropTargetTableId(targetTableId);
                  }
                }
              }}
              onTouchEnd={() => {
                if (draggingGuestId && currentDropTarget.current) {
                  assignGuestToTable(draggingGuestId, currentDropTarget.current);
                }
                setDraggingGuestId(null);
                setDropTargetTableId(null);
                currentDropTarget.current = null;
                dragOverlayPos.current = null;
              }}
            >
              {tables.length === 0 ? (
                <View style={styles.emptyChart}>
                  <EvendiIcon name="grid" size={48} color={theme.textMuted} />
                  <ThemedText style={[styles.emptyChartText, { color: theme.text }]}>
                    No tables yet
                  </ThemedText>
                  <ThemedText style={[styles.emptyChartSubtext, { color: theme.textSecondary }]}>
                    Tap "Add Table" to create your seating layout
                  </ThemedText>
                </View>
              ) : (
                <>
                  {tables.map(renderTable)}
                  
                  {/* Drag overlay - shows dragged guest following finger */}
                  {draggingGuestId && dragOverlayPos.current && (
                    <View
                      style={[
                        styles.dragOverlay,
                        {
                          left: dragOverlayPos.current.x - 50,
                          top: dragOverlayPos.current.y - 15,
                          backgroundColor: theme.primary,
                          shadowColor: theme.primary,
                        }
                      ]}
                      pointerEvents="none"
                    >
                      <ThemedText style={styles.dragOverlayText}>
                        {guests.find(g => g.id === draggingGuestId)?.name || 'Guest'}
                      </ThemedText>
                    </View>
                  )}
                </>
              )}
            </View>
          ) : viewMode === 'guestlist' ? (
            <View style={[styles.listView, { backgroundColor: theme.backgroundRoot }]}>
              {tables.map(table => {
                const tableGuests = guestsByTable.get(table.id) || [];
                if (tableGuests.length === 0) return null;
                const categoryColor = table.category ? TABLE_CATEGORY_COLORS[table.category] : theme.border;
                
                return (
                  <View key={table.id} style={[styles.listTableCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                    <View style={[styles.listTableHeader, { borderBottomColor: theme.border }]}>
                      <View style={styles.listTableInfo}>
                        <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                        <ThemedText style={[styles.listTableName, { color: theme.text }]}>{table.name}</ThemedText>
                        {table.reserved && <EvendiIcon name="bookmark" size={14} color="#eab308" />}
                      </View>
                      <ThemedText style={[styles.listTableSeats, { color: theme.textSecondary }]}>
                        {tableGuests.length}/{table.seats} seats
                      </ThemedText>
                    </View>
                    <View style={styles.listTableGuests}>
                      {tableGuests.map(guest => (
                        <View key={guest.id} style={styles.listGuestRow}>
                          <EvendiIcon name="user" size={14} color={theme.textSecondary} />
                          <ThemedText style={[styles.listGuestName, { color: theme.text }]}>{guest.name}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
              {tables.every(t => (guestsByTable.get(t.id) || []).length === 0) && (
                <View style={styles.emptyChart}>
                  <EvendiIcon name="users" size={48} color={theme.textMuted} />
                  <ThemedText style={[styles.emptyChartText, { color: theme.text }]}>
                    No guests assigned yet
                  </ThemedText>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.listView, { backgroundColor: theme.backgroundRoot }]}>
              {tables.map(table => {
                const tableSpeakers = speechesByTable.get(table.id) || [];
                if (tableSpeakers.length === 0) return null;
                const categoryColor = table.category ? TABLE_CATEGORY_COLORS[table.category] : theme.border;
                
                return (
                  <View key={table.id} style={[styles.listTableCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                    <View style={[styles.listTableHeader, { borderBottomColor: theme.border }]}>
                      <View style={styles.listTableInfo}>
                        <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                        <ThemedText style={[styles.listTableName, { color: theme.text }]}>{table.name}</ThemedText>
                      </View>
                      <ThemedText style={[styles.listTableSeats, { color: theme.textSecondary }]}>
                        {tableSpeakers.length} speaker{tableSpeakers.length !== 1 ? 's' : ''}
                      </ThemedText>
                    </View>
                    <View style={styles.listTableGuests}>
                      {tableSpeakers.map(speaker => (
                        <View key={speaker.id} style={styles.listGuestRow}>
                          <EvendiIcon 
                            name="mic" 
                            size={14} 
                            color={speaker.status === 'speaking' ? '#f59e0b' : theme.textSecondary} 
                          />
                          <ThemedText style={[styles.listGuestName, { color: theme.text }]}>{speaker.speakerName}</ThemedText>
                          {speaker.status === 'speaking' && (
                            <View style={[styles.speakingBadge, { backgroundColor: '#f59e0b' + '20' }]}>
                              <ThemedText style={[styles.speakingBadgeText, { color: '#f59e0b' }]}>Speaking</ThemedText>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
              {speeches.length === 0 && (
                <View style={styles.emptyChart}>
                  <EvendiIcon name="mic" size={48} color={theme.textMuted} />
                  <ThemedText style={[styles.emptyChartText, { color: theme.text }]}>
                    No speakers assigned yet
                  </ThemedText>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Table Edit Modal */}
      <Modal visible={showTableModal} animationType="slide" onRequestClose={() => setShowTableModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Pressable onPress={() => setShowTableModal(false)}>
                <ThemedText style={[styles.modalCancel, { color: theme.primary }]}>Cancel</ThemedText>
              </Pressable>
              <ThemedText style={styles.modalTitle}>Edit Table</ThemedText>
              <Pressable onPress={saveTable}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Save</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Table Name</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="e.g., Table 1"
                placeholderTextColor={theme.textSecondary}
                value={tableName}
                onChangeText={setTableName}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Number of Seats</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: parseInt(tableSeats, 10) === 0 || isNaN(parseInt(tableSeats, 10)) ? '#ef4444' : theme.border, color: theme.text }]}
                placeholder="e.g., 8"
                placeholderTextColor={theme.textSecondary}
                value={tableSeats}
                onChangeText={(val) => {
                  setTableSeats(val);
                }}
                onBlur={() => {
                  const validated = validateSeats(tableSeats);
                  setTableSeats(validated.toString());
                }}
                keyboardType="numeric"
              />
              {(parseInt(tableSeats, 10) === 0 || isNaN(parseInt(tableSeats, 10))) && (
                <ThemedText style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                  Must be between 1 and 30
                </ThemedText>
              )}
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Table Shape</ThemedText>
              <View style={styles.shapeSelector}>
                {(['round', 'rectangle', 'square'] as TableShape[]).map(shape => (
                  <Pressable
                    key={shape}
                    onPress={() => setTableShape(shape)}
                    style={[
                      styles.shapeButton,
                      { borderColor: theme.border },
                      tableShape === shape && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                    ]}
                  >
                    <ThemedText style={{ color: theme.text, textTransform: 'capitalize' }}>
                      {shape}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Table Category</ThemedText>
              <View style={styles.categorySelector}>
                {(['family', 'friends', 'groomsmen', 'bridesmaids', 'speakers', 'kids', 'other'] as TableCategory[]).map(category => (
                  <Pressable
                    key={category}
                    onPress={() => setTableCategory(category)}
                    style={[
                      styles.categoryButton,
                      { 
                        borderColor: TABLE_CATEGORY_COLORS[category] + '60',
                        backgroundColor: tableCategory === category 
                          ? TABLE_CATEGORY_COLORS[category] + '20' 
                          : 'transparent'
                      },
                      tableCategory === category && { borderWidth: 2 }
                    ]}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: TABLE_CATEGORY_COLORS[category] }]} />
                    <ThemedText style={{ color: theme.text, textTransform: 'capitalize' }}>
                      {TABLE_CATEGORY_LABELS[category]}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={[styles.lockToggleRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <View style={styles.lockToggleContent}>
                  <EvendiIcon name={tableLocked ? 'lock' : 'unlock'} size={18} color={theme.primary} />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <ThemedText style={[styles.formLabel, { marginBottom: 2 }]}>Lock Table Position</ThemedText>
                    <ThemedText style={[styles.lockToggleDesc, { color: theme.textSecondary }]}>
                      Prevent accidental dragging
                    </ThemedText>
                  </View>
                </View>
                <Pressable 
                  onPress={() => setTableLocked(!tableLocked)}
                  style={[styles.lockToggle, tableLocked && { backgroundColor: theme.primary + '30' }]}
                >
                  <EvendiIcon name={tableLocked ? 'check' : 'x'} size={16} color={theme.primary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={[styles.lockToggleRow, { backgroundColor: theme.backgroundDefault, borderColor: tableReserved ? '#eab308' : theme.border }]}>
                <View style={styles.lockToggleContent}>
                  <EvendiIcon name="bookmark" size={18} color={tableReserved ? '#eab308' : theme.primary} />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <ThemedText style={[styles.formLabel, { marginBottom: 2 }]}>Reserved Table</ThemedText>
                    <ThemedText style={[styles.lockToggleDesc, { color: theme.textSecondary }]}>
                      Mark as reserved for special guests
                    </ThemedText>
                  </View>
                </View>
                <Pressable 
                  onPress={() => setTableReserved(!tableReserved)}
                  style={[styles.lockToggle, tableReserved && { backgroundColor: '#eab308' + '30', borderColor: '#eab308' }]}
                >
                  <EvendiIcon name={tableReserved ? 'check' : 'x'} size={16} color={tableReserved ? '#eab308' : theme.primary} />
                </Pressable>
              </View>
            </View>

            {selectedTable && (
              <View style={styles.formGroup}>
                <ThemedText style={[styles.formLabel, { marginBottom: Spacing.md }]}>
                  Assigned Guests ({(guestsByTable.get(selectedTable.id) || []).length}/{selectedTable.seats})
                </ThemedText>
                {(guestsByTable.get(selectedTable.id) || []).map(guest => (
                  <View key={guest.id} style={[styles.assignedGuestRow, { borderColor: theme.border }]}>
                    <ThemedText style={{ color: theme.text, flex: 1 }}>{guest.name}</ThemedText>
                    <Pressable onPress={() => unassignGuest(guest.id)}>
                      <EvendiIcon name="x" size={18} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Guest Modal */}
      <Modal visible={showGuestModal} animationType="slide" onRequestClose={() => setShowGuestModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Pressable onPress={() => setShowGuestModal(false)}>
                <ThemedText style={[styles.modalCancel, { color: theme.primary }]}>Cancel</ThemedText>
              </Pressable>
              <ThemedText style={styles.modalTitle}>Add Guest</ThemedText>
              <Pressable onPress={addGuest}>
                <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Add</ThemedText>
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Guest Name</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="e.g., John Smith"
                  placeholderTextColor={theme.textSecondary}
                  value={guestName}
                  onChangeText={setGuestName}
                  autoFocus
                />
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Assign Guest to Table Modal */}
      <Modal visible={showAssignModal} animationType="slide" onRequestClose={() => setShowAssignModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Pressable onPress={() => setShowAssignModal(false)}>
                <ThemedText style={[styles.modalCancel, { color: theme.primary }]}>Cancel</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>Assign to Table</ThemedText>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.modalContent}>
            {selectedGuest && (
              <>
                <View style={[styles.guestInfoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <EvendiIcon name="user" size={20} color={theme.primary} />
                  <ThemedText style={[styles.guestInfoName, { color: theme.text }]}>
                    {selectedGuest.name}
                  </ThemedText>
                </View>

                <ThemedText style={[styles.formLabel, { marginTop: Spacing.lg, marginBottom: Spacing.md }]}>
                  Select Table
                </ThemedText>

                <ScrollView style={styles.tableSelectionList}>
                  {tables.map(table => {
                    const assignedCount = guests.filter(g => g.tableId === table.id).length;
                    const availableSeats = table.seats - assignedCount;
                    const isFull = availableSeats === 0;

                    return (
                      <Pressable
                        key={table.id}
                        onPress={() => !isFull && assignGuestToTable(selectedGuest.id, table.id)}
                        disabled={isFull}
                        style={[
                          styles.tableSelectionItem,
                          { 
                            backgroundColor: theme.backgroundDefault,
                            borderColor: isFull ? theme.border : theme.primary + '40',
                            opacity: isFull ? 0.5 : 1,
                          }
                        ]}
                      >
                        <View style={styles.tableSelectionInfo}>
                          <ThemedText style={[styles.tableSelectionName, { color: theme.text }]}>
                            {table.name}
                          </ThemedText>
                          <View style={styles.tableSelectionMeta}>
                            <EvendiIcon 
                              name={table.shape === 'round' ? 'circle' : table.shape === 'square' ? 'square' : 'menu'} 
                              size={12} 
                              color={theme.textSecondary} 
                            />
                            <ThemedText style={[styles.tableSelectionMetaText, { color: theme.textSecondary }]}>
                              {table.shape}
                            </ThemedText>
                          </View>
                        </View>
                        <View style={[
                          styles.seatsBadge,
                          { 
                            backgroundColor: isFull ? '#ef4444' + '20' : availableSeats <= 2 ? '#f59e0b' + '20' : '#10b981' + '20',
                            borderColor: isFull ? '#ef4444' : availableSeats <= 2 ? '#f59e0b' : '#10b981',
                          }
                        ]}>
                          <EvendiIcon 
                            name={isFull ? 'x-circle' : 'users'} 
                            size={14} 
                            color={isFull ? '#ef4444' : availableSeats <= 2 ? '#f59e0b' : '#10b981'} 
                          />
                          <ThemedText style={[
                            styles.seatsBadgeText,
                            { color: isFull ? '#ef4444' : availableSeats <= 2 ? '#f59e0b' : '#10b981' }
                          ]}>
                            {isFull ? 'Full' : `${availableSeats} seat${availableSeats !== 1 ? 's' : ''}`}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                  {tables.length === 0 && (
                    <View style={styles.emptyState}>
                      <EvendiIcon name="grid" size={32} color={theme.textMuted} />
                      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                        No tables created yet
                      </ThemedText>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    borderRightWidth: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    padding: Spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  guestList: {
    flex: 1,
  },
  guestItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  guestName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  tableAssignButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  assignButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  assignButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
  },
  chartArea: {
    flex: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  undoRedoContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginRight: Spacing.md,
  },
  undoRedoButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addTableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addTableText: {
    color: '#fff',
    fontWeight: '600',
  },
  tableShapeMenu: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  shapeOption: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  shapePreview: {
    borderWidth: 2,
  },
  shapeRound: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  shapeRect: {
    width: 50,
    height: 30,
    borderRadius: BorderRadius.sm,
  },
  shapeSq: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
  },
  chartScroll: {
    flex: 1,
  },
  chartCanvas: {
    minHeight: 600,
    padding: Spacing.lg,
    position: 'relative',
  },
  emptyChart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 3,
    gap: Spacing.md,
  },
  emptyChartText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyChartSubtext: {
    fontSize: 14,
  },
  tableContainer: {
    position: 'absolute',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 120,
    gap: Spacing.xs,
  },
  tableShape: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    padding: Spacing.md,
  },
  tableRound: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  tableRectangle: {
    width: 100,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  tableSquare: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  tableName: {
    fontSize: 14,
    fontWeight: '600',
  },
  tableSeats: {
    fontSize: 11,
    marginTop: 2,
  },
  guestChip: {
    fontSize: 11,
    paddingVertical: 2,
  },
  moreGuests: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 14,
  },
  shapeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shapeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  assignedGuestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  speakerBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  speakerBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  speakersList: {
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    paddingTop: Spacing.xs,
  },
  speakerChip: {
    fontSize: 10,
    paddingVertical: 2,
  },
  speakerChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tablePressableContent: {
    flex: 1,
  },
  lockBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: Spacing.xs,
    borderWidth: 1,
    borderColor: '#fff',
  },
  reservedBadge: {
    position: 'absolute',
    bottom: -8,
    left: -8,
    backgroundColor: '#eab308',
    borderRadius: 12,
    padding: Spacing.xs,
    borderWidth: 1,
    borderColor: '#fff',
  },
  categoryBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 8,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  categorySelector: {
    gap: Spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  lockToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  lockToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lockToggleDesc: {
    fontSize: 12,
  },
  lockToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  dropHint: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  assignFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  assignFullButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  guestInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  guestInfoName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableSelectionList: {
    flex: 1,
  },
  tableSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  tableSelectionInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  tableSelectionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableSelectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tableSelectionMetaText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  seatsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewModeToggle: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listView: {
    padding: Spacing.lg,
    minHeight: 600,
  },
  listTableCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  listTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  listTableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  listTableName: {
    fontSize: 16,
    fontWeight: '600',
  },
  listTableSeats: {
    fontSize: 12,
  },
  listTableGuests: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  listGuestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  listGuestName: {
    fontSize: 14,
    flex: 1,
  },
  speakingBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  speakingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dragOverlay: {
    position: 'absolute',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    opacity: 0.9,
  },
  dragOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
