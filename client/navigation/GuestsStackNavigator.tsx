import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import GuestsScreen from "@/screens/GuestsScreen";
import TableSeatingScreen from "@/screens/TableSeatingScreen";
import SpeechListScreen from "@/screens/SpeechListScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type GuestsStackParamList = {
  Guests: undefined;
  TableSeating: undefined;
  SpeechList: undefined;
};

const Stack = createNativeStackNavigator<GuestsStackParamList>();

export default function GuestsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Guests"
        component={GuestsScreen}
        options={{
          title: "Gjester",
        }}
      />
      <Stack.Screen
        name="TableSeating"
        component={TableSeatingScreen}
        options={{
          title: "Bordplassering",
        }}
      />
      <Stack.Screen
        name="SpeechList"
        component={SpeechListScreen}
        options={{
          title: "Taleliste",
        }}
      />
    </Stack.Navigator>
  );
}
