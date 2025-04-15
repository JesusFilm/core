'use client'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface ImageLayoutProps {
  children: ReactNode
  params: {
    videoId: string
    aspectRatio: string
  }
}
export default function ImageLayout({
  children,
  params: { videoId }
}: ImageLayoutProps) {
  const router = useRouter()
  return (
    <Dialog
      testId="VideoImageUploadDialog-Banner"
      open={true}
      onClose={() =>
        router.push(`/videos/${videoId}`, {
          scroll: false
        })
      }
      dialogTitle={{ title: 'Edit Image', closeButton: true }}
      slotProps={{ titleButton: { size: 'small' } }}
      sx={{
        '& .MuiPaper-root': { maxWidth: 400 }
      }}
    >
      {children}
    </Dialog>
  )
}
