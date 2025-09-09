import React, { useState } from 'react'
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface SearchScreenProps {
  navigation: any
}

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([
    {
      id: '1',
      title: 'Introduction to React Native',
      type: 'video',
      videoSlug: 'intro-react-native',
      languageSlug: 'en',
      description: 'Learn the fundamentals of React Native development'
    },
    {
      id: '2',
      title: 'Advanced JavaScript Patterns',
      type: 'video',
      videoSlug: 'advanced-js-patterns',
      languageSlug: 'en',
      description: 'Explore advanced JavaScript design patterns'
    },
    {
      id: '3',
      title: 'Web Development Series',
      type: 'playlist',
      playlistSlug: 'web-dev-series',
      description: 'Complete web development course'
    },
    {
      id: '4',
      title: 'Mobile App Design',
      type: 'video',
      videoSlug: 'mobile-app-design',
      languageSlug: 'en',
      description: 'UI/UX design principles for mobile apps'
    }
  ])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // In a real app, this would trigger a GraphQL query
    // For now, we'll filter the mock results
    if (query.length > 0) {
      const filtered = searchResults.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
    }
  }

  const handleResultPress = (result: any) => {
    if (result.type === 'video') {
      navigation.navigate('Playlist', {
        screen: 'VideoDetail',
        params: {
          videoSlug: result.videoSlug,
          languageSlug: result.languageSlug
        }
      })
    } else if (result.type === 'playlist') {
      navigation.navigate('Playlist', {
        screen: 'PlaylistDetail',
        params: { playlistSlug: result.playlistSlug }
      })
    }
  }

  const popularSearches = [
    'React Native',
    'TypeScript',
    'Node.js',
    'GraphQL',
    'Mobile Development',
    'Web Design'
  ]

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Search</Text>

        {/* Search Input */}
        <View className="mb-6">
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900 text-lg"
            placeholder="Search videos, playlists..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>

        {searchQuery.length === 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Popular Searches */}
            <View className="mb-8">
              <Text className="text-xl font-semibold text-gray-800 mb-4">
                Popular Searches
              </Text>
              <View className="flex-row flex-wrap">
                {popularSearches.map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
                    onPress={() => handleSearch(term)}
                  >
                    <Text className="text-gray-700 font-medium">{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Searches */}
            <View className="mb-8">
              <Text className="text-xl font-semibold text-gray-800 mb-4">
                Recent Searches
              </Text>
              <View className="space-y-2">
                <TouchableOpacity
                  className="bg-gray-50 rounded-lg p-4"
                  onPress={() => handleSearch('React Native Tutorial')}
                >
                  <Text className="text-gray-900 font-medium">
                    React Native Tutorial
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-50 rounded-lg p-4"
                  onPress={() => handleSearch('TypeScript Basics')}
                >
                  <Text className="text-gray-900 font-medium">
                    TypeScript Basics
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-50 rounded-lg p-4"
                  onPress={() => handleSearch('GraphQL API')}
                >
                  <Text className="text-gray-900 font-medium">GraphQL API</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                Search Results for "{searchQuery}"
              </Text>
            </View>

            <View className="space-y-4">
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  className="bg-gray-50 rounded-lg p-4"
                  onPress={() => handleResultPress(result)}
                >
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text className="text-gray-900 text-lg font-medium mb-1">
                        {result.title}
                      </Text>
                      <Text className="text-gray-600 text-sm mb-2">
                        {result.description}
                      </Text>
                      <View className="flex-row items-center">
                        <View
                          className={`rounded-full px-2 py-1 ${
                            result.type === 'video'
                              ? 'bg-blue-100'
                              : 'bg-green-100'
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              result.type === 'video'
                                ? 'text-blue-800'
                                : 'text-green-800'
                            }`}
                          >
                            {result.type === 'video' ? 'Video' : 'Playlist'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}
