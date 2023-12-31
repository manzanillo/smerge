const stylesheet: cytoscape.Stylesheet[] = [
    {
        selector: 'node',
        style: {
            content: 'data(label)',
            "text-margin-x": 2,
            "text-opacity": 0.8,
            "text-valign": 'center',
            "text-halign": 'right',
            "background-color": 'data(color)',
        }
    },
    {
        selector: 'edge',
        style: {
            "curve-style": 'bezier',
            width: 4,
            "target-arrow-shape": 'triangle',
            "line-color": '#808080',
            "target-arrow-color": '#808080',
        }
    },
    {
        selector: 'node:selected', // Define style for selected nodes
        style: {
            'background-color': '#C39EC1', // Change the background color to pink for selected nodes
        },
    },
    {
        selector: 'node.collapsed',
        style: {
            'shape': 'polygon',
            'shape-polygon-points': '-1, -1,   1, 0,   -1, 1,   -0.5, 0',
            'border-width': '1px',
            'border-color': 'black',
            'background-blacken': 0.25,
            // 'width': '32px',
            // 'height': '32px',
            // 'background-image': '/ext/logo.svg',
        }
    },
    {
        selector: 'node.hidden',
        style: {
            'display': 'none',
        }
    },
    {
        selector: 'edge.hidden',
        style: {
            'display': 'none',
        }
    }
]

export default stylesheet;