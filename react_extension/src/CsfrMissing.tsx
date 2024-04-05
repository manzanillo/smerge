import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import csfr_badger from "./assets/csfr_badger.jpg";
import { useTranslation } from "react-i18next";
import "./CsfrMissing.css";

function CsfrMissing() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        padding: "40px",
        height: "100%",
        width: "100%",
        // background: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack
        sx={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography sx={{ paddingBottom: "40px" }} variant="h3">
          {t("CsfrMissing.missingTextHeader")}
        </Typography>
        <Typography variant="h5">{t("CsfrMissing.missingText")}</Typography>
        <img
          className="badger-image"
          src={csfr_badger}
          alt={"missing token badger"}
          loading="lazy"
        />
        <Divider />
        <Button
          style={{ width: "200px" }}
          variant="contained"
          onClick={() => {
            location.href = "/";
          }}
        >
          {t("CsfrMissing.buttonText")}
        </Button>
      </Stack>
    </Box>
  );
}

export default CsfrMissing;
