import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { colors, spacing, fontSize, radius } from "../theme";

export default function LoginScreen() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    await login(email.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏥</Text>
          <Text style={styles.title}>Hospital Workflow</Text>
          <Text style={styles.subtitle}>Staff Portal</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@hospital.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.buttonText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Secure staff access only</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.primary },
  inner:          { flex: 1, justifyContent: "center", padding: spacing.xl },
  header:         { alignItems: "center", marginBottom: spacing.xl },
  logo:           { fontSize: 56 },
  title:          { fontSize: fontSize.xxl, fontWeight: "700", color: colors.white, marginTop: spacing.sm },
  subtitle:       { fontSize: fontSize.md, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  form:           { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg },
  label:          { fontSize: fontSize.sm, fontWeight: "600", color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input:          { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.background },
  error:          { color: colors.danger, fontSize: fontSize.sm, marginTop: spacing.sm, textAlign: "center" },
  button:         { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: "center", marginTop: spacing.lg },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: colors.white, fontSize: fontSize.md, fontWeight: "700" },
  footer:         { textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: fontSize.xs, marginTop: spacing.lg },
});