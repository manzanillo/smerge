import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";

import "./Layout.css"
import { useTranslation } from "react-i18next";

// function Layout() {

const drawerWidth = 240;
const navItems = [
  {
    name: "main.nav_howto",
    foo: () => {
      location.href = "/howto/";
    },
  },
  {
    name: "main.nav_impressum",
    foo: () => {
      location.href = "/impressum/";
    },
  },
  {
    name: "main.nav_back",
    foo: () => {
      window.history.back();
    },
  },
];

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const {t} = useTranslation();

  const container = window.document.body;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton sx={{ textAlign: "center" }} onClick={item.foo}>
              <ListItemText primary={t(item.name)} className="nav_text"/>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    // <div>test</div>
    <Box sx={{ display: "flex", paddingLeft: "0px", height: "64px"}}>
      <CssBaseline />
      <AppBar component="nav" sx={{pl:"0px"}} style={{height:"64px", background:"rgb(15,3,3);"}}>
        <Toolbar sx={{width:"100%", paddingLeft:"0px !important", paddingRight: "1.8% !important", background:"rgb(15,3,3);"}}>
            <a href="/" className="logo">
              {document.title.includes("DEV")?"SMERGE (DEV)":document.title.includes("BETA")?"SMERGE (BETA)":"SMERGE"}
            </a>
          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "flex", paddingRight:"11px", paddingBottom:"0px" }, justifyContent:"end"}}>
            {navItems.map((item) => (
              <Button className="nav_text" key={item.name} sx={{ color: "#fff" }} onClick={item.foo}>
                {t(item.name)}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", sm: "none" }, justifyContent:"end"}} style={{height:"64px"}}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 , display: { sm: "none"}}}
          >
            <MenuIcon fontSize={"large"} />
          </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );

  // return (
  //   // <nav>
  //   //     <a href="/" className="logo">
  //   //         SMERGE
  //   //     </a>
  //   //     <ul>
  //   //         <div className="navlinks">
  //   //             <li><a href="/howto/">How To Smerge</a> </li>
  //   //             <li><a href="/impressum/">Impressum</a> </li>
  //   //             <li><a onClick={() => window.history.back()}>Back</a> </li>
  //   //         </div>
  //   //     </ul>
  //   // </nav>

  // )
}

export default Layout;
