import CytoscapeComponent from "react-cytoscapejs";
import dagre from "cytoscape-dagre";
import Cytoscape, { EdgeDefinition, NodeDefinition } from "cytoscape";
import { useParams } from "react-router-dom";
import {
  File,
  useFiles,
  useUpdateNodePosition,
  useUpdateNodePositions,
} from "../../services/ApiService";
import useEffectInit from "../../shared/useEffectInit";
import pushService from "../../services/PushService";
import React, { useEffect, useRef, useState } from "react";
import { Fab } from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import { debounce, toNumber } from "lodash";
import { useQueryClient } from "@tanstack/react-query";
import SettingsModal from "../SettingsModal";
import cxtmenu from "cytoscape-cxtmenu";
import generateContextMenuSettings from "./ContextMenuDefinition";
import stylesheet from "./StyleSheet";
import httpService from "../../services/HttpService";
import MergeButtons from "../MergeButtons";
import ProjectDto from "../models/ProjectDto";
import ProjectStats from "../ProjectStats";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NodeGraphProps {
  // projectId: string;
  projectData: ProjectDto;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
}

Cytoscape.use(dagre);

const NodeGraph: React.FC<NodeGraphProps> = ({
  projectData,
  setProjectData,
}) => {
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const cy = useRef<Cytoscape.Core>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mutate: positionMutate } = useUpdateNodePosition(
    projectId ?? "",
    queryClient
  );

  const { mutate: positionsMutate } = useUpdateNodePositions();

  const lastPositionUpdate = useRef(Date.now());

  const savedLayoutKey = "savedLayout";
  const savedLayout: string = (() => {
    const ret = localStorage.getItem(savedLayoutKey);
    return ret ?? "dagre";
  })();

  const savedWheelSensitivityKey = "wheelSensitivity";
  const savedWheelSensitivity: number = (() => {
    const ret = localStorage.getItem(savedWheelSensitivityKey);
    return ret ? parseFloat(ret) : 1;
  })();

  const dagre = {
    name: "dagre",
    animate: true,
    padding: 30,
    spacingFactor: 1.2,
    nodeDimensionsIncludeLabels: true,
  };

  const [layout, setLayout] = useState(dagre);
  // keeps track for eventListener...
  const layoutRef = useRef(layout);

  const { data, error, isLoading, refresh } = useFiles(String(projectId));
  if (error) console.log(error);

  const nodes: NodeDefinition[] | undefined = data?.map((file: File) => {
    const nodeDefinition: NodeDefinition = {
      data: {
        id: file.id.toString(),
        label: file.description,
        file_url: file.file_url,
        color: file.color,
        position:
          !file.xPosition || !file.yPosition
            ? undefined
            : { x: file.xPosition, y: file.yPosition },
      },
      position:
        !file.xPosition || !file.yPosition
          ? undefined
          : { x: file.xPosition, y: file.yPosition },
    };
    return nodeDefinition;
  });

  const edges: EdgeDefinition[] | undefined = data?.flatMap((file: File) => {
    return file.ancestors.map((ancestor: number) => {
      const edgeDefinition: EdgeDefinition = {
        data: { source: ancestor.toString(), target: file.id.toString() },
      };
      return edgeDefinition;
    });
  });

  const [elements, setElements] = useState([
    ...(nodes ?? []),
    ...(edges ?? []),
  ]);

  // const openLock = React.useRef<boolean>(false);
  const openSnap = (url: string) => {
    // if (!openLock.current) {
    window.open(url, "_blank");
    //     openLock.current = true;
    //     setTimeout(() => {
    //         openLock.current = false;
    //     }, 500)
    // }
  };

  const ranFirstAgain = useRef(false);
  // changed by eventUpdate if whole layout was pushed by others
  const resize = useRef(false);
  useEffect(() => {
    if (cy.current && !isLoading) {
      setElements([...(nodes ?? []), ...(edges ?? [])]);

      cy.current?.on("dblclick", "node", function (evt) {
        const node = evt.target;

        // Open a new tab with a set link
        openSnap(
          `https://snap.berkeley.edu/snap/snap.html#open:${httpService.baseURL}blockerXML/` +
            node.data("file_url").replace("/media/", "")
        );
      });

      cy.current?.on("dragfree", "node", (evt) => {
        if (layout.name !== "preset") return;

        positionMutate({
          id: toNumber(evt.target.data().id),
          position: evt.target.position(),
        });
        lastPositionUpdate.current = Date.now();
      });

      if (!ranFirstAgain.current) {
        setTimeout(() => {
          if (savedLayout == "dagre") {
            console.log("Ran first: ", savedLayout);
            cy.current?.layout(dagre).run();
          } else {
            cy.current?.layout({ name: savedLayout }).run();
          }
          cy.current?.fit();
          // cy.current?.center();
        }, 100);

        ranFirstAgain.current = true;
      }

      if (resize.current) {
        setTimeout(() => {
          cy.current?.fit();
          // cy.current?.center();
        }, 100);

        resize.current = false;
      }

      return () => {
        console.log("removeListener");
        cy.current?.removeListener("dblclick", "node");
        cy.current?.removeListener("dragfree", "node");
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, layout]);

  // const getSelectedNodes = () => {
  //     const selectedNodes = cy.current?.$('node:selected');
  //     const selectedNodeData = seleimport cxtmenu from 'cytoscape-cxtmenu';
  // const loadPreset = () => {

  //     console.log(savedLayout);
  //     if(savedLayout){
  //         setLayout((l) => {
  //             return {...l, name: savedLayout}
  //         });
  //     }
  // }

  useEffectInit(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pushService.open(projectId ?? "empty", (e) => {
      // prevent refresh for own position change within 300ms
      console.log(e.text);
      if (Date.now() - lastPositionUpdate.current > 300) {
        // get currentLayout from storage, (prevent snapshot variables like the event...)
        // const currentLayout = localStorage.getItem(savedLayoutKey);
        console.log(savedLayout);
        if (e.text.includes("savedLayout") && savedLayout != "preset") return;
        resize.current = e.text.includes("resize");
        // console.log("resize.current: ", resize.current);
        // console.log("layoutName is: " , layoutRef.current.name);
        // console.log("update text: ", e.text);
        if (e.text.includes("added") || layoutRef.current.name == "preset")
          refresh();
      }
    });

    // init context menu
    Cytoscape.use(cxtmenu);

    return () => {
      pushService.close(projectId ?? "empty");
    };
  }, []);

  useEffect(() => {
    // set context menu
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const menu = cy.current?.cxtmenu(
      generateContextMenuSettings(projectId ?? "", refresh)
    );

    // change layout after loading to saved if available
    let toClean: NodeJS.Timeout;
    if (savedLayout != "preset") {
      toClean = setTimeout(() => {
        changeLayout(savedLayout);
      }, 150);
    }

    return () => {
      menu?.destroy();
      clearTimeout(toClean);
    };
  }, []);

  const saveGraphPositions = () => {
    if (nodes && cy.current) {
      positionsMutate(
        cy.current.nodes().map((node) => {
          return {
            id: toNumber(node.data().id),
            position: node?.position() ?? { x: 0, y: 0 },
          };
        })
      );
    }
  };

  const changeLayout = (layoutName: string) => {
    // save selected layout in storage for next loading
    localStorage.setItem(savedLayoutKey, layoutName);

    if (layoutName == "preset") {
      setLayout((l) => {
        layoutRef.current = { ...l, name: "preset" };
        return { ...l, name: "preset" };
      });
      refresh();
      if (cy.current) {
        nodes?.forEach((node) => {
          if (node.data.id && node.data.position) {
            cy.current
              ?.getElementById(node.data.id)
              ?.position(node.data.position);
          }
        });
      }
    } else {
      setLayout((l) => {
        layoutRef.current = { ...l, name: "preset" };
        return { ...l, name: layoutName };
      });
    }
  };

  const [wheelSensitivity, setRealWheelSensitivity] = useState(
    savedWheelSensitivity
  );

  const setWheelSensitivity = (value: number) => {
    localStorage.setItem(savedWheelSensitivityKey, value.toString());
    setRealWheelSensitivity(value);
    reloadDebounced();
  };

  // not optimal for react but cytoscape needs a reload for scroll sensitivity to apply
  const reloadDebounced = debounce(() => {
    window.location.reload();
  }, 1000);

  return (
    <>
      <ProjectStats projectData={projectData} />
      <CytoscapeComponent
        elements={elements}
        minZoom={0.5}
        maxZoom={10}
        wheelSensitivity={wheelSensitivity}
        layout={layout}
        autounselectify={false}
        boxSelectionEnabled={true}
        stylesheet={stylesheet}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          background: "white",
          zIndex: "800",
        }}
        cy={(inp) => {
          cy.current = inp;
        }}
      />

      <SettingsModal
        projectId={projectId ?? ""}
        changeLayout={changeLayout}
        initLayout={savedLayout}
        cy={cy}
        saveGraphPositions={saveGraphPositions}
        projectData={projectData}
        setProjectData={setProjectData}
        wheelSensitivity={wheelSensitivity}
        setWheelSensitivity={setWheelSensitivity}
      />
      <MergeButtons cyRef={cy} refresh={refresh} projectId={projectId ?? ""} />
    </>
  );
};

export default NodeGraph;
