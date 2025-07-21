import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ClubService } from "@/service/club.service";
import FeedbackSection from "./FeedbackSection";

const { width } = Dimensions.get("window");

export default function ClubDetailScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { clubId } = route.params;
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [table, setTable] = useState([]);
  const fetchClub = async () => {
    try {
      const res = await ClubService.getDetailId(clubId);
      setTable(res.data.tables);
      setClub(res?.data?.club);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, [clubId]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  if (!club) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Không tìm thấy thông tin quán!</Text>
      </View>
    );
  }

  const renderTable = (table: any, index: number) => {
    const isSelected = selectedTable === table._id;
    const isAvailable = table.status === "available";

    return (
      <TouchableOpacity
        key={table.id}
        style={[
          styles.tableCard,
          !isAvailable && styles.occupiedTable,
          isSelected && styles.selectedTable,
        ]}
        onPress={() => isAvailable && setSelectedTable(table._id)}
        disabled={!isAvailable}
      >
        <View style={styles.tableHeader}>
          <Text
            style={[
              styles.tableNumber,
              !isAvailable && styles.occupiedText,
              isSelected && styles.selectedText,
            ]}
          >
            Bàn {table.type}
          </Text>
          <View
            style={[
              styles.statusBadge,
              isAvailable ? styles.availableBadge : styles.occupiedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isAvailable ? styles.availableText : styles.occupiedStatusText,
              ]}
            >
              {isAvailable ? "Trống" : "Đang chơi"}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.tableType,
            !isAvailable && styles.occupiedText,
            isSelected && styles.selectedText,
          ]}
        >
          Giá: {table.pricePerHour.toLocaleString()}đ / giờ
        </Text>

        {!isAvailable && table.endTime && (
          <Text style={styles.endTime}>Kết thúc: {table.endTime}</Text>
        )}

        {isAvailable && (
          <TouchableOpacity
            style={[
              styles.bookTableButton,
              isSelected && styles.selectedBookButton,
            ]}
            onPress={() =>
              navigation.navigate("Booking", {
                club: club,
                table: table,
              })
            }
          >
            <Text
              style={[
                styles.bookTableText,
                isSelected && styles.selectedBookText,
              ]}
            >
              Đặt bàn
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: club?.image }} style={styles.clubImage} />

        <View style={styles.clubInfo}>
          <View style={styles.clubHeader}>
            <Text style={styles.clubName}>{club?.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#fbbf24" />
              <Text style={styles.rating}>{club?.rating}</Text>
            </View>
          </View>

          <View style={styles.addressContainer}>
            <Ionicons name="location" size={20} color="#2563eb" />
            <Text style={styles.address}>{club?.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#64748b" />
              <Text style={styles?.infoText}>{"7:00 - 23:00"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>{club?.phone}</Text>
            </View>
          </View>

          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Giá thuê:</Text>
            <Text style={styles.price}>
              {club?.pricePerHour
                ? club?.pricePerHour?.toLocaleString("vi-VN")
                : "?"}
              đ/giờ
            </Text>
          </View>
        </View>

        <View style={styles.tablesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Sơ đồ bàn ({club.availableTables}/{club?.tables} trống)
            </Text>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.availableDot]} />
                <Text style={styles.legendText}>Trống</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.occupiedDot]} />
                <Text style={styles.legendText}>Đang chơi</Text>
              </View>
            </View>
          </View>

          <View style={styles.tablesGrid}>{table?.map(renderTable)}</View>
        </View>
            <FeedbackSection clubId={clubId} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  clubImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#e2e8f0",
  },
  clubInfo: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  clubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clubName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 6,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  address: {
    fontSize: 16,
    color: "#64748b",
    marginLeft: 12,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  priceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  priceLabel: {
    fontSize: 16,
    color: "#64748b",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
  },
  tablesSection: {
    backgroundColor: "white",
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  legend: {
    flexDirection: "row",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  availableDot: {
    backgroundColor: "#10b981",
  },
  occupiedDot: {
    backgroundColor: "#ef4444",
  },
  legendText: {
    fontSize: 12,
    color: "#64748b",
  },
  tablesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tableCard: {
    width: (width - 60) / 2,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  occupiedTable: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  selectedTable: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  tableHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  occupiedText: {
    color: "#64748b",
  },
  selectedText: {
    color: "#2563eb",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableBadge: {
    backgroundColor: "#dcfce7",
  },
  occupiedBadge: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  availableText: {
    color: "#166534",
  },
  occupiedStatusText: {
    color: "#dc2626",
  },
  tableType: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  endTime: {
    fontSize: 12,
    color: "#dc2626",
    marginBottom: 8,
  },
  bookTableButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  selectedBookButton: {
    backgroundColor: "#1d4ed8",
  },
  bookTableText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedBookText: {
    color: "white",
  },
});
