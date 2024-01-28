import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import httpService from "../services/HttpService";
import React from "react";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ConfirmButton from "./ConfirmButton";
import ProjectDto from "./models/ProjectDto";
import ProjectColorMenu from "./ProjectColorMenu";

interface NewSettingControlsProps {
  projectDto: ProjectDto;
  changeLayout: (layoutName: string) => void;
  initLayout?: string;
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
  saveGraphPositions: () => void;
  wheelSensitivity: number;
  setWheelSensitivity: (val: number) => void;
  reloadData: () => void;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
}

const NewSettingControls: React.FC<NewSettingControlsProps> = ({
  projectDto,
  changeLayout,
  initLayout = "preset",
  cy,
  saveGraphPositions,
  wheelSensitivity,
  setWheelSensitivity,
  reloadData,
  setProjectData,
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    setLay(event.target.value as string);
    changeLayout(event.target.value as string);
    console.log(event.target.value);
  };

  const { t } = useTranslation();

  const [lay, setLay] = useState(initLayout);

  // ["null", "dagre", "preset", "random", "grid", "circle", "concentric", "breadthfirst", "cose"]
  const layoutNames = [
    "dagre",
    "preset",
    "random",
    "grid",
    "circle",
    "concentric",
    "breadthfirst",
    "cose",
  ];

  const handlePositionFileDownload = () => {
    const json = cy.current?.json();

    // Convert the JSON object to a string
    const jsonString = JSON.stringify(json);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const a = document.createElement("a");

    // Set the href and download attributes of the link
    a.href = url;
    a.download = projectDto.id + "_layout_saved.json";

    // Append the link to the body
    document.body.appendChild(a);

    // Simulate a click on the link
    a.click();

    // Remove the link from the body
    document.body.removeChild(a);
  };

  const handlePositionFileUpload = () => {
    // Create an input element
    const input = document.createElement("input");

    // Set the type attribute to 'file'
    input.type = "file";
    input.accept = "application/JSON";

    // Set the onchange attribute to read the file when it's selected
    input.onchange = function () {
      // Create a new FileReader
      const reader = new FileReader();

      // Set the onload attribute to parse the JSON and restore the graph when the file is read
      reader.onload = function () {
        // Parse the JSON
        const json = JSON.parse(reader.result);

        cy.current?.elements().remove();

        // Restore the graph
        cy.current?.json(json);
      };

      // Read the file as text
      reader.readAsText(input.files[0]);
    };

    // Simulate a click on the input
    input.click();
  };

  const [wheelSensitivityExpanded, setWheelSensitivityExpanded] =
    useState(false);

  return (
    <Paper
      elevation={6}
      style={{
        background: "transparent",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <Stack spacing={2}>
        {/* <h1 style={{margin:"0px"}}>Graph Settings:</h1> */}
        <Tooltip
          enterDelay={500}
          title={t("NewSettingControls.save_graph_pos_tooltip")}
        >
          <Button
            variant="contained"
            onClick={() => {
              setLay("preset");
              saveGraphPositions();
            }}
          >
            {t("NewSettingControls.save_graph_pos")}
          </Button>
        </Tooltip>

        <Divider></Divider>

        <Tooltip
          enterDelay={500}
          title={t("NewSettingControls.save_current_layout_tooltip")}
        >
          <Button variant="contained" onClick={handlePositionFileDownload}>
            {t("NewSettingControls.save_current_layout")}
          </Button>
        </Tooltip>
        <Tooltip
          enterDelay={500}
          title={t("NewSettingControls.load_layout_tooltip")}
        >
          <Button variant="contained" onClick={handlePositionFileUpload}>
            {t("NewSettingControls.load_layout")}
          </Button>
        </Tooltip>

        <Divider></Divider>

        {/* <Box sx={{ minWidth: 120 }}> */}
        <Box>
          <FormControl fullWidth>
            <InputLabel id="layout-select-label">
              {t("NewSettingControls.layout")}
            </InputLabel>
            <Select
              labelId="layout-select-label"
              id="layout-select"
              value={lay}
              label="Layout"
              onChange={handleChange}
            >
              {layoutNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {t(`NewSettingControls.${name}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider></Divider>

        <div>
          <ConfirmButton
            handleConfirm={() => {
              setWheelSensitivityExpanded(true);
            }}
            handleCancel={() => {
              setWheelSensitivityExpanded(false);
            }}
            confirmColor="warning"
            confirmText={t(
              "NewSettingControls.wheel_sensitivity_popover.button"
            )}
            popoverText={t("NewSettingControls.wheel_sensitivity_popover.text")}
            suppressCancel
          >
            <Accordion
              expanded={wheelSensitivityExpanded}
              sx={{ bgcolor: "transparent" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
              >
                <div
                  style={{
                    textDecoration: "underline",
                    fontWeight: 900,
                    height: "20px",
                  }}
                >
                  {t("NewSettingControls.scroll_speed")}
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: "100%" }}>
                  <Slider
                    aria-label="Custom marks"
                    defaultValue={1}
                    min={0.1}
                    max={1.5}
                    step={0.1}
                    valueLabelDisplay="auto"
                    value={wheelSensitivity}
                    onChange={(_, value) => {
                      console.log(value);
                      setWheelSensitivity(value as number);
                    }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          </ConfirmButton>
        </div>

        <Accordion sx={{ bgcolor: "transparent" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
          >
            <div
              style={{
                textDecoration: "underline",
                fontWeight: 900,
                height: "20px",
              }}
            >
              {t("NewSettingControls.color_style")}
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <ProjectColorMenu
              projectDto={projectDto}
              reloadData={reloadData}
              setProjectData={setProjectData}
            ></ProjectColorMenu>
          </AccordionDetails>
        </Accordion>

        <Divider></Divider>

        <Button
          variant="contained"
          onClick={() => {
            window.open(`${httpService.baseURL}${projectId}`, "_self");
          }}
        >
          {t("NewSettingControls.old_projectview")}
        </Button>
      </Stack>
    </Paper>
  );
};

// const [color, setColor] = useState("#aabbcc");
// return

export default NewSettingControls;
