import {useCallback, useEffect, useRef, useState} from 'react';
import './MergeConflictView.css'
import Split from 'react-split'
import { debounce } from 'lodash';
import ScriptTag from "react-script-tag";
import * as React from "react";
import {Helmet} from "react-helmet";


interface SnapDivProps {
    xml1: string;
    xml2: string;
  }
  
  const SnapDiv: React.FC<SnapDivProps> = ({ xml1, xml2 }) => {
    // const xml1 = useRef<string>("");
    // const xml2 = useRef<string>("");

    const xml1IsFetching = useRef<boolean>(false);
    const xml2IsFetching = useRef<boolean>(false);


      const [scriptsLoaded, setScriptsLoaded] = useState<number>(0)

    useEffect(() => {
        setTimeout(loadWorld, 100);
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
        console.log("apped")
        addSnap()
        //document.body.appendChild(script);
    }, []);
    var world;
    var world2;
    var ide;
    var ide2;

    const addSnap = () => {
        if(world != undefined || world2 != undefined) {console.log("stopped"); return}

        leRef.current.width = lRec.current?.offsetWidth;
        riRef.current.width = rRec.current?.offsetWidth;
        leRef.current.height = lRec.current?.offsetHeight;
        riRef.current.height = rRec.current?.offsetHeight;


        console.log("Started.")
        //const arr = ['#leftEditor', '#rightEditor'];

        // use Split to display world1 and world2 side aside and allow resizing

        ide = new IDE_Morph({ load:xml1, hideControls: true, mode: "preview", noPalette: true, noUserSettings: true, hideCategories: true, noSpriteEdits: true, noSprites: true, blocksZoom:1, noImports: true, world: world });
        let loop = () => {
            if(ide == undefined || world == undefined) return;
            setTimeout(() => {requestAnimationFrame(loop);}, 33);
            //console.log("Draw1")
            world.doOneCycle();
        };
        ide2 = new IDE_Morph({ load:xml2, hideControls: true, mode: "editor", noPalette: true, noUserSettings: true, hideCategories: true, noSpriteEdits: true, noSprites: true, blocksZoom:1, noImports: true, world: world2 });
        let loop2 = () => {
            if(ide2 == undefined || world2 == undefined) return;
            setTimeout(() => {requestAnimationFrame(loop2);}, 33);
            world2.doOneCycle();
        };
        world = new WorldMorph(document.getElementById('leftEditor'), false);
        world2 = new WorldMorph(document.getElementById('rightEditor'), false);
        // don't fill
        ide.openIn(world);
        ide2.openIn(world2);
        requestAnimationFrame(loop);
        requestAnimationFrame(loop2);
        //Split(arr, { sizes: [50, 50] });
        let le = document.getElementById('leftEditor');
        let re = document.getElementById('rightEditor');
        le.style.position = 'unset';
        re.style.position = 'unset';
        // setTimeout(c2, 500);
        console.log(world);
        
        console.log(ide);
    }

    const removeSnap = () => {
        console.log("Removed");
        ide = undefined; 
        world=undefined; 
        ide2 = undefined; 
        world2=undefined; 
    }

    const pane = useRef<HTMLDivElement>(null);

    const leRef = useRef<HTMLCanvasElement>(null);
    const riRef = useRef<HTMLCanvasElement>(null);

    window.addEventListener('resize', function () {
        debouncedUpdateSize();
    }, true);

    //const viewRatio = useState([49.0, 51.0]);

    // const lRec = useRef<DOMRect>();
    // const rRec = useRef<DOMRect>();
    const lRec = useRef();
    const rRec = useRef();

    const updateIdeSizes = () => {
        console.log('addEventListener - resize');
        try{
            removeSnap();
            addSnap();
        } catch (e){
            console.log(e)
        }
    }

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
        console.log("Stuff")
        try{
            console.log(world.bounds ?? "nope")
        } catch (_){
            _
        }
    }

    return (
        // <div className='merge_main_space' >
        //     <div ref={pane} className='merge_main_pane'>
                <>
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/morphic.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/api.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/symbols.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/widgets.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/blocks.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/threads.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/objects.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/scenes.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/gui.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/paint.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/lists.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/byob.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/tables.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/sketch.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/video.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/maps.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/extensions.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/xml.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/store.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/locale.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/cloud.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/sha512.js" type="text/javascript" />
                        <ScriptTag onLoad={()=>{setScriptsLoaded(scriptsLoaded + 1)}} src="/ext/csnap/FileSaver.min.js" type="text/javascript" />

                <Split
                    onDragEnd={(_) => { debouncedUpdateSize(); }}
                    className="split"
                    gutterAlign="center"
                    sizes={[49.5, 50.5]}
                    style={{height:"600px"}}
                >
                    <div ref={lRec} style={{ width:"100%", height:"100%"}}><canvas ref={leRef} className='leftSplitPane' id="leftEditor" tabIndex={1} ></canvas></div>
                    <div ref={rRec} style={{ width:"100%", height:"100%"}}><canvas ref={riRef} className='rightSplitPane' id="rightEditor" tabIndex={2} ></canvas></div>
                </Split>
            </>
    )
}

export default SnapDiv

// {/* </div>
//             {/* <DefaultButton onClick={() => {
//                 removeSnap()}}>Stop</DefaultButton>
//             <DefaultButton onClick={() => {addSnap()}}>Start</DefaultButton> */}
//         </div> */}