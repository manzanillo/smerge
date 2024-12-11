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

const AddSchoolclassDialog = (props: { setState: (arg0: any[]) => void; state: any; }) => {
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
      <Fab sx={fabStyle} onClick={handleClickOpen}><AddIcon></AddIcon></Fab>
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
              props.setState([...props.state, {'schoolclass':res, 'projects' : []}])
              return res
            });
            handleClose();
          },
        }}
      >
        <DialogTitle>Create new Schoolclass</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for the new Schoolclass
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default AddSchoolclassDialog;