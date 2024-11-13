import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ComponentPropsWithoutRef, MouseEvent, ReactElement } from 'react'

import { ItemRowActions } from './ItemRowActions'
import { ItemRowMenu } from './ItemRowMenu'

interface ItemRowProps {
  id: string
  label: string
  img?: {
    src: string
    alt: string
  }
  actions?: ComponentPropsWithoutRef<typeof ItemRowActions>['actions']
  menu?: ComponentPropsWithoutRef<typeof ItemRowMenu>
  onClick?: (id: string) => void
}

export function ItemRow({
  id,
  label,
  img,
  actions,
  menu,
  onClick
}: ItemRowProps): ReactElement {
  const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.currentTarget !== e.target) return

    onClick?.(id)
  }

  console.log({ img })
  return (
    <Stack
      onClick={handleClick}
      data-testid="OrderedItem"
      id={`ordered-item-${id}`}
      direction="row"
      gap={2}
      sx={{
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.default',
        p: 1,
        borderRadius: 1,
        width: '100%',
        minHeight: 64
      }}
    >
      {img != null && (
        <Box
          sx={{
            position: 'relative',
            height: 48,
            width: { xs: 'auto', sm: 80 },
            borderRadius: 0.75,
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            loading="lazy"
            layout="fill"
            objectFit="cover"
          />
        </Box>
      )}
      <Typography variant="subtitle2">{label}</Typography>
      <Stack direction="row" gap={1} sx={{ ml: 'auto' }}>
        {actions != null && actions.length > 0 && (
          <ItemRowActions actions={actions} />
        )}
        {menu != null && menu.actions.length > 0 && (
          <ItemRowMenu actions={menu.actions} />
        )}
      </Stack>
    </Stack>
  )
}
