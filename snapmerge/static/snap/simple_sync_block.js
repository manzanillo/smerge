var ide = window.world.root().children[0];

async function loadFile(url) {
  var res = await fetch(url);
  var xml = await res.text();
  var ide = window.world.root().children[0];
  ide.loadProjectXML(xml);
  ide.showMessage("Synced...");
}

new DialogBoxMorph(
  this,
  function (message) {
    var url = "{{url}}";
    if (window.newUrl) {
      var url = window.newUrl;
    }
    url += "&message=" + message;
    var data = ide.getProjectXML();

    if (new Blob([data]).size > 32 * 1024 * 1024) {
      ide.showMessage("File size exceeds 32MB. Aborting upload. Please reduce the size of the project.");
    } else {
    var r = new XMLHttpRequest();
    r.open("POST", url, true);
    r.setRequestHeader("Content-Type", "application/xml");
    r.onreadystatechange = function () {
      if (r.readyState === 4 && r.status === 200) {
        ide.showMessage("exported...");
        new_url = JSON.parse(r.response)["url"];
        ide.showMessage("Start block sync...");
        loadFile(new_url);
      }
    };
    r.send(data);
  }
  },
  this
).prompt("commit message", "", window.world, null);