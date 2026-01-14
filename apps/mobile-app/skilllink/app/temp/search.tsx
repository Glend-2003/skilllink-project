import { View, Text, StyleSheet, TextInput } from "react-native";

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar servicios</Text>
      <TextInput
        placeholder="Buscar por categoría o nombre"
        style={styles.input}
      />
      <Text style={styles.placeholder}>
        Aquí se mostrarán los resultados
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  input: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
  },
  placeholder: {
    marginTop: 20,
    color: "#666",
  },
});