import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f4c5c",
    },
    secondary: {
      main: "#e36414",
    },
    background: {
      default: "#f2f6f7",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Tahoma", sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 10,
  },
});
