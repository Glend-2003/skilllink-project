import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

const SERVICES = [
  {
    id: "1",
    title: "Fontanero",
    description: "Reparación de tuberías y fugas",
    price: "₡10 000",
  },
  {
    id: "2",
    title: "Electricista",
    description: "Instalaciones y reparaciones eléctricas",
    price: "₡15 000",
  },
];

export default function ServicesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Servicios disponibles</Text>

      <FlatList
        data={SERVICES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push("/(tabs)/chat")}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.price}>{item.price}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    marginTop: 6,
    fontWeight: "600",
  },
});