'use client'

import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactElement } from 'react'

export function BreadcrumbNavigation(): ReactElement {
  const pathname = usePathname()

  const routes = pathname
    .split('/')
    .filter(Boolean)
    .reduce(
      (
        accum,
        current,
        parentIndex,
        arr
      ): Array<{ label: string; path: string }> => {
        let accumulatedPath = ''
        arr.forEach((route, i) => {
          if (i > parentIndex) return
          accumulatedPath = `${accumulatedPath}/${route}`
        })
        const obj = { label: current, path: accumulatedPath }
        return [...accum, obj]
      },
      []
    )

  return (
    <Breadcrumbs separator={<Typography variant="h4">{'>'}</Typography>}>
      {routes.map((route, i) => (
        <NextLink key={i} href={route.path} style={{ textDecoration: 'none' }}>
          <Typography
            variant="h4"
            color="primary.main"
            sx={{ cursor: 'pointer' }}
          >
            {i === 0
              ? 'Dashboard'
              : route.label.charAt(0).toUpperCase() + route.label.slice(1)}
          </Typography>
        </NextLink>
      ))}
    </Breadcrumbs>
  )
}
