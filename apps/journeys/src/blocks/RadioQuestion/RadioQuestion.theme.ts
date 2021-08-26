
import { createTheme } from '@material-ui/core';

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
        background: {
            default: '#8D8D8D'
        },
    },
    shape: {
        borderRadius: 14
    }
});

const darkTheme = createTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#3f51b5'
        },
        secondary: {
            main: '#f50057'
        },
        background: {
            default: '#8D8D8D'
        }
    },
    shape: {
        borderRadius: 14
    }
})

export default {
    lightTheme, 
    darkTheme,
}