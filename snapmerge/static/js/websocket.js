 var projectRoom = document.querySelector(".project-heading").getAttribute("data-proj-id");

var socket = new WebSocket(
    'ws://' + window.location.host +
    '/ws/' + projectRoom + '/');

socket.onmessage = function(e) {
    var data = JSON.parse(e.data);
    var message = data['message'];
    console.log(message)
    //document.querySelector('#chat-log').value += (message + '\n');
};

socket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

socket.onopen = function(e){
    var message = "hi"
    socket.send(JSON.stringify({
        'message': message
    }));
}

