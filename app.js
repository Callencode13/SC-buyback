fetch('ships.json').then(function(r){return r.json()}).then(function(SHIPS){
var KEY="sc-buyback-v1", SELKEY="sc-buyback-prices";
var mine={}, prices={};
try{mine=JSON.parse(localStorage.getItem(KEY)||"{}");prices=JSON.parse(localStorage.getItem(SELKEY)||"{}")}catch(e){}
var ships=SHIPS.slice();
Object.keys(prices).forEach(function(n){var s=find(n);if(s)s.price=prices[n]});
Object.keys(mine).forEach(function(n){if(!find(n))ships.push({name:n,maker:"Unknown",role:"Custom",size:"Medium",price:prices[n]||0})});
function find(n){n=n.toLowerCase();for(var i=0;i<ships.length;i++)if(ships[i].name.toLowerCase()===n)return ships[i]}
function save(){try{localStorage.setItem(KEY,JSON.stringify(mine));localStorage.setItem(SELKEY,JSON.stringify(prices))}catch(e){}}
var $=function(id){return document.getElementById(id)};
function fill(sel,vals){vals.filter(function(v,i,a){return a.indexOf(v)===i}).sort().forEach(function(v){var o=document.createElement("option");o.value=o.textContent=v;sel.appendChild(o)})}
function buildFilters(){
  $("maker").length=1;$("role").length=1;
  fill($("maker"),ships.map(function(s){return s.maker}));
  fill($("role"),ships.map(function(s){return s.role}));
}
function render(){
  var q=$("q").value.toLowerCase().split(/\s+/).filter(Boolean);
  var mk=$("maker").value,rl=$("role").value,sz=$("size").value,mx=parseFloat($("max").value),onlyMine=$("mine").checked;
  var list=ships.filter(function(s){
    var hay=(s.name+" "+s.maker+" "+s.role+" "+s.size).toLowerCase();
    return q.every(function(t){return hay.indexOf(t)>-1})&&(!mk||s.maker===mk)&&(!rl||s.role===rl)&&(!sz||s.size===sz)&&(isNaN(mx)||s.price<=mx)&&(!onlyMine||mine[s.name]);
  });
  var m=$("sort").value;
  list.sort(function(a,b){return m==="lo"?a.price-b.price:m==="hi"?b.price-a.price:a.name.localeCompare(b.name)});
  var g=$("grid");g.textContent="";
  list.forEach(function(s){
    var c=document.createElement("div");c.className="card"+(mine[s.name]?" on":"");
    var h=document.createElement("h3");h.textContent=s.name;
    var mm=document.createElement("div");mm.className="maker";mm.textContent=s.maker;
    var t=document.createElement("div");t.className="tags";
    [s.role,s.size].forEach(function(x){var sp=document.createElement("span");sp.className="tag";sp.textContent=x;t.appendChild(sp)});
    var p=document.createElement("div");p.className="price";p.textContent="$"+s.price;
    var b=document.createElement("button");b.textContent=mine[s.name]?"Remove from my list":"Add to my list";
    if(!mine[s.name])b.className="main";
    b.onclick=function(){if(mine[s.name])delete mine[s.name];else mine[s.name]=1;save();render()};
    c.append(h,mm,t,p,b);g.appendChild(c);
  });
  if(!list.length){var e=document.createElement("div");e.className="empty";e.textContent="No ships match. Clear a filter or try a different word.";g.appendChild(e)}
  $("count").textContent=list.length+" of "+ships.length+" ships";
  var tot=0;ships.forEach(function(s){if(mine[s.name])tot+=s.price});
  $("total").textContent="$"+tot.toLocaleString();
}
$("imp").onclick=function(){
  var lines=$("paste").value.split(/\n/),added=0;
  lines.forEach(function(l){
    var m=l.match(/^\s*(.+?)\s*[,\t|]\s*\$?\s*([\d.]+)\s*$/);
    if(!m)return;
    var n=m[1],p=parseFloat(m[2]),s=find(n);
    if(!s){s={name:n,maker:"Unknown",role:"Custom",size:"Medium",price:p};ships.push(s)}
    s.price=p;prices[s.name]=p;mine[s.name]=1;added++;
  });
  save();buildFilters();render();
  $("msg").textContent=added?added+" ships added to your list.":"Nothing added. Use one ship per line, like: Cutlass Black, 110";
  if(added)$("paste").value="";
};
$("clear").onclick=function(){mine={};save();render();$("msg").textContent="Your list is cleared."};
["q","maker","role","size","max","sort","mine"].forEach(function(id){$(id).addEventListener(id==="q"||id==="max"?"input":"change",render)});
buildFilters();render();
}).catch(function(){document.getElementById('grid').textContent='Could not load ships.json. If you opened the file directly, run a local server (see README).'});