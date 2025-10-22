import {
  Crown,
  Facebook,
  FileText,
  Globe,
  Instagram,
  Palette,
  Sparkles,
  Twitter,
  Users,
  Video,
  X,
  Youtube,
  Zap
} from 'lucide-react'

export const styleOptions = [
  { name: 'Modern', icon: Palette },
  { name: 'Classic', icon: Crown },
  { name: 'Minimal', icon: X },
  { name: 'Bold', icon: Zap },
  { name: 'Elegant', icon: Sparkles }
]

export const outputOptions = {
  video: [
    { name: 'Full HD: 1920 × 1080 px', icon: Video },
    { name: '4K UHD: 3840 × 2160 px', icon: Video },
    { name: 'Vertical HD: 1080 × 1920 px', icon: Video },
    { name: 'Square HD: 1080 × 1080 px', icon: Video }
  ],
  social: [
    { name: 'Instagram Post: 1080 × 1080 px', icon: Instagram },
    { name: 'Instagram Story: 1080 × 1920 px', icon: Instagram },
    { name: 'Instagram Ad: 1080 × 1080 px', icon: Instagram },
    { name: 'Facebook Post (Landscape): 1200 × 630 px', icon: Facebook },
    { name: 'Facebook Post (Square): 1080 × 1080 px', icon: Facebook },
    { name: 'Facebook Cover: 851 × 315 px', icon: Facebook },
    { name: 'Twitter Post: 1600 × 900 px', icon: Twitter },
    { name: 'Twitter Header: 1500 × 500 px', icon: Twitter },
    { name: 'Twitter Square: 1080 × 1080 px', icon: Twitter },
    { name: 'LinkedIn Post: 1200 × 627 px', icon: Users },
    { name: 'LinkedIn Banner: 1584 × 396 px', icon: Users },
    { name: 'LinkedIn Square: 1080 × 1080 px', icon: Users },
    { name: 'YouTube Thumbnail: 1280 × 720 px', icon: Youtube },
    { name: 'YouTube Channel: 2560 × 1440 px', icon: Youtube },
    { name: 'YouTube Short: 1080 × 1920 px', icon: Youtube }
  ],
  print: [
    { name: 'Invitation: 14 × 14 cm', icon: FileText },
    { name: 'A4 Portrait: 21 × 29.7 cm', icon: FileText },
    { name: 'A4 Landscape: 29.7 × 21 cm', icon: FileText },
    { name: 'A3: 29.7 × 42 cm', icon: FileText },
    { name: 'Letter Portrait: 8.5 × 11 in', icon: FileText },
    { name: 'Letter Landscape: 11 × 8.5 in', icon: FileText },
    { name: 'Business Card: 3.5 × 2 in', icon: FileText },
    { name: 'Poster: 18 × 24 in', icon: FileText }
  ],
  web: [
    { name: 'Web Page: 1920 × 1080 px', icon: Globe },
    { name: 'Carousel Slide: 1200 × 800 px', icon: Globe },
    { name: 'Embed Banner: 800 × 600 px', icon: Globe },
    { name: 'Hero Section: 1920 × 800 px', icon: Globe },
    { name: 'Card Component: 400 × 300 px', icon: Globe }
  ]
} as const
