import { useRoute } from '@react-navigation/native'
import { VideoView, useVideoPlayer } from 'expo-video'
import React, { useRef, useState } from 'react'
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

interface VideoScreenProps {
  navigation: any
}

export default function VideoScreen({ navigation }: VideoScreenProps) {
  const { t } = useTranslation('common')
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const route = useRoute()
  const { videoSlug, languageSlug } = route.params as {
    videoSlug: string
    languageSlug: string
  }

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Calculate responsive video dimensions
  const videoHeight = Math.min(screenWidth * (9 / 16), screenHeight * 0.4) // Max 40% of screen height

  // Mock video data - in a real app, this would come from GraphQL
  const videoData = {
    'intro-react-native': {
      title: 'Introduction to React Native',
      description:
        'Learn the fundamentals of React Native development including components, navigation, and state management.',
      hlsUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Using sample video
      thumbnail:
        'https://via.placeholder.com/400x225/3b82f6/ffffff?text=React+Native+Tutorial',
      duration: '15:30',
      language: 'English',
      category: 'Programming',
      tags: ['React Native', 'Mobile Development', 'JavaScript']
    },
    'advanced-typescript-patterns': {
      title: 'Advanced TypeScript Patterns',
      description:
        'Explore advanced TypeScript design patterns and best practices for large-scale applications.',
      hlsUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail:
        'https://via.placeholder.com/400x225/10b981/ffffff?text=TypeScript+Patterns',
      duration: '22:15',
      language: 'English',
      category: 'Programming',
      tags: ['TypeScript', 'Design Patterns', 'Advanced']
    },
    'graphql-best-practices': {
      title: 'GraphQL Best Practices',
      description:
        'Learn GraphQL best practices for production applications including schema design and performance optimization.',
      hlsUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail:
        'https://via.placeholder.com/400x225/8b5cf6/ffffff?text=GraphQL+Best+Practices',
      duration: '18:45',
      language: 'English',
      category: 'Programming',
      tags: ['GraphQL', 'API Design', 'Best Practices']
    }
  }

  const video =
    videoData[videoSlug as keyof typeof videoData] ||
    videoData['intro-react-native']

  // Create video player with the new expo-video API
  const player = useVideoPlayer(video.hlsUrl, (player: any) => {
    player.loop = false
    player.muted = false
  })

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause()
    } else {
      player.play()
    }
  }

  const handleSeek = (position: number) => {
    // Note: Seek functionality may need to be implemented differently
    // depending on the expo-video API version
    console.log('Seek to:', position)
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Video Player */}
      <View
        className="bg-black"
        style={{
          width: screenWidth,
          height: videoHeight,
          aspectRatio: 16 / 9
        }}
      >
        <VideoView
          player={player}
          style={{
            width: '100%',
            height: '100%'
          }}
          allowsFullscreen
          allowsPictureInPicture
          showsTimecodes
          requiresLinearPlayback={false}
        />
      </View>

      {/* Video Info */}
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="px-4 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {video.title}
          </Text>

          <View className="flex-row items-center mb-4">
            <View className="bg-gray-100 rounded-full px-3 py-1 mr-2">
              <Text className="text-gray-700 text-sm font-medium">
                {video.duration}
              </Text>
            </View>
            <View className="bg-gray-100 rounded-full px-3 py-1 mr-2">
              <Text className="text-gray-700 text-sm font-medium">
                {video.language}
              </Text>
            </View>
            <View className="bg-gray-100 rounded-full px-3 py-1">
              <Text className="text-gray-700 text-sm font-medium">
                {video.category}
              </Text>
            </View>
          </View>

          <Text className="text-gray-700 text-base mb-6 leading-6">
            {video.description}
          </Text>

          {/* Tags */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              {t('video.tags')}
            </Text>
            <View className="flex-row flex-wrap">
              {video.tags.map((tag, index) => (
                <View
                  key={index}
                  className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-blue-800 text-sm font-medium">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Video Controls Info */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              {t('video.videoControls')}
            </Text>
            <Text className="text-gray-600 text-sm mb-2">
              • {t('video.tapToShowControls')}
            </Text>
            <Text className="text-gray-600 text-sm mb-2">
              • {t('video.nativeControls')}
            </Text>
            <Text className="text-gray-600 text-sm">
              • {t('video.hlsSupport')}
            </Text>
          </View>

          {/* Related Videos */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              {t('video.relatedVideos')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity className="bg-gray-100 rounded-lg p-4 mr-4 w-64">
                <Text className="text-gray-900 font-medium mb-2">
                  React Native Navigation
                </Text>
                <Text className="text-gray-600 text-sm">
                  Learn navigation patterns
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-100 rounded-lg p-4 mr-4 w-64">
                <Text className="text-gray-900 font-medium mb-2">
                  State Management
                </Text>
                <Text className="text-gray-600 text-sm">
                  Redux and Context API
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-100 rounded-lg p-4 mr-4 w-64">
                <Text className="text-gray-900 font-medium mb-2">
                  Testing React Native
                </Text>
                <Text className="text-gray-600 text-sm">
                  Unit and integration tests
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
