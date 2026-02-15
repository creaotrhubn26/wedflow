import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import SplashScreen from "@/screens/SplashScreen";
import CoupleLoginScreen from "@/screens/CoupleLoginScreen";
import VendorLoginScreen from "@/screens/VendorLoginScreen";
import VendorRegistrationScreen from "@/screens/VendorRegistrationScreen";
import VendorDashboardScreen from "@/screens/VendorDashboardScreen";
import VendorPaymentScreen from "@/screens/VendorPaymentScreen";
import VendorAvailabilityScreen from "@/screens/VendorAvailabilityScreen";
import VendorAdminChatScreen from "@/screens/VendorAdminChatScreen";
import VendorProfileScreen from "@/screens/VendorProfileScreen";
import DeliveryCreateScreen from "@/screens/DeliveryCreateScreen";
import InspirationCreateScreen from "@/screens/InspirationCreateScreen";
import ProductCreateScreen from "@/screens/ProductCreateScreen";
import OfferCreateScreen from "@/screens/OfferCreateScreen";
import VendorChatScreen from "@/screens/VendorChatScreen";
import AdminLoginScreen from "@/screens/AdminLoginScreen";
import AdminDashboardScreen from "@/screens/AdminDashboardScreen";
import AdminVendorsScreen from "@/screens/AdminVendorsScreen";
import AdminDesignScreen from "@/screens/AdminDesignScreen";
import AdminInspirationsScreen from "@/screens/AdminInspirationsScreen";
import AdminCategoriesScreen from "@/screens/AdminCategoriesScreen";
import AdminSettingsScreen from "@/screens/AdminSettingsScreen";
import AdminChecklistsScreen from "@/screens/AdminChecklistsScreen";
import AdminVendorChatsScreen from "@/screens/AdminVendorChatsScreen";
import AdminVendorMessagesScreen from "@/screens/AdminVendorMessagesScreen";
import AdminFAQScreen from "@/screens/AdminFAQScreen";
import AdminAppSettingsScreen from "@/screens/AdminAppSettingsScreen";
import AdminWhatsNewScreen from "@/screens/AdminWhatsNewScreen";
import AdminVideoGuidesScreen from "@/screens/AdminVideoGuidesScreen";
import AdminSubscriptionsScreen from "@/screens/AdminSubscriptionsScreen";
import AdminPreviewScreen from "@/screens/AdminPreviewScreen";
import StatusScreen from "@/screens/StatusScreen";
import VendorHelpScreen from "@/screens/VendorHelpScreen";
import WhatsNewScreen from "@/screens/WhatsNewScreen";
import DocumentationScreen from "@/screens/DocumentationScreen";
import VideoGuidesScreen from "@/screens/VideoGuidesScreen";
import AdminSmokeTestScreen from "@/screens/AdminSmokeTestScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import {
  VenueDetailsScreen,
  PhotographerDetailsScreen,
  FloristDetailsScreen,
  CateringDetailsScreen,
  MusicDetailsScreen,
  CakeDetailsScreen,
  BeautyDetailsScreen,
  TransportDetailsScreen,
  PlannerDetailsScreen,
} from "@/screens/vendor-details";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  VendorLogin: undefined;
  VendorDashboard: undefined;
  VendorProfile: undefined;
  VendorRegistration: undefined;
  VendorPayment: undefined;
  VendorAvailability: undefined;
  // Vendor detail screens
  VenueDetails: undefined;
  PhotographerDetails: undefined;
  FloristDetails: undefined;
  CateringDetails: undefined;
  MusicDetails: undefined;
  CakeDetails: undefined;
  BeautyDetails: undefined;
  TransportDetails: undefined;
  PlannerDetails: undefined;
  DeliveryCreate: { delivery?: any };
  InspirationCreate: undefined;
  ProductCreate: { product?: any };
  OfferCreate: undefined;
  VendorChat: { conversationId: string; coupleName: string };
  VendorAdminChat: undefined;
  VendorHelp: undefined;
  AdminLogin: undefined;
  AdminMain: { adminKey: string };
  AdminVendors: { adminKey: string };
  AdminDesign: { adminKey: string };
  AdminInspirations: { adminKey: string };
  AdminCategories: { adminKey: string };
  AdminSettings: { adminKey: string };
  AdminChecklists: { adminKey: string };
  AdminFAQ: { adminKey: string };
  AdminAppSettings: { adminKey: string };
  AdminWhatsNew: { adminKey: string };
  AdminVideoGuides: { adminKey: string };
  AdminSubscriptions: { adminKey: string };
  AdminPreview: { adminKey: string };
  AdminVendorChats: { adminKey: string };
  AdminVendorMessages: { conversationId: string; vendorName: string; adminKey: string };
  Status: undefined;
  WhatsNew: { category?: "vendor" | "couple" };
  Documentation: undefined;
  VideoGuides: undefined;
  AdminSmokeTest: { adminKey: string };
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

export default function RootStackNavigator({ skipSplash = false }: { skipSplash?: boolean }) {
  console.log("[RootStackNavigator] Mounting with skipSplash:", skipSplash);
  const screenOptions = useScreenOptions();
  const [showSplash, setShowSplash] = useState(!skipSplash);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[RootStackNavigator] useEffect - skipSplash:", skipSplash);
    const checkAuth = async () => {
      try {
        const session = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
        console.log("[RootStackNavigator] Session found:", !!session);
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error("[RootStackNavigator] Error checking auth:", error);
        setIsLoggedIn(false);
      }
      console.log("[RootStackNavigator] Setting isLoading = false");
      setIsLoading(false);
    };

    if (skipSplash) {
      // Skip splash and check auth immediately
      console.log("[RootStackNavigator] Skipping splash");
      setShowSplash(false);
      checkAuth();
    } else {
      // Show splash for 3.5 seconds, then check auth
      console.log("[RootStackNavigator] Showing splash for 3.5s");
      const timer = setTimeout(() => {
        console.log("[RootStackNavigator] Splash timeout complete");
        setShowSplash(false);
        checkAuth();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [skipSplash]);

  console.log("[RootStackNavigator] State - isLoading:", isLoading, "showSplash:", showSplash, "isLoggedIn:", isLoggedIn);

  if (isLoading || showSplash) {
    console.log("[RootStackNavigator] Rendering Splash screen");
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    );
  }

  console.log("[RootStackNavigator] Rendering main navigator - isLoggedIn:", isLoggedIn);

  return (
    <Stack.Navigator 
      screenOptions={screenOptions}
      initialRouteName={!isLoggedIn ? "Login" : "Main"}
    >
      {!isLoggedIn ? (
        <>
          <Stack.Screen
            name="Login"
            options={{
              headerShown: false,
            }}
          >
            {(props) => (
              <CoupleLoginScreen
                {...props}
                onLoginSuccess={() => setIsLoggedIn(true)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="VendorLogin"
            component={VendorLoginScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="VendorRegistration"
            component={VendorRegistrationScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="VendorDashboard"
            component={VendorDashboardScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="VendorPayment"
            component={VendorPaymentScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="VendorAvailability"
            component={VendorAvailabilityScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="VendorProfile"
            component={VendorProfileScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          {/* Vendor Category Detail Screens */}
          <Stack.Screen
            name="VenueDetails"
            component={VenueDetailsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="PhotographerDetails"
            component={PhotographerDetailsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="FloristDetails"
            component={FloristDetailsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="CateringDetails"
            component={CateringDetailsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="MusicDetails"
            component={MusicDetailsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="CakeDetails"
            component={CakeDetailsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="BeautyDetails"
            component={BeautyDetailsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="TransportDetails"
            component={TransportDetailsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="PlannerDetails"
            component={PlannerDetailsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="DeliveryCreate"
            component={DeliveryCreateScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="InspirationCreate"
            component={InspirationCreateScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="ProductCreate"
            component={ProductCreateScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="OfferCreate"
            component={OfferCreateScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="VendorChat"
            component={VendorChatScreen as any}
            options={({ route }) => ({
              title: route.params?.coupleName || "Chat",
              headerBackVisible: false,
              presentation: "modal",
            })}
          />
          <Stack.Screen
            name="AdminLogin"
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          >
            {(props) => (
              <AdminLoginScreen
                {...props}
                onLoginSuccess={() => {}}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="AdminMain"
            component={AdminDashboardScreen}
            options={{
              headerShown: true,
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_norsk_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="AdminVendors"
            component={AdminVendorsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AdminDesign"
            component={AdminDesignScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AdminInspirations"
            component={AdminInspirationsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AdminCategories"
            component={AdminCategoriesScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AdminSettings"
            component={AdminSettingsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AdminChecklists"
            component={AdminChecklistsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AdminFAQ"
            component={AdminFAQScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_norsk_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="AdminAppSettings"
            component={AdminAppSettingsScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_norsk_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="AdminWhatsNew"
            component={AdminWhatsNewScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_norsk_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="AdminVideoGuides"
            component={AdminVideoGuidesScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_english_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="AdminSubscriptions"
            component={AdminSubscriptionsScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_english_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="AdminPreview"
            component={AdminPreviewScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_english_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="WhatsNew"
            component={WhatsNewScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_english_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="AdminVendorChats"
            component={AdminVendorChatsScreen as any}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AdminVendorMessages"
            component={AdminVendorMessagesScreen as any}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="VendorAdminChat"
            component={VendorAdminChatScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_english_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="VendorHelp"
            component={VendorHelpScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_english_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="Status"
            component={StatusScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_english_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="Documentation"
            component={DocumentationScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_english_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="VideoGuides"
            component={VideoGuidesScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("../../assets/images/Evendi_logo_english_tagline.png")}
                  style={{ width: 300, height: 80 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Stack.Screen
            name="AdminSmokeTest"
            component={AdminSmokeTestScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
}
