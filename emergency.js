/*
 * ================= EMERGENCY SWITCH (FEDCON 0) =================
 *
 *   1 = FEDCON 0, Federation Collapse: every page of the site shows
 *       the ZapadTelecom Emergency Notice instead of InterPhyr.net,
 *       for everyone. The ZapTel_IT admin can still return to the
 *       full site.
 *   0 = normal.
 *
 * A FEDCON 0 preview on the Government page (SETFEDCON0, then press
 * Enter on the blue screen) shows the Emergency Notice in your own
 * browser only, until you press "Return to full site".
 *
 * GitHub Pages caches this file for up to 10 minutes.
 */

window.INTERPHYR_FEDCON0 = 0;

(function(){

if(window.interphyrEmergency)return;

var root=new URL(".",document.currentScript.src).href;

function getCookie(name){
var cookies=document.cookie.split(";");
for(var i=0;i<cookies.length;i++){
var c=cookies[i].trim();
if(c.indexOf(name+"=")===0)return decodeURIComponent(c.substring(name.length+1));
}
return null;
}

function globalOn(){
return String(window.INTERPHYR_FEDCON0)==="1";
}

function isActive(){
if(getCookie("interphyr_fedcon0_bypass")==="1")return false;
return globalOn()||getCookie("interphyr_fedcon0")==="1";
}

/* A preview can always be left; the real emergency only by the IT admin. */
function canReturn(){
return !globalOn()||getCookie("interphyr_admin_session")==="1";
}

var PAGE=
'<div class="ipx-em-bar">ZAPADTELECOM&copy; EMERGENCY BROADCAST SYSTEM</div>'+
'<div class="ipx-em-page">'+
'<h1>Federation Emergency Notice</h1>'+
'<p><b>The Phyrrian Astral Federation has ceased to function. InterPhyr.net is unavailable.</b></p>'+
'<p>This page was stored on your computer by ZapadTelecom&copy; for use in a national emergency. It will be replaced when normal service is restored.</p>'+
'<hr>'+
'<h2>What has happened</h2>'+
'<p>FEDCON 0, Federation Collapse, has been declared. Contact between the member governments of the Federation has been lost, and Federation government can no longer function. Emergency continuity-of-government plans are in force, and each member nation is now acting alone.</p>'+
'<h2>What you must do</h2>'+
'<ol>'+
'<li><b>Stay calm.</b> Stay indoors unless you are instructed otherwise.</li>'+
'<li>If you are ordered to, go to your nearest public shelter. Take drinking water, food for three days, any medicine you need, a battery radio and warm clothing.</li>'+
'<li>Follow instructions from your own national government only. Ignore messages that claim to come from the Federation.</li>'+
'<li>Do not travel between member nations. Borders may be closed without warning.</li>'+
'<li>Keep telephone lines free for the emergency services. Do not try to dial up to the ZapadTelecom&copy; network.</li>'+
'<li>Listen to emergency radio for further information.</li>'+
'</ol>'+
'<h2>Emergency broadcasts</h2>'+
'<table class="ipx-em-table">'+
'<tr><th>Nation</th><th>Station</th><th>Frequency</th></tr>'+
'<tr><td>The Astralyian Republic</td><td>Astralyian Emergency Radio</td><td>101.6 MHz</td></tr>'+
'<tr><td>The Zapadiyan People\'s Republic</td><td>ZapadRadio&copy; Emergency Service</td><td>98.2 MHz</td></tr>'+
'<tr><td>The Kingdom of Rendale</td><td>Royal Rendale Broadcasting</td><td>104.4 MHz</td></tr>'+
'</table>'+
'<h2>Government officials</h2>'+
'<p>Officials of member governments must report to their designated continuity-of-government location and await contact through official channels.</p>'+
'<hr>'+
'<p class="ipx-em-small">ZapadTelecom&copy; Emergency Broadcast System. Do not switch off your computer.</p>'+
'<p class="ipx-em-return" hidden><button type="button">Return to full site</button> <span class="ipx-em-small">(only shown to you)</span></p>'+
'</div>';

var STYLE=
"html.ipx-em-pending body>*{display:none!important}"+
"html body.ipx-emergency{display:block!important;overflow:auto!important;height:auto!important;min-height:100%;margin:0!important;padding:0!important;background:#fff!important;color:#000!important;font-family:'Pixelated MS Sans Serif',Arial,sans-serif!important;font-size:11px!important;-webkit-font-smoothing:none}"+
"body.ipx-emergency .ipx-em-bar{padding:6px 12px;background:#c00000;color:#fff;font-family:'Pixelated MS Sans Serif',Arial,sans-serif;font-weight:bold;letter-spacing:2px;text-align:center}"+
"body.ipx-emergency .ipx-em-page{max-width:680px;margin:0 auto;padding:16px 16px 40px;line-height:1.45}"+
"body.ipx-emergency h1{margin:12px 0;font-size:22px;font-family:'Pixelated MS Sans Serif',Arial,sans-serif}"+
"body.ipx-emergency h2{margin:16px 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #808080;padding-bottom:2px;font-family:'Pixelated MS Sans Serif',Arial,sans-serif}"+
"body.ipx-emergency p,body.ipx-emergency li{font-size:11px}"+
"body.ipx-emergency li{margin:5px 0}"+
"body.ipx-emergency .ipx-em-table{width:100%;border-collapse:collapse;table-layout:auto}"+
"body.ipx-emergency .ipx-em-table th,body.ipx-emergency .ipx-em-table td{border:1px solid #000;padding:4px 6px;text-align:left;vertical-align:top;white-space:normal!important;overflow-wrap:anywhere;font-family:'Pixelated MS Sans Serif',Arial,sans-serif!important;font-size:11px;-webkit-font-smoothing:none}"+
"body.ipx-emergency button{font-family:'Pixelated MS Sans Serif',Arial,sans-serif;font-size:11px;padding:4px 12px}"+
"@media (max-width:480px){body.ipx-emergency .ipx-em-table th,body.ipx-emergency .ipx-em-table td{font-size:11px;padding:3px 4px}}"+
"body.ipx-emergency .ipx-em-small{font-size:11px;color:#404040}";

function addStyle(){
if(document.getElementById("ipx-em-style"))return;
var style=document.createElement("style");
style.id="ipx-em-style";
style.textContent=STYLE;
(document.head||document.documentElement).appendChild(style);
}

function render(){
addStyle();
document.title="Emergency Notice - ZapadTelecom Emergency Broadcast System";
document.body.className="ipx-emergency";
document.body.removeAttribute("style");
document.body.innerHTML=PAGE;
document.documentElement.classList.remove("ipx-em-pending");
document.querySelectorAll("audio,video").forEach(function(m){try{m.pause();}catch(e){}});
if(canReturn()){
var row=document.querySelector(".ipx-em-return");
row.hidden=false;
row.querySelector("button").addEventListener("click",function(){
document.cookie="interphyr_fedcon0=; max-age=0; path=/";
if(globalOn())document.cookie="interphyr_fedcon0_bypass=1; path=/";
location.href=root;
});
}
}

window.interphyrEmergency={
/* Used by the Government page after the FEDCON 0 blue screen. */
show:function(){
document.cookie="interphyr_fedcon0_bypass=; max-age=0; path=/";
document.cookie="interphyr_fedcon0=1; path=/";
render();
},
clear:function(){
document.cookie="interphyr_fedcon0=; max-age=0; path=/";
}
};

if(isActive()){
addStyle();
document.documentElement.classList.add("ipx-em-pending");
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);
else render();
}

})();
