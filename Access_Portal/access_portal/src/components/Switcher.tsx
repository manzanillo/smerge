
import { Box, Grid } from '@mui/material';
import Commit from '../models/Commit';
import CommitList from './CommitList';
import { getCommits } from "../services/GitService";
import { useCallback, useEffect, useState } from 'react';

export default function Switch() {
  const tmpData = [{
    author: "Richie <richieschmid@live.de>",
    date: "Fri Sep 8 21:24:26 2023 +0200",
    hash: "ac911c7e4c2b7400290108671c8d00b7009c3f1f",
    msg: "updated conda env export"
}] as Commit[]

  const [commits, setCommits] = useState<Commit[]>([]);

  const gatherData = useCallback(async () => {
    let res = await getCommits("origin/master");
    res = res.slice(0,10);
    console.log(res);
    setCommits(res);
  }, []);

  useEffect(()=>{
    gatherData();
  }, []);

  return (
    <Box style={{ height: "100%" }}>
      <Grid
        container
        spacing={0}
        // alignItems="center"
        justifyContent="center"
        sx={{ height: "100%", overflow: "scroll" }}
      >
        <Grid xs="auto">

          <CommitList data={commits}></CommitList>

          {/* <List sx={{ width: '100%', minWidth: 360, bgcolor: 'background.paper' }}>
          <ListItem>
        <ListItemAvatar>
          <Avatar alt="Remy Sharp" src="https://avatars.githubusercontent.com/u/2918581?v=4" />
        </ListItemAvatar>
        <ListItemText primary="Photos" secondary="Jan 9, 2014" />
        <div >test</div>
        <Divider sx={{ml:"10px", mr:"10px"}} orientation='vertical' flexItem/>
        <Typography align='right'><Button variant='outlined' onClick={(e)=> console.log(e.target)}>Switch</Button></Typography>
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg"/>
        </ListItemAvatar>
        <ListItemText primary="Work" secondary="Jan 7, 2014" />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg"/>
        </ListItemAvatar>
        <ListItemText primary="Vacation" secondary="July 20, 2014" />
      </ListItem> */}

          {/* </List> */}
        </Grid>
      </Grid>
    </Box>
  );
}