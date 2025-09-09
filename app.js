
/*
  Static SPA for SAT questions.
  - Loads data/manifest.json and then chunk files (arrays of question objects).
  - Indexed search (simple) in a Web Worker (worker.js).
  - LocalStorage keeps 'starred' and 'history'.
*/

const state = {
  questions: [],
  filtered: [],
  pageSize: 10,
  page: 1,
  starred: new Set(JSON.parse(localStorage.getItem("starred") || "[]")),
  history: JSON.parse(localStorage.getItem("history") || "[]"),
  worker: null,
};

function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(()=> el.style.display = "none", 1600);
}

function saveStarred(){
  localStorage.setItem("starred", JSON.stringify(Array.from(state.starred)));
}

function saveHistory(){
  localStorage.setItem("history", JSON.stringify(state.history.slice(-200)));
}

async function loadManifest(){
  try{
    const res = await fetch("data/manifest.json", {cache:"reload"});
    if(!res.ok) throw new Error("manifest not found");
    return await res.json();
  }catch(e){
    // Fallback to sample
    return {version:1, chunks:[{path:"data/sample.json"}]};
  }
}

async function loadAllChunks(manifest){
  const arrays = [];
  for(const c of manifest.chunks){
    const res = await fetch(`data/${c.path}`);
    const arr = await res.json();
    arrays.push(...arr);
  }
  return arrays;
}

function mountFilters(){
  const q = document.getElementById("q");
  const f_module = document.getElementById("f_module");
  const f_domain = document.getElementById("f_domain");
  const f_diff = document.getElementById("f_diff");
  const reset = document.getElementById("resetBtn");

  function apply(){
    const text = q.value.trim().toLowerCase();
    const moduleV = f_module.value;
    const domainV = f_domain.value.trim().toLowerCase();
    const diffV = f_diff.value;

    let arr = state.questions.filter(x=>{
      if(moduleV && x.module !== moduleV) return false;
      if(domainV && !(x.primary_class_cd_desc||"").toLowerCase().includes(domainV)) return false;
      if(diffV && x.difficulty !== diffV) return false;
      return true;
    });

    if(text){
      arr = arr.filter(x=> (x.stem_html||"").toLowerCase().includes(text) || (x.skill_desc||"").toLowerCase().includes(text));
    }

    state.filtered = arr;
    state.page = 1;
    render();
  }

  q.addEventListener("input", apply);
  f_module.addEventListener("change", apply);
  f_domain.addEventListener("input", apply);
  f_diff.addEventListener("change", apply);
  reset.addEventListener("click", ()=>{
    q.value = ""; f_module.value=""; f_domain.value=""; f_diff.value="";
    apply();
  });

  // shortcuts
  window.addEventListener("keydown", (e)=>{
    if(e.key === "/"){ e.preventDefault(); q.focus(); }
    if(e.key.toLowerCase() === "r"){ shufflePractice(); }
    if(e.key.toLowerCase() === "s"){ showStarred(); }
  });
}

function paginate(arr){
  const start = (state.page-1)*state.pageSize;
  return arr.slice(start, start + state.pageSize);
}

function render(){
  const list = document.getElementById("results");
  list.innerHTML = "";
  const arr = paginate(state.filtered);
  arr.forEach(renderItem);

  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  document.getElementById("pageInfo").textContent = `${state.page} / ${totalPages}`;
}

function renderItem(q){
  const list = document.getElementById("results");
  const el = document.createElement("div");
  el.className = "item";

  const starOn = state.starred.has(q.uId);
  el.innerHTML = `
    <div class="meta">
      <span class="badge">${q.module === "math" ? "Math" : "Reading & Writing"}</span>
      <span class="badge">${q.primary_class_cd_desc || ""}</span>
      <span class="badge">Diff: ${{"E":"Easy","M":"Medium","H":"Hard"}[q.difficulty] || "—"}</span>
      <button class="button" data-star="${q.uId}">${starOn ? "★ Starred" : "☆ Star"}</button>
    </div>
    <div class="stem">${q.stem_html || ""}</div>
    ${Array.isArray(q.choices) ? `<div class="choices">${q.choices.map((c,i)=>`<div class="choice" data-i="${i}" data-id="${q.uId}">${c}</div>`).join("")}</div>` : ""}
    <details style="margin-top:10px">
      <summary>Show explanation</summary>
      <div class="explanation">${q.explanation_html || "<em>No explanation</em>"}</div>
    </details>
  `;

  // star handler
  el.querySelector(`[data-star="${q.uId}"]`).addEventListener("click", (e)=>{
    const id = q.uId;
    if(state.starred.has(id)){
      state.starred.delete(id);
    }else{
      state.starred.add(id);
    }
    saveStarred();
    render(); // refresh label
  });

  // choices handler
  el.querySelectorAll(".choice").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      const i = +btn.dataset.i;
      const correct = i === q.correct_choice_index;
      btn.classList.add(correct ? "correct" : "incorrect");
      state.history.push({id:q.uId, correct, ts:Date.now()});
      saveHistory();
      toast(correct ? "Correct ✅" : "Try again ❌");
    });
  });

  list.appendChild(el);
}

function shufflePractice(){
  // show 10 random items
  const arr = [...state.questions];
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  state.filtered = arr.slice(0, 10);
  state.page = 1;
  render();
}

function showStarred(){
  const ids = new Set(state.starred);
  state.filtered = state.questions.filter(x=> ids.has(x.uId));
  state.page = 1;
  render();
}

function mountPager(){
  document.getElementById("prevPage").addEventListener("click", ()=>{
    state.page = Math.max(1, state.page-1);
    render();
  });
  document.getElementById("nextPage").addEventListener("click", ()=>{
    const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
    state.page = Math.min(totalPages, state.page+1);
    render();
  });
  document.getElementById("shuffleBtn").addEventListener("click", shufflePractice);
  document.getElementById("reviewBtn").addEventListener("click", showStarred);
}

async function main(){
  mountFilters();
  mountPager();
  const manifest = await loadManifest();
  const items = await loadAllChunks(manifest);

  // Normalize required fields
  state.questions = items.map(x => ({
    uId: x.uId || x.id || x.questionId,
    questionId: x.questionId || x.id || x.uId,
    module: x.module || (x.category && x.category.toLowerCase().includes("math") ? "math" : "reading-writing"),
    primary_class_cd_desc: x.primary_class_cd_desc || x.domain || "",
    skill_cd: x.skill_cd || "",
    skill_desc: x.skill_desc || "",
    difficulty: x.difficulty || x.diff || "",
    score_band_range_cd: x.score_band_range_cd || x.band || null,
    stem_html: x.stem_html || x.stem || x.question_html || "",
    choices: x.choices || x.options || null,
    correct_choice_index: typeof x.correct_choice_index === "number" ? x.correct_choice_index : (typeof x.answer_index === "number" ? x.answer_index : null),
    explanation_html: x.explanation_html || x.explanation || ""
  })).filter(x=> !!x.uId);

  state.filtered = state.questions;
  render();
}

main();
