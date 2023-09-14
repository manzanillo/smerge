import { useEffect, useState } from 'react';
import './MergeConfictView.css'
import SnapDiv from './SnapDiv';
import { Button, Stack } from '@fluentui/react';


function MergeConfictView() {

    const [xml1, setXml1] = useState<string>("http://127.0.0.1/media/1.xml");
    const [xml2, setXml2] = useState<string>("http://127.0.0.1/media/2.xml");

    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        console.log("onstart")

        return () => {console.log("onunload")}
    }, []);

    return (
        <>
            {!isLoaded?
            <div className='merge_main_space' >
                <div className='merge_main_pane'>
                    <SnapDiv xml1={xml1} xml2={xml2}></SnapDiv>
                    <Stack horizontal style={{justifyContent:"center", margin:"1em"}}>
                        <Button>Test</Button>
                        <Button>Test</Button>
                    </Stack>
                    
                </div>
            </div>:<></>}
        </>
    )
}

export default MergeConfictView