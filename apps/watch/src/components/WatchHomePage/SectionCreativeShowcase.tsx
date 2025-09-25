import { type ReactElement, useMemo, useState } from 'react'

import { Button } from '../Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../Select'

const HEART_RECORD_IT_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'

const styleOptions = [
  { value: 'animated', label: 'Animated' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: '3d', label: '3-D Movie' }
] as const

type VideoStyle = (typeof styleOptions)[number]['value']

type LanguageOption = {
  value: string
  label: string
  description: string
  videos: Record<VideoStyle, string>
}

const languageOptions: LanguageOption[] = [
  {
    value: 'english',
    label: 'English',
    description:
      'Discover production-ready assets narrated in English for quick previews and pitches.',
    videos: {
      animated:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      cinematic:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      '3d':
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    }
  },
  {
    value: 'spanish',
    label: 'Spanish',
    description:
      'Preview localized storytelling moments voiced in Spanish to align creative direction.',
    videos: {
      animated:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      cinematic:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      '3d':
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    }
  },
  {
    value: 'portuguese',
    label: 'Portuguese',
    description:
      'Review the expressive Portuguese mixes to validate tone, timing, and ADR pacing.',
    videos: {
      animated:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      cinematic:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      '3d':
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    }
  }
]

const defaultLanguage = languageOptions[0]
const defaultStyle: VideoStyle = styleOptions[0].value

export function SectionCreativeShowcase(): ReactElement {
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>(defaultStyle)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    defaultLanguage.value
  )

  const activeLanguage = useMemo(
    () =>
      languageOptions.find((language) => language.value === selectedLanguage) ??
      defaultLanguage,
    [selectedLanguage]
  )

  const activeVideoSource = activeLanguage.videos[selectedStyle]

  return (
    <section
      aria-labelledby="creative-showcase-heading"
      className="mt-16 rounded-3xl border border-white/5 bg-white/5 p-8 text-white shadow-xl backdrop-blur"
    >
      <div className="mb-8 flex flex-col gap-2 text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.3em] text-white/70">
          Watch home experience
        </p>
        <h2
          id="creative-showcase-heading"
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Shape the experience in real-time
        </h2>
        <p className="text-base text-white/70">
          Experiment with curated cuts, creative styles, and localization choices
          without leaving the homepage.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold">Heart “Record It”</h3>
            <p className="mt-1 text-sm text-white/70">
              Review the original inspiration cut. Use it as a reference while
              tailoring the experience on the right.
            </p>
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/80">
            <video
              className="h-full w-full object-cover"
              controls
              src={HEART_RECORD_IT_VIDEO_URL}
              title="Heart Record It reference"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold">Style playground</h3>
            <p className="mt-1 text-sm text-white/70">
              Toggle a creative direction to instantly preview how the showcase
              adapts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Video style selector">
            {styleOptions.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant={selectedStyle === value ? 'default' : 'outline'}
                onClick={() => setSelectedStyle(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/80">
            <video
              key={`${selectedLanguage}-${selectedStyle}`}
              className="h-full w-full object-cover"
              controls
              data-testid="style-video"
              src={activeVideoSource}
              title={`${activeLanguage.label} ${selectedStyle} preview`}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold">Language spotlight</h3>
            <p className="mt-1 text-sm text-white/70">
              Swap localized narrations to confirm the right cut plays in the
              preview player.
            </p>
          </div>
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
          >
            <SelectTrigger aria-label="Choose a language" className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="rounded-2xl border border-white/10 bg-black/50 p-5 text-sm leading-relaxed text-white/70">
            <p className="font-semibold text-white">
              {activeLanguage.label} · {styleOptions.find(({ value }) => value === selectedStyle)?.label}
            </p>
            <p className="mt-2">{activeLanguage.description}</p>
            <p className="mt-2">
              The selected language automatically updates the showcase video to
              keep your preview in sync with localization needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
