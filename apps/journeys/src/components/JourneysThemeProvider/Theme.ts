import { createTheme } from '@material-ui/core'

const lightTheme = createTheme({
    palette: {
        type: 'light',
        primary: {
            main: '#fcba03'
        },
        secondary: {
            main: '#f50057'
        },
        success: {
            main: '#54A055' 
        },
    },
    shape: {
        borderRadius: 14
    }
});

// Not quiet sure if this is how we want to implement dark theme
const darkTheme = createTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#3f51b5'
        },
        secondary: {
            main: '#f500057'
        },
    },
    shape: {
        borderRadius: 14
    }
});

export default {
    lightTheme, 
    darkTheme,
}