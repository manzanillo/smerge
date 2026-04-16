import { Box, Container, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Footer from "../components/shared/Footer";
import "./Base.css";
import "./HowToPage.css";

const ImpressumPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        color: "black",
      }}
    >
      <Box sx={{ flex: 1, width: "100%" }}>
        <Box className="jumbotron vertical-center" sx={{ width: "100%", py: 2 }}>
          <Container maxWidth="md" className="howto-content">
            <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
              {t("impressum.about_title")}
            </Typography>

            <Typography paragraph>{t("impressum.about_p1")}</Typography>

            <Typography paragraph>
              {t("impressum.about_p2a")}{" "}
              <Link href="https://www.stefanseegerer.de/" target="_blank" rel="noopener noreferrer">
                Stefan Seegerer
              </Link>
              ,{" "}
              <Link href="https://www.michae.li/" target="_blank" rel="noopener noreferrer">
                Tilman Michaeli
              </Link>{" "}
              {t("impressum.about_p2b")}
            </Typography>

            <Typography paragraph>
              {t("impressum.about_p3a")}{" "}
              <Link href="https://hau-rock.de/elisa/" target="_blank" rel="noopener noreferrer">
                Elisa Haubert
              </Link>{" "}
              {t("impressum.about_p3b")}
            </Typography>

            <Typography variant="h3" component="h1" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
              {t("impressum.title")}
            </Typography>

            <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1 }}>
              {t("impressum.section_5tmg")}
            </Typography>
            <Typography paragraph sx={{ whiteSpace: "pre-line" }}>
              {t("impressum.address")}
            </Typography>

            <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1 }}>
              {t("impressum.section_terms")}
            </Typography>
            <Typography paragraph>{t("impressum.terms_p1")}</Typography>
            <Typography paragraph>{t("impressum.terms_p2")}</Typography>
            <Typography paragraph>{t("impressum.terms_p3")}</Typography>

            <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1 }}>
              {t("impressum.section_disclaimer")}
            </Typography>
            <Typography paragraph>{t("impressum.disclaimer_p1")}</Typography>
            <Typography paragraph>{t("impressum.disclaimer_p2")}</Typography>

            <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1 }}>
              {t("impressum.section_links")}
            </Typography>
            <Typography paragraph>{t("impressum.links_p1")}</Typography>
          </Container>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default ImpressumPage;

