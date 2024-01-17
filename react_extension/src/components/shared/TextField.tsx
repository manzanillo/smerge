import { Input, SxProps, Theme } from "@mui/material";

interface TextFieldProps{
    name: string;
    handleChange: (event: any) => void;
    defaultValue?: string;
    sx?: SxProps<Theme>;
    style?: React.CSSProperties;
    className?: string;
}

const TextField: React.FC<TextFieldProps> = ({name, handleChange, defaultValue, sx, style, className}) => {
    return (
          <Input
            sx={sx}
            style={style}
            className={className}
            defaultValue={defaultValue}
            name={name}
            onChange={handleChange}
            id="filled-adornment-text"
            type={'text'}
          />
        )
}

export default TextField;