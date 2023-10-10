import { Form, FormElementAction, FormElementType } from '@formium/types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useFormium } from '../FormiumProvider'

// Contains information for the page and renders the header

export interface HeaderProps {
  form: Form
  page: Page
  pageIndex: number
}

interface Page {
  actions: [FormElementAction]
  children: [PageChild]
  dynamic: boolean
  hidden: boolean
  id: string
  items: [string]
  orderLast: boolean
  slug: string
  title: string
  type: FormElementType
}

interface PageChild {
  actions: [FormElementAction]
  description: string
  dynamic: boolean
  hidden: boolean
  id: string
  items: [string]
  orderLast: boolean
  slug: string
  title: string
  type: FormElementType
}

export function Header({ page: { title } }: HeaderProps): ReactElement {
  const { formSubtitle } = useFormium()

  return (
    <Box
      data-testid="Header"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        pb: '30px'
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h4">{title}</Typography>
        {formSubtitle != null && (
          <Typography variant="body1">{formSubtitle}</Typography>
        )}
      </Stack>
    </Box>
  )
}
