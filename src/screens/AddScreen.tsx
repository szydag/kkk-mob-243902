import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

// --- Shared Definitions ---
const API_URL = 'http://localhost:3000/api/tasks'; 

const Colors = {
    text: '#1F2937',
    primary: '#2563EB',
    secondary: '#F3F4F6',
    background: '#FFFFFF',
};
// --------------------------

type RootStackParamList = { Home: undefined; Add: undefined; Detail: { taskId: number }; };
type AddScreenProps = NativeStackScreenProps<RootStackParamList, 'Add'>;

// --- Component Helpers ---

const ScreenHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <View style={[styles.header, { backgroundColor: Colors.primary }]}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Icon name="arrow-back" size={24} color="#FFFFFF" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const InputField = ({ label, placeholder, value, onChangeText, multiline = false }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, multiline && styles.textarea]}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
        />
    </View>
);

// --- Screen ---

const AddScreen: React.FC<AddScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Görev başlığı boş bırakılamaz.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(API_URL, {
        title: title.trim(),
        description: description.trim(),
      });
      
      Alert.alert('Başarılı', 'Yeni görev başarıyla eklendi.');
      navigation.goBack(); 
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert('Hata', 'Görevi kaydederken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Yeni Görev" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Başlık Input */}
        <InputField
            label="Başlık"
            placeholder="Görev Başlığını Girin"
            value={title}
            onChangeText={setTitle}
        />

        {/* Açıklama Textarea */}
        <InputField
            label="Açıklama"
            placeholder="Detaylı açıklama (isteğe bağlı)"
            value={description}
            onChangeText={setDescription}
            multiline={true}
        />

        {/* Kaydet Button */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: Colors.primary }]} 
          onPress={handleSaveTask}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Görevi Kaydet</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
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
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
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

export default AddScreen;