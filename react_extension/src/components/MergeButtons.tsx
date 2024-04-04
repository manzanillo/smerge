import {
  Box,
  Fab,
  Popover,
  PropTypes,
  Stack,
  SxProps,
  Tooltip,
} from "@mui/material";
import httpService from "../services/HttpService";
import { useState } from "react";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MergeIcon from "@mui/icons-material/Merge";
import { toast } from "react-toastify";
// import "./SettingsModal.css";

interface MergeButtonsProps {
  cyRef: React.MutableRefObject<cytoscape.Core | undefined>;
  refresh: () => void;
  projectId: string;
}

const MergeButtons: React.FC<MergeButtonsProps> = ({
  cyRef,
  refresh,
  projectId,
}) => {
  const fabStyle = {
    position: "absolute",
    borderRadius: "32px",
    bottom: 20,
    right: 20,
  } as SxProps;

  const [mergeFabColor, setMergeFabColor] = useState<
    "success" | "error" | "info" | "warning" | PropTypes.Color
  >("primary");
  const [mergeTooltip, setMergeTooltip] = useState<string>("New Merge");

  const getSelectedNodes = () => {
    const cy = cyRef.current;
    const selectedNodes = cy?.$("node:selected");
    const selectedNodeData = selectedNodes?.map((node) => node.data());
    console.log(selectedNodeData);
    return selectedNodeData;
  };

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMergeRightClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (mergeFabColor == "primary") {
      setMergeFabColor("warning");
      setMergeTooltip("Original Merge");
    } else {
      setMergeFabColor("primary");
      setMergeTooltip("New Merge");
    }
  };

  const handleMergePreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleMergeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const selected = getSelectedNodes();
    if (selected?.length != 2 && mergeFabColor == "primary") {
      toast.warning(`Please select only two nodes for a merge.`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
      handleClose();
      return;
    }

    if (mergeFabColor == "primary") {
      mergeNew(selected);
    } else {
      mergeOld(selected);
    }
    handleClose();
  };

  const mergeNew = (selected: { id: string }[]) => {
    const url = `new_merge/${projectId}?file=${selected[0].id}&file=${selected[1].id}`;
    httpService.get(
      url,
      (req) => {
        console.log(req.response);
        refresh();
      },
      (req) => {
        console.log(req);
        toast.error(`${req.responseText}`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
      },
      (req) => {
        window.open(req.responseText, "_blank");
      },
      true,
      true
    );
  };

  const mergeOld = (selected: { id: string }[]) => {
    const fileParams = selected.map((item) => `file=${item.id}`).join("&");
    const url = `merge/${projectId}?${fileParams}`;

    httpService.get(
      url,
      (req) => {
        console.log(req.response);
        refresh();
      },
      (req) => {
        console.log(req);
      },
      (req) => {
        window.open(req.responseText, "_blank");
      },
      true,
      false
    );
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        elevation={8}
        transformOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            style: { backgroundColor: "transparent", borderRadius: "32px" },
          },
        }}
      >
        <Stack direction="row" spacing={1} padding={"5px"}>
          <Tooltip title={"Cancel"}>
            <Fab
              sx={{ p: "5px" }}
              size="large"
              color="error"
              aria-label="remove"
              onClick={handleClose}
            >
              <CloseIcon />
            </Fab>
          </Tooltip>
          <Tooltip title={"Confirm"}>
            <Fab
              sx={{ p: "5px" }}
              size="large"
              color="success"
              aria-label="add"
              onClick={handleMergeClick}
            >
              <CheckIcon />
            </Fab>
          </Tooltip>
        </Stack>
      </Popover>

      <Tooltip title={mergeTooltip}>
        <Fab
          sx={fabStyle}
          size="large"
          color={mergeFabColor}
          aria-label="add"
          onContextMenu={handleMergeRightClick}
          onClick={handleMergePreClick}
        >
          <MergeIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default MergeButtons;
