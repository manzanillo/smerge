 var projectRoom = document.querySelector(".project-heading").getAttribute("data-proj-id");

var socket = new WebSocket(
    'ws://' + window.location.host +
    '/ws/' + projectRoom + '/');

socket.onmessage = function(e) {
    var data = JSON.parse(e.data);
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
        console.log(ancestorId)
                           cy.add ({
                                group: "edges",
                                data: { source: ancestorId, target: new_node.id }
                            });
                        });

        // refresh the layout of the nodes
        window.cy.layout({name: 'dagre'}).run()

    }


};

socket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

socket.onopen = function(e){
    console.log('websocket connection established')
}

