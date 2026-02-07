import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Config } from '@/constants/Config';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react-native';

interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
  parentCategoryId?: number;
  createdAt: string;
  serviceCount: number;
}

export default function CategoriesManagementScreen() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryDescription: '',
    iconUrl: '',
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/admin/categories`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else if (response.status === 403) {
        Alert.alert('Acceso Denegado', 'No tienes permisos de administrador');
        router.back();
      } else {
        Alert.alert('Error', 'No se pudieron cargar las categorías');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      categoryName: '',
      categoryDescription: '',
      iconUrl: '',
      isActive: true,
      displayOrder: 0,
    });
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      categoryName: category.categoryName,
      categoryDescription: category.categoryDescription || '',
      iconUrl: category.iconUrl || '',
      isActive: category.isActive,
      displayOrder: category.displayOrder,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.categoryName.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es obligatorio');
      return;
    }

    try {
      const url = editingCategory
        ? `${Config.API_GATEWAY_URL}/api/v1/admin/categories/${editingCategory.categoryId}`
        : `${Config.API_GATEWAY_URL}/api/v1/admin/categories`;

      const method = editingCategory ? 'PUT' : 'POST';

      // Only send non-empty fields
      const payload: any = {
        categoryName: formData.categoryName.trim(),
      };

      if (formData.categoryDescription.trim()) {
        payload.categoryDescription = formData.categoryDescription.trim();
      }

      if (formData.iconUrl.trim()) {
        payload.iconUrl = formData.iconUrl.trim();
      }

      payload.isActive = formData.isActive;
      payload.displayOrder = formData.displayOrder;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert(
          'Éxito',
          editingCategory ? 'Categoría actualizada' : 'Categoría creada'
        );
        setModalVisible(false);
        loadCategories();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'No se pudo guardar la categoría');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const handleDelete = (category: Category) => {
    if (category.serviceCount > 0) {
      Alert.alert(
        'No se puede eliminar',
        `Esta categoría tiene ${category.serviceCount} servicio(s) asociado(s). No se puede eliminar.`
      );
      return;
    }

    Alert.alert(
      'Eliminar Categoría',
      `¿Estás seguro de eliminar "${category.categoryName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteCategory(category.categoryId),
        },
      ]
    );
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/admin/categories/${categoryId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert('Éxito', 'Categoría eliminada');
        loadCategories();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'No se pudo eliminar la categoría');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const toggleCategoryStatus = async (categoryId: number) => {
    try {
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/admin/categories/${categoryId}/toggle`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        loadCategories();
      } else {
        Alert.alert('Error', 'No se pudo cambiar el estado');
      }
    } catch (error) {
      console.error('Error toggling category:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.categoryName}>{item.categoryName}</Text>
            <View 
              style={[
                styles.statusBadge,
                { backgroundColor: item.isActive ? '#10b98120' : '#ef444420' }
              ]}
            >
              <Text 
                style={[
                  styles.statusText,
                  { color: item.isActive ? '#10b981' : '#ef4444' }
                ]}
              >
                {item.isActive ? 'Activa' : 'Inactiva'}
              </Text>
            </View>
          </View>
          
          {item.categoryDescription && (
            <Text style={styles.description} numberOfLines={2}>
              {item.categoryDescription}
            </Text>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Orden: {item.displayOrder}
            </Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>
              {item.serviceCount} servicio{item.serviceCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => toggleCategoryStatus(item.categoryId)}
          style={[styles.actionButton, styles.toggleButton]}
        >
          {item.isActive ? (
            <EyeOff size={18} color="#666" />
          ) : (
            <Eye size={18} color="#666" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openEditModal(item)}
          style={[styles.actionButton, styles.editButton]}
        >
          <Edit2 size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={[styles.actionButton, styles.deleteButton]}
          disabled={item.serviceCount > 0}
        >
          <Trash2 size={18} color={item.serviceCount > 0 ? '#ccc' : '#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Gestión de Categorías',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
        }}
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {categories.length} categoría{categories.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            onPress={openCreateModal}
            style={styles.addButton}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Nueva</Text>
          </TouchableOpacity>
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay categorías</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.categoryId.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.form}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.categoryName}
                  onChangeText={(text) => setFormData({ ...formData, categoryName: text })}
                  placeholder="Ej: Plomería, Electricidad"
                />

                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.categoryDescription}
                  onChangeText={(text) => setFormData({ ...formData, categoryDescription: text })}
                  placeholder="Descripción de la categoría"
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.label}>Icono URL</Text>
                <TextInput
                  style={styles.input}
                  value={formData.iconUrl}
                  onChangeText={(text) => setFormData({ ...formData, iconUrl: text })}
                  placeholder="URL del icono (opcional)"
                />

                <Text style={styles.label}>Orden de visualización</Text>
                <TextInput
                  style={styles.input}
                  value={formData.displayOrder.toString()}
                  onChangeText={(text) => setFormData({ ...formData, displayOrder: parseInt(text) || 0 })}
                  placeholder="0"
                  keyboardType="numeric"
                />

                <View style={styles.switchRow}>
                  <Text style={styles.label}>Activa</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleButton: {
    backgroundColor: '#F3F4F6',
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollView: {
    maxHeight: '70%',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  form: {
    paddingBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
