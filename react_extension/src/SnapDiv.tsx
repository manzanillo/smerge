import { useCallback, useEffect, useRef, useState } from "react";
import "./MergeConflictView.css";
import Split from "react-split";
import { debounce } from "lodash";

import * as React from "react";

interface SnapDivProps {
  xml1: string;
  xml2: string;
}

const SnapDiv: React.FC<SnapDivProps> = ({ xml1, xml2 }) => {
  // const xml1 = useRef<string>("");
  // const xml2 = useRef<string>("");

  const xml1IsFetching = useRef<boolean>(false);
  const xml2IsFetching = useRef<boolean>(false);

  useEffect(() => {
    setTimeout(loadWorld, 20);
    // if(!xml1IsFetching.current){
    //     xml1IsFetching.current = true;
    //     fetch("http://127.0.0.1/media/2.xml").then((res) => {
    //         return res.text()
    //     }).then((xml) => {
    //         xml1.current = xml;
    //         loadData();
    //     })
    // }

    // if(!xml2IsFetching.current){
    //     xml2IsFetching.current = true;
    //     fetch("http://127.0.0.1/media/2.xml").then((res) => {
    //         return res.text()
    //     }).then((xml) => {
    //         xml2.current = xml;
    //         loadData();
    //     })
    // }

    // Clean up when the component unmounts
    return () => {
      removeSnap();
    };
  }, []);
  // const loadData = () => {
  //     if (xml1.current != "" && xml2.current != ""){
  //         addSnap();

  //         ide.getURL("http://127.0.0.1/media/2.xml");
  //         // try{
  //         // ide.prototype.loadProjectXML(xml1);
  //         // ide2.prototype.loadProjectXML(xml2);
  //         // } catch (_){_}
  //     }
  // }

  const loadWorld = useCallback(() => {
    // Append the script to the component's DOM
    console.log("apped");
    addSnap();
    //document.body.appendChild(script);
  }, []);
  var world;
  var world2;
  var ide;
  var ide2;

  const addSnap = () => {
    if (world != undefined || world2 != undefined) {
      console.log("stopped");
      return;
    }

    leRef.current.width = lRec.current?.offsetWidth;
    riRef.current.width = rRec.current?.offsetWidth;
    leRef.current.height = lRec.current?.offsetHeight;
    riRef.current.height = rRec.current?.offsetHeight;
    //const arr = ['#leftEditor', '#rightEditor'];

    // use Split to display world1 and world2 side aside and allow resizing

    ide = new IDE_Morph({
      load: xml1,
      hideControls: true,
      mode: "preview",
      noPalette: true,
      noUserSettings: true,
      hideCategories: true,
      noSpriteEdits: true,
      noSprites: true,
      blocksZoom: 1,
      noImports: true,
      world: world,
    });

    // setTimeout(() => {
    //   console.log("Ide1 vars: ");
    //   //   ide.flashSpriteScripts(0, 1000, "Stage");
    //   ide.bounds.corner.x = 1000;
    //   //   ide.refreshIDE();
    //   //   ide.applyConfigurations();
    //   //   ide.applyPaneHidingConfigurations();
    //   //   ide.applySavedSettings();
    //   //   ide.buildPanes();
    //   //   ide.getSettings();
    //   //   ide.setPaletteWidth(100);
    //   //   ide.setStageExtent(new Point(1000, 600));
    //   //   ide.fixLayout();
    //   //   ide.settingsMenu();
    //   //   ide.snapMenu();
    //   ide.switchTo("Stage");
    //   //   console.log(ide.bounds);
    //   //refreshIDE
    // }, 1000);

    ide2 = new IDE_Morph({
      load: xml2,
      hideControls: true,
      mode: "preview",
      noPalette: true,
      noUserSettings: true,
      hideCategories: true,
      noSpriteEdits: true,
      noSprites: true,
      blocksZoom: 1,
      noImports: true,
      world: world2,
    });

    const loop = () => {
      if (
        ide == undefined ||
        world == undefined ||
        ide2 == undefined ||
        world2 == undefined
      )
        return;
      setTimeout(() => {
        requestAnimationFrame(loop);
      }, 60);
      //   console.log("Draw1");
      world.doOneCycle();
      world2.doOneCycle();
    };

    // let loop2 = () => {
    //   if (ide2 == undefined || world2 == undefined) return;
    //   setTimeout(() => {
    //     requestAnimationFrame(loop2);
    //   }, 33);
    //   world2.doOneCycle();
    // };
    world = new WorldMorph(document.getElementById("leftEditor"), false);
    world2 = new WorldMorph(document.getElementById("rightEditor"), false);

    // setTimeout(() => {
    //   console.log(world);
    //   console.log(world.bounds);
    //   //   world.setExtent(new Point(300, 300));
    // }, 1000);

    // * setPosition(aPoint)
    // * setExtent(aPoint)

    // don't fill
    ide.openIn(world);
    ide2.openIn(world2);

    loop();
    // requestAnimationFrame(loop);
    // requestAnimationFrame(loop2);
    //Split(arr, { sizes: [50, 50] });
    let le = document.getElementById("leftEditor");
    let re = document.getElementById("rightEditor");
    le.style.position = "unset";
    re.style.position = "unset";
    // setTimeout(c2, 500);
    // console.log(world);

    // console.log(ide);
  };

  const removeSnap = () => {
    console.log("Removed");
    ide = undefined;
    world = undefined;
    ide2 = undefined;
    world2 = undefined;

    const isFirefox = navigator.userAgent.includes("Firefox");

    // kill and reapply whole canvas, otherwise snap won't resize in some browsers...
    if (isFirefox) return;
    const lpane = document.getElementById("leftEditor");
    if (lpane) lRec.current?.removeChild(lpane);

    const canvas = document.createElement("canvas");
    canvas.ref = leRef;
    canvas.style.height = "100%";
    canvas.style.width = "100%";
    canvas.className = "leftSplitPane";
    canvas.id = "leftEditor";
    canvas.tabIndex = 1;
    lRec.current?.appendChild(canvas);

    const rpane = document.getElementById("rightEditor");
    if (rpane) rRec.current?.removeChild(rpane);

    const canvas2 = document.createElement("canvas");
    canvas2.ref = riRef;
    canvas2.style.height = "100%";
    canvas2.style.width = "100%";
    canvas2.className = "rightSplitPane";
    canvas2.id = "rightEditor";
    canvas2.tabIndex = 1;
    rRec.current?.appendChild(canvas2);
  };

  const pane = useRef<HTMLDivElement>(null);

  const leRef = useRef<HTMLCanvasElement>(null);
  const riRef = useRef<HTMLCanvasElement>(null);

  window.addEventListener(
    "resize",
    function () {
      debouncedUpdateSize();
    },
    true
  );

  //const viewRatio = useState([49.0, 51.0]);

  // const lRec = useRef<DOMRect>();
  // const rRec = useRef<DOMRect>();
  const lRec = useRef();
  const rRec = useRef();

  const updateIdeSizes = () => {
    console.log("addEventListener - resize");
    try {
      removeSnap();
      addSnap();
    } catch (e) {
      console.log(e);
    }
  };

  const debouncedUpdateSize = useRef(
    debounce(() => {
      updateIdeSizes();
    }, 20)
  ).current;

  useEffect(() => {
    return () => {
      debouncedUpdateSize.cancel();
    };
  }, [debouncedUpdateSize]);

  const updateSizeRef = () => {
    console.log("Stuff");
    try {
      console.log(world.bounds ?? "nope");
    } catch (_) {
      _;
    }
  };

  return (
    // <div className='merge_main_space' >
    //     <div ref={pane} className='merge_main_pane'>
    <>
      <Split
        onDragEnd={(_) => {
          debouncedUpdateSize();
        }}
        className="split"
        gutterAlign="center"
        sizes={[49.5, 50.5]}
        style={{ height: "600px" }}
      >
        <div ref={lRec} style={{ width: "100%", height: "100%" }}>
          <canvas
            ref={leRef}
            style={{ height: "100%" }}
            className="leftSplitPane"
            id="leftEditor"
            tabIndex={1}
          ></canvas>
        </div>
        <div ref={rRec} style={{ width: "100%", height: "100%" }}>
          <canvas
            ref={riRef}
            style={{ height: "100%" }}
            className="rightSplitPane"
            id="rightEditor"
            tabIndex={2}
          ></canvas>
        </div>
      </Split>
    </>
  );
};

export default SnapDiv;

// {/* </div>
//             {/* <DefaultButton onClick={() => {
//                 removeSnap()}}>Stop</DefaultButton>
//             <DefaultButton onClick={() => {addSnap()}}>Start</DefaultButton> */}
//         </div> */}
