import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { IconButton, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { createProject } from '../services/ProjectService';
import SchoolclassDto from './models/SchoolclassDto';
import ProjectDto from './models/ProjectDto';
import { useTranslation } from 'react-i18next';

interface AddProjectDialogProps {
  schoolClass: SchoolclassDto;
  addProjectToState: (arg0: ProjectDto) => void;
  // Tutorial
  onButtonClick?: () => void;
}

const AddProjectDialog = (props: AddProjectDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const { t } = useTranslation();

  const handleClickOpen = () => {
    if (props.onButtonClick) {
      props.onButtonClick();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
  };

  return (
    <React.Fragment>
      <Tooltip title={t('AddProjectDialog.tooltip')}>
        <IconButton onClick={handleClickOpen} className="addProjectButton"><AddIcon /></IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const name = String(formData.get('name') ?? '').trim();
            const description = String(formData.get('description') ?? '').trim();
            const startDescription = String(formData.get('start_description') ?? '').trim();
            if (!name) return;

            const res = await createProject({
              name,
              description,
              startDescription,
              file,
              schoolclassId: props.schoolClass.id,
            });

            if (res) {
              console.log(res);
              props.addProjectToState(res);
            }
            handleClose();
          },
        }}
      >
        <DialogTitle id="addProjectTitle">{t('AddProjectDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="addProjectDescription">
            {t('AddProjectDialog.description')}
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label={t('AddProjectDialog.name_label')}
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label={t('AddProjectDialog.description_optional')}
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            id="start_description"
            name="start_description"
            label={t('AddProjectDialog.start_description_optional')}
            type="text"
            fullWidth
            variant="standard"
          />
          <Button variant="outlined" component="label" sx={{ mt: 2, mb: 1 }}>
            {t('AddProjectDialog.file_optional')}
            <input
              hidden
              type="file"
              accept=".xml"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </Button>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {file ? file.name : t('AddProjectDialog.no_file')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t('AddProjectDialog.start_file_help_1')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t('AddProjectDialog.start_file_help_2')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('AddProjectDialog.cancel')}</Button>
          <Button type="submit">{t('AddProjectDialog.create')}</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default AddProjectDialog;