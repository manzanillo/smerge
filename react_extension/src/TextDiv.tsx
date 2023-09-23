import './MergeConflictView.css'
import Split from 'react-split'
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';


interface TextDivProps {
    text1: string;
    text2: string;
}

const styleLeft:React.CSSProperties = {textAlign: 'center', borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px"}
const styleRight:React.CSSProperties = {textAlign: 'center', borderTopRightRadius: "20px", borderBottomRightRadius: "20px"}

const TextDiv: React.FC<TextDivProps> = ({ text1, text2 }) => {

    const getTextPane = (text: string, isLeft:boolean) => {
        return (
        <Grid container justifyContent="center" justifyItems={"center"} style={{width:"100%", height:"100%"}}>
            <Paper style={isLeft?styleLeft:styleRight} elevation={1}>
                <h3>{text}</h3>
            </Paper>
        </Grid>
        )
    }

    return (
        // <div className='merge_main_space' >
        //     <div ref={pane} className='merge_main_pane'>
        <Split
            className="split"
            gutterAlign="center"
            sizes={[49.5, 50.5]}
            style={{ height: "600px" }}
        >
            <div style={{ width: "100%", height: "100%" }}>
                {getTextPane(text1,true)}
            </div>
            <div style={{ width: "100%", height: "100%" }}>
                {getTextPane(text2,false)}
            </div>
        </Split>

    )
}

export default TextDiv