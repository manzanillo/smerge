function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function upload(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    $('#drop-info').hide()

    // getFirst (and only) file from FileList
    var files = evt.dataTransfer.files;
    var uploadFile = files[0];

    var formData = new FormData();
    formData.append("file", files[0]);
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add/"+ $("h1.project-heading").attr("data-proj-id"), true);
    xhttp.setRequestHeader("X-CSRFToken", csrftoken);
    xhttp.send(formData);

    xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      new_node = xhttp.responseText;
      // Include Node in Graph w/o reloading

      var eleNeu = window.cy.add({
            group: "nodes",
            data: {
                id: new_node.id,
                href: new_node.file_url,
                description: new_node.description,
                timestamp : new_node.timestamp,
                number_scripts : new_node.number_scripts,
                number_sprites : new_node.number_sprites,
                ancestors : new_node.ancestors
            },
        });

        window.cy.layout({name: 'dagre'}).run()
    }
  }



}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    $('#drop-info').show();
}

// Initialisiere Drag&Drop EventListener
var dropZone = document.getElementById('drop-info');
document.body.addEventListener('dragover', handleDragOver);
document.body.addEventListener('drop', function(evt){ evt.stopPropagation(); evt.preventDefault(); $('#drop-info').hide();});

dropZone.addEventListener('drop', upload);
