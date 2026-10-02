const KEY="memory_tool_prompts_v2";
const API_KEY="memory_tool_api";

function normalize(text){return String(text||"").toLowerCase().trim().replace(/\\s+/g," ")}
function getLocal(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
function setLocal(items){localStorage.setItem(KEY,JSON.stringify(items.slice(0,1000)))}
function api(){return localStorage.getItem(API_KEY)||""}
function isSecret(text){return /(password|passwd|api[_ -]?key|secret|token|private[_ -]?key)\\s*[:=]/i.test(text)}

async function savePrompt(prompt){
  prompt=String(prompt||"").trim();
  if(prompt.length<3)return{ok:false,error:"Промт слишком короткий."};
  if(isSecret(prompt))return{ok:false,error:"Похоже, в тексте есть секрет. Он не сохранён."};

  const normalized=normalize(prompt);
  const local=getLocal();
  const existing=local.find(x=>x.normalized_prompt===normalized);

  if(existing){
    existing.usage_count=(existing.usage_count||1)+1;
    existing.updated_at=new Date().toISOString();
  }else{
    local.unshift({
      id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),
      prompt,normalized_prompt:normalized,
      created_at:new Date().toISOString(),
      updated_at:new Date().toISOString(),
      usage_count:1
    });
  }
  setLocal(local);

  if(api()){
    try{
      const r=await fetch(api()+"/api/prompt-memory",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt})
      });
      if(!r.ok)throw new Error();
    }catch{document.getElementById("status").textContent="LOCAL + API OFFLINE"}
  }
  return{ok:true};
}

async function loadPrompts(){
  if(api()){
    try{
      const r=await fetch(api()+"/api/prompt-memory?limit=1000");
      if(r.ok){
        const data=await r.json();
        document.getElementById("status").textContent="API MEMORY";
        return data.prompts||[];
      }
    }catch{}
  }
  document.getElementById("status").textContent="LOCAL MEMORY";
  return getLocal();
}

async function deletePrompt(id){
  const local=getLocal().filter(x=>String(x.id)!==String(id));
  setLocal(local);
  if(api()){
    try{await fetch(api()+"/api/prompt-memory/"+encodeURIComponent(id),{method:"DELETE"})}catch{}
  }
}

async function render(){
  const list=document.getElementById("memoryList");
  const query=normalize(document.getElementById("searchInput").value);
  let items=await loadPrompts();
  if(query)items=items.filter(x=>normalize(x.prompt).includes(query));
  list.innerHTML=items.length?items.map(x=>`<article class="memory-item">
    <div><div class="memory-text">${escapeHtml(x.prompt)}</div>
    <div class="memory-meta">Использований: ${x.usage_count||1} · ${x.updated_at||x.created_at||""}</div></div>
    <button class="delete" data-id="${escapeHtml(String(x.id))}">Удалить</button>
  </article>`).join(""):'<p class="muted">Память пока пуста.</p>';
  list.querySelectorAll(".delete").forEach(b=>b.onclick=async()=>{await deletePrompt(b.dataset.id);render()});
}

function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}

document.querySelectorAll(".tab").forEach(tab=>tab.onclick=()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
 document.querySelectorAll(".tab-content").forEach(x=>x.classList.remove("active"));
 tab.classList.add("active");document.getElementById(tab.dataset.tab).classList.add("active");
 if(tab.dataset.tab==="memory")render();
});

document.getElementById("saveBtn").onclick=async()=>{
 const input=document.getElementById("promptInput"),msg=document.getElementById("saveMessage");
 const result=await savePrompt(input.value);
 msg.textContent=result.ok?"Промт сохранён.":"Ошибка: "+result.error;
 if(result.ok){input.value="";render()}
};

document.getElementById("refreshBtn").onclick=render;
document.getElementById("searchInput").oninput=render;

document.getElementById("apiSaveBtn").onclick=()=>{
 const value=document.getElementById("apiInput").value.trim().replace(/\\/$/,"");
 if(value)localStorage.setItem(API_KEY,value);else localStorage.removeItem(API_KEY);
 document.getElementById("status").textContent=value?"API MEMORY":"LOCAL MEMORY";
 render();
};

document.getElementById("apiInput").value=api();
window.PromptMemory={
 save:savePrompt,
 search:loadPrompts,
 delete:deletePrompt,
 clear:()=>{localStorage.removeItem(KEY);render()}
};

const incoming=new URLSearchParams(location.search).get("prompt");
if(incoming)savePrompt(incoming).then(render);
render();