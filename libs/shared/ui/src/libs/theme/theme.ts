import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    surface: Palette["primary"];
  }
  interface PaletteOptions {
    surface: PaletteOptions["primary"];
  }
  interface Palette {
    surfaceAlt: Palette["primary"];
  }
  interface PaletteOptions {
    surfaceAlt: PaletteOptions["primary"];
  }
}

const typograpyTokens = {
  h1: {
    fontSize: "36px",
    fontWeight: 600,
    lineHeight: "38px",
  },
  h2: {
    fontSize: 28,
    fontWeight: 800,
    lineHeight: "33px",
  },
  h3: {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: "28px",
  },
  h4: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: "27px",
  },
  h5: {
    fontSize: 18,
    fontWeight: 800,
    lineHeight: "23px",
  },
  h6: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: "20px",
    letterSpacing: 2,
  },
  subtitle1: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: "24px",
    letterSpacing: 0.5,
  },
  subtitle2: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: "24px",
    letterSpacing: 0.5,
  },
  body1: {
    fontFamily: '"Open Sans", "Tahoma", "Verdana", sans-serif',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: "24px",
  },
  body2: {
    fontFamily: '"Open Sans", "Tahoma", "Verdana", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "20px",
  },
  overline: {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: "16px",
    letterSpacing: 3,
  },
  caption: {
    fontFamily: '"Open Sans", "Tahoma", "Verdana", sans-serif',
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "20px",
  },
};

export const baseTheme = createTheme({
  typography: {
    fontFamily: [
      '"Montserrat", "Open Sans", "Tahoma", "Verdana", sans-serif',
    ].join(","),
    ...typograpyTokens,
    // BUTTON TODO
  },
  shape: {
    borderRadius: 8,
  },
});

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "light",
    // CONTAINER COLORS
    background: { default: "#FEFEFE" },
    surface: {
      light: "#6D6F81",
      main: "#30313D",
      dark: "#26262E",
      contrastText: "#FFFFFF",
    },
    // CONTAINER OVERRIDE COLORS
    surfaceAlt: {
      light: "#FEFEFE",
      main: "#BDBFCF",
      dark: "#AAACBB",
      contrastText: "#26262E",
    },
    primary: {
      light: "#249DFF",
      main: "#086AE6",
      dark: "#0041B2",
      contrastText: "#FFFFFF",
    },
    secondary: {
      light: "#03DAC5",
      main: "#07C0B1",
      dark: "#018786",
      contrastText: "#FFFFFF",
    },
    error: {
      light: "#FC624E",
      main: "#EE4C37",
      dark: "#C52713",
      contrastText: "#FFFFFF",
    },
    // TEXT OVERRIDE COLORS
    text: {
      primary: "#26262E",
      secondary: "#FFFFFF",
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    ...lightTheme.palette,
    mode: "dark",
    background: { default: "#26262E" },
    surface: {
      light: "#FEFEFE",
      main: "#BDBFCF",
      dark: "#AAACBB",
      contrastText: "#26262E",
    },
    // CONTAINER OVERRIDE COLORS
    surfaceAlt: {
      light: "#6D6F81",
      main: "#30313D",
      dark: "#26262E",
      contrastText: "#FFFFFF",
    },
    // TEXT OVERRIDE COLORS
    text: {
      primary: "#FFFFFF",
      secondary: "#26262E",
    },
  },
});
