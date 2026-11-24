import "./style.css";

const app = document.querySelector("#app");
const state = { targetType: "Website", target: "", purpose: "Understand architecture", notes: "", jobs: [] };

const types = ["Website", "Android APK", "JavaScript / Electron", ".NET application", "Firmware", "Native binary", "Database", "Network recording", "Other"];
const icons = {Website:"◫","Android APK":"▣","JavaScript / Electron":"⌘",".NET application":"◈",Firmware:"⌁","Native binary":"⬡",Database:"▤","Network recording":"⌁",Other:"＋"};

function render() {
  app.innerHTML = `
    <aside class="sidebar">
      <a class="brand" href="#"><span class="brand-mark">A</span><span>AURIX <b>REA</b><small>REVERSE ENGINEERING WORKSPACE</small></span></a>
      <div class="nav-label">WORKSPACE</div>
      <button class="nav active" data-view="overview"><span>◫</span> Overview</button>
      <button class="nav" data-view="investigations"><span>⌕</span> Investigations</button>
      <button class="nav" data-view="capabilities"><span>▦</span> Capabilities</button>
      <div class="sidebar-bottom"><div class="engine-dot"></div><div><strong>Engine not connected</strong><small>Worker setup required</small></div></div>
    </aside>
    <main class="main">
      <header class="topbar"><div><span class="eyebrow">AURIX INTELLIGENCE LAB</span><h1>Reverse engineering, <em>organized.</em></h1></div><div class="top-actions"><span class="status"><i></i> FRONTEND PREVIEW</span><div class="avatar">A</div></div></header>
      <section class="hero">
        <div class="hero-copy"><span class="pill">THE AURIX REA WORKSPACE</span><h2>Understand how<br/>technology <em>works.</em></h2><p>Start an authorized investigation. Organize evidence, understand system structure, and prepare a reconstruction workflow.</p><button class="primary" id="start-btn">＋ Start investigation <span>→</span></button></div>
        <div class="orb-wrap"><div class="orb"><div class="orb-core">REA</div><i class="orbit o1"></i><i class="orbit o2"></i><i class="orbit o3"></i></div><div class="orb-caption">ANALYSIS SYSTEM <b>STANDBY</b></div></div>
      </section>
      <section class="stats">
        <article><span class="stat-icon">⌕</span><div><small>INVESTIGATIONS</small><strong>${state.jobs.length.toString().padStart(2,"0")}</strong><p>Created in this session</p></div></article>
        <article><span class="stat-icon">◈</span><div><small>SUPPORTED TARGET TYPES</small><strong>09</strong><p>Requirements vary by target</p></div></article>
        <article><span class="stat-icon">◎</span><div><small>ENGINE STATUS</small><strong class="warning">Standby</strong><p>Secure worker not connected</p></div></article>
      </section>
      <section class="content-grid">
        <div class="panel" id="new-investigation">
          <div class="panel-head"><div><span class="eyebrow">NEW WORKFLOW</span><h3>Start an investigation</h3></div><span class="step">01 / INTAKE</span></div>
          <form id="investigation-form">
            <label>What are you examining?</label>
            <div class="type-grid">${types.map(t=>`<button type="button" class="type-card ${state.targetType===t?"selected":""}" data-type="${t}"><span>${icons[t]}</span><small>${t}</small></button>`).join("")}</div>
            <label for="target">Target reference</label><input id="target" placeholder="Paste a public URL or enter a local file name" value="${escapeHtml(state.target)}" required />
            <label for="purpose">Investigation goal</label><select id="purpose"><option>Understand architecture</option><option>Document components and dependencies</option><option>Assess compatibility for a rebuild</option><option>Analyze my own software for learning</option></select>
            <label for="notes">Extra context <span class="optional">OPTIONAL</span></label><textarea id="notes" rows="3" placeholder="What do you already know about this target?">${escapeHtml(state.notes)}</textarea>
            <label class="consent"><input type="checkbox" id="authorized" required /> I own this target or have permission to examine it.</label>
            <button class="primary submit" type="submit">Create investigation <span>→</span></button>
            <p class="form-note">Creating a record does not run analysis. Engine execution becomes available after a secure REA worker is connected.</p>
          </form>
        </div>
        <div class="right-column">
          <div class="panel engine-panel"><div class="panel-head"><div><span class="eyebrow">ENGINE CONNECTION</span><h3>REA runtime</h3></div><span class="tag amber">NOT CONNECTED</span></div><div class="engine-visual"><div class="engine-ring">REA</div><div><strong>Awaiting secure worker</strong><p>The dashboard is ready. The official REA runtime still needs a protected host and target-specific tools.</p></div></div><div class="check-row"><span>Dashboard interface</span><b class="ok">READY</b></div><div class="check-row"><span>Official REA runtime</span><b class="pending">PENDING</b></div><div class="check-row"><span>Authenticated job execution</span><b class="pending">PENDING</b></div><a class="text-link" href="https://github.com/morluto/rea" target="_blank" rel="noreferrer">View official REA project ↗</a></div>
          <div class="panel tip-panel"><span class="eyebrow">DESIGN PRINCIPLE</span><h3>Evidence before assumptions.</h3><p>AURIX REA is designed to separate observed facts, inferred behavior, and unknowns—so a reconstruction is based on evidence rather than guesswork.</p><div class="tip-line"><span>01</span> Inspect <span>02</span> Understand <span>03</span> Rebuild</div></div>
        </div>
      </section>
      <section class="panel jobs-panel"><div class="panel-head"><div><span class="eyebrow">RECENT ACTIVITY</span><h3>Investigation queue</h3></div><span class="tag">LOCAL SESSION</span></div><div id="jobs-list">${state.jobs.length?state.jobs.map(j=>`<div class="job-row"><span class="job-symbol">${icons[j.type]||"◫"}</span><div><strong>${escapeHtml(j.target)}</strong><small>${escapeHtml(j.type)} · ${escapeHtml(j.purpose)}</small></div><span class="tag amber">DRAFT — NOT RUN</span></div>`).join(""):'<div class="empty"><span>⌕</span><strong>No investigations yet</strong><p>Your created investigation records will appear here.</p></div>'}</div></section>
      <footer><span>© 2026 AURIX REA</span><span>UNDERSTAND · REVERSE ENGINEER · RECREATE</span></footer>
    </main>
    <div class="toast" id="toast" role="status"></div>`;
  bind();
}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function bind(){
  document.querySelectorAll("[data-type]").forEach(b=>b.addEventListener("click",()=>{state.targetType=b.dataset.type;render();}));
  document.querySelector("#start-btn").addEventListener("click",()=>document.querySelector("#target").focus());
  document.querySelector("#investigation-form").addEventListener("submit",e=>{
    e.preventDefault();
    state.target=document.querySelector("#target").value.trim();
    state.purpose=document.querySelector("#purpose").value;
    state.notes=document.querySelector("#notes").value.trim();
    if(!document.querySelector("#authorized").checked)return;
    state.jobs.unshift({type:state.targetType,target:state.target,purpose:state.purpose});
    render();
    const toast=document.querySelector("#toast");toast.textContent="Investigation record created. Analysis has not started because the REA worker is not connected.";toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),5000);
  });
  document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");const t=b.dataset.view;if(t==="investigations")document.querySelector(".jobs-panel").scrollIntoView({behavior:"smooth"});else if(t==="capabilities")document.querySelector(".engine-panel").scrollIntoView({behavior:"smooth"});else window.scrollTo({top:0,behavior:"smooth"});}));
}
render();
