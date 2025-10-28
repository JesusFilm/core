import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import type { GeneratedStepContent } from '../libs/storage'

interface UseUnsplashMediaOptions {
  unsplashApiKey: string
  unsplashImages: Record<string, string[]>
  setUnsplashImages: Dispatch<SetStateAction<Record<string, string[]>>>
  setLoadingUnsplashSteps: Dispatch<SetStateAction<Set<string>>>
  setIsSettingsOpen: (open: boolean) => void
  deriveHeadingFromContent: (content: string, fallback: string) => string
  isEnabled?: boolean
  onBlocked?: (resume: () => Promise<void> | void) => void
}

export const useUnsplashMedia = ({
  unsplashApiKey,
  unsplashImages,
  setUnsplashImages,
  setLoadingUnsplashSteps,
  setIsSettingsOpen,
  deriveHeadingFromContent,
  isEnabled = true,
  onBlocked
}: UseUnsplashMediaOptions) => {
  const searchUnsplash = useCallback(
    async (query: string, perPage: number = 3): Promise<string[]> => {
      const accessKey = unsplashApiKey || process.env.UNSPLASH_ACCESS_KEY

      console.log('🔑 API Key debug:', {
        unsplashApiKey: unsplashApiKey ? `***${unsplashApiKey.slice(-4)}` : 'not set',
        envVar: process.env.UNSPLASH_ACCESS_KEY ? `***${process.env.UNSPLASH_ACCESS_KEY.slice(-4)}` : 'not set',
        accessKey: accessKey ? `***${accessKey.slice(-4)}` : 'not set',
        query
      })

      if (!accessKey) {
        console.error('❌ UNSPLASH_ACCESS_KEY not found in environment variables or settings')
        return []
      }

      try {
        const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=${perPage}&content_filter=high&orientation=squarish&client_id=${accessKey}`
        console.log('🌐 Making API request to:', apiUrl.replace(accessKey, `***${accessKey.slice(-4)}`))

        const response = await fetch(apiUrl)
        console.log('📡 Response status:', response.status, response.statusText)

        if (!response.ok) {
          console.error('❌ Unsplash API error:', response.status, response.statusText)
          const errorText = await response.text()
          console.error('❌ Error response body:', errorText)

          try {
            const errorData = JSON.parse(errorText)
            if (errorData.errors && errorData.errors.includes('OAuth error: The access token is invalid')) {
              console.error('❌ INVALID API KEY: The Unsplash Access Key you entered is invalid.')
              console.error('💡 SOLUTION: Get a new Access Key from https://unsplash.com/developers')
              console.warn('Please check your Unsplash Access Key in Settings and get a new one from https://unsplash.com/developers if needed.')
            }
          } catch {
            // Ignore parse error
          }

          return []
        }

        const data = await response.json()
        console.log(`✅ Unsplash Response for "${query}": ${data.results?.length || 0} images found`)

        if (data.results && data.results.length > 0) {
          console.log('🖼️ First image details:', {
            id: data.results[0].id,
            description: data.results[0].description,
            url: data.results[0].urls?.regular
          })
        }

        const imageUrls = data.results?.map((photo: any) => photo.urls?.regular).filter(Boolean) || []
        console.log(`📸 Extracted ${imageUrls.length} image URLs for "${query}"`)

        return imageUrls
      } catch (error) {
        console.error('💥 Failed to search Unsplash:', error)
        return []
      }
    },
    [unsplashApiKey]
  )

  const loadUnsplashImagesForStep = useCallback(
    async (step: GeneratedStepContent, stepIndex: number) => {
      if (!isEnabled) {
        onBlocked?.(() => loadUnsplashImagesForStep(step, stepIndex))
        return
      }
      if (!step.keywords.length) return

      const stepKey = `step-${stepIndex}`
      if (unsplashImages[stepKey]) return

      setLoadingUnsplashSteps((prev) => new Set(prev).add(stepKey))

      const heading = deriveHeadingFromContent(step.content, `Step ${stepIndex + 1}`)

      try {
        let images: string[] = []

        for (let i = 0; i < step.keywords.length; i++) {
          const keyword = step.keywords[i]
          console.log(
            `🖼️ Loading Unsplash images for Step ${stepIndex + 1}: "${heading}" using keyword ${i + 1}/${step.keywords.length}: "${keyword}"`
          )

          images = await searchUnsplash(keyword, 12)

          if (images.length > 0) {
            console.log(`✅ Found ${images.length} images for Step ${stepIndex + 1} using keyword: "${keyword}"`)
            break
          } else {
            console.log(`❌ No images found for Step ${stepIndex + 1} using keyword: "${keyword}". Trying next keyword...`)
          }
        }

        console.log(`📸 Completed loading ${images.length} images for Step ${stepIndex + 1}`)

        setUnsplashImages((prev) => ({
          ...prev,
          [stepKey]: images
        }))
      } catch (error) {
        console.error('Failed to load Unsplash images for step:', error)
      } finally {
        setLoadingUnsplashSteps((prev) => {
          const newSet = new Set(prev)
          newSet.delete(stepKey)
          return newSet
        })
      }
    },
    [
      deriveHeadingFromContent,
      isEnabled,
      onBlocked,
      searchUnsplash,
      setLoadingUnsplashSteps,
      setUnsplashImages,
      unsplashImages
    ]
  )

  const testUnsplashAPI = useCallback(async () => {
    if (!isEnabled) {
      onBlocked?.(() => testUnsplashAPI())
      return
    }
    console.log('🧪 Testing Unsplash API...')

    if (!unsplashApiKey && !process.env.UNSPLASH_ACCESS_KEY) {
      console.warn('No Unsplash Access Key found. Please enter one in Settings.')
      setIsSettingsOpen(true)
      return
    }

    const testQueries = ['Jesus', 'Bible', 'Church', 'Cross', 'Prayer']
    for (const query of testQueries) {
      const results = await searchUnsplash(query, 1)
      if (results.length > 0) {
        console.log(`✅ Unsplash API works! Found images for "${query}".`)
        return
      }
    }

    console.warn('⚠️ Unsplash API test completed without finding any images. Check your access key or try again later.')
  }, [isEnabled, onBlocked, searchUnsplash, setIsSettingsOpen, unsplashApiKey])

  return { searchUnsplash, loadUnsplashImagesForStep, testUnsplashAPI }
}

export type UseUnsplashMediaReturn = ReturnType<typeof useUnsplashMedia>
