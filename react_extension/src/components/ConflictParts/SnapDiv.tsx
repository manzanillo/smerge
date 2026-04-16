import { useEffect, useRef } from "react";
import "./MergeConflictView.css";
import Split from "react-split";
import { debounce, sum } from "lodash";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import * as React from "react";

// Globals provided by Snap runtime (declare for TypeScript)
declare const WorldMorph: any;
declare const IDE_Morph: any;

interface SnapDivProps {
    linkLeft: string;
    linkRight: string;
    desc1: string;
    desc2: string;
    linkWorkCopy: string;
    tagId: string;
}

const SnapDiv: React.FC<SnapDivProps> = ({ linkLeft, linkRight, desc1, desc2, linkWorkCopy, tagId }) => {
    const { t } = useTranslation();

    // const xml1 = useRef<string>("");
    // const xml2 = useRef<string>("");

    // const xml1IsFetching = useRef<boolean>(false);
    // const xml2IsFetching = useRef<boolean>(false);

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



    async function loadWorld() {
        // Prepare the snap files for opening in snap

        // Load the snap files from URLs
        await fetchSnapFiles();

        // Set scene and sprite selectors in files
        xmlLeft = navigateSnapFile(xmlLeft, tagId);
        xmlRight = navigateSnapFile(xmlRight, tagId);
        xmlWorkCopy = navigateSnapFile(xmlWorkCopy, tagId);

        // Create file blobs and virtuals URLs so snap can open the files
        xmlLeftBlob = new Blob([xmlLeft], { type: 'text/plain' });
        xmlRightBlob = new Blob([xmlRight], { type: 'text/plain' });
        xmlMergeBlob = new Blob([xmlWorkCopy], { type: 'text/plain' });

        xmlLeftBlobLink = URL.createObjectURL(xmlLeftBlob);
        xmlRightBlobLink = URL.createObjectURL(xmlRightBlob);
        xmlMergeBlobLink = URL.createObjectURL(xmlMergeBlob);

        addSnap();
        //document.body.appendChild(script);
    }

    let world;
    let world2;
    let ide;
    let ide2;
    let world_merge;
    let ide_merge;
    let xmlLeft;
    let xmlRight;
    let xmlWorkCopy;
    let xmlLeftBlob;
    let xmlRightBlob;
    let xmlMergeBlob;
    let xmlLeftBlobLink;
    let xmlRightBlobLink;
    let xmlMergeBlobLink;

    function addSnap() {
        if (world != undefined || world2 != undefined) {
            // console.log("stopped");
            return;
        }

        if (leRef.current && lRec.current) {
            leRef.current.width = lRec.current.offsetWidth ?? 0;
            leRef.current.height = lRec.current.offsetHeight ?? 0;
        }
        if (riRef.current && rRec.current) {
            riRef.current.width = rRec.current.offsetWidth ?? 0;
            riRef.current.height = rRec.current.offsetHeight ?? 0;
        }
        if (ceRef.current && cRec.current) {
            ceRef.current.width = cRec.current.offsetWidth ?? 0;
            ceRef.current.height = cRec.current.offsetHeight ?? 0;
        }
        //const arr = ['#leftEditor', '#rightEditor'];

        // use Split to display world1, world2 and world_merge side by side and allow resizing

        ide = new IDE_Morph({
            load: xmlLeftBlobLink,
            hideControls: true,
            mode: "preview",
            noPalette: true,
            noUserSettings: true,
            hideCategories: true,
            noSpriteEdits: true,
            noSprites: true,
            noOwnBlocks: true,
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
            load: xmlRightBlobLink,
            hideControls: true,
            mode: "preview",
            noPalette: true,
            noUserSettings: true,
            hideCategories: true,
            noSpriteEdits: true,
            noSprites: true,
            noOwnBlocks: true,
            blocksZoom: 1,
            noImports: true,
            world: world2,
        });

        ide_merge = new IDE_Morph({
            load: xmlMergeBlobLink,
            hideControls: true,
            mode: "preview",
            noPalette: true,
            noUserSettings: true,
            hideCategories: true,
            noSpriteEdits: true,
            noSprites: true,
            noOwnBlocks: true,
            blocksZoom: 1,
            noImports: true,
            world: world_merge,
        });

        const loop = () => {
            if (
                ide == undefined ||
                world == undefined ||
                ide2 == undefined ||
                world2 == undefined ||
                ide_merge == undefined ||
                world_merge == undefined
            )
                return;
            setTimeout(() => {
                requestAnimationFrame(loop);
            }, 60);
            //   console.log("Draw1");
            world.doOneCycle();
            world2.doOneCycle();
            world_merge.doOneCycle();
        };

        // Create worlds
        world = new WorldMorph(document.getElementById("leftEditor"), false);
        world2 = new WorldMorph(document.getElementById("rightEditor"), false);
        world_merge = new WorldMorph(document.getElementById("centerEditor"), false);

        // don't fill
        ide.openIn(world);
        ide2.openIn(world2);
        ide_merge.openIn(world_merge)

        loop();

        // Start highlighting the conflict blocks
        setTimeout(() => {
            highlightScript(ide, xmlLeft);
            highlightScript(ide2, xmlRight);
            highlightScript(ide_merge, xmlWorkCopy);
        }, 1000);

        // requestAnimationFrame(loop);
        // requestAnimationFrame(loop2);
        //Split(arr, { sizes: [50, 50] });
        const le = document.getElementById("leftEditor");
        const re = document.getElementById("rightEditor");
        const ce = document.getElementById("centerEditor");
        le.style.position = "unset";
        re.style.position = "unset";
        ce.style.position = "unset";
        // setTimeout(c2, 500);
        // console.log(world);

        // console.log(ide);
    }

    const removeSnap = () => {
        // console.log("Removed");
        ide = undefined;
        world = undefined;
        ide2 = undefined;
        world2 = undefined;
        ide_merge = undefined;
        world_merge = undefined;

        const isFirefox = navigator.userAgent.includes("Firefox");

        // kill and reapply whole canvas, otherwise snap won't resize in some browsers...
        if (isFirefox) return;
        const lpane = document.getElementById("leftEditor");
        if (lpane) lRec.current?.removeChild(lpane);

        const canvas = document.createElement("canvas");
        (canvas as any).ref = leRef;
        canvas.style.height = "100%";
        canvas.style.width = "100%";
        canvas.className = "leftSplitPane";
        canvas.id = "leftEditor";
        canvas.tabIndex = 1;
        lRec.current?.appendChild(canvas);

        const rpane = document.getElementById("rightEditor");
        if (rpane) rRec.current?.removeChild(rpane);

        const canvas2 = document.createElement("canvas");
        (canvas2 as any).ref = riRef;
        canvas2.style.height = "100%";
        canvas2.style.width = "100%";
        canvas2.className = "rightSplitPane";
        canvas2.id = "rightEditor";
        canvas2.tabIndex = 1;
        rRec.current?.appendChild(canvas2);

        const cpane = document.getElementById("centerEditor");
        if (cpane) cRec.current?.removeChild(cpane);

        const canvas_center = document.createElement("canvas");
        (canvas_center as any).ref = ceRef;
        canvas_center.style.height = "100%";
        canvas_center.style.width = "100%";
        canvas_center.className = "centerSplitPane";
        canvas_center.id = "centerEditor";
        canvas_center.tabIndex = 1;
        cRec.current?.appendChild(canvas_center);
    };

    const leRef = useRef<HTMLCanvasElement | null>(null);
    const riRef = useRef<HTMLCanvasElement | null>(null);
    const ceRef = useRef<HTMLCanvasElement | null>(null);

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
    const lRec = useRef<HTMLDivElement | null>(null);
    const rRec = useRef<HTMLDivElement | null>(null);
    const cRec = useRef<HTMLDivElement | null>(null);

    const updateIdeSizes = () => {
        // console.log("addEventListener - resize");
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

    // Script for periodically flashing and unflashing the conflict blocks
    const highlightScript = (hlght_ide, hlght_xml) => {
            // Parse snapfile
            const parser = new DOMParser();
            const snapDom = parser.parseFromString(hlght_xml, "text/xml");
            // Search conflict block
            const conflictScript = snapDom.querySelector('[customData="'+tagId+'"]');
            // Count previous code blocks for indexing the conflict block
            const scriptsElement = conflictScript.parentNode;
            let scriptsArray = Array.from(scriptsElement.children);
            scriptsArray = scriptsArray.slice(0, scriptsArray.indexOf(conflictScript));
            const prev_lines = sum(scriptsArray.map(s => (s.children.length))) + scriptsArray.length + 1;

            // Highlight blocks
            highlight_blocks(hlght_ide, prev_lines, prev_lines + conflictScript.children.length);
    };

    // Flash and unflash the conflict blocks
    const highlight_blocks = (hlght_ide, from, to) => {
        setTimeout(() => {
            highlight_blocks(hlght_ide, from, to);
        }, 2000);

        hlght_ide.flashSpriteScripts(from, to);
        setTimeout(() => {
            hlght_ide.unflashSpriteScripts(from, to);
        }, 1000);
    };

    // Function to make an asynchronous HTTP request using fetch retrieving the snapfiles from the server
    async function fetchSnapFiles() {
        try {
            // Use Promise.all to wait for all requests to complete
            const [response1, response2, response3] = await Promise.all([
                fetch(linkLeft),
                fetch(linkRight),
                fetch(linkWorkCopy)
            ]);

            // Use Promise.all to wait for all responses to be parsed
            [xmlLeft, xmlRight, xmlWorkCopy] = await Promise.all([
                response1.text(),
                response2.text(),
                response3.text()
            ]);
        } catch (error) {
            // Handle errors (like network issues or bad responses)
            console.error('Error:', error);
        }
    }

    // Function for setting the appropriate scene, stage & scripts selectors for correct display of the snapfiles
    function navigateSnapFile(snapFile, tagId) {
        // Parse snapfile
        const parser = new DOMParser();
        const snapDom = parser.parseFromString(snapFile, "text/xml");
        // Find conflict script
        const conflictScript = snapDom.querySelector('[customData="'+tagId+'"]');

        // Find conlfict root and check if it's a sprite or a stage
        let conflictRoot = conflictScript.parentNode.parentNode;
        if ((conflictRoot as Element).tagName == "sprite") {
            // Case 1: Tag is in a Sprite in a Script
            // => Set scene selector accordingly
            // => Set stage selector accordingly
            // => Set scripts selector accordingly

            const spriteId = (conflictRoot as Element).getAttribute("idx");
            (conflictRoot.parentNode as Element).setAttribute("select", spriteId as any);
            conflictRoot = conflictRoot.parentNode.parentNode;
        } else if ((conflictRoot as Element).tagName == "stage") {
            // Case 2: Tag is in a stage in a script
            // => Set scene selector accordingly
            // => Set stage selector accordingly
            // => Set scripts selector to 0

            const stageNode = conflictRoot.parentNode.parentNode;
            const spritesNode = stageNode.querySelector('sprites');
            spritesNode.setAttribute("select", "0");
        }

        // Find correct scene and set scene selector
        const sceneId = Array.from(((conflictRoot.parentNode?.parentNode) as Element).children).indexOf(conflictRoot.parentNode as Element) + 1;
        ((conflictRoot.parentNode?.parentNode) as Element).setAttribute("select", String(sceneId));

        return new XMLSerializer().serializeToString(snapDom);
    }

    return (
        // <div className='merge_main_space' >
        //     <div ref={pane} className='merge_main_pane'>
        <>
            <Split
                onDragEnd={() => {
                     debouncedUpdateSize();
                 }}
                className="split"
                gutterAlign="center"
                // sizes={[49.5, 50.5]}
                style={{ height: "600px" }}
            >
                <div ref={lRec} style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <Typography variant="h6">
                        {t("SnapDiv.leftCommit") + ": " + desc1}
                    </Typography>
                    <canvas
                        ref={leRef}
                        style={{ height: "100%", width: "100%" }}
                        className="leftSplitPane"
                        id="leftEditor"
                        tabIndex={1}
                    ></canvas>
                </div>
                <div ref={cRec} style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <Typography variant="h6">
                        {t("SnapDiv.result")}
                    </Typography>
                    <canvas
                        ref={ceRef}
                        style={{ height: "100%", width: "100%" }}
                        id="centerEditor"
                        tabIndex={1}
                    ></canvas>
                </div>
                <div ref={rRec} style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <Typography variant="h6">
                        {t("SnapDiv.rightCommit") + ": " + desc2}
                    </Typography>
                    <canvas
                        ref={riRef}
                        style={{ height: "100%", width: "100%" }}
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
