"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TournamentService } from "@/service/tournaments.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TournamentScreen() {
  const [filter, setFilter] = useState<"all" | "open" | "registered">("all");
  const [tournaments, setTournaments] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : null;
        setUserId(user?._id);
      } catch (error) {
        console.error("Error reading user from AsyncStorage:", error);
      }
    };

    fetchUser();
  }, []);
  const fetchData = async () => {
    try {
      const res = await TournamentService.getAll();
      setTournaments(res?.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const filterTournaments = () => {
    if (filter === "all") return tournaments;
    if (filter === "open") {
      return tournaments.filter((t: any) => t.status === "open");
    }
    if (filter === "registered") {
      return tournaments.filter((t: any) =>
        t.participants?.some(
          (p: any) => p.user === userId || p.user?._id === userId
        )
      );
    }
    return tournaments;
  };
  const handleRegister = (tournament: any) => {
    if (tournament.status === "full") {
      Alert.alert("Thông báo", "Giải đấu đã đủ số lượng người tham gia");
      return;
    }

    Alert.alert(
      "Xác nhận đăng ký",
      `Bạn có chắc chắn muốn đăng ký tham gia "${
        tournament.name
      }"?\nPhí tham gia: ${tournament.entryFee.toLocaleString("vi-VN")}đ`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng ký",
          onPress: async () => {
            try {
              await TournamentService.register(tournament._id);
              Alert.alert(
                "Thành công",
                "Đăng ký tham gia giải đấu thành công!"
              );
              fetchData();
            } catch (error) {
              Alert.alert(
                "Lỗi",
                error?.response?.data?.message || "Lỗi hệ thông"
              );
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#10b981";
      case "full":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Đang mở";
      case "full":
        return "Đã đủ";
      default:
        return "Đã đóng";
    }
  };

  const renderTournamentItem = ({ item }: { item: any }) => (
    <View style={styles.tournamentCard}>
      <Image
        source={{ uri: item?.images?.[0] }}
        style={styles.tournamentImage}
      />

      <View style={styles.tournamentInfo}>
        <View style={styles.tournamentHeader}>
          <Text style={styles.tournamentName}>{item?.name}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item?.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item?.status) },
              ]}
            >
              {getStatusText(item?.status)}
            </Text>
          </View>
        </View>

        <View style={styles.clubContainer}>
          <Ionicons name="storefront-outline" size={16} color="#64748b" />
          {/* <Text style={styles.clubName}>{item?.club?.name}</Text> */}
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text style={styles.detailText}>{item?.startDate}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#64748b" />
            <Text style={styles.detailText}>{item?.startTime}</Text>
          </View>
        </View>

        <View style={styles.prizeContainer}>
          <View style={styles.prizeItem}>
            <Ionicons name="trophy-outline" size={16} color="#f59e0b" />
            <Text style={styles.prizeText}>Giải thưởng: {item?.prizePool}</Text>
          </View>
          <View style={styles.prizeItem}>
            <Ionicons name="card-outline" size={16} color="#2563eb" />
            <Text style={styles.entryFeeText}>Phí: {item.entryFee}</Text>
          </View>
        </View>

        <View style={styles.participantsContainer}>
          <View style={styles.participantsInfo}>
            <Ionicons name="people-outline" size={16} color="#64748b" />
            <Text style={styles.participantsText}>
              {item?.participants?.length}/{item.maxParticipants} người tham gia
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    (item?.participants?.length / item?.maxParticipants) * 100
                  }%`,
                  backgroundColor: getStatusColor(item?.status),
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.registerButton,
            item.status === "full" && styles.disabledButton,
          ]}
          onPress={() => handleRegister(item)}
          disabled={item.status === "full"}
        >
          <Text
            style={[
              styles.registerButtonText,
              item.status === "full" && styles.disabledButtonText,
            ]}
          >
            {item.status === "full" ? "Đã đủ người" : "Đăng ký tham gia"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giải đấu</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.activeFilterButton,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "all" && styles.activeFilterButtonText,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "open" && styles.activeFilterButton,
          ]}
          onPress={() => setFilter("open")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "open" && styles.activeFilterButtonText,
            ]}
          >
            Đang mở
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "registered" && styles.activeFilterButton,
          ]}
          onPress={() => setFilter("registered")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "registered" && styles.activeFilterButtonText,
            ]}
          >
            Đã đăng ký
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filterTournaments()}
        renderItem={renderTournamentItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  searchButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeFilterButton: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  activeFilterButtonText: {
    color: "white",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tournamentCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  tournamentImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#e2e8f0",
  },
  tournamentInfo: {
    padding: 16,
  },
  tournamentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  clubContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  clubName: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  detailText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 6,
  },
  prizeContainer: {
    marginBottom: 12,
  },
  prizeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  prizeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f59e0b",
    marginLeft: 6,
  },
  entryFeeText: {
    fontSize: 14,
    color: "#2563eb",
    marginLeft: 6,
  },
  participantsContainer: {
    marginBottom: 16,
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  participantsText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  registerButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#e2e8f0",
  },
  registerButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  disabledButtonText: {
    color: "#64748b",
  },
});
