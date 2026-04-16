import { ReactElement, ReactNode } from 'react'
import { Drawer as VaulDrawer } from 'vaul'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

interface DrawerContentProps {
  children: ReactNode
  title?: string
}

export function Drawer({
  open,
  onOpenChange,
  children
}: DrawerProps): ReactElement {
  return (
    <VaulDrawer.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </VaulDrawer.Root>
  )
}

export function DrawerTrigger({
  children
}: {
  children: ReactNode
}): ReactElement {
  return <VaulDrawer.Trigger asChild>{children}</VaulDrawer.Trigger>
}

export function DrawerContent({
  children,
  title
}: DrawerContentProps): ReactElement {
  return (
    <VaulDrawer.Portal>
      <VaulDrawer.Overlay
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1300
        }}
      />
      <VaulDrawer.Content
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '85vh',
          backgroundColor: 'white',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1301
        }}
        aria-label={title}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 0 8px',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: 48,
              height: 4,
              borderRadius: 9999,
              backgroundColor: '#e0e0e0'
            }}
          />
          <VaulDrawer.Close asChild>
            <button
              type="button"
              aria-label="Close chat"
              tabIndex={0}
              style={{
                position: 'absolute',
                top: 8,
                right: 12,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: 18,
                color: '#666',
                borderRadius: 9999,
                padding: 0,
                outline: 'none'
              }}
            >
              ✕
            </button>
          </VaulDrawer.Close>
        </div>
        {title != null && (
          <VaulDrawer.Title
            style={{
              fontSize: 16,
              fontWeight: 600,
              padding: '0 16px 8px',
              margin: 0
            }}
          >
            {title}
          </VaulDrawer.Title>
        )}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </VaulDrawer.Content>
    </VaulDrawer.Portal>
  )
}

export function DrawerClose({
  children
}: {
  children: ReactNode
}): ReactElement {
  return <VaulDrawer.Close asChild>{children}</VaulDrawer.Close>
}
