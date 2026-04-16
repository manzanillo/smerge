import type {Ext} from "cytoscape";

// Lightweight module declaration for the `cytoscape-node-html-label` plugin.
// The package ships a `.d.ts` that declares globals but not a module, which
// causes `TS2306: ...d.ts is not a module` when importing. We provide a local
// module declaration and augment the `cytoscape` Core interface so TS knows
// about `nodeHtmlLabel`.

// Declare the module so `import nodeHtmlLabel from 'cytoscape-node-html-label'` works
declare module "cytoscape-node-html-label" {
  const nodeHtmlLabel: any;
  export default nodeHtmlLabel;
}

// Augment the 'cytoscape' module types to include nodeHtmlLabel on Core
declare module "cytoscape" {
  interface LabelOptions {
    enablePointerEvents: boolean;
  }
  interface Core {
    /**
     * nodeHtmlLabel plugin adds HTML labels to nodes.
     * Parameters are intentionally typed as any to avoid coupling to the
     * upstream plugin typings which are incomplete in the shipped package.
     */
    nodeHtmlLabel(params: any, options?: any): any;
  }
}
