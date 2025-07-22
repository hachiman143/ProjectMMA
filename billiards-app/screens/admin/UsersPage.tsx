import { useEffect, useState } from "react";
import { UserService } from "@/service/user.service";
import { View, Text, FlatList, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import UserDetailModal from "./UserDetailModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    const res = await UserService.getAllUsers({ search });
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = async (id: string) => {
    const res = await UserService.getUser(id);
    setSelectedUser(res.data.user);
    setModalVisible(true);
  };

  const handleDelete = (user: any) => {
    setSelectedUser(user);
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    await UserService.deleteUser(selectedUser._id);
    setConfirmVisible(false);
    fetchUsers();
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="Tìm kiếm theo tên hoặc email"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={fetchUsers}
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1 }}>
            <Text>{item.name} ({item.email})</Text>
            <Text>Vai trò: {item.role}</Text>
            <Text>Trạng thái: {item.isActive ? "Hoạt động" : "Đã khóa"}</Text>
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <Button title="Sửa" onPress={() => handleEdit(item._id)} />
              <View style={{ width: 8 }} />
              <Button title="Xóa" color="red" onPress={() => handleDelete(item)} />
            </View>
          </View>
        )}
      />

      {isModalVisible && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setModalVisible(false)}
          onSave={() => {
            setModalVisible(false);
            fetchUsers();
          }}
        />
      )}

      {isConfirmVisible && (
        <ConfirmDeleteModal
          user={selectedUser}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmVisible(false)}
        />
      )}
    </View>
  );
}
