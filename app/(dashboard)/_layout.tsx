import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5D603E',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingTop: 10,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          backgroundColor: 'white',
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 25,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'checkbox' : 'checkbox-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="guests"
        options={{
          title: 'Guests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'pie-chart' : 'pie-chart-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}