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
        className="data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left top-0 left-0 h-full w-full max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-transparent p-2 pt-14 sm:max-w-none md:p-14 md:pt-0 [&_[data-slot='dialog-close']_svg]:!size-8 [&_[data-slot='dialog-close']_svg]:text-white"
        data-testid="QuizModal"
      >
        <div className="absolute inset-0 -z-1 flex items-center justify-center">
          <div className="scale-200 text-white">
            <Loader2 className="animate-spin" />
          </div>
        </div>
        <iframe
          data-testid="QuizIframe"
          src="https://your.nextstep.is/embed/easter2025?expand=false"
          className="z-1 h-full w-full border-0"
          title="Next Step of Faith Quiz"
        />
      </DialogContent>
    </Dialog>
  )
}
