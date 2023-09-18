import { Form, FormElementAction, FormElementType } from '@formium/types'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface HeaderProps {
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

export function Header(props: HeaderProps): ReactElement {
  const title = props.page.title ?? 'default'
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100px'
      }}
    >
      <Typography variant="h2" sx={{ minHeight: '100px' }}>
        {title}
      </Typography>
    </Box>
  )
}
