import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

// --- Shared Definitions (Normally in a separate constants file) ---
const API_URL = 'http://localhost:3000/api/tasks'; 

interface Task {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
}

const Colors = {
    text: '#1F2937',
    primary: '#2563EB',
    secondary: '#F3F4F6',
    background: '#FFFFFF',
    danger: '#F87171',
};
// -----------------------------------------------------------------

type RootStackParamList = { Home: undefined; Add: undefined; Detail: { taskId: number }; };
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

// --- Components (Defined internally for scope) ---

const Header = ({ title }: { title: string }) => (
  <View style={[styles.header, { backgroundColor: Colors.primary }]}>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const TodoItem = ({ task, onToggle, onPress }: { task: Task, onToggle: (id: number, status: boolean) => void, onPress: (id: number) => void }) => (
  <TouchableOpacity style={styles.listItem} onPress={() => onPress(task.id)}>
    <TouchableOpacity onPress={() => onToggle(task.id, !task.isCompleted)}>
      <Icon 
        name={task.isCompleted ? 'check-box' : 'check-box-outline-blank'} 
        size={24} 
        color={task.isCompleted ? Colors.primary : Colors.text} 
      />
    </TouchableOpacity>
    <Text 
      style={[
        styles.listItemText, 
        { textDecorationLine: task.isCompleted ? 'line-through' : 'none' }
      ]}
      numberOfLines={1}
    >
      {task.title}
    </Text>
  </TouchableOpacity>
);

const FAB = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={[styles.fab, { backgroundColor: Colors.primary }]} onPress={onPress}>
    <Icon name="add" size={28} color="#FFFFFF" />
  </TouchableOpacity>
);

// --- Screen ---

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async (query = '') => {
    try {
      const url = `${API_URL}${query ? `?search=${query}` : ''}`;
      const response = await axios.get<Task[]>(url);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch data on initial load and when search text changes
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(() => {
        fetchTasks(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText, fetchTasks]);

  useEffect(() => {
    // Re-fetch when screen is focused (e.g., returning from Add/Detail screen)
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks(searchText);
    });
    return unsubscribe;
  }, [navigation, fetchTasks, searchText]);

  const handleToggleStatus = async (id: number, status: boolean) => {
    try {
      await axios.put(`${API_URL}/${id}`, { isCompleted: status });
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: status } : t));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks(searchText);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header title="Görevlerim" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={Colors.text} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Görev Ara..."
          placeholderTextColor="#6B7280"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TodoItem 
              task={item} 
              onToggle={handleToggleStatus} 
              onPress={(id) => navigation.navigate('Detail', { taskId: id })}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Henüz görev bulunmamaktadır.</Text>
          }
        />
      )}

      {/* FAB */}
      <FAB onPress={() => navigation.navigate('Add')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 90,
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 10,
    borderRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    backgroundColor: Colors.background,
  },
  listItemText: {
    marginLeft: 10,
    fontSize: 18,
    color: Colors.text,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    borderRadius: 30,
    elevation: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Colors.text,
  }
});

export default HomeScreen;