import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { bedAPI } from "../services/api";
import { colors, spacing, fontSize, radius, STATUS_COLORS } from "../theme";

const BED_ICONS = { available: "🟢", occupied: "🔴", cleaning: "🟡", maintenance: "⚫" };

export default function BedsScreen() {
  const [beds,       setBeds]       = useState([]);
  const [filter,     setFilter]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await bedAPI.getAll(params);
      setBeds(data);
    } catch {}
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Bed Management</Text>
      </View>

      <View style={styles.filters}>
        {[null, "available", "occupied", "cleaning"].map((s) => (
          <TouchableOpacity
            key={s ?? "all"}
            style={[styles.filterBtn, filter === s && styles.filterActive]}
            onPress={() => setFilter(s)}
          >
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
              {s ?? "all"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={beds}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No beds found</Text>}
        renderItem={({ item }) => {
          const s = STATUS_COLORS[item.status] || STATUS_COLORS.available;
          return (
            <View style={styles.card}>
              <Text style={styles.bedNum}>{BED_ICONS[item.status]} {item.bedNumber}</Text>
              <View style={[styles.badge, { backgroundColor: s.bg }]}>
                <Text style={[styles.badgeText, { color: s.text }]}>{item.status}</Text>
              </View>
              <Text style={styles.meta}>Room {item.room} · Floor {item.floor}</Text>
              <Text style={styles.meta}>Ward: {item.ward}</Text>
              {item.currentPatient && (
                <Text style={styles.patient}>👤 {item.currentPatient.name}</Text>
              )}
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
  filters:         { flexDirection: "row", paddingHorizontal: spacing.md, gap: spacing.xs, marginBottom: spacing.sm, flexWrap: "wrap" },
  filterBtn:       { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  filterActive:    { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText:      { fontSize: fontSize.xs, color: colors.textSecondary },
  filterTextActive:{ color: colors.white, fontWeight: "600" },
  list:            { padding: spacing.md },
  row:             { gap: spacing.sm, marginBottom: spacing.sm },
  card:            { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, elevation: 2 },
  bedNum:          { fontSize: fontSize.md, fontWeight: "700", color: colors.text, marginBottom: 4 },
  meta:            { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  patient:         { fontSize: fontSize.xs, color: colors.primary, marginTop: spacing.xs, fontWeight: "600" },
  badge:           { paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radius.full, alignSelf: "flex-start", marginBottom: 4 },
  badgeText:       { fontSize: 10, fontWeight: "600", textTransform: "capitalize" },
  empty:           { textAlign: "center", color: colors.textMuted, marginTop: spacing.xl },
});