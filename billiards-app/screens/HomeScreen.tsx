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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ClubService } from "@/service/club.service";



export default function HomeScreen({ navigation }: { navigation: any }) {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
  const fetchData = async () => {
    try {
      const response = await ClubService.getAll();
      setData(response?.data);
    } catch (error) {
      console.log(error);
    }
  };
 useEffect(() => {
    const result = data.filter((club: any) =>
      club.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(result);
  }, [searchText, data]);
  useEffect(() => {
    fetchData();
  }, []);
  const renderClubItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.clubCard}
      onPress={() => navigation.navigate("ClubDetail", { clubId: item._id })}
    >
      <Image source={{ uri: item.image }} style={styles.clubImage} />
      <View style={styles.clubInfo}>
        <View style={styles.clubHeader}>
          <Text style={styles.clubName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#fbbf24" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={16} color="#64748b" />
          <Text style={styles.address}>{item.address}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons
              name="game-controller-outline"
              size={16}
              color="#2563eb"
            />
            <Text style={styles.statText}>
              {item.availableTables}/{item.tables} bàn trống
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="walk-outline" size={16} color="#64748b" />
            <Text style={styles.statText}>{item.distance}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {item.pricePerHour.toLocaleString("vi-VN")}đ/giờ
          </Text>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Đặt bàn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Billiards Manager</Text>
     <TouchableOpacity
  style={styles.profileButton}
  onPress={() => {
    console.log("Navigating to ProfileScreen");
    navigation.navigate("Profile");
  }}
>
  <Ionicons name="person-circle-outline" size={32} color="#2563eb" />
</TouchableOpacity>

      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#64748b"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm quán billiards..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Ionicons name="storefront-outline" size={24} color="#2563eb" />
          <Text style={styles.statNumber}>25</Text>
          <Text style={styles.statLabel}>Quán gần bạn</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="game-controller-outline" size={24} color="#10b981" />
          <Text style={styles.statNumber}>180</Text>
          <Text style={styles.statLabel}>Bàn trống</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Giải đấu</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quán billiards gần bạn</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderClubItem}
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
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  quickStats: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  seeAll: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  clubCard: {
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
  clubImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#e2e8f0",
  },
  clubInfo: {
    padding: 16,
  },
  clubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clubName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginLeft: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  bookButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});
