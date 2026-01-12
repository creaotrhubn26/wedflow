import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PlanningScreen from "@/screens/PlanningScreen";
import ScheduleScreen from "@/screens/ScheduleScreen";
import ImportantPeopleScreen from "@/screens/ImportantPeopleScreen";
import BudgetScreen from "@/screens/BudgetScreen";
import AITimeScreen from "@/screens/AITimeScreen";
import VendorsScreen from "@/screens/VendorsScreen";
import TimelineScreen from "@/screens/TimelineScreen";
import StressTrackerScreen from "@/screens/StressTrackerScreen";
import BudgetScenariosScreen from "@/screens/BudgetScenariosScreen";
import TraditionsScreen from "@/screens/TraditionsScreen";
import ChecklistScreen from "@/screens/ChecklistScreen";
import WeatherScreen from "@/screens/WeatherScreen";
import VendorRegistrationScreen from "@/screens/VendorRegistrationScreen";
import AdminVendorsScreen from "@/screens/AdminVendorsScreen";
import DeliveryAccessScreen from "@/screens/DeliveryAccessScreen";
import MessagesScreen from "@/screens/MessagesScreen";
import CoupleLoginScreen from "@/screens/CoupleLoginScreen";
import ChatScreen from "@/screens/ChatScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type PlanningStackParamList = {
  Planning: undefined;
  Schedule: undefined;
  ImportantPeople: undefined;
  Budget: undefined;
  AITime: undefined;
  Vendors: undefined;
  Timeline: undefined;
  StressTracker: undefined;
  BudgetScenarios: undefined;
  Traditions: undefined;
  Checklist: undefined;
  Weather: undefined;
  VendorRegistration: undefined;
  AdminVendors: undefined;
  DeliveryAccess: undefined;
  Messages: undefined;
  CoupleLogin: undefined;
  Chat: { conversationId: string; vendorName: string };
};

const Stack = createNativeStackNavigator<PlanningStackParamList>();

export default function PlanningStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Planning"
        component={PlanningScreen}
        options={{
          headerTitle: () => <HeaderTitle />,
        }}
      />
      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: "Kjøreplan" }}
      />
      <Stack.Screen
        name="ImportantPeople"
        component={ImportantPeopleScreen}
        options={{ title: "Viktige personer" }}
      />
      <Stack.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ title: "Budsjett" }}
      />
      <Stack.Screen
        name="AITime"
        component={AITimeScreen}
        options={{ title: "AI Tidsberegner" }}
      />
      <Stack.Screen
        name="Vendors"
        component={VendorsScreen}
        options={{ title: "Leverandører" }}
      />
      <Stack.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{ title: "Tidslinje" }}
      />
      <Stack.Screen
        name="StressTracker"
        component={StressTrackerScreen}
        options={{ title: "Avspenning" }}
      />
      <Stack.Screen
        name="BudgetScenarios"
        component={BudgetScenariosScreen}
        options={{ title: "Hva om...?" }}
      />
      <Stack.Screen
        name="Traditions"
        component={TraditionsScreen}
        options={{ title: "Tradisjoner" }}
      />
      <Stack.Screen
        name="Checklist"
        component={ChecklistScreen}
        options={{ title: "Sjekkliste" }}
      />
      <Stack.Screen
        name="Weather"
        component={WeatherScreen}
        options={{ title: "Værvarsel" }}
      />
      <Stack.Screen
        name="VendorRegistration"
        component={VendorRegistrationScreen}
        options={{ title: "Bli leverandør" }}
      />
      <Stack.Screen
        name="AdminVendors"
        component={AdminVendorsScreen}
        options={{ title: "Administrer leverandører" }}
      />
      <Stack.Screen
        name="DeliveryAccess"
        component={DeliveryAccessScreen}
        options={{ title: "Hent leveranse" }}
      />
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: "Meldinger" }}
      />
      <Stack.Screen
        name="CoupleLogin"
        component={CoupleLoginScreen}
        options={{ title: "Logg inn" }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params.vendorName })}
      />
    </Stack.Navigator>
  );
}
