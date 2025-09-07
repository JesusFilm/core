import { Volume2, VolumeX } from 'lucide-react'

interface MuteToggleProps {
  isMuted: boolean
  onToggle: () => void
}

/**
 * Mute/unmute toggle button in bottom-right corner
 */
export function MuteToggle({ isMuted, onToggle }: MuteToggleProps) {
  return (
    <button
      className="absolute bottom-8 right-8 z-20 p-3 rounded-full bg-black/50 text-white ml-4 -mb-3 mr-1 transition-colors hover:bg-black/70"
      onClick={onToggle}
      aria-label={isMuted ? 'Unmute video carousel audio' : 'Mute video carousel audio'}
      aria-pressed={!isMuted}
    >
      {isMuted ? (
        <VolumeX className="h-6 w-6" />
      ) : (
        <Volume2 className="h-6 w-6" />
      )}
    </button>
  )
}
