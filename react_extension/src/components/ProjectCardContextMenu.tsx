import * as React from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Menu from '@mui/material/Menu';
import ProjectDto from './models/ProjectDto';
import {duplicateProject, postDeleteProject} from '../services/ProjectService';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import {Button} from "@mui/material";

const ProjectCardContextMenu = (props: {
    projectData: ProjectDto,
    addProjectToState: (arg0: ProjectDto) => void,
    deleteProjectFromState: (arg0: ProjectDto) => void
}) => {

    const { t } = useTranslation();
    const ITEM_HEIGHT = 48;

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleImportButtonClick = () => {
        duplicateProject(props.projectData.id).then((res) => {
            if (!res) return;
            props.addProjectToState(res);
        });
        handleClose();
    }

    // Delete Dialog (password input)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [deletePassword, setDeletePassword] = React.useState('');


    const handleDeleteButtonClick = () => {
        setDeletePassword('');
        setDeleteDialogOpen(true);
        handleClose();
    }

    const confirmDelete = () => {
        postDeleteProject(props.projectData.id, deletePassword).then((res) => {
            if (!res) return;
            props.deleteProjectFromState(props.projectData);
        });
        setDeleteDialogOpen(false);
    }

    return (
        <div>
            <IconButton
                aria-label="more"
                id="project-card-context-menu-button"
                aria-controls={open ? 'project-card-context-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                sx={{ p: "2px" }}
            >
                <MoreVertIcon/>
            </IconButton>
            <Menu
                id="project-card-context-menu"
                MenuListProps={{
                    'aria-labelledby': 'project-card-context-menu-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: '20ch',
                        },
                    },
                }}
            >
                <MenuItem onClick={handleImportButtonClick}>
                    <ListItemIcon>
                        <ContentCut fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>{t('ProjectCardContextMenu.duplicate')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDeleteButtonClick}>
                    <ListItemIcon>
                        <ContentPaste fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>{t('ProjectCardContextMenu.delete')}</ListItemText>
                </MenuItem>
            </Menu>

            <Dialog open={deleteDialogOpen} aria-labelledby="delete-project-dialog-title">
                <DialogTitle id="delete-project-dialog-title">{t('ProjectCardContextMenu.delete_project_title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('ProjectCardContextMenu.delete_project_description')}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="project-password"
                        label={t('ProjectCardContextMenu.password_label')}
                        type="password"
                        fullWidth
                        variant="standard"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={confirmDelete} color="error">
                        {t('ProjectCardContextMenu.delete_button')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ProjectCardContextMenu;