import { createTheme } from '@mui/material'

export const theme = createTheme({
  spacing: 4,
  typography: {
    fontFamily: "'Open Sans', sans-serif",
    h1: {
      fontFamily: "'Montserrat', sans-serif"
    },
    h2: {
      fontFamily: "'Montserrat', sans-serif"
    },
    h3: {
      fontFamily: "'Montserrat', sans-serif"
    },
    h4: {
      fontFamily: "'Montserrat', sans-serif"
    },
    h5: {
      fontFamily: "'Montserrat', sans-serif"
    },
    h6: {
      fontFamily: "'Montserrat', sans-serif"
    },
    subtitle1: {
      fontFamily: "'Montserrat', sans-serif"
    }
  },
  palette: {
    background: {
      default: '#EFEFEF',
      paper: '#FFFFFF'
    },
    primary: {
      main: '#B62D1C'
    },
    text: {
      primary: '#30313D',
      secondary: '#6D6F81'
    },
    divider: '#DCDDE5'
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 'bold',
          borderRadius: '1000px'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
          textTransform: 'none'
        }
      }
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        colorDefault: {
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #DCDDE5'
        }
      }
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense'
      }
    }
  }
})
