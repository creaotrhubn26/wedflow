import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PlanningScreen from "@/screens/PlanningScreen";
import ScheduleScreen from "@/screens/ScheduleScreen";
import ImportantPeopleScreen from "@/screens/ImportantPeopleScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type PlanningStackParamList = {
  Planning: undefined;
  Schedule: undefined;
  ImportantPeople: undefined;
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
    </Stack.Navigator>
  );
}
