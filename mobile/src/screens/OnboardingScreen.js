import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "bar-chart",
    iconColor: "#D4AF37",
    title: "Track Every Franc",
    subtitle:
      "Monitor bar, kitchen, gym, billiard, and guesthouse revenue in real time — all from your phone.",
    bg: "#0B3D2E",
  },
  {
    id: "2",
    icon: "people",
    iconColor: "#34D399",
    title: "Manage Your Team",
    subtitle:
      "Keep track of employee salaries and loans. Know exactly what you owe and what's been paid.",
    bg: "#0F2D20",
  },
  {
    id: "3",
    icon: "stats-chart",
    iconColor: "#FCD34D",
    title: "Daily & Monthly Reports",
    subtitle:
      "Navigate by date, view time-period stats, and spot low-stock items before they run out.",
    bg: "#0B3D2E",
  },
  {
    id: "4",
    icon: "shield-checkmark",
    iconColor: "#60A5FA",
    title: "Role-Based Access",
    subtitle:
      "Every staff member sees only what they need. Secure, simple, and built for Lacaselo.",
    bg: "#0F2D20",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace("Login");
    }
  };

  const skip = () => navigation.replace("Login");

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.bg }]}>
      <View style={styles.iconWrapper}>
        <Ionicons name={item.icon} size={80} color={item.iconColor} />
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderDots = () =>
    SLIDES.map((_, i) => {
      const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
      const dotWidth = scrollX.interpolate({
        inputRange,
        outputRange: [8, 24, 8],
        extrapolate: "clamp",
      });
      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.3, 1, 0.3],
        extrapolate: "clamp",
      });
      return (
        <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />
      );
    });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B3D2E" />

      {/* Brand header */}
      <View style={styles.brand}>
        <Text style={styles.brandName}>Lacaselo</Text>
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        scrollEventThrottle={16}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>{renderDots()}</View>

        <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons
            name={currentIndex === SLIDES.length - 1 ? "checkmark" : "arrow-forward"}
            size={18}
            color="#fff"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B3D2E" },

  brand: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  brandName: {
    color: "#D4AF37",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
  },
  skipBtn: { padding: 6 },
  skipText: { color: "#9CA3AF", fontSize: 14, fontWeight: "600" },

  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    borderWidth: 2,
    borderColor: "rgba(212,175,55,0.3)",
  },
  slideTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  slideSubtitle: {
    color: "#9CA3AF",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "400",
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D4AF37",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#145A32",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#D4AF37",
    width: "100%",
    justifyContent: "center",
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
