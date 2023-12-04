import { Form, FormElementAction, FormElementType } from '@formium/types'
import Typography from '@mui/material/Typography'
import flowRight from 'lodash/flowRight'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { useFormium } from '../../FormiumProvider'

// Contains information for the page and renders the header

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

export function Header({ page: { title } }: HeaderProps): ReactElement {
  const { hideHeader, headerAsPageTitle } = useFormium()

  const Header: ReactElement = (
    <Typography variant="h4" sx={{ pb: '30px' }}>
      {title}
    </Typography>
  )

  const enhance = flowRight(
    withPageTitleUpdate(title, headerAsPageTitle),
    withHeader(title, hideHeader)
  )
  const EnhancedHeader = enhance(Header)

  return EnhancedHeader
}

const withPageTitleUpdate = (title: string, headerAsPageTitle?: boolean) =>
  function component(baseComponent: ReactElement) {
    if (headerAsPageTitle === true) {
      return (
        <>
          <NextSeo title={title} />
          {baseComponent}
        </>
      )
    } else {
      return baseComponent
    }
  }

const withHeader = (title: string, hideHeader?: boolean) =>
  function component(baseComponent: ReactElement) {
    if (hideHeader === true) {
      return <></>
    } else {
      return baseComponent
    }
  }
