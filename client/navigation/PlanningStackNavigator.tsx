import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PlanningScreen from "@/screens/PlanningScreen";
import ScheduleScreen from "@/screens/ScheduleScreen";
import ImportantPeopleScreen from "@/screens/ImportantPeopleScreen";
import BudgetScreen from "@/screens/BudgetScreen";
import AITimeScreen from "@/screens/AITimeScreen";
import VendorsScreen from "@/screens/VendorsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type PlanningStackParamList = {
  Planning: undefined;
  Schedule: undefined;
  ImportantPeople: undefined;
  Budget: undefined;
  AITime: undefined;
  Vendors: undefined;
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
          headerTitle: () => <HeaderTitle title="Wedflow" />,
        }}
      />
      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          title: "Kjøreplan",
        }}
      />
      <Stack.Screen
        name="ImportantPeople"
        component={ImportantPeopleScreen}
        options={{
          title: "Viktige personer",
        }}
      />
      <Stack.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          title: "Budsjett",
        }}
      />
      <Stack.Screen
        name="AITime"
        component={AITimeScreen}
        options={{
          title: "AI Tidsberegner",
        }}
      />
      <Stack.Screen
        name="Vendors"
        component={VendorsScreen}
        options={{
          title: "Leverandører",
        }}
      />
    </Stack.Navigator>
  );
}
