import downloadIcon from '../../assets/download.png'
import colorIcon from '../../assets/color.png'
import editIcon from '../../assets/edit.png'
import collapseIcon from '../../assets/collapse.png'
import httpService from '../../services/HttpService'
import { CollectionStyle, Singular } from 'cytoscape'
import { getToggleCollapse } from '../../services/ProjectService'

export interface CytoscapeContextElement extends Singular {
    successors(): ExtendedCollectionStyle;
}
interface ExtendedCollectionStyle extends CollectionStyle {
    map(e: unknown): unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateContextMenuSettings:any = (projectId: string, refresh: () => void, openNodeDialog: (ele: CytoscapeContextElement)=>void) => {
    return {
        menuRadius: 75, // the radius of the circular menu in pixels
        selector: 'node.default', // elements matching this Cytoscape.js selector will trigger cxtmenus
        commands: [
            {
                fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
                content: `<img src="${downloadIcon}" alt="Download" />`, // html/text content to be displayed in the menu
                select: function (ele: CytoscapeContextElement) {
                    const element = document.createElement('a');
                    element.setAttribute('href', ele.data('file_url'));
                    element.setAttribute('download', ele.data('description'));
    
                    element.style.display = 'none';
                    document.body.appendChild(element);
    
                    element.click();
    
                    document.body.removeChild(element);
                }
            },
            {
                fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
                content: `<img src="${collapseIcon}" alt="Edit" />`, // html/text content to be displayed in the menu
                select: function (ele: CytoscapeContextElement) {
                    // console.log(ele);
                    // console.log(typeof(ele))
                    // console.log(ele.classes());
                    // console.log(ele.successors().map((e: { classes: () => unknown }) => {console.log(e.classes())}))

                    getToggleCollapse(ele.data("id"))

                    // if(ele.classes().includes("collapsed")){
                    //     ele.removeClass('collapsed')
                    //     ele.successors().removeClass('hidden');
                    // } else {
                    //     ele.addClass('collapsed')
                    //     ele.successors().addClass('hidden');
                    // }
                    
                }
            },
            // {
            //     fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
            //     content: `<img alt="Conf" />`, // html/text content to be displayed in the menu
            //     select: function (ele: CytoscapeContextElement) {
            //             ele.addClass('conflict')
            //         }
                    

            // },
            {
                fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
                content: `<img src="${editIcon}" alt="Edit" />`, // html/text content to be displayed in the menu
                select: function (ele: CytoscapeContextElement) {
                    console.log(ele);
                    console.log("Edit");
                    openNodeDialog(ele);
                }
            },
            {
                fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
                content: `<img src="${colorIcon}" alt="Edit" />`, // html/text content to be displayed in the menu
                select: function (ele: CytoscapeContextElement) {
                    const toggle_color_url = 'toggle_color/' + projectId + '/' + ele.id();
                    console.log(httpService.baseURL);
                    httpService.get(toggle_color_url, () => {
                        refresh();
                    }, (req) => {
                        console.log(`Url: '${toggle_color_url}' failed. \n ${req}`)
                    }, () => {
                    }, true, false)
                }
            }
        ],
        fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
        activeFillColor: '#076aab', // the colour used to indicate the selected command
        activePadding: 20, // additional size in pixels for the active command
        indicatorSize: 24, // the size in pixels of the pointer to the active command
        separatorWidth: 5, // the empty spacing in pixels between successive commands
        spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
        minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
        maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
        openMenuEvents: 'cxttapstart', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
        itemColor: 'white', // the colour of text in the command's content
        itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
        zIndex: 9999, // the z-index of the ui div
        atMouse: false // draw menu at mouse position
    }
}

export default generateContextMenuSettings;