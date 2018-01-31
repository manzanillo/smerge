var cy = window.cy = cytoscape({
  container: document.getElementById('cy'),
    minZoom: 0.5,
    maxZoom: 24,
  autounselectify: false,
    selectionType: 'additive',
  layout: {
    name: 'dagre'
  },

  style: [
    {
      selector: 'node',
      style: {
        'content': 'data(id)',
        'text-opacity': 0.5,
        'text-valign': 'center',
        'text-halign': 'right',
        'background-color': '#11479e'
      }
    },

    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'width': 4,
        'target-arrow-shape': 'triangle',
        'line-color': '#9dbaea',
        'target-arrow-color': '#9dbaea'
      }
    },
    {
      selector: ':selected',
      style: {
        'background-color': '#CC0000',
      }
    }      
  ],

    
    
  elements: {
    nodes: [
      { data: { id: 'n0' , href: 'http://www.google.de' } },
      { data: { id: 'n1' } },
      { data: { id: 'n2' } },
      { data: { id: 'n3' } },
      { data: { id: 'n4' } },
      { data: { id: 'n5' } },
      { data: { id: 'n6' } },
      { data: { id: 'n7' } },
      { data: { id: 'n8' } },
      { data: { id: 'n9' } },
      { data: { id: 'n10' } },
      { data: { id: 'n11' } },
      { data: { id: 'n12' } },
      { data: { id: 'n13' } },
      { data: { id: 'n14' } },
      { data: { id: 'n15' } },
      { data: { id: 'n16' } }
    ],
    edges: [
      { data: { source: 'n0', target: 'n1' } },
      { data: { source: 'n1', target: 'n2' } },
      { data: { source: 'n1', target: 'n3' } },
      { data: { source: 'n4', target: 'n5' } },
      { data: { source: 'n4', target: 'n6' } },
      { data: { source: 'n6', target: 'n7' } },
      { data: { source: 'n6', target: 'n8' } },
      { data: { source: 'n8', target: 'n9' } },
      { data: { source: 'n8', target: 'n10' } },
      { data: { source: 'n11', target: 'n12' } },
      { data: { source: 'n12', target: 'n13' } },
      { data: { source: 'n13', target: 'n14' } },
      { data: { source: 'n13', target: 'n15' } },
    ]
  },
});

cy.on('taphold', 'node', function(){
    if (this.data('href')){
        try { // your browser may block popups
            window.open( this.data('href') );
        } catch(e){ // fall back on url change
            window.location.href = this.data('href');
        }
    }
});



//taphold
$('#merge').mousedown(function (evt) {
    var selectedElements = cy.$(':selected')
    console.log("you want to merge " + selectedElements);
        
    var eleNeu = cy.add({
        group: "nodes",
        data: { id: 'neu' }
    });
    

    selectedElements.forEach(function(ele){
            console.log(ele);
            console.log(ele.$id());
       cy.add ({
            group: "edges",
            data: { source: ele.data('id'), target: 'neu' }
        });
    });
        
    cy.$(':selected').unselect();
});



// #open: link an snap hinten dran und schon öffnet sich ds Projekt, dafür brauchen wir DB wo die XML drin sind die wir ausliefern.