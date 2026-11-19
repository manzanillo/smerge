import {
    ControlledBoard, addCard, changeCard, removeCard, moveCard, moveColumn, addColumn,
    removeColumn, changeColumn
} from "@caldwell619/react-kanban"
import React, {useState, useEffect, useRef} from "react";
import {Typography, Button, Box, TextField, Backdrop, Fab, Fade, Stack, IconButton, Chip, MenuItem, Autocomplete} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ProjectDto from "../models/ProjectDto";
import {putKanbanChange} from "../../services/ProjectService";
import "./styles.css"
import {useTranslation} from "react-i18next";
import {toast} from "react-toastify";
import {HexColorPicker} from "react-colorful";
import PaletteIcon from '@mui/icons-material/Palette';
import Dialog from '@mui/material/Dialog';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DialogActions from '@mui/material/DialogActions';

interface KanbanBoardProps {
    projectData: ProjectDto;
    setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
}

// Predefined tags with colors
const predefinedTags = [
    {label: "Priority: Low", color: "#4CAF50", textColor: "#fff"},
    {label: "Priority: Medium", color: "#FF9800", textColor: "#fff"},
    {label: "Priority: High", color: "#F44336", textColor: "#fff"},
];

const tagColorMap = {
    "Priority: Low": {bg: "#4CAF50", text: "#fff"},
    "Priority: Medium": {bg: "#FF9800", text: "#fff"},
    "Priority: High": {bg: "#F44336", text: "#fff"},
};

// Available animal icons
const animalIcons = [
    "cow-face-icon.svg",
    "dog-face-color-icon.svg",
    "fox-face-icon.svg",
    "giraffe-face-icon.svg",
    "kangaroo-face-icon.svg",
    "monkey-face-cartoon-icon.svg",
    "panda-icon.svg",
    "raccoon-icon.svg",
    "sheep-face-icon.svg",
    "turtle-color-icon.svg",
];

const defaultIcon = "unknown-person-icon.svg";

const getIconUrl = (iconName: string) => {
    if (iconName === defaultIcon) {
        return `/static/icons/${iconName}`;
    }
    return `/static/icons/animal-icons/${iconName}`;
};

// Priority order for sorting (lower number = higher priority / appears first)
const priorityOrder = {
    "Priority: High": 0,
    "Priority: Medium": 1,
    "Priority: Low": 2,
};

const sortCardsByPriority = (cards: any[]) => {
    return [...cards].sort((a, b) => {
        const aPriority = a.tags && a.tags.length > 0 ? priorityOrder[a.tags[0]] ?? 3 : 3;
        const bPriority = b.tags && b.tags.length > 0 ? priorityOrder[b.tags[0]] ?? 3 : 3;
        return aPriority - bPriority;
    });
};

const sortBoardByPriority = (board: any) => {
    if (!board.columns) return board;
    return {
        ...board,
        columns: board.columns.map(column => ({
            ...column,
            cards: sortCardsByPriority(column.cards)
        }))
    };
};

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

const ColumnHeader: React.FC<any> = ({column, board, setBoard, configOpen}) => {
    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState('');
    const {t} = useTranslation();

    const onAdd = () => {
        let number_of_cards = 0
        for (const col of board.columns) {
            number_of_cards = number_of_cards + col.cards.length
        }

        if (number_of_cards < max_card_number) {
            // Every card needs an unique id and starts with the default icon
            setBoard(addCard(board, column, {id: Math.random(), icon: defaultIcon, tags: ["Priority: Medium"]}, {on: 'bottom'}))
        } else
            toast.warning(t("KanbanBoard.cardLimit"), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });
    };

    return (
        <Box display="flex" alignItems="center" gap={2} sx={{pb: '5px', width: '308px', height: '47px'}}>
            <Typography variant="h4" sx={{overflow: 'hidden'}}>
                {column.titleChanged ? column.title : t(column.title)}
            </Typography>

            {configOpen ?
                <Button
                    sx={{
                        marginLeft: 'auto', backgroundColor: '#BD5F00', color: 'white', '&:hover': {
                            backgroundColor: '#FF8000',
                            color: 'black',
                        },
                    }}
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
                    sx={{marginLeft: 'auto', backgroundColor: '#076AAB', color: 'white'}}
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
                    sx={{m: "16px"}}
                />
                <DialogActions>
                    <Button sx={{marginLeft: 'auto', color: 'red'}} onClick={() => {
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
                        setBoard(changeColumn(board, column, ({title: title, titleChanged: true} as any)))
                        setEditMode(false)
                    }}>
                        {t("KanbanBoard.save")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

const CardComponent: React.FC<any> = ({card, board, setBoard, authorIconMap}) => {
    const [editMode, setEditMode] = useState(false);
    const [text, setText] = useState(card.description);
    const [author, setAuthor] = useState(card.author ?? "Unknown");
    const [tags, setTags] = useState<string[]>(card.tags ?? ["Priority: Medium"]);
    const [icon, setIcon] = useState<string>(card.icon ?? defaultIcon);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
    const authorAutocompleteRef = useRef<any>(null);

    useEffect(() => {
        setAuthor(card.author ?? "Unknown");
    }, [card.author]);

    useEffect(() => {
        setTags(card.tags ?? ["Priority: Medium"]);
    }, [card.tags]);

    useEffect(() => {
        setIcon(card.icon ?? defaultIcon);
    }, [card.icon]);


    const inputRef = useRef(null);

    // Does not work in makeEdit
    useEffect(() => {
        if (inputRef && inputRef.current && editMode) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length)
        }
    }, [editMode]);

    const makeEdit = () => {
        setAuthorDropdownOpen(false);
        setEditMode(true);
    };

    // Save and send change to backend
    const saveEdit = () => {
        setAuthorDropdownOpen(false);
        setEditMode(false);
        // Reset author to "Unknown" if empty or whitespace
        const finalAuthor = author && author.trim() !== '' ? author : "Unknown";
        setBoard(changeCard(board, card.id, {description: text, author: finalAuthor, tags, icon}))
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

    const toggleTag = (tagLabel: string) => {
        if (tags.includes(tagLabel)) {
            // Deselect if already selected
            setTags([]);
        } else {
            // Select only this one (deselect all others)
            setTags([tagLabel]);
        }
    };

    const deleteCard = () => {
        const column = board.columns.find(e => e.cards.some(c => c.id === card.id))
        setBoard(removeCard(board, column, card))
    };

    return (
        <Box sx={{
            bgcolor: editMode ? editCardColor : color,
            borderRadius: 3,
            width: '308px',
            my: '3px',
            boxShadow: 1,
            display: 'flex',
            flexDirection: 'row'
        }}>
            <div style={{pointerEvents: editMode ? 'auto' : 'none', flex: 1}}>
                {editMode ? (
                    <Box sx={{px: 1.5, pt: 1, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1}}>
                        {/* Circular icon selector */}
                        <Box
                            onClick={() => setShowIconPicker(true)}
                            sx={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: '2px solid #076AAB',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                backgroundColor: '#f0f0f0',
                                flexShrink: 0,
                                '&:hover': {
                                    backgroundColor: '#e0e0e0',
                                }
                            }}
                        >
                            {icon ? (
                                <img
                                    src={getIconUrl(icon)}
                                    alt="card-icon"
                                    style={{height: '30px', width: '30px', objectFit: 'contain'}}
                                />
                            ) : (
                                <Typography sx={{fontSize: '0.6rem', textAlign: 'center', color: '#999'}}>
                                    +Icon
                                </Typography>
                            )}
                        </Box>

                        {/* Author autocomplete — takes all remaining space */}
                        <Autocomplete
                                ref={authorAutocompleteRef}
                                size="small"
                                freeSolo
                                open={authorDropdownOpen}
                                onOpen={() => {/* controlled only by button click */}}
                                onClose={() => {
                                    setAuthorDropdownOpen(false);
                                }}
                                options={["Unknown", ...Object.keys(authorIconMap).sort()]}
                                value={author}
                                onChange={(event, newValue) => {
                                    setAuthor(newValue || "");
                                    // Auto-set icon when selecting an author from the dropdown
                                    if (newValue) {
                                        if (newValue === "Unknown") {
                                            setIcon(defaultIcon);
                                        } else if (authorIconMap[newValue]) {
                                            setIcon(authorIconMap[newValue]);
                                        }
                                    }
                                    setAuthorDropdownOpen(false);
                                }}
                                inputValue={author}
                                onInputChange={(event, newInputValue) => {
                                    setAuthor(newInputValue);
                                }}
                                sx={{
                                    flex: 1,
                                    '& .MuiInputBase-input': {color: '#323232', fontSize: '0.8rem', fontWeight: 600},
                                    '& .MuiOutlinedInput-notchedOutline': {border: '1px solid #999'},
                                }}
                                slotProps={{
                                    popper: { style: { width: 'auto', minWidth: '150px', maxWidth: '300px' } },
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select or type author"
                                    />
                                )}
                                renderOption={(props, option) => {
                                    const optionIcon = option === "Unknown" ? defaultIcon : (authorIconMap[option] ?? defaultIcon);
                                    return (
                                        <li {...props} key={option}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, width: '100%'}}>
                                                <img
                                                    src={getIconUrl(optionIcon)}
                                                    alt={option}
                                                    style={{width: '28px', height: '28px', borderRadius: '50%', objectFit: 'contain', flexShrink: 0}}
                                                />
                                                <Typography sx={{fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                    {option}
                                                </Typography>
                                            </Box>
                                        </li>
                                    );
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setAuthorDropdownOpen(!authorDropdownOpen);
                                    // Also focus the input for better UX
                                    setTimeout(() => {
                                        authorAutocompleteRef.current?.querySelector('input')?.focus();
                                    }, 0);
                                }}
                                sx={{color: '#323232', padding: '2px', flexShrink: 0}}
                            >
                                <ExpandMoreIcon sx={{fontSize: '1rem'}} />
                            </IconButton>
                    </Box>
                ) : (
                    <Box sx={{px: 1.5, pt: 1, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1}}>
                        {/* Circular icon display */}
                        <Box
                            sx={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                border: '2px solid #ddd',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#f9f9f9',
                                flexShrink: 0,
                            }}
                        >
                            {icon && (
                                <img 
                                    src={getIconUrl(icon)} 
                                    alt="card-icon" 
                                    style={{height: '40px', width: '40px', objectFit: 'contain'}}
                                />
                            )}
                        </Box>

                        {/* Author display */}
                        <Box sx={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <Typography sx={{fontSize: '0.7rem', color: '#999'}}>
                                Author
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#323232",
                                    lineHeight: 1.2,
                                }}
                            >
                                {author}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Dialog open={showIconPicker} onClose={() => setShowIconPicker(false)}>
                    <Box sx={{p: 2, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1}}>
                        {animalIcons.map((iconName) => (
                            <Box 
                                key={iconName}
                                onClick={() => {
                                    setIcon(iconName);
                                    setShowIconPicker(false);
                                }}
                                sx={{
                                    p: 1,
                                    cursor: 'pointer',
                                    border: icon === iconName ? '2px solid #076AAB' : '1px solid #ccc',
                                    borderRadius: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    '&:hover': {
                                        backgroundColor: '#f0f0f0'
                                    }
                                }}
                            >
                                <img 
                                    src={getIconUrl(iconName)} 
                                    alt={iconName}
                                    style={{height: '50px', width: '50px', objectFit: 'contain'}}
                                />
                            </Box>
                        ))}
                    </Box>
                    <Button 
                        fullWidth 
                        onClick={() => {
                            setIcon(defaultIcon);
                            setShowIconPicker(false);
                        }}
                        color="error"
                    >
                        Remove Icon
                    </Button>
                </Dialog>

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
                    inputProps={{maxLength: max_card_length}}
                    sx={{
                        '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: 'black', color: 'black'},
                        '& .MuiInputBase-input': {color: '#323232'},
                        '& .MuiOutlinedInput-notchedOutline': {border: 'none'},
                    }}
                />

                <Box sx={{px: 1.5, py: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                    {editMode ? (
                        // Edit mode: show all tags as toggleable chips
                        predefinedTags.map((tag) => (
                            <Chip
                                key={tag.label}
                                label={tag.label}
                                onClick={() => toggleTag(tag.label)}
                                variant={tags.includes(tag.label) ? "filled" : "outlined"}
                                sx={{
                                    backgroundColor: tags.includes(tag.label) ? tag.color : 'transparent',
                                    color: tags.includes(tag.label) ? tag.textColor : '#323232',
                                    borderColor: tags.includes(tag.label) ? 'transparent' : '#999',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                }}
                            />
                        ))
                    ) : (
                        // View mode: show only selected tags
                        tags.length > 0 && tags.map((tag) => {
                            const tagColor = tagColorMap[tag];
                            return (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    sx={{
                                        backgroundColor: tagColor?.bg,
                                        color: tagColor?.text,
                                        fontSize: '0.75rem',
                                    }}
                                />
                            );
                        })
                    )}
                </Box>
            </div>

            <Box sx={{display: 'flex', flexDirection: 'column', marginLeft: "auto"}}>
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

                <Dialog onClose={saveColor} open={colorPickerOpen}>
                    <div className="card-color-picker">
                        <HexColorPicker color={color} onChange={(c) => setColor(c)}/>
                    </div>
                    <Box>
                        {predefinedCardColors.map((pColor) => (
                            <Button
                                variant="contained"
                                style={{background: pColor}}
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
                    sx={{color: 'black', marginTop: 'auto'}}
                    onClick={editMode ? saveEdit : makeEdit}
                >
                    {editMode ? <SaveIcon/> : <EditIcon/>}
                </IconButton>
            </Box>
        </Box>
    )
}


// The KanbanBoard and the button to open it

export const KanbanBoard: React.FC<KanbanBoardProps> = ({projectData, setProjectData}) => {
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

    const [board, setBoard] = useState<any>({columns: []})
    const [authorIconMap, setAuthorIconMap] = useState<Record<string, string>>({});

    // Sets the board and sync with backend
    const updateBoard = (b) => {
        if (!('version' in b)) {
            b.version = 0
        }
        b.version += 1
        const sorted_board = sortBoardByPriority(b);
        putKanbanChange(projectData.id, sorted_board);
        setBoard(sorted_board)
    }

    // Derive author-icon map from board cards
    useEffect(() => {
        const map: Record<string, string> = {};
        board.columns?.forEach(column => {
            column.cards?.forEach(card => {
                if (card.author && card.author !== "Unknown") {
                    map[card.author] = card.icon ?? defaultIcon;
                }
            });
        });
        setAuthorIconMap(map);
    }, [board]);

    useEffect(() => {
        if (projectData && projectData.kanban_board) {
            const new_board = JSON.parse(projectData.kanban_board)
            const sorted_board = sortBoardByPriority(new_board);
            if (!('version' in board) || sorted_board.version > board.version) {
                setBoard(sorted_board)
            }
        }
    }, [projectData]);

    const {t, i18n} = useTranslation();

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
                        <Stack direction="row" sx={{alignItems: 'flex-start'}}>
                            {configOpen && <AddBoxIcon fontSize="large" sx={{opacity: 0, m: "8px"}}/>}
                            <ControlledBoard
                                disableColumnDrag={!configOpen}
                                renderCard={(p: any) => <CardComponent card={p} board={board} setBoard={updateBoard} authorIconMap={authorIconMap}/>}
                                renderColumnHeader={(p: any) => <ColumnHeader column={p} board={board}
                                                                              setBoard={updateBoard}
                                                                              configOpen={configOpen}/>}
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
                                sx={{backgroundColor: '#076AAB', color: 'white', my: '10px'}}
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
