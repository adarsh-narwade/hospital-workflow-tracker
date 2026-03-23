import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { taskAPI } from "../services/api";
import { colors, spacing, fontSize, radius, STATUS_COLORS } from "../theme";

const TYPE_ICONS = { medication: "💊", lab_order: "🧪", procedure: "🩺", general: "📋", emergency: "🚑" };

export default function TasksScreen() {
  const [tasks,      setTasks]      = useState([]);
  const [filter,     setFilter]     = useState("pending");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await taskAPI.getAll({ status: filter });
      setTasks(data);
    } catch {}
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await taskAPI.update(id, { status });
      setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks & Orders</Text>
      </View>

      <View style={styles.filters}>
        {["pending", "in_progress", "completed"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.replace("_", " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No {filter.replace("_", " ")} tasks</Text>}
        renderItem={({ item }) => {
          const p = STATUS_COLORS[item.priority] || STATUS_COLORS.medium;
          const s = STATUS_COLORS[item.status]   || STATUS_COLORS.pending;
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.taskTitle}>{TYPE_ICONS[item.type] || "📋"} {item.title}</Text>
                <View style={[styles.badge, { backgroundColor: p.bg }]}>
                  <Text style={[styles.badgeText, { color: p.text }]}>{item.priority}</Text>
                </View>
              </View>
              {item.assignedTo && <Text style={styles.meta}>👤 {item.assignedTo.name}</Text>}
              <View style={styles.actionsRow}>
                <View style={[styles.badge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.badgeText, { color: s.text }]}>{item.status.replace("_", " ")}</Text>
                </View>
                {item.status === "pending" && (
                  <TouchableOpacity style={styles.btn} onPress={() => updateStatus(item._id, "in_progress")}>
                    <Text style={styles.btnText}>Start</Text>
                  </TouchableOpacity>
                )}
                {item.status === "in_progress" && (
                  <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={() => updateStatus(item._id, "completed")}>
                    <Text style={styles.btnText}>Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: colors.background },
  header:          { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  title:           { fontSize: fontSize.xl, fontWeight: "700", color: colors.text },
  filters:         { flexDirection: "row", paddingHorizontal: spacing.md, gap: spacing.xs, marginBottom: spacing.sm },
  filterBtn:       { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  filterActive:    { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText:      { fontSize: fontSize.xs, color: colors.textSecondary },
  filterTextActive:{ color: colors.white, fontWeight: "600" },
  list:            { padding: spacing.md, gap: spacing.sm },
  card:            { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, elevation: 2 },
  cardTop:         { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.xs },
  taskTitle:       { fontSize: fontSize.md, fontWeight: "700", color: colors.text, flex: 1, marginRight: spacing.xs },
  meta:            { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  actionsRow:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xs },
  badge:           { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText:       { fontSize: fontSize.xs, fontWeight: "600", textTransform: "capitalize" },
  btn:             { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.md },
  btnGreen:        { backgroundColor: colors.success },
  btnText:         { color: colors.white, fontSize: fontSize.sm, fontWeight: "700" },
  empty:           { textAlign: "center", color: colors.textMuted, marginTop: spacing.xl },
});