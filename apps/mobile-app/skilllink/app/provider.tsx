import { View, Text, StyleSheet, Image, Pressable, FlatList } from "react-native";
import { router } from "expo-router";

const SERVICES = [
  {
    id: "1",
    name: "Reparación de fugas",
    description: "Detección y reparación de fugas de agua",
    price: "₡10 000",
    duration: "1-2 horas",
  },
  {
    id: "2",
    name: "Instalación de calentador",
    description: "Instalación completa de calentador",
    price: "₡20 000",
    duration: "3-4 horas",
  },
];

export default function ProviderProfile() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>Juan Pérez</Text>
          <Text style={styles.category}>Plomería</Text>
          <Text>⭐ 4.8 (127 reseñas)</Text>
          <Text style={styles.available}>● Disponible ahora</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Plomero profesional con más de 10 años de experiencia en reparaciones
        residenciales y comerciales.
      </Text>

      {/* Services */}
      <Text style={styles.sectionTitle}>Servicios</Text>

      <FlatList
        data={SERVICES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.serviceInfo}>
              {item.duration} • {item.price}
            </Text>
          </View>
        )}
      />

      {/* Contact Button */}
      <Pressable
        style={styles.button}
        onPress={() => router.push("/(tabs)/chat")}
      >
        <Text style={styles.buttonText}>Contactar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  category: {
    color: "#555",
  },
  available: {
    color: "green",
    marginTop: 4,
  },
  description: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  serviceCard: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  serviceName: {
    fontWeight: "bold",
  },
  serviceInfo: {
    marginTop: 4,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});