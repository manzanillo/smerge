var projectRoom = document.querySelector(".project-heading").getAttribute("data-proj-id");

var websocketProtocol = location.protocol === 'https:' ? 'wss://' : 'ws://'

var socket = new WebSocket(
    websocketProtocol + window.location.host +
    '/ws/' + projectRoom + '/');

socket.onmessage = function(e) {
    var data = JSON.parse(e.data);
    var event = data['event']
    var new_node = data['node'];

    window.cy.add({
                    group: "nodes",
                    data: {
                        id: new_node.id,
                        href: new_node.file_url,
                        description: new_node.description,
                        timestamp : new_node.timestamp,
                        number_scripts : new_node.number_scripts,
                        number_sprites : new_node.number_sprites,
                        ancestors : new_node.ancestors,
                        color: new_node.color,
                    }
                });
    if (new_node.ancestors){
        // add new edges for the new node
        new_node.ancestors.forEach(function(ancestorId){
            cy.add ({
                group: "edges",
                data: { source: ancestorId, target: new_node.id }
            });
        });
        // refresh the layout of the nodes
        window.cy.layout({name: 'dagre'}).run()
    }


    /*if (false){

        new_node.ancestors
        collection = collection.union(window.cy.getElementById());


        var positions = findOptimalPosition(selectedElements);

        var eleNeu = cy.add({
            group: "nodes",
            data: {
                id: new_node.id,
                href: new_node.file_url,
                description: new_node.description,
                timestamp : new_node.timestamp,
                number_scripts : new_node.number_scripts,
                number_sprites : new_node.number_sprites,
                ancestors : new_node.ancestors,
                color: new_node.color,
            },
            position: { x: positions[0], y: positions[1] }
        });

        selectedElements.forEach(function(ele){
           cy.add ({
                group: "edges",
                data: { source: ele.data('id'), target: new_node.id }
            });
        });
    } */
};

socket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

socket.onopen = function(e){
    console.log('websocket connection established')
}



var findOptimalPosition = function(elements){
    var xPositions = [];
    var yPositions = [];
    elements.each(function(ele){
       xPositions.push(ele.position('x'));
       yPositions.push(ele.position('y'));
    });
    return [Math.min(...xPositions)+(Math.max(...xPositions)-Math.min(...xPositions))/2, Math.max(...yPositions)+75];
}