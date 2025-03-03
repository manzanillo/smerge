import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Cloud from '@mui/icons-material/Cloud';
import Menu from '@mui/material/Menu';
import ProjectDto from './models/ProjectDto';
import { duplicateProject } from '../services/ProjectService';

const ProjectCardContextMenu = (props: {projectData: ProjectDto, addProjectToState: (arg0: ProjectDto) => void;}) => {

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

  return (
    <div>
        <IconButton
            aria-label="more"
            id="project-card-context-menu-button"
            aria-controls={open ? 'project-card-context-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
        >
            <MoreVertIcon />
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
        <MenuItem>
            <ListItemIcon>
                <ContentCut fontSize="small" />
            </ListItemIcon>
            <ListItemText onClick={handleImportButtonClick}>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem>
            <ListItemIcon>
                <ContentPaste fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
            <ListItemIcon>
                <Cloud fontSize="small" />
        </ListItemIcon>
        <ListItemText>Web Clipboard</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
}

export default ProjectCardContextMenu;