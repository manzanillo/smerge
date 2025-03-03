import React from "react";
import { Stack, useMediaQuery, useTheme } from "@mui/material";
import FlatPagination from "../shared/FlatPagination";

interface HelpDisplayItemProps {
  header: string;
  children?: React.ReactNode;
  height?: number;
}

export const HelpDisplayItem: React.FC<HelpDisplayItemProps> = ({
  header,
  children,
  height = 80,
}) => {
  const [page, setPage] = React.useState(1);
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const childrenArray = React.Children.toArray(children);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));

  const stackHeight =
    childrenArray.length > 1 ? (!isSm ? height - 10 : height) + "dvh" : "";

  return (
    <Stack
      justifyContent={"center"}
      alignItems={"center"}
      style={{ height: stackHeight }}
    >
      <Stack
        style={{
          position: "relative",
          display: "flex",
          height: "100%",
        }}
        justifyContent={"top"}
        alignItems={"center"}
      >
        <div
          style={{
            overflow: "hidden",
            display: "-webkit-box",
            textOverflow: "ellipsis",
            height: "75px",
          }}
        >
          <h1>
            {header +
              (childrenArray.length > 1
                ? ` (${page}/${childrenArray.length})`
                : "")}
          </h1>
        </div>
        {childrenArray[page - 1]}
      </Stack>
      {childrenArray.length > 1 && (
        <FlatPagination
          pageCount={childrenArray.length}
          page={page}
          onChange={handleChange}
          style={{ marginTop: "10px" }}
        ></FlatPagination>
      )}
    </Stack>
  );
};
export default HelpDisplayItem;
