import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Fab,
  Modal,
  SxProps,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import "./SettingsModal.css";
import OldSettingControls from "./OldSettingControls";
import ProjectDto from "./models/ProjectDto";
import NewSettingControls from "./NewSettingControls";
import { useTranslation } from "react-i18next";

interface SettingsModalProps {
  projectDto: ProjectDto;
  changeLayout: (layoutName: string) => void;
  initLayout?: string;
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
  saveGraphPositions: () => void;
  projectData: ProjectDto;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
  wheelSensitivity: number;
  setWheelSensitivity: (val: number) => void;
  reloadData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  projectDto,
  changeLayout,
  initLayout = "preset",
  cy,
  saveGraphPositions,
  projectData,
  setProjectData,
  wheelSensitivity,
  setWheelSensitivity,
  reloadData,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { t } = useTranslation();

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const hamburgerStyle = {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1200,
    color: "black",
    bgcolor: "white",
  } as SxProps;

  return (
    <>
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        style={{
          overflow: "auto",
          border: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100dvw",
          height: "100dvh",
        }}
        slotProps={{
          backdrop: {
            sx: {
              width: "100dvw",
              height: "100dvh",
            },
          },
        }}
      >
        <Box
          id={"settingsModal"}
          style={{
            overflow: "auto",
            padding: "20px",
            margin: "10px",
            maxHeight: "calc(100vh - 60px)",
          }}
        >
          <Accordion
            style={{ borderRadius: "10px 10px 2px 2px" }}
            defaultExpanded
            sx={{ bgcolor: "transparent" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <h1 style={{ margin: 0 }}>{t("SettingsModal.old_title")}</h1>
            </AccordionSummary>
            <AccordionDetails>
              <OldSettingControls
                projectData={projectData}
                setProjectData={setProjectData}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion
            style={{ borderRadius: "2px 2px 10px 10px" }}
            sx={{ bgcolor: "transparent" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              <h1 style={{ margin: 0 }}>{t("SettingsModal.graph_title")}</h1>
            </AccordionSummary>
            <AccordionDetails>
              <NewSettingControls
                projectDto={projectDto}
                changeLayout={changeLayout}
                initLayout={initLayout}
                cy={cy}
                saveGraphPositions={saveGraphPositions}
                wheelSensitivity={wheelSensitivity}
                setWheelSensitivity={setWheelSensitivity}
                reloadData={reloadData}
                setProjectData={setProjectData}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      </Modal>
      <Fab sx={hamburgerStyle} onClick={() => setModalOpen(true)}>
        <MenuIcon />
      </Fab>
    </>
  );
};

export default SettingsModal;
