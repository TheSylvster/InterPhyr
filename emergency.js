/*
 * ==================== EMERGENCY SWITCH ====================
 *
 * The public FEDCON level, for everyone on every page:
 *
 *   0 = FEDCON 0, Federation Collapse: every page of the site shows
 *       the ZapadTelecom Emergency Notice instead of InterPhyr.net.
 *       The ZapTel_IT admin can still return to the full site.
 *   1 = FEDCON 1, Nuclear Alert: once they have registered and
 *       connected, every visitor gets the full-screen
 *       Nuclear Alert with the EAS sound. Once they press Acknowledge
 *       it stays away until they close the browser.
 *   5 = normal (2, 3 and 4 are also normal on the public site).
 *
 * This is separate from the Government page's FEDCON, which comes
 * from the encrypted documents. Set both when the level changes.
 *
 * A FEDCON 0 preview on the Government page (SETFEDCON0, then press
 * Enter on the blue screen) shows the Emergency Notice in your own
 * browser only, until you press "Return to full site".
 *
 * GitHub Pages caches this file for up to 10 minutes.
 */

window.INTERPHYR_FEDCON = 4;

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
return String(window.INTERPHYR_FEDCON)==="0";
}

function nuclearOn(){
return String(window.INTERPHYR_FEDCON)==="1";
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
'<div class="ipx-em-tv">'+
'<div class="ipx-em-tv-head">ZAPADTV&copy; EMERGENCY BROADCAST &mdash; NATIONAL ANTHEM</div>'+
'<video class="ipx-em-video" src="'+root+'videos/zpr-anthem.mp4" playsinline loop controls></video>'+
'<button type="button" class="ipx-em-sound" hidden>Click for sound</button>'+
'</div>'+
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
"body.ipx-emergency .ipx-em-tv{margin:14px 0;border:2px solid #000;background:#000;text-align:center}"+
"body.ipx-emergency .ipx-em-tv-head{padding:3px 6px;background:#000;color:#ffd800;font-weight:bold;letter-spacing:2px;text-align:left}"+
"body.ipx-emergency .ipx-em-video{display:block;width:100%;height:auto;background:#000}"+
"body.ipx-emergency .ipx-em-sound{margin:6px auto;display:inline-block}"+
"body.ipx-emergency .ipx-em-sound[hidden]{display:none}"+
"body.ipx-emergency .ipx-em-small{font-size:11px;color:#404040}";

function addStyle(){
if(document.getElementById("ipx-em-style"))return;
var style=document.createElement("style");
style.id="ipx-em-style";
style.textContent=STYLE;
(document.head||document.documentElement).appendChild(style);
}

/*
 * The anthem plays with sound when the visitor has just pressed a key
 * or clicked (e.g. Enter on the FEDCON 0 blue screen). Otherwise the
 * browser only allows it muted, with a "Click for sound" button.
 */
function playAnthem(){
var video=document.querySelector(".ipx-em-video");
var sound=document.querySelector(".ipx-em-sound");
if(!video)return;
function muted(){
video.muted=true;
var p=video.play();
if(p&&p.catch)p.catch(function(){});
sound.hidden=false;
}
try{
var p=video.play();
if(p&&p.catch)p.catch(muted);
}catch(e){muted();}
sound.addEventListener("click",function(){
video.muted=false;
var p=video.play();
if(p&&p.catch)p.catch(function(){});
sound.hidden=true;
});
}

function render(){
addStyle();
document.title="Emergency Notice - ZapadTelecom Emergency Broadcast System";
document.querySelectorAll("audio,video").forEach(function(m){try{m.pause();}catch(e){}});
document.body.className="ipx-emergency";
document.body.removeAttribute("style");
document.body.innerHTML=PAGE;
document.documentElement.classList.remove("ipx-em-pending");
playAnthem();
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

/*
 * FEDCON 1: the full-screen Nuclear Alert. Shown on every page when
 * INTERPHYR_FEDCON is 1, and by the Government page for FEDCON 1.
 */

var NUKE_PAGE=
'<div class="ipx-nuke">'+
'<div class="ipx-nuke-bar">ZAPADTELECOM&copy; EMERGENCY BROADCAST SYSTEM</div>'+
'<div class="ipx-nuke-head">'+
'<div class="ipx-nuke-symbol" aria-hidden="true">☢︎</div>'+
'<div class="ipx-nuke-title">NUCLEAR ALERT</div>'+
'<div class="ipx-nuke-level">FEDCON 1 &mdash; MAXIMUM READINESS</div>'+
'<p class="ipx-nuke-drill">THIS IS NOT A DRILL</p>'+
'</div>'+
'<h3>What is happening</h3>'+
'<p>The Phyrrian Astral Federation has been placed at FEDCON 1. A strategic attack on the Federation may be imminent. Member governments have relocated to protected shelters, and Federation strategic forces are ready for immediate use.</p>'+
'<h3>What you must do now</h3>'+
'<ol>'+
'<li><b>Go to the nearest fallout shelter or basement immediately.</b></li>'+
'<li>If you are caught outside, do not look at the flash. Lie face down and cover your head.</li>'+
'<li>Stay away from windows.</li>'+
'<li>Take drinking water, a battery radio and spare batteries.</li>'+
'<li>Do not use telephone lines. Keep them free for the Government.</li>'+
'<li>Stay in the shelter until the all-clear is broadcast.</li>'+
'</ol>'+
'<h3>Emergency broadcasts</h3>'+
'<table class="ipx-nuke-table">'+
'<tr><th>Nation</th><th>Station</th><th>Frequency</th></tr>'+
'<tr><td>The Astralyian Republic</td><td>Astralyian Emergency Radio</td><td>101.6 MHz</td></tr>'+
'<tr><td>The Zapadiyan People\'s Republic</td><td>ZapadRadio&copy; Emergency Service</td><td>98.2 MHz</td></tr>'+
'<tr><td>The Kingdom of Rendale</td><td>Royal Rendale Broadcasting</td><td>104.4 MHz</td></tr>'+
'</table>'+
'<div class="ipx-nuke-buttons"><button type="button" class="ipx-nuke-details" hidden>Details...</button><button type="button" class="ipx-nuke-close">Acknowledge</button></div>'+
'</div>';

var NUKE_STYLE=
".ipx-nuke-alert{position:fixed;inset:0;z-index:100002;display:flex;align-items:flex-start;justify-content:center;padding:12px;overflow-y:auto;background:#000;color:#fff;font-family:'Pixelated MS Sans Serif',Arial,sans-serif;font-size:11px;text-align:left;-webkit-font-smoothing:none;animation:ipx-nuke-border 1s steps(1) infinite}"+
".ipx-nuke{width:620px;max-width:100%;margin:auto;padding:6px 4px 0}"+
".ipx-nuke-bar{margin-bottom:10px;padding:5px 10px;background:#c00000;color:#fff;font-size:11px;font-weight:bold;letter-spacing:2px;text-align:center}"+
".ipx-nuke-head{text-align:center}"+
".ipx-nuke-symbol{font-size:96px;line-height:1;color:#ffd800;animation:ipx-nuke-blink 1s steps(1) infinite}"+
".ipx-nuke-title{margin:4px 0;font-size:36px;font-weight:bold;letter-spacing:8px;color:#ff2020}"+
".ipx-nuke-level{margin-bottom:10px;font-size:13px;font-weight:bold;letter-spacing:3px}"+
".ipx-nuke p,.ipx-nuke li{margin:0 0 7px;font-size:11px;line-height:1.5;color:#fff}"+
".ipx-nuke .ipx-nuke-drill{margin-bottom:12px;color:#ffd800;font-size:16px;font-weight:bold;letter-spacing:4px}"+
".ipx-nuke h3{margin:14px 0 6px;padding:0 0 2px;border:0;border-bottom:1px solid #808080;background:none;color:#ffd800;font-family:inherit;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase}"+
".ipx-nuke ol{margin:0;padding-left:22px}"+
".ipx-nuke-table{width:100%;border-collapse:collapse}"+
".ipx-nuke-table th,.ipx-nuke-table td{padding:3px 6px;border:1px solid #808080;background:#000!important;color:#fff;font-family:inherit;font-size:11px;text-align:left;vertical-align:top;white-space:normal;overflow-wrap:anywhere}"+
".ipx-nuke-table th{color:#ffd800}"+
".ipx-nuke-buttons{position:sticky;bottom:0;display:flex;justify-content:center;gap:8px;margin-top:14px;padding:10px 0 12px;background:#000}"+
".ipx-nuke-buttons button{color:#000;font-family:inherit;font-size:11px}"+
".ipx-nuke-buttons button[hidden]{display:none}"+
"@keyframes ipx-nuke-blink{50%{opacity:.45}}"+
"@keyframes ipx-nuke-border{0%{box-shadow:inset 0 0 0 10px #e00000}50%{box-shadow:inset 0 0 0 10px #000}}"+
"@media (max-width:760px){.ipx-nuke-symbol{font-size:64px}.ipx-nuke-title{font-size:26px;letter-spacing:4px}.ipx-nuke-bar{letter-spacing:1px}}"+
"@media (prefers-reduced-motion:reduce){.ipx-nuke-alert,.ipx-nuke-symbol{animation:none}}";

function addNukeStyle(){
if(document.getElementById("ipx-nuke-style"))return;
var style=document.createElement("style");
style.id="ipx-nuke-style";
style.textContent=NUKE_STYLE;
(document.head||document.documentElement).appendChild(style);
}

/*
 * A classic Emergency Alert System sound, made in the browser (no
 * recording): three data bursts, then the two-tone 853 + 960 Hz
 * attention signal. Browsers only allow sound after a click or key
 * press, so on a freshly opened page it starts on the first one.
 */

var sirenStop=null;

function stopSiren(){
if(sirenStop){sirenStop();sirenStop=null;}
}

function playSiren(){
stopSiren();
var Ctx=window.AudioContext||window.webkitAudioContext;
if(!Ctx)return;
var ctx;
try{ctx=new Ctx();}catch(e){return;}
var out=ctx.createGain();
out.gain.value=0.12;
out.connect(ctx.destination);
var start=ctx.currentTime+0.1;
var BIT=1/520.83;
/* Three data bursts (FSK: 2083.3 Hz and 1562.5 Hz) with a pause between each. */
for(var burst=0;burst<3;burst++){
var t0=start+burst*1.9;
var osc=ctx.createOscillator();
osc.type="square";
var g=ctx.createGain();
g.gain.value=0.5;
osc.connect(g).connect(out);
for(var i=0;i<450;i++){
osc.frequency.setValueAtTime(Math.random()<0.5?2083.3:1562.5,t0+i*BIT);
}
osc.start(t0);
osc.stop(t0+450*BIT);
}
/* The attention signal: 853 Hz and 960 Hz together for eight seconds. */
var toneStart=start+3*1.9+0.6;
[853,960].forEach(function(f){
var tone=ctx.createOscillator();
tone.type="sine";
tone.frequency.value=f;
var tg=ctx.createGain();
tg.gain.value=0.5;
tone.connect(tg).connect(out);
tone.start(toneStart);
tone.stop(toneStart+8);
});
/* The context's clock only runs once sound is allowed, so the end timer starts then too. */
var timer=null;
function armTimer(){
if(timer||ctx.state!=="running")return;
timer=setTimeout(stopSiren,(toneStart-ctx.currentTime+8.5)*1000);
}
function unlock(event){
if(event&&event.target&&event.target.closest&&event.target.closest(".ipx-nuke-buttons"))return;
if(ctx.resume)ctx.resume().then(armTimer).catch(function(){});
}
ctx.onstatechange=armTimer;
document.addEventListener("pointerdown",unlock,true);
document.addEventListener("keydown",unlock,true);
unlock();
sirenStop=function(){
clearTimeout(timer);
document.removeEventListener("pointerdown",unlock,true);
document.removeEventListener("keydown",unlock,true);
try{ctx.close();}catch(e){}
};
}

function closeNuclear(){
stopSiren();
var open=document.querySelector(".ipx-nuke-alert");
if(open)open.remove();
document.removeEventListener("keydown",nuclearKeydown);
}

function nuclearKeydown(event){
if(event.key==="Escape"&&document.querySelector(".ipx-nuke-alert")){
event.preventDefault();
var close=document.querySelector(".ipx-nuke-close");
if(close)close.click();
}
}

/*
 * options.details: a function for the Details... button (the
 * Government page uses it); without it, only Acknowledge shows.
 * options.onClose: called after Acknowledge.
 */
function showNuclear(options){
options=options||{};
closeNuclear();
addNukeStyle();
var alert=document.createElement("div");
alert.className="fedcon-alert ipx-nuke-alert";
alert.setAttribute("role","alertdialog");
alert.setAttribute("aria-modal","true");
alert.setAttribute("aria-label","Nuclear Alert");
alert.innerHTML=NUKE_PAGE;
var details=alert.querySelector(".ipx-nuke-details");
if(options.details){
details.hidden=false;
details.addEventListener("click",function(){closeNuclear();options.details();});
}
alert.querySelector(".ipx-nuke-close").addEventListener("click",function(){
closeNuclear();
if(options.onClose)options.onClose();
});
/* On the page root, so page swaps and the maintenance screen don't remove it. */
document.documentElement.appendChild(alert);
document.addEventListener("keydown",nuclearKeydown);
alert.querySelector(".ipx-nuke-close").focus();
playSiren();
return alert;
}

/*
 * Only once the visitor has registered and connected (dial-up or the
 * admin bypass). Pages without a dial-up (InterPhyr Modern) set
 * window.INTERPHYR_NO_DIALUP and show it straight away.
 */
function showPublicNuclear(){
if(!nuclearOn())return;
if(getCookie("interphyr_connected")!=="1"&&!window.INTERPHYR_NO_DIALUP)return;
if(getCookie("interphyr_fedcon1_ack")==="1"||document.querySelector(".ipx-nuke-alert"))return;
showNuclear({onClose:function(){
/* A session cookie: the alert comes back after the browser is closed. */
document.cookie="interphyr_fedcon1_ack=1; path=/";
}});
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
},
nuclear:showNuclear,
closeNuclear:closeNuclear,
/* Called by the main page when the connection is made. */
connected:showPublicNuclear,
/* The main page asks these during dial-up: under FEDCON 0 the connection fails, then the notice shows. */
active:isActive,
showNotice:render
};

/* The main page (registration and dial-up) shows the notice itself, when the connection fails. */
var dialupPage=/^(index\.html)?$/.test(location.pathname.slice(new URL(root).pathname.length));

if(isActive()&&!dialupPage){
addStyle();
document.documentElement.classList.add("ipx-em-pending");
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);
else render();
}else if(nuclearOn()){
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",showPublicNuclear);
else showPublicNuclear();
}

})();
