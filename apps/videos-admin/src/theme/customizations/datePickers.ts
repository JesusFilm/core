import { menuItemClasses } from '@mui/material/MenuItem'
import { Theme, alpha } from '@mui/material/styles'
import {
  monthCalendarClasses,
  pickersDayClasses,
  yearCalendarClasses
} from '@mui/x-date-pickers'
import type { PickerComponents } from '@mui/x-date-pickers/themeAugmentation'

import { brand, grey } from '../themePrimitives'

export const datePickersCustomizations: PickerComponents<Theme> = {
  MuiPickerPopper: {
    styleOverrides: {
      paper: ({ theme }) => ({
        marginTop: 4,
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        backgroundImage: 'none',
        background: 'hsl(0, 0%, 100%)',
        boxShadow:
          'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
        [`& .${menuItemClasses.root}`]: {
          borderRadius: 6,
          margin: '0 6px'
        },
        ...theme.applyStyles('dark', {
          background: grey[900],
          boxShadow:
            'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px'
        })
      })
    }
  },
  MuiPickersArrowSwitcher: {
    styleOverrides: {
      spacer: { width: 16 },
      button: ({ theme }) => ({
        backgroundColor: 'transparent',
        color: theme.palette.grey[500],
        ...theme.applyStyles('dark', {
          color: theme.palette.grey[400]
        })
      })
    }
  },
  MuiPickersCalendarHeader: {
    styleOverrides: {
      switchViewButton: {
        padding: 0,
        border: 'none'
      }
    }
  },
  MuiMonthCalendar: {
    styleOverrides: {
      button: ({ theme }) => ({
        fontSize: theme.typography.body1.fontSize,
        color: theme.palette.grey[600],
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        },
        [`&.${monthCalendarClasses.selected}`]: {
          backgroundColor: grey[700],
          fontWeight: theme.typography.fontWeightMedium
        },
        '&:focus': {
          outline: `3px solid ${alpha(brand[500], 0.5)}`,
          outlineOffset: '2px',
          backgroundColor: 'transparent',
          [`&.${monthCalendarClasses.selected}`]: { backgroundColor: grey[700] }
        },
        ...theme.applyStyles('dark', {
          color: theme.palette.grey[300],
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          },
          [`&.${monthCalendarClasses.selected}`]: {
            color: theme.palette.common.black,
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: grey[300]
          },
          '&:focus': {
            outline: `3px solid ${alpha(brand[500], 0.5)}`,
            outlineOffset: '2px',
            backgroundColor: 'transparent',
            [`&.${monthCalendarClasses.selected}`]: {
              backgroundColor: grey[300]
            }
          }
        })
      })
    }
  },
  MuiYearCalendar: {
    styleOverrides: {
      button: ({ theme }) => ({
        fontSize: theme.typography.body1.fontSize,
        color: theme.palette.grey[600],
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        height: 'fit-content',
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        },
        [`&.${yearCalendarClasses.selected}`]: {
          backgroundColor: grey[700],
          fontWeight: theme.typography.fontWeightMedium
        },
        '&:focus': {
          outline: `3px solid ${alpha(brand[500], 0.5)}`,
          outlineOffset: '2px',
          backgroundColor: 'transparent',
          [`&.${yearCalendarClasses.selected}`]: { backgroundColor: grey[700] }
        },
        ...theme.applyStyles('dark', {
          color: theme.palette.grey[300],
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          },
          [`&.${yearCalendarClasses.selected}`]: {
            color: theme.palette.common.black,
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: grey[300]
          },
          '&:focus': {
            outline: `3px solid ${alpha(brand[500], 0.5)}`,
            outlineOffset: '2px',
            backgroundColor: 'transparent',
            [`&.${yearCalendarClasses.selected}`]: {
              backgroundColor: grey[300]
            }
          }
        })
      })
    }
  },
  MuiPickersDay: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: theme.typography.body1.fontSize,
        color: theme.palette.grey[600],
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        },
        [`&.${pickersDayClasses.selected}`]: {
          backgroundColor: grey[700],
          fontWeight: theme.typography.fontWeightMedium
        },
        '&:focus': {
          outline: `3px solid ${alpha(brand[500], 0.5)}`,
          outlineOffset: '2px',
          backgroundColor: 'transparent',
          [`&.${pickersDayClasses.selected}`]: { backgroundColor: grey[700] }
        },
        ...theme.applyStyles('dark', {
          color: theme.palette.grey[300],
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          },
          [`&.${pickersDayClasses.selected}`]: {
            color: theme.palette.common.black,
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: grey[300]
          },
          '&:focus': {
            outline: `3px solid ${alpha(brand[500], 0.5)}`,
            outlineOffset: '2px',
            backgroundColor: 'transparent',
            [`&.${pickersDayClasses.selected}`]: { backgroundColor: grey[300] }
          }
        })
      })
    }
  }
}
