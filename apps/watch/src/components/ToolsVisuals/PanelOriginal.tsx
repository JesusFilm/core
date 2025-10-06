import type { ReactElement } from 'react'
import { Camera, Check } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export interface PanelOriginalProps {
  className?: string
  onShowAllPanels?: () => void
}

export function PanelOriginal({ className, onShowAllPanels }: PanelOriginalProps): ReactElement {
  return (
    <section
      className={twMerge(
        'rounded-lg bg-card p-6 flex flex-col items-center h-full',
        // When onShowAllPanels is provided, make it take 80% width and center it
        onShowAllPanels ? 'w-4/5 max-w-4xl mx-auto' : '',
        className
      )}
    >
      {/* Stepper */}

        
        <div className="relative flex justify-between mb-8 w-full items-stretch space-x-4">
          {/* Single connector line */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[80%] h-px bg-stone-500/70" />

          {/* Step 1 - Completed */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full z-10">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs mt-3 text-primary font-medium">Upload</span>
          </div>

          {/* Step 2 - Current */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 border-2 border-primary text-primary rounded-full bg-background z-10 outline-6 outline-stone-900">
              <span className="text-sm font-medium">2</span>
            </div>
            <span className="text-xs mt-3 text-muted-foreground">Transform</span>
          </div>

          {/* Step 3 - Pending */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 border-2 border-muted-foreground text-muted-foreground rounded-full bg-background z-10">
              <span className="text-sm font-medium">3</span>
            </div>
            <span className="text-xs mt-3 text-muted-foreground">Results</span>
          </div>
        </div>


      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Video Visuals AI Generator</h2>
        <p className="text-sm text-muted-foreground">Make thumbnails, posters, and cover art for your videos.</p>
      </div>
      <div className="space-y-6">
        {/* Prominent dropzone/paste area */}
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-muted/20 hover:bg-muted/30 transition-colors flex-grow flex flex-col justify-center w-full max-w-md">
          <div className="space-y-4">
            <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-medium">Upload or Paste Image</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Drop an image here, paste from clipboard, or enter a video slug below to get started with AI-generated visuals.
            </p>
            <p className="text-sm text-muted-foreground">Dropzone/Paste Area - Coming in Phase B</p>
          </div>
        </div>

        {/* Slug input section */}
        <div className="space-y-3 w-full max-w-md">
          <label htmlFor="slug-input" className="text-sm font-medium block text-center">
            Or use a Watch Video Slug
          </label>
          <input
            id="slug-input"
            type="text"
            placeholder="Enter video slug..."
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-center"
            disabled
          />
          <p className="text-xs text-muted-foreground text-center">Slug lookup - Coming in Phase B</p>
        </div>

        {/* Action button to show all panels */}
        {onShowAllPanels && (
          <div className="text-center pt-4">
            <button
              onClick={onShowAllPanels}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Get Started with Settings
            </button>
          </div>
        )}

        {/* TODO: Implement metadata display & reset controls */}
        <div className="text-sm text-muted-foreground text-center">
          Metadata & controls - Coming in Phase B
        </div>
      </div>
    </section>
  )
}

