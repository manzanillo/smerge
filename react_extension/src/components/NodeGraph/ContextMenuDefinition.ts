import downloadIcon from "../../assets/download.png";
import uploadIcon from "../../assets/upload.png";
import colorIcon from "../../assets/color.png";
import editIcon from "../../assets/edit.png";
import collapseIcon from "../../assets/collapse.png";
import httpService from "../../services/HttpService";
import { CollectionStyle, Singular } from "cytoscape";
import { getToggleCollapse } from "../../services/ProjectService";

export interface CytoscapeContextElement extends Singular {
  successors(): ExtendedCollectionStyle;
}
interface ExtendedCollectionStyle extends CollectionStyle {
  map(e: unknown): unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateContextMenuSettings: any = (
  projectId: string,
  refresh: () => void,
  openNodeDialog: (ele: CytoscapeContextElement) => void
) => {
  return {
    menuRadius: 75,
    selector: "node.default",
    commands: [
      {
        fillColor: "rgba(200, 200, 200, 0.75)",
        content: `<img src="${downloadIcon}" alt="Download" />`,
        select: function (ele: CytoscapeContextElement) {
          const element = document.createElement("a");
          element.setAttribute("href", ele.data("file_url"));
          element.setAttribute("download", ele.data("label") + ".xml");
          element.style.display = "none";
          document.body.appendChild(element);

          element.click();

          document.body.removeChild(element);
        },
      },
      {
        fillColor: "rgba(200, 200, 200, 0.75)",
        content: `<img src="${collapseIcon}" alt="Edit" />`,
        select: function (ele: CytoscapeContextElement) {
          getToggleCollapse(ele.data("id"));
        },
      },
      {
        fillColor: "rgba(200, 200, 200, 0.75)",
        content: `<img src="${editIcon}" alt="Edit" />`,
        select: function (ele: CytoscapeContextElement) {
          // console.log(ele);
          // console.log("Edit");
          openNodeDialog(ele);
        },
      },
      {
        fillColor: "rgba(200, 200, 200, 0.75)",
        content: `<img src="${colorIcon}" alt="Edit" />`,
        select: function (ele: CytoscapeContextElement) {
          const toggle_color_url = "toggle_color/" + projectId + "/" + ele.id();
          // console.log(httpService.baseURL);
          httpService.get(
            toggle_color_url,
            () => {
              refresh();
            },
            (req) => {
              console.log(`Url: '${toggle_color_url}' failed. \n ${req}`);
            },
            () => {},
            true,
            false
          );
        },
      },
    ],
    fillColor: "rgba(0, 0, 0, 0.75)",
    activeFillColor: "#076aab",
    activePadding: 20,
    indicatorSize: 24,
    separatorWidth: 5,
    spotlightPadding: 4,
    minSpotlightRadius: 24,
    maxSpotlightRadius: 38,
    openMenuEvents: "cxttapstart",
    itemColor: "white",
    itemTextShadowColor: "transparent",
    zIndex: 9999,
    atMouse: false,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateCanvasContextMenuSettings: any = (
  openUpload: (x: number, y: number) => void
) => {
  return {
    menuRadius: 75,
    selector: "core",
    commands: [
      {
        fillColor: "rgba(200, 200, 200, 0.75)",
        content: `<img src="${uploadIcon}" alt="Download" />`,
        select: function (
          _ele: CytoscapeContextElement,
          event: { position: { x: number; y: number } }
        ) {
          const { x, y } = event.position;
          openUpload(x, y);
          console.log(`Clicked at position x: ${x}, y: ${y}`);
        },
      },
    ],
    fillColor: "rgba(0, 0, 0, 0.75)",
    activeFillColor: "#076aab",
    activePadding: 20,
    indicatorSize: 24,
    spotlightPadding: 2,
    minSpotlightRadius: 24,
    maxSpotlightRadius: 38,
    openMenuEvents: "cxttapstart",
    itemColor: "white",
    itemTextShadowColor: "transparent",
    zIndex: 9999,
    atMouse: false,
  };
};

export default generateContextMenuSettings;
