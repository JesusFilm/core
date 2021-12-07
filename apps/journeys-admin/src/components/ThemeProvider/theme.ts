import { createTheme } from '@mui/material'

export const theme = createTheme({
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
    }
  },
  palette: {
    background: {
      default: '#EFEFEF'
    },
    primary: {
      main: '#B62D1C'
    },
    text: {
      primary: '#30313D',
      secondary: '#6D6F81'
    }
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
    }
  }
})
