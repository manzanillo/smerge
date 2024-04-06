import {
  Box,
  CircularProgress,
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
import { useTranslation } from "react-i18next";
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
  const [mergeButtonDisabled, setMergeButtonDisabled] = useState(false);

  const { t } = useTranslation();

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

    setMergeButtonDisabled(true);
    const selected = getSelectedNodes();
    if (selected?.length != 2 && mergeFabColor == "primary") {
      toast.warning(
        selected?.length == 1
          ? t("MergeButtons.selectMinTwo")
          : t("MergeButtons.selectOnlyTwo"),
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        }
      );
      setMergeButtonDisabled(false);
      handleClose();
      return;
    }

    for (const node of selected ?? []) {
      if (node.file_url.includes(".conflict")) {
        toast.warning(t("MergeButtons.noConflictNodes"), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
        setMergeButtonDisabled(false);
        handleClose();
        return;
      }
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
        // console.log(req.response);
        setMergeButtonDisabled(false);
        refresh();
      },
      (req) => {
        // console.log(req);
        setMergeButtonDisabled(false);
        if (req.status > 499) {
          toast.error(`Failed to merge files.`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
          });
        } else {
          toast.error(`${req.responseText}`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
          });
        }
      },
      (req) => {
        setMergeButtonDisabled(false);
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
        // console.log(req.response);
        setMergeButtonDisabled(false);
        refresh();
      },
      (req) => {
        // console.log(req);
        setMergeButtonDisabled(false);
      },
      (req) => {
        setMergeButtonDisabled(false);
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
          disabled={mergeButtonDisabled}
          sx={fabStyle}
          size="large"
          color={mergeFabColor}
          aria-label="add"
          onContextMenu={handleMergeRightClick}
          onClick={mergeButtonDisabled ? () => {} : handleMergePreClick}
        >
          {mergeButtonDisabled ? <CircularProgress /> : <MergeIcon />}
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default MergeButtons;
