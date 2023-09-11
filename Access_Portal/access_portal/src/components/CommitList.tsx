import React, { useState } from 'react';
import { Avatar, Button, ClickAwayListener, Divider, List, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import Commit from '../models/Commit';
import HashDisplay from './HashDisplay';

interface Props {
  data: Commit[];
}

const CommitList: React.FC<Props> = ({ data }) => {
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: "20px", m: "20px" }}>
      {data.map((commit, index) => (customListItem(commit, (index == data.length - 1))))}
    </List>
  );
};


const customListItem = (commit: Commit, isLast: boolean) => {

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [expanded, setExpanded] = useState(false);

  function handleExpand(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (["INPUT", "svg", "path"].includes(e.target.nodeName)) return;
    setExpanded(!expanded);
  }

  return (
    <div>
      <ListItemButton onClick={(ev) => handleExpand(ev)} style={{ borderRadius: "10px" }}>
        <ListItemAvatar>
          <Avatar alt={commit.author} src="https://avatars.githubusercontent.com/u/2918581?v=4" />
        </ListItemAvatar>
        <ListItemText primary={commit.msg} secondary={"by" + commit.author} />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2">{commit.date}</Typography>
          <Divider sx={{ ml: "10px", mr: "10px" }} orientation='vertical' flexItem />
          <HashDisplay hash={commit.hash} />
        </div>

      </ListItemButton>
      {expanded ? <>
        <Divider sx={{ mt: "10px", mb: "10px" }} variant="middle" orientation='horizontal' flexItem />
        <ClickAwayListener onClickAway={() => setExpanded(false)}>
          <Button sx={{ mb: "10px" }} variant='outlined'>Switch dev server to this commit</Button>
        </ClickAwayListener>
      </> : <></>}
      {!isLast ? <Divider variant="inset" component="li"></Divider> : <></>}
    </div>);
}

export default CommitList;