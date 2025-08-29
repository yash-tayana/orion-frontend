import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppSidebar from "@/components/AppSidebar";
import AppTopbar from "@/components/AppTopbar";
import RequireAuth from "@/auth/RequireAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <RequireAuth>
      <Box display="flex">
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" },
          }}
        >
          <AppSidebar />
        </Drawer>
        <Box flex={1} ml={30} width="100%">
          <AppTopbar />
          <Box p={2}>{children}</Box>
        </Box>
      </Box>
    </RequireAuth>
  );
}
