import { ControlledBoard, addCard, changeCard, removeCard, Card, moveCard, moveColumn, addColumn,
  removeColumn, changeColumn, KanbanBoard as KB } from "@caldwell619/react-kanban"
import React, { useState, useEffect, useRef } from "react";
import {Typography, Button, Box, TextField, Backdrop, Fab, Fade, Stack, IconButton } from "@mui/material";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ProjectDto from "../models/ProjectDto";
import { putKanbanChange } from "../../services/ProjectService";
import "./styles.css"
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { HexColorPicker } from "react-colorful";
import PaletteIcon from '@mui/icons-material/Palette';
import Dialog from '@mui/material/Dialog';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DialogActions from '@mui/material/DialogActions';

interface KanbanBoardProps {
  projectData: ProjectDto;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
}

// Only a limited number of cards and length of text in cards is allowed
const max_card_length = 200
const max_card_number = 20
const max_card_lines = 5
const max_column_number = 5

// predefine some card background colors to make it easy to select distinct ones
// all colors have the same brightness and saturation to keep the text readable
const predefinedCardColors = ["#FA9191", "#FAC591", "#F9F991", "#91FA91", "#91FAFA", "#90CAF9", "#9191FA", "#FA91FA"];
const defaultCardColor = "#90CAF9"
const editCardColor = "#C4C4C4"

const renderColumnHeader = (column, board, setBoard, configOpen) => {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const { t, i18n } = useTranslation();

  const onAdd = () => {
    var number_of_cards = 0
    for (const col of board.columns) {
      number_of_cards = number_of_cards + col.cards.length
    }

    if (number_of_cards < max_card_number) {
      // Every card needs an unique id
      setBoard(addCard(board, column, {id: Math.random()}, { on: 'bottom' }))
    } else
      toast.warning(t("KanbanBoard.cardLimit"), {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
  };

  return (
    <Box display="flex" alignItems="center" gap={2} sx={{ pb: '5px', width: '308px', height: '47px'}}>
      <Typography variant="h4" sx={{overflow: 'hidden'}}>
        {column.titleChanged ? column.title : t(column.title)}
      </Typography>

      {configOpen ?
        <Button
          sx={{ marginLeft: 'auto', backgroundColor: '#BD5F00', color: 'white', '&:hover': {
            backgroundColor: '#FF8000',
            color: 'black',
          },}}
          variant="contained"
          onClick={() => {
            setTitle(column.titleChanged ? column.title : t(column.title))
            setEditMode(true)
          }}
        >
          EDIT
        </Button>
      :
        <Button
          sx={{ marginLeft: 'auto', backgroundColor: '#076AAB', color: 'white' }}
          variant="contained"
          onClick={onAdd}
        >
          Add
        </Button>
      }
      <Dialog
          open={editMode}
          onClose={() => {
            setEditMode(false)
          }}
      >
        <TextField
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          sx={{m:"16px"}}
        />
        <DialogActions>
          <Button sx={{ marginLeft: 'auto', color: 'red'}} onClick={() => {
            setBoard(removeColumn(board, column))
            setEditMode(false)
          }}>
            {t("KanbanBoard.deleteColumn")}
          </Button>
          <Button onClick={() => {
              setEditMode(false)
          }}>
            {t("KanbanBoard.cancel")}
          </Button>
          <Button onClick={() => {
            setBoard(changeColumn(board, column, {title: title, titleChanged: true}))
            setEditMode(false)
          }}>
            {t("KanbanBoard.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

const renderCard = (card, board, setBoard) => {
  const [editMode, setEditMode] = useState(false);
  const [text, setText] = useState(card.description);

  const inputRef = useRef(null);

  // Does not work in makeEdit
  useEffect(() => {
    if (inputRef && inputRef.current && editMode) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length)
    }
  }, [editMode]);

  const makeEdit = () => {
    setEditMode(true);
  };

  // Save and send change to backend
  const saveEdit = () => {
    setEditMode(false);
    setBoard(changeCard(board, card.id, {description: text}))
  };

  // When someone is typing only update locally
  const handleChange = (event) => {
    const newText = event.target.value;
    const lines = newText.split('\n').length;
    if (lines <= max_card_lines) {
      setText(newText);
    }
  };

  const [color, setColor] = useState(card.color ? card.color : defaultCardColor);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const saveColor = () => {
    setColorPickerOpen(false);
    setBoard(changeCard(board, card.id, {color: color}))
  };

  // For synchronization
  useEffect(() => {
    setText(card.description)
  }, [card.description]);

  useEffect(() => {
    if (card.color)
      setColor(card.color)
  }, [card.color]);

  const deleteCard = () => {
    const column = board.columns.find(e => e.cards.some(c => c.id === card.id))
    setBoard(removeCard(board, column, card))
  };

  return (
    <Box spacing={2} sx={{
      bgcolor: editMode ? editCardColor : color,
      borderRadius: 3,
      width: '308px',
      my: '3px',
      boxShadow: 1,
      display: 'flex',
      flexDirection: 'row'
    }}>
      <div style={{'pointer-events': editMode ? 'auto' : 'none'}}>
        <TextField
          multiline
          minRows={2}
          value={text}
          onChange={handleChange}
          disabled={!editMode}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              saveEdit();
            }
          }}
          inputRef={inputRef}
          inputProps={{ maxLength: max_card_length }}
          sx={{
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: 'black',
              color: 'black',
            },
            '& .MuiInputBase-input': {
              color: '#323232',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        />
      </div>

      <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: "auto"}}>
        <Button
          sx={{color: 'black'}}
          onClick={deleteCard}
        >
          X
        </Button>

        <IconButton
          sx={{color: 'black', marginTop: 'auto'}}
          onClick={() => {
            setColorPickerOpen((prev) => !prev);
          }}
        >
          <PaletteIcon/>
        </IconButton>

        <Dialog
          onClose={saveColor}
          open={colorPickerOpen}
        >
          <div class = "card-color-picker">
            <HexColorPicker
              color={color}
              onChange={(color) => {
                setColor(color);
              }}
            />
          </div>
          <Box>
          {predefinedCardColors.map((pColor) => (
              <Button
                variant="contained"
                style={{ background: pColor }}
                onClick={() => setColor(pColor)}
                sx={{
                  width: '40px',
                  height: '40px',
              }}
              />
            ))}
          </Box>
        </Dialog>

        <IconButton
          sx={{color: 'black',  marginTop: 'auto'}}
          onClick={editMode ? saveEdit : makeEdit}
        >
          {editMode ? <SaveIcon/> : <EditIcon/>}
        </IconButton>
      </Box>
    </Box>
  )
}


// The KanbanBoard and the button to open it

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectData, setProjectData }) => {
  const [boardlOpen, setBoardOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const checkCloseKanbanBoard = (ev: React.MouseEvent<HTMLElement>) => {
    const target = ev.target as HTMLElement;
    if (target.classList.contains("closeKanbanBoard")) {
      setBoardOpen(false);
      setConfigOpen(false);
    }
  };

  // This is provided by the django backend
  //const initboard = {
    //columns: [
      //{id: 1, title: 'KanbanBoard.todo', cards: []},
      //{id: 2, title: 'KanbanBoard.wip', cards: []},
      //{id: 3, title: 'KanbanBoard.done', cards: []}
    //]
  //}

  const [board, setBoard] = useState<KB>({columns: []})

  // Sets the board and sync with backend
  const updateBoard = (b) => {
    if (!('version' in b)) {
      b.version = 0
    }
    b.version += 1
    putKanbanChange(projectData.id, b);
    setBoard(b)
  }

  useEffect(() => {
    if (projectData && projectData.kanban_board) {
      let new_board = JSON.parse(projectData.kanban_board)
      if (!('version' in board) || new_board.version > board.version) {
        setBoard(new_board)
      }
    }
  }, [projectData]);

  const { t, i18n } = useTranslation();

  const onAddColumn = () => {
    if (board.columns.length < max_column_number) {
      setBoard(addColumn(board, {id: Math.random(), title: '', cards: []}))
    } else
      toast.warning(t("KanbanBoard.columnLimit"), {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
  };

  return (
    <>
      <Fade in={boardlOpen} timeout={10}>
        <Backdrop
          className="closeKanbanBoard"
          sx={{
            position: "absolute",
            height: "100%",
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '10px'
          }}
          open={boardlOpen}
          onClick={checkCloseKanbanBoard}
          onKeyDown={(e) => {
            if (e.key == 'Escape') {
              setBoardOpen(false);
              setConfigOpen(false);
            }
          }}
        >
          <div style={{
            color: "black",
            left: '20%',
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'flex-start'}}>
              {configOpen && <AddBoxIcon fontSize="large" sx={{ opacity: 0, m: "8px"}}/>}
              <ControlledBoard
                disableColumnDrag={!configOpen}
                renderCard={(p) => renderCard(p, board, updateBoard)}
                renderColumnHeader={(p) => renderColumnHeader(p, board, updateBoard, configOpen)}
                onCardDragEnd={(card, source, destination) => {
                  return updateBoard(moveCard(board, source, destination))
                }}
                onColumnDragEnd={(c, source, destination) => {
                  return updateBoard(moveColumn(board, source, destination))
                }}
                allowAddCard={false}
              >
              {board}
              </ControlledBoard>
              {configOpen && <IconButton
                  variant="contained"
                  sx={{ backgroundColor: '#076AAB', color: '#white', my: '10px'}}
                  onClick={onAddColumn}
                >
                <AddBoxIcon fontSize="large"/>
              </IconButton>}
            </Stack>
            <Fab
              style={{
                position: "absolute",
                background: "white",
                top: 20,
                left: 20,
              }}
              onClick={() => {
                setConfigOpen((prev) => !prev);
              }}
            >
              {configOpen ? <SaveIcon/> : <EditIcon/>}
            </Fab>

          </div>
        </Backdrop>
      </Fade>

      <Fab
        style={{
          position: "absolute",
          background: "white",
          top: 100,
          right: 20,
        }}
        onClick={() => {
          setBoardOpen((prev) => !prev);
        }}
      >
        <ViewKanbanIcon/>
      </Fab>
    </>
  );
};

export default KanbanBoard;
