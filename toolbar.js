/*
 * ===================== TOOLBAR =====================
 *
 * Makes the ZapadTelecom© Interweb Surfer toolbar work on every
 * page: Back, Forward, Stop, Home, Search, Favorites, History,
 * Channels, Mail and Print. (Refresh and Fullscreen are handled
 * by each page.)
 *
 * Loaded once per real page load. Clicks are handled at the
 * document level, so it keeps working after the fullscreen
 * page swaps (soft navigation) replace the page's body.
 */

(function(){

if(window.interphyrToolbar)return;
window.interphyrToolbar=true;

var root=new URL(".",document.currentScript.src).href;

/* Pages in the site, used by Search and Favorites. */
var PAGES=[
{path:"",title:"InterPhyr.net"},
{path:"News/",title:"The Zapadiyan Daily"},
{path:"Map/",title:"World Map"},
{path:"Astralyia/",title:"The Astralyian Republic"},
{path:"ZPR/",title:"The Zapadiyan People's Republic"},
{path:"Rendale/",title:"The Kingdom of Rendale"},
{path:"Doctrines/",title:"Doctrines"},
{path:"Relations/",title:"Outside Relations",relations:true},
{path:"Relations/Eisenreich/",title:"The Eisenreich",relations:true},
{path:"Relations/Pancake/",title:"The Royal Kingdom of Pancake",relations:true},
{path:"Relations/Swissland/",title:"Swissland",relations:true},
{path:"Relations/Luminara/",title:"Luminara",relations:true},
{path:"Relations/MerchantsUnion/",title:"Merchants' Union",relations:true},
{path:"Relations/Frostborn/",title:"The Frostborn",relations:true},
{path:"Projects/",title:"Projects"},
{path:"ZapadTelecom/",title:"ZapadTelecom©"},
{path:"About/",title:"About InterPhyr.net"}
];

var FAVORITES=["","News/","Map/","Relations/","Projects/","ZapadTelecom/","About/"];

var ICONS=new URL("images/icons/win98/",root).href;

/* Win98 icon names, or a path starting with "images/" for the site's own. */
function iconUrl(icon){
return icon.indexOf("images/")===0?new URL(icon,root).href:ICONS+icon;
}


/* =========================================================
   HELPERS
   ========================================================= */

function getCookie(name){
var cookies=document.cookie.split(";");
for(var i=0;i<cookies.length;i++){
var c=cookies[i].trim();
if(c.indexOf(name+"=")===0)return decodeURIComponent(c.substring(name.length+1));
}
return null;
}

function escapeHtml(text){
return String(text).replace(/[&<>"']/g,function(ch){
return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch];
});
}

/* Same rule as the Outside Relations pages. */
function isPafMember(name){
var s=name.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g,"").replace(/^the/,"");
return s==="zpr"||/^(astralyia|zapadiya|zapadyia|rendale|kingdomofrendale)/.test(s);
}

function canSeeRelations(){
return getCookie("interphyr_admin_session")==="1"||isPafMember(getCookie("interphyr_registered_nation")||"");
}

/* Nothing works before the visitor has connected, or under maintenance. */
function toolbarReady(){
var b=document.body;
return !!b&&!b.classList.contains("dialup-loading")&&!b.classList.contains("site-maintenance");
}

function go(path){
var url=new URL(path,root).href;
if(window.interphyrGo)window.interphyrGo(url);
else location.href=url;
}

function status(text){
var el=document.getElementById("ie-status-text");
if(el)el.textContent=text;
}


/* =========================================================
   STYLES
   ========================================================= */

var style=document.createElement("style");
style.id="interphyr-toolbar-style";
style.textContent=
".admin-only[hidden]{display:none!important}"+
".ipx-backdrop{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0,0,0,.2)}"+
".ipx-window{width:430px;max-width:100%;max-height:calc(100vh - 24px);display:flex;flex-direction:column;font-size:11px}"+
".ipx-window.ipx-wide{width:640px}"+
".ipx-window>.title-bar .title-bar-text{display:flex;align-items:center;gap:4px}"+
".ipx-window>.title-bar img{width:16px;height:16px}"+
".ipx-window>.window-body{flex:1;min-height:0;overflow:auto;margin:8px}"+
".ipx-buttons{display:flex;justify-content:flex-end;gap:6px;margin-top:10px}"+
".ipx-message{display:flex;align-items:flex-start;gap:12px;padding:4px 2px}"+
".ipx-message img{width:32px;height:32px;flex-shrink:0}"+
".ipx-message p{margin:0 0 6px;line-height:1.4}"+
".ipx-menu{position:fixed;z-index:3000;min-width:190px;max-width:calc(100vw - 8px);padding:2px;background:#c0c0c0;box-shadow:inset -1px -1px #0a0a0a,inset 1px 1px #dfdfdf,inset -2px -2px #808080,inset 2px 2px #fff;font-size:11px}"+
".ipx-menu-item{display:flex;align-items:center;gap:6px;width:100%;min-width:0;min-height:0;padding:3px 16px 3px 4px;border:0;background:none;box-shadow:none!important;color:#000;text-align:left;text-decoration:none;white-space:nowrap;cursor:default}"+
".ipx-menu-item:hover,.ipx-menu-item:focus{background:#000080;color:#fff;outline:none}"+
".ie-menu span{cursor:default}"+
".ie-menu span:hover{box-shadow:inset -1px -1px #808080,inset 1px 1px #fff}"+
".ie-toolbar button:disabled img,.ie-toolbar button:disabled svg{opacity:.4}"+
".ie-toolbar button:disabled{cursor:default}"+
".ipx-props{border-collapse:collapse;margin:8px 0 0}"+
".ipx-props td{padding:2px 12px 2px 0;vertical-align:top}"+
".ipx-props td:first-child{white-space:nowrap}"+
".ipx-fieldset{margin:0 0 8px;padding:6px 10px}"+
".ipx-fieldset p{margin:0 0 6px}"+
".ipx-about{text-align:center}"+
".ipx-about img{height:56px;width:auto;margin:6px auto 10px;display:block}"+
".ipx-about p{margin:0 0 8px;line-height:1.4}"+
".ipx-menu-item img{width:16px;height:16px;flex-shrink:0}"+
".ipx-menu-label{padding:3px 6px;color:#808080}"+
".ipx-menu hr{margin:3px 1px;border:0;border-top:1px solid #808080;border-bottom:1px solid #fff}"+
".ipx-search-row{display:flex;gap:6px;align-items:center}"+
".ipx-search-row input{flex:1;min-width:0}"+
".ipx-results{margin-top:10px;min-height:120px;max-height:50vh;overflow:auto;padding:6px;background:#fff;box-shadow:inset -1px -1px #fff,inset 1px 1px #808080,inset -2px -2px #dfdfdf,inset 2px 2px #0a0a0a}"+
".ipx-result{margin:0 0 10px}"+
".ipx-result a{font-weight:bold}"+
".ipx-result p{margin:2px 0 0;color:#404040;line-height:1.35}"+
".ipx-result mark{background:#ffff80;color:#000}"+
".ipx-mail{display:flex;flex-direction:column;gap:6px}"+
".ipx-mail-list{max-height:150px;overflow:auto;background:#fff;box-shadow:inset -1px -1px #fff,inset 1px 1px #808080,inset -2px -2px #dfdfdf,inset 2px 2px #0a0a0a}"+
".ipx-mail-list table{width:100%;border-collapse:collapse}"+
".ipx-mail-list th{position:sticky;top:0;padding:2px 4px;background:#c0c0c0;box-shadow:inset -1px -1px #808080,inset 1px 1px #fff;font-weight:normal;text-align:left}"+
".ipx-mail-list td{padding:2px 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;cursor:default}"+
".ipx-mail-list tr.unread td{font-weight:bold}"+
".ipx-mail-list tr.selected td{background:#000080;color:#fff}"+
".ipx-mail-view{min-height:170px;max-height:40vh;overflow:auto;padding:8px;background:#fff;box-shadow:inset -1px -1px #fff,inset 1px 1px #808080,inset -2px -2px #dfdfdf,inset 2px 2px #0a0a0a;line-height:1.45}"+
".ipx-mail-head{margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #c0c0c0}"+
".ipx-mail-head div{margin:1px 0}"+
".ipx-mail-view p{margin:0 0 7px}"+
".ipx-withheld{padding:10px;background:#000;color:#fff;font-family:\"Courier New\",Courier,monospace;font-weight:bold;letter-spacing:2px;text-align:center}"+
".ipx-tv{width:100%;border-collapse:collapse;background:#fff}"+
".ipx-tv th,.ipx-tv td{padding:3px 6px;border:1px solid #808080;text-align:left;vertical-align:top}"+
".ipx-tv th{background:#000080;color:#fff}"+
".ipx-tv .ipx-nosignal{color:#c00000;font-weight:bold}"+
"@media (max-width:760px){.ipx-mail-list td{max-width:110px}}";
(document.head||document.documentElement).appendChild(style);


/* =========================================================
   WINDOWS AND MENUS
   ========================================================= */

var openBackdrop=null;
var openMenu=null;

function closeWindow(){
if(openBackdrop){openBackdrop.remove();openBackdrop=null;}
}

function closeMenu(){
if(openMenu){openMenu.remove();openMenu=null;}
}

/* A Win98 dialog. Returns the window body. */
function showWindow(title,icon,html,wide){
closeMenu();
closeWindow();
var backdrop=document.createElement("div");
backdrop.className="ipx-backdrop";
backdrop.innerHTML=
'<div class="window ipx-window'+(wide?" ipx-wide":"")+'" role="dialog" aria-modal="true" aria-label="'+escapeHtml(title)+'">'+
'<div class="title-bar"><div class="title-bar-text">'+(icon?'<img src="'+iconUrl(icon)+'" alt="">':"")+escapeHtml(title)+'</div>'+
'<div class="title-bar-controls"><button aria-label="Close" data-ipx-close></button></div></div>'+
'<div class="window-body">'+html+'</div></div>';
backdrop.addEventListener("click",function(event){
if(event.target===backdrop||event.target.closest("[data-ipx-close]"))closeWindow();
});
document.body.appendChild(backdrop);
openBackdrop=backdrop;
var focus=backdrop.querySelector("[autofocus]")||backdrop.querySelector(".ipx-buttons button");
if(focus)focus.focus();
return backdrop.querySelector(".window-body");
}

function showMessage(title,icon,lines){
showWindow(title,null,
'<div class="ipx-message"><img src="'+iconUrl(icon)+'" alt=""><div>'+
lines.map(function(l){return "<p>"+l+"</p>";}).join("")+
'</div></div><div class="ipx-buttons"><button type="button" data-ipx-close>OK</button></div>');
}

/* Also used by pages (e.g. the Swissland report form). */
window.interphyrMessage=showMessage;

/* A dropdown menu under a toolbar button. items: {label,icon,action} or "-" or {header}. */
function showMenu(button,items){
var wasOpen=openMenu&&openMenu.ipxButton===button;
closeMenu();
if(wasOpen)return;
var menu=document.createElement("div");
menu.className="ipx-menu";
menu.setAttribute("role","menu");
items.forEach(function(item){
if(item==="-"){menu.appendChild(document.createElement("hr"));return;}
if(item.header){
var h=document.createElement("div");
h.className="ipx-menu-label";
h.textContent=item.header;
menu.appendChild(h);
return;
}
var b=document.createElement("button");
b.type="button";
b.className="ipx-menu-item";
b.setAttribute("role","menuitem");
b.innerHTML=(item.icon?'<img src="'+iconUrl(item.icon)+'" alt="">':'<img alt="" style="visibility:hidden">')+"<span>"+escapeHtml(item.label)+"</span>";
b.addEventListener("click",function(){closeMenu();item.action();});
menu.appendChild(b);
});
document.body.appendChild(menu);
var r=button.getBoundingClientRect();
var left=Math.min(r.left,window.innerWidth-menu.offsetWidth-4);
menu.style.left=Math.max(4,left)+"px";
menu.style.top=(r.bottom+1)+"px";
menu.ipxButton=button;
openMenu=menu;
}

document.addEventListener("click",function(event){
if(openMenu&&!openMenu.contains(event.target)&&!(openMenu.ipxButton&&openMenu.ipxButton.contains(event.target)))closeMenu();
},true);

document.addEventListener("keydown",function(event){
if(event.key==="Escape"){closeMenu();closeWindow();}
});

window.addEventListener("resize",closeMenu);


/* =========================================================
   HISTORY (pages visited this session)
   ========================================================= */

var HISTORY_KEY="interphyr_history";

function readHistory(){
try{return JSON.parse(sessionStorage.getItem(HISTORY_KEY))||[];}catch(e){return [];}
}

function pageTitle(title){
var t=String(title||"").split(" - ZapadTelecom")[0].split(" - InterPhyr.net")[0].trim();
return t||"InterPhyr.net";
}

function recordVisit(){
try{
var path=location.pathname;
var list=readHistory().filter(function(v){return v.path!==path;});
list.unshift({path:path,title:pageTitle(document.title)});
sessionStorage.setItem(HISTORY_KEY,JSON.stringify(list.slice(0,12)));
}catch(e){}
}

recordVisit();

/*
 * Links only for the IT administrator (ZapTel_IT), such as
 * Update Logs, are hidden until an admin session is seen.
 */

function revealAdminLinks(){
if(getCookie("interphyr_admin_session")!=="1")return;
document.querySelectorAll(".admin-only[hidden]").forEach(function(el){el.hidden=false;});
}

document.addEventListener("DOMContentLoaded",revealAdminLinks);

/* The fullscreen page swaps change the title, so watch for it. */
var lastPath=location.pathname;
new MutationObserver(function(){
revealAdminLinks();
updateNavButtons();
if(location.pathname!==lastPath){lastPath=location.pathname;recordVisit();}
}).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["class"]});


/* =========================================================
   SEARCH
   ========================================================= */

var pageText={};

function loadPage(page){
if(pageText[page.path])return pageText[page.path];
pageText[page.path]=fetch(new URL(page.path,root).href,{credentials:"same-origin"}).then(function(r){
if(!r.ok)throw new Error("HTTP "+r.status);
return r.text();
}).then(function(html){
var doc=new DOMParser().parseFromString(html,"text/html");
var body=doc.querySelector(".webpage");
if(!body)return "";
body.querySelectorAll("script,style,.site-header,.maintenance-page").forEach(function(el){el.remove();});
return body.textContent.replace(/\s+/g," ").trim();
}).catch(function(){
delete pageText[page.path];
return "";
});
return pageText[page.path];
}

function snippet(text,index,length){
var start=Math.max(0,index-70);
var end=Math.min(text.length,index+length+90);
return (start>0?"...":"")+
escapeHtml(text.slice(start,index))+"<mark>"+escapeHtml(text.slice(index,index+length))+"</mark>"+escapeHtml(text.slice(index+length,end))+
(end<text.length?"...":"");
}

function runSearch(query,results){
query=query.trim();
if(query.length<2){
results.innerHTML="<p>Please type at least two letters.</p>";
return;
}
results.innerHTML="<p>Searching the ZapadTelecom&copy; network...</p>";
status("Searching...");
var pages=PAGES.filter(function(p){return !p.relations||canSeeRelations();});
Promise.all(pages.map(loadPage)).then(function(texts){
var q=query.toLowerCase();
var hits=[];
texts.forEach(function(text,i){
var lower=text.toLowerCase();
var index=lower.indexOf(q);
if(index<0)return;
var count=lower.split(q).length-1;
hits.push({page:pages[i],count:count,html:snippet(text,index,query.length)});
});
hits.sort(function(a,b){return b.count-a.count;});
status("Done");
if(!hits.length){
results.innerHTML="<p>No pages were found matching <b>"+escapeHtml(query)+"</b>.</p><p>Check the spelling, or try a different word.</p>";
return;
}
results.innerHTML="<p>"+hits.length+(hits.length===1?" page":" pages")+" found for <b>"+escapeHtml(query)+"</b>:</p>"+
hits.map(function(h){
return '<div class="ipx-result"><a href="'+escapeHtml(new URL(h.page.path,root).href)+'" data-ipx-go="'+escapeHtml(h.page.path)+'">'+escapeHtml(h.page.title)+"</a>"+
" <span class=\"small\">("+h.count+(h.count===1?" match":" matches")+")</span><p>"+h.html+"</p></div>";
}).join("");
});
}

function openSearch(){
var body=showWindow("Search the InterPhyr Network","search_file-0.png",
'<form class="ipx-search-row"><label for="ipx-search-input">Search for:</label>'+
'<input id="ipx-search-input" type="text" autocomplete="off" spellcheck="false" autofocus><button type="submit">Search</button></form>'+
'<div class="ipx-results" aria-live="polite"><p>Type a word or name, then press Search.</p></div>'+
'<p class="small" style="margin:6px 0 0">Searches are logged by the People\'s Information Ministry for quality purposes.</p>',true);
var form=body.querySelector("form");
var input=body.querySelector("input");
var results=body.querySelector(".ipx-results");
form.addEventListener("submit",function(event){
event.preventDefault();
runSearch(input.value,results);
});
results.addEventListener("click",function(event){
var link=event.target.closest("[data-ipx-go]");
if(!link)return;
event.preventDefault();
event.stopPropagation();
closeWindow();
go(link.getAttribute("data-ipx-go"));
});
input.focus();
}


/* =========================================================
   FAVORITES / HISTORY MENUS
   ========================================================= */

function openFavorites(button){
var items=[{label:"Add to Favorites...",icon:"directory_favorites-0.png",action:function(){
showMessage("Add Favorite","msg_information-0.png",[
"Your Favorites list is managed by the People's Information Ministry.",
"All recommended pages have already been added for you."
]);
}},"-"];
FAVORITES.forEach(function(path){
var page=PAGES.filter(function(p){return p.path===path;})[0];
if(!page||(page.relations&&!canSeeRelations()))return;
items.push({label:page.title,icon:"html-1.png",action:function(){go(path);}});
});
showMenu(button,items);
}

function openHistory(button){
var list=readHistory();
var items=[{header:"Today"}];
list.forEach(function(v){
items.push({label:v.title,icon:"html-1.png",action:function(){go(new URL(v.path,location.href).href);}});
});
if(list.length<1)items.push({header:"(empty)"});
items.push("-");
items.push({label:"Clear History",icon:"recycle_bin_full-4.png",action:function(){
showMessage("History","msg_warning-0.png",[
"Your History has been cleared.",
"A copy has been kept by the People's Information Ministry."
]);
try{sessionStorage.removeItem(HISTORY_KEY);}catch(e){}
recordVisit();
}});
showMenu(button,items);
}


/* =========================================================
   CHANNELS (ZapadTV)
   ========================================================= */

function openChannels(){
var rows=[
["ZTV 1","People's News","The Evening Bulletin","Approved news from across the Federation."],
["ZTV 2","Culture","Tractor Masters '98","The nation's finest harvest machinery, judged live."],
["ZTV 3","Federation","Three Nations, One Signal","Documentary on the founding of the Phyrrian Astral Federation."],
["ZTV 4","Sport","Federation Cup Highlights","All goals from the latest round."],
["RRB","Royal Rendale Broadcasting","Royal Address (repeat)","From the Kingdom of Rendale."],
["ART","Astralyian Republic Television","Council in Session","Live coverage of the High Luminarity Council."],
["SWL","Swisslandian State TV",null,null]
];
showWindow("ZapadTV© Channel Guide","images/toolbar/channels.webp",
'<p style="margin:0 0 8px">Now showing on the ZapadTelecom&copy; network:</p>'+
'<table class="ipx-tv"><tr><th>Channel</th><th>Programme</th></tr>'+
rows.map(function(r){
return "<tr><td><b>"+r[0]+"</b><br>"+escapeHtml(r[1])+"</td><td>"+
(r[2]?"<b>"+escapeHtml(r[2])+"</b><br>"+escapeHtml(r[3]):'<span class="ipx-nosignal">NO SIGNAL</span><br>This channel is not available in your region.')+
"</td></tr>";
}).join("")+"</table>"+
'<div class="ipx-buttons"><button type="button" data-ipx-close>Close</button></div>',true);
}


/* =========================================================
   MAIL (ZapadMail)
   ========================================================= */

var MAIL=[
{from:"InterPhyr Webmaster",address:"interphyr@zapadtelecom.net",subject:"InterPhyr.net Version 1.0 is here!",date:"28.12.1998",body:[
"Dear citizen,",
"We are proud to announce that InterPhyr.net, the official information service of the Phyrrian Astral Federation, is complete. Version 1.0 is now available to all member nations.",
"Read the latest from The Zapadiyan Daily, explore the new World Map, and follow the Federation's Outside Relations - all from the comfort of your ZapadTelecom© connection.",
"Thank you for your patience during construction.",
"- The InterPhyr Webmaster"
]},
{from:"People's Information Ministry",address:"ministry@zapadtelecom.net",subject:"Reminder: Swisslandian claims are false",date:"19.12.1998",body:[
"Citizens are reminded that the recent claims made by the Swisslandian regime regarding the Federation are entirely false.",
"Any citizen who encounters Swisslandian falsehoods is encouraged to report them using the \"Report a Swisslandian Lie\" form on the Swissland page of InterPhyr.net.",
"Your vigilance is appreciated."
]},
{from:"Klipi",address:"klipi@zapadtelecom.net",subject:"It looks like you're reading your mail",date:"02.11.1998",body:[
"Hi! It looks like you're reading your mail.",
"Would you like help with that? No? I'll be right here anyway.",
"- Klipi"
]},
{from:"Unknown Sender",address:"prince@swissland.sw",subject:"URGENT BUSINESS PROPOSAL!!!",date:"17.12.1998",withheld:true},
{from:"ZapadTelecom© Customer Service",address:"service@zapadtelecom.net",subject:"Welcome to the ZapadTelecom© network",date:"14.03.1997",body:[
"Welcome to the ZapadTelecom© network!",
"Thank you for choosing ZapadTelecom©, the leading internet service provider of the Phyrrian Astral Federation.",
"Your connection may be monitored for quality and loyalty purposes.",
"- ZapadTelecom© Customer Service"
]}
];

/* ZapadTelecom addresses lead to the InterPhyr Discord, like the Contact section. */
var DISCORD="https://discord.gg/5362UGaDSM";

function mailAddress(address){
if(/@zapadtelecom\.net$/.test(address))return '<a href="'+DISCORD+'" target="_blank" rel="noopener">'+escapeHtml(address)+"</a>";
return escapeHtml(address);
}

function readMail(){
try{return JSON.parse(localStorage.getItem("interphyr_mail_read"))||{};}catch(e){return {};}
}

function markRead(index){
try{var read=readMail();read[index]=1;localStorage.setItem("interphyr_mail_read",JSON.stringify(read));}catch(e){}
}

function openMail(){
var read=readMail();
var body=showWindow("Inbox - ZapadMail©","envelope_closed-0.png",
'<div class="ipx-mail"><div class="ipx-mail-list"><table><thead><tr><th>From</th><th>Subject</th><th>Received</th></tr></thead><tbody>'+
MAIL.map(function(m,i){
return '<tr data-ipx-mail="'+i+'"'+(read[i]?"":' class="unread"')+'><td>'+escapeHtml(m.from)+"</td><td>"+escapeHtml(m.subject)+"</td><td>"+m.date+"</td></tr>";
}).join("")+
'</tbody></table></div><div class="ipx-mail-view"><p>Select a message to read it.</p></div></div>'+
'<div class="ipx-buttons"><button type="button" data-ipx-close>Close</button></div>',true);
var view=body.querySelector(".ipx-mail-view");
function show(i){
var m=MAIL[i];
body.querySelectorAll("tr[data-ipx-mail]").forEach(function(tr){
tr.classList.toggle("selected",tr.getAttribute("data-ipx-mail")===String(i));
});
var row=body.querySelector('tr[data-ipx-mail="'+i+'"]');
if(row)row.classList.remove("unread");
markRead(i);
view.innerHTML='<div class="ipx-mail-head"><div><b>From:</b> '+escapeHtml(m.from)+" &lt;"+mailAddress(m.address)+"&gt;</div><div><b>Date:</b> "+m.date+"</div><div><b>Subject:</b> "+escapeHtml(m.subject)+"</div></div>"+
(m.withheld?'<div class="ipx-withheld">MESSAGE WITHHELD BY ORDER OF THE PEOPLE\'S INFORMATION MINISTRY</div>':m.body.map(function(p){return "<p>"+escapeHtml(p)+"</p>";}).join(""));
view.scrollTop=0;
}
body.querySelector(".ipx-mail-list").addEventListener("click",function(event){
var tr=event.target.closest("tr[data-ipx-mail]");
if(tr)show(parseInt(tr.getAttribute("data-ipx-mail"),10));
});
show(0);
}


/* =========================================================
   PRINT
   ========================================================= */

/* The same Windows 98 error sound as the dial-up error. */
function playErrorSound(){
try{
var sound=new Audio(new URL("sounds/windows-98-error.mp3",root).href);
var played=sound.play();
if(played&&played.catch)played.catch(function(){});
}catch(e){}
}

function openPrint(){
playErrorSound();
showMessage("ZapadTelecom© Interweb Surfer","msg_error-0.png",[
"<b>There was an error printing to LPT1:.</b>",
"The printer is not responding. It may have been reallocated to the printing of official bulletins.",
"Please contact the People's Ministry of Industry, or try again after the next Five-Year Plan."
]);
}


/* =========================================================
   BACK / FORWARD / STOP / HOME
   ========================================================= */

function canGoBack(){
return (history.state&&history.state.interphyr)||document.referrer.indexOf(root)===0;
}

function goBack(){
if(canGoBack())history.back();
else if(location.href.split("#")[0]!==root)go("");
}

function stopLoading(){
var page=document.querySelector(".webpage");
if(page&&page.classList.contains("webpage-loading")){
page.className="webpage";
}
status("Done");
}

function goHome(){
if(location.href.split("#")[0]===root){
var page=document.querySelector(".ie-page");
if(page)page.scrollTop=0;
}else{
go("");
}
}

function canGoForward(){
if(window.navigation&&typeof window.navigation.canGoForward==="boolean")return window.navigation.canGoForward;
return true;
}

function isLoading(){
var page=document.querySelector(".webpage");
return !!page&&page.classList.contains("webpage-loading")&&toolbarReady();
}

function toolbarButton(label){
var buttons=document.querySelectorAll(".ie-toolbar button");
for(var i=0;i<buttons.length;i++){
var l=buttons[i].querySelector(".ie-toolbar-label");
if(l&&l.textContent.trim()===label)return buttons[i];
}
return null;
}

/*
 * Like Internet Explorer, Back, Forward and Stop are greyed out
 * when there is nothing for them to do.
 */
function updateNavButtons(){
var states={
Back:canGoBack()||location.href.split("#")[0]!==root,
Forward:canGoForward(),
Stop:isLoading()
};
Object.keys(states).forEach(function(label){
var button=toolbarButton(label);
if(!button||button.hasAttribute("onclick"))return;
if(button.disabled!==!states[label])button.disabled=!states[label];
});
}

window.addEventListener("popstate",function(){setTimeout(updateNavButtons,0);});
window.addEventListener("pageshow",updateNavButtons);
document.addEventListener("DOMContentLoaded",updateNavButtons);

function toggleFullscreen(){
var el=document.documentElement;
if(document.fullscreenElement){
document.exitFullscreen().catch(function(){});
}else if(el.requestFullscreen){
el.requestFullscreen().catch(function(){});
}
}


/* =========================================================
   PROPERTIES / INTERNET OPTIONS / ABOUT
   ========================================================= */

function nationName(){
if(getCookie("interphyr_admin_session")==="1")return "ZapadTelecom© IT";
return getCookie("interphyr_registered_nation")||"Unregistered";
}

function openProperties(){
var address=document.getElementById("ie-address-input");
var size=document.documentElement.outerHTML.length;
showWindow("Properties","html-1.png",
'<div class="ipx-message"><img src="'+iconUrl("html-1.png")+'" alt=""><div><p><b>'+escapeHtml(pageTitle(document.title))+'</b></p></div></div>'+
'<table class="ipx-props">'+
'<tr><td>Protocol:</td><td>HyperText Transfer Protocol</td></tr>'+
'<tr><td>Type:</td><td>HTML Document</td></tr>'+
'<tr><td>Address:</td><td>'+escapeHtml(address?address.value:"http://www.interphyr.net/")+'</td></tr>'+
'<tr><td>Size:</td><td>'+size.toLocaleString("en-US")+' bytes</td></tr>'+
'<tr><td>Connection:</td><td>ZapadTelecom&copy; Dial-Up Networking (56k)</td></tr>'+
'<tr><td>Hosted by:</td><td>ZapadTelecom&copy;</td></tr>'+
'</table><div class="ipx-buttons"><button type="button" data-ipx-close>OK</button></div>');
}

function openOptions(){
showWindow("Internet Options","world-0.png",
'<fieldset class="ipx-fieldset"><legend>Home page</legend>'+
'<p>You can change which page to use for your home page.</p>'+
'<div class="ipx-search-row"><label>Address:</label><input type="text" value="http://www.interphyr.net/" readonly></div>'+
'<p class="small">The home page is set by the People\'s Information Ministry and cannot be changed.</p></fieldset>'+
'<fieldset class="ipx-fieldset"><legend>Connection</legend>'+
'<p>ZapadTelecom&copy; Dial-Up Networking (56k)<br>Registered nation: '+escapeHtml(nationName())+'</p></fieldset>'+
'<fieldset class="ipx-fieldset"><legend>Security</legend>'+
'<p>Security level: <b>Ministry Approved (Highest)</b></p></fieldset>'+
'<div class="ipx-buttons"><button type="button" data-ipx-close>OK</button><button type="button" data-ipx-close>Cancel</button></div>');
}

function openAboutBrowser(){
showWindow("About ZapadTelecom© Interweb Surfer©",null,
'<div class="ipx-about"><img src="'+new URL("images/zapadtelecom-logo.png",root).href+'" alt="ZapadTelecom©">'+
'<p><b>ZapadTelecom&copy; Interweb Surfer&copy;</b><br>Version 5.0, InterPhyr Edition</p>'+
'<p>Copyright &copy; 1996&ndash;1998 ZapadTelecom&copy;.<br>Owned and operated by the Zapadiyan People\'s Information Ministry.</p>'+
'<p>This product is licensed to:<br><b>'+escapeHtml(nationName())+'</b></p></div>'+
'<div class="ipx-buttons"><button type="button" data-ipx-close>OK</button></div>');
}


/* =========================================================
   MENU BAR (File, Edit, View, Go, Favorites, Tools, Help)
   ========================================================= */

function selectPage(){
var page=document.querySelector(".webpage");
if(!page)return;
var range=document.createRange();
range.selectNodeContents(page);
var sel=window.getSelection();
sel.removeAllRanges();
sel.addRange(range);
}

function copySelection(){
var text=String(window.getSelection()||"");
if(!text){status("Nothing to copy.");return;}
if(navigator.clipboard&&navigator.clipboard.writeText){
navigator.clipboard.writeText(text).then(function(){status("Copied to the clipboard.");},function(){status("Copy failed.");});
}else{
try{document.execCommand("copy");status("Copied to the clipboard.");}catch(e){status("Copy failed.");}
}
}

function clickRefresh(){
var r=document.getElementById("ie-refresh");
if(r)r.click();
}

function menuItems(name,anchor){
switch(name){
case "File":return [
{label:"Save As...",action:function(){showMessage("Save As","msg_warning-0.png",["Saving pages is not permitted.","All content on InterPhyr.net remains the property of the People's Information Ministry."]);}},
{label:"Print...",action:openPrint},
"-",
{label:"Work Offline",action:function(){showMessage("Work Offline","msg_information-0.png",["Working offline is not available.","Your ZapadTelecom© connection must remain active at all times."]);}},
{label:"Properties",action:openProperties},
"-",
{label:"Close",action:function(){showMessage("ZapadTelecom© Interweb Surfer©","msg_warning-0.png",["The Interweb Surfer cannot be closed while you are connected to the ZapadTelecom© network."]);}}
];
case "Edit":return [
{label:"Select All",action:selectPage},
{label:"Copy",action:copySelection},
"-",
{label:"Find on InterPhyr.net...",icon:"search_file-0.png",action:openSearch}
];
case "View":return [
{label:"Stop",action:stopLoading},
{label:"Refresh",action:clickRefresh},
"-",
{label:"Full Screen",action:toggleFullscreen},
{label:"Source",action:function(){showMessage("Source","msg_warning-0.png",["Viewing the source of this page is restricted by the People's Information Ministry."]);}}
];
case "Go":return [
{label:"Back",action:goBack},
{label:"Forward",action:function(){history.forward();}},
{label:"Home Page",icon:"html-1.png",action:goHome},
"-",
{label:"Search the Network",icon:"search_file-0.png",action:openSearch},
{label:"Mail",icon:"envelope_closed-0.png",action:openMail},
{label:"The Zapadiyan Daily",icon:"html-1.png",action:function(){go("News/");}},
{label:"World Map",icon:"html-1.png",action:function(){go("Map/");}}
];
case "Favorites":return null;
case "Tools":return [
{label:"Mail and News",icon:"envelope_closed-0.png",action:openMail},
{label:"ZapadTelecom© Update",action:function(){showMessage("ZapadTelecom© Update","msg_information-0.png",["Your ZapadTelecom© Interweb Surfer© is up to date.","Updates are installed automatically by the People's Information Ministry."]);}},
"-",
{label:"Internet Options...",icon:"world-0.png",action:openOptions}
];
case "Help":return [
{label:"Contents and Index",icon:"html-1.png",action:function(){go("About/");}},
{label:"Online Support",icon:"html-1.png",action:function(){go("#contact");}},
{label:"Ask Klipi",action:function(){var k=document.getElementById("klippy");if(k&&k.offsetParent)k.click();else showMessage("Klipi","msg_information-0.png",["Klipi is not available on this screen."]);}},
"-",
{label:"About ZapadTelecom© Interweb Surfer©",action:openAboutBrowser}
];
}
return [];
}

document.addEventListener("click",function(event){
var item=event.target.closest?event.target.closest(".ie-menu span"):null;
if(!item)return;
if(!toolbarReady())return;
var name=item.textContent.trim();
if(name==="Favorites"){openFavorites(item);return;}
var items=menuItems(name,item);
if(items&&items.length)showMenu(item,items);
});


/* =========================================================
   CLICK HANDLING
   ========================================================= */

document.addEventListener("click",function(event){
var button=event.target.closest?event.target.closest(".ie-toolbar button"):null;
if(!button)return;
var labelEl=button.querySelector(".ie-toolbar-label");
var label=labelEl?labelEl.textContent.trim():"";
/* Buttons the page already handles itself. */
if(label==="Refresh"||label==="Fullscreen"||button.hasAttribute("onclick"))return;
if(!toolbarReady())return;
switch(label){
case "Back":goBack();break;
case "Forward":history.forward();break;
case "Stop":stopLoading();break;
case "Home":goHome();break;
case "Search":openSearch();break;
case "Favorites":openFavorites(button);break;
case "History":openHistory(button);break;
case "Channels":openChannels();break;
case "Mail":openMail();break;
case "Print":openPrint();break;
}
setTimeout(updateNavButtons,0);
});

})();
