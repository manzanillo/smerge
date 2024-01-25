import {
  Button,
  ButtonPropsColorOverrides,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { OverridableStringUnion } from "@mui/types";
import React from "react";

interface ConfirmButtonProps {
  text?: string;
  color?:
    | OverridableStringUnion<
        | "inherit"
        | "success"
        | "primary"
        | "secondary"
        | "error"
        | "info"
        | "warning",
        ButtonPropsColorOverrides
      >
    | undefined;
  popoverText?: string;
  confirmText?: string;
  cancelText?: string;
  handleConfirm?: () => void;
  handleCancel?: () => void;
  confirmColor?:
    | OverridableStringUnion<
        | "inherit"
        | "success"
        | "primary"
        | "secondary"
        | "error"
        | "info"
        | "warning",
        ButtonPropsColorOverrides
      >
    | undefined;
  cancelColor?:
    | OverridableStringUnion<
        | "inherit"
        | "success"
        | "primary"
        | "secondary"
        | "error"
        | "info"
        | "warning",
        ButtonPropsColorOverrides
      >
    | undefined;
  suppressCancel?: boolean;
  children?: React.ReactNode;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  text = "Open",
  color = "primary",
  popoverText = "Are you sure to do this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  handleConfirm = () => {},
  handleCancel = () => {},
  confirmColor = "success",
  cancelColor = "error",
  suppressCancel = false,
  children,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(event.currentTarget);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      {children ? (
        React.Children.map(children, (child) => {
          return React.cloneElement(child, {
            onChange: handleClick,
          });
        })
      ) : (
        <Button
          color={color}
          aria-describedby={id}
          variant="contained"
          onClick={handleClick}
        >
          {text}
        </Button>
      )}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        slotProps={{
          paper: {
            style: { backgroundColor: "background", borderRadius: "10px" },
          },
        }}
      >
        <Typography sx={{ p: 2, pb: 1 }}>{popoverText}</Typography>
        <Stack
          padding={"10px"}
          justifyContent={"space-evenly"}
          spacing={1}
          direction={"row"}
        >
          <Button
            color={confirmColor}
            variant="contained"
            onClick={() => {
              handleClose();
              handleConfirm();
            }}
          >
            {confirmText}
          </Button>
          {!suppressCancel && (
            <Button
              color={cancelColor}
              variant="contained"
              onClick={() => {
                handleClose();
                handleCancel();
              }}
            >
              {cancelText}
            </Button>
          )}
        </Stack>
      </Popover>
    </>
  );
};

export default ConfirmButton;
