/*
 * ==================== INTERPHYR MODERN ====================
 *
 * A modern "liquid glass" version of InterPhyr.net at /Modern/.
 * It is open to anyone, but nothing on the classic site links here.
 *
 * The content is read from the classic pages each time, so a change
 * to the classic site (a news story, a nation, the contact list)
 * shows up here too. Only the look is different.
 *
 * Each page sets <body data-page="..."> and loads this file.
 * The maintenance switch, the Government lockout and the FEDCON 0/1
 * emergency switch (emergency.js) apply here as well.
 */

(function(){

var modernRoot=new URL(".",document.currentScript.src).href;
var siteRoot=new URL("../",modernRoot).href;

/* Classic pages that have a Modern version so far (paths from the site root). */
var MODERN_PAGES=["","News/"];

var NAV=[
{label:"Home",path:""},
{label:"News",path:"News/"},
{label:"Nations"},
{label:"Relations"},
{label:"World Map"},
{label:"Government"}
];

function getCookie(name){
var cookies=document.cookie.split(";");
for(var i=0;i<cookies.length;i++){
var c=cookies[i].trim();
if(c.indexOf(name+"=")===0)return decodeURIComponent(c.substring(name.length+1));
}
return null;
}

function el(tag,className,html){
var node=document.createElement(tag);
if(className)node.className=className;
if(html!=null)node.innerHTML=html;
return node;
}

function text(node){
return node?node.textContent.replace(/\s+/g," ").trim():"";
}

/* The FEDCON 0 Emergency Notice replaces the whole page; stop drawing if it has. */
function takenOver(){
return !document.body.classList.contains("modern");
}

function fetchClassic(path){
var url=new URL(path,siteRoot).href;
return fetch(url,{cache:"no-cache"}).then(function(response){
if(!response.ok)throw new Error("HTTP "+response.status);
return response.text();
}).then(function(html){
return {doc:new DOMParser().parseFromString(html,"text/html"),url:url};
});
}

/*
 * Copies a piece of a classic page into this one. Images are pointed
 * at the classic site; links go to the Modern version of a page when
 * there is one, and pages that don't have one yet become plain text.
 */
function adopt(node,base){
var copy=document.importNode(node,true);
copy.querySelectorAll("script,style").forEach(function(s){s.remove();});
copy.querySelectorAll("img[src]").forEach(function(img){
img.src=new URL(img.getAttribute("src"),base).href;
img.classList.remove("win98-16bit");
img.loading="lazy";
});
copy.querySelectorAll("a[href]").forEach(function(a){
var href=a.getAttribute("href");
if(href.charAt(0)==="#")return;
var url=new URL(href,base);
if(url.href.indexOf(siteRoot)!==0){
a.target="_blank";
a.rel="noopener";
return;
}
var path=url.pathname.slice(new URL(siteRoot).pathname.length).replace(/index\.html$/,"");
if(MODERN_PAGES.indexOf(path)>=0){
a.href=new URL(path,modernRoot).href+url.hash;
return;
}
var soon=el("span","soon-link",a.innerHTML);
soon.tabIndex=0;
a.replaceWith(soon);
});
return copy;
}

function sectionByTitle(doc,title){
var headings=doc.querySelectorAll("section h2");
for(var i=0;i<headings.length;i++){
if(text(headings[i])===title)return headings[i].closest("section");
}
return null;
}

/* ---------- Page frame ---------- */

function backdrop(){
var b=el("div","m-backdrop","<span></span><span></span><span></span><span></span>");
b.setAttribute("aria-hidden","true");
return b;
}

function topbar(page){
var bar=el("header","m-topbar glass");
bar.innerHTML='<a class="m-brand" href="'+modernRoot+'"><span class="m-brand-mark" aria-hidden="true"></span><span>InterPhyr</span></a>';
var nav=el("nav","m-nav");
nav.setAttribute("aria-label","Main");
var items=el("span","m-nav-items");
nav.appendChild(items);
NAV.forEach(function(item){
if(item.path==null){
var soon=el("span","m-nav-soon",item.label);
soon.title="Coming soon";
items.appendChild(soon);
return;
}
var link=el("a",null,item.label);
link.href=new URL(item.path,modernRoot).href;
link.setAttribute("data-path",item.path);
if(item.path===page)link.className="active";
items.appendChild(link);
});
bar.appendChild(nav);
addPill(nav);
return bar;
}

/*
 * ---------- The sliding glass lens in the menu ----------
 *
 * One glass "lens" marks the current page and slides to the next one,
 * stretching a little on the way like liquid. Inside it is a copy of
 * the menu text, kept lined up with the real text and bent by an SVG
 * refraction filter: barely at rest, strongly while it travels.
 */

var pill=null;
var pillX=0,pillW=0;
var pillAnim=0;
/* How far the rim bends things, in pixels: a little at rest, more while moving. */
var LENS_REST=5,LENS_MOVING=26;
/* The refracted copy reaches this far past the edge of the lens. */
var LENS_BLEED=14;

function lensFilter(){
if(document.getElementById("m-lens"))return;
/*
 * A refraction map: no bending in the middle, more and more towards
 * the rim, where the glass bends in what is just outside it.
 */
var canvas=document.createElement("canvas");
canvas.width=128;canvas.height=48;
var c=canvas.getContext("2d");
var img=c.createImageData(128,48);
for(var j=0;j<48;j++){
for(var i=0;i<128;i++){
var u=i/127*2-1,v=j/47*2-1;
var k=(j*128+i)*4;
img.data[k]=128+Math.sign(u)*Math.pow(Math.abs(u),3)*127;
img.data[k+1]=128+Math.sign(v)*Math.pow(Math.abs(v),3)*127;
img.data[k+2]=128;
img.data[k+3]=255;
}
}
c.putImageData(img,0,0);
var holder=document.createElement("div");
holder.innerHTML=
'<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">'+
/* Sized in pixels to the lens on every frame (see drawPill): relative sizes place the map wrongly in Chrome. */
'<filter id="m-lens" x="0" y="0" width="100" height="40" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">'+
'<feImage href="'+canvas.toDataURL()+'" x="0" y="0" width="100" height="40" preserveAspectRatio="none" result="map"/>'+
'<feDisplacementMap in="SourceGraphic" in2="map" scale="'+LENS_REST+'" xChannelSelector="R" yChannelSelector="G"/>'+
'</filter></svg>';
document.body.appendChild(holder.firstChild);
}

function sizeLens(width,height){
var filter=document.getElementById("m-lens");
if(!filter)return;
var map=filter.querySelector("feImage");
width=Math.ceil(width);height=Math.ceil(height);
filter.setAttribute("width",width);filter.setAttribute("height",height);
map.setAttribute("width",width);map.setAttribute("height",height);
}

function setLens(amount){
var map=document.querySelector("#m-lens feDisplacementMap");
if(map)map.setAttribute("scale",amount.toFixed(1));
}

function addPill(nav){
pill=el("span","m-nav-pill");
pill.setAttribute("aria-hidden","true");
var lens=el("span","m-nav-lens");
var track=el("span","m-nav-track");
nav.querySelectorAll(".m-nav-items > *").forEach(function(item){
var copy=el("span",null,item.innerHTML);
track.appendChild(copy);
});
lens.appendChild(track);
pill.appendChild(lens);
nav.insertBefore(pill,nav.firstChild);
pill.track=track;
pill.items=nav.querySelector(".m-nav-items");
pill.lens=lens;
}

function navItem(page){
if(!pill)return null;
var links=pill.items.querySelectorAll(":scope > a");
for(var i=0;i<links.length;i++){
if(links[i].getAttribute("data-path")===page)return links[i];
}
return null;
}

/*
 * Draws the lens at x with width w over a menu item. "bulge" (0 to 1)
 * is how far into a move it is: the lens swells and magnifies more.
 */
function drawPill(x,w,item,bulge){
bulge=bulge||0;
var h=item.offsetHeight,grow=h*0.16*bulge;
var ph=h+grow,py=item.offsetTop-grow/2;
pill.style.width=w+"px";
pill.style.height=ph+"px";
pill.style.transform="translate("+x+"px,"+py+"px)";
/* The copied text: lined up with the real text, magnified around the lens centre. */
var items=pill.items,ox=items.offsetLeft,oy=items.offsetTop;
var cx=w/2,cy=ph/2,scale=1+0.12*bulge;
pill.track.style.transform="translate("+(cx+LENS_BLEED)+"px,"+(cy+LENS_BLEED)+"px) scale("+scale+") translate("+(ox-x-cx)+"px,"+(oy-py-cy)+"px)";
/* The refraction map covers the whole lens, including the part past its edge. */
sizeLens(w+LENS_BLEED*2,ph+LENS_BLEED*2);
/* Hide the real text under the lens. */
items.style.setProperty("--cut-a",(x-ox+1)+"px");
items.style.setProperty("--cut-b",(x-ox+w-1)+"px");
}

function placePill(page){
var item=navItem(page);
if(!item){if(pill)pill.style.opacity="0";return;}
cancelAnimationFrame(pillAnim);
pill.style.opacity="1";
pillX=item.offsetLeft;
pillW=item.offsetWidth;
drawPill(pillX,pillW,item);
setLens(LENS_REST);
}

function movePill(page){
var item=navItem(page);
if(!item)return;
if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){placePill(page);return;}
cancelAnimationFrame(pillAnim);
pill.style.opacity="1";
var fromX=pillX,fromW=pillW;
var toX=item.offsetLeft,toW=item.offsetWidth;
var distance=Math.abs(toX-fromX);
var duration=Math.min(650,320+distance*0.9);
var started=performance.now();
function frame(now){
var t=Math.min(1,(now-started)/duration);
/*
 * Like a drop of liquid: the leading edge moves first and settles
 * with a small spring, the trailing edge follows a little behind,
 * so the lens stretches on the way (never more than 40px).
 */
var p=Math.min(1,t/0.8);
var lead=1+1.9*Math.pow(p-1,3)+0.9*Math.pow(p-1,2);
var trail=1-Math.pow(1-t,3);
if(distance>0)trail=Math.max(trail,lead-40/distance);
var bulge=Math.sin(Math.PI*t);
var left,right;
if(toX>=fromX){
right=fromX+fromW+(toX+toW-fromX-fromW)*lead;
left=fromX+(toX-fromX)*trail;
}else{
left=fromX+(toX-fromX)*lead;
right=fromX+fromW+(toX+toW-fromX-fromW)*trail;
}
var x=left,w=Math.max(item.offsetHeight,right-left);
pillX=x;pillW=w;
drawPill(x,w,item,bulge);
setLens(LENS_REST+(LENS_MOVING-LENS_REST)*bulge);
if(t<1)pillAnim=requestAnimationFrame(frame);
else{pillX=toX;pillW=toW;drawPill(toX,toW,item);setLens(LENS_REST);}
}
pillAnim=requestAnimationFrame(frame);
}

function footer(){
var f=el("footer","m-footer glass");
f.innerHTML=
'<span>&copy; 1996&ndash;1998 The Phyrrian Astral Federation &middot; Hosted by ZapadTelecom&copy;</span>'+
'<span><span class="m-version"></span> &middot; <a href="'+siteRoot+'">Classic InterPhyr.net</a></span>';
fetchClassic("index.html").then(function(r){
var v=r.doc.querySelector(".page-intro .small");
f.querySelector(".m-version").textContent="InterPhyr Modern preview"+(v?" · "+text(v).replace("InterPhyr Version: ",""):"");
}).catch(function(){});
return f;
}

function notice(title,body){
var shell=document.querySelector(".m-shell");
shell.innerHTML="";
var box=el("div","m-notice glass");
box.appendChild(el("h1",null,title));
box.appendChild(el("p","m-muted",body));
shell.appendChild(box);
}

function failed(main){
main.innerHTML="";
var box=el("div","m-notice glass");
box.innerHTML='<h1>Page could not be loaded</h1><p class="m-muted">The ZapadTelecom&copy; network did not respond. Please try again.</p>';
main.appendChild(box);
}

/* ---------- Home ---------- */

function renderHome(main,token,ready){
Promise.all([fetchClassic("index.html"),fetchClassic("News/index.html"),ready]).then(function(results){
if(takenOver()||token!==renderToken)return;
var home=results[0],news=results[1],doc=home.doc;
enter(main);

/* Hero, from the classic welcome text. */
var intro=doc.querySelector(".page-intro");
var introText=intro?Array.prototype.filter.call(intro.querySelectorAll("p"),function(p){return !p.classList.contains("small")&&!p.querySelector("b");}):[];
var hero=el("section","m-hero glass");
hero.innerHTML=
'<div class="m-hero-orb" aria-hidden="true"></div>'+
'<span class="m-eyebrow">The Phyrrian Astral Federation</span>'+
'<h1>InterPhyr</h1>'+
'<p class="m-lead"></p>'+
'<div class="m-actions">'+
'<a class="m-btn m-btn-primary" href="'+new URL("News/",modernRoot).href+'">Read The Zapadiyan Daily</a>'+
'<a class="m-btn" href="#nations">Member nations</a>'+
'</div>';
hero.querySelector(".m-lead").textContent=introText.map(text).join(" ");
main.appendChild(hero);

/* Information and Goals side by side. */
var info=sectionByTitle(doc,"Information");
var goals=sectionByTitle(doc,"Goals");
var row=el("section","m-section m-grid m-grid-2");
if(info){
var infoCard=el("div","m-card glass");
infoCard.appendChild(el("span","m-eyebrow","About"));
infoCard.appendChild(el("h2",null,"Information"));
var infoBody=adopt(info,home.url);
infoBody.querySelectorAll("h2,.gov-access-row").forEach(function(n){n.remove();});
infoCard.appendChild(el("div","m-muted",infoBody.innerHTML));
row.appendChild(infoCard);
}
if(goals){
var goalsCard=el("div","m-card glass");
goalsCard.appendChild(el("span","m-eyebrow","Our mission"));
goalsCard.appendChild(el("h2",null,"Goals"));
var list=el("ul","m-checks");
goals.querySelectorAll("li").forEach(function(li){list.appendChild(el("li",null,li.innerHTML));});
goalsCard.appendChild(list);
row.appendChild(goalsCard);
}
main.appendChild(row);

/* Member nations, one card each. */
var nations=doc.querySelectorAll("section.nation");
if(nations.length){
var section=el("section","m-section");
section.id="nations";
section.innerHTML='<div class="m-section-head"><h2>Member Nations</h2><span class="m-small">Founded 1996</span></div>';
var grid=el("div","m-grid m-grid-3");
nations.forEach(function(n){
var nation=adopt(n,home.url);
var card=el("article","m-card glass m-nation");
var head=el("div","m-nation-head");
var img=nation.querySelector("img");
if(img)head.appendChild(img);
head.appendChild(el("h3",null,text(nation.querySelector(".nation-name"))));
card.appendChild(head);
var facts=el("dl","m-facts");
nation.querySelectorAll(".nation-info p").forEach(function(p){
var label=p.querySelector("b");
if(!label){card.appendChild(el("p","m-muted",p.innerHTML));return;}
var name=text(label).replace(/:$/,"");
label.remove();
var item=el("div");
item.appendChild(el("dt",null,name));
item.appendChild(el("dd",null,text(p)));
facts.appendChild(item);
});
card.appendChild(facts);
grid.appendChild(card);
});
section.appendChild(grid);
main.appendChild(section);
}

/* The three newest stories. */
var stories=news.doc.querySelectorAll("article.news-story");
if(stories.length){
var latest=el("section","m-section");
latest.innerHTML='<div class="m-section-head"><h2>Latest from The Zapadiyan Daily</h2><a href="'+new URL("News/",modernRoot).href+'">All stories &rarr;</a></div>';
var newsGrid=el("div","m-grid m-grid-3");
Array.prototype.slice.call(stories,0,3).forEach(function(s){
newsGrid.appendChild(storyCard(s,news.url,false,true));
});
latest.appendChild(newsGrid);
main.appendChild(latest);
}

/* Contact offices. */
var contact=sectionByTitle(doc,"Contact");
if(contact){
var contactSection=el("section","m-section");
contactSection.innerHTML='<div class="m-section-head"><h2>Contact</h2></div>';
var contactGrid=el("div","m-grid m-grid-2");
adopt(contact,home.url).querySelectorAll(".contact-table tr").forEach(function(tr){
var cells=tr.querySelectorAll("td");
if(cells.length<3)return;
var card=el("div","m-contact glass");
card.appendChild(el("b",null,text(cells[0])));
card.appendChild(el("span","m-muted",text(cells[1])));
var link=cells[2].querySelector("a");
if(link)card.appendChild(link);
contactGrid.appendChild(card);
});
contactSection.appendChild(contactGrid);
main.appendChild(contactSection);
}
}).catch(function(){if(token===renderToken)failed(main);});
}

/* ---------- News ---------- */

/*
 * One story as a glass card. "short" leaves out the full text
 * (used on the home page, which links to the News page instead).
 */
function storyCard(article,base,featured,short){
var story=adopt(article,base);
var card=el("article","m-card glass m-story"+(featured?" m-story-featured":""));
var byline=text(story.querySelector(".news-byline"));
var date=(byline.match(/\d{2}\.\d{2}\.\d{4}/)||[""])[0];
var meta=el("div","m-story-meta");
if(article.classList.contains("news-important"))meta.appendChild(el("span","m-badge","Important"));
meta.appendChild(el("span",null,date+(date?" · ":"")+"People's Information Ministry"));
card.appendChild(meta);
card.appendChild(el("h3",null,text(story.querySelector(".news-headline"))));
var lead=story.querySelector(".news-lead");
if(lead)card.appendChild(el("p","m-lead",lead.innerHTML));
var more=story.querySelector(".news-more");
if(more&&!short){
var details=el("details","m-more");
details.appendChild(el("summary"));
more.querySelectorAll("p").forEach(function(p){details.appendChild(el("p",null,p.innerHTML));});
card.appendChild(details);
}
return card;
}

function renderNews(main,token,ready){
Promise.all([fetchClassic("News/index.html"),ready]).then(function(results){
if(takenOver()||token!==renderToken)return;
var r=results[0],doc=r.doc;
enter(main);

var hero=el("section","m-hero glass");
hero.innerHTML=
'<div class="m-hero-orb" aria-hidden="true"></div>'+
'<span class="m-eyebrow">People\'s Information Ministry</span>'+
'<h1>The Zapadiyan Daily</h1>'+
'<p class="m-lead">Official news of the Phyrrian Astral Federation. Edited &amp; approved.</p>';
main.appendChild(hero);

var notes=doc.querySelectorAll("#information .notice, .content-section > .notice");
if(notes.length){
var note=adopt(notes[0],r.url);
var bold=note.querySelector("b");
if(bold)bold.remove();
var callout=el("section","m-section m-callout glass");
callout.innerHTML='<span class="m-callout-icon" aria-hidden="true">!</span>';
callout.appendChild(el("p",null,"<b>Citizens:</b> "+note.innerHTML.trim()));
main.appendChild(callout);
}

var articles=doc.querySelectorAll("article.news-story");
var important=Array.prototype.filter.call(articles,function(a){return a.classList.contains("news-important");});
if(important.length){
var top=el("section","m-section");
top.innerHTML='<div class="m-section-head"><h2>Important News</h2></div>';
var topGrid=el("div","m-grid m-grid-2");
important.forEach(function(a){topGrid.appendChild(storyCard(a,r.url,true,false));});
top.appendChild(topGrid);
main.appendChild(top);
}

var all=el("section","m-section");
all.innerHTML='<div class="m-section-head"><h2>Latest Stories</h2><span class="m-small">'+articles.length+' stories</span></div>';
var grid=el("div","m-grid m-grid-2");
articles.forEach(function(a){
if(a.classList.contains("news-important"))return;
grid.appendChild(storyCard(a,r.url,false,false));
});
all.appendChild(grid);
main.appendChild(all);
}).catch(function(){if(token===renderToken)failed(main);});
}

/* ---------- Page changes ---------- */

/*
 * Moving between Modern pages doesn't load a new page: the menu lens
 * slides over, the old panels fade out and the new ones rise in.
 * The address bar, Back and Forward still work as normal.
 */

var TITLES={
"":"InterPhyr — The Phyrrian Astral Federation",
"News/":"The Zapadiyan Daily — InterPhyr"
};

var mainEl=null;
var currentPage=null;
var renderToken=0;

function reducedMotion(){
return !!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

/* Clears the page for new content, just before it is drawn. */
function enter(main){
main.classList.remove("m-leaving","m-enter");
main.innerHTML="";
/* After the new content is in place: number the panels and let them rise in. */
requestAnimationFrame(function(){
var parts=main.querySelectorAll(".glass,.m-section-head");
parts.forEach(function(part,i){part.style.setProperty("--i",Math.min(i,10));});
main.classList.add("m-enter");
setTimeout(function(){main.classList.remove("m-enter");},1400);
});
}

function render(page,ready){
renderToken++;
document.title=TITLES[page]||TITLES[""];
document.body.setAttribute("data-page",page);
if(page==="News/")renderNews(mainEl,renderToken,ready);
else renderHome(mainEl,renderToken,ready);
}

function pageOf(url){
var path=url.pathname.slice(new URL(modernRoot).pathname.length).replace(/index\.html$/,"");
return MODERN_PAGES.indexOf(path)>=0?path:null;
}

function navigate(page,push){
if(page===currentPage)return;
currentPage=page;
if(push)history.pushState({page:page},"",new URL(page,modernRoot).href);
if(pill)pill.items.querySelectorAll(":scope > a").forEach(function(a){a.classList.toggle("active",a.getAttribute("data-path")===page);});
movePill(page);
var wait=reducedMotion()?0:220;
mainEl.classList.remove("m-enter");
mainEl.classList.add("m-leaving");
var ready=new Promise(function(resolve){setTimeout(function(){
window.scrollTo({top:0,behavior:"instant"});
resolve();
},wait);});
render(page,ready);
}

/* Links to other Modern pages (menu, buttons, "All stories") change page in place. */
function onLinkClick(event){
if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
var link=event.target.closest&&event.target.closest("a[href]");
if(!link||link.target==="_blank")return;
var url=new URL(link.href);
if(url.origin!==location.origin)return;
var page=pageOf(url);
if(page===null)return;
if(page===currentPage&&url.hash)return;
event.preventDefault();
navigate(page,true);
}

/* ---------- Start ---------- */

function start(){
if(takenOver())return;
var page=document.body.getAttribute("data-page")||"";
document.body.insertBefore(backdrop(),document.body.firstChild);
lensFilter();
var shell=el("div","m-shell");
shell.appendChild(topbar(page));
mainEl=el("main");
mainEl.id="main";
mainEl.appendChild(el("div","m-skeleton glass"));
shell.appendChild(mainEl);
shell.appendChild(footer());
document.body.appendChild(shell);
placePill(page);
window.addEventListener("resize",function(){placePill(currentPage);});

/* The same locks as the classic site. */
if(getCookie("interphyr_lockout")==="1"){
notice("Access denied","This computer has been locked out of InterPhyr.net after too many failed Government Access logons.");
return;
}
if(String(window.INTERPHYR_MAINTENANCE)==="1"&&getCookie("interphyr_admin_session")!=="1"){
notice("This website is under maintenance","InterPhyr.net is being worked on by ZapadTelecom&copy;. Please try again later.");
return;
}

currentPage=page;
history.replaceState({page:page},"");
document.addEventListener("click",onLinkClick);
window.addEventListener("popstate",function(){
var back=pageOf(location);
if(back!==null)navigate(back,false);
});
render(page,Promise.resolve());
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);
else start();

})();
