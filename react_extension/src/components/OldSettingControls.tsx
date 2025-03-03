import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import PasswordField from "./shared/PasswordField";
import ProjectDto from "./models/ProjectDto";
import TextField from "./shared/TextField";
import Grid from "@mui/material/Unstable_Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import "./OldSettingControls.css";
import {
  postPasswordChange,
  postProjectSettingsChange,
  postDeleteProject,
} from "../services/ProjectService";
import ConfirmButton from "./shared/ConfirmButton";
import ImageButton from "./shared/ImageButton";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "../shared/i18n";

interface OldSettingControlsProps {
  projectData: ProjectDto;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
}

const OldSettingControls: React.FC<OldSettingControlsProps> = ({
  projectData,
  setProjectData,
}) => {
  const [values, setValues] = useState({
    password: "",
    old_password: "",
    project_name: "",
    project_desc: "",
  });
  const [oldPasswordError, setOldPasswordError] = useState(false);

  const { t, i18n } = useTranslation();

  const selectedIndex = (() => {
    return supportedLanguages.indexOf(i18n.language);
  })();

  useEffect(() => {
    setValues({
      ...values,
      project_name: projectData.name,
      project_desc: projectData.description,
    });
  }, [projectData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (event: any) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  const handlePasswordClick = async () => {
    const res = await postPasswordChange(
      projectData.id,
      values.old_password,
      values.password
    );
    if (res) {
      setOldPasswordError(false);
    } else {
      setOldPasswordError(true);
    }
  };

  const handleNameClick = async () => {
    const res = await postProjectSettingsChange(
      projectData.id,
      { ...projectData, name: values.project_name },
      values.old_password
    );
    if (res) {
      setProjectData({ ...res });
      setOldPasswordError(false);
    } else {
      setOldPasswordError(true);
    }
  };

  const handleDescClick = async () => {
    const res = await postProjectSettingsChange(
      projectData.id,
      { ...projectData, description: values.project_desc },
      values.old_password
    );
    if (res) {
      setProjectData({ ...res });
      setOldPasswordError(false);
    } else {
      setOldPasswordError(true);
    }
  };

  const handleDeleteClick = async () => {
    postDeleteProject(projectData.id, values.old_password, () => {
      window.location.href = "/";
    });
    setOldPasswordError(true);
  };

  return (
    <Paper
      elevation={6}
      style={{
        background: "transparent",
        padding: "10px",
        borderRadius: "10px",
        overflow: "auto",
      }}
    >
      <Stack spacing={3}>
        <div>
          <div style={{ textDecoration: "underline", fontWeight: 900 }}>
            {t("OldSettingControls.project_pin")}
          </div>
          <div style={{ textAlign: "center", letterSpacing: "10px" }}>
            {projectData.pin ?? "000000"}
          </div>
        </div>
        <Divider></Divider>
        <div>
          <div style={{ textDecoration: "underline", fontWeight: 900 }}>
            {t("OldSettingControls.change_password")}
          </div>
          <Grid
            container
            spacing={1}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Grid
              sm={5}
              xs={12}
              display={"inline-flex"}
              justifyContent={"center"}
            >
              <PasswordField
                name="old_password"
                labelText={t("OldSettingControls.old_password")}
                handleChange={handleChange}
                error={oldPasswordError}
              ></PasswordField>
            </Grid>
            <Grid
              sm={5}
              xs={12}
              display={"inline-flex"}
              justifyContent={"center"}
            >
              <PasswordField
                name="password"
                labelText={t("OldSettingControls.new_password")}
                handleChange={handleChange}
              ></PasswordField>
            </Grid>
            <Grid
              sm={2}
              xs={12}
              display={"inline-flex"}
              justifyContent={"center"}
            >
              <Button
                variant="contained"
                type="button"
                className={"oldSettingsButton"}
                onClick={handlePasswordClick}
              >
                {t("OldSettingControls.change")}
              </Button>
            </Grid>
          </Grid>
        </div>
        <Divider></Divider>
        <div>
          <div style={{ textDecoration: "underline", fontWeight: 900 }}>
            {t("OldSettingControls.change_project_name")}
          </div>
          <Grid container spacing={1} alignItems={"center"}>
            <Grid
              sm={10}
              xs={12}
              display={"inline-flex"}
              justifyContent={"center"}
            >
              <TextField
                className="oldSettingsTextBox"
                name="project_name"
                defaultValue={projectData.name}
                handleChange={handleChange}
              />
            </Grid>
            <Grid
              sm={2}
              xs={12}
              display={"inline-flex"}
              justifyContent={"center"}
            >
              <Button
                variant="contained"
                type="button"
                className={"oldSettingsButton"}
                onClick={handleNameClick}
              >
                {t("OldSettingControls.change")}
              </Button>
            </Grid>
          </Grid>
        </div>
        <div>
          <div style={{ textDecoration: "underline", fontWeight: 900 }}>
            {t("OldSettingControls.change_project_desc")}
          </div>
          <Grid container spacing={1} alignItems={"center"}>
            <Grid
              sm={10}
              xs={12}
              display={"inline-flex"}
              justifyContent={"center"}
            >
              <TextField
                className="oldSettingsTextBox"
                name="project_desc"
                defaultValue={projectData.description}
                handleChange={handleChange}
              />
            </Grid>
            <Grid
              sm={2}
              xs={12}
              display={"inline-flex"}
              justifyContent={"center"}
            >
              <Button
                variant="contained"
                type="button"
                className={"oldSettingsButton"}
                onClick={handleDescClick}
              >
                {t("OldSettingControls.change")}
              </Button>
            </Grid>
          </Grid>
        </div>
        <Stack justifyContent={"space-around"}>
          <ConfirmButton
            color="secondary"
            text={t("OldSettingControls.delete_project")}
            popoverText="Are you sure to delete this project?"
            handleConfirm={handleDeleteClick}
            confirmColor={"error"}
            cancelColor={"primary"}
          />
        </Stack>
        <div>
          {/* <div style={{ textDecoration: "underline", fontWeight: 900 }}>{t('OldSettingControls.language')}</div>
                    <Stack  margin="10px" marginTop="20px" direction={"row"} spacing={3} alignItems={"center"}>
                        
                        {
                            supportedLanguages.map((lang, index) => (
                                <ImageButton selected={index == selectedIndex} key={lang} onClick={() => { i18n.changeLanguage(lang); }} height={44} src={`/ext/${lang.replace("en", "gb")}.svg`}></ImageButton>
                            ))
                        }
                    </Stack> */}
          <Accordion
            style={{ borderRadius: "10px", minHeight: "20px" }}
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
                {t("OldSettingControls.language")}
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={"row"} spacing={3} alignItems={"center"}>
                {supportedLanguages.map((lang, index) => (
                  <ImageButton
                    selected={index == selectedIndex}
                    key={lang}
                    onClick={() => {
                      i18n.changeLanguage(lang);
                    }}
                    height={44}
                    src={`/ext/${lang.replace("en", "gb")}.svg`}
                  ></ImageButton>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </div>
      </Stack>
    </Paper>
  );
};

export default OldSettingControls;
