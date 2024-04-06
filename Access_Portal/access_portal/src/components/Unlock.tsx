import "./Unlock.css";
import { CircularProgress, Stack } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getIsIpLocked, getUnlockIp } from "../services/UserService";
import Countdown from "./Countdown";

interface UnlockProps {}

const Unlock: React.FC<UnlockProps> = () => {
  const [initialLoad, setInitialLoad] = useState(false);

  const [locked, setLocked] = useState(true);
  const [duringUnlock, setDuringUnlock] = useState(false);
  const tmp = useRef<HTMLInputElement | null>(null);

  const preventOnce = useRef(false);
  const initState = useRef(false);

  const [remaining, setRemaining] = useState<Date | null>(null);

  const [lockText, setLockText] = useState("Your ip is locked");

  // Initially ask server if ip already active and then set state accordingly
  const initLoadCallback = useCallback(async () => {
    const res = await getIsIpLocked();
    setInitialLoad(true);
    if (res.success) {
      preventOnce.current = true;
      initState.current = true;
      setRemaining(new Date(res.text[0].expire_date));
      //dumb but works... if time fix later...
      setTimeout(() => tmp?.current?.click(), 100);
    } else {
      setLockText("Your ip is locked");
    }
  }, []);

  const loaded = useRef(false);
  useEffect(() => {
    if (!loaded.current) {
      initLoadCallback();
      loaded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryUnlocking = useCallback(async () => {
    if (preventOnce.current) {
      preventOnce.current = false;
      if (initState.current) {
        setLockText("Your ip is already unlocked");

        // set true to block the input from further inputs since ip is already unlocked
        setDuringUnlock(true);
      }
      //setDuringUnlock(false);
      return;
    }
    const res = await getUnlockIp();

    if (res.success) {
      // console.log(res)
      setLockText("Your ip is unlocked");
      //setDuringUnlock(false);

      const date = new Date(res.text.expire_date);
      const localDate = date.toLocaleDateString();
      const localTime = date.toLocaleTimeString();
      setRemaining(date);
      toast.success(`Unlocked ip until: ${localTime} ${localDate}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
      });
    } else {
      toast.error("Unlocking failed!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
      setDuringUnlock(false);
      preventOnce.current = false;
      setTimeout(() => tmp?.current?.click(), 100);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onLockChange = (_: unknown) => {
    setLocked(!locked);
    if (locked) {
      setDuringUnlock(true);
      setLockText("Unlocking your ip...");
      tryUnlocking();
    } else {
      setLockText("Your ip is locked");
    }
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      style={{ height: "100%" }}
    >
      {initialLoad ? (
        <>
          <div
            style={{
              width: "100px",
              height: "100px",
              padding: "20px",
              justifyContent: "center",
              justifyItems: "center",
            }}
          >
            <input
              ref={tmp}
              disabled={duringUnlock}
              id="inpLock"
              type="checkbox"
              value={!locked + ""}
              defaultChecked
              onChange={onLockChange}
            />
            <label className="btn-lock" htmlFor="inpLock">
              <svg width="50" height="54" viewBox="0 0 36 40">
                <path
                  className="lockb"
                  d="M27 27C27 34.1797 21.1797 40 14 40C6.8203 40 1 34.1797 1 27C1 19.8203 6.8203 14 14 14C21.1797 14 27 19.8203 27 27ZM15.6298 26.5191C16.4544 25.9845 17 25.056 17 24C17 22.3431 15.6569 21 14 21C12.3431 21 11 22.3431 11 24C11 25.056 11.5456 25.9845 12.3702 26.5191L11 32H17L15.6298 26.5191Z"
                ></path>
                <path
                  className="lock"
                  d="M6 21V10C6 5.58172 9.58172 2 14 2V2C18.4183 2 22 5.58172 22 10V21"
                ></path>
                <path className="bling" d="M29 20L31 22"></path>
                <path className="bling" d="M31.5 15H34.5"></path>
                <path className="bling" d="M29 10L31 8"></path>
              </svg>
            </label>
          </div>
          <h1>{lockText}</h1>
          {/* <Button onClick={() => { tmp?.current?.click() }}>Ext</Button> */}
          {remaining ? (
            <Countdown endTime={remaining} reloadOnEnd={true} />
          ) : (
            <></>
          )}
        </>
      ) : (
        <CircularProgress />
      )}
    </Stack>
  );
};

export default Unlock;
