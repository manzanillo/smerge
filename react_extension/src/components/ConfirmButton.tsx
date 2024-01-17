import { Button, Popover, Stack, Typography } from "@mui/material";
import { useState } from "react";

interface ConfirmButtonProps {
    text: string;
    popoverText?: string;
    confirmText?: string;
    cancelText?: string;
    handleConfirm?: () => void;
    handleCancel?: () => void;
    confirmColor: OverridableStringUnion<"inherit" | "success" | "primary" | "secondary" | "error" | "info" | "warning", ButtonPropsColorOverrides> | undefined;
    cancelColor: OverridableStringUnion<"inherit" | "success" | "primary" | "secondary" | "error" | "info" | "warning", ButtonPropsColorOverrides> | undefined;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ text, popoverText = "Are you sure to do this action?", confirmText = "Confirm", cancelText = "Cancel", handleConfirm = () => {}, handleCancel = () => {}, confirmColor="success", cancelColor="error"}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <Button aria-describedby={id} variant="contained" onClick={handleClick}>
                {text}
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                slotProps={{
                    paper: { style: { backgroundColor: 'background', borderRadius: "10px" } },
                }}
            >
                <Typography sx={{ p: 2, pb: 1 }}>{popoverText}</Typography>
                <Stack padding={"10px"} justifyContent={"space-evenly"} spacing={1} direction={"row"}>
                    <Button color={confirmColor} variant="contained" onClick={()=>{handleClose(); handleConfirm();}}>{confirmText}</Button>
                    <Button color={cancelColor} variant="contained" onClick={()=>{handleClose(); handleCancel();}}>{cancelText}</Button>
                </Stack>
            </Popover>
        </>
    );
}

export default ConfirmButton;