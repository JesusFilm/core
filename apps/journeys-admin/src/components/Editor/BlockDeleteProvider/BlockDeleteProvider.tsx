import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useRef,
  useState
} from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { Dialog } from '@core/shared/ui/Dialog'

import { useBlockDeleteCommand } from '../utils/useBlockDeleteCommand'

const BlockDeleteContext = createContext<{
  requestBlockDelete: (target: TreeBlock) => void
}>({ requestBlockDelete: () => undefined })

function hasTracking(block: TreeBlock): boolean {
  switch (block.__typename) {
    case 'CardBlock':
    case 'ButtonBlock':
    case 'RadioOptionBlock':
      if (block.eventLabel != null) return true
      break
    case 'VideoBlock':
      if (block.eventLabel != null || block.endEventLabel != null) return true
      break
  }

  return block.children.some(hasTracking)
}

interface BlockDeleteProviderProps {
  children: ReactNode
}

export function BlockDeleteProvider({
  children
}: BlockDeleteProviderProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addBlockDelete } = useBlockDeleteCommand()
  const pendingTarget = useRef<TreeBlock | null>(null)
  const [open, setOpen] = useState(false)

  function requestBlockDelete(target: TreeBlock): void {
    if (pendingTarget.current != null) return
    if (!hasTracking(target)) {
      addBlockDelete(target)
      return
    }

    pendingTarget.current = target
    setOpen(true)
  }

  function handleClose(): void {
    pendingTarget.current = null
    setOpen(false)
  }

  function handleConfirm(): void {
    const target = pendingTarget.current
    handleClose()
    if (target != null) addBlockDelete(target)
  }

  return (
    <BlockDeleteContext.Provider value={{ requestBlockDelete }}>
      {children}
      <Dialog
        open={open}
        onClose={handleClose}
        dialogTitle={{ title: t('Delete content with tracking?') }}
        dialogAction={{
          onSubmit: handleConfirm,
          closeLabel: t('Cancel'),
          submitLabel: t('Delete')
        }}
      >
        <Typography>
          {t(
            'This content has tracking configured. Deleting it will stop those events from being recorded here.'
          )}
        </Typography>
      </Dialog>
    </BlockDeleteContext.Provider>
  )
}

export function useBlockDelete(): {
  requestBlockDelete: (target: TreeBlock) => void
} {
  return useContext(BlockDeleteContext)
}
