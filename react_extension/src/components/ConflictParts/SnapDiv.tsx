import {useCallback, useEffect, useRef, useState} from "react";
import "./MergeConflictView.css";
import Split from "react-split";
import {debounce, sum} from "lodash";
import {Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

import * as React from "react";

interface SnapDivProps {
    linkLeft: string;
    linkRight: string;
    desc1: string;
    desc2: string;
    linkWorkCopy: string;
    tagId: string;
}

const SnapDiv: React.FC<SnapDivProps> = ({linkLeft, linkRight, desc1, desc2, linkWorkCopy, tagId}) => {
    const {t} = useTranslation();

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
        // Append the script to the component's DOM
        // console.log("apped");
        await fetchSnapFiles();
        xmlLeft = navigateSnapFile(xmlLeft, tagId);
        xmlRight = navigateSnapFile(xmlRight, tagId);
        xmlWorkCopy = navigateSnapFile(xmlWorkCopy, tagId);

        xmlLeftBlob = new Blob([xmlLeft], { type: 'text/plain' });
        xmlRightBlob = new Blob([xmlRight], { type: 'text/plain' });
        xmlMergeBlob = new Blob([xmlWorkCopy], { type: 'text/plain' });

        xmlLeftBlobLink = URL.createObjectURL(xmlLeftBlob);
        xmlRightBlobLink = URL.createObjectURL(xmlRightBlob);
        xmlMergeBlobLink = URL.createObjectURL(xmlMergeBlob);

        addSnap();
        //document.body.appendChild(script);
    }

    var world;
    var world2;
    var ide;
    var ide2;
    var world_merge;
    var ide_merge;
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

        leRef.current.width = lRec.current?.offsetWidth;
        riRef.current.width = rRec.current?.offsetWidth;
        leRef.current.height = lRec.current?.offsetHeight;
        riRef.current.height = rRec.current?.offsetHeight;
        ceRef.current.width = ceRef.current?.offsetWidth;
        ceRef.current.height = ceRef.current?.offsetHeight;
        //const arr = ['#leftEditor', '#rightEditor'];

        // use Split to display world1 and world2 side aside and allow resizing

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

        // let loop2 = () => {
        //   if (ide2 == undefined || world2 == undefined) return;
        //   setTimeout(() => {
        //     requestAnimationFrame(loop2);
        //   }, 33);
        //   world2.doOneCycle();
        // };
        world = new WorldMorph(document.getElementById("leftEditor"), false);
        world2 = new WorldMorph(document.getElementById("rightEditor"), false);
        world_merge = new WorldMorph(document.getElementById("centerEditor"), false);

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
        ide_merge.openIn(world_merge)

        loop();

        setTimeout(() => {
            highlightScript(ide, xmlLeft);
            highlightScript(ide2, xmlRight);
            highlightScript(ide_merge, xmlWorkCopy);
        }, 1000);

        // requestAnimationFrame(loop);
        // requestAnimationFrame(loop2);
        //Split(arr, { sizes: [50, 50] });
        let le = document.getElementById("leftEditor");
        let re = document.getElementById("rightEditor");
        let ce = document.getElementById("centerEditor");
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

        const cpane = document.getElementById("centerEditor");
        if (cpane) cRec.current?.removeChild(cpane);

        const canvas_center = document.createElement("canvas");
        canvas_center.ref = ceRef;
        canvas_center.style.height = "100%";
        canvas_center.style.width = "100%";
        canvas_center.className = "centerSplitPane";
        canvas_center.id = "centerEditor";
        canvas_center.tabIndex = 1;
        cRec.current?.appendChild(canvas_center);
    };

    const pane = useRef<HTMLDivElement>(null);

    const leRef = useRef<HTMLCanvasElement>(null);
    const riRef = useRef<HTMLCanvasElement>(null);
    const ceRef = useRef<HTMLCanvasElement>(null);

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
    const cRec = useRef();

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

    const updateSizeRef = () => {
        // console.log("Stuff");
        try {
            // console.log(world.bounds ?? "nope");
        } catch (_) {
            _;
        }
    };

    const highlightScript = (hlght_ide, hlght_xml) => {
            const parser = new DOMParser();
            const snapDom = parser.parseFromString(hlght_xml, "text/xml");
            const conflictScript = snapDom.querySelector('[customData="'+tagId+'"]');
            const scriptsElement = conflictScript.parentNode;
            let scriptsArray = Array.from(scriptsElement.children);
            scriptsArray = scriptsArray.slice(0, scriptsArray.indexOf(conflictScript));
            const prev_lines = sum(scriptsArray.map(s => (s.children.length))) + scriptsArray.length + 1;

            highlight_blocks(hlght_ide, prev_lines, prev_lines + conflictScript.children.length);
    };

    const highlight_blocks = (hlght_ide, from, to) => {
        setTimeout(() => {
            highlight_blocks(hlght_ide, from, to);
        }, 2000);

        hlght_ide.flashSpriteScripts(from, to);
        setTimeout(() => {
            hlght_ide.unflashSpriteScripts(from, to);
        }, 1000);
    };

    // Function to make an asynchronous HTTP request using fetch
    async function fetchSnapFiles() {
        try {
            // Use Promise.all to wait for all requests to complete
            const [response1, response2, response3] = await Promise.all([
                fetch(linkLeft),
                fetch(linkRight),
                fetch(linkWorkCopy)
            ]);

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

    function navigateSnapFile(snapFile, tagId) {
        const parser = new DOMParser();
        const snapDom = parser.parseFromString(snapFile, "text/xml");
        // Set selector accordingly
        const conflictScript = snapDom.querySelector('[customData="'+tagId+'"]');
        let conflictRoot = conflictScript.parentNode.parentNode;
        if (conflictRoot.tagName == "sprite") {
            // Case 1: Tag is in a Sprite in a Script
            // => Set scene selector accordingly
            // => Set stage selector accordingly
            // => Set scripts selector accordingly

            const spriteId = conflictRoot.getAttribute("idx");
            conflictRoot.parentNode.setAttribute("select", spriteId);
            conflictRoot = conflictRoot.parentNode.parentNode;
        } else if (conflictRoot.tagName == "stage") {
            // Case 2: Tag is in a stage in a script
            // => Set scene selector accordingly
            // => Set stage selector accordingly
            // => Set scripts selector to 0

            const stageNode = conflictRoot.parentNode.parentNode;
            const spritesNode = stageNode.querySelector('sprites');
            spritesNode.setAttribute("select", "0");
        }

        const sceneId = Array.from(conflictRoot.parentNode.parentNode.children).indexOf(conflictRoot.parentNode) + 1;
        conflictRoot.parentNode.parentNode.setAttribute("select", sceneId);

        return new XMLSerializer().serializeToString(snapDom);
    }

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
                // sizes={[49.5, 50.5]}
                style={{height: "600px"}}
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
                        style={{height: "100%", width: "100%"}}
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
                        style={{height: "100%", width: "100%"}}
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
                        style={{height: "100%", width: "100%"}}
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
