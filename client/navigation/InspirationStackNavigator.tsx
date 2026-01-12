import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import InspirationScreen from "@/screens/InspirationScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type InspirationStackParamList = {
  Inspiration: undefined;
};

const Stack = createNativeStackNavigator<InspirationStackParamList>();

export default function InspirationStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Inspiration"
        component={InspirationScreen}
        options={{
          title: "Inspirasjon",
        }}
      />
    </Stack.Navigator>
  );
}
