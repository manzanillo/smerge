import { Button } from "@mui/material";
import { CSSProperties } from "react";
import "./ImageButton.css"

interface ImageButtonProps{
    src: string;
    selected?: boolean;
    onClick?: ()=>void;
    height?: number;
    style?: CSSProperties | undefined;
}

const ImageButton: React.FC<ImageButtonProps> = ({src, selected=false, onClick, style, height=40}) => {
    return (
          <Button sx={{borderRadius:"30px !important"}} variant="contained" onClick={onClick} className={+selected?"GlassButtonDarker ImageButtonSelected":"GlassButtonDarker"} style={{...style, height:height+"px", padding: "4px", width:height+"px", minWidth:height+"px"}}>
            <img height={height-8+"px"} src={src}></img>
          </Button>
        )
}

export default ImageButton;