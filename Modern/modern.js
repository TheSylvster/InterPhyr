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

/*
 * The background: flowing colour ribbons, like a modern wallpaper,
 * with faint survey-map contour lines on top. It is drawn for the
 * screen size (so it is always sharp) and drifts slowly (CSS). The
 * ribbon edges and lines give the glass something to bend.
 */

function backdrop(){
var b=el("div","m-backdrop");
b.setAttribute("aria-hidden","true");
var canvas=el("canvas","m-backdrop-art");
b.appendChild(canvas);
function draw(){paintBackdrop(canvas);}
draw();
var timer=0;
window.addEventListener("resize",function(){
clearTimeout(timer);
timer=setTimeout(function(){
/* Only redraw when the screen got bigger, or changed a lot. */
if(window.innerWidth*1.15>canvas.cssWidth||window.innerHeight*1.15>canvas.cssHeight||window.innerWidth<canvas.cssWidth*0.6)draw();
},250);
});
return b;
}

/* A repeatable random number generator, so the scene looks the same every visit. */
function seeded(seed){
return function(){
seed=(seed*1664525+1013904223)>>>0;
return seed/4294967296;
};
}

function paintBackdrop(canvas){
/* A little larger than the screen, so the slow drift never shows an edge. */
var w=Math.round(window.innerWidth*1.15),h=Math.round(window.innerHeight*1.15);
var dpr=Math.min(window.devicePixelRatio||1,2);
canvas.width=Math.round(w*dpr);
canvas.height=Math.round(h*dpr);
canvas.style.width=w+"px";
canvas.style.height=h+"px";
canvas.cssWidth=w;canvas.cssHeight=h;
var c=canvas.getContext("2d");
c.setTransform(dpr,0,0,dpr,0,0);

/* Deep night-blue base. */
var base=c.createLinearGradient(0,0,w,h);
base.addColorStop(0,"#0a1030");
base.addColorStop(0.55,"#080b1f");
base.addColorStop(1,"#120a26");
c.fillStyle=base;
c.fillRect(0,0,w,h);

/* The ribbons: wide bands with wavy edges, each with its own colours. */
var ribbons=[
{y:0.18,thick:0.20,amp:0.10,freq:1.1,phase:0.4,tilt:0.18,colors:["#2f5bff","#7b4dff","#c04dff"],alpha:0.62},
{y:0.46,thick:0.16,amp:0.08,freq:1.4,phase:2.1,tilt:-0.12,colors:["#16c7b0","#2f7dff","#5b4dff"],alpha:0.5},
{y:0.70,thick:0.22,amp:0.11,freq:0.9,phase:4.0,tilt:0.1,colors:["#e8453a","#f07a3d","#a83dff"],alpha:0.5},
{y:0.92,thick:0.14,amp:0.06,freq:1.6,phase:1.2,tilt:-0.08,colors:["#7b4dff","#2f5bff","#16c7b0"],alpha:0.42}
];
c.save();
c.filter="blur(1.5px)";
ribbons.forEach(function(r){
function edge(x,offset){
var u=x/w;
return h*(r.y+offset+r.tilt*(u-0.5)+r.amp*Math.sin(u*Math.PI*2*r.freq+r.phase)+r.amp*0.35*Math.sin(u*Math.PI*5.3*r.freq+r.phase*1.7));
}
var steps=60,i,x;
c.beginPath();
for(i=0;i<=steps;i++){x=w*i/steps;if(i===0)c.moveTo(x,edge(x,-r.thick/2));else c.lineTo(x,edge(x,-r.thick/2));}
for(i=steps;i>=0;i--){x=w*i/steps;c.lineTo(x,edge(x,r.thick/2)+h*0.04*Math.sin(i/steps*Math.PI*3+r.phase));}
c.closePath();
var g=c.createLinearGradient(0,0,w,0);
g.addColorStop(0,r.colors[0]);
g.addColorStop(0.5,r.colors[1]);
g.addColorStop(1,r.colors[2]);
c.globalAlpha=r.alpha;
c.fillStyle=g;
c.fill();
/* A silky shine along the top edge of each ribbon. */
c.globalAlpha=r.alpha*0.55;
c.lineWidth=2;
c.strokeStyle="rgba(255,255,255,.55)";
c.beginPath();
for(i=0;i<=steps;i++){x=w*i/steps;if(i===0)c.moveTo(x,edge(x,-r.thick/2));else c.lineTo(x,edge(x,-r.thick/2));}
c.stroke();
});
c.restore();
c.globalAlpha=1;

/* Darken between the ribbons a little, so text stays easy to read. */
var shade=c.createLinearGradient(0,0,0,h);
shade.addColorStop(0,"rgba(6,9,24,.42)");
shade.addColorStop(0.5,"rgba(6,9,24,.25)");
shade.addColorStop(1,"rgba(6,9,24,.48)");
c.fillStyle=shade;
c.fillRect(0,0,w,h);

/* Contour lines, like a survey map, from a smooth random height field. */
var rand=seeded(1996);
var cell=180,gx=Math.ceil(w/cell)+2,gy=Math.ceil(h/cell)+2,grid=[],gi;
for(gi=0;gi<gx*gy;gi++)grid.push(rand());
function smooth(t){return t*t*(3-2*t);}
function noise(x,y){
var fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=smooth(fx-ix),ty=smooth(fy-iy);
/* Wraps around, so any position has a value. */
function at(i,j){return grid[((j%gy)+gy)%gy*gx+((i%gx)+gx)%gx];}
var a=at(ix,iy),b2=at(ix+1,iy),c2=at(ix,iy+1),d=at(ix+1,iy+1);
return (a+(b2-a)*tx)+((c2+(d-c2)*tx)-(a+(b2-a)*tx))*ty;
}
function height(x,y){return noise(x,y)*0.7+noise(x*2.3+400,y*2.3+400)*0.3;}
var step=6,cols=Math.ceil(w/step)+1,rows=Math.ceil(h/step)+1,field=new Float32Array(cols*rows),ix2,iy2;
for(iy2=0;iy2<rows;iy2++)for(ix2=0;ix2<cols;ix2++)field[iy2*cols+ix2]=height(ix2*step,iy2*step);
c.lineWidth=1;
for(var level=0.1;level<0.95;level+=0.05){
var major=Math.abs(level*10-Math.round(level*10))<0.01;
c.strokeStyle=major?"rgba(255,255,255,.11)":"rgba(255,255,255,.055)";
c.beginPath();
for(iy2=0;iy2<rows-1;iy2++){
for(ix2=0;ix2<cols-1;ix2++){
/* Marching squares: where the line crosses each little square. */
var v0=field[iy2*cols+ix2],v1=field[iy2*cols+ix2+1],v2=field[(iy2+1)*cols+ix2+1],v3=field[(iy2+1)*cols+ix2];
var pts=[];
var x0=ix2*step,y0=iy2*step;
if((v0<level)!==(v1<level))pts.push([x0+step*(level-v0)/(v1-v0),y0]);
if((v1<level)!==(v2<level))pts.push([x0+step,y0+step*(level-v1)/(v2-v1)]);
if((v3<level)!==(v2<level))pts.push([x0+step*(level-v3)/(v2-v3),y0+step]);
if((v0<level)!==(v3<level))pts.push([x0,y0+step*(level-v0)/(v3-v0)]);
if(pts.length>=2){c.moveTo(pts[0][0],pts[0][1]);c.lineTo(pts[1][0],pts[1][1]);}
if(pts.length===4){c.moveTo(pts[2][0],pts[2][1]);c.lineTo(pts[3][0],pts[3][1]);}
}
}
c.stroke();
}

/* A soft vignette towards the edges. */
var vignette=c.createRadialGradient(w/2,h*0.45,Math.min(w,h)*0.3,w/2,h/2,Math.max(w,h)*0.75);
vignette.addColorStop(0,"rgba(5,7,20,0)");
vignette.addColorStop(1,"rgba(5,7,20,.6)");
c.fillStyle=vignette;
c.fillRect(0,0,w,h);
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

/*
 * ---------- The phone menu ----------
 *
 * On phones the menu is a round glass button. Tapping it melts it open
 * into a glass panel, joined to the button by a liquid "neck", and it
 * melts back when closed. The whole shape is one outline (drawn by
 * menuShape), so it always looks like a single piece of glass.
 */

var menu=null;
var MENU_R=22,MENU_ITEM=46;

function buildMenu(page){
var box=el("div","m-menu");
var ns="http://www.w3.org/2000/svg";
box.innerHTML=
'<svg class="m-menu-shadow" aria-hidden="true"><path/></svg>'+
'<div class="m-menu-glass"></div>'+
'<svg class="m-menu-rim" aria-hidden="true"><defs><linearGradient id="m-menu-rim-g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".45" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient></defs><path/></svg>'+
'<button type="button" class="m-menu-button" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>';
var links=el("nav","m-menu-links");
links.setAttribute("aria-label","Main");
NAV.forEach(function(item){
var row;
if(item.path==null){
row=el("span","m-menu-soon",item.label+" <small>soon</small>");
}else{
row=el("a",null,item.label);
row.href=new URL(item.path,modernRoot).href;
row.setAttribute("data-path",item.path);
if(item.path===page)row.className="active";
}
links.appendChild(row);
});
box.appendChild(links);
document.body.appendChild(box);
menu={box:box,links:links,open:false,amount:0,anim:0,
glass:box.querySelector(".m-menu-glass"),
rim:box.querySelector(".m-menu-rim path"),
shadow:box.querySelector(".m-menu-shadow path"),
button:box.querySelector(".m-menu-button")};
menu.button.addEventListener("click",function(){setMenu(!menu.open);});
document.addEventListener("click",function(event){
if(menu.open&&!box.contains(event.target))setMenu(false);
});
document.addEventListener("keydown",function(event){
if(event.key==="Escape"&&menu.open){setMenu(false);menu.button.focus();}
});
window.addEventListener("resize",function(){drawMenu(menu.amount);});
drawMenu(0);
}

function lerp(a,b,t){return a+(b-a)*t;}

/*
 * The outline at "amount" (0 = just the round button, 1 = fully open).
 * The panel grows down and to the left from the button; its top edge
 * flows into the button through a curved neck.
 */
function menuShape(amount,W,H){
var r=MENU_R,cx=W-r,cy=r;
var ew=Math.min(1,amount*1.15),eh=amount;
var x1=W,w=lerp(2*r,W,ew),x0=x1-w;
var y0=cy,y1=lerp(2*r,H,eh);
var Rb=Math.min(lerp(r,26,amount),(y1-y0),w/2);
var f=lerp(0,24,Math.min(1,amount*1.6));
var Rt=Math.min(lerp(0,24,amount),y1-y0-Rb);
f=Math.max(0,Math.min(f,cx-r-x0-Rt));
var nx=cx-r-f;
var beta=Math.min(1.05,f/r*1.1);
var px=cx-r*Math.cos(beta),py=cy-r*Math.sin(beta);
var k1=f*0.6,k2=f*0.55;
function n(v){return v.toFixed(2);}
return "M"+n(cx)+","+n(cy-r)+
" A"+r+","+r+" 0 0 1 "+n(x1)+","+n(cy)+
" L"+n(x1)+","+n(y1-Rb)+
" A"+n(Rb)+","+n(Rb)+" 0 0 1 "+n(x1-Rb)+","+n(y1)+
" L"+n(x0+Rb)+","+n(y1)+
" A"+n(Rb)+","+n(Rb)+" 0 0 1 "+n(x0)+","+n(y1-Rb)+
" L"+n(x0)+","+n(y0+Rt)+
(Rt>0.01?" A"+n(Rt)+","+n(Rt)+" 0 0 1 "+n(x0+Rt)+","+n(y0):"")+
" L"+n(nx)+","+n(y0)+
" C"+n(nx+k1)+","+n(y0)+" "+n(px-k2*Math.sin(beta))+","+n(py+k2*Math.cos(beta))+" "+n(px)+","+n(py)+
" A"+r+","+r+" 0 0 1 "+n(cx)+","+n(cy-r)+" Z";
}

function menuSize(){
var count=menu.links.children.length;
return {W:Math.min(260,window.innerWidth-32),H:2*MENU_R+12+count*MENU_ITEM+14};
}

function drawMenu(amount){
var size=menuSize(),W=size.W,H=size.H;
menu.box.style.width=W+"px";
/* A little taller than the panel, so the opening overshoot has room. */
menu.box.style.height=(H+16)+"px";
var d=menuShape(amount,W,H);
menu.glass.style.clipPath="path('"+d+"')";
menu.glass.style.webkitClipPath="path('"+d+"')";
/* The links are cut to the same shape, so they only ever show inside the glass. */
menu.links.style.clipPath="path('"+d+"')";
menu.links.style.webkitClipPath="path('"+d+"')";
menu.rim.setAttribute("d",d);
menu.shadow.setAttribute("d",d);
/* The links appear once the panel is mostly open, one after another. */
Array.prototype.forEach.call(menu.links.children,function(row,i){
var show=Math.max(0,Math.min(1,(amount-0.45-i*0.05)/0.35));
row.style.opacity=show;
row.style.transform="translateY("+((1-show)*-8)+"px)";
});
menu.links.style.visibility=amount>0.4?"visible":"hidden";
menu.box.classList.toggle("open",amount>0.02);
}

function setMenu(open){
if(!menu||open===menu.open)return;
menu.open=open;
menu.button.setAttribute("aria-expanded",open?"true":"false");
menu.box.classList.toggle("opening",open);
cancelAnimationFrame(menu.anim);
if(reducedMotion()){menu.amount=open?1:0;drawMenu(menu.amount);return;}
var from=menu.amount,to=open?1:0;
var duration=open?620:420;
var started=performance.now();
function frame(now){
var t=Math.min(1,(now-started)/duration);
/* Opening overshoots a little and settles, like liquid; closing is quicker and smooth. */
var e=open?1+2.1*Math.pow(t-1,3)+1.1*Math.pow(t-1,2):1-Math.pow(1-t,3);
menu.amount=lerp(from,to,e);
drawMenu(Math.max(0,menu.amount));
if(t<1)menu.anim=requestAnimationFrame(frame);
else{menu.amount=to;drawMenu(to);}
}
menu.anim=requestAnimationFrame(frame);
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
if(menu){
setMenu(false);
menu.links.querySelectorAll("a").forEach(function(a){a.classList.toggle("active",a.getAttribute("data-path")===page);});
}
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

/*
 * Smooth travel: buttons and links that go somewhere on the same page
 * (like "Member nations") glide there instead of jumping, and stop just
 * below the top bar. Scrolling with the mouse or a finger takes over.
 */
var glideAnim=0;

function glideTo(target){
cancelAnimationFrame(glideAnim);
var bar=document.querySelector(".m-topbar");
var offset=(bar?bar.offsetHeight+bar.offsetTop:0)+24;
var startY=window.scrollY;
var maxY=document.documentElement.scrollHeight-window.innerHeight;
var endY=Math.max(0,Math.min(maxY,target.getBoundingClientRect().top+startY-offset));
var distance=endY-startY;
if(reducedMotion()||Math.abs(distance)<2){window.scrollTo(0,endY);return;}
var duration=Math.min(1100,Math.max(450,320+Math.abs(distance)*0.35));
var started=performance.now();
function stop(){cancelAnimationFrame(glideAnim);removeEventListener("wheel",stop);removeEventListener("touchstart",stop);}
addEventListener("wheel",stop,{passive:true});
addEventListener("touchstart",stop,{passive:true});
function frame(now){
var t=Math.min(1,(now-started)/duration);
/* Ease in and out: starts gently, glides, settles softly. */
var e=t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
window.scrollTo(0,startY+distance*e);
if(t<1)glideAnim=requestAnimationFrame(frame);
else stop();
}
glideAnim=requestAnimationFrame(frame);
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
if(page===currentPage&&url.hash){
var target=document.getElementById(decodeURIComponent(url.hash.slice(1)));
if(!target)return;
event.preventDefault();
history.replaceState(history.state,"",url.href);
glideTo(target);
return;
}
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
buildMenu(page);

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
