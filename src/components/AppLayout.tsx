import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Login", path: "/login" },
  { label: "Categories", path: "/categories" },
  { label: "Items", path: "/items" },
];

export const AppLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>
            Storage Management Page
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                color="inherit"
                variant={location.pathname === item.path ? "outlined" : "text"}
                sx={{ borderColor: "rgba(255,255,255,0.45)" }}
              >
                {item.label}
              </Button>
            ))}
            {user && (
              <>
                <Typography variant="body2">Hi, {user.username}</Typography>
                <Button color="inherit" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};
