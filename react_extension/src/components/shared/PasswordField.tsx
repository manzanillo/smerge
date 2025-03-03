import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { FormControl, IconButton, Input, InputAdornment, InputLabel, SxProps, Theme } from "@mui/material";
import { useState } from "react";

interface PasswordFieldProps{
    name: string;
    handleChange: (event: any) => void;
    labelText?: string;
    sx?: SxProps<Theme>;
    error?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({name, handleChange, labelText="Password", sx={m: 1, width: '25ch' }, error=false}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <FormControl sx={sx} variant="standard">
          <InputLabel error={error} htmlFor="filled-adornment-password">{labelText}</InputLabel>
          <Input
            error={error}
            name={name}
            onChange={handleChange}
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="p_visibility"
                  onClick={()=>setShowPassword((show) => !show)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            }
            // label={labelText}
          />
        </FormControl>
        )
}

export default PasswordField;