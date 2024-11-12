import { ControlledBoard, addCard, changeCard, removeCard, Card, moveCard, KanbanBoard as KB }
  from "@caldwell619/react-kanban"
import React, { useState, useEffect } from "react";
import {Typography, Button, Box, TextField, Backdrop, Fab, Fade, Stack, IconButton } from "@mui/material";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ProjectDto from "../models/ProjectDto";
import { putKanbanChange } from "../../services/ProjectService";
import "./styles.css"
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface KanbanBoardProps {
  projectData: ProjectDto;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
}

// Only a limited number of cards and length of text in cards is allowed
const max_card_length = 200
const max_card_number = 15

const renderColumnHeader = (column, board, setBoard) => {
  const { t } = useTranslation();

  const onAdd = () => {
    var number_of_cards = 0
    for (const col of board.columns) {
      number_of_cards = number_of_cards + col.cards.length
    }

    if (number_of_cards <= max_card_number) {
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
    <Box display="flex" alignItems="center" gap={2} sx={{ pb: '5px', width: '300px' }}>
      <Typography variant="h4">{t(column.title)}</Typography>
      <Button
        sx={{ backgroundColor: '#076AAB', color: 'white', marginLeft: 'auto'}}
        size="medium"
        variant="contained"
        onClick={onAdd}
      >
        Add
      </Button>
    </Box>
  )
}

const renderCard = (card, board, setBoard) => {
  const [editMode, setEditMode] = useState(false);
  const [text, setText] = useState(card.description);

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
    if (lines <= 5) {
      setText(newText);
    }
  };

  // For synchronization
  useEffect(() => {
    setText(card.description)
  }, [card]);

  const deleteCard = () => {
    const column = board.columns.find(e => e.cards.some(c => c.id === card.id))
    setBoard(removeCard(board, column, card))
  };

  return (
    <Box sx={{
      bgcolor: editMode ? '#F9CA90' : 'primary.main', borderRadius: 3, width: '300px', my: '3px',
      boxShadow: 1
    }}>
    <Stack direction="row" spacing={2}>
      <div style={{'pointer-events': editMode ? 'auto' : 'none'}}>
        <TextField
          multiline
          minRows={2}
          value={text}
          onChange={handleChange}
          disabled={!editMode}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveEdit();
            }
          }}
          inputRef={input => {
            if (input) {
              input.focus()
              input.setSelectionRange(input.value.length, input.value.length)
            }
          }}
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

      <Box sx={{ display: 'flex', flexDirection: 'column'}}>
        <Button
          sx={{color: 'black'}}
          onClick={deleteCard}
        >
          X
        </Button>
        <IconButton
          sx={{color: 'black',  marginTop: 'auto'}}
          onClick={editMode ? saveEdit : makeEdit}
        >
          {editMode ? <SaveIcon/> : <EditIcon/>}
        </IconButton>
      </Box>
    </Stack>
    </Box>
  )
}


// The KanbanBoard and the button to open it

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectData, setProjectData }) => {
  const [boardlOpen, setBoardOpen] = useState(false);

  const checkCloseKanbanBoard = (ev: React.MouseEvent<HTMLElement>) => {
    const target = ev.target as HTMLElement;
    if (target.classList.contains("closeKanbanBoard")) {
      setBoardOpen(false);
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
    putKanbanChange(projectData.id, projectData, JSON.stringify(b));
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
        >
          <div style={{
            color: "black",
            left: '20%',
            }}>
            <ControlledBoard
              disableColumnDrag="true"
              renderCard={(p) => renderCard(p, board, updateBoard)}
              renderColumnHeader={(p) => renderColumnHeader(p, board, updateBoard)}
              onCardDragEnd={(card, source, destination) => {
                return updateBoard(moveCard(board, source, destination))
              }}
              allowAddCard={false}
            >
            {board}
            </ControlledBoard>

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
