import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "../components/shared/Footer";
import { createProjectPublic } from "../services/PublicProjectService";
import {
  lightPageContainer,
  lightPageContent,
  lightTextFieldSx,
  primaryButtonSx,
  lightAccordionSx,
  lightAccordionSummarySx,
  lightAccordionDetailsSx,
} from "./publicPageStyles";
import "./Base.css";

const CreateProjectPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [startDescription, setStartDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState<{
    projectId: string;
    pin: string;
    password: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await createProjectPublic({
        name: name.trim(),
        description,
        password,
        email,
        startDescription,
        file,
      });
      setCreatedProject({
        projectId: result.project_id,
        pin: result.pin,
        password: result.password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("create_project.error_generic"));
    } finally {
      setIsSubmitting(false);
    }
  };
  if (createdProject) {
    return (
      <Box sx={lightPageContainer}>
        <Box sx={lightPageContent}>
          <Container maxWidth="sm">
            <Typography paragraph>
              {createdProject.password
                ? t("create_project.created_with_password")
                : t("create_project.created_without_password")}
            </Typography>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography>
                {t("create_project.pin_label")} {createdProject.pin}
              </Typography>
              {createdProject.password ? (
                <Typography>
                  {t("create_project.password_label")} {createdProject.password}
                </Typography>
              ) : null}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={() => navigate(`/project_view/${createdProject.projectId}`)}
                sx={primaryButtonSx}
              >
                OK
              </Button>
            </Box>
          </Container>
        </Box>
        <Footer />
      </Box>
    );
  }
  return (
    <Box sx={lightPageContainer}>
      <Box sx={lightPageContent}>
        <Container maxWidth="sm">
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t("create_project.title")}
            </Typography>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}
            <TextField
              fullWidth
              required
              label={t("create_project.name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              sx={{ ...lightTextFieldSx, mb: 2 }}
            />
            <TextField
              fullWidth
              label={t("create_project.description_optional")}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              sx={{ ...lightTextFieldSx, mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label={t("create_project.password_optional")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              sx={{ ...lightTextFieldSx, mb: 2 }}
            />
            <TextField
              fullWidth
              type="email"
              label={t("create_project.email_optional")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              sx={{ ...lightTextFieldSx, mb: 2 }}
            />
            <Accordion sx={{ ...lightAccordionSx, mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#111" }} />}
                sx={lightAccordionSummarySx}
              >
                <Typography>{t("create_project.optional_start_file")}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={lightAccordionDetailsSx}>
                <TextField
                  fullWidth
                  label={t("create_project.start_description_optional")}
                  value={startDescription}
                  onChange={(event) => setStartDescription(event.target.value)}
                  sx={{ ...lightTextFieldSx, mb: 2 }}
                />
                <Button variant="outlined" component="label" sx={{ mb: 1 }}>
                  {t("create_project.file_optional")}
                  <input
                    hidden
                    type="file"
                    accept=".xml"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                </Button>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {file ? file.name : t("create_project.no_file")}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t("create_project.start_file_help_1")}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t("create_project.start_file_help_2")}
                </Typography>
                <Typography variant="body2">
                  {t("create_project.start_file_help_3")}
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={primaryButtonSx}
              >
                {t("create_project.submit")}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};
export default CreateProjectPage;
