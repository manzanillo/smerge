import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, Fab, FormControl, InputLabel, MenuItem, Modal, Paper, PropTypes, Select, SelectChangeEvent, Stack, SxProps, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import httpService from "../services/HttpService";
import { useEffect, useState } from "react";
import "./SettingsModal.css";
import OldSettingControls from "./OldSettingControls";
import ProjectDto from "./models/ProjectDto";
import NewSettingControls from "./NewSettingControls";

interface SettingsModalProps {
    projectId: string;
    changeLayout: (layoutName: string) => void;
    initLayout?: string;
    cy: React.MutableRefObject<cytoscape.Core | undefined>;
    saveGraphPositions: () => void;
    projectData: ProjectDto;
    setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ projectId, changeLayout, initLayout = "preset", cy, saveGraphPositions, projectData, setProjectData}) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const handleModalClose = () => {
        setModalOpen(false);
    }

    const hamburgerStyle = {
        position: 'absolute',
        top: 30,
        right: 30,
        zIndex: 9999,
        width: 50,
        height: 50,
        color: 'black',
        bgcolor: 'transparent',
    } as SxProps;

    return (<>
        <Modal open={modalOpen} onClose={handleModalClose} style={{ overflow:"auto", border: 'none', display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Box id={"settingsModal"} style={{overflow:"auto", padding:"20px", maxHeight: "calc(100vh - 40px)"}}>
                <Accordion style={{borderRadius: "10px 10px 2px 2px"}} defaultExpanded sx={{bgcolor:"transparent"}}>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    
                    aria-controls="panel1-content"
                    id="panel1-header"
                    >
                    <h1 style={{margin:0}}>Project Settings</h1>
                    </AccordionSummary>
                    <AccordionDetails>
                        <OldSettingControls projectData={projectData} setProjectData={setProjectData}/>
                    </AccordionDetails>
                </Accordion>

                <Accordion style={{borderRadius: "2px 2px 10px 10px"}} sx={{bgcolor:"transparent"}}>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2-content"
                    id="panel2-header"
                    >
                    <h1 style={{margin:0}}>Graph Settings</h1>
                    </AccordionSummary>
                    <AccordionDetails>
                        <NewSettingControls projectId={projectId} changeLayout={changeLayout} initLayout={initLayout} cy={cy} saveGraphPositions={saveGraphPositions} />
                    </AccordionDetails>
                </Accordion>
                
            </Box>
        </Modal>
        <Fab sx={hamburgerStyle} size="large" onClick={() => setModalOpen(true)}>
            <MenuIcon />
        </Fab>
    </>
    )
}

export default SettingsModal;