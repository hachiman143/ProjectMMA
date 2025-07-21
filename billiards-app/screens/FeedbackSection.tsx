import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { FeedbackService } from "@/service/feedback.service";
import { Ionicons } from "@expo/vector-icons";

export default function FeedbackSection({ clubId }: { clubId: string }) {
  console.log({ check: clubId });
  const [feedbacks, setFeedbacks] = useState([]);
  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const res = await FeedbackService.getByClub(clubId);
      setFeedbacks(res);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải feedback");
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung đánh giá");
      return;
    }
    try {
      setLoading(true);
      await FeedbackService.create({
        clubId,
        rating,
        content,
      });
      setContent("");
      setRating(5);
      fetchFeedbacks();
      Alert.alert("Thành công", "Đánh giá đã được gửi");
    } catch (err) {
      Alert.alert("Lỗi", "Gửi feedback thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [clubId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đánh giá của bạn</Text>
      <View style={styles.ratingRow}>
        <Text>Đánh giá:</Text>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={24}
            color="#facc15"
            onPress={() => setRating(star)}
          />
        ))}
      </View>
      <TextInput
        placeholder="Nhập nội dung đánh giá..."
        value={content}
        onChangeText={setContent}
        multiline
        style={styles.input}
      />
      <Button title="Gửi đánh giá" onPress={handleSubmit} disabled={loading} />

      <Text style={styles.title}>Tất cả đánh giá</Text>
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.feedbackItem}>
            <Text style={styles.feedbackUser}>
              Người dùng: {item.userId?.name}
            </Text>
            <Text>Sao: {item.rating}</Text>
            <Text>{item.content}</Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString("vi-VN")}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>Chưa có đánh giá</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, padding: 16, backgroundColor: "#fff" },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    minHeight: 60,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
  },
  feedbackItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  feedbackUser: { fontWeight: "bold" },
  time: { color: "#999", fontSize: 12, marginTop: 4 },
});
