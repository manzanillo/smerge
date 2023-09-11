import React, { useRef, useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { toast } from 'react-toastify';

interface HashDisplayProps {
    hash: string;
    charactersToDisplay?: number;
  }

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HashDisplay : React.FC<HashDisplayProps> = ({ hash, charactersToDisplay = 8 }) => {
  const [copied, setCopied] = useState(false);
  //const [displayWidth, setDisplayWidth] = useState(135);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(hash);
    toast.success("Copied commit hash to clipboard.", {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
      });
    setCopied(true);
    
  };

  const divRef = useRef(null);

  // useEffect(()=>{
  //   if(divRef){
  //       setDisplayWidth(65+getTextWidth(hash.substring(0,charactersToDisplay)));
  //   }
  // }, [charactersToDisplay, divRef, hash]);

  // function getTextWidth(text:string) {
  //   const canvas = document.createElement('canvas');
  //   const context:CanvasRenderingContext2D = canvas.getContext('2d') ?? new CanvasRenderingContext2D();

  //   const computedStyle = window.getComputedStyle(divRef.current ?? new Element())
  //   const divFontStyle = computedStyle.font;
    
  //   context.font = divFontStyle;
    
  //   return context?.measureText(text).width ?? 135;
  // }

  // useEffect(() => {
  //   if(copied){
  //       const timer = setTimeout(() => {
  //           setCopied(false);
  //           }, 10000);
  //       return () => clearTimeout(timer);
  //   }
  // }, [copied]);

  return (
    <div ref={divRef}>
      <TextField
        value={hash}
        //style={{ width:displayWidth+"px" }}
        style={{ width:"135px" }}
        variant="outlined"
        // fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleCopyClick}
                edge="end"
                aria-label="copy"
              >
                <FileCopyIcon color={copied?"disabled":"inherit"} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default HashDisplay;
