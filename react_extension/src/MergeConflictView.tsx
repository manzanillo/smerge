/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import './MergeConflictView.css'
import SnapDiv from './SnapDiv';
import TurnSlightLeftIcon from '@mui/icons-material/TurnSlightLeft';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
// import Button from '@mui/material/Button';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import TextDiv from './TextDiv';


interface MergeConflictViewProps {
    code?: string;
    isActive?: boolean;
    isText?: boolean;
}

const MergeConflictView: React.FC<MergeConflictViewProps> = ({ code = "", isActive, isText = false }) => {


    const [xml1, setXml1] = useState<string>("http://127.0.0.1/media/1.xml");
    const [xml2, setXml2] = useState<string>("http://127.0.0.1/media/2.xml");

    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        console.log("onstart")

        return () => { console.log("onunload") }
    }, []);

    return (
        <>
            {(!isLoaded && isActive) ?
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
                </div> : <></>}
        </>
    )
}

export default MergeConflictView