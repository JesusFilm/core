import type { ReactElement } from 'react'
import { twMerge } from 'tailwind-merge'

export interface PanelSettingsProps {
  className?: string
}

export function PanelSettings({ className }: PanelSettingsProps): ReactElement {
  return (
    <section
      className={twMerge(
        'rounded-lg border border-border bg-card p-6',
        className
      )}
    >
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="space-y-6">
        {/* TODO: Implement provider selector with API key reveal toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            disabled
          >
            <option>Google Gemini 2.5 Flash Image Preview</option>
          </select>
          <p className="text-xs text-muted-foreground">Provider selection - Coming in Phase D</p>
        </div>

        {/* TODO: Implement presets carousel */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Presets</label>
          <div className="border border-border rounded-md p-4 text-center">
            <p className="text-muted-foreground">Preset carousel - Coming in Phase C</p>
          </div>
        </div>

        {/* TODO: Implement custom prompt overrides */}
        <div className="space-y-2">
          <label htmlFor="custom-prompt" className="text-sm font-medium">
            Custom Prompt
          </label>
          <textarea
            id="custom-prompt"
            placeholder="Override preset prompt..."
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-md bg-background resize-none"
            disabled
          />
          <p className="text-xs text-muted-foreground">Custom prompts - Coming in Phase C</p>
        </div>

        {/* TODO: Implement output formats (checkbox list) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Output Formats</label>
          <div className="space-y-2">
            {['Square (1:1)', 'Landscape (16:9)', 'Portrait (9:16)', 'Story (9:16)'].map((format) => (
              <label key={format} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  disabled
                />
                <span className="text-sm">{format}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Format selection - Coming in Phase C</p>
        </div>
      </div>
    </section>
  )
}

