import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { useTheme } from "@/hooks/useTheme";

interface HeaderTitleProps {
  title?: string;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  const { designSettings } = useTheme();
  const logoSource = designSettings.logoUrl
    ? { uri: designSettings.logoUrl }
    : require("../../assets/images/Evendi_logo_norsk_tagline.png");

  return (
    <View style={styles.container}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  logo: {
    width: 300,
    height: 80,
  },
});
