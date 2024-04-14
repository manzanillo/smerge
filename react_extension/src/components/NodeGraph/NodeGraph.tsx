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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { debounce, toNumber } from "lodash";
import { useQueryClient } from "@tanstack/react-query";
import SettingsModal from "../SettingsModal";
import cxtmenu from "cytoscape-cxtmenu";
import generateContextMenuSettings, {
  CytoscapeContextElement,
} from "./ContextMenuDefinition";
import stylesheet from "./StyleSheet";
import httpService from "../../services/HttpService";
import MergeButtons from "../MergeButtons";
import ProjectDto from "../models/ProjectDto";
import ProjectStats from "../ProjectStats";
import NameDialog from "../shared/NameDialog";
import { putLabelChange } from "../../services/ProjectService";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NodeGraphProps {
  // projectId: string;
  projectData: ProjectDto;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
  gatherProjectData: () => Promise<void>;
}

Cytoscape.use(dagre);

const NodeGraph: React.FC<NodeGraphProps> = ({
  projectData,
  setProjectData,
  gatherProjectData,
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
  const getSavedLayout = () => {
    const ret = localStorage.getItem(savedLayoutKey);
    return ret ?? "dagre";
  };
  const savedLayout = useRef(getSavedLayout());

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
  if (error) console.log("error: ", error);

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
      classes:
        file.type +
        (file.collapsed ? " collapsed" : "") +
        (file.hidden ? " hidden" : ""),
    };
    return nodeDefinition;
  });

  const edges: EdgeDefinition[] | undefined = (():
    | EdgeDefinition[]
    | undefined => {
    let edgeList = data?.flatMap((file: File) => {
      return file.ancestors.map((ancestor: number) => {
        const edgeDefinition = {
          data: { source: ancestor.toString(), target: file.id.toString() },
          targetNode: file,
        };
        return edgeDefinition;
      });
    });

    // filter duplicates and edges with collapsed source and not default target
    edgeList = edgeList?.filter((edge, index, self) => {
      const source = edge.data.source;
      const sourceNode = nodes?.find((node) => node.data.id == source);
      if (!sourceNode) return false;
      return (
        (!self
          .slice(0, index)
          .some(
            (e) =>
              e.data.source === edge.data.source &&
              e.data.target === edge.data.target
          ) &&
          !sourceNode?.classes?.includes("collapsed")) ||
        !edge.targetNode.collapsed
      );
    });

    // edgeList = edgeList?.filter((edge, index, self) => {
    //   const source = edge.data.source;
    //   const sourceNode = nodes?.find((node) => node.data.id == source);
    //   return (
    //     !self
    //       .slice(0, index)
    //       .some(
    //         (e) =>
    //           e.data.source === edge.data.source &&
    //           e.data.target === edge.data.target
    //       ) && !sourceNode?.classes?.includes("collapsed") &&
    //   );
    // });
    return edgeList;
  })();

  const [elements, setElements] = useState([
    ...(nodes ?? []),
    ...(edges ?? []),
  ]);

  // const openLock = React.useRef<boolean>(false);
  const openTab = (url: string) => {
    // if (!openLock.current) {
    window.open(url, "_blank");
    //     openLock.current = true;
    //     setTimeout(() => {
    //         openLock.current = false;
    //     }, 500)
    // }
  };

  const debouncedUpdatePosition = debounce(() => {
    updatePositions();
  }, 20);

  const nodeRef = useRef<Cytoscape.NodeSingular[]>([]);
  const updatePositions = () => {
    positionsMutate(
      nodeRef.current.map((node) => {
        return {
          id: toNumber(node.data().id),
          position: node?.position() ?? { x: 0, y: 0 },
        };
      })
    );
    nodeRef.current = [];
  };

  const handleFileOpen = (evt: Cytoscape.EventObject) => {
    const node = evt.target;

    if (node.data("file_url").includes(".conflict")) {
      openTab(
        `${window.location.origin}/ext/merge/${node
          .data("file_url")
          .replace("/media/", "")
          .replace(".conflict", "")}`
      );
    } else {
      // Open a new tab with a set link
      openTab(
        `https://snap.berkeley.edu/snap/snap.html#open:${httpService.baseURL}blockerXML/` +
          node.data("file_url").replace("/media/", "")
      );
    }
  };

  const ranFirstAgain = useRef(false);
  // changed by eventUpdate if whole layout was pushed by others
  const resize = useRef(false);
  useEffect(() => {
    if (cy.current && !isLoading) {
      setElements([...(nodes ?? []), ...(edges ?? [])]);

      cy.current?.on("dblclick", "node", handleFileOpen);
      cy.current?.on("taphold", "node", handleFileOpen);

      cy.current?.on("dragfree", "node", (evt) => {
        if (savedLayout.current !== "preset") return;

        nodeRef.current.push(evt.target);
        debouncedUpdatePosition();

        // positionMutate({
        //   id: toNumber(evt.target.data().id),
        //   position: evt.target.position(),
        // });
        lastPositionUpdate.current = Date.now();
      });

      if (!ranFirstAgain.current) {
        setTimeout(() => {
          if (savedLayout.current == "dagre") {
            // console.log("Ran first: ", savedLayout.current);
            cy.current?.layout(dagre).run();
          } else {
            cy.current?.layout({ name: savedLayout.current }).run();
          }
          cy.current?.fit();
          // cy.current?.center();
        }, 100);

        ranFirstAgain.current = true;
      }

      if (resize.current) {
        setTimeout(() => {
          cy.current?.fit();
          cy.current?.layout({ name: savedLayout.current }).run();
          // cy.current?.center();
        }, 100);

        resize.current = false;
      }

      return () => {
        // console.log("removeListener");
        cy.current?.removeListener("dblclick", "node");
        cy.current?.removeListener("dragfree", "node");
        cy.current?.removeListener("taphold", "node");
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

  function randomIntFromInterval(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const handleMessage = useCallback(
    (e: { text: string }) => {
      // console.log(e.text);
      // prevent refresh for own position change within 300ms
      if (Date.now() - lastPositionUpdate.current > 300) {
        // get currentLayout from storage, (prevent snapshot variables like the event...)
        // console.log("Got text: ", e.text);
        // console.log("SavedLayout: ", savedLayout.current);
        // console.log("Layout state: ", layout);
        const timeout = randomIntFromInterval(20, 100);
        if (e.text.includes("projectChange")) {
          setTimeout(() => gatherProjectData(), timeout);
        }
        // if (e.text.includes("savedLayout") && savedLayout.current != "preset")
        //   return;
        resize.current = e.text.includes("resize");
        if (
          e.text.includes("added") ||
          e.text.includes("color") ||
          e.text.includes("savedLayout") ||
          savedLayout.current == "preset"
        ) {
          // "load-balancing" :P
          setTimeout(() => {
            // console.log("Reloading data...");
            refresh();
          }, timeout);
        }
      }
    },
    [gatherProjectData, refresh]
  );

  useEffectInit(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pushService.open(projectId ?? "empty", handleMessage);

    // init context menu
    Cytoscape.use(cxtmenu);

    return () => {
      pushService.close(projectId ?? "empty");
    };
  }, []);

  const editNodeRef = useRef<CytoscapeContextElement>();
  const handleNodeEdit = (ele: CytoscapeContextElement) => {
    editNodeRef.current = ele;
    setNameDefaultValue(ele.data("label") ?? "");
    setNameDialogOpen(true);
  };

  useEffect(() => {
    // set context menu
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const menu = cy.current?.cxtmenu(
      generateContextMenuSettings(projectId ?? "", refresh, handleNodeEdit)
    );

    // const canvasMenu = cy.current?.cxtmenu(
    //   generateCanvasContextMenuSettings((x: number, y: number) => {
    //     setModalOpen(true);
    //     setPosition({ x, y });
    //   })
    // );

    // change layout after loading to saved if available
    let toClean: NodeJS.Timeout;
    if (savedLayout.current != "preset") {
      toClean = setTimeout(() => {
        changeLayout(savedLayout.current);
      }, 150);
    }

    return () => {
      menu?.destroy();
      // canvasMenu?.destroy();
      clearTimeout(toClean);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setTimeout(() => {
        localStorage.setItem(savedLayoutKey, "preset");
        setTimeout(() => {
          window.location.reload();
        }, 200);
      }, 100);
    }
  };

  const changeLayout = (layoutName: string) => {
    // save selected layout in storage for next loading
    localStorage.setItem(savedLayoutKey, layoutName);
    savedLayout.current = layoutName;

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
      resize.current = true;
      setLayout((l) => {
        layoutRef.current = { ...l, name: layoutName };
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

  // default color #076AAB
  // favorite color #417505
  // conflict color #d0021b

  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [nameDefaultValue, setNameDefaultValue] = useState("");

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
        projectDto={projectData ?? ""}
        changeLayout={changeLayout}
        initLayout={savedLayout.current}
        cy={cy}
        saveGraphPositions={saveGraphPositions}
        projectData={projectData}
        setProjectData={setProjectData}
        wheelSensitivity={wheelSensitivity}
        setWheelSensitivity={setWheelSensitivity}
        reloadData={refresh}
      />
      <MergeButtons cyRef={cy} refresh={refresh} projectId={projectId ?? ""} />
      <NameDialog
        open={nameDialogOpen}
        setOpen={setNameDialogOpen}
        onClose={(res) => {
          //   console.log("Input: ", res);
          //   console.log("And node ref is: ", editNodeRef.current?.data("label")); //label
          res = res.trim().substring(0, 200);
          putLabelChange(editNodeRef.current?.data("id"), res);
        }}
        def={nameDefaultValue}
      ></NameDialog>
    </>
  );
};

export default NodeGraph;
