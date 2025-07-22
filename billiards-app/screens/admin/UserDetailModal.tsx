import { View, Text, TextInput, Button, Modal } from "react-native";
import { useState } from "react";
import { UserService } from "@/service/user.service";
import { Picker } from "@react-native-picker/picker";

export default function UserDetailModal({ user, onClose, onSave }: any) {
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone, role: user.role, isActive: user.isActive });

  const handleChange = (key: string, value: string | boolean) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    await UserService.updateUser(user._id, form);
    onSave();
  };

  return (
    <Modal animationType="slide" transparent={false} visible={true}>
      <View style={{ padding: 16 }}>
        <Text>Sửa người dùng</Text>
        <TextInput placeholder="Tên" value={form.name} onChangeText={(v) => handleChange("name", v)} />
        <TextInput placeholder="Email" value={form.email}  editable={false} // Không cho sửa
      style={{ backgroundColor: "#eee" }} />
      <TextInput placeholder="Điện Thoại" value={form.phone} onChangeText={(v) => handleChange("phone", v)} />
        <TextInput placeholder="Vai trò" value={form.role} editable={false} // Không cho sửa
      style={{ backgroundColor: "#eee" }} />
        <Text>Trạng thái hoạt động</Text>
        <Picker
          selectedValue={form.isActive}
          onValueChange={(value) => handleChange("isActive", value)}
          style={{ height: 50, width: "100%" }}
        >
          <Picker.Item label="Mở Khóa" value={true} />
          <Picker.Item label="Khóa" value={false} />
        </Picker>

        <Button title="Lưu" onPress={handleSubmit} />
        <Button title="Hủy" onPress={onClose} />
      </View>
    </Modal>
  );
}
