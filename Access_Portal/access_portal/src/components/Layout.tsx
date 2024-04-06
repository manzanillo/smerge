import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import NotFound from "./NotFound";
import LoginIcon from "@mui/icons-material/Login";
import LockIcon from "@mui/icons-material/Lock";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import React, { useEffect, useState } from "react";
import Login from "./Login";
import { testToken } from "../services/UserService";
import httpService from "../shared/HttpService";
import "./Layout.css";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LockClockIcon from "@mui/icons-material/LockClock";
import Grid from "@mui/material/Unstable_Grid2";
import { JSX } from "react/jsx-runtime";
import Switcher from "./Switcher";
import Unlock from "./Unlock";
import AdminPanel from "./AdminPanel";
import ActiveIpsPanel from "./ActiveIpsPanel";

const Layout = () => {
  const [state, setState] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    httpService.isTokenSet()
  );

  const navigate = useNavigate();

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setState(open);
    };

  // Find token if available and set for http requests
  useEffect(() => {
    if (
      !httpService.isTokenSet() &&
      !window.location.pathname.includes("error")
    ) {
      const checkToken = async () => {
        const localToken = localStorage.getItem("token");
        const sessionToken = sessionStorage.getItem("token");

        let foundToken;

        if (localToken) {
          foundToken = localToken;
        } else if (sessionToken) {
          foundToken = sessionToken;
        }

        if (foundToken) {
          const res = await testToken(foundToken);
          if (res) {
            // console.log("Token valid and set.");
            setIsAuthenticated(true);
          } else {
            onAuthFailed();
          }
        } else {
          onAuthFailed();
        }
      };
      checkToken();
    }
    // eslint-disable-next-line
  }, []);

  const onAuthFailed = (redirect?: boolean) => {
    redirect = redirect ?? true;
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    // console.log("Token invalid.")
    httpService.clearToken();
    setIsAuthenticated(false);
    if (redirect) {
      navigate("/access/login");
    }
  };

  const [language, setLanguage] = useState("DE");

  const menuBase = (content: JSX.Element) => (
    <Box
      sx={{ width: "250px" }}
      role="menu"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>{content}</List>
      <div className="menu_footer">
        <Grid container>
          <Grid xs={8}>
            <div className="versionDiv">Version: Beta_0.1</div>
          </Grid>
          <Grid xs={4} sx={{ pr: "10px" }}>
            <FormControl fullWidth>
              <InputLabel id="select-lang">Lang:</InputLabel>
              <Select
                labelId="select-lang"
                id="simple-select-lang"
                value={language}
                label="Lang:"
                onChange={(event) => setLanguage(event.target.value as string)}
              >
                <MenuItem value={"DE"}>DE</MenuItem>
                <MenuItem value={"EN"}>EN</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </div>
    </Box>
  );

  const unauthedList = () =>
    menuBase(
      <ListItem key={"login"} disablePadding>
        <ListItemButton
          onClick={() => {
            navigate("/access/login");
          }}
        >
          <ListItemIcon>
            <LoginIcon />
          </ListItemIcon>
          <ListItemText primary="Login" />
        </ListItemButton>
      </ListItem>
    );

  const authedList = (isAdmin: boolean | undefined) =>
    menuBase(
      <>
        <ListItem key="Unlock IP" disablePadding>
          <ListItemButton
            onClick={() => {
              navigate("/access/");
            }}
            className="lockButton"
          >
            <ListItemIcon>
              <LockIcon />
            </ListItemIcon>
            <ListItemText primary="Unlock IP" />
          </ListItemButton>
        </ListItem>
        <ListItem key="Change Server Version" disablePadding>
          <ListItemButton
            onClick={() => {
              navigate("/access/switch");
            }}
          >
            <ListItemIcon>
              <AccountTreeIcon />
            </ListItemIcon>
            <ListItemText primary="Change Server Version" />
          </ListItemButton>
        </ListItem>
        {isAdmin ? (
          <>
            <Divider />
            <ListItem key="Admin Panel" disablePadding>
              <ListItemButton onClick={() => navigate("/access/admin")}>
                <ListItemIcon>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Admin Panel" />
              </ListItemButton>
            </ListItem>
            <ListItem key="Active Ips" disablePadding>
              <ListItemButton onClick={() => navigate("/access/actives")}>
                <ListItemIcon>
                  <LockClockIcon />
                </ListItemIcon>
                <ListItemText primary="Active Ips" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <></>
        )}
      </>
    );

  const onAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      <div style={{ height: "100vh" }}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="sticky">
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Access Portal
              </Typography>
              {isAuthenticated ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    onAuthFailed(true);
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    navigate("/access/login");
                  }}
                >
                  Login
                </Button>
              )}
            </Toolbar>
          </AppBar>
        </Box>
        <Drawer anchor={"left"} open={state} onClose={toggleDrawer(false)}>
          {isAuthenticated ? (
            <>{authedList(httpService.getClaims()?.isAdmin)}</>
          ) : (
            <>{unauthedList()}</>
          )}
        </Drawer>

        <div
          className="Content"
          style={{
            position: "absolute",
            top: "64px",
            bottom: "0px",
            width: "100vw",
            overflow: "scroll",
          }}
        >
          <Routes>
            <Route path="/" element={<Unlock />} />
            <Route path="/switch" element={<Switcher />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/actives" element={<ActiveIpsPanel />} />
            <Route
              path="/login"
              element={<Login onAuthSuccess={onAuthSuccess} />}
            />
            <Route path="/error/:errorCode" element={<NotFound />} />
            <Route
              path="*"
              Component={() => <Navigate to="/access/error/404" />}
            />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default Layout;
