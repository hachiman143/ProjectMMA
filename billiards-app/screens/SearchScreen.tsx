"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ClubService } from "@/service/club.service";

const allClubs = [
  {
    id: "1",
    name: "Billiards Club VIP",
    address: "123 Nguyễn Huệ, Q1, TP.HCM",
    district: "Quận 1",
    rating: 4.8,
    distance: "0.5 km",
    tables: 12,
    availableTables: 8,
    pricePerHour: 50000,
    image: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "2",
    name: "Golden Cue Billiards",
    address: "456 Lê Lợi, Q1, TP.HCM",
    district: "Quận 1",
    rating: 4.6,
    distance: "1.2 km",
    tables: 16,
    availableTables: 12,
    pricePerHour: 45000,
    image: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "3",
    name: "Royal Billiards Lounge",
    address: "789 Trần Hưng Đạo, Q5, TP.HCM",
    district: "Quận 5",
    rating: 4.9,
    distance: "2.1 km",
    tables: 20,
    availableTables: 15,
    pricePerHour: 60000,
    image: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "4",
    name: "Elite Billiards Center",
    address: "321 Võ Văn Tần, Q3, TP.HCM",
    district: "Quận 3",
    rating: 4.7,
    distance: "1.8 km",
    tables: 14,
    availableTables: 10,
    pricePerHour: 55000,
    image: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "5",
    name: "Champion Billiards Hall",
    address: "654 Nguyễn Thị Minh Khai, Q3, TP.HCM",
    district: "Quận 3",
    rating: 4.5,
    distance: "2.5 km",
    tables: 18,
    availableTables: 14,
    pricePerHour: 48000,
    image: "/placeholder.svg?height=120&width=200",
  },
];

const districts = ["Tất cả", "Hoàn kiếm", "Ba Đình", "Quận 5", "Quận 7", "Quận 10"];

export default function SearchScreen({ navigation }: { navigation: any }) {
  const [searchText, setSearchText] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Tất cả");
  const [filteredClubs, setFilteredClubs] = useState(allClubs);
  const [data, setData] = useState([]);
  const fetchData = async () => {
    try {
      const response = await ClubService.getAll();
      setData(response?.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
     fetchData()
  }, [])
  useEffect(() => {
   
    if (data.length > 0) {
      setFilteredClubs(data);
    }
  }, [data,searchText ]);
  const handleSearch = (text: string) => {
    setSearchText(text);
    filterClubs(text, selectedDistrict);
  };
console.log({filteredClubs})
  const handleDistrictFilter = (district: string) => {
    setSelectedDistrict(district);
    filterClubs(searchText, district);
  };

  const filterClubs = (text: string, district: string) => {
    let filtered = data;

    if (text) {
      filtered = filtered.filter(
        (club) =>
          club.name?.toLowerCase().includes(text.toLowerCase()) ||
          club.address?.toLowerCase().includes(text.toLowerCase())
      );
    }

    if (district !== "Tất cả") {
      filtered = filtered.filter((club) =>
        club.address?.toLowerCase().includes(district.toLowerCase())
      );
    }

    setFilteredClubs(filtered);
  };

  const renderClubItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.clubCard}
      onPress={() => navigation.navigate("ClubDetail", { club: item })}
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
              {item.availableTables}/{item.totalTables} bàn trống
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
            <Text style={styles.bookButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDistrictFilter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.districtButton,
        selectedDistrict === item && styles.activeDistrictButton,
      ]}
      onPress={() => handleDistrictFilter(item)}
    >
      <Text
        style={[
          styles.districtButtonText,
          selectedDistrict === item && styles.activeDistrictButtonText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
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
          placeholder="Tìm kiếm theo tên quán hoặc địa chỉ..."
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleSearch("")}
          >
            <Ionicons name="close-circle" size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Lọc theo khu vực:</Text>
        <FlatList
          data={districts}
          renderItem={renderDistrictFilter}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.districtList}
        />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredClubs.length} kết quả
          {searchText ? ` cho "${searchText}"` : ""}
        </Text>
      </View>

      <FlatList
        data={filteredClubs}
        renderItem={renderClubItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyText}>
              Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
            </Text>
          </View>
        }
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
  clearButton: {
    padding: 4,
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  districtList: {
    paddingRight: 20,
  },
  districtButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeDistrictButton: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  districtButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  activeDistrictButtonText: {
    color: "white",
  },
  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    color: "#64748b",
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
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
