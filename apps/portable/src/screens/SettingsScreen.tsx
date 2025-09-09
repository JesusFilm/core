import React from 'react'
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface SettingsScreenProps {
  navigation: any
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [autoDownloadEnabled, setAutoDownloadEnabled] = React.useState(false)
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false)

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          title: 'Profile',
          subtitle: 'Manage your profile information',
          onPress: () => console.log('Profile pressed')
        },
        {
          title: 'Subscription',
          subtitle: 'Manage your subscription',
          onPress: () => console.log('Subscription pressed')
        },
        {
          title: 'Downloaded Content',
          subtitle: 'View offline content',
          onPress: () => console.log('Downloads pressed')
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          title: 'Notifications',
          subtitle: 'Push notifications',
          type: 'switch',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled
        },
        {
          title: 'Auto Download',
          subtitle: 'Automatically download new content',
          type: 'switch',
          value: autoDownloadEnabled,
          onToggle: setAutoDownloadEnabled
        },
        {
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          type: 'switch',
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled
        }
      ]
    },
    {
      title: 'Video & Audio',
      items: [
        {
          title: 'Video Quality',
          subtitle: 'Auto (Recommended)',
          onPress: () => console.log('Video quality pressed')
        },
        {
          title: 'Audio Quality',
          subtitle: 'High',
          onPress: () => console.log('Audio quality pressed')
        },
        {
          title: 'Download Quality',
          subtitle: 'Medium',
          onPress: () => console.log('Download quality pressed')
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help Center',
          subtitle: 'Get help and support',
          onPress: () => console.log('Help pressed')
        },
        {
          title: 'Contact Us',
          subtitle: 'Send feedback or report issues',
          onPress: () => console.log('Contact pressed')
        },
        {
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          onPress: () => console.log('Privacy pressed')
        },
        {
          title: 'Terms of Service',
          subtitle: 'Read our terms of service',
          onPress: () => console.log('Terms pressed')
        }
      ]
    }
  ]

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Settings</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="mb-8">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                {section.title}
              </Text>

              <View className="bg-gray-50 rounded-lg overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    className={`px-4 py-4 ${
                      itemIndex < section.items.length - 1
                        ? 'border-b border-gray-200'
                        : ''
                    }`}
                    onPress={item.onPress}
                    disabled={item.type === 'switch'}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium text-base mb-1">
                          {item.title}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {item.subtitle}
                        </Text>
                      </View>

                      {item.type === 'switch' ? (
                        <Switch
                          value={item.value}
                          onValueChange={item.onToggle}
                          trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                          thumbColor={item.value ? '#ffffff' : '#ffffff'}
                        />
                      ) : (
                        <Text className="text-gray-400 text-lg">›</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* App Version */}
          <View className="mt-8 mb-4">
            <Text className="text-center text-gray-500 text-sm">
              Portable App v1.0.0
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
