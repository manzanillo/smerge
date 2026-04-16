import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { IconButton, Tooltip } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { getProjectData, getProjectDataWithPin, importProjectToSchoolclass } from '../services/ProjectService';
import SchoolclassDto from './models/SchoolclassDto';
import ProjectDto from './models/ProjectDto';
import { useTranslation } from 'react-i18next';

const ImportProjectDialog = (props: {schoolClass: SchoolclassDto; addProjectToState: (arg0:ProjectDto) => void}) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Tooltip title={t('ImportProjectDialog.tooltip')}>
        <IconButton onClick={handleClickOpen}><SystemUpdateAltIcon /></IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const projectId = formJson.projectId;
            if(projectId.includes('-')) {
              getProjectData(projectId).then((response) => {
                const project = response;
                if(project) {
                  project.schoolclass = props.schoolClass.id;
                  importProjectToSchoolclass(projectId, project).then((res) => {
                    if (!res) return;
                    props.addProjectToState(res);
                  });
                }
                else return null;
              });
            }
            else {
              getProjectDataWithPin(projectId).then((response) => {
                const project = response;
                if(project) {
                  project.schoolclass = props.schoolClass.id;
                  importProjectToSchoolclass(project.id, project).then((res) => {
                    if (!res) return;
                    props.addProjectToState(res);
                 });
                }
                else return null;
              });
            }
            handleClose();
          },
        }}
      >
        <DialogTitle>{t('ImportProjectDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('ImportProjectDialog.description')}
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="projectid"
            name="projectId"
            label={t('ImportProjectDialog.project_id_label')}
            type="string"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('ImportProjectDialog.cancel')}</Button>
          <Button type="submit">{t('ImportProjectDialog.import')}</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default ImportProjectDialog;