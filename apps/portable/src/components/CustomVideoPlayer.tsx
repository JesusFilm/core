import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native'
import { VideoView, useVideoPlayer } from 'expo-video'
import { Ionicons } from '@expo/vector-icons'

interface CustomVideoPlayerProps {
  videoUrl: string
  onBackPress: () => void
  onFullscreenChange?: (fullscreen: boolean) => void
  style?: object
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function CustomVideoPlayer({
  videoUrl,
  onBackPress,
  style
}: CustomVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0) // in seconds
  const [duration, setDuration] = useState(0) // in seconds
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const videoViewRef = useRef<any>(null)

  // Create video player with autoplay and muted
  const player = useVideoPlayer(videoUrl, (player: any) => {
    player.loop = false
    player.muted = true // Start muted
    player.timeUpdateEventInterval = 1 // Enable time updates every second
    player.play() // Autoplay
  })

  // Set up video event listeners
  useEffect(() => {
    console.log('Setting up video event listeners...')

    const statusSubscription = player.addListener(
      'statusChange',
      (payload: any) => {
        console.log('Status changed:', payload.status)
        if (payload.status === 'readyToPlay') {
          setIsLoading(false)
          setIsPlaying(player.playing)
          // Get duration from player directly (already in seconds)
          if (player.duration) {
            setDuration(player.duration)
          }
        }
      }
    )

    const sourceLoadSubscription = player.addListener(
      'sourceLoad',
      (payload: any) => {
        console.log('Source loaded:', payload)
        setDuration(payload.duration) // Duration is already in seconds
      }
    )

    const playingSubscription = player.addListener(
      'playingChange',
      (payload: any) => {
        console.log('Playing changed:', payload.isPlaying)
        setIsPlaying(payload.isPlaying)
      }
    )

    const timeSubscription = player.addListener(
      'timeUpdate',
      (payload: any) => {
        setCurrentTime(payload.currentTime) // Time is already in seconds
      }
    )

    // Debug: Check player properties directly
    const checkPlayerProperties = () => {
      console.log('Player properties:', {
        status: player.status,
        duration: player.duration,
        playing: player.playing,
        currentTime: player.currentTime
      })
    }

    // Check properties after a short delay
    const timeoutId = setTimeout(checkPlayerProperties, 1000)

    return () => {
      clearTimeout(timeoutId)
      statusSubscription?.remove()
      sourceLoadSubscription?.remove()
      playingSubscription?.remove()
      timeSubscription?.remove()
    }
  }, [player])

  // Auto-hide controls after 3 seconds (only when playing)
  useEffect(() => {
    if (showControls && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        hideControls()
      }, 3000)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [showControls, isPlaying])

  const showControlsOverlay = () => {
    setShowControls(true)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start()
  }

  const hideControls = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setShowControls(false)
    })
  }

  const handleVideoPress = () => {
    if (showControls) {
      hideControls()
    } else {
      showControlsOverlay()
    }
  }

  const handlePlayPause = () => {
    console.log('Play/Pause button pressed, current state:', isPlaying)
    if (isPlaying) {
      player.pause()
    } else {
      player.play()
    }
    // Don't manually set isPlaying - let the playingChange event handle it
  }

  const handleFullscreen = () => {
    console.log('Fullscreen button pressed, current state:', isFullscreen)
    const newFullscreenState = !isFullscreen
    setIsFullscreen(newFullscreenState)

    // Handle platform-specific fullscreen behavior
    if (Platform.OS === 'web') {
      // For web, use the VideoView fullscreen methods
      if (newFullscreenState) {
        videoViewRef.current?.enterFullscreen()
      } else {
        videoViewRef.current?.exitFullscreen()
      }
    } else {
      // For mobile platforms, hide status bar in fullscreen
      StatusBar.setHidden(newFullscreenState, 'fade')
    }
  }

  const handleSeek = (position: number) => {
    player.currentTime = position // Position is already in seconds
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const videoHeight = isFullscreen
    ? screenHeight
    : Math.min(screenWidth * (9 / 16), screenHeight * 0.4)

  return (
    <View
      style={[
        {
          width: isFullscreen ? screenWidth : screenWidth,
          height: videoHeight,
          backgroundColor: '#000',
          position: isFullscreen ? 'absolute' : 'relative',
          top: isFullscreen ? 0 : undefined,
          left: isFullscreen ? 0 : undefined,
          zIndex: isFullscreen ? 9999 : undefined
        },
        style
      ]}
    >
      {/* Video Player */}
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <VideoView
          ref={videoViewRef}
          player={player}
          style={{
            width: '100%',
            height: '100%'
          }}
          nativeControls={false} // Disable native controls completely
          allowsFullscreen={Platform.OS === 'web'} // Allow native fullscreen on web
          allowsPictureInPicture={false}
          showsTimecodes={false}
          requiresLinearPlayback={false}
          useExoShutter={false} // Disable Android ExoPlayer shutter overlay
          contentFit="contain"
          allowsExternalPlayback={false}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}
          >
            <Text style={{ color: 'white', fontSize: 16 }}>Loading...</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              opacity: fadeAnim
            }}
          >
            {/* Top Controls */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: Platform.OS === 'ios' ? 44 : 24,
                paddingHorizontal: 16,
                paddingBottom: 16
              }}
            >
              {/* Back Button */}
              <TouchableOpacity
                onPress={onBackPress}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              {/* Right side controls */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={handleFullscreen}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 8
                  }}
                >
                  <Ionicons
                    name={isFullscreen ? 'contract' : 'expand'}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Center Play Button */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <TouchableOpacity
                onPress={handlePlayPause}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={40}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingHorizontal: 16,
                paddingBottom: Platform.OS === 'ios' ? 34 : 16
              }}
            >
              {/* Time Display */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: 'white', fontSize: 14 }}>
                  {formatTime(currentTime)}
                </Text>
                <Text style={{ color: 'white', fontSize: 14 }}>
                  {formatTime(duration)}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Progress Bar (always visible at bottom) */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: showControls ? 6 : 3,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center'
          }}
        >
          <View
            style={{
              height: showControls ? 4 : 3,
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              backgroundColor: '#ff0000',
              borderRadius: 2
            }}
          />

          {/* Scrubber - only show when controls are visible */}
          {showControls && (
            <View
              style={{
                position: 'absolute',
                left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                top: -1,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#ff0000',
                marginLeft: -4
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}
