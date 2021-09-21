import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    surface: Palette["primary"];
  }
  interface PaletteOptions {
    surface: PaletteOptions["primary"];
  }

  interface PaletteColor {
    extraLight?: string;
  }
  interface SimplePaletteColorOptions {
    extraLight?: string;
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
    fontFamily: '"Open Sans", sans-serif',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: "24px",
  },
  body2: {
    fontFamily: '"Open Sans", sans-serif',
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
    fontFamily: '"Open Sans", sans-serif',
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "20px",
  },
};

export const baseTheme = createTheme({
  typography: {
    fontFamily: ['"Montserrat", sans-serif'].join(","),
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
    background: { default: "#FFFFFF" },
    primary: {
      light: "#008CFF",
      main: "#086AE6",
      dark: "#0041B2",
      contrastText: "#FFFFFF",
    },
    secondary: {
      light: "#03DAC5",
      main: "#01A299",
      dark: "#018786",
    },
    surface: {
      light: "#6D6F81",
      main: "#30313D",
      dark: "#26262E",
    },
    success: {
      main: "#54A055",
    },
    error: {
      main: "#EE4C37",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#000000",
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    ...lightTheme.palette,
    mode: "dark",
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f500057",
    },
  },
});
