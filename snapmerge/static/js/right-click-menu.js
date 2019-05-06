// the default values of each option are outlined below:
let defaults = {
    menuRadius: 100, // the radius of the circular menu in pixels
    selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
    commands: [ // an array of commands to list in the menu or a function that returns the array

        { // download xml
            fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
            content: '<i class="material-icons">file_download</i>', // html/text content to be displayed in the menu
            contentStyle: {}, // css key:value pairs to set the command's css in js if you want
            select: function (ele) { // a function to execute when the command is selected
                  var element = document.createElement('a');
                  element.setAttribute('href', ele.data('href'));
                  element.setAttribute('download', ele.data('description'));

                  element.style.display = 'none';
                  document.body.appendChild(element);

                  element.click();

                  document.body.removeChild(element);
            },
            enabled: true // whether the command is selectable
        },
        { // edit commit message
            fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
            content: '<i class="material-icons">edit</i>', // html/text content to be displayed in the menu
            contentStyle: {}, // css key:value pairs to set the command's css in js if you want
            select: function (ele) { // a function to execute when the command is selected
                console.log(ele.id()) // `ele` holds the reference to the active element
            },
            enabled: false // whether the command is selectable
        },
        { // fav
            fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
            content: '<i class="material-icons">favorite</i>',

            select: function (ele) { // a function to execute when the command is selected
                //toggle color depending on state

                var toggle_color_url = 'toggle_color/' + $("h1.project-heading").attr("data-proj-id") + '/' + ele.id();

                $.ajax({
                    url: toggle_color_url,
                    cache: false,
                    method: 'get',
                    success: function (new_color) {
                        ele.data('color', new_color)
                        },
                    error: function () {
                        console.log('fav did not work');
                    }
                });

            },
            enabled: true // whether the command is selectable

        }
    ], // function( ele ){ return [ /*...*/ ] }, // a function that returns commands or a promise of commands
    fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
    activeFillColor: '#26a69a', // the colour used to indicate the selected command
    activePadding: 20, // additional size in pixels for the active command
    indicatorSize: 24, // the size in pixels of the pointer to the active command
    separatorWidth: 5, // the empty spacing in pixels between successive commands
    spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
    minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
    maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
    openMenuEvents: 'cxttapstart', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
    itemColor: 'white', // the colour of text in the command's content
    itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
    zIndex: 9999, // the z-index of the ui div
    atMouse: false // draw menu at mouse position
};


document.addEventListener('DOMContentLoaded', function () {
    window.cy.cxtmenu(defaults);
}, false);

//cloud_download file_download edit star favorite