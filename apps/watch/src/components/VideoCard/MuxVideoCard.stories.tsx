import type { Meta, StoryObj } from '@storybook/react'

import { MuxVideoCard } from './MuxVideoCard'

const muxInsert = {
  source: 'mux' as const,
  id: 'welcome-start',
  overlay: {
    label: 'Today’s Pick',
    title: 'Morning Nature Background',
    collection: 'Daily Inspirations',
    description: 'A calm intro before your playlist.'
  },
  playbackId: 'J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI',
  playbackIndex: 0,
  urls: {
    hls: 'https://stream.mux.com/J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI.m3u8',
    poster:
      'https://image.mux.com/J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI/thumbnail.jpg?time=1',
    mp4: {
      medium:
        'https://stream.mux.com/J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI/medium.mp4',
      high:
        'https://stream.mux.com/J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI/high.mp4'
    }
  }
}

const meta: Meta<typeof MuxVideoCard> = {
  title: 'Watch/VideoCard/MuxVideoCard',
  component: MuxVideoCard,
  parameters: {
    layout: 'centered',
    chromatic: { pauseAnimationAtEnd: true }
  }
}

export default meta

export const Default: StoryObj<typeof MuxVideoCard> = {
  args: {
    insert: muxInsert,
    variant: 'expanded'
  }
}

export const Contained: StoryObj<typeof MuxVideoCard> = {
  args: {
    insert: muxInsert,
    variant: 'contained'
  }
}
