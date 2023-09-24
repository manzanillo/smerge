import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Button, ClickAwayListener, Divider, Grid, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import Commit from '../models/Commit';
import HashDisplay from './HashDisplay';
import { range } from 'lodash';
import "./CommitList.css"
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';

interface Props {
  data: Commit[];
  branch: string;
  isLoading?: boolean;
  perPage?: number;
}

const CommitList: React.FC<Props> = ({ data = [{author:"",date:"",msg:"",hash:""}], branch, isLoading, perPage = 10 }) => {

  const [renderList, setRenderList] = useState<Commit[]>([{author:"",date:"",msg:"",hash:""}]);
  const currentPage = useRef<number>(1)

  // select the current page (count from 1...)
  const setListPage = useCallback((page: number) => {
    currentPage.current = page;
    // console.log("Data: ", data);
    const lowerBound = perPage * (page - 1);
    const upperBound = perPage * page;
    const pageList = data.slice(lowerBound, upperBound);
    setRenderList(pageList);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // zero list at beginning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setListPage(1)  }, [data]);

  // State to manage expanded items
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const [skel, setSkel] = useState(true);

  useEffect(() => {
    // Function to handle the keydown event
    function handleKeyDown(event: { shiftKey: unknown; }) {
      if (event.shiftKey) {
        setSkel(false);
        console.log('Shift key is pressed');
      }
    }

    // Function to handle the keyup event
    function handleKeyUp(event: { shiftKey: unknown; }) {
      if (!event.shiftKey) {
        setSkel(true);
        console.log('Shift key is released');
      }
    }

    // Add the event listeners when the component mounts
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clean up the event listeners when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);



  // Function to toggle the expanded state of an item
  const handleExpand = (index: number) => {
    if (expandedItems.includes(index)) {
      setExpandedItems(expandedItems.filter((item) => item !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
    }
  };

  return (
    <Stack spacing={3} alignContent={'center'} alignItems={'center'}>
      <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: "15px" }}>
        {((renderList.length > 0 && skel) && !isLoading)?renderList.map((commit, index) =>
          customListItem(currentPage.current + "-" + index.toString(), commit, branch, index === renderList.length - 1, expandedItems.includes(index), () => handleExpand(index))
        ):
        range(0,perPage,1).map((index) => <div key={"skel-" + index} style={{width:"800px"}}>
          <ListItem sx={{pt:"10px", pr:"10px", pb:"7px", pl:"15px"}}>
            <Stack  direction="row" spacing={2} >
              <Skeleton variant="circular" width={44} height={44} />
              <Skeleton variant="rounded" width={555} height={56} />
              <Skeleton variant="rounded" width={135} height={56} />
            </Stack>
          </ListItem>
          </div>)}
      </List>
      <Pagination
        showFirstButton 
        showLastButton
        size={'large'}
        color="primary"
        count={Math.max(1, Math.ceil(data.length / perPage))}
        onChange={(_, val)=>{setListPage(val)}}
      />
    </Stack>
  );
};


const customListItem = (key:string ,commit: Commit, branch:string, isLast: boolean, expanded: boolean, handleExpand: () => void) => {

  const switchGit = () => {
    const body = {"branch":branch, "commit_hash":commit.hash}
    console.log(body);
  }

  return (
    <div className="commitListDiv" key={key} style={{minWidth:"800px"}}>
      <ListItem>
      <ListItemButton onClick={handleExpand} style={{ borderRadius: "10px" }}>
        <ListItemAvatar>
          <Avatar alt={commit.author} src="https://avatars.githubusercontent.com/u/2918581?v=4" />
        </ListItemAvatar>
        <ListItemText primary={commit.msg} secondary={"by" + commit.author} />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ ml:"10px" }} variant="body2">{commit.date}</Typography>
          <Divider sx={{ ml: "10px" }} orientation='vertical' flexItem />
        </div>

      </ListItemButton>
      <div style={{ marginLeft: 'auto', marginRight:"10px", display: 'flex', alignItems: 'center' }}>
          <HashDisplay hash={commit.hash} />
        </div>
        </ListItem>
      {expanded ? <>
      <Divider sx={{ mt: "10px", mb: "10px" }} variant="middle" orientation='horizontal' flexItem />
      <Grid container justifyContent={"center"}>
          {/* <ClickAwayListener onClickAway={() => handleExpand()}> */}
            <Button sx={{ mt:"10px", mb: "20px" }} onClick={switchGit} variant='outlined'>Switch dev server to this commit</Button>
          
          {/* </ClickAwayListener> */}
          <Button variant="contained" color={"warning"} endIcon={<TurnSlightRightIcon />}>
                            Select Right
                        </Button>
      </Grid></> : <></>}
      {!isLast ? <Divider variant="inset" component="li" sx={{mr:"15px"}}></Divider> : <></>}
    </div>);
}

export default CommitList;