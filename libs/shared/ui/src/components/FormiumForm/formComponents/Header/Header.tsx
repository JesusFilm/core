import { Form, FormElementAction, FormElementType } from '@formium/types'
import Typography from '@mui/material/Typography'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { useFormium } from '../../FormiumProvider'

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
  const { hideHeader, headerAsPageTitle } = useFormium()

  return (
    <>
      {headerAsPageTitle === true && <NextSeo title={title} />}
      {hideHeader !== true && (
        <Typography variant="h4" sx={{ pb: '30px' }}>
          {title}
        </Typography>
      )}
    </>
  )
}
