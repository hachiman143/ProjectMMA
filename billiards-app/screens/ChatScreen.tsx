import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      console.log("🔁 Đang gọi Gemini API...", input);

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
        {
          contents: [
            {
              role: "user",
              parts: [{ text: input }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyAHTXdAfcEDOIGYE0G-n-7JAGtsSlyVD0Q", // <== key để trong header
          },
          timeout: 10000,
        }
      );

      console.log("✅ Gemini response:", response.data);

      const aiText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "🤖 Không có phản hồi từ AI.";

      const aiMessage = {
        role: "model",
        content: aiText,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.log("❌ CATCH ERROR:");
      if (err.response) {
        console.log("🔴 err.response.data:", err.response.data);
      } else if (err.request) {
        console.log("🟡 err.request:", err.request);
      } else {
        console.log("⚪️ err.message:", err.message);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "⚠️ Lỗi API: " +
            (err.response?.data?.error?.message || err.message),
        },
      ]);
    }

    setInput("");
  };

  // Auto scroll to bottom when message changes
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <ScrollView
              style={styles.chat}
              contentContainerStyle={{ paddingBottom: 20 }}
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, idx) => (
                <View
                  key={idx}
                  style={msg.role === "user" ? styles.userMsg : styles.aiMsg}
                >
                  <Text style={styles.msgText}>
                    {typeof msg.content === "string"
                      ? msg.content
                      : JSON.stringify(msg.content)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Nhập tin nhắn..."
                value={input}
                onChangeText={setInput}
                multiline
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Ionicons name="send" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chat: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    backgroundColor: "#f5f5f5",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#dbeafe",
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "80%",
  },
  aiMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#e2e8f0",
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "80%",
  },
  msgText: {
    fontSize: 15,
  },
});
