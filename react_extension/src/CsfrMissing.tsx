import { Box, Button, Divider, Stack, Typography } from "@mui/material";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import csfr_badger from "./assets/csfr_badger.jpg";
import { useTranslation } from "react-i18next";
import "./CsfrMissing.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function CsfrMissing() {
  const { t } = useTranslation();

  const { projectId } = useParams();

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev: number) => prev - 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      if ((projectId?.length ?? 0) >= 30) {
        location.href = "/redirect/" + projectId;
      } else {
        location.href = "/open_project/";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

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
          {t("CsfrMissing.buttonText") + ` (${countdown})`}
        </Button>
      </Stack>
    </Box>
  );
}

export default CsfrMissing;
