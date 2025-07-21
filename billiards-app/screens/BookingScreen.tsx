"use client";

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BookingService } from "@/service/booking.service";
import { TextInput } from "react-native-gesture-handler";

const combos = [
  { id: 1, name: "Combo 2 giờ", hours: 2, price: 90000, discount: 10 },
  { id: 2, name: "Combo 3 giờ", hours: 3, price: 130000, discount: 15 },
  { id: 3, name: "Combo 4 giờ", hours: 4, price: 160000, discount: 20 },
];

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

export default function BookingScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { club, table } = route.params;
  const [bookingType, setBookingType] = useState<"combo" | "hourly">("combo");
  const [selectedCombo, setSelectedCombo] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [hours, setHours] = useState(1);

  const calculatePrice = () => {
    if (bookingType === "combo" && selectedCombo) {
      const combo = combos.find((c) => c.id === selectedCombo);
      return combo?.price || 0;
    }
    return club.pricePerHour * hours;
  };
  console.log({ selectedCombo });
  const handleBooking = async () => {
    if (!selectedTime) {
      Alert.alert("Lỗi", "Vui lòng chọn giờ bắt đầu");
      return;
    }

    const [hourStr, minuteStr] = selectedTime.split(":");
    const now = new Date();

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parseInt(hourStr),
      parseInt(minuteStr)
    );

    const startTime = startDate.toISOString();
    const selectedComboObj = combos.find((c) => c.id === selectedCombo);
    const payload = {
      clubId: String(club._id),
      tableId: String(table._id),
      startTime: startTime,
      duration: hours,
      bookingType: bookingType,
      notes: "Không có",
      comboDetails: {
        name: selectedComboObj?.name,
        hours: selectedComboObj?.hours,
        discount: selectedComboObj?.discount,
        originalPrice: selectedComboObj?.price,
      },
    };

    Alert.alert(
      "Xác nhận đặt bàn",
      `Bạn có chắc chắn muốn đặt bàn ${table.number} tại ${club.name}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đặt bàn",
          onPress: async () => {
            try {
              await BookingService.createBooking(payload);
              Alert.alert("Thành công", "Đặt bàn thành công!", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error("Booking failed:");
              Alert.alert("Lỗi", "Không thể đặt bàn. Vui lòng thử lại sau.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bookingInfo}>
          <Text style={styles.clubName}>{club.name}</Text>
          <Text style={styles.tableInfo}>
            Bàn {table.id} - {table.type}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại đặt bàn</Text>
          <View style={styles.bookingTypeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                bookingType === "combo" && styles.activeTypeButton,
              ]}
              onPress={() => setBookingType("combo")}
            >
              <Ionicons
                name="gift-outline"
                size={20}
                color={bookingType === "combo" ? "white" : "#64748b"}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  bookingType === "combo" && styles.activeTypeButtonText,
                ]}
              >
                Combo tiết kiệm
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                bookingType === "hourly" && styles.activeTypeButton,
              ]}
              onPress={() => setBookingType("hourly")}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={bookingType === "hourly" ? "white" : "#64748b"}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  bookingType === "hourly" && styles.activeTypeButtonText,
                ]}
              >
                Theo giờ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {bookingType === "combo" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn combo</Text>
            {combos.map((combo) => (
              <TouchableOpacity
                key={combo.id}
                style={[
                  styles.comboCard,
                  selectedCombo === combo.id && styles.selectedCombo,
                ]}
                onPress={() => setSelectedCombo(combo.id)}
              >
                <View style={styles.comboInfo}>
                  <Text
                    style={[
                      styles.comboName,
                      selectedCombo === combo.id && styles.selectedText,
                    ]}
                  >
                    {combo.name}
                  </Text>
                  <Text
                    style={[
                      styles.comboDetails,
                      selectedCombo === combo.id && styles.selectedText,
                    ]}
                  >
                    {combo.hours} giờ chơi • Tiết kiệm {combo.discount}%
                  </Text>
                </View>
                <Text
                  style={[
                    styles.comboPrice,
                    selectedCombo === combo.id && styles.selectedText,
                  ]}
                >
                  {combo.price.toLocaleString("vi-VN")}đ
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Số giờ chơi</Text>
            <View style={styles.hoursContainer}>
              <TouchableOpacity
                style={styles.hoursButton}
                onPress={() => setHours(Math.max(1, hours - 1))}
              >
                <Ionicons name="remove" size={20} color="#2563eb" />
              </TouchableOpacity>
              <Text style={styles.hoursText}>{hours} giờ</Text>
              <TouchableOpacity
                style={styles.hoursButton}
                onPress={() => setHours(hours + 1)}
              >
                <Ionicons name="add" size={20} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn giờ bắt đầu</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.selectedTimeSlot,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedTime === time && styles.selectedTimeText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
<View style={styles.voucherSection}>
          <TextInput
            style={styles.voucherInput}
            placeholder="Nhập mã giảm giá"
            // No need for any state or logic, just a placeholder input
          />
        </View>
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tổng tiền:</Text>
            <Text style={styles.totalPrice}>
              {calculatePrice().toLocaleString("vi-VN")}đ
            </Text>
          </View>
          <View style={styles.priceSection}>
  <View style={styles.priceSection}>
  
</View>

</View>

          {bookingType === "combo" && selectedCombo && (
            <Text style={styles.savings}>
              Tiết kiệm{" "}
              {combos.find((c) => c.id === selectedCombo)?.discount || 0}% so
              với giá thường
            </Text>
          )}
        </View>
      </ScrollView>


      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Xác nhận đặt bàn</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    marginRight: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  bookingInfo: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  clubName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  tableInfo: {
    fontSize: 16,
    color: "#64748b",
  },
  section: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  bookingTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeTypeButton: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    marginLeft: 8,
  },
  activeTypeButtonText: {
    color: "white",
  },
  voucherSection: {
    marginTop: 12,
  },
  comboCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCombo: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  comboInfo: {
    flex: 1,
  },
  comboName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  comboDetails: {
    fontSize: 14,
    color: "#64748b",
  },
  comboPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },
  selectedText: {
    color: "#2563eb",
  },
  hoursContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  hoursButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  hoursText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    minWidth: 80,
    textAlign: "center",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedTimeSlot: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  selectedTimeText: {
    color: "white",
  },
  priceSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 18,
    color: "#64748b",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  savings: {
    fontSize: 14,
    color: "#10b981",
    textAlign: "right",
    marginTop: 4,
  },
  bottomContainer: {
    backgroundColor: "white",
    padding: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bookButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
  },
  voucherInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    minHeight: 40,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
  },
});
