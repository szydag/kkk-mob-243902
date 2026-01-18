import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

// --- Shared Definitions ---
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
// --------------------------

type RootStackParamList = { Home: undefined; Add: undefined; Detail: { taskId: number }; };
type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;

// --- Component Helpers ---

const ScreenHeader = ({ title, onBack, onDelete }: { title: string, onBack: () => void, onDelete: () => void }) => (
  <View style={[detailStyles.header, { backgroundColor: Colors.primary }]}>
    <TouchableOpacity onPress={onBack} style={detailStyles.backButton}>
      <Icon name="arrow-back" size={24} color="#FFFFFF" />
    </TouchableOpacity>
    <Text style={detailStyles.headerTitle}>{title}</Text>
    <View style={detailStyles.actions}>
        <TouchableOpacity onPress={onDelete}>
            <Icon name="delete" size={24} color={Colors.danger} />
        </TouchableOpacity>
    </View>
  </View>
);

const InputField = (props: any) => (
    <View style={detailStyles.inputGroup}>
        <Text style={detailStyles.label}>{props.label}</Text>
        <TextInput
            style={[detailStyles.input, props.multiline && detailStyles.textarea]}
            placeholderTextColor="#9CA3AF"
            value={props.value}
            onChangeText={props.onChangeText}
            multiline={props.multiline}
            numberOfLines={props.multiline ? 4 : 1}
        />
    </View>
);

const ToggleSwitch = ({ label, value, onValueChange, color }: { label: string, value: boolean, onValueChange: (v: boolean) => void, color: string }) => (
    <View style={detailStyles.toggleContainer}>
        <Text style={detailStyles.label}>{label}</Text>
        <Switch 
            trackColor={{ false: Colors.secondary, true: color }}
            thumbColor={'#FFFFFF'}
            onValueChange={onValueChange}
            value={value}
        />
    </View>
);

// --- Screen ---

const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<Task>(`${API_URL}/${taskId}`);
      const fetchedTask = response.data;
      setTitle(fetchedTask.title);
      setDescription(fetchedTask.description || '');
      setIsCompleted(fetchedTask.isCompleted);
    } catch (error) {
      console.error("Fetch Detail Error:", error);
      Alert.alert('Hata', 'Görev detayları yüklenemedi.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [taskId, navigation]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleUpdateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık boş olamaz.');
      return;
    }
    setSaving(true);
    try {
      await axios.put(`${API_URL}/${taskId}`, {
        title: title.trim(),
        description: description.trim(),
        isCompleted,
      });
      Alert.alert('Başarılı', 'Görev başarıyla güncellendi.');
      navigation.goBack();
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert('Hata', 'Görevi güncellerken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = () => {
    Alert.alert(
      'Onay',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: performDelete },
      ]
    );
  };

  const performDelete = async () => {
    try {
        await axios.delete(`${API_URL}/${taskId}`);
        Alert.alert('Başarılı', 'Görev silindi.');
        navigation.goBack();
    } catch (error) {
        console.error("Delete Error:", error);
        Alert.alert('Hata', 'Görevi silerken bir sorun oluştu.');
    }
  };


  if (loading) {
    return (
      <View style={[detailStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={detailStyles.container}>
      <ScreenHeader 
        title="Görevi Düzenle" 
        onBack={() => navigation.goBack()} 
        onDelete={handleDeleteTask}
      />
      <ScrollView contentContainerStyle={detailStyles.content}>
        
        {/* Başlık Input */}
        <InputField
            label="Başlık"
            value={title}
            onChangeText={setTitle}
        />

        {/* Açıklama Textarea */}
        <InputField
            label="Açıklama"
            value={description}
            onChangeText={setDescription}
            multiline={true}
        />

        {/* Toggle */}
        <ToggleSwitch
            label="Tamamlandı"
            value={isCompleted}
            onValueChange={setIsCompleted}
            color={Colors.primary}
        />

        {/* Güncelle Button */}
        <TouchableOpacity 
          style={[detailStyles.button, { backgroundColor: Colors.primary }]} 
          onPress={handleUpdateTask}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={detailStyles.buttonText}>Güncelle</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const detailStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        height: 90,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 15,
        paddingBottom: 15,
        justifyContent: 'space-between',
    },
    backButton: {
        position: 'absolute',
        left: 15,
        bottom: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
    },
    actions: {
        position: 'absolute',
        right: 15,
        bottom: 15,
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: Colors.text,
        marginBottom: 5,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.secondary,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: Colors.secondary,
        color: Colors.text,
    },
    textarea: {
        height: 100,
        textAlignVertical: 'top',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 30,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default DetailScreen;