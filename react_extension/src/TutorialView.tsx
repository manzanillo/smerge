import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { lightPageContainer } from "./public/publicPageStyles.ts";
import {
  createTutorialProject,
  addTutorialMergeNode,
  cleanupTutorialProject,
} from "./services/TutorialService";
import { useNavigate } from "react-router-dom";
import ProjectView from "./ProjectView.tsx";
import { TUTORIAL_SEQUENCES } from "./components/Tutorial/tutorialSequences.ts";
import { File } from "./services/ApiService";
import httpService from "./services/HttpService";
import TutorialOverlay from "./components/Tutorial/TutorialOverlay.tsx";
import {useTranslation} from "react-i18next";

const TUTORIAL_SEQUENCE_ID = "smerge-tutorial";

/**
 * Student Tutorial Ansicht
 *
 * Steuert die Ansicht unter dem Tutorial (z.B. Projekt-Ansicht oder Snap-Editor)
 * und platziert das Overlay.
 */
const TutorialView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [fileId, setFileId] = useState<number | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // View Mode (Graph = Projekt-Graph, Snap = eingebetteter Snap-Editor)
  const [viewMode, setViewMode] = useState<'graph' | 'snap'>('graph');

  // Snap-State
  const [snapFileName, setSnapFileName] = useState<string | null>(null);
  const [snapReady, setSnapReady] = useState(false);

  // true falls gerade ein API-Request zum cleanup läuft, um doppelte calls zu vermeiden
  const cleanupTriggeredRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const tutorialSequence = TUTORIAL_SEQUENCES[TUTORIAL_SEQUENCE_ID];

  const { t } = useTranslation();

  const currentStep = isActive
    ? tutorialSequence?.steps[currentStepIndex] ?? null
    : null;
  const isLastStep = isActive && !!tutorialSequence && currentStepIndex >= tutorialSequence.steps.length - 1;

  // State für Fortschritts-Anzeige
  const progress = {
    current: isActive && tutorialSequence ? currentStepIndex + 1 : 0,
    total: tutorialSequence?.steps.length ?? 0,
  };

  // TODO reduce duplication (url constant)!
  const snapSrc = useMemo(() => {
    if (!snapFileName) return null;
    return `https://snap.berkeley.edu/snap/snap.html#open:${httpService.baseURL}/action/blockerXML/${snapFileName}`;
  }, [snapFileName]);

  function startTutorial() {
    if (!tutorialSequence) {
      console.error(`Tutorial sequence not found: ${TUTORIAL_SEQUENCE_ID}`);
      return;
    }

    setCurrentStepIndex(0);
    setIsActive(true);
  }

  async function completeTutorial() {
    if (projectId && !cleanupTriggeredRef.current) {
      cleanupTriggeredRef.current = true;
      await cleanupTutorialProject(projectId);
    }

    setIsActive(false);
    setCurrentStepIndex(0);
    setSnapReady(false);

    // Zurück zur Homepage
    navigate("/");
  }

  async function nextStep() {
    if (!tutorialSequence) return;

    // Hier ist code der nach dem Abschluss eines Steps ausgeführt werden soll
    // z.B. um den view Mode zu wechseln oder um den nächsten Schritt vorzubereiten
    if (currentStep?.id === 'open_snap') {
      setViewMode('snap')
    }

    if (currentStep?.id === 'back_to_project') {
      setViewMode('graph');
    }

    // Merge-Tutorial: Extra Knoten erstellen
    if (currentStep?.id === "view_new_node" && projectId) {
      try {
        await addTutorialMergeNode(projectId);
      } catch (error) {
        console.error("[Tutorial] Error adding merge node:", error);
        setError(t("tutorial.error"));
      }
    }

    // Wechsel zum nächsten Schritt
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= tutorialSequence.steps.length) {
      completeTutorial();
    } else {
      setCurrentStepIndex(nextIndex);
    }
  }

  // Tutorial starten
  async function initTutorial() {
    try {
      const result = await createTutorialProject();

      if (result && result.success) {
        setProjectId(result.project_id);
        setFileId(result.file_id);

        const files = await httpService.getAsync<File[]>(
            `/api/project/${result.project_id}/files`
        );
        const tutorialFile = files.find((f) => f.id === result.file_id) ?? files[0];
        if (tutorialFile?.file_url) {
          setSnapFileName(tutorialFile.file_url.replace('/media/', ''));
        }

        setLoading(false);

        // Kurzer delay damit die Hauptansicht gesehen werden kann
        setTimeout(() => {
          startTutorial();
        }, 500);
      } else {
        setError("Failed to create tutorial project");
        setLoading(false);
      }
    } catch (err) {
      console.error("Tutorial initialization error:", err);
      setError("An error occurred while initializing the tutorial");
      setLoading(false);
    }
  }
  useEffect(() => {
    initTutorial();
  }, []);

  useEffect(() => {
    if (
      isActive &&
      currentStep?.id === "merge_select" &&
      selectedNodeIds.length === 2
    ) {
      nextStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeIds, currentStep?.id, isActive]);

  // Klick auf Projekt-Node intercepten und im Tutorial weiter machen
  function handleNodeDoubleClick(nodeId: string) {
    if (currentStep?.id === "open_snap") {
      nextStep();
    }
  }

  function handleMergeConfirmed() {
    if (currentStep?.id === "merge_click") {
      nextStep();
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          ...lightPageContainer,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Preparing tutorial environment...</Typography>
      </Box>
    );
  }

  if (error || !projectId || !fileId) {
    return (
      <Box sx={{ ...lightPageContainer, p: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || t("tutorial.failedLoad")}
        </Typography>
        <Typography>
          {t("tutorial.homepage1")}
          <a href="/" onClick={() => navigate("/")}>
            {t("tutorial.homepage2")}
          </a>
          .
        </Typography>
      </Box>
    );
  }

  const tutorialRoot = document.getElementById("tutorial-root");

  // Render des Tutorial-Overlays als Portal in das separate tutorial-root Element
  // Dies verhindert, dass das Modal das Layout der Haupt-App beeinflusst
  return projectId && (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {tutorialRoot && isActive && createPortal(
        <TutorialOverlay
          step={currentStep}
          progress={progress}
          isLastStep={isLastStep}
          onNext={nextStep}
          onClose={completeTutorial}
        />,
        tutorialRoot
      )}

      <Box
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        {viewMode === "graph" && (
          <ProjectView
            projectId={projectId}
            fileId={fileId}
            embedded={true}
            onNodeDoubleClick={handleNodeDoubleClick}
            onSelectedNodesChange={setSelectedNodeIds}
            onMergeConfirmed={handleMergeConfirmed}
          />
        )}

        {viewMode === "snap" && snapSrc && (
          <>
            {!snapReady && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 10002,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
                <CircularProgress size={48} />
                <Typography variant="body1" sx={{ color: "black" }}>
                  Loading Snap editor...
                </Typography>
              </Box>
            )}
            <iframe
              src={snapSrc}
              title="Tutorial Snap Editor"
              onLoad={() => setSnapReady(true)}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                border: "none",
                backgroundColor: "white",
              }}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default TutorialView;

