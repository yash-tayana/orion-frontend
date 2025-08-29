import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2563EB" },
        secondary: { main: "#10B981" },
        background: { default: "#ffffff", paper: "#ffffff" },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  components: {
    MuiButton: {
      defaultProps: { variant: "contained", color: "primary" },
    },
  },
});

export default muiTheme;
