var ide = window.world.root().children[0];

new DialogBoxMorph(
 this,
 function(message){
   var url = "{{url}}";
   if (window.newUrl){
      var url = window.newUrl;
   }
   console.log(url);
   url += "&message="+message;
   var data = ide.serializer.serialize(ide.stage);
   var r =  new XMLHttpRequest();
   r.open("POST", url, true);
   r.setRequestHeader("Content-Type", "application/xml");
		 r.onreadystatechange = function () {
  	  if(r.readyState === 4 && r.status === 200) {
				   ide.showMessage("exported");
    			window.newUrl = JSON.parse(r.response)["url"];
      }
   }
   r.send(data);
   },
   this
   ).prompt(
      "commit message",
      "",
      window.world,
      null
    );