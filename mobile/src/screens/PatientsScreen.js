import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, TextInput, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { patientAPI } from "../services/api";
import { colors, spacing, fontSize, radius, STATUS_COLORS } from "../theme";

const Badge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.admitted;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{status}</Text>
    </View>
  );
};

export default function PatientsScreen() {
  const [patients,   setPatients]   = useState([]);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("admitted");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await patientAPI.getAll({ status: filter });
      setPatients(data);
    } catch {}
  };

  useEffect(() => { load(); }, [filter]);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search by name..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        {["admitted", "critical", "discharged"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No patients found</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.patientName}>{item.name}</Text>
              <Badge status={item.status} />
            </View>
            <Text style={styles.meta}>Ward: {item.ward}</Text>
            {item.diagnosis ? <Text style={styles.meta}>Dx: {item.diagnosis}</Text> : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: colors.background },
  header:          { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  title:           { fontSize: fontSize.xl, fontWeight: "700", color: colors.text },
  search:          { margin: spacing.md, marginTop: spacing.xs, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.border },
  filters:         { flexDirection: "row", paddingHorizontal: spacing.md, gap: spacing.xs, marginBottom: spacing.sm },
  filterBtn:       { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  filterActive:    { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText:      { fontSize: fontSize.xs, color: colors.textSecondary },
  filterTextActive:{ color: colors.white, fontWeight: "600" },
  list:            { padding: spacing.md, gap: spacing.sm },
  card:            { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, elevation: 2 },
  cardRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs },
  patientName:     { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  meta:            { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  badge:           { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText:       { fontSize: fontSize.xs, fontWeight: "600", textTransform: "capitalize" },
  empty:           { textAlign: "center", color: colors.textMuted, marginTop: spacing.xl },
});