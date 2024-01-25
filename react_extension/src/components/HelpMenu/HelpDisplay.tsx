import React, { useState } from "react";
import Carousel from "../Carousel";
import { Backdrop, Fab, Fade } from "@mui/material";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import "../../shared/i18n";
import { useTranslation } from "react-i18next";

import { Page0, Page1 } from "./Pages";

export const HelpDisplay = () => {
  const [carouselOpen, setCarouselOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();

  const checkClickAway = (ev: React.MouseEvent<HTMLElement>) => {
    const target = ev.target as HTMLElement;
    if (target.classList.contains("clickAway")) {
      setCarouselOpen(false);
    }
  };

  return (
    <>
      <Fade in={carouselOpen} timeout={10}>
        <Backdrop
          className="clickAway"
          sx={{
            position: "relative",
            height: "100%",
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={carouselOpen}
          onClick={checkClickAway}
        >
          <Carousel timeout={800}>
            <Page0 />
            <Page1 />
          </Carousel>
        </Backdrop>
      </Fade>
      <Fab
        style={{
          background: "lightgray",
          position: "absolute",
          left: "20px",
          bottom: "20px",
        }}
        onClick={() => {
          setCarouselOpen((prev) => !prev);
        }}
      >
        <QuestionMarkIcon />
      </Fab>
    </>
  );
};
export default HelpDisplay;

// general navigation:
//    - drag left mouse on pane to move
//    - drag left mouse on element to move
//    - mousewheel zoom
//    - double click to open Snap!
// activate js and import data
// how to merge (select, press button and confirm)
// merge conflict node (legende node types)

// how what dose conflict do...

// context menu

// Settings menu (project settings, add password in old password if project has one)
// Layouts types (what dose what, - bullet points)
// What dose save mean, server / local

// good to know 1: switch old new merger
// good to know 2: switch old new merger
