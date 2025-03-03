import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTranslation } from "react-i18next";

interface NameDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: (res: string) => void;
  def?: string;
}

const NameDialog: React.FC<NameDialogProps> = ({
  open,
  setOpen,
  onClose,
  def,
}) => {
  const { t } = useTranslation();
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: { borderRadius: "5px" },
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const inputName = formJson.inputName;
            console.log(inputName);
            onClose(inputName);
            handleClose();
          },
        }}
      >
        <DialogTitle>{t("NameDialog.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("NameDialog.description")}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="inputName"
            label={t("NameDialog.label")}
            type="text"
            fullWidth
            variant="standard"
            defaultValue={def ?? ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("NameDialog.cancel")}</Button>
          <Button color="success" type="submit">
            {t("NameDialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default NameDialog;
