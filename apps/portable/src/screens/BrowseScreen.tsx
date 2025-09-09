import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

interface BrowseScreenProps {
  navigation: any
}

export default function BrowseScreen({ navigation }: BrowseScreenProps) {
  const { t } = useTranslation('common')

  const handlePlaylistPress = (playlistSlug: string) => {
    navigation.navigate('PlaylistDetail', { playlistSlug })
  }

  const handleVideoPress = (videoSlug: string, languageSlug: string) => {
    navigation.navigate('VideoDetail', { videoSlug, languageSlug })
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <Text className="text-3xl font-bold text-gray-900 mb-6">
          {t('browse.title')}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Featured Playlists */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-gray-800 mb-4">
              {t('browse.featuredPlaylists')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                className="bg-blue-500 rounded-lg p-4 mr-4 w-64"
                onPress={() => handlePlaylistPress('featured-series')}
              >
                <Text className="text-white text-lg font-semibold mb-2">
                  {t('browse.featuredSeries')}
                </Text>
                <Text className="text-blue-100 text-sm">
                  {t('browse.featuredSeriesDesc')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-green-500 rounded-lg p-4 mr-4 w-64"
                onPress={() => handlePlaylistPress('tutorials')}
              >
                <Text className="text-white text-lg font-semibold mb-2">
                  {t('browse.tutorials')}
                </Text>
                <Text className="text-green-100 text-sm">
                  {t('browse.tutorialsDesc')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-purple-500 rounded-lg p-4 mr-4 w-64"
                onPress={() => handlePlaylistPress('documentaries')}
              >
                <Text className="text-white text-lg font-semibold mb-2">
                  {t('browse.documentaries')}
                </Text>
                <Text className="text-purple-100 text-sm">
                  {t('browse.documentariesDesc')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Recent Videos */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-gray-800 mb-4">
              {t('browse.recentVideos')}
            </Text>
            <View className="space-y-4">
              <TouchableOpacity
                className="bg-gray-50 rounded-lg p-4"
                onPress={() => handleVideoPress('intro-to-react', 'en')}
              >
                <Text className="text-gray-900 text-lg font-medium mb-2">
                  Introduction to React
                </Text>
                <Text className="text-gray-600 text-sm">
                  Learn the basics of React development
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-50 rounded-lg p-4"
                onPress={() => handleVideoPress('advanced-typescript', 'en')}
              >
                <Text className="text-gray-900 text-lg font-medium mb-2">
                  Advanced TypeScript
                </Text>
                <Text className="text-gray-600 text-sm">
                  Deep dive into TypeScript features
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-50 rounded-lg p-4"
                onPress={() => handleVideoPress('nodejs-best-practices', 'en')}
              >
                <Text className="text-gray-900 text-lg font-medium mb-2">
                  Node.js Best Practices
                </Text>
                <Text className="text-gray-600 text-sm">
                  Production-ready Node.js development
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-gray-800 mb-4">
              {t('browse.categories')}
            </Text>
            <View className="flex-row flex-wrap">
              <TouchableOpacity className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2">
                <Text className="text-blue-800 font-medium">
                  {t('browse.programming')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-green-100 rounded-full px-4 py-2 mr-2 mb-2">
                <Text className="text-green-800 font-medium">
                  {t('browse.design')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-purple-100 rounded-full px-4 py-2 mr-2 mb-2">
                <Text className="text-purple-800 font-medium">
                  {t('browse.business')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-yellow-100 rounded-full px-4 py-2 mr-2 mb-2">
                <Text className="text-yellow-800 font-medium">
                  {t('browse.science')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
