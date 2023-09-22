
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import Commit from '../models/Commit';
import CommitList from './CommitList';
import { getBranches, getCommits } from "../services/GitService";
import { useCallback, useEffect, useState } from 'react';

export default function Switch() {
//   const tmpData = [{
//     author: "Richie <richieschmid@live.de>",
//     date: "Fri Sep 8 21:24:26 2023 +0200",
//     hash: "ac911c7e4c2b7400290108671c8d00b7009c3f1f",
//     msg: "updated conda env export"
// }] as Commit[]

  const [commits, setCommits] = useState<Commit[]>([]);
  const [branch, setBranch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const [branches, setBranches] = useState<string[]>([]);

  const gatherBranches = useCallback(async () => {
    const branchData = await getBranches();
    setBranches(branchData.remote_branches);
    setBranch(branchData.remote_branches.filter((b:string) => b.includes(branchData.current_branch))[0]);
  }, []);

  useEffect(() => {
    gatherBranches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const gatherData = useCallback(async () => {
    if(branches.length == 0) return;
    setIsLoading(true);
    const res = await getCommits(branch);
    setCommits(res);
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch]);

  useEffect(()=>{
    gatherData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch]);

  //const [branch, setBranch] = useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setBranch(event.target.value as string);
  };

  const getBranchItems = () => {
    if (!branches) return <MenuItem value=""></MenuItem>;
    return (branches.map((bran) => <MenuItem key={bran} value={bran}>{bran}</MenuItem>));
  }

  return (
    <Box style={{ height: "100%" }}>
      <Grid
        container
        spacing={0}
        // alignItems="center"
        justifyContent="center"
        justifyItems="center"
        sx={{ height: "100%", overflow: "scroll", p:"20px" }}
      >
        <Grid>
          <Grid container >
            <div style={{width:"200px", paddingBottom:"10px"}}>
            <FormControl fullWidth>
              <InputLabel id="branch-label">Branch</InputLabel>
              <Select
                labelId="branch-label"
                id="branch-select"
                value={branch}
                label="Branch"
                onChange={handleChange}
              >
                {getBranchItems()}
                {/* <MenuItem value={"origin/master"}>origin/master</MenuItem>
                <MenuItem value={"origin/1"}>origin/1</MenuItem>
                <MenuItem value={"origin/2"}>origin/2</MenuItem> */}
              </Select>
            </FormControl>
            </div>
            
          </Grid>
          <Grid>
            <CommitList data={commits} branch={branch} isLoading={isLoading}></CommitList>
          </Grid>
      </Grid>
      </Grid>
    </Box>
  );
}