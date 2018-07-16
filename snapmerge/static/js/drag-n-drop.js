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
    console.log(formData)
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add/"+ $("h1.project-heading").attr("data-proj-id"), true);
    xhttp.setRequestHeader("X-CSRFToken", csrftoken);
    xhttp.send(formData);

    xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4) {
      console.log(xhttp.responseText);
      //TODO Include Node in Graph w/o reloading
          //var response = JSON.parse(xhttp.responseText);
    //console.log(response)
    }
  }



}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    $('#drop-info').show()
}

// Initialisiere Drag&Drop EventListener
var dropZone = document.getElementById('drop-zone');
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', upload);
