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


//Tooltip
cy.nodes().each(function(ele){
    ele.qtip({
  content: 'Hello I am ' + ele.data('id'),
  position: {
    my: 'top center',
    at: 'bottom center'
  },
  style: {
    classes: 'qtip-bootstrap',
    tip: {
      width: 16,
      height: 8
    }
  }
});
});
//TODO:
/*
// qTip2 call below will grab this JSON and use the firstName as the content
$('.selector').qtip({
    content: {
        text: function(event, api) {
            $.ajax({
                url: '/path/to/json/output', // URL to the JSON file
                type: 'GET', // POST or GET
                dataType: 'json', // Tell it we're retrieving JSON
                data: {
                    id: $(this).attr('id') // Pass through the ID of the current element matched by '.selector'
                },
            })
            .then(function(data) {
                //Process the retrieved JSON object Retrieve a specific attribute from our parsed JSON string and set the tooltip content.
                var content = 'My name is ' + data.person.firstName;

                // Now we set the content manually (required!)
                api.set('content.text', content);
            }, function(xhr, status, error) {
                // Upon failure... set the tooltip content to the status and error value
                api.set('content.text', status + ': ' + error);
            });

            return 'Loading...', // Set some initial loading text
        }
    }
});
*/


var findOptimalPosition = function(elements){
    var xPositions = [];
    var yPositions = [];
    elements.each(function(ele){
       xPositions.push(ele.position('x'));
       yPositions.push(ele.position('y')); 
    });
    return [Math.min(...xPositions)+(Math.max(...xPositions)-Math.min(...xPositions))/2, Math.max(...yPositions)+75];    
}

var getNextId = function(){
    // Abfrage am Server, der neue Node einträgt.
    //Vorerst machen wir was zufaelliges
    return 100+ Math.floor(Math.random()*5000);
}


$('#merge').mousedown(function (evt) {
  //  if (cy.selectionType = 'single'){
     //   cy.selectionType = 'additive';
        var selectedElements = cy.$(':selected')
        
        if (selectedElements.length > 0){          
            console.log(selectedElements);

            var positions = findOptimalPosition(selectedElements);

            var eleNeu = cy.add({
                group: "nodes",
                data: { id: 'n'+getNextId() },
                position: { x: positions[0], y: positions[1] }
            });

            selectedElements.forEach(function(ele){
               cy.add ({
                    group: "edges",
                    data: { source: ele.data('id'), target: eleNeu.data('id') }
                });
            });

            cy.$(':selected').unselect();              
        }

 //   }

});















// #open: link an snap hinten dran und schon öffnet sich ds Projekt, dafür brauchen wir DB wo die XML drin sind die wir ausliefern.