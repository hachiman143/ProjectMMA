import { View, Text, Button, Modal } from "react-native";

export default function ConfirmDeleteModal({ user, onConfirm, onCancel }: any) {
  return (
    <Modal animationType="fade" transparent={true} visible={true}>
      <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 8 }}>
          <Text>Bạn có chắc muốn xóa {user.name} không?</Text>
          <Button title="Xác nhận" color="red" onPress={onConfirm} />
          <Button title="Hủy" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}
