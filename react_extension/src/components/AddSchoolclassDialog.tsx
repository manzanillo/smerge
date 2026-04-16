import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { createSchoolclass } from '../services/SchoolclassService';
import ISchoolclass from "./models/SchoolclassDto.ts";
import { useTranslation } from 'react-i18next';

interface AddSchoolclassDialogProps {
  setState: (arg0: any[]) => void;
  state: any;
  // Tutorial Interceptor
  onSchoolClassCreated?: (schoolclass: ISchoolclass) => void;
}

const AddSchoolclassDialog = (props: AddSchoolclassDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fabStyle = {
    position: 'absolute',
    bottom: 16,
    right: 16,
  };

  return (
    <React.Fragment>
      <Fab id="add-schoolclass-fab" sx={fabStyle} onClick={handleClickOpen}><AddIcon></AddIcon></Fab>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const name = formJson.name;
            console.log(name);
            const schoolclass = createSchoolclass(name).then((res) => {
              props.setState([...props.state, {'schoolclass':res, 'projects' : []}]);
              if (props.onSchoolClassCreated) {
                props.onSchoolClassCreated(res);
              }
              return res
            });
            handleClose();
          },
        }}
      >
        <DialogTitle>{t('AddSchoolclassDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('AddSchoolclassDialog.description')}
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('AddSchoolclassDialog.cancel')}</Button>
          <Button type="submit">{t('AddSchoolclassDialog.create')}</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default AddSchoolclassDialog;