import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "../components/shared/Footer";
import { lightPageContainer, lightPageContent, primaryButtonSx } from "./publicPageStyles";
import "./Base.css";

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={lightPageContainer}>
      <Box sx={lightPageContent}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" component="h1" sx={{ mb: 3, fontWeight: "bold" }}>
              {t("error_404.title")}
            </Typography>
            <Box sx={{ textAlign: "left", mb: 4, mx: "auto", maxWidth: "600px" }}>
              <Typography paragraph>
                {t("error_404.description")}
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li">{t("error_404.reason_1")}</Typography>
                <Typography component="li">{t("error_404.reason_2")}</Typography>
                <Typography component="li">{t("error_404.reason_3")}</Typography>
              </Box>
              <Typography paragraph>
                {t("error_404.help_text")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={() => navigate("/")}
                sx={primaryButtonSx}
              >
                {t("error_404.home")}
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/open")}
                sx={primaryButtonSx}
              >
                {t("error_404.open_existing")}
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/create")}
                sx={primaryButtonSx}
              >
                {t("error_404.create_new")}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: "#888",
                  color: "#111",
                  "&:hover": { borderColor: "#555", backgroundColor: "rgba(0,0,0,0.05)" }
                }}
              >
                {t("error_404.back")}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default NotFoundPage;

