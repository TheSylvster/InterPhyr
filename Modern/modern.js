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

/* Outside Relations nations (folder names under Relations/). */
var OUTSIDE=["Eisenreich","Pancake","Swissland","Luminara","MerchantsUnion","Frostborn"];

/*
 * Pages that have a Modern version (paths from the site root). "Nations/"
 * is Modern's own overview of the member nations; every other page is a
 * classic page restyled.
 */
var MODERN_PAGES=["","News/","Nations/","ZPR/","Astralyia/","Rendale/","Doctrines/","Relations/","Projects/","ZapadTelecom/","About/","UpdateLogs/"].concat(OUTSIDE.map(function(n){return "Relations/"+n+"/";}));

var NAV=[
{label:"Home",path:""},
{label:"News",path:"News/"},
{label:"Nations",path:"Nations/"},
{label:"Relations",path:"Relations/"},
{label:"Projects",path:"Projects/"},
{label:"World Map",path:"Map/"},
{label:"Government",path:"Government/"}
];

/* The menu item a page belongs to: a nation page lights up "Nations", and so on. */
function navPathFor(page){
if(page==null)return null;
if(/^(Nations|ZPR|Astralyia|Rendale|Doctrines)\/$/.test(page))return "Nations/";
if(page.indexOf("Relations/")===0)return "Relations/";
return page;
}

function getCookie(name){
var cookies=document.cookie.split(";");
for(var i=0;i<cookies.length;i++){
var c=cookies[i].trim();
if(c.indexOf(name+"=")===0)return decodeURIComponent(c.substring(name.length+1));
}
return null;
}

/*
 * ---------- Who may see what (the same rules as the classic site) ----------
 *
 * Modern has no dial-up, but it shares the classic site's cookies: a nation
 * registered there is registered here too. Outside Relations and the
 * relations on the World Map are for member nations only, and Swissland
 * is blocked from the whole network.
 */

function normalizeNationName(name){
return name.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
}

function isPafMember(name){
var s=name.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g,"").replace(/^the/,"");
return s==="zpr"||/^(astralyia|zapadiya|zapadyia|rendale|kingdomofrendale)/.test(s);
}

/* Lowercase letters only, number stand-ins read as letters, doubled letters collapsed. */
function looseLetters(value){
var leet={"0":"o","1":"l","3":"e","4":"a","5":"s","7":"t","$":"s","@":"a","|":"l","!":"i"};
return value.normalize("NFKD").replace(/[̀-ͯ]/g,"").toLowerCase()
.replace(/[013457$@|!]/g,function(c){return leet[c];})
.replace(/[^a-z]/g,"").replace(/(.)\1+/g,"$1");
}

function editDistance(a,b){
var prev=[],i,j;
for(j=0;j<=b.length;j++)prev[j]=j;
for(i=1;i<=a.length;i++){
var cur=[i];
for(j=1;j<=b.length;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
prev=cur;
}
return prev[b.length];
}

/* Swissland in any spelling close enough to it (the same check as the classic registration). */
function isBlockedNation(name){
var target="swisland";
var words=name.split(/[\s\-_.,;:'"\/\\()]+/).filter(Boolean);
for(var i=0;i<words.length;i++){
var chunk="";
for(var j=i;j<words.length;j++){
chunk+=words[j];
var loose=looseLetters(chunk);
if(loose.length<5)continue;
if(loose.length>target.length+3)break;
var d=editDistance(loose,target);
if(d<=1||(d<=2&&loose[0]==="s"))return true;
}
}
return false;
}

function isAdmin(){return getCookie("interphyr_admin_session")==="1";}
function registeredNation(){return getCookie("interphyr_registered_nation");}

function regionBlocked(){
if(isAdmin())return false;
if(getCookie("interphyr_nation_status")==="invalid")return true;
var nation=registeredNation();
return !!(nation&&isBlockedNation(nation));
}

/* Member nations (and the ZapTel_IT admin) see Outside Relations and the relations on the map. */
function seesRelations(){
if(isAdmin())return true;
var nation=registeredNation();
return !!(nation&&isPafMember(nation));
}

/* Registers a nation exactly like the classic registration screen. Returns "admin", "blocked" or "ok". */
function registerNation(name){
if(normalizeNationName(name)==="zaptelit"){
document.cookie="interphyr_admin_session=1; path=/";
return "admin";
}
var blocked=isBlockedNation(name);
document.cookie="interphyr_nation_status="+(blocked?"invalid":"valid")+"; max-age=31536000; path=/";
if(blocked)return "blocked";
document.cookie="interphyr_registered_nation="+encodeURIComponent(name)+"; max-age=31536000; path=/";
return "ok";
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
img.removeAttribute("style");
img.loading="lazy";
});
copy.querySelectorAll("video[src],audio[src],source[src]").forEach(function(media){
media.src=new URL(media.getAttribute("src"),base).href;
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
bar.appendChild(makeGlassButton(new URL("UpdateLogs/",modernRoot).href,"Update Logs",ICON_LOG));
var nav=el("nav","m-nav");
nav.setAttribute("aria-label","Main");
var items=el("span","m-nav-items");
nav.appendChild(items);
NAV.forEach(function(item){
if(item.path==null||MODERN_PAGES.indexOf(item.path)<0){
var soon=el("span","m-nav-soon",item.label);
soon.title="Coming soon";
items.appendChild(soon);
return;
}
var link=el("a",null,item.label);
link.href=new URL(item.path,modernRoot).href;
link.setAttribute("data-path",item.path);
if(item.path===navPathFor(page))link.className="active";
items.appendChild(link);
});
bar.appendChild(nav);
navItems=items;
navLens=makeLens(nav,items,"x");
return bar;
}

/*
 * ---------- Clear liquid-glass lenses (sliding highlights) ----------
 *
 * A lens marks the selected item in a menu and slides to the next one,
 * stretching a little on the way like liquid. It is CLEAR glass (no
 * frosted fill): a bright rim, a faint rainbow fringe, a soft shadow,
 * and inside it a copy of the menu text, lined up with the real text
 * and bent by an SVG refraction filter: barely at rest, strongly while
 * it travels. Used by the menu bar (sideways) and the phone menu (up
 * and down). Every slider like this must use makeLens.
 */

/* How far the rim bends things, in pixels: a little at rest, more while moving. */
var LENS_REST=5,LENS_MOVING=26;
/* The refracted copy reaches this far past the edge of the lens. */
var LENS_BLEED=14;
var lensMapURL=null,lensCount=0;

/*
 * The refraction map: no bending in the middle, more and more towards
 * the rim, where the glass bends in what is just outside it.
 */
function lensMap(){
if(lensMapURL)return lensMapURL;
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
lensMapURL=canvas.toDataURL();
return lensMapURL;
}

/*
 * host: the positioned element the lens sits in.
 * items: the element holding the menu items (inside host).
 * axis: "x" for a row of items, "y" for a column.
 */
function makeLens(host,items,axis){
lensCount++;
var id="m-lens-"+lensCount;
var holder=document.createElement("div");
holder.innerHTML=
'<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">'+
/* Sized in pixels to the lens on every frame: relative sizes place the map wrongly in Chrome. */
'<filter id="'+id+'" x="0" y="0" width="100" height="40" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">'+
'<feImage href="'+lensMap()+'" x="0" y="0" width="100" height="40" preserveAspectRatio="none" result="map"/>'+
'<feDisplacementMap in="SourceGraphic" in2="map" scale="'+LENS_REST+'" xChannelSelector="R" yChannelSelector="G"/>'+
'</filter></svg>';
var svg=holder.firstChild;
document.body.appendChild(svg);
var filter=svg.querySelector("filter"),map=svg.querySelector("feImage"),bend=svg.querySelector("feDisplacementMap");

var glass=el("span","m-lens");
glass.setAttribute("aria-hidden","true");
var inner=el("span","m-lens-inner");
inner.style.filter="url(#"+id+")";
/* The copy: the whole menu, cloned, so it has exactly the same layout. */
var track=items.cloneNode(true);
track.removeAttribute("style");
track.classList.remove("m-lens-cut-x","m-lens-cut-y");
track.classList.add("m-lens-track");
track.querySelectorAll("*").forEach(function(node){
node.removeAttribute("id");
node.removeAttribute("href");
node.removeAttribute("title");
node.removeAttribute("data-path");
node.removeAttribute("tabindex");
node.classList.remove("active");
node.classList.add("m-lens-copy");
});
inner.appendChild(track);
glass.appendChild(inner);
host.insertBefore(glass,host.firstChild);
items.classList.add(axis==="y"?"m-lens-cut-y":"m-lens-cut-x");

var lens={el:glass,x:0,y:0,w:0,h:0,anim:0};

/* Hidden (on a page not in this menu): the real text shows again everywhere. */
function hide(){
glass.style.opacity="0";
items.style.setProperty("--cut-a","0px");
items.style.setProperty("--cut-b","0px");
}

function setBend(amount){bend.setAttribute("scale",amount.toFixed(1));}

/* Draws the lens; "bulge" (0 to 1) is how far into a move it is: it swells and magnifies more. */
function draw(x,y,w,h,bulge){
bulge=bulge||0;
if(axis==="x"){var gy=h*0.16*bulge;y-=gy/2;h+=gy;}
else{var gx=w*0.04*bulge;x-=gx/2;w+=gx;}
glass.style.width=w+"px";
glass.style.height=h+"px";
glass.style.transform="translate("+x+"px,"+y+"px)";
var ox=items.offsetLeft,oy=items.offsetTop;
var cx=w/2,cy=h/2,scale=1+0.12*bulge;
track.style.width=items.offsetWidth+"px";
track.style.transform="translate("+(cx+LENS_BLEED)+"px,"+(cy+LENS_BLEED)+"px) scale("+scale+") translate("+(ox-x-cx)+"px,"+(oy-y-cy)+"px)";
/* The refraction map covers the whole lens, including the part past its edge. */
var mw=Math.ceil(w+LENS_BLEED*2),mh=Math.ceil(h+LENS_BLEED*2);
filter.setAttribute("width",mw);filter.setAttribute("height",mh);
map.setAttribute("width",mw);map.setAttribute("height",mh);
/* Hide the real text under the lens, where its refracted copy shows instead. */
if(axis==="x"){
items.style.setProperty("--cut-a",(x-ox+1)+"px");
items.style.setProperty("--cut-b",(x-ox+w-1)+"px");
}else{
items.style.setProperty("--cut-a",(y-oy+1)+"px");
items.style.setProperty("--cut-b",(y-oy+h-1)+"px");
}
}

lens.place=function(item){
cancelAnimationFrame(lens.anim);
if(!item){hide();return;}
glass.style.opacity="";
lens.x=item.offsetLeft;lens.y=item.offsetTop;lens.w=item.offsetWidth;lens.h=item.offsetHeight;
draw(lens.x,lens.y,lens.w,lens.h,0);
setBend(LENS_REST);
};

lens.move=function(item){
/* A page that isn't in this menu (like Update Logs): the lens fades away. */
if(!item){hide();return;}
if(reducedMotion()||!lens.w){lens.place(item);return;}
cancelAnimationFrame(lens.anim);
glass.style.opacity="";
var from=axis==="x"?{a:lens.x,s:lens.w}:{a:lens.y,s:lens.h};
var to=axis==="x"?{a:item.offsetLeft,s:item.offsetWidth}:{a:item.offsetTop,s:item.offsetHeight};
var other=axis==="x"?{a:item.offsetTop,s:item.offsetHeight}:{a:item.offsetLeft,s:item.offsetWidth};
var distance=Math.abs(to.a-from.a);
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
var start,end;
if(to.a>=from.a){
end=from.a+from.s+(to.a+to.s-from.a-from.s)*lead;
start=from.a+(to.a-from.a)*trail;
}else{
start=from.a+(to.a-from.a)*lead;
end=from.a+from.s+(to.a+to.s-from.a-from.s)*trail;
}
var size=Math.max(Math.min(from.s,to.s)*0.6,end-start);
if(axis==="x"){lens.x=start;lens.w=size;draw(start,other.a,size,other.s,bulge);}
else{lens.y=start;lens.h=size;draw(other.a,start,other.s,size,bulge);}
setBend(LENS_REST+(LENS_MOVING-LENS_REST)*bulge);
if(t<1)lens.anim=requestAnimationFrame(frame);
else lens.place(item);
}
lens.anim=requestAnimationFrame(frame);
};

return lens;
}

/* The menu item for a page, in a list of items. */
function itemFor(items,page){
var links=items.querySelectorAll(":scope > a");
for(var i=0;i<links.length;i++){
if(links[i].getAttribute("data-path")===page)return links[i];
}
return null;
}

var navLens=null,navItems=null;

function placePill(page){if(navLens)navLens.place(itemFor(navItems,navPathFor(page)));}
function movePill(page){if(navLens)navLens.move(itemFor(navItems,navPathFor(page)));}

/*
 * ---------- Glass buttons ----------
 *
 * A button that turns into clear liquid glass while it is pressed,
 * like the menu lens: it swells, its rim catches the light (with the
 * faint rainbow fringe) and its text bends; on release it springs back.
 */

function glassButton(button){
lensCount++;
var id="m-press-"+lensCount;
var holder=document.createElement("div");
holder.innerHTML=
'<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">'+
'<filter id="'+id+'" x="0" y="0" width="100" height="40" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">'+
'<feImage href="'+lensMap()+'" x="0" y="0" width="100" height="40" preserveAspectRatio="none" result="map"/>'+
'<feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G"/>'+
'</filter></svg>';
var svg=holder.firstChild;
document.body.appendChild(svg);
var filter=svg.querySelector("filter"),map=svg.querySelector("feImage"),bend=svg.querySelector("feDisplacementMap");
var face=button.querySelector(".m-glass-face");
var amount=0,anim=0,pressed=false;
function size(){
var w=Math.ceil(face.offsetWidth),h=Math.ceil(face.offsetHeight);
filter.setAttribute("width",w);filter.setAttribute("height",h);
map.setAttribute("width",w);map.setAttribute("height",h);
}
/* The bend grows while pressed and fades away after release. */
function bendTo(target){
cancelAnimationFrame(anim);
var from=amount,started=performance.now(),duration=target?220:380;
if(target)face.style.filter="url(#"+id+")";
function frame(now){
var t=Math.min(1,(now-started)/duration);
amount=from+(target-from)*(1-Math.pow(1-t,3));
bend.setAttribute("scale",amount.toFixed(1));
if(t<1)anim=requestAnimationFrame(frame);
else if(!target)face.style.filter="";
}
anim=requestAnimationFrame(frame);
}
function down(){
if(pressed)return;
pressed=true;
size();
button.classList.add("pressed");
if(!reducedMotion())bendTo(14);
}
function up(){
if(!pressed)return;
pressed=false;
button.classList.remove("pressed");
if(!reducedMotion())bendTo(0);
}
button.addEventListener("pointerdown",down);
["pointerup","pointerleave","pointercancel","blur"].forEach(function(type){button.addEventListener(type,up);});
button.addEventListener("keydown",function(event){if(event.key===" "||event.key==="Enter")down();});
button.addEventListener("keyup",up);
return button;
}

/* A glass button with an icon and a label (the label hides on narrow phones). */
function makeGlassButton(href,label,icon){
var a=el("a","m-glass-btn");
a.href=href;
a.setAttribute("aria-label",label);
a.innerHTML='<span class="m-glass-face">'+icon+'<span class="m-glass-text">'+label+'</span></span>';
return glassButton(a);
}

var ICON_LOG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v4l3 2"/><path d="M3.05 11a9 9 0 1 1 .5 4"/><path d="M3 4v5h5"/></svg>';


function footer(){
var f=el("footer","m-footer glass");
f.innerHTML=
'<span>&copy; 1996&ndash;1998 The Phyrrian Astral Federation &middot; Hosted by <a href="'+new URL("ZapadTelecom/",modernRoot).href+'">ZapadTelecom&copy;</a></span>'+
'<span class="m-footer-links"><a href="'+new URL("Doctrines/",modernRoot).href+'">Doctrines</a><a href="'+new URL("About/",modernRoot).href+'">About</a><a href="'+new URL("UpdateLogs/",modernRoot).href+'">Update Logs</a></span>'+
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

/* ---------- Shared building blocks ---------- */

/* The member nation pages, by the id of their section on the classic main page. */
var NATION_PAGES={astralyia:"Astralyia/",zpr:"ZPR/",rendale:"Rendale/"};

function modernHref(path){return new URL(path,modernRoot).href;}

/*
 * The facts of a nation or project: every "<b>Label:</b> value" line of
 * a classic .nation-info block becomes a row; other lines become text.
 * Returns {facts, notes}.
 */
function factsFrom(info){
var facts=el("dl","m-facts");
var notes=[];
if(info)info.querySelectorAll(":scope > p").forEach(function(p){
var label=p.querySelector("b");
if(!label||p.firstElementChild!==label){notes.push(el("p","m-muted",p.innerHTML));return;}
var name=text(label).replace(/:$/,"");
label.remove();
var item=el("div");
item.appendChild(el("dt",null,escapeText(name)));
var dd=el("dd",null,p.innerHTML.trim());
var tone=relationTone(name,text(dd));
if(tone)dd.innerHTML='<span class="m-tone m-tone-'+tone+'">'+dd.innerHTML+'</span>';
item.appendChild(dd);
facts.appendChild(item);
});
return {facts:facts,notes:notes};
}

/* A colour for a relation or status, so they can be read at a glance. */
function relationTone(label,value){
if(!/relation|status/i.test(label))return null;
var v=value.toLowerCase();
if(/excellent/.test(v))return "excellent";
if(/positive/.test(v))return "positive";
if(/^good/.test(v))return "good";
if(/neutral/.test(v))return "neutral";
if(/hostile|war|enemy|poor|bad/.test(v))return "hostile";
if(/dissolved|none/.test(v))return "none";
if(/member nation/.test(v))return "member";
if(/complete/.test(v))return "good";
if(/progress|construction/.test(v))return "neutral";
return null;
}

/* A member nation as a glass card (main page and Nations page). */
function nationCard(section,base){
var nation=adopt(section,base);
var href=NATION_PAGES[section.id]?modernHref(NATION_PAGES[section.id]):null;
var card=el("article","m-card glass m-nation");
var head=el("div","m-nation-head");
var img=nation.querySelector("img");
if(img)head.appendChild(img);
head.appendChild(el("h3",null,escapeText(text(nation.querySelector(".nation-name")))));
card.appendChild(head);
var info=factsFrom(nation.querySelector(".nation-info"));
info.notes.forEach(function(n){card.appendChild(n);});
card.appendChild(info.facts);
if(href){
var more=el("a","m-card-more","View profile <span aria-hidden=\"true\">&rarr;</span>");
more.href=href;
card.appendChild(more);
}
return card;
}

/* The big panel at the top of a page. "image" is an optional roundel or flag. */
function heroPanel(eyebrow,title,lead,image){
var hero=el("section","m-hero glass"+(image?" m-hero-with-art":""));
hero.innerHTML='<div class="m-hero-orb" aria-hidden="true"></div>';
var copy=el("div","m-hero-copy");
copy.appendChild(el("span","m-eyebrow",eyebrow));
copy.appendChild(el("h1",null,escapeText(title)));
if(lead){
var p=el("p","m-lead");
if(typeof lead==="string")p.innerHTML=lead;else p.appendChild(lead);
copy.appendChild(p);
}
hero.appendChild(copy);
if(image){
var art=el("div","m-hero-art");
art.appendChild(image);
hero.appendChild(art);
}
return hero;
}

function sectionWithHead(title,extra){
var section=el("section","m-section");
var head=el("div","m-section-head");
head.appendChild(el("h2",null,title));
if(extra)head.appendChild(extra);
section.appendChild(head);
return section;
}

/* A classic .notice (a Ministry assessment, a citizens' note) as a glass callout. */
function calloutFrom(notice,tone){
var copy=notice.cloneNode(true);
var bold=copy.querySelector("b");
var label=bold?text(bold).replace(/:$/,""):"";
if(bold)bold.remove();
var box=el("div","m-callout glass"+(tone?" m-callout-"+tone:""));
box.innerHTML='<span class="m-callout-icon" aria-hidden="true">'+(tone==="info"?"i":"!")+'</span>';
var body=el("div","m-callout-body");
if(label)body.appendChild(el("span","m-callout-label",escapeText(label.charAt(0)+label.slice(1).toLowerCase())));
body.appendChild(el("p",null,copy.innerHTML.trim()));
box.appendChild(body);
return box;
}

/*
 * The rest of a classic section as a glass card: headings, paragraphs and
 * lists keep their order. Notices become callouts, and old-style windows
 * (like the ZapadTV(c) anthem player) become a glass panel with a caption.
 */
function proseCard(section,base,options){
options=options||{};
var copy=adopt(section,base);
copy.querySelectorAll(":scope > h2").forEach(function(h){h.remove();});
var card=el("div","m-card glass m-prose");
if(options.title)card.appendChild(el("h2",null,options.title));
Array.prototype.slice.call(copy.childNodes).forEach(function(node){
if(node.nodeType!==1){return;}
if(node.classList.contains("notice")){card.appendChild(calloutFrom(node,"info"));return;}
if(node.classList.contains("window")){
var panel=el("figure","m-media");
var caption=text(node.querySelector(".title-bar-text"));
var body=node.querySelector(".window-body");
if(body)Array.prototype.slice.call(body.childNodes).forEach(function(c){panel.appendChild(c);});
if(caption)panel.appendChild(el("figcaption",null,escapeText(caption)));
card.appendChild(panel);
return;
}
card.appendChild(node);
});
return card;
}

/* "Related" links as a row of glass chips. */
function relatedChips(section,base){
if(!section)return null;
var copy=adopt(section,base);
var links=copy.querySelectorAll("li > a, li > .soon-link");
if(!links.length)return null;
var wrap=sectionWithHead("Related");
var row=el("div","m-chips");
links.forEach(function(a){
a.classList.add("m-chip");
row.appendChild(a);
});
wrap.appendChild(row);
return wrap;
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
grid.appendChild(nationCard(n,home.url));
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

/*
 * Stories in two independent columns (newest first, left then right),
 * so opening one only pushes down the stories under it. On narrow
 * screens they become one column in reading order.
 */
var columnSets=[];

function storyColumns(cards){
var box=el("div","m-columns");
box.cards=cards;
columnSets.push(box);
arrangeColumns(box);
return box;
}

function arrangeColumns(box){
var count=window.innerWidth>860?2:1;
if(box.count===count)return;
box.count=count;
box.innerHTML="";
var cols=[];
for(var i=0;i<count;i++){cols.push(el("div","m-column"));box.appendChild(cols[i]);}
box.cards.forEach(function(card,i){cols[i%count].appendChild(card);});
}

window.addEventListener("resize",function(){
columnSets=columnSets.filter(function(box){return document.body.contains(box);});
columnSets.forEach(arrangeColumns);
});

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
top.appendChild(storyColumns(important.map(function(a){return storyCard(a,r.url,true,false);})));
main.appendChild(top);
}

var all=el("section","m-section");
all.innerHTML='<div class="m-section-head"><h2>Latest Stories</h2><span class="m-small">'+articles.length+' stories</span></div>';
var rest=Array.prototype.filter.call(articles,function(a){return !a.classList.contains("news-important");});
all.appendChild(storyColumns(rest.map(function(a){return storyCard(a,r.url,false,false);})));
main.appendChild(all);
}).catch(function(){if(token===renderToken)failed(main);});
}

/* ---------- Classic sub-pages ---------- */

/*
 * Splits a card's content into blocks that each start with an <h3>
 * (a doctrine, a group of members, a version...). Two or more blocks
 * are laid out side by side as smaller glass panels.
 */
function arrangeBlocks(card){
var nodes=Array.prototype.slice.call(card.children);
var blocks=[],current=null,lead=[];
nodes.forEach(function(node){
if(node.tagName==="H2")return;
if(node.tagName==="H3"){current=[node];blocks.push(current);return;}
if(current)current.push(node);else lead.push(node);
});
if(blocks.length<2)return;
var grid=el("div","m-blocks"+(blocks.length===2?" m-blocks-2":""));
blocks.forEach(function(block){
var panel=el("div","m-block");
block.forEach(function(n){panel.appendChild(n);});
grid.appendChild(panel);
});
/* Paragraphs after the last block that don't belong to it (a closing line) stay below. */
var last=blocks[blocks.length-1];
var tail=[];
while(last.length>2&&last[last.length-1].tagName==="P"&&last[last.length-2].tagName!=="H3"&&last[last.length-2].tagName==="UL"){tail.unshift(last.pop());}
card.appendChild(grid);
tail.forEach(function(n){grid.parentNode.appendChild(n);});
}

/* The classic page's own sections, in order, skipping the general introduction and "Related". */
function pageSections(doc){
return Array.prototype.filter.call(doc.querySelectorAll(".webpage > section"),function(s){
if(s.id==="related"||s.classList.contains("page-intro"))return false;
if(s.id==="information"&&/^InterPhyr is the official information service/.test(text(s.querySelector("p"))))return false;
return true;
});
}

/* A nation, project or office with its own heading (roundel, name, facts). */
function profileCard(block,base,options){
options=options||{};
var copy=adopt(block,base);
var card=el("article","m-card glass m-profile");
if(!options.noHead){
var head=el("div","m-nation-head");
var img=copy.querySelector(".nation-heading img");
if(img)head.appendChild(img);
var name=copy.querySelector(".nation-name");
var h=el("h3");
if(name)h.innerHTML=name.innerHTML;
head.appendChild(h);
card.appendChild(head);
}else if(options.title){
card.appendChild(el("h2",null,options.title));
}
var info=factsFrom(copy.querySelector(".nation-info"));
card.appendChild(info.facts);
info.notes.forEach(function(n){card.appendChild(n);});
copy.querySelectorAll(":scope > .notice").forEach(function(n){card.appendChild(calloutFrom(n,"info"));});
return card;
}

/* The Ministry's notices at the top of a section (archived pages, citizens' notes). */
function topNotices(section,base,main){
adopt(section,base).querySelectorAll(":scope > .archived-notice, :scope > .notice").forEach(function(n){
var box=calloutFrom(n,n.classList.contains("archived-notice")?"archived":"info");
box.classList.add("m-section");
main.appendChild(box);
});
}

/* Re-draws the current page in place (after registering a nation, for example). */
function redraw(){
var page=currentPage;
mainEl.classList.add("m-leaving");
var ready=new Promise(function(resolve){setTimeout(resolve,reducedMotion()?0:220);});
render(page,ready);
}

/*
 * Outside Relations is for member nations only. Visitors who haven't
 * registered a nation yet can do it here (it is the same registration
 * as the classic site); other nations see the classic "blocked" line.
 */
function relationsGate(main){
enter(main);
if(registeredNation()){
var box=el("div","m-notice glass");
box.appendChild(el("h1",null,"This page is blocked in your region"));
main.appendChild(box);
return;
}
var card=el("form","m-notice glass m-register");
card.noValidate=true;
card.innerHTML=
'<span class="m-eyebrow">ZapadTelecom&copy; Nation Registration</span>'+
'<h1>Which nation are you from?</h1>'+
'<p class="m-muted">Outside Relations is only available to the member nations of the Phyrrian Astral Federation. Register your nation with ZapadTelecom&copy; to continue.</p>'+
'<label class="m-field"><span>Nation name</span><input type="text" autocomplete="off" autocapitalize="words" spellcheck="false" required></label>'+
'<p class="m-form-error" role="alert"></p>'+
'<div class="m-actions"><button type="submit" class="m-btn m-btn-primary">Register</button></div>'+
'<p class="m-small">Your registered nation is stored on this computer for future ZapadTelecom&copy; connections, on InterPhyr Modern and the classic site.</p>';
var input=card.querySelector("input");
card.addEventListener("submit",function(event){
event.preventDefault();
var name=input.value.trim();
if(!name){card.querySelector(".m-form-error").textContent="Please enter the name of your nation.";input.focus();return;}
var result=registerNation(name);
if(result==="blocked"){blockedNotice();return;}
redraw();
});
main.appendChild(card);
setTimeout(function(){try{input.focus({preventScroll:true});}catch(e){}},400);
}

function blockedNotice(){
notice("This page is blocked in your region","Due to geopolitical reasons, InterPhyr.net cannot be accessed from the registered region.");
}

/* Overview of the member nations (Modern's own page, built from the classic main page). */
function renderNations(main,token,ready){
Promise.all([fetchClassic("index.html"),fetchClassic("Doctrines/index.html"),ready]).then(function(results){
if(takenOver()||token!==renderToken)return;
var home=results[0],doctrines=results[1];
enter(main);
var sections=home.doc.querySelectorAll("section.nation");
var names=Array.prototype.map.call(sections,function(s){return text(s.querySelector(".nation-name"));});
var since=text(home.doc.querySelector(".nations-table tbody td:last-child"))||"1996";
var lead=names.length?names.slice(0,-1).join(", ")+(names.length>1?" and ":"")+names[names.length-1]+": the member nations of the Phyrrian Astral Federation since "+since+".":"";
main.appendChild(heroPanel("The Phyrrian Astral Federation","Member Nations",escapeText(lead)));
var section=el("section","m-section");
var grid=el("div","m-grid m-grid-3");
sections.forEach(function(s){grid.appendChild(nationCard(s,home.url));});
section.appendChild(grid);
main.appendChild(section);

var info=doctrines.doc.querySelector("#information p");
var doc=sectionWithHead("Doctrines");
var card=el("div","m-card glass m-cta");
if(info)card.appendChild(el("p","m-muted",info.innerHTML));
var go=el("a","m-btn m-btn-primary","Read about the doctrines");
go.href=modernHref("Doctrines/");
card.appendChild(go);
doc.appendChild(card);
main.appendChild(doc);
}).catch(function(){if(token===renderToken)failed(main);});
}

/*
 * A member nation's page, or an Outside Relations nation's page:
 * the roundel or flag and name at the top, then the profile, then
 * the page's other sections (members, doctrines, the anthem...).
 */
function renderProfilePage(main,token,ready,path,outside){
Promise.all([fetchClassic(path+"index.html"),ready]).then(function(results){
if(takenOver()||token!==renderToken)return;
if(outside&&!seesRelations()){relationsGate(main);return;}
var r=results[0],doc=r.doc;
enter(main);
var profile=doc.querySelector("#nation-profile");
var copy=profile?adopt(profile,r.url):null;
var img=copy?copy.querySelector(".nation-heading img"):null;
var name=copy?text(copy.querySelector(".nation-name")):text(doc.querySelector("h2"));
var leadNode=outside?doc.querySelector("#information > p"):(copy?Array.prototype.filter.call(copy.querySelectorAll(".nation-info p"),function(p){return !p.querySelector("b");})[0]:null);
main.appendChild(heroPanel(outside?"Outside Relations":"Member nation",name,leadNode?leadNode.innerHTML:"",img));
var information=doc.querySelector("#information");
if(information)topNotices(information,r.url,main);
pageSections(doc).forEach(function(section){
if(section.id==="information")return;
if(section===profile){
var s=sectionWithHead("Profile");
var card=profileCard(profile,r.url,{noHead:true});
/* The line already shown at the top ("Member of the ...") isn't repeated. */
if(leadNode)card.querySelectorAll(":scope > p.m-muted").forEach(function(p){if(text(p)===text(leadNode))p.remove();});
s.appendChild(card);
main.appendChild(s);
return;
}
if(section.id==="report-lie"){main.appendChild(reportSection(section,r.url));return;}
var titled=sectionWithHead(escapeText(text(section.querySelector("h2"))));
if(section.id)titled.id=section.id;
var card=proseCard(section,r.url);
arrangeBlocks(card);
titled.appendChild(card);
main.appendChild(titled);
});
var related=relatedChips(doc.querySelector("#related"),r.url);
if(related)main.appendChild(related);
}).catch(function(){if(token===renderToken)failed(main);});
}

/* Doctrines: the three profiles side by side, then the glossary. */
function renderDoctrines(main,token,ready){
Promise.all([fetchClassic("Doctrines/index.html"),ready]).then(function(results){
if(takenOver()||token!==renderToken)return;
var r=results[0],doc=r.doc;
enter(main);
var info=doc.querySelector("#information p");
main.appendChild(heroPanel("Political &amp; Economic Profiles","Doctrines",info?info.innerHTML:""));
var profiles=doc.querySelectorAll("#nation-profile .nation");
if(profiles.length){
var s=sectionWithHead(escapeText(text(doc.querySelector("#nation-profile h2"))));
var grid=el("div","m-grid m-grid-3");
profiles.forEach(function(p){grid.appendChild(profileCard(p,r.url));});
s.appendChild(grid);
main.appendChild(s);
}
var glossary=doc.querySelector("#explainer");
if(glossary){
var g=sectionWithHead(escapeText(text(glossary.querySelector("h2"))));
var card=proseCard(glossary,r.url);
arrangeBlocks(card);
g.appendChild(card);
main.appendChild(g);
}
var related=relatedChips(doc.querySelector("#related"),r.url);
if(related)main.appendChild(related);
}).catch(function(){if(token===renderToken)failed(main);});
}

/* Outside Relations: one glass card per nation, with its relation to the Federation. */
function renderRelations(main,token,ready){
Promise.all([fetchClassic("Relations/index.html"),ready]).then(function(results){
if(takenOver()||token!==renderToken)return;
if(!seesRelations()){relationsGate(main);return;}
var r=results[0],doc=r.doc;
enter(main);
var info=doc.querySelector("#information p");
main.appendChild(heroPanel("Ministry of Outside Relations","Outside Relations",info?info.innerHTML:""));
var table=doc.querySelector(".relations-table");
var heads=table?Array.prototype.map.call(table.querySelectorAll("thead th"),text):[];
var s=sectionWithHead(escapeText(text(doc.querySelector("#nation-profile h2"))));
var grid=el("div","m-grid m-grid-3");
if(table)adopt(table,r.url).querySelectorAll("tbody tr").forEach(function(tr){
var cells=tr.querySelectorAll("td");
if(cells.length<4)return;
var link=cells[1].querySelector("a");
var card=el(link?"a":"div","m-card glass m-relation");
if(link)card.href=link.href;
var head=el("div","m-nation-head");
var img=cells[0].querySelector("img");
if(img)head.appendChild(img);
else head.appendChild(el("span","m-noflag","No flag<br>on file"));
var nameBox=el("div");
nameBox.appendChild(el("h3",null,escapeText(link?text(link):text(cells[1]))));
var extra=Array.prototype.filter.call(cells[1].childNodes,function(n){return n!==link&&text(n.nodeType===1?n:{textContent:n.textContent});});
if(extra.length)nameBox.appendChild(el("span","m-small",escapeText(extra.map(function(n){return n.textContent;}).join(" ").trim())));
head.appendChild(nameBox);
card.appendChild(head);
var facts=el("dl","m-facts");
[2,3].forEach(function(i){
var row=el("div");
row.appendChild(el("dt",null,escapeText(heads[i]||"")));
var tone=relationTone(heads[i]||"Relation",text(cells[i]));
row.appendChild(el("dd",null,tone?'<span class="m-tone m-tone-'+tone+'">'+cells[i].innerHTML+'</span>':cells[i].innerHTML));
facts.appendChild(row);
});
card.appendChild(facts);
grid.appendChild(card);
});
s.appendChild(grid);
main.appendChild(s);
var related=relatedChips(doc.querySelector("#related"),r.url);
if(related)main.appendChild(related);
}).catch(function(){if(token===renderToken)failed(main);});
}

/* Projects: one glass card per project. */
function renderProjects(main,token,ready){
Promise.all([fetchClassic("Projects/index.html"),ready]).then(function(results){
if(takenOver()||token!==renderToken)return;
var r=results[0],doc=r.doc;
enter(main);
var info=doc.querySelector("#information p");
main.appendChild(heroPanel("The Phyrrian Astral Federation","Projects",info?info.innerHTML:""));
var s=sectionWithHead(escapeText(text(doc.querySelector("#nation-profile h2"))));
var grid=el("div","m-grid m-grid-2");
doc.querySelectorAll("#nation-profile .nation").forEach(function(p){grid.appendChild(profileCard(p,r.url));});
s.appendChild(grid);
main.appendChild(s);
var related=relatedChips(doc.querySelector("#related"),r.url);
if(related)main.appendChild(related);
}).catch(function(){if(token===renderToken)failed(main);});
}

/* ZapadTelecom(c) and About: the first section becomes the top panel, the rest follow. */
function renderInfoPage(main,token,ready,path,eyebrow,title){
Promise.all([fetchClassic(path+"index.html"),ready]).then(function(results){
if(takenOver()||token!==renderToken)return;
var r=results[0],doc=r.doc;
enter(main);
var sections=pageSections(doc);
var first=sections.shift();
if(first){
var copy=adopt(first,r.url);
var img=copy.querySelector(":scope > img, :scope > p > img");
var paragraphs=Array.prototype.filter.call(copy.querySelectorAll(":scope > p"),function(p){return !p.querySelector("img");});
var lead=paragraphs.shift();
main.appendChild(heroPanel(eyebrow,title||text(copy.querySelector("h2")),lead?lead.innerHTML:"",img));
if(paragraphs.length){
var more=el("div","m-card glass m-prose m-section");
paragraphs.forEach(function(p){more.appendChild(p);});
main.appendChild(more);
}
}
sections.forEach(function(section){
var titled=sectionWithHead(escapeText(text(section.querySelector("h2"))));
if(section.id)titled.id=section.id;
if(section.querySelector(".nation-heading")){
titled.appendChild(profileCard(section,r.url));
}else{
var card=proseCard(section,r.url);
arrangeBlocks(card);
titled.appendChild(card);
}
main.appendChild(titled);
});
var related=relatedChips(doc.querySelector("#related"),r.url);
if(related)main.appendChild(related);
}).catch(function(){if(token===renderToken)failed(main);});
}

/*
 * The "Report a Swisslandian Lie" form, in glass. Like the classic one,
 * it doesn't send anything: it thanks the citizen with a report number.
 */
function reportSection(section,base){
var copy=adopt(section,base);
var wrap=sectionWithHead(escapeText(text(copy.querySelector("h2"))));
if(section.id)wrap.id=section.id;
var card=el("div","m-card glass m-prose");
copy.querySelectorAll(":scope > p:not(.small)").forEach(function(p){card.appendChild(p.cloneNode(true));});
var classicForm=copy.querySelector("form");
if(classicForm){
var form=el("form","m-form");
form.noValidate=true;
var options=Array.prototype.map.call(classicForm.querySelectorAll("select option"),function(o){return '<option>'+escapeText(text(o))+'</option>';}).join("");
var radios=Array.prototype.map.call(classicForm.querySelectorAll('input[type="radio"]'),function(input,i){
var label=classicForm.querySelector('label[for="'+input.id+'"]');
return '<label class="m-choice"><input type="radio" name="m-certainty" value="'+escapeText(input.value)+'"'+(i===0?" checked":"")+'><span>'+escapeText(text(label))+'</span></label>';
}).join("");
var labels=classicForm.querySelectorAll("label");
function labelFor(id){var l=classicForm.querySelector('label[for="'+id+'"]');return l?escapeText(text(l).replace(/:$/,"")):"";}
var legend=text(classicForm.querySelector("legend"));
form.innerHTML=
'<label class="m-field"><span>'+labelFor("report-nation")+'</span><input type="text" readonly class="m-report-nation"></label>'+
'<label class="m-field"><span>'+labelFor("report-source")+'</span><select class="m-report-source">'+options+'</select></label>'+
'<label class="m-field"><span>'+labelFor("report-text")+'</span><textarea rows="4" class="m-report-text" placeholder="'+escapeText(classicForm.querySelector("textarea").getAttribute("placeholder")||"")+'"></textarea></label>'+
'<fieldset class="m-field"><legend>'+escapeText(legend)+'</legend><div class="m-choices">'+radios+'</div></fieldset>'+
'<label class="m-check"><input type="checkbox" class="m-report-confirm"><span>'+labelFor("report-confirm")+'</span></label>'+
'<p class="m-form-error" role="alert"></p>'+
'<div class="m-actions"><button type="reset" class="m-btn">Clear</button><button type="submit" class="m-btn m-btn-primary">Send Report</button></div>';
var nation=form.querySelector(".m-report-nation");
function fill(){nation.value=isAdmin()?"ZapadTelecom© IT":(registeredNation()||"Unknown");}
fill();
form.addEventListener("reset",function(){form.querySelector(".m-form-error").textContent="";setTimeout(fill,0);});
form.addEventListener("submit",function(event){
event.preventDefault();
var error=form.querySelector(".m-form-error");
var lie=form.querySelector(".m-report-text");
var confirm=form.querySelector(".m-report-confirm");
error.textContent="";
if(lie.value.trim().length<10){error.textContent="Please describe the lie in a little more detail.";lie.focus();return;}
if(!confirm.checked){error.textContent="Please confirm that your report is truthful.";confirm.focus();return;}
var send=form.querySelector('button[type="submit"]');
send.disabled=true;send.textContent="Sending…";
setTimeout(function(){
var number="ZPR/PIM/RL/98-"+String(Math.floor(10000+Math.random()*90000));
var source=form.querySelector(".m-report-source").value;
var picked=form.querySelector('input[name="m-certainty"]:checked');
form.reset();
send.disabled=false;send.textContent="Send Report";
var box=el("div","m-dialog-body");
box.innerHTML=
'<img class="m-dialog-art" src="'+new URL("images/zaptel-ministry-logo.webp",siteRoot).href+'" alt="People\'s Information Ministry">'+
'<span class="m-eyebrow">People\'s Information Ministry</span>'+
'<h2>Report received</h2>'+
'<p class="m-muted">Thank you, citizen. Your report has been received by the People\'s Information Ministry.</p>'+
'<dl class="m-facts"><div><dt>Report No.</dt><dd>'+number+'</dd></div><div><dt>Source</dt><dd>'+escapeText(source)+'</dd></div><div><dt>Certainty</dt><dd>'+escapeText(picked?picked.value:"Certain")+'</dd></div><div><dt>Status</dt><dd>Forwarded to the Ministry</dd></div></dl>'+
'<p class="m-small">The truth thanks you for your vigilance.</p>'+
'<div class="m-actions"><button type="button" class="m-btn m-btn-primary" data-close>OK</button></div>';
openDialog(box);
},900);
});
card.appendChild(form);
}
copy.querySelectorAll(":scope > p.small").forEach(function(p){card.appendChild(p.cloneNode(true));});
wrap.appendChild(card);
return wrap;
}

/*
 * ---------- Glass dialogs ----------
 *
 * A glass panel over the page (the page behind dims and softens). It
 * rises in and settles, and sinks away when closed, never just appearing.
 * Escape, the backdrop and any [data-close] button close it.
 */
function openDialog(content,options){
options=options||{};
var backdrop=el("div","m-dialog-backdrop"+(options.tone?" m-dialog-"+options.tone:""));
var panel=el("div","m-dialog glass");
panel.setAttribute("role",options.alert?"alertdialog":"dialog");
panel.setAttribute("aria-modal","true");
panel.appendChild(content);
backdrop.appendChild(panel);
document.body.appendChild(backdrop);
var closed=false;
function close(){
if(closed)return;
closed=true;
document.removeEventListener("keydown",onKey);
backdrop.classList.remove("open");
backdrop.classList.add("closing");
setTimeout(function(){backdrop.remove();if(options.onClose)options.onClose();},reducedMotion()?0:260);
}
function onKey(event){if(event.key==="Escape"&&options.dismissable!==false)close();}
document.addEventListener("keydown",onKey);
backdrop.addEventListener("click",function(event){
if(event.target===backdrop&&options.dismissable!==false)close();
if(event.target.closest&&event.target.closest("[data-close]"))close();
});
requestAnimationFrame(function(){requestAnimationFrame(function(){backdrop.classList.add("open");});});
var focus=panel.querySelector("[data-focus]")||panel.querySelector("button");
if(focus)setTimeout(function(){try{focus.focus({preventScroll:true});}catch(e){}},50);
return {close:close,panel:panel,backdrop:backdrop};
}

/* ---------- Update Logs ---------- */

/* Every version, newest first, read from the classic Update Logs page. */
function renderUpdates(main,token,ready){
Promise.all([fetchClassic("UpdateLogs/index.html"),ready]).then(function(results){
if(takenOver()||token!==renderToken)return;
var r=results[0];
enter(main);

var hero=el("section","m-hero glass");
hero.innerHTML=
'<div class="m-hero-orb" aria-hidden="true"></div>'+
'<span class="m-eyebrow">InterPhyr.net</span>'+
'<h1>Update Logs</h1>'+
'<p class="m-lead">Every change to InterPhyr Modern, newest first.</p>';
main.appendChild(hero);

var list=el("section","m-section m-log");
r.doc.querySelectorAll(".log-entry").forEach(function(entry){
var heading=entry.querySelector("h3");
if(!heading)return;
var date=heading.querySelector(".log-date");
var dateText=text(date);
if(date)date.remove();
var card=el("article","m-card glass m-log-entry");
var head=el("div","m-log-head");
head.appendChild(el("h3",null,escapeText(text(heading))));
if(dateText)head.appendChild(el("span","m-log-date",escapeText(dateText)));
card.appendChild(head);
/* Only the changes to InterPhyr Modern (the classic site has its own log). */
var items=Array.prototype.filter.call(adopt(entry,r.url).querySelectorAll("li"),function(li){return /Modern/.test(li.textContent);});
if(!items.length)return;
var ul=el("ul","m-log-items");
items.forEach(function(li){
var html=li.innerHTML.replace(/^\s*InterPhyr Modern:\s*/,"");
ul.appendChild(el("li",null,html.charAt(0).toUpperCase()+html.slice(1)));
});
card.appendChild(ul);
list.appendChild(card);
});
main.appendChild(list);
}).catch(function(){if(token===renderToken)failed(main);});
}

function escapeText(s){
return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
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
var rows=el("div","m-menu-items");
links.appendChild(rows);
NAV.forEach(function(item){
var row;
if(item.path==null||MODERN_PAGES.indexOf(item.path)<0){
row=el("span","m-menu-soon",item.label+" <small>soon</small>");
}else{
row=el("a",null,item.label);
row.href=new URL(item.path,modernRoot).href;
row.setAttribute("data-path",item.path);
if(item.path===navPathFor(page))row.className="active";
}
rows.appendChild(row);
});
box.appendChild(links);
document.body.appendChild(box);
menu={box:box,links:links,items:rows,lens:makeLens(links,rows,"y"),open:false,amount:0,anim:0,
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
var count=menu.items.children.length;
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
/* The lens fades in with the links. */
menu.links.style.setProperty("--lens-appear",Math.max(0,Math.min(1,(amount-0.5)/0.3)));
Array.prototype.forEach.call(menu.items.children,function(row,i){
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
/* Put the lens on the current page before the panel opens. */
if(open)menu.lens.place(itemFor(menu.items,navPathFor(currentPage)));
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
"News/":"The Zapadiyan Daily — InterPhyr",
"Nations/":"Member Nations — InterPhyr",
"ZPR/":"The Zapadiyan People's Republic — InterPhyr",
"Astralyia/":"The Astralyian Republic — InterPhyr",
"Rendale/":"The Kingdom of Rendale — InterPhyr",
"Doctrines/":"Doctrines — InterPhyr",
"Relations/":"Outside Relations — InterPhyr",
"Relations/Eisenreich/":"The Eisenreich — InterPhyr",
"Relations/Pancake/":"The Royal Kingdom of Pancake — InterPhyr",
"Relations/Swissland/":"Swissland — InterPhyr",
"Relations/Luminara/":"Luminara — InterPhyr",
"Relations/MerchantsUnion/":"Merchants' Union — InterPhyr",
"Relations/Frostborn/":"The Frostborn — InterPhyr",
"Projects/":"Projects — InterPhyr",
"Map/":"World Map — InterPhyr",
"Government/":"Government Access — InterPhyr",
"ZapadTelecom/":"ZapadTelecom© — InterPhyr",
"About/":"About InterPhyr.net — InterPhyr",
"UpdateLogs/":"Update Logs — InterPhyr"
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
var t=renderToken;
if(page==="News/")renderNews(mainEl,t,ready);
else if(page==="UpdateLogs/")renderUpdates(mainEl,t,ready);
else if(page==="Nations/")renderNations(mainEl,t,ready);
else if(page==="Doctrines/")renderDoctrines(mainEl,t,ready);
else if(page==="Relations/")renderRelations(mainEl,t,ready);
else if(page.indexOf("Relations/")===0)renderProfilePage(mainEl,t,ready,page,true);
else if(/^(ZPR|Astralyia|Rendale)\/$/.test(page))renderProfilePage(mainEl,t,ready,page,false);
else if(page==="Projects/")renderProjects(mainEl,t,ready);
else if(page==="ZapadTelecom/")renderInfoPage(mainEl,t,ready,page,"Hosting provider","ZapadTelecom©");
else if(page==="About/")renderInfoPage(mainEl,t,ready,page,"InterPhyr.net","About InterPhyr.net");
else if(page==="Map/")renderMap(mainEl,t,ready);
else if(page==="Government/")renderGovernment(mainEl,t,ready);
else renderHome(mainEl,t,ready);
}

function pageOf(url){
var path=url.pathname.slice(new URL(modernRoot).pathname.length).replace(/index\.html$/,"");
return MODERN_PAGES.indexOf(path)>=0?path:null;
}

function navigate(page,push){
if(page===currentPage)return;
currentPage=page;
if(push)history.pushState({page:page},"",new URL(page,modernRoot).href);
if(navItems)navItems.querySelectorAll(":scope > a").forEach(function(a){a.classList.toggle("active",a.getAttribute("data-path")===navPathFor(page));});
if(menu){
menu.items.querySelectorAll("a").forEach(function(a){a.classList.toggle("active",a.getAttribute("data-path")===navPathFor(page));});
/* In the phone menu, the lens slides to the new page first, then the menu melts shut. */
if(menu.open){
menu.lens.move(itemFor(menu.items,navPathFor(page)));
setTimeout(function(){setMenu(false);},reducedMotion()?0:480);
}
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

/*
 * "Read more" on news stories opens and closes smoothly (the story
 * slides open and shut) instead of jumping.
 */
function toggleStory(details){
var summary=details.querySelector("summary");
if(reducedMotion()){details.open=!details.open;return;}
if(details.animating)return;
details.animating=true;
var start=details.offsetHeight;
var opening=!details.open;
if(opening)details.open=true;
var end=opening?details.offsetHeight:summary.getBoundingClientRect().bottom-details.getBoundingClientRect().top;
details.style.overflow="hidden";
details.style.height=start+"px";
details.offsetHeight;
details.style.transition="height .45s cubic-bezier(.2,.8,.2,1)";
details.style.height=end+"px";
setTimeout(function(){
if(!opening)details.open=false;
details.style.transition="";
details.style.height="";
details.style.overflow="";
details.animating=false;
},460);
}

document.addEventListener("click",function(event){
var summary=event.target.closest&&event.target.closest(".m-more>summary");
if(!summary)return;
event.preventDefault();
toggleStory(summary.parentNode);
});

/* ---------- Start ---------- */

function start(){
if(takenOver())return;
var page=document.body.getAttribute("data-page")||"";
document.body.insertBefore(backdrop(),document.body.firstChild);
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
/* Swissland is blocked from the whole network, in any spelling. */
if(regionBlocked()){
blockedNotice();
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
