import "./MergeConflictView.css";
import Split from "react-split";
import Paper from "@mui/material/Paper";
// import Grid from '@mui/material/Grid';
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import httpService from "./services/HttpService";
import { Box, CircularProgress, Stack } from "@mui/material";

interface TextDivProps {
  text1: string;
  text2: string;
}

const styleLeft: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  borderTopLeftRadius: "20px",
  borderBottomLeftRadius: "20px",
  overflow: "auto",
  maxHeight: "600px",
  width: "100%",
};
const styleRight: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  borderTopRightRadius: "20px",
  borderBottomRightRadius: "20px",
  overflow: "auto",
  maxHeight: "600px",
  width: "100%",
};

const AttributeDiv: React.FC<TextDivProps> = ({ text1, text2 }) => {
  const getAttributePane = (
    attributes: { key: string; value: string }[],
    isLeft: boolean
  ) => {
    return (
      <Grid
        container
        justifyContent="center"
        justifyItems={"center"}
        style={{ height: "100%" }}
      >
        <Paper style={isLeft ? styleLeft : styleRight} elevation={1}>
          <ul>
            {attributes.map((item, index) =>
              item.key === "costume" ? (
                <li key={index}>
                  <div style={{ display: "flex" }}>
                    {" "}
                    {`${item.key}:`}
                    <img
                      style={{
                        background: "white",
                        borderRadius: "5px",
                        marginLeft: "10px",
                      }}
                      src={item.value}
                    />
                  </div>
                </li>
              ) : (
                <li key={index}> {`${item.key}:\t${item.value}`}</li>
              )
            )}
          </ul>
        </Paper>
      </Grid>
    );
  };

  const textToAttributes = (text: string) => {
    const keyValues = text.split(";;;");
    return keyValues.map((item) => {
      return {
        key: item.split(":::")[0].replace("'", ""),
        value: item.split(":::")[1].replace("'", ""),
      };
    });
  };

  const [text1Loading, setText1Loading] = useState(true);
  const [text2Loading, setText2Loading] = useState(true);
  const [text1Data, setText1Data] = useState("");
  const [text2Data, setText2Data] = useState("");

  useEffect(() => {
    httpService.get(
      text1,
      (req) => {
        setText1Data(req.response);
        setText1Loading(false);
      },
      (req) => {
        console.log(req);
      },
      () => {},
      true,
      false
    );
    httpService.get(
      text2,
      (req) => {
        setText2Data(req.response);
        setText2Loading(false);
      },
      (req) => {
        console.log(req);
      },
      () => {},
      true,
      false
    );
  }, []);

  return (
    <>
      {!text1Loading && !text2Loading ? (
        <Split
          className="split"
          gutterAlign="center"
          snapOffset={200}
          sizes={[49.5, 50.5]}
          // style={{ minHeight: "80px" }}
        >
          <div>{getAttributePane(textToAttributes(text1Data), true)}</div>
          <div>{getAttributePane(textToAttributes(text2Data), false)}</div>
        </Split>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack alignItems={"center"}>
            <CircularProgress size="64px" />
            <h1>Loading conflicts...</h1>
          </Stack>
        </Box>
      )}
    </>
  );
};

export default AttributeDiv;
