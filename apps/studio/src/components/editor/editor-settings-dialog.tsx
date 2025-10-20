import type { FC } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { Input } from '../ui/input'

interface EditorSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unsplashApiKey: string
  onUnsplashApiKeyChange: (value: string) => void
}

const isUnsplashKeyValid = (value: string): boolean =>
  /^[A-Za-z0-9_-]{40,80}$/.test(value)

export const EditorSettingsDialog: FC<EditorSettingsDialogProps> = ({
  open,
  onOpenChange,
  unsplashApiKey,
  onUnsplashApiKeyChange
}) => {
  const showValidationMessage =
    unsplashApiKey.length > 0 && !isUnsplashKeyValid(unsplashApiKey)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-sm font-medium">OpenAI Access</span>
            <p className="text-xs text-muted-foreground">
              Responses are now powered by a secure, server-managed OpenAI
              connection. No personal API key is required.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="unsplash-api-key" className="text-sm font-medium">
              Unsplash Access Key
            </label>
            <Input
              id="unsplash-api-key"
              type="password"
              placeholder="Enter your Unsplash Access Key..."
              value={unsplashApiKey}
              onChange={(event) => onUnsplashApiKeyChange(event.target.value)}
              className={`w-full ${
                showValidationMessage ? 'border-red-500' : ''
              }`}
            />
            {showValidationMessage && (
              <p className="text-xs text-red-600 mt-1">
                Access Key appears to be invalid format. Should be 40-80
                characters.
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Your Unsplash Access Key is used to fetch relevant images for
                content steps. Get one from{' '}
                <a
                  href="https://unsplash.com/developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Unsplash Developers
                </a>
                . It will be stored locally in your browser.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
