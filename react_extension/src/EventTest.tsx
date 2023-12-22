import React, { useRef, useState } from "react";
import useEffectInit from "./shared/useEffectInit";

// import './eventstream/eventsource.min.js';
// import './eventstream/reconnecting-eventsource.js';
import { Button, CircularProgress, Divider, List, ListItem, ListItemText, Paper, Stack, TextField } from "@mui/material";
import pushService from "./services/PushService";


interface EventTestProps {
}

const EventTest: React.FC<EventTestProps> = () => {

  const path = useRef("");
  const [inputValue, setInputValue] = useState("");
  // useEffectInit(() => {
  // with timeout to enable normal loading
  // setTimeout(() => {
  function handleButtonClick() {
    if (path.current != "") pushService.close(path.current);
    pushService.open(inputValue, (e) => { console.log(data); setData(a => [...a, e.text]); });
    path.current = inputValue;
  }
  // console.log("added rec")
  // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // // @ts-ignore
  // const es: EventSource = new ReconnectingEventSource('/events/test/');

  // es.addEventListener('message', function (e) {
  //   console.log(e);
  //   console.log(e.data);
  // }, false);

  // }, 100);
  // }, [])

  const [data, setData] = useState<string[]>([]);

  return (
    <>
      <Paper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px' }} elevation={3}>
        <Stack>
          <TextField value={inputValue} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setInputValue(event.target.value); }} id="standard-basic" label="Stream Name" variant="standard" />
          <Button onClick={handleButtonClick} variant="contained">Start EventStream</Button>
          <Divider sx={{ mt: "10px", mb: "10px" }} />
          {!data ?
            <CircularProgress /> :
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
              {data.map((value: string, index: number) => (
                <ListItem
                  key={index+"_"+value}
                >
                  <ListItemText primary={`Msg ${value}`} />
                </ListItem>
              ))}
            </List>}
        </Stack>
      </Paper>
    </>
  )
}

export default EventTest;