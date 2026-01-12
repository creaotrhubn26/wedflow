import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "@/screens/ProfileScreen";
import PhotoPlanScreen from "@/screens/PhotoPlanScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import AdminVendorsScreen from "@/screens/AdminVendorsScreen";
import AdminDashboardScreen from "@/screens/AdminDashboardScreen";
import AdminDesignScreen from "@/screens/AdminDesignScreen";
import AdminInspirationsScreen from "@/screens/AdminInspirationsScreen";
import AdminCategoriesScreen from "@/screens/AdminCategoriesScreen";
import AdminSettingsScreen from "@/screens/AdminSettingsScreen";
import VendorLoginScreen from "@/screens/VendorLoginScreen";
import VendorDashboardScreen from "@/screens/VendorDashboardScreen";
import DeliveryCreateScreen from "@/screens/DeliveryCreateScreen";
import InspirationCreateScreen from "@/screens/InspirationCreateScreen";
import VendorRegistrationScreen from "@/screens/VendorRegistrationScreen";
import VendorChatScreen from "@/screens/VendorChatScreen";
import ProductCreateScreen from "@/screens/ProductCreateScreen";
import OfferCreateScreen from "@/screens/OfferCreateScreen";
import NotificationSettingsScreen from "@/screens/NotificationSettingsScreen";
import AboutScreen from "@/screens/AboutScreen";
import SharePartnerScreen from "@/screens/SharePartnerScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ProfileStackParamList = {
  Profile: undefined;
  PhotoPlan: undefined;
  Settings: undefined;
  AdminDashboard: undefined;
  AdminVendors: { adminKey: string };
  AdminDesign: { adminKey: string };
  AdminInspirations: { adminKey: string };
  AdminCategories: { adminKey: string };
  AdminSettings: { adminKey: string };
  VendorLogin: undefined;
  VendorDashboard: undefined;
  DeliveryCreate: undefined;
  InspirationCreate: undefined;
  ProductCreate: undefined;
  OfferCreate: undefined;
  VendorRegistration: undefined;
  VendorChat: { conversationId: string; coupleName: string };
  NotificationSettings: undefined;
  About: undefined;
  SharePartner: undefined;
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
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: "Admin",
        }}
      />
      <Stack.Screen
        name="AdminVendors"
        component={AdminVendorsScreen}
        options={{
          title: "Admin: Leverandører",
        }}
      />
      <Stack.Screen
        name="AdminDesign"
        component={AdminDesignScreen}
        options={{
          title: "Admin: Design",
        }}
      />
      <Stack.Screen
        name="AdminInspirations"
        component={AdminInspirationsScreen}
        options={{
          title: "Admin: Inspirasjoner",
        }}
      />
      <Stack.Screen
        name="AdminCategories"
        component={AdminCategoriesScreen}
        options={{
          title: "Admin: Kategorier",
        }}
      />
      <Stack.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        options={{
          title: "Admin: Innstillinger",
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
        component={DeliveryCreateScreen}
        options={{
          title: "Ny leveranse",
        }}
      />
      <Stack.Screen
        name="InspirationCreate"
        component={InspirationCreateScreen}
        options={{
          title: "Ny inspirasjon",
        }}
      />
      <Stack.Screen
        name="ProductCreate"
        component={ProductCreateScreen}
        options={{
          title: "Nytt produkt",
        }}
      />
      <Stack.Screen
        name="OfferCreate"
        component={OfferCreateScreen}
        options={{
          title: "Nytt tilbud",
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
    </Stack.Navigator>
  );
}
