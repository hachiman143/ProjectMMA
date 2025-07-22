import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "@/service/main.service"; // Assuming axiosInstance is already configured
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ navigation, onLogout  }: { navigation: any,  onLogout: () => void }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("/auth/me"); // API to fetch user data
        const userData = response.data.data.user; // Assuming the response format is consistent
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Handle saving the profile changes
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await axiosInstance.put("/users/profile", formData); // API to update user data
      setEditMode(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Handle input field changes
  const handleInputChange = (name: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // If loading, show loading spinner
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.title}>Thông tin cá nhân</Text>
        </View>

        {/* Profile Picture Section */}
        <View style={styles.profilePicContainer}>
          <Image
            source={{ uri: user?.avatar || 'https://dimensions.edu.vn/upload/2025/03/anh-dai-dien-facebook-mac-dinh-001.webp' }} // If no profile picture, show placeholder
            style={styles.profilePic}
          />
          <TouchableOpacity style={styles.editPicButton}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* User Info Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            editable={editMode}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#eee', color: '#888' }]}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            editable={false}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => handleInputChange("phone", value)}
            editable={editMode}
            keyboardType="phone-pad"
          />
        </View>

        {/* Edit/Save Profile Buttons */}
        {editMode ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        ) : (
         <View>
           <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditMode(true)}
          >
            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
            <TouchableOpacity
            style={styles.editButton}
            onPress= {async () => {
              await AsyncStorage.removeItem("token");
    onLogout();
            }}
          >
            <Text style={styles.editButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
         </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 20,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
    textAlign: "center",
  },
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e2e8f0",
  },
  editPicButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2563eb",
    borderRadius: 50,
    padding: 6,
  },
  formContainer: {
    marginHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
  },
  input: {
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
    borderColor: "#e2e8f0",
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  saveButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  editButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default ProfileScreen;
