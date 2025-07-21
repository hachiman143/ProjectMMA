import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { BookingService } from "@/service/booking.service";

export default function BookingHistoryScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "cancelled" | "completed"
  >("all");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await BookingService.getUserBooking();
        setBookings(res.data);
      } catch (err) {
        console.error("Error loading bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#3b82f6";
      default:
        return "#94a3b8";
    }
  };

  const filteredBookings =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.clubName}>{item.club?.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status === "pending"
              ? "Chờ xử lý"
              : item.status === "completed"
              ? "Hoàn tất"
              : item.status === "cancelled"
              ? "Đã hủy"
              : item.status === "confirmed"
              ? "Đã xác nhận"
              : item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.tableName}>
        Bàn: {item.table?.number} ({item.table?.type})
      </Text>

      <Text style={styles.time}>
        {formatTime(item.startTime)} - {formatTime(item.endTime)} |{" "}
        {formatDate(item.startTime)}
      </Text>

      {item.bookingType === "combo" && item.comboDetails?.name ? (
        <Text style={styles.detail}>Combo: {item.comboDetails.name}</Text>
      ) : null}

      <Text style={styles.detail}>
        Tổng tiền: {item.totalPrice.toLocaleString("vi-VN")}đ
      </Text>

      <Text style={styles.detail}>
        Thanh toán: {item.paymentStatus} ({item.paymentMethod})
      </Text>

      {item.notes && <Text style={styles.note}>Ghi chú: {item.notes}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Lịch sử đặt bàn</Text>

      {/* Bộ lọc */}
      <View style={styles.filterContainer}>
        {[
          { key: "all", label: "Tất cả" },
          { key: "pending", label: "Chờ xử lý" },
          { key: "confirmed", label: "Xác nhận" },
          { key: "completed", label: "Hoàn tất" },
          { key: "cancelled", label: "Đã hủy" },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setFilter(key as any)}
            style={[
              styles.filterButton,
              filter === key && styles.activeFilterButton,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === key && styles.activeFilterText,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredBookings.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", marginTop: 20 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingTop: 16,
    color: "#1e293b",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
  activeFilterButton: {
    backgroundColor: "#2563eb",
  },
  filterText: {
    fontSize: 14,
    color: "#475569",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  clubName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  tableName: {
    fontSize: 14,
    color: "#475569",
    marginTop: 2,
  },
  time: {
    fontSize: 14,
    color: "#334155",
    marginVertical: 6,
  },
  detail: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  note: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 6,
    fontStyle: "italic",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
