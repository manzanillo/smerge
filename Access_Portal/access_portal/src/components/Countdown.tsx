import { useCallback, useEffect, useState } from "react";


interface CountdownProps {
    endTime?: Date;
    reloadOnEnd?: boolean;
}

const Countdown: React.FC<CountdownProps> = ({ endTime = new Date(), reloadOnEnd = false }) => {
    const getTimeRemaining = useCallback(() => {
        const now = new Date().getTime();
        const timeDifference = endTime.getTime() - now;

        if (timeDifference <= 0) {
            return '00:00:00';
        }
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        const timeRemainingString = `${(days != 0) ? days + " days, " : ""}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return timeRemainingString;
    }, [endTime])

    const [time, setTime] = useState("00:00:00");

    useEffect(() => {
        setTime(getTimeRemaining());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Create an interval to update the time every second
        const intervalId = setInterval(() => {
            const newTimeRemaining = getTimeRemaining();
            setTime(newTimeRemaining);

            // Clear the interval if the end time has passed
            if (newTimeRemaining === '00:00:00') {
                clearInterval(intervalId);
                if (reloadOnEnd)
                    setTimeout(() => { window.location.reload(); }, 1000)
            }
        }, 1000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endTime]);

    return (
        <h1>{time}</h1>
    )
}

export default Countdown;