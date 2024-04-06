import { useState, useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useFileHover() {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    function handleDragOver(event: DragEvent) {
      event.preventDefault();

      const windowWidth =
        window.innerWidth || document.documentElement.clientWidth;
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight;
      // Check if a file is being dragged
      const isFileBeingDragged = Array.from(
        event?.dataTransfer?.items ?? []
      ).some((item) => item.kind === "file");

      // Check if the mouse is within the window bounds and a file is being dragged
      if (
        isFileBeingDragged &&
        event.clientX >= 0 &&
        event.clientX <= windowWidth &&
        event.clientY >= 0 &&
        event.clientY <= windowHeight
      ) {
        setIsHovered(true);
      }
    }

    function handleDragLeave() {
      setIsHovered(false);
    }

    function handleDrop(event: DragEvent) {
      event.preventDefault();
      setIsHovered(false);
    }

    setTimeout(() => {
      window.addEventListener("dragover", handleDragOver);
      window.addEventListener("dragleave", handleDragLeave);
      window.addEventListener("drop", handleDrop);
    }, 1000);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);

      // console.log("Removed event listeners");
    };
  }, []);

  return isHovered;
}

export default useFileHover;
