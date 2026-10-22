const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const demoVideos = [
 {id:1,title:"A peaceful escape into the mountains",creator:"Wander More",initial:"W",views:"128K views",time:"2 days ago",duration:"0:42",category:"shorts",tag:"TRAVEL",image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85",desc:"A beautiful mountain escape."},
 {id:2,title:"The beat that changes your mood",creator:"Sound District",initial:"S",views:"86K views",time:"5 hours ago",duration:"1:18",category:"music",tag:"MUSIC",image:"https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85",desc:"Music and moments."},
 {id:3,title:"Gaming setup goals in 30 seconds",creator:"Pixel Pilot",initial:"P",views:"214K views",time:"1 day ago",duration:"0:30",category:"gaming",tag:"GAMING",image:"https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=85",desc:"A colorful gaming setup."},
 {id:4,title:"Golden hour in the city",creator:"Mira Creates",initial:"M",views:"42K views",time:"3 days ago",duration:"0:56",category:"shorts",tag:"LIFESTYLE",image:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",desc:"City lights at golden hour."},
 {id:5,title:"Make your desk feel brand new",creator:"Simply Better",initial:"B",views:"19K views",time:"6 hours ago",duration:"3:24",category:"trending",tag:"CREATIVE",image:"https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85",desc:"A clean creative workspace."},
 {id:6,title:"Ocean waves to reset your mind",creator:"Blue Hour",initial:"B",views:"301K views",time:"1 week ago",duration:"0:48",category:"shorts",tag:"NATURE",image:"https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85",desc:"Relax by the sea."}
];
let videos = [...demoVideos], activeFilter="all", searchTerm="", saved = new Set(JSON.parse(localStorage.getItem("mc_saved")||"[]")), history = JSON.parse(localStorage.getItem("mc_history")||"[]");
let localObjectUrls = [];
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2400)}
function persistSaved(){localStorage.setItem("mc_saved",JSON.stringify([...saved]))}
function categoryName(cat){return ({shorts:"Shorts",music:"Music",gaming:"Gaming",trending:"Trending"})[cat]||"Video"}
function render(){
 const grid=$("#videoGrid"); grid.innerHTML="";
 let list=videos.filter(v=>{
  const matchesCategory=activeFilter==="all"|| (activeFilter==="saved"?saved.has(v.id):(activeFilter==="history"?history.includes(v.id):activeFilter==="trending"?(v.category==="trending"||parseInt(v.views)>100):v.category===activeFilter));
  const text=(v.title+" "+v.creator+" "+v.tag+" "+v.category).toLowerCase();
  return matchesCategory&&text.includes(searchTerm.toLowerCase());
 });
 $("#feedTitle").textContent=activeFilter==="saved"?"Saved videos":activeFilter==="history"?"Watch history":activeFilter==="all"?"Recommended for you":activeFilter==="trending"?"Trending now":categoryName(activeFilter);
 $("#emptyState").classList.toggle("hidden",list.length!==0);grid.classList.toggle("hidden",list.length===0);
 list.forEach(v=>{
  const card=document.createElement("article");card.className="video-card";
  card.innerHTML=`<div class="thumb-wrap" role="button" tabindex="0" aria-label="Play ${escapeHtml(v.title)}"><img src="${escapeAttr(v.image)}" alt="${escapeAttr(v.title)}" loading="lazy" onerror="this.style.opacity='.25'"><span class="category-tag">${escapeHtml(v.tag||categoryName(v.category).toUpperCase())}</span><span class="play-overlay">▶</span><span class="duration">${escapeHtml(v.duration||"NEW")}</span></div><div class="video-info"><div class="creator-avatar">${escapeHtml(v.initial||"M")}</div><div class="video-meta"><h3>${escapeHtml(v.title)}</h3><p>${escapeHtml(v.creator||"You")}<br>${escapeHtml(v.views||"New video")} · ${escapeHtml(v.time||"Just now")}</p></div><button class="video-options" aria-label="More options">⋮</button></div><div class="video-controls"><button class="mini-action ${saved.has(v.id)?"saved":""}" data-save="${v.id}">${saved.has(v.id)?"♥ Saved":"♡ Save"}</button><button class="mini-action" data-share="${v.id}">↗ Share</button></div>`;
  const thumb=$(".thumb-wrap",card);thumb.addEventListener("click",()=>playVideo(v));thumb.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();playVideo(v)}});
  $("[data-save]",card).addEventListener("click",e=>{e.stopPropagation();if(saved.has(v.id)){saved.delete(v.id);toast("Removed from saved videos")}else{saved.add(v.id);toast("Saved for later")}persistSaved();render()});
  $("[data-share]",card).addEventListener("click",async e=>{e.stopPropagation();const shareUrl=location.href.split("#")[0]+"#video-"+v.id;try{if(navigator.share)await navigator.share({title:v.title,text:"Watch on MoeenClips",url:shareUrl});else{await navigator.clipboard.writeText(shareUrl);toast("Video link copied")} }catch(err){toast("Share cancelled")}});
  $(".video-options",card).addEventListener("click",()=>toast("More video options coming soon"));grid.appendChild(card);
 });
 $$(".nav-item[data-filter],.chip[data-filter],.mobile-nav [data-filter]").forEach(b=>b.classList.toggle("active",b.dataset.filter===activeFilter));
}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s=""){return escapeHtml(s)}
function playVideo(v){
 const dialog=$("#playerDialog"),video=$("#playerVideo");$("#playerTitle").textContent=v.title;$("#playerNote").textContent=v.desc||"Video preview";
 if(v.fileUrl){video.src=v.fileUrl;video.poster=v.image||"";video.classList.remove("hidden")}else{video.removeAttribute("src");video.load();video.poster=v.image||"";$("#playerNote").textContent="This sample card uses a preview image. Upload a video to test full playback."}
 history=[v.id,...history.filter(id=>id!==v.id)].slice(0,50);localStorage.setItem("mc_history",JSON.stringify(history));dialog.showModal();
 if(v.fileUrl) video.play().catch(()=>{});
}
function openUpload(){ $("#uploadDialog").showModal() }
$("#searchForm").addEventListener("submit",e=>{e.preventDefault();searchTerm=$("#searchInput").value.trim();render()});
$("#searchInput").addEventListener("input",()=>{searchTerm=$("#searchInput").value.trim();render()});
$$("[data-filter]").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.filter;render();if(b.classList.contains("nav-item")){$$(".nav-item").forEach(n=>n.classList.remove("active"));b.classList.add("active")}}));
$("#exploreBtn").addEventListener("click",()=>$("#videoGrid").scrollIntoView({behavior:"smooth",block:"start"}));
["uploadOpen","heroUpload","bannerUpload","mobileUpload"].forEach(id=>$("#"+id).addEventListener("click",openUpload));
$("#uploadClose").addEventListener("click",()=>$("#uploadDialog").close());
$("#playerClose").addEventListener("click",()=>{const v=$("#playerVideo");v.pause();$("#playerDialog").close()});
$("#savedBtn").addEventListener("click",()=>{activeFilter="saved";render()});
$("#mobileSaved").addEventListener("click",()=>{activeFilter="saved";render()});
$("#historyBtn").addEventListener("click",()=>{activeFilter="history";render()});
$("#resetSearch").addEventListener("click",()=>{$("#searchInput").value="";searchTerm="";activeFilter="all";render()});
$("#themeBtn").addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("mc_theme",document.body.classList.contains("light")?"light":"dark")});
if(localStorage.getItem("mc_theme")==="light")document.body.classList.add("light");
$("#uploadForm").addEventListener("submit",e=>{
 e.preventDefault();const file=$("#videoFile").files[0],title=$("#videoTitle").value.trim(),category=$("#videoCategory").value;
 if(!title){$("#formMessage").textContent="Please enter a video title.";return}
 if(!file){$("#formMessage").textContent="Choose a video file first.";return}
 const fileUrl=URL.createObjectURL(file);localObjectUrls.push(fileUrl);
 const id=Date.now();videos.unshift({id,title,creator:"You",initial:"Y",views:"New upload",time:"Just now",duration:"LOCAL",category,tag:categoryName(category).toUpperCase(),image:"",fileUrl,desc:"A video uploaded from your device."});
 $("#uploadDialog").close();$("#uploadForm").reset();$("#formMessage").textContent="";activeFilter="all";searchTerm="";$("#searchInput").value="";render();toast("Added to this browser's demo feed");$("#videoGrid").scrollIntoView({behavior:"smooth"});
});
render();