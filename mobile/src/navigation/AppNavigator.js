import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useAuthStore } from "../store/authStore";
import { colors } from "../theme";

import LoginScreen     from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import PatientsScreen  from "../screens/PatientsScreen";
import BedsScreen      from "../screens/BedsScreen";
import TasksScreen     from "../screens/TasksScreen";

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const ICONS = { Dashboard: "🏠", Patients: "🛏", Beds: "🗺", Tasks: "📋" };

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border, paddingBottom: 6, height: 60 },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{ICONS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Patients"  component={PatientsScreen} />
      <Tab.Screen name="Beds"      component={BedsScreen} />
      <Tab.Screen name="Tasks"     component={TasksScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const user = useAuthStore((s) => s.user);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user
          ? <Stack.Screen name="Main"  component={MainTabs} />
          : <Stack.Screen name="Login" component={LoginScreen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}