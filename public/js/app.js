// ============================================================
// PHANTEX — App Logic
// ============================================================

const TYPES = [
  { id: "username", label: "Username",    icon: "◉", placeholder: "ex: john_doe",           desc: "Pseudo ou identifiant en ligne" },
  { id: "email",    label: "Email",       icon: "✉", placeholder: "ex: john@gmail.com",      desc: "Adresse email" },
  { id: "phone",    label: "Téléphone",   icon: "☎", placeholder: "ex: +33612345678",        desc: "Numéro de téléphone" },
  { id: "ip",       label: "IP/Domaine",  icon: "⊕", placeholder: "ex: 8.8.8.8 ou site.com", desc: "Adresse IP ou nom de domaine" },
  { id: "fullname", label: "Nom complet", icon: "◫", placeholder: "ex: Jean Dupont",         desc: "Prénom et nom complet" },
];

const RESOURCES = [
  { name: "OSINT Framework",   url: "https://osintframework.com",          desc: "Carte interactive de tous les outils OSINT gratuits",                    cat: "Référence" },
  { name: "OSINTOPIA",         url: "https://osintopia.fr",                desc: "Communauté francophone — challenges & enquêtes citoyennes",              cat: "Communauté FR" },
  { name: "OSINT-FR",          url: "https://osintfr.com",                 desc: "Association loi 1901 — Discord actif, events, projets humanitaires",      cat: "Communauté FR" },
  { name: "Bellingcat",        url: "https://bellingcat.com",              desc: "Techniques de vérification et investigations ouvertes",                  cat: "Méthodes" },
  { name: "IntelTechniques",   url: "https://inteltechniques.com",         desc: "Guides pratiques par Michael Bazzell (ex-FBI)",                          cat: "Formation" },
  { name: "TraceLabs",         url: "https://tracelabs.org",               desc: "CTF OSINT pour retrouver des personnes disparues",                       cat: "Pratique" },
  { name: "OSINT Curious",     url: "https://osintcurio.us",               desc: "Podcasts, workshops et veille outillage OSINT",                          cat: "Veille" },
  { name: "Have I Been Pwned", url: "https://haveibeenpwned.com",          desc: "Vérifier si un email a été compromis dans une fuite de données",         cat: "Outil" },
  { name: "Shodan",            url: "https://shodan.io",                   desc: "Moteur de recherche pour appareils connectés exposés sur Internet",      cat: "Outil" },
  { name: "Awesome OSINT",     url: "https://github.com/jivoi/awesome-osint", desc: "Liste GitHub exhaustive et maintenue de ressources OSINT",            cat: "Référence" },
];

let currentType = "username";
let searchHistory = [];
let searchCount = 0;

// ── Navigation ──────────────────────────────────────────────
function showView(view) {
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
  const navEl = document.getElementById("nav-" + view);
  if (navEl) navEl.classList.add("active");
  const main = document.getElementById("main-content");
  if (!main) return;
  const views = { search: renderSearch, history: renderHistory, learn: renderLearn, resources: renderResources };
  if (views[view]) views[view](main);
}

// ── Search view ─────────────────────────────────────────────
function renderSearch(c) {
  c.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-val" id="stat-count">${searchCount}</div><div class="stat-label">RECHERCHES</div></div>
      <div class="stat-card"><div class="stat-val" id="stat-types">${new Set(searchHistory.map((h) => h.type)).size || 0}</div><div class="stat-label">TYPES UTILISÉS</div></div>
      <div class="stat-card"><div class="stat-val">IA</div><div class="stat-label">CLAUDE SONNET</div></div>
    </div>
    <div class="search-card">
      <div class="search-title">◈ Type de recherche</div>
      <div class="type-grid" id="type-grid"></div>
      <div class="search-title">◈ Cible à analyser</div>
      <div class="input-row">
        <input class="search-input" id="search-input" placeholder="${TYPES[0].placeholder}" />
        <button class="search-btn" id="search-btn" onclick="doSearch()">ANALYSER</button>
      </div>
    </div>
    <div id="results-container">
      <div class="empty-state"><div class="empty-icon">Φ</div>Sélectionne un type et lance une recherche</div>
    </div>`;
  renderTypeGrid();
}

function renderTypeGrid() {
  const g = document.getElementById("type-grid");
  if (!g) return;
  g.innerHTML = TYPES.map(
    (t) => `<div class="type-btn ${t.id === currentType ? "active" : ""}" onclick="selectType('${t.id}')">
      <span class="type-icon">${t.icon}</span>${t.label}</div>`
  ).join("");
}

function selectType(id) {
  currentType = id;
  const t = TYPES.find((x) => x.id === id);
  const inp = document.getElementById("search-input");
  if (inp) inp.placeholder = t.placeholder;
  renderTypeGrid();
}

// ── Search logic ─────────────────────────────────────────────
async function doSearch() {
  const query = document.getElementById("search-input").value.trim();
  if (!query) return;

  const btn = document.getElementById("search-btn");
  btn.disabled = true;
  btn.textContent = "...";

  const rc = document.getElementById("results-container");
  rc.innerHTML = `
    <div class="result-card">
      <div class="loading-text">Φ ANALYSE EN COURS</div>
      <div class="loading-bar"></div>
      <div id="load-steps">
        <div class="loading-step active" id="ls1">▶ Identification du type de cible...</div>
        <div class="loading-step" id="ls2">▷ Interrogation des sources OSINT...</div>
        <div class="loading-step" id="ls3">▷ Corrélation des données...</div>
        <div class="loading-step" id="ls4">▷ Génération du rapport...</div>
      </div>
    </div>`;

  let step = 1;
  const adv = setInterval(() => {
    if (step < 4) {
      const el = document.getElementById("ls" + step);
      if (el) el.className = "loading-step done";
      step++;
      const next = document.getElementById("ls" + step);
      if (next) next.className = "loading-step active";
    }
  }, 600);

  const typeInfo = TYPES.find((t) => t.id === currentType);

  try {
    const response = await fetch(PHANTEX_CONFIG.PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: typeInfo.label, query }),
    });

    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();

    clearInterval(adv);
    renderResult(data, query, typeInfo);

    searchCount++;
    searchHistory.unshift({
      type: currentType,
      typeLabel: typeInfo.label,
      query,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    });

    const hb = document.getElementById("hist-badge");
    if (hb) hb.textContent = searchHistory.length;
    const sc = document.getElementById("stat-count");
    if (sc) sc.textContent = searchCount;
    const st = document.getElementById("stat-types");
    if (st) st.textContent = new Set(searchHistory.map((h) => h.type)).size;
  } catch (err) {
    clearInterval(adv);
    rc.innerHTML = `<div class="result-card"><div class="loading-text" style="color:#ffaa00">⚠ Erreur : ${err.message}</div></div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "ANALYSER";
  }
}

// ── Result rendering ─────────────────────────────────────────
function renderResult(data, query, typeInfo) {
  const rc = document.getElementById("results-container");
  if (!data || data.error) {
    rc.innerHTML = `<div class="result-card"><div class="loading-text" style="color:#ffaa00">⚠ ${data?.error || "Erreur inconnue"}</div></div>`;
    return;
  }

  const riskClass = data.risque === "ÉLEVÉ" ? "danger" : data.risque === "MODÉRÉ" ? "warning" : "found";
  const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  rc.innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <span class="result-type-badge">${typeInfo.label.toUpperCase()}</span>
        <span class="result-query">${escHtml(query)}</span>
        <span class="result-time">${now}</span>
      </div>
      <div class="result-section">
        <div class="result-section-title">◈ Résumé</div>
        <div class="result-body">${escHtml(data.resume || "—")}</div>
      </div>
      <div class="result-section">
        <div class="result-section-title">◈ Niveau d'exposition</div>
        <div class="result-row"><span class="result-key">Risque :</span><span class="result-val ${riskClass}">${data.risque || "—"}</span></div>
      </div>
      ${data.infos_potentielles ? `
      <div class="result-section">
        <div class="result-section-title">◈ Données potentiellement exposées</div>
        ${Object.entries(data.infos_potentielles).map(([k, v]) =>
          `<div class="result-row"><span class="result-key">${escHtml(k)} :</span><span class="result-val">${escHtml(v)}</span></div>`
        ).join("")}
      </div>` : ""}
      ${data.sources_osint?.length ? `
      <div class="result-section">
        <div class="result-section-title">◈ Sources recommandées</div>
        <div class="sources-list">${data.sources_osint.map((s) =>
          `<div class="source-item"><div class="source-dot"></div><span>${escHtml(s)}</span></div>`
        ).join("")}</div>
      </div>` : ""}
      ${data.techniques?.length ? `
      <div class="result-section">
        <div class="result-section-title">◈ Techniques</div>
        <div class="tag-list">${data.techniques.map((t) => `<span class="tag purple">${escHtml(t)}</span>`).join("")}</div>
      </div>` : ""}
      ${data.conseils_protection?.length ? `
      <div class="result-section">
        <div class="result-section-title">◈ Se protéger</div>
        ${data.conseils_protection.map((c) =>
          `<div class="result-row"><div class="source-dot" style="background:#00ff88;flex-shrink:0;margin-top:5px;"></div><span class="result-body">${escHtml(c)}</span></div>`
        ).join("")}
      </div>` : ""}
      <div class="warn-note">⚠ ${escHtml(data.avertissement || "Outil éducatif — respecter la vie privée et les lois en vigueur.")}</div>
    </div>`;
}

// ── History view ──────────────────────────────────────────────
function renderHistory(c) {
  c.innerHTML = `
    <div class="search-card">
      <div class="search-title">◈ Historique de session</div>
      ${searchHistory.length === 0
        ? `<div class="empty-state"><div class="empty-icon">◷</div>Aucune recherche effectuée</div>`
        : searchHistory.map((h) => `
          <div class="history-item" onclick="replaySearch('${h.type}','${escAttr(h.query)}')">
            <span class="history-type">${h.typeLabel.toUpperCase()}</span>
            <span class="history-query">${escHtml(h.query)}</span>
            <span class="history-time">${h.time}</span>
          </div>`).join("")}
    </div>`;
}

function replaySearch(type, query) {
  currentType = type;
  showView("search");
  setTimeout(() => {
    const inp = document.getElementById("search-input");
    if (inp) inp.value = query;
    selectType(type);
  }, 100);
}

// ── Resources view ────────────────────────────────────────────
function renderResources(c) {
  const cats = [...new Set(RESOURCES.map((r) => r.cat))];
  c.innerHTML = `
    <div class="search-card">
      <div class="search-title">◈ Ressources OSINT recommandées</div>
      ${cats.map((cat) => `
        <div class="resource-group">
          <div class="resource-cat-label">${cat}</div>
          ${RESOURCES.filter((r) => r.cat === cat).map((r) => `
            <div class="resource-item">
              <div class="source-dot"></div>
              <div>
                <a class="resource-link" href="${r.url}" target="_blank" rel="noopener">${r.name}</a>
                <div class="resource-desc">${escHtml(r.desc)}</div>
              </div>
            </div>`).join("")}
        </div>`).join("")}
    </div>`;
}

// ── Learn view ────────────────────────────────────────────────
function renderLearn(c) {
  c.innerHTML = `
    <div class="search-card">
      <div class="search-title">◈ Qu'est-ce que l'OSINT ?</div>
      <p class="result-body">L'<strong>Open Source Intelligence</strong> est la collecte d'informations à partir de sources <strong>publiquement accessibles</strong>. Utilisé par les journalistes d'investigation, chercheurs en cybersécurité, forces de l'ordre et citoyens engagés.</p>
    </div>
    <div class="search-card">
      <div class="search-title">◈ Types de recherches dans Phantex</div>
      ${TYPES.map((t) => `
        <div class="type-info-row">
          <span class="type-info-icon">${t.icon}</span>
          <div>
            <div class="type-info-label">${t.label}</div>
            <div class="type-info-desc">${t.desc} — <em>${t.placeholder}</em></div>
          </div>
        </div>`).join("")}
    </div>
    <div class="search-card">
      <div class="search-title">◈ Éthique et légalité</div>
      <div class="tag-list">
        <span class="tag green">Sources publiques uniquement</span>
        <span class="tag green">Pas d'intrusion système</span>
        <span class="tag red">Harcèlement interdit</span>
        <span class="tag red">Données privées = illégal</span>
        <span class="tag amber">RGPD applicable</span>
        <span class="tag purple">Usage éducatif et citoyen</span>
      </div>
    </div>`;
}

// ── Helpers ───────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escAttr(str) {
  return String(str).replace(/'/g, "\\'");
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => showView("search"));
