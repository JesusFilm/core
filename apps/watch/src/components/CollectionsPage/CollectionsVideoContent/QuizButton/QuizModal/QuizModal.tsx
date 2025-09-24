import { Loader2 } from 'lucide-react'
import { ReactElement } from 'react'

import { Dialog, DialogContent, DialogOverlay } from '../../../../Dialog'

interface QuizModalProps {
  open: boolean
  onClose: () => void
}

export function QuizModal({ open, onClose }: QuizModalProps): ReactElement {
  const handleClose = (): void => {
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay />
      <DialogContent
        className="h-full w-full max-w-none border-0 bg-transparent p-2 pt-14 md:pt-0 md:p-14 sm:max-w-none top-0 left-0 translate-x-0 translate-y-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left rounded-none [&_[data-slot='dialog-close']_svg]:text-white [&_[data-slot='dialog-close']_svg]:!size-8"
        data-testid="QuizModal"
      >
        <div className="absolute inset-0 flex -z-1 items-center justify-center">
          <div className="scale-200 text-white">
            <Loader2 className="animate-spin" />
          </div>
        </div>
        <iframe
          data-testid="QuizIframe"
          src="https://your.nextstep.is/embed/easter2025?expand=false"
          className="border-0 w-full h-full z-1"
          title="Next Step of Faith Quiz"
        />
      </DialogContent>
    </Dialog>
  )
}
