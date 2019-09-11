;function getCookie(name){var cookieValue=null;if(document.cookie&&document.cookie!==''){var cookies=document.cookie.split(';');for(var i=0;i<cookies.length;i++){var cookie=jQuery.trim(cookies[i]);if(cookie.substring(0,name.length+1)===(name+'=')){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break;}}}
return cookieValue;};var csrftoken=getCookie('csrftoken');function upload(evt){evt.stopPropagation();evt.preventDefault();$('#drop-info').hide()
var files=evt.dataTransfer.files;var uploadFile=files[0];var formData=new FormData();formData.append("file",files[0]);var xhttp=new XMLHttpRequest();xhttp.open("POST","/add/"+$("h1.project-heading").attr("data-proj-id"),true);xhttp.setRequestHeader("X-CSRFToken",csrftoken);xhttp.send(formData);xhttp.onreadystatechange=function(){if(xhttp.readyState===4&&xhttp.status===200){new_node=JSON.parse(xhttp.responseText);var eleNeu=window.cy.add({group:"nodes",data:{id:new_node.id,href:new_node.file_url,description:new_node.description,timestamp:new_node.timestamp,number_scripts:new_node.number_scripts,number_sprites:new_node.number_sprites,ancestors:new_node.ancestors,color:new_node.color},});window.cy.layout({name:'dagre'}).run()}}}
function handleDragOver(evt){evt.stopPropagation();evt.preventDefault();$('#drop-info').show();}
var dropZone=document.getElementById('drop-info');document.body.addEventListener('dragover',handleDragOver);document.body.addEventListener('drop',function(evt){evt.stopPropagation();evt.preventDefault();$('#drop-info').hide();});dropZone.addEventListener('drop',upload);;let defaults={menuRadius:100,selector:'node',commands:[{fillColor:'rgba(200, 200, 200, 0.75)',content:'<i class="material-icons">file_download</i>',contentStyle:{},select:function(ele){var element=document.createElement('a');element.setAttribute('href',ele.data('href'));element.setAttribute('download',ele.data('description'));element.style.display='none';document.body.appendChild(element);element.click();document.body.removeChild(element);},enabled:true},{fillColor:'rgba(200, 200, 200, 0.75)',content:'<i class="material-icons">edit</i>',contentStyle:{},select:function(ele){console.log(ele.id())},enabled:false},{fillColor:'rgba(200, 200, 200, 0.75)',content:'<i class="material-icons">favorite</i>',select:function(ele){var toggle_color_url='toggle_color/'+$("h1.project-heading").attr("data-proj-id")+'/'+ele.id();$.ajax({url:toggle_color_url,cache:false,method:'get',success:function(new_color){ele.data('color',new_color)},error:function(){console.log('fav did not work');}});},enabled:true}],fillColor:'rgba(0, 0, 0, 0.75)',activeFillColor:'#26a69a',activePadding:20,indicatorSize:24,separatorWidth:5,spotlightPadding:4,minSpotlightRadius:24,maxSpotlightRadius:38,openMenuEvents:'cxttapstart',itemColor:'white',itemTextShadowColor:'transparent',zIndex:9999,atMouse:false};document.addEventListener('DOMContentLoaded',function(){window.cy.cxtmenu(defaults);},false);;var projectRoom=document.querySelector(".project-heading").getAttribute("data-proj-id");var socket=new WebSocket('ws://'+window.location.host+'/ws/'+projectRoom+'/');socket.onmessage=function(e){var data=JSON.parse(e.data);var event=data['event']
var new_node=data['node'];window.cy.add({group:"nodes",data:{id:new_node.id,href:new_node.file_url,description:new_node.description,timestamp:new_node.timestamp,number_scripts:new_node.number_scripts,number_sprites:new_node.number_sprites,ancestors:new_node.ancestors,color:new_node.color,}});if(new_node.ancestors){new_node.ancestors.forEach(function(ancestorId){cy.add({group:"edges",data:{source:ancestorId,target:new_node.id}});});window.cy.layout({name:'dagre'}).run()}};socket.onclose=function(e){console.error('Chat socket closed unexpectedly');};socket.onopen=function(e){console.log('websocket connection established')}
var findOptimalPosition=function(elements){var xPositions=[];var yPositions=[];elements.each(function(ele){xPositions.push(ele.position('x'));yPositions.push(ele.position('y'));});return[Math.min(...xPositions)+(Math.max(...xPositions)-Math.min(...xPositions))/2,Math.max(...yPositions)+75];}