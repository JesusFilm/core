import type { ReactElement } from 'react'
import { twMerge } from 'tailwind-merge'

export interface PanelResultsProps {
  className?: string
}

export function PanelResults({ className }: PanelResultsProps): ReactElement {
  return (
    <section
      className={twMerge(
        'rounded-lg border border-border bg-card p-6',
        className
      )}
    >
      <h2 className="text-xl font-semibold mb-4">Generated Visuals</h2>

      {/* TODO: Implement generate button */}
      <div className="mb-6">
        <button
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          Generate Visuals
        </button>
        <p className="text-xs text-muted-foreground mt-2">Generation flow - Coming in Phase E</p>
      </div>

      {/* TODO: Implement status indicator */}
      <div className="mb-4 text-sm text-muted-foreground">
        Status: Idle - Status indicators coming in Phase E
      </div>

      {/* TODO: Implement masonry/grid gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Results Gallery</p>
        </div>
        <div className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Coming in Phase E</p>
        </div>
        <div className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Shortlist & Download</p>
        </div>
      </div>

      {/* TODO: Implement shortlist toggle & action menu per item */}
      <div className="text-sm text-muted-foreground">
        Shortlist toggles and download actions - Coming in Phase E
      </div>
    </section>
  )
}

