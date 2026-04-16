import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useTheme } from "../../services/theme";

function TabIcon({
  icon,
  label,
  focused,
  color,
}: {
  icon: string;
  label: string;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.55 }]}>{icon}</Text>
      <Text
        style={[
          styles.tabLabel,
          { color, fontWeight: focused ? "700" : "500" },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { colors, mode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === "ios" ? 84 : 68,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          elevation: 0,
          shadowColor: mode === "dark" ? "#000" : "#00000020",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: mode === "dark" ? 0.4 : 0.08,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🏠" label="Home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🧠" label="Coach" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="📊" label="Progress" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="👤" label="Profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    gap: 2,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
