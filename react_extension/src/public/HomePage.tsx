import {Box, Button} from "@mui/material";
import {useNavigate} from "react-router-dom";
import React, {useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import Footer from "../components/shared/Footer";
import homeIcon from "../assets/home-icon.svg";
import homeIconDebug from "../assets/home-icon-debug.svg";
import "./Base.css";
import "./Home.css";
import {lightPageContainer, primaryButtonSx} from "./publicPageStyles.ts";
import {AppSettings, fetchAppSettings} from "../services/PublicProjectService.ts";

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const [settings, setSettings] = useState<AppSettings>({inBeta: false, devAdd: ""});

    // Fetch settings from API
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await fetchAppSettings();
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };

        fetchSettings();
    }, []);

    function handleOpenProject() {
        navigate("/open");
    }

    function handleCreateProject() {
        navigate("/create");
    }

    function handleStartTutorial() {
        navigate("/tutorial");
    }

    return (
        <Box sx={ lightPageContainer }>
            <Box className="vertical-center" sx={{textAlign: "center"}}>
                <Box sx={{marginBottom: "2em"}}>
                    {settings.inBeta ? (
                        <Box className={"imageStack"}>
                            <img
                                src={homeIconDebug}
                                alt="SMERGE Beta"
                                style={{
                                    width: "75%",
                                    height: "auto",
                                }}
                            />
                            <Box component="h1" className={"betaSign"}>
                                <span>B</span>
                                <span>E</span>
                                <span>T</span>
                                <span>A</span>
                            </Box>
                        </Box>
                    ) : (
                        <img
                            src={homeIcon}
                            alt="SMERGE"
                            style={{
                                width: "75%",
                                height: "auto",
                            }}
                        />
                    )}
                </Box>

                <Box>
                    <Button
                        onClick={handleOpenProject}
                        id="open-btn"
                        className="btn"
                        variant="contained"
                        sx={{
                            ...primaryButtonSx,
                            margin: "1.5em",
                            fontSize: "15px",
                        }}
                    >
                        {t("home.open_existing")}
                    </Button>

                    <Button
                        onClick={handleCreateProject}
                        id="new-btn"
                        className="btn"
                        variant="contained"
                        sx={{
                            ...primaryButtonSx,
                            margin: "1.5em",
                            fontSize: "15px",
                        }}
                    >
                        {t("home.create_new")}
                    </Button>

                    <Button
                        onClick={handleStartTutorial}
                        id="tutorial-btn"
                        className="btn"
                        variant="outlined"
                        sx={{
                            ...primaryButtonSx,
                            margin: "1.5em",
                            fontSize: "15px",
                        }}
                    >
                        {t("home.start_tutorial")}
                    </Button>
                </Box>
            </Box>

            <Footer/>
        </Box>
    );
};

export default HomePage;
