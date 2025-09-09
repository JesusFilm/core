import { ApolloProvider } from '@apollo/client'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { apolloClient } from '../lib/apollo-client'
import BrowseScreen from '../screens/BrowseScreen'
import PlaylistScreen from '../screens/PlaylistScreen'
import SearchScreen from '../screens/SearchScreen'
import SettingsScreen from '../screens/SettingsScreen'
import VideoScreen from '../screens/VideoScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Stack navigator for playlist and video screens
function PlaylistStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PlaylistDetail"
        component={PlaylistScreen}
        options={{ title: 'Playlist' }}
      />
      <Stack.Screen
        name="VideoDetail"
        component={VideoScreen}
        options={{ title: 'Video' }}
      />
    </Stack.Navigator>
  )
}

// Main tab navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb'
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280'
      }}
    >
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          tabBarLabel: 'Browse'
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search'
        }}
      />
      <Tab.Screen
        name="Playlist"
        component={PlaylistStack}
        options={{
          tabBarLabel: 'Playlist'
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings'
        }}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <ApolloProvider client={apolloClient}>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </ApolloProvider>
  )
}
