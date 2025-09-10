import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'

import BrowseScreen from '../screens/BrowseScreen'
import PlaylistScreen from '../screens/PlaylistScreen'
import SearchScreen from '../screens/SearchScreen'
import SettingsScreen from '../screens/SettingsScreen'
import VideoScreen from '../screens/VideoScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Main tab navigator
function TabNavigator() {
  const { t } = useTranslation('common')

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
          title: t('screens.template', { name: t('screens.browse') }),
          tabBarLabel: t('navigation.browse')
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: t('screens.template', { name: t('screens.search') }),
          tabBarLabel: t('navigation.search')
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('screens.template', { name: t('screens.settings') }),
          tabBarLabel: t('navigation.settings')
        }}
      />
    </Tab.Navigator>
  )
}

// Root stack navigator that includes tabs and modal screens
function RootStack() {
  const { t } = useTranslation('common')

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlaylistDetail"
        component={PlaylistScreen}
        options={({ navigation }) => ({
          title: t('screens.template', { name: t('screens.playlist') }),
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                // Check if we can go back, otherwise navigate to Browse tab
                if (navigation.canGoBack()) {
                  navigation.goBack()
                } else {
                  navigation.navigate('MainTabs', { screen: 'Browse' })
                }
              }}
              style={{ marginLeft: 16 }}
            >
              <Text style={{ color: '#3b82f6', fontSize: 16 }}>
                ← {t('common.back')}
              </Text>
            </TouchableOpacity>
          )
        })}
      />
      <Stack.Screen
        name="VideoDetail"
        component={VideoScreen}
        options={({ navigation }) => ({
          title: t('screens.template', { name: t('screens.video') }),
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                // Check if we can go back, otherwise navigate to Browse tab
                if (navigation.canGoBack()) {
                  navigation.goBack()
                } else {
                  navigation.navigate('MainTabs', { screen: 'Browse' })
                }
              }}
              style={{ marginLeft: 16 }}
            >
              <Text style={{ color: '#3b82f6', fontSize: 16 }}>
                ← {t('common.back')}
              </Text>
            </TouchableOpacity>
          )
        })}
      />
    </Stack.Navigator>
  )
}

// Linking configuration for URL-based routing
const linking = {
  prefixes: ['/'], // URL prefix for your app
  config: {
    screens: {
      MainTabs: {
        path: '/',
        screens: {
          Browse: 'browse',
          Search: 'search',
          Settings: 'settings'
        }
      },
      PlaylistDetail: 'playlist/:playlistSlug',
      VideoDetail: 'video/:videoSlug/:languageSlug'
    }
  }
}

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <RootStack />
    </NavigationContainer>
  )
}
