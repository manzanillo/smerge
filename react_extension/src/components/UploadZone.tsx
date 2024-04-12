import { Box, Modal } from "@mui/material";
import { Dispatch, SetStateAction, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";

import "./SettingsModal.css";
import httpService from "../services/HttpService";
import { toast } from "react-toastify";

interface UploadZoneProps {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  projectId: string | undefined;
}

function UploadZone(props: UploadZoneProps) {
  const { modalOpen, setModalOpen, projectId } = props;
  const { t } = useTranslation();

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const baseStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "#eeeeee",
    borderStyle: "dashed",
    backgroundColor: "transparent",
    color: "white",
    outline: "none",
    transition: "border .24s ease-in-out",
  };

  const focusedStyle = {
    borderColor: "white",
  };

  const acceptStyle = {
    borderColor: "green",
  };

  const rejectStyle = {
    borderColor: "green",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toastId = useRef<any>();

  const uploadFile = (files: File[]) => {
    setModalOpen(false);
    if (files.length === 0) {
      toast.error(t("UploadZone.noXmlFile"), {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
      return;
    }

    toastId.current = toast("Starting file upload...", { autoClose: false });

    // copy of old drag and drop...
    const formData = new FormData();
    formData.append("file", files[0]);
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add/" + projectId, true);
    xhttp.setRequestHeader("X-CSRFToken", httpService.csrftoken);

    xhttp.addEventListener(
      "progress",
      function (e) {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded * 100) / e.total);
          if (toastId.current) {
            toast.update(toastId.current, {
              render: `Upload is ${percentComplete}% done`,
              position: "top-right",
              autoClose: false,
              progress: percentComplete,
              hideProgressBar: false,
            });
          }
        }
      },
      false
    );

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status <= 299) {
        if (toastId.current) {
          toast.update(toastId.current, {
            render: t("UploadZone.fileUploadSuccess"),
            position: "top-right",
            autoClose: 2000,
            type: toast.TYPE.SUCCESS,
            hideProgressBar: false,
          });
        }
      } else if (xhttp.readyState === 4) {
        if (toastId.current) {
          toast.update(toastId.current, {
            render: t("UploadZone.fileUploadFail"),
            position: "top-right",
            autoClose: 2000,
            type: toast.TYPE.ERROR,
            hideProgressBar: false,
          });
        }
      }
    };

    xhttp.send(formData);
  };

  function StyledDropzone() {
    const {
      getRootProps,
      getInputProps,
      isFocused,
      isDragAccept,
      isDragReject,
    } = useDropzone({
      accept: { "application/xml ": [".xml"] },
      onDrop: uploadFile,
    });

    const style = useMemo(
      () => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {}),
      }),
      [isFocused, isDragAccept, isDragReject]
    );

    return (
      <div className="container">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          <p>{t("UploadZone.dropText")}</p>
        </div>
      </div>
    );
  }

  return (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      style={{
        overflow: "auto",
        border: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100dvw",
        height: "100dvh",
      }}
      slotProps={{
        backdrop: {
          sx: {
            width: "100dvw",
            height: "100dvh",
          },
        },
      }}
    >
      <Box
        id={"settingsModal"}
        style={{
          overflow: "auto",
          padding: "20px",
          margin: "10px",
          maxHeight: "calc(100vh - 60px)",
        }}
      >
        <StyledDropzone />
      </Box>
    </Modal>
  );
}

export default UploadZone;
