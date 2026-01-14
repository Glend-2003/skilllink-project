import { View, Text, StyleSheet, TextInput, FlatList, Pressable } from "react-native";
import { router } from "expo-router";

const CATEGORIES = [
  "Plomería",
  "Electricista",
  "Técnico",
  "Barbería",
  "Mecánica",
  "Diseño",
];

const PROVIDERS = [
  { id: "1", name: "Juan Pérez", category: "Plomería", rating: 4.8 },
  { id: "2", name: "Ana Martínez", category: "Electricista", rating: 4.9 },
  { id: "3", name: "Miguel Torres", category: "Barbería", rating: 4.7 },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Encuentra el profesional que necesitas</Text>
      <Text style={styles.subtitle}>
        Conecta con expertos locales verificados cerca de ti
      </Text>

      <TextInput
        placeholder="¿Qué servicio necesitas?"
        style={styles.search}
      />

      <Text style={styles.section}>Categorías</Text>
      <View style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <View key={cat} style={styles.category}>
            <Text>{cat}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Proveedores destacados</Text>
      <FlatList
        data={PROVIDERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push("/provider")}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>{item.category}</Text>
            <Text>⭐ {item.rating}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { color: "#555", marginBottom: 16 },
  search: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  section: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  category: {
    backgroundColor: "#e2e8f0",
    padding: 10,
    borderRadius: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
});