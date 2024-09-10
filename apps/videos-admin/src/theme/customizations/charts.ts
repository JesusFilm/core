import { Theme } from '@mui/material/styles'
import { axisClasses, chartsGridClasses, legendClasses } from '@mui/x-charts'
import type { ChartsComponents } from '@mui/x-charts/themeAugmentation'

import { grey } from '../themePrimitives'

export const chartsCustomizations: ChartsComponents<Theme> = {
  MuiChartsAxis: {
    styleOverrides: {
      root: ({ theme }) => ({
        [`& .${axisClasses.line}`]: {
          stroke: grey[300]
        },
        [`& .${axisClasses.tick}`]: { stroke: grey[300] },
        [`& .${axisClasses.tickLabel}`]: {
          fill: grey[500],
          fontWeight: 500
        },
        ...theme.applyStyles('dark', {
          [`& .${axisClasses.line}`]: {
            stroke: grey[700]
          },
          [`& .${axisClasses.tick}`]: { stroke: grey[700] },
          [`& .${axisClasses.tickLabel}`]: {
            fill: grey[300],
            fontWeight: 500
          }
        })
      })
    }
  },
  MuiChartsTooltip: {
    styleOverrides: {
      mark: ({ theme }) => ({
        ry: 6,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`
      }),
      table: ({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        background: 'hsl(0, 0%, 100%)',
        ...theme.applyStyles('dark', {
          background: grey[900]
        })
      })
    }
  },
  MuiChartsLegend: {
    styleOverrides: {
      root: {
        [`& .${legendClasses.mark}`]: {
          ry: 6
        }
      }
    }
  },
  MuiChartsGrid: {
    styleOverrides: {
      root: ({ theme }) => ({
        [`& .${chartsGridClasses.line}`]: {
          stroke: grey[200],
          strokeDasharray: '4 2',
          strokeWidth: 0.8
        },
        ...theme.applyStyles('dark', {
          [`& .${chartsGridClasses.line}`]: {
            stroke: grey[700],
            strokeDasharray: '4 2',
            strokeWidth: 0.8
          }
        })
      })
    }
  }
}
