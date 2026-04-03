import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import { patientAPI, bedAPI, taskAPI } from "../services/api";
import { colors, spacing, fontSize, radius } from "../theme";

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const [stats, setStats]         = useState({ patients: 0, critical: 0, beds: 0, tasks: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const [p, c, b, t] = await Promise.all([
        patientAPI.getAll({ status: "admitted" }),
        patientAPI.getAll({ status: "critical" }),
        bedAPI.getAll({ status: "available" }),
        taskAPI.getAll({ status: "pending" }),
      ]);
      setStats({
        patients: p.data.length,
        critical: c.data.length,
        beds:     b.data.length,
        tasks:    t.data.length,
      });
    } catch {}
  };

  useEffect(() => { loadStats(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const StatCard = ({ label, value, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.grid}>
          <StatCard label="Admitted"      value={stats.patients} color={colors.primary} onPress={() => navigation.navigate("Patients")} />
          <StatCard label="Critical"      value={stats.critical} color={colors.danger}  onPress={() => navigation.navigate("Patients")} />
          <StatCard label="Available Beds" value={stats.beds}    color={colors.success} onPress={() => navigation.navigate("Beds")} />
          <StatCard label="Pending Tasks"  value={stats.tasks}   color={colors.warning} onPress={() => navigation.navigate("Tasks")} />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {[
            { label: "Patients", emoji: "🛏️", screen: "Patients" },
            { label: "Beds",     emoji: "🗺️", screen: "Beds" },
            { label: "Tasks",    emoji: "📋", screen: "Tasks" },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)}>
              <Text style={styles.actionEmoji}>{a.emoji}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.background },
  scroll:      { padding: spacing.md },
  topBar:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  greeting:    { color: "rgba(255,255,255,0.7)", fontSize: fontSize.sm },
  name:        { color: colors.white, fontSize: fontSize.xl, fontWeight: "700" },
  role:        { color: "rgba(255,255,255,0.6)", fontSize: fontSize.xs, marginTop: 2 },
  logoutBtn:   { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText:  { color: colors.white, fontSize: fontSize.sm },
  sectionTitle:{ fontSize: fontSize.lg, fontWeight: "700", color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  grid:        { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statCard:    { flex: 1, minWidth: "45%", backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderLeftWidth: 4, elevation: 2 },
  statValue:   { fontSize: fontSize.xxl, fontWeight: "800" },
  statLabel:   { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  actionCard:  { flex: 1, minWidth: "30%", backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: "center", elevation: 2 },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs, fontWeight: "600" },
});
