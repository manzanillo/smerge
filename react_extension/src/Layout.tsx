import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import React, {useEffect, useState} from "react";

import "./Layout.css";
import {useTranslation} from "react-i18next";
import {getCurrentUser, logout} from "./services/TeacherAuthService";
import httpService from "./services/HttpService.ts";
import {useNavigate} from "react-router-dom";
import {AppSettings, fetchAppSettings} from "./services/PublicProjectService.ts";

const drawerWidth = 240;
const navItems = [
    {
        name: "main.nav_howto",
        foo: () => {
            window.location.href = "/howto";
        },
    },
    {
        name: "main.nav_impressum",
        foo: () => {
            window.location.href = "/impressum";
        },
    },
    {
        name: "main.nav_back",
        foo: () => {
            window.history.back();
        },
    },
    {
        name: getCurrentUser() ? "main.nav_teacher_view" : "main.nav_teacherlogin",
        foo: () => {
            const destination = getCurrentUser() ? "/teacher_view" : "/teacher_login";
            window.location.href = destination;
        }
    },
    {
        display: !!getCurrentUser(),
        name: getCurrentUser() ? "main.nav_logout" : "",
        foo: () => {
            if (getCurrentUser()) {
                logout();
                window.location.href = window.location.origin + "/teacher_login";
            }
        }
    }
];

function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(null);
    const [settings, setSettings] = useState<AppSettings>({inBeta: false, devAdd: ""});

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    // Settings (Beta und dev status)
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await fetchAppSettings();
                setSettings({inBeta: data.inBeta, devAdd: data.devAdd});
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };

        fetchSettings();
    }, []);

    // Titel setzen
    useEffect(() => {
        document.title = `SMERGE${settings.devAdd}`;
    }, [settings.devAdd]);

    const {t, i18n} = useTranslation();
    const currentLanguage = i18n.resolvedLanguage?.startsWith("de") ? "de" : "en";

    const setLanguage = (lang: "de" | "en") => {
        if (currentLanguage !== lang) {
            void i18n.changeLanguage(lang);
        }
        setLanguageAnchorEl(null);
    };

    const openLanguageMenu = (event: React.MouseEvent<HTMLElement>) => {
        setLanguageAnchorEl(event.currentTarget);
    };

    const closeLanguageMenu = () => {
        setLanguageAnchorEl(null);
    };

    // check if csfr token was set and redirect to missing page if not
    // Pages to skip csrf check for
    const publicPages = ["/", "/howto", "/impressum", "/open", "/create", "/tutorial", "/restore_info", "/reset_password", "/csfr_missing"];
    const navigate = useNavigate();
    useEffect(() => {
        const publicPage = !!publicPages.find((page) => window.location.pathname.startsWith(page));
        if (
            httpService.csrftoken === "" &&
            !publicPage
        ) {
            // react router to missing page
            console.log(
                location.href.split("/")[location.href.split("/").length - 1]
            );
            const lastPart =
                location.href.split("/")[location.href.split("/").length - 1];
            if (lastPart.includes("csfr_missing")) {
                navigate("/csfr_missing");
            } else {
                navigate("/csfr_missing/" + lastPart);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    navItems.push();
    const container = window.document.body;

    const languageSwitch = (
        <>
            <Button
                size="small"
                variant="outlined"
                onClick={openLanguageMenu}
                endIcon={<KeyboardArrowDownIcon/>}
                sx={{
                    minWidth: "72px",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.4)",
                    mr: 1,
                    "&:hover": {borderColor: "white", backgroundColor: "rgba(255,255,255,0.08)"},
                }}
            >
                {currentLanguage.toUpperCase()}
            </Button>
            <Menu
                anchorEl={languageAnchorEl}
                open={Boolean(languageAnchorEl)}
                onClose={closeLanguageMenu}
            >
                <MenuItem selected={currentLanguage === "de"} onClick={() => setLanguage("de")}>
                    Deutsch
                </MenuItem>
                <MenuItem selected={currentLanguage === "en"} onClick={() => setLanguage("en")}>
                    English
                </MenuItem>
            </Menu>
        </>
    );

    const drawer = (
        <Box sx={{textAlign: "center"}}>
            <Box sx={{display: "flex", justifyContent: "center", py: 2}}>
                {languageSwitch}
            </Box>
            <List>
                {navItems.map((item) => {
                    if (!item.display) {
                        return <></>;
                    }
                    return <ListItem key={item.name} disablePadding>
                        <ListItemButton
                            sx={{textAlign: "center"}}
                            onClick={() => {
                                item.foo();
                                handleDrawerToggle();
                            }}
                        >
                            <ListItemText primary={t(item.name)} className="nav_text"/>
                        </ListItemButton>
                    </ListItem>;
                })}
            </List>
        </Box>
    );

    return (
        <Box sx={{display: "flex", paddingLeft: "0px", height: "64px"}}>
            <CssBaseline/>
            <AppBar
                component="nav"
                sx={{pl: "0px"}}
                style={{height: "64px", background: "rgb(15,3,3)"}}
            >
                <Toolbar
                    sx={{
                        width: "100%",
                        paddingLeft: "0px !important",
                        paddingRight: "1.8% !important",
                        background: "rgb(15,3,3);",
                    }}
                >
                    <a href="/" className="logo">
                        SMERGE { settings.devAdd ?? ""}
                    </a>
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: {
                                xs: "none",
                                sm: "flex",
                                paddingRight: "11px",
                                paddingBottom: "0px",
                            },
                            justifyContent: "end",
                            alignItems: "center",
                        }}
                    >
                        {languageSwitch}
                        {navItems.map((item) => (
                            <Button
                                className="nav_text"
                                key={item.name}
                                sx={{color: "#fff"}}
                                onClick={item.foo}
                            >
                                {t(item.name)}
                            </Button>
                        ))}
                    </Box>
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: {xs: "flex", sm: "none"},
                            justifyContent: "end",
                        }}
                        style={{height: "64px"}}
                    >
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{mr: 2, display: {sm: "none"}}}
                        >
                            <MenuIcon fontSize={"large"}/>
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
                        display: {xs: "block", sm: "none"},
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
}

export default Layout;
