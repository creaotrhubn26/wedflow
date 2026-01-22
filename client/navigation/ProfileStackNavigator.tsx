import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "@/screens/ProfileScreen";
import PhotoPlanScreen from "@/screens/PhotoPlanScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import VendorLoginScreen from "@/screens/VendorLoginScreen";
import VendorDashboardScreen from "@/screens/VendorDashboardScreen";
import VendorCoupleScheduleScreen from "@/screens/VendorCoupleScheduleScreen";
import DeliveryCreateScreen from "@/screens/DeliveryCreateScreen";
import InspirationCreateScreen from "@/screens/InspirationCreateScreen";
import VendorRegistrationScreen from "@/screens/VendorRegistrationScreen";
import VendorChatScreen from "@/screens/VendorChatScreen";
import ProductCreateScreen from "@/screens/ProductCreateScreen";
import OfferCreateScreen from "@/screens/OfferCreateScreen";
import NotificationSettingsScreen from "@/screens/NotificationSettingsScreen";
import AboutScreen from "@/screens/AboutScreen";
import SharePartnerScreen from "@/screens/SharePartnerScreen";
import VendorReviewsScreen from "@/screens/VendorReviewsScreen";
import VendorProfileScreen from "@/screens/VendorProfileScreen";
import FeedbackScreen from "@/screens/FeedbackScreen";
import StatusScreen from "@/screens/StatusScreen";
import WhatsNewScreen from "@/screens/WhatsNewScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ProfileStackParamList = {
  Profile: undefined;
  PhotoPlan: undefined;
  Settings: undefined;
  VendorLogin: undefined;
  VendorDashboard: undefined;
  DeliveryCreate: { delivery?: any } | undefined;
  InspirationCreate: { inspiration?: any } | undefined;
  ProductCreate: { product?: any } | undefined;
  OfferCreate: { offer?: any } | undefined;
  VendorRegistration: undefined;
  VendorChat: { conversationId: string; coupleName: string };
  VendorCoupleSchedule: { coupleId: string; coupleName: string };
  VendorProfile: undefined;
  NotificationSettings: undefined;
  About: undefined;
  SharePartner: undefined;
  VendorReviews: undefined;
  Feedback: undefined;
  Status: undefined;
  WhatsNew: { category?: "vendor" | "couple" };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profil",
        }}
      />
      <Stack.Screen
        name="PhotoPlan"
        component={PhotoPlanScreen}
        options={{
          title: "Fotoplan",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Innstillinger",
        }}
      />
      <Stack.Screen
        name="VendorLogin"
        component={VendorLoginScreen}
        options={{
          title: "Leverandørportal",
        }}
      />
      <Stack.Screen
        name="VendorDashboard"
        component={VendorDashboardScreen}
        options={{
          title: "Leverandørportal",
        }}
      />
      <Stack.Screen
        name="DeliveryCreate"
        component={DeliveryCreateScreen as any}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="InspirationCreate"
        component={InspirationCreateScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductCreate"
        component={ProductCreateScreen as any}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OfferCreate"
        component={OfferCreateScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VendorRegistration"
        component={VendorRegistrationScreen}
        options={{
          title: "Bli leverandør",
        }}
      />
      <Stack.Screen
        name="VendorChat"
        component={VendorChatScreen}
        options={({ route }) => ({
          title: route.params.coupleName,
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="VendorCoupleSchedule"
        component={VendorCoupleScheduleScreen}
        options={({ route }) => ({
          title: `Program – ${route.params.coupleName}`,
        })}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          title: "Varsler",
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: "Om Wedflow",
        }}
      />
      <Stack.Screen
        name="SharePartner"
        component={SharePartnerScreen}
        options={{
          title: "Del med partner",
        }}
      />
      <Stack.Screen
        name="VendorReviews"
        component={VendorReviewsScreen}
        options={{
          title: "Anmeldelser",
        }}
      />
      <Stack.Screen
        name="VendorProfile"
        component={VendorProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          title: "Tilbakemelding",
        }}
      />
      <Stack.Screen
        name="Status"
        component={StatusScreen}
        options={{
          title: "Status",
        }}
      />
      <Stack.Screen
        name="WhatsNew"
        component={WhatsNewScreen}
        options={{
          title: "Hva er nytt",
        }}
      />
    </Stack.Navigator>
  );
}
