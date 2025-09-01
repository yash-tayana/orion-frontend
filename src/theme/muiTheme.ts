import { alpha, createTheme } from "@mui/material/styles";

const palette = {
  mode: "light" as const,
  primary: { main: "#6366F1" },
  secondary: { main: "#06B6D4" },
  success: { main: "#10B981" },
  warning: { main: "#F59E0B" },
  error: { main: "#EF4444" },
  info: { main: "#3B82F6" },
  divider: "#E2E8F0",
  background: { default: "#F7F8FB", paper: "#FFFFFF" },
  text: { primary: "#0F172A", secondary: "#475569" },
};

export const muiTheme = createTheme({
  palette,
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    h1: { fontSize: 28, fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: 20, fontWeight: 700 },
    h3: { fontSize: 16, fontWeight: 700 },
    body1: { fontSize: 14, fontWeight: 500 },
    body2: { fontSize: 12, fontWeight: 500 },
    button: { fontSize: 14, fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 16px rgba(2,6,23,0.06)",
          borderRadius: 14,
          border: "1px solid rgba(148,163,184,0.18)",
        },
      },
    },
    MuiButton: {
      defaultProps: { variant: "contained", color: "primary" },
      styleOverrides: {
        root: {
          height: 40,
          fontWeight: 700,
          boxShadow: "none",
          borderRadius: 12,
          "&:hover": {
            boxShadow: "rgba(2,6,23,0.06) 0 6px 20px",
          },
          "&:focus-visible": {
            outline: `2px solid ${alpha("#2563EB", 0.25)}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            background: "#FFFFFF",
            "&:hover fieldset": { borderColor: "#CBD5E1" },
            "&.Mui-focused fieldset": {
              borderColor: palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(palette.primary.main, 0.2)}`,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 12, height: 26 },
      },
    },
    MuiMenuItem: {
      styleOverrides: { root: { minHeight: 36 } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 560,
          borderLeft: `1px solid ${palette.divider}`,
          backgroundColor: palette.background.paper,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          color: palette.text.primary,
        },
        ".MuiDataGrid-root": {
          border: 0,
          borderRadius: 14,
          backgroundColor: palette.background.paper,
        },
        ".MuiDataGrid-columnHeaders": {
          backgroundColor: "#F8FAFC",
          color: "#334155",
          minHeight: 48,
          borderBottom: `1px solid #E2E8F0`,
          fontWeight: 600,
        },
        ".MuiDataGrid-row": {
          minHeight: 56,
          borderBottom: `1px solid #EFF3F6`,
          "&:hover": { backgroundColor: "rgba(99,102,241,.06)" },
        },
      },
    },
  },
});

export default muiTheme;
