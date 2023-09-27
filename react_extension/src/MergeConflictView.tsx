/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import './MergeConflictView.css'
import SnapDiv from './SnapDiv';
import TurnSlightLeftIcon from '@mui/icons-material/TurnSlightLeft';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
// import Button from '@mui/material/Button';
import { Box, Button, CircularProgress } from '@mui/material';
import Stack from '@mui/material/Stack';
import TextDiv from './TextDiv';


interface MergeConflictViewProps {
    code?: string;
    isActive?: boolean;
    isText?: boolean;
    leftLink?: string;
    rightLink?: string;
}

const MergeConflictView: React.FC<MergeConflictViewProps> = ({ code = "", leftLink="", rightLink="" ,isActive, isText = false }) => {

    const serverEndpoint = "http://127.0.0.1"

    const [xml1, setXml1] = useState<string>(serverEndpoint + leftLink);
    const [xml2, setXml2] = useState<string>(serverEndpoint + rightLink);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        console.log("onstart")

        return () => { console.log("onunload") }
    }, []);

    return (
        <>
            {(!isLoaded && isActive && (xml1 != "" && xml2 != "")) ?
                <div className='merge_main_space' >
                    <div className='merge_main_pane' >
                        {isText?<TextDiv text1={xml1} text2={xml2}/>:<SnapDiv xml1={xml1} xml2={xml2}></SnapDiv>}
                    </div>
                    <Stack direction="row" spacing={10} justifyContent={"center"} sx={{pt:"20px"}}>
                        <Button variant="contained" color={"success"} startIcon={<TurnSlightLeftIcon />}>
                            Select Left
                        </Button>
                        <Button variant="contained" color={"warning"} endIcon={<TurnSlightRightIcon />}>
                            Select Right
                        </Button>
                    </Stack>
                </div> : <Box sx={{ paddingTop:"20px", width:"100%", height:"100%", display:"flex", justifyContent:"center", alignItems: "center" }}><Stack alignItems={"center"}><CircularProgress size="64px" /><h1>Loading conflicts...</h1></Stack></Box>}
        </>
    )
}

export default MergeConflictView