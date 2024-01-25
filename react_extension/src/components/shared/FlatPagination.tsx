import * as React from "react";
import usePagination from "@mui/material/usePagination";
import { styled } from "@mui/material/styles";
import { IconButton, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import "./FlatPagination.css";

const List = styled("ul")({
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
});

interface FlatPaginationProps {
  pageCount: number;
  onChange?:
    | ((event: React.ChangeEvent<unknown>, page: number) => void)
    | undefined;
  page?: number | undefined;
  style?: React.CSSProperties | undefined;
}

const FlatPagination: React.FC<FlatPaginationProps> = ({
  pageCount,
  onChange,
  page,
  style,
}) => {
  const { items } = usePagination({
    count: pageCount,
    boundaryCount: pageCount,
    page: page,
    onChange: onChange,
  });

  return (
    <div style={style}>
      <List sx={{ alignItems: "center" }}>
        {items.map(({ type, selected, ...item }, index) => {
          let children = null;

          if (type === "start-ellipsis" || type === "end-ellipsis") {
            children = <></>;
          } else if (type === "page") {
            children = (
              <Paper
                sx={{
                  bgcolor: selected ? "primary.main" : "gray",
                  borderRadius: "10px",
                  height: "10px",
                  width: "10px",
                  margin: "10px",
                }}
                {...item}
              ></Paper>
            );
          } else {
            children = (
              <IconButton
                className="FlatPaginationArrow"
                color="primary"
                {...item}
              >
                {type == "next" ? (
                  <ArrowForwardIcon style={{ borderRadius: "20px" }} />
                ) : (
                  <ArrowBackIcon style={{ borderRadius: "20px" }} />
                )}
              </IconButton>
            );
          }

          return <li key={index}>{children}</li>;
        })}
      </List>
    </div>
  );
};

export default FlatPagination;
