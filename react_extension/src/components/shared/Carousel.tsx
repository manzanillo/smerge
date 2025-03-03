import React, { useRef, useState } from "react";
import "./Carousel.css";
import { Fab, Slide, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Grid from "@mui/material/Unstable_Grid2";

interface CarouselProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
  timeout: number;
}

const Carousel: React.FC<CarouselProps> = ({ children, timeout = 800 }) => {
  const [index, setIndex] = useState(0);
  const direction = useRef(1);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  return (
    <Grid
      className="clickAway"
      rowSpacing={1}
      justifyContent={"space-around"}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
      container
      spacing={1}
      justifyItems={"center"}
      paddingBottom={{ xs: "100px", sm: "0px" }}
      alignItems={{ xs: "end", sm: "center" }}
    >
      <Grid
        xs={2}
        sm={1}
        order={{ xs: 2, sm: 1 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Fab
          className="GlassButton"
          color="primary"
          aria-label="add"
          onClick={() => {
            direction.current = -1;
            setIndex((last) =>
              last - 1 < 0 ? React.Children.count(children) - 1 : last - 1
            );
          }}
        >
          <ArrowBackIcon />
        </Fab>
      </Grid>
      <Grid xs={12} sm={10} order={{ xs: 1, sm: 2 }}>
        <Stack
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
          direction={"row"}
        >
          {React.Children.map(children, (child, i) => (
            <Slide
              onTransitionEnd={() =>
                setTimeout(() => setSpeedMultiplier(0), 400)
              }
              timeout={timeout / Math.max(speedMultiplier, 1)}
              direction={
                direction.current != 1
                  ? index == i
                    ? "right"
                    : "left"
                  : index == i
                  ? "left"
                  : "right"
              }
              in={index == i}
              style={{
                position: "absolute",
                transitionTimingFunction: "cubic-bezier(.46,.92,.17,.99)",
              }}
              mountOnEnter
              unmountOnExit
            >
              <div
                className="Glass"
                style={{
                  padding: "20px",
                  margin: "10px",
                  width: "100/",
                  borderRadius: "10px",
                }}
              >
                {child &&
                  React.cloneElement(child, {
                    style: { ...child.props.style, width: "100%" },
                  })}
              </div>
            </Slide>
          ))}
        </Stack>
      </Grid>
      <Grid
        xs={2}
        sm={1}
        order={{ xs: 3, sm: 3 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Fab
          className="GlassButton"
          color="primary"
          aria-label="add"
          onClick={() => {
            direction.current = 1;
            setSpeedMultiplier((last) => last * 1.8);
            setIndex((last) => (last + 1) % React.Children.count(children));
          }}
        >
          <ArrowForwardIcon />
        </Fab>
      </Grid>
    </Grid>
  );
};

export default Carousel;

{
  /* <Stack style={{ justifyContent: "center" }} direction={"row"}>
    {React.Children.map(children, (child, i) => (
        <Slide direction={direction.current != 1 ? index == i ? "right" : "left" : index == i ? "left" : "right"} in={index == i} style={{ transitionDelay: index == i ? "300ms" : "0ms" }} mountOnEnter unmountOnExit>
            <Paper elevation={4} sx={{ p: "20px", m: "10px", width: "1000px", borderRadius: "10px" }}>
                {React.cloneElement(child, { style: { ...child.props.style, width: "100%" } })}
            </Paper>
        </Slide>
    ))}
    
</Stack> */
}
