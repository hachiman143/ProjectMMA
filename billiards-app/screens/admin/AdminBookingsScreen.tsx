// screens/admin/AdminBookingsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BookingService } from "@/service/booking.service";
import { Ionicons } from "@expo/vector-icons";

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await BookingService.getAllUserBookings();
        setBookings(res); 

    } catch (error) {
      console.error("Lỗi khi lấy danh sách bookings:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await BookingService.updateBookingStatus(id,  newStatus);
      fetchBookings();
    } catch (err: any) {
      Alert.alert("Lỗi", err.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const renderItem = ({ item }: any) => (
        <View style={styles.bookingCard}>
        <Text style={styles.clubName}>{item.club?.name}</Text>
        <Text>Người đặt: {item.user?.name} ({item.user?.email})</Text>
        <Text>Bàn: {item.table?.number}</Text>
        <Text>Trạng thái: {item.status}</Text>
      <View style={styles.actions}>
        {item.status !== "cancelled" && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => updateStatus(item._id, "cancelled")}
          >
            <Text style={styles.buttonText}>Hủy</Text>
          </TouchableOpacity>
        )}
        {item.status === "pending" && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#22c55e" }]}
            onPress={() => updateStatus(item._id, "confirmed")}
          >
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý Đặt Bàn</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  bookingCard: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    marginBottom: 12,
  },
  clubName: { fontWeight: "bold", fontSize: 16 },
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },
  button: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
