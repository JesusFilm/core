'use client'

import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { MouseEvent, ReactElement, useEffect, useState } from 'react'

interface CopyButtonProps extends Omit<IconButtonProps, 'onClick'> {
  value: string
  label?: string
}

export function CopyButton({
  value,
  label = 'Copy',
  size = 'small',
  ...props
}: CopyButtonProps): ReactElement {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timeout)
  }, [copied])

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Tooltip title={copied ? 'Copied' : label}>
      <IconButton
        aria-label={`${label} ${value}`}
        size={size}
        onClick={handleClick}
        {...props}
      >
        {copied ? (
          <CheckRoundedIcon fontSize="inherit" color="success" />
        ) : (
          <ContentCopyRoundedIcon fontSize="inherit" />
        )}
      </IconButton>
    </Tooltip>
  )
}
