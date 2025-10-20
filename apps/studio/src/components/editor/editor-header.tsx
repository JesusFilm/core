import { History, Settings } from 'lucide-react'
import Image from 'next/image'
import type { FC, ReactNode } from 'react'

import { Button } from '../ui/button'

export interface TokenSummary {
  formattedTotal: string
  estimatedCost: string
}

interface EditorHeaderProps {
  onNavigateHome: () => void
  onNavigatePlan: () => void
  onToggleSessions: () => void
  onOpenSettings: () => void
  tokenSummary: TokenSummary | null
  isTokensUpdated: boolean
  children?: ReactNode
}

export const EditorHeader: FC<EditorHeaderProps> = ({
  onNavigateHome,
  onNavigatePlan,
  onToggleSessions,
  onOpenSettings,
  tokenSummary,
  isTokensUpdated,
  children
}) => {
  return (
    <header className="border-b border-border bg-background backdrop-blur" data-id="Header">
      <div className="container mx-auto px-4 py-6" data-id="HeaderContainer">
        <div className="flex items-center justify-between" data-id="HeaderRow">
          <div className="flex items-center gap-4" data-id="HeaderBranding">
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Image
                  src="/jesusfilm-sign.svg"
                  alt="Jesus Film Project"
                  width={24}
                  height={24}
                  className="h-6 w-auto"
                />
                <span className="text-2xl font-bold text-foreground">Studio</span>
              </button>
              <span className="text-muted-foreground">{'>'}</span>
              <button
                onClick={onNavigatePlan}
                className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Plan
              </button>
              <span className="text-muted-foreground">{'>'}</span>
              <span className="text-lg font-medium text-foreground">Edit</span>
            </div>
          </div>
          <div className="flex items-center gap-4" data-id="HeaderActions">
            {tokenSummary && (
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                  isTokensUpdated ? 'bg-red-500 text-white' : 'bg-muted'
                }`}
              >
                <span className={isTokensUpdated ? 'text-white' : 'text-muted-foreground'}>
                  Tokens:
                </span>
                <span className="font-medium">{tokenSummary.formattedTotal}</span>
                <span className={isTokensUpdated ? 'text-white' : 'text-muted-foreground'}>•</span>
                <span className="font-medium">${tokenSummary.estimatedCost}</span>
              </div>
            )}
            <Button
              variant="ghost"
              className="h-8 w-8 p-3 cursor-pointer hover:!bg-transparent group"
              onClick={onToggleSessions}
            >
              <History className="!h-5 !w-5 group-hover:!text-primary transition-colors" />
              <span className="sr-only">Sessions</span>
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-3 cursor-pointer hover:!bg-transparent group"
              onClick={onOpenSettings}
            >
              <Settings className="!h-5 !w-5 group-hover:!text-primary transition-colors" />
              <span className="sr-only">Settings</span>
            </Button>
            {children}
          </div>
        </div>
      </div>
    </header>
  )
}
