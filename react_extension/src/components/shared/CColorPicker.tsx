import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { ClickAwayListener, Paper, Stack } from "@mui/material";
import "./CColorPicker.css";

interface MColorPickerProps {
  color: string;
  onChange: (newColor: string) => void;
  label?: string;
}

export const MColorPicker: React.FC<MColorPickerProps> = ({
  color,
  onChange,
  label,
}) => {
  const [isOpen, toggle] = useState(false);

  const presetColors = ["#076AAB", "#417505", "#d0021b"];

  return (
    <div className="picker">
      <Stack direction={"row"}>
        <div
          className="swatch"
          style={{ backgroundColor: color }}
          onClick={() => toggle(true)}
        />
        {label && (
          <div
            style={{
              paddingLeft: "5px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {label}
          </div>
        )}
      </Stack>
      {isOpen && (
        <ClickAwayListener
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onClickAway={(_) => {
            toggle((prev) => {
              return !prev;
            });
          }}
        >
          <Paper elevation={4} style={{ borderRadius: "5px" }}>
            <div className="popover">
              <HexColorPicker color={color} onChange={onChange} />
              <div className="picker__swatches">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    className="picker__swatch"
                    style={{ background: presetColor }}
                    onClick={() => onChange(presetColor)}
                  />
                ))}
              </div>
            </div>
          </Paper>
        </ClickAwayListener>
      )}
    </div>
  );
};

export default MColorPicker;
