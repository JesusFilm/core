import { useRoute } from '@react-navigation/native'
import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface PlaylistScreenProps {
  navigation: any
}

export default function PlaylistScreen({ navigation }: PlaylistScreenProps) {
  const route = useRoute()
  const { playlistSlug } = route.params as { playlistSlug: string }

  // Mock playlist data - in a real app, this would come from GraphQL
  const playlistData = {
    'featured-series': {
      title: 'Featured Series',
      description: 'Our most popular and trending content',
      thumbnail:
        'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Featured+Series',
      videos: [
        {
          id: '1',
          title: 'Introduction to React Native',
          duration: '15:30',
          thumbnail:
            'https://via.placeholder.com/200x120/3b82f6/ffffff?text=React+Native',
          videoSlug: 'intro-react-native',
          languageSlug: 'en',
          description: 'Learn the fundamentals of React Native development'
        },
        {
          id: '2',
          title: 'Advanced TypeScript Patterns',
          duration: '22:15',
          thumbnail:
            'https://via.placeholder.com/200x120/10b981/ffffff?text=TypeScript',
          videoSlug: 'advanced-typescript-patterns',
          languageSlug: 'en',
          description: 'Explore advanced TypeScript design patterns'
        },
        {
          id: '3',
          title: 'GraphQL Best Practices',
          duration: '18:45',
          thumbnail:
            'https://via.placeholder.com/200x120/8b5cf6/ffffff?text=GraphQL',
          videoSlug: 'graphql-best-practices',
          languageSlug: 'en',
          description: 'Learn GraphQL best practices for production'
        }
      ]
    },
    tutorials: {
      title: 'Tutorials',
      description: 'Step-by-step learning content',
      thumbnail:
        'https://via.placeholder.com/300x200/10b981/ffffff?text=Tutorials',
      videos: [
        {
          id: '4',
          title: 'Building Your First App',
          duration: '25:20',
          thumbnail:
            'https://via.placeholder.com/200x120/10b981/ffffff?text=First+App',
          videoSlug: 'building-first-app',
          languageSlug: 'en',
          description: 'Complete guide to building your first mobile app'
        },
        {
          id: '5',
          title: 'State Management with Redux',
          duration: '20:10',
          thumbnail:
            'https://via.placeholder.com/200x120/f59e0b/ffffff?text=Redux',
          videoSlug: 'redux-state-management',
          languageSlug: 'en',
          description: 'Master Redux for state management'
        }
      ]
    },
    documentaries: {
      title: 'Documentaries',
      description: 'Educational and informative content',
      thumbnail:
        'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Documentaries',
      videos: [
        {
          id: '6',
          title: 'The History of Computing',
          duration: '45:30',
          thumbnail:
            'https://via.placeholder.com/200x120/8b5cf6/ffffff?text=History',
          videoSlug: 'history-computing',
          languageSlug: 'en',
          description: 'A comprehensive look at computing history'
        }
      ]
    }
  }

  const playlist =
    playlistData[playlistSlug as keyof typeof playlistData] ||
    playlistData['featured-series']

  const handleVideoPress = (videoSlug: string, languageSlug: string) => {
    navigation.navigate('VideoDetail', { videoSlug, languageSlug })
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Playlist Header */}
        <View className="px-4 py-6">
          <View className="bg-gray-100 rounded-lg p-6 mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {playlist.title}
            </Text>
            <Text className="text-gray-600 text-base mb-4">
              {playlist.description}
            </Text>
            <Text className="text-gray-500 text-sm">
              {playlist.videos.length} videos
            </Text>
          </View>

          {/* Videos List */}
          <View className="space-y-4">
            {playlist.videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                className="bg-gray-50 rounded-lg p-4"
                onPress={() =>
                  handleVideoPress(video.videoSlug, video.languageSlug)
                }
              >
                <View className="flex-row">
                  <View className="w-32 h-20 bg-gray-200 rounded-lg mr-4 overflow-hidden">
                    <Image
                      source={{ uri: video.thumbnail }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-base mb-1">
                      {video.title}
                    </Text>
                    <Text className="text-gray-600 text-sm mb-2">
                      {video.description}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="bg-blue-100 rounded-full px-2 py-1 mr-2">
                        <Text className="text-blue-800 text-xs font-medium">
                          {video.duration}
                        </Text>
                      </View>
                      <View className="bg-gray-200 rounded-full px-2 py-1">
                        <Text className="text-gray-700 text-xs font-medium">
                          Video
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
