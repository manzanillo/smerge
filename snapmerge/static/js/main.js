import cytoscape from 'cytoscape';
import jquery from 'jquery';
import cyqtip from 'cytoscape-qtip';
import timeago from 'timeago.js';
import { format, render, cancel, register } from 'timeago.js';
import dagre from 'cytoscape-dagre';
import cxtmenu from 'cytoscape-cxtmenu';


//import M from 'materialize-css'

cytoscape.use( dagre );
cytoscape.use( cxtmenu );
cyqtip( cytoscape, jquery ); // register extension


//console.log(M)

window.cytoscape = cytoscape
window.timeago = timeago
window.jQuery = window.$ = jquery
window.format = format
//window.Materialize = M


