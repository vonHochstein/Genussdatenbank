// Genussdatenbank – Login (GI-Flow) im WB-Look
// Stand: 2025_12_30

const SUPABASE_URL = "https://dffqempnuqymcofvgkxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZnFlbXBudXF5bWNvZnZna3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTY3NDMsImV4cCI6MjA3NTU3Mjc0M30.jHxiRy2Q2dQpvA-RuV3xcJsAy3hkDm6psYnOeNjY6pA";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;

// UI
const lockscreen = document.getElementById("lockscreen");
const preloginIntro = document.getElementById("preloginIntro");
const appTopbar = document.querySelector(".app-topbar");
const changelog = document.getElementById("changelog");
const app = document.getElementById("app");
const dashboard = document.getElementById("dashboard");

const usernameEl = document.getElementById("username");
const passEl = document.getElementById("pass");
const enterBtn = document.getElementById("enter");
const msgEl = document.getElementById("msg");

const loginOkEl = document.getElementById("loginOk");
const whiskyLoginOkEl = document.getElementById("whiskyLoginOk");
const logoutBtn = document.getElementById("logout");

const LS_USER_KEY = "gdb_current_user";

// "Neu seit letztem Login"-Modal
const newsModal = document.getElementById("newsModal");
const newsList = document.getElementById("newsList");
const newsOkBtn = document.getElementById("newsOkBtn");

window.GDB_NEWS_DEPS = {
  getSupabaseClient: () => supabaseClient,
  getNewsModal: () => newsModal,
  getNewsList: () => newsList,
  getNewsOkBtn: () => newsOkBtn,
  escapeHtml
};

function showPermissionMessage(message, kind = "err") {
  if (
    typeof setWhiskyMsg === "function" &&
    currentView &&
    (currentView === "whiskyList" || currentView === "whiskyDetail" || currentView === "whiskyDashboard")
  ) {
    setWhiskyMsg(message, kind);
    return;
  }

  if (typeof setDashboardMsg === "function" && currentView === "home") {
    setDashboardMsg(message, kind);
    return;
  }

  setMsg(message, kind);
}

window.GDB_PERMISSION_DEPS = {
  getSupabaseClient: () => supabaseClient,
  getCurrentUser: () => currentUser,
  setMsg: showPermissionMessage
};

const whiskyListView = document.getElementById("whiskyListView");
const whiskyFrame = document.getElementById("whiskyFrame");
const backToDashFromWhiskyBtn = document.getElementById("backToDashFromWhiskyBtn");
const whiskyToolbarEl = document.querySelector(".whisky-toolbar");
let backToWorldMapBtn = null;
let backToWorldMapMode = "world"; // world | uk
const whiskyCountEl = document.getElementById("whiskyCount");
const whiskySearchEl = document.getElementById("whiskySearch");
const whiskySortEl = document.getElementById("whiskySort");
const whiskySortDirEl = document.getElementById("whiskySortDir");
const whiskyCompareStockEl = document.getElementById("whiskyCompareStock");
const btnListEl = document.getElementById("btnList");
const btnNewWhiskyEl = document.getElementById("btnNewWhisky");
const btnDashboardEl = document.getElementById("btnDashboard");
function setWhiskyToolbarVisible(isVisible) {
  if (!whiskyToolbarEl) return;
  whiskyToolbarEl.style.display = isVisible ? "" : "none";
}
function ensureWhiskyToolbarPlacement() {
  if (!whiskyToolbarEl || !whiskyListView) return;

  const titleCard = whiskyListView.querySelector(".card");

  if (titleCard) {
    const alreadyPlaced =
      whiskyToolbarEl.parentElement === whiskyListView &&
      whiskyToolbarEl.previousElementSibling === titleCard;

    if (alreadyPlaced) return;

    titleCard.insertAdjacentElement("afterend", whiskyToolbarEl);
    return;
  }

  whiskyListView.appendChild(whiskyToolbarEl);
}

function postToWhiskyFrame(message) {
  if (!whiskyFrame?.contentWindow) return;
  whiskyFrame.contentWindow.postMessage(message, "*");
}

function syncWhiskyToolbarToFrame() {
  postToWhiskyFrame({
    type: "gdb-set-search",
    value: whiskySearchEl?.value || ""
  });

  postToWhiskyFrame({
    type: "gdb-set-sort",
    value: {
      mode: whiskySortEl?.value || "name",
      dir: whiskySortDirEl?.dataset.dir || "asc"
    }
  });

  postToWhiskyFrame({
    type: "gdb-set-compare-stock",
    value: {
      enabled: !!(whiskyCompareStockEl?.checked && selectedCompareUserId),
      userId: selectedCompareUserId || null
    }
  });
}

function resetWhiskyToolbarState() {
  if (whiskySearchEl) whiskySearchEl.value = "";
  if (whiskySortEl) whiskySortEl.value = "updated";
  if (whiskySortDirEl) {
    whiskySortDirEl.dataset.dir = "desc";
    whiskySortDirEl.textContent = "↓";
    whiskySortDirEl.setAttribute("aria-label", "Sortierreihenfolge absteigend");
    whiskySortDirEl.title = "Sortierreihenfolge umschalten";
  }
  if (whiskyCompareStockEl) whiskyCompareStockEl.checked = false;
  if (whiskyCountEl) whiskyCountEl.textContent = "0 Whiskys";
  selectedCompareUserId = null;
}

function renderCompareStockUsers() {
  if (!compareStockUserList) return;

  if (!compareStockUsers.length) {
    compareStockUserList.innerHTML = `<div class="muted">Keine weiteren Nutzer gefunden.</div>`;
    return;
  }

  compareStockUserList.innerHTML = compareStockUsers.map((user) => {
    const checked = selectedCompareUserId === user.id ? "checked" : "";
    const active = selectedCompareUserId === user.id ? " active" : "";
    const label = escapeHtml((user.display_name || user.username || "Unbekannt").trim());

    return `
      <label class="compare-stock-user-item${active}" data-user-id="${escapeHtml(user.id)}">
        <input type="radio" name="compareStockUser" value="${escapeHtml(user.id)}" ${checked}>
        <span>${label}</span>
      </label>
    `;
  }).join("");
}

async function loadCompareStockUsers() {
  if (!currentUser?.id) return;

  const { data, error } = await supabaseClient
    .from("gdb_users")
    .select("id,username,display_name")
    .neq("id", currentUser.id)
    .order("display_name", { ascending: true });

  if (error) {
    console.error(error);
    compareStockUsers = [];
    renderCompareStockUsers();
    return;
  }

  compareStockUsers = data || [];
  renderCompareStockUsers();
}

function openCompareStockModal() {
  renderCompareStockUsers();
  compareStockModal?.classList.remove("hidden");
  compareStockModal?.setAttribute("aria-hidden", "false");
}

function closeCompareStockModal() {
  compareStockModal?.classList.add("hidden");
  compareStockModal?.setAttribute("aria-hidden", "true");
}

function applyCompareStockSelection() {
  if (whiskyCompareStockEl) {
    whiskyCompareStockEl.checked = !!selectedCompareUserId;
  }
  closeCompareStockModal();
  syncWhiskyToolbarToFrame();
}

// Bestände Popup
const stocksModal = document.getElementById("stocksModal");
const stocksCloseBtn = document.getElementById("stocksCloseBtn");
const stocksBody = document.getElementById("stocksBody");
const stocksTitle = document.getElementById("stocksTitle");

// Bestandsvergleich Popup
const compareStockModal = document.getElementById("compareStockModal");
const compareStockCloseBtn = document.getElementById("compareStockCloseBtn");
const compareStockCancelBtn = document.getElementById("compareStockCancelBtn");
const compareStockApplyBtn = document.getElementById("compareStockApplyBtn");
const compareStockUserList = document.getElementById("compareStockUserList");

// State
let currentView = "home"; // home | whiskyList | whiskyDetail | whiskyDashboard
let whiskyDetailBackView = "whiskyList";

let currentUser = null;
let compareStockUsers = [];
let selectedCompareUserId = null;
resetWhiskyToolbarState();

async function refreshCurrentPermissions(user = currentUser) {
  if (!window.GdbPermissions?.loadCurrentUserPermissions) return [];

  try {
    const effectiveUserId = user?.id || null;
    return await window.GdbPermissions.loadCurrentUserPermissions(effectiveUserId);
  } catch (error) {
    console.error("Berechtigungen konnten nicht geladen werden:", error);
    return [];
  }
}

function setMsg(text, kind = "") {
  if (!msgEl) return;
  msgEl.textContent = text || "";
  msgEl.classList.remove("ok", "err");
  if (kind) msgEl.classList.add(kind);
}

function setMsg(text, kind = "") {
  if (!msgEl) return;

  msgEl.textContent = text;
  msgEl.className = kind ? `err ${kind}` : "err";

  msgEl.classList.toggle("show", !!text);
}

function showApp(user) {
  if (preloginIntro) preloginIntro.style.display = "none";
  if (lockscreen) lockscreen.style.display = "none";
  if (changelog) changelog.style.display = "none";
  if (appTopbar) appTopbar.style.display = "flex";
  if (dashboard) dashboard.style.display = "block";
  if (app) app.style.display = "block";
  if (logoutBtn) logoutBtn.style.display = "inline-block";

  showDashboard();

  if (user) {
    const shownName = (user.display_name || user.username || "").trim();
    const text = shownName ? `Angemeldet als: ${shownName}` : "Angemeldet";

    if (loginOkEl) loginOkEl.textContent = text;
    if (whiskyLoginOkEl) whiskyLoginOkEl.textContent = text;
  }
  loadWhiskyTileStats();
  loadCompareStockUsers();
}

function showLock() {
  if (preloginIntro) preloginIntro.style.display = "grid";
  if (lockscreen) lockscreen.style.display = "block";
  if (changelog) changelog.style.display = "block";
  if (appTopbar) appTopbar.style.display = "none";
  if (dashboard) dashboard.style.display = "none";
  if (app) app.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "none";
  if (loginOkEl) loginOkEl.textContent = "";
  if (whiskyLoginOkEl) whiskyLoginOkEl.textContent = "";
}

function setCurrentUser(user) {
  if (user) {
    // user kann aus DB kommen (voll) oder aus localStorage (reduziert)
    currentUser = {
      id: user.id,
      username: user.username,
      display_name: user.display_name ?? null,
      previous_login: user.previous_login || null
    };

    window.currentUser = currentUser;

    const store = {
      id: currentUser.id,
      username: currentUser.username,
      display_name: (currentUser.display_name || currentUser.username)
    };

    localStorage.setItem(LS_USER_KEY, JSON.stringify(store));
    showApp(currentUser);
    void refreshCurrentPermissions(currentUser);
  } else {
    currentUser = null;
    window.currentUser = null;
    localStorage.removeItem(LS_USER_KEY);
    compareStockUsers = [];
    selectedCompareUserId = null;
    void refreshCurrentPermissions(null);
    showLock();
  }
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function loginWithAuth() {
  const email = (usernameEl?.value || "").trim();     // Feld bleibt vorerst gleich, nur Inhalt ist Email
  const password = (passEl?.value || "").trim();

  if (!email || !password) {
    setMsg("Bitte E-Mail und Passwort eingeben.", "err");
    return;
  }

  enterBtn && (enterBtn.disabled = true);
  setMsg("");

  try {
    // 1) Supabase Auth Login
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(error);
      setMsg("Anmeldung fehlgeschlagen (Auth).", "err");
      return;
    }

    const authUser = data?.user;
    if (!authUser?.id) {
      setMsg("Anmeldung fehlgeschlagen (kein User).", "err");
      return;
    }

    // 2) Profil in gdb_users holen (id = auth.uid)
    //    Wenn keins existiert: anlegen (Dummy-kompatibel, weil password_hash NOT NULL ist)
    let profile = null;

    const { data: prof, error: profErr } = await supabaseClient
      .from("gdb_users")
      .select("id,username,display_name,last_login")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profErr) {
      console.error(profErr);
      setMsg("Profil konnte nicht geladen werden.", "err");
      return;
    }

    if (!prof) {
      const defaultUsername = (authUser.email || "").split("@")[0] || "user";

      const { data: ins, error: insErr } = await supabaseClient
        .from("gdb_users")
        .insert({
          id: authUser.id,
          username: defaultUsername.toLowerCase(),
          display_name: null
        })
        .select("id,username,display_name,last_login")
        .single();

      if (insErr) {
        console.error(insErr);
        setMsg("Profil konnte nicht angelegt werden.", "err");
        return;
      }

      profile = ins;
    } else {
      profile = prof;
    }

    // 3) last_login updaten (optional, wie bisher)
    const previousLogin = profile.last_login;

    await supabaseClient
      .from("gdb_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", profile.id);

    profile.previous_login = previousLogin;

    // 4) News + User setzen
    await showNewsSince(previousLogin, profile);
    setCurrentUser(profile);
    await refreshCurrentPermissions(profile);

    // optionales Logging
    logEvent({
      action: "login",
      item_type: "user",
      item_id: profile.id,
      item_name: getLogDisplayName(profile),
      details: "Login via Supabase Auth"
    });

  } catch (err) {
    console.error(err);
    setMsg("Anmeldung fehlgeschlagen. Bitte später erneut versuchen.", "err");
  } finally {
    enterBtn && (enterBtn.disabled = false);
  }
}

function logout() {
  // 1) State löschen
  setCurrentUser(null);

  // 2) UI sauber zurücksetzen (damit Whisky-View/iframe nicht “stehen bleibt”)
  hideAllViews();
  if (whiskyFrame) whiskyFrame.setAttribute("src", ""); // iframe wirklich leeren

  // 3) Login-Maske/Changelog wieder anzeigen
  showLock();

  // 4) Eingabefelder & Meldungen leeren
  if (usernameEl) usernameEl.value = "";
  if (passEl) passEl.value = "";
  setMsg("");
}

function init() {
  const stored = getStoredUser();
  if (stored) {
    setCurrentUser(stored);
    void refreshCurrentPermissions(stored);
  } else {
    showLock();
  }

  enterBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    loginWithAuth();
  });

  // ENTER-Taste im Passwortfeld
  passEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      loginWithAuth();
    }
  });

  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  newsOkBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  closeNewsModal();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  init();
});

function openNewsModal() {
  if (window.GdbNews?.openNewsModal) {
    return window.GdbNews.openNewsModal();
  }
  if (!newsModal) return;
  newsModal.classList.remove("hidden");
  newsModal.setAttribute("aria-hidden", "false");
}

function closeNewsModal() {
  if (window.GdbNews?.closeNewsModal) {
    return window.GdbNews.closeNewsModal();
  }
  if (!newsModal) return;
  newsModal.classList.add("hidden");
  newsModal.setAttribute("aria-hidden", "true");
}

function fmtTs(ts) {
  if (window.GdbNews?.fmtTs) {
    return window.GdbNews.fmtTs(ts);
  }
  try {
    return new Date(ts).toLocaleString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch {
    return ts || "";
  }
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setWhiskyImg(url) {
  const img = document.getElementById("whiskyImg");
  if (!img) return;
  if (!url) {
    img.style.display = "none";
    img.src = "";
    return;
  }
  img.style.display = "block";
  img.src = url;
}

function buildWhiskySub(w) {
  const parts = [];
  if (w.country) parts.push(w.country);
  if (w.region) parts.push(w.region);
  if (w.age_years != null) parts.push(`${w.age_years} Jahre`);
  if (w.distillery) parts.push(w.distillery);
  return parts.join(" · ");
}

function formatNum(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return String(n);
  return x.toFixed(2).replace(/\.00$/, "");
}

async function showNewsSince(previousLoginTs, user) {
  if (window.GdbNews?.showNewsSince) {
    return window.GdbNews.showNewsSince(previousLoginTs, user);
  }

  // Fallback, falls gdb_news.js noch nicht geladen ist
  if (!previousLoginTs) return;
  if (!newsList) return;

  newsList.innerHTML = `<div class="news-item"><div class="meta">Lade Änderungen…</div></div>`;

  const { data, error } = await supabaseClient
    .from("gdb_log")
    .select("timestamp, username, action, item_type, item_name, details")
    .gt("timestamp", previousLoginTs)
    .order("timestamp", { ascending: false })
    .limit(50);

  if (error) {
    console.error(error);
    newsList.innerHTML = `<div class="news-item"><div class="meta">Änderungen konnten nicht geladen werden.</div></div>`;
    openNewsModal();
    return;
  }

  if (!data || data.length === 0) {
    newsList.innerHTML = `<div class="news-item"><div class="meta">Keine neuen Änderungen seit deinem letzten Login.</div></div>`;
    openNewsModal();
    return;
  }

  newsList.innerHTML = data.map((r) => {
    const who = escapeHtml(r.username || "Unbekannt");
    const when = escapeHtml(fmtTs(r.timestamp));
    const item = escapeHtml(r.item_name || "");
    const type = escapeHtml(r.item_type || "");
    const act = escapeHtml(r.action || "");
    const det = r.details ? `<div class="meta">${escapeHtml(r.details)}</div>` : "";

    return `
      <div class="news-item">
        <div class="meta">${when} · ${who}</div>
        <div class="title">${act.toUpperCase()} – ${type}${item ? `: ${item}` : ""}</div>
        ${det}
      </div>
    `;
  }).join("");

  openNewsModal();
}

function getLogDisplayName(user) {
  return user?.display_name || user?.username || null;
}

async function logEvent({ action, item_type, item_id = null, item_name = null, details = null }) {
  try {
    if (!currentUser) return;

    const payload = {
      user_id: currentUser.id,
      username: getLogDisplayName(currentUser),
      action,
      item_type,
      item_id,
      item_name,
      details
    };

    const { error } = await supabaseClient.from("gdb_log").insert(payload);
    if (error) console.error("logEvent error:", error);
  } catch (e) {
    console.error("logEvent exception:", e);
  }
}

async function loadWhiskyTileStats() {
  const el = document.getElementById("tileStatWhisky");
  if (!el) return;

  try {
    // 1) Gesamtanzahl (Count)
    const { count, error: errCount } = await supabaseClient
      .from("gdb_whiskys")
      .select("id", { count: "exact", head: true });

    if (errCount) throw errCount;

    // 2) Länder-Anzahl (distinct)
    const { data, error: errCountries } = await supabaseClient
      .from("gdb_whiskys")
      .select("country");

    if (errCountries) throw errCountries;

    const countries = new Set(
      (data || [])
        .map(r => (r.country || "").trim())
        .filter(Boolean)
    );

    el.textContent = `${count} Whiskys aus ${countries.size} Ländern`;
  } catch (e) {
    console.error("Whisky-Stats Fehler:", e);
    el.textContent = "Stats nicht verfügbar";
  }
}

function showDashboard() {
  whiskyListView?.classList.add("hidden");
  if (dashboard) dashboard.style.display = "block";
  if (app) app.style.display = "block";
}

function setWhiskyViewTitle(text){
  const el = document.getElementById("whiskyViewTitle");
  if (el) el.textContent = text;
}

function ensureBackToWorldMapButton() {
  if (backToWorldMapBtn instanceof HTMLElement) return backToWorldMapBtn;
  if (!(backToDashFromWhiskyBtn instanceof HTMLElement)) return null;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "backToWorldMapBtn";
  btn.className = backToDashFromWhiskyBtn.className || "btn btn-secondary";
  btn.textContent = "Zur Weltkarte";
  btn.style.display = "none";
  btn.style.marginRight = "8px";
  btn.style.flex = "0 0 auto";
  btn.addEventListener("click", () => {
    if (backToWorldMapMode === "uk") {
      postToWhiskyFrame({ type: "gdb-dashboard-back-to-uk" });
      return;
    }

    postToWhiskyFrame({ type: "gdb-dashboard-back-to-world" });
  });

  let buttonWrap = document.getElementById("whiskyTopbarButtonWrap");
  if (!(buttonWrap instanceof HTMLElement)) {
    buttonWrap = document.createElement("div");
    buttonWrap.id = "whiskyTopbarButtonWrap";
    buttonWrap.style.display = "flex";
    buttonWrap.style.alignItems = "center";
    buttonWrap.style.justifyContent = "flex-end";
    buttonWrap.style.gap = "0";
    buttonWrap.style.marginLeft = "auto";

    const originalParent = backToDashFromWhiskyBtn.parentElement;
    if (originalParent) {
      originalParent.insertBefore(buttonWrap, backToDashFromWhiskyBtn);
      buttonWrap.appendChild(backToDashFromWhiskyBtn);
    }
  }

  backToDashFromWhiskyBtn.style.flex = "0 0 auto";
  buttonWrap.insertBefore(btn, backToDashFromWhiskyBtn);
  backToWorldMapBtn = btn;
  return btn;
}

function setBackToWorldMapVisible(isVisible, options = {}) {
  const btn = ensureBackToWorldMapButton();
  if (!btn) return;

  const mode = options.mode === "uk" ? "uk" : "world";
  backToWorldMapMode = mode;

  if (mode === "uk") {
    btn.textContent = "Zu Großbritannien & Irland";
  } else {
    btn.textContent = "Zur Weltkarte";
  }

  btn.style.display = isVisible ? "inline-flex" : "none";
}

function handleTopbarBack() {
  if (currentView === "whiskyDetail") {
    setBackToWorldMapVisible(false, { mode: "world" });

    if (whiskyDetailBackView === "whiskyDashboard") {
      ensureWhiskyToolbarPlacement();
      setWhiskyToolbarVisible(false);
      whiskyFrame.src = `views/whisky/gdb_whisky_dashboard.html?uid=${encodeURIComponent(currentUser?.id || "")}&t=${Date.now()}`;
      currentView = "whiskyDashboard";
      setWhiskyViewTitle("Whisky – Dashboard");
      return;
    }

    ensureWhiskyToolbarPlacement();
    setWhiskyToolbarVisible(true);
    whiskyFrame.src = `views/whisky/gdb_whisky.html?uid=${encodeURIComponent(currentUser?.id || "")}&t=${Date.now()}`;
    whiskyFrame.onload = () => {
      syncWhiskyToolbarToFrame();
    };
    currentView = "whiskyList";
    setWhiskyViewTitle("Whisky");
    return;
  }

  if (currentView === "whiskyDashboard") {
    setBackToWorldMapVisible(false, { mode: "world" });
    ensureWhiskyToolbarPlacement();
    setWhiskyToolbarVisible(true);
    whiskyFrame.src = `views/whisky/gdb_whisky.html?uid=${encodeURIComponent(currentUser?.id || "")}&t=${Date.now()}`;
    whiskyFrame.onload = () => {
      syncWhiskyToolbarToFrame();
    };
    currentView = "whiskyList";
    setWhiskyViewTitle("Whisky");
    return;
  }

  if (currentView === "whiskyList") {
    setBackToWorldMapVisible(false, { mode: "world" });
    leaveWhiskyList();
    currentView = "home";
    setWhiskyViewTitle("Whisky");
    return;
  }
}

function hideAllViews() {
  whiskyListView?.classList.add("hidden");
}

function showWhiskyList() {
  if (dashboard) dashboard.style.display = "none";
  if (app) app.style.display = "none";
  hideAllViews();
  ensureWhiskyToolbarPlacement();
  setWhiskyToolbarVisible(true);
  whiskyListView?.classList.remove("hidden");

  // iframe src immer mit aktueller UID setzen (sonst bleibt nach Login-Wechsel die alte UID hängen)
  if (whiskyFrame) {
    const uid = encodeURIComponent(currentUser?.id || "");
    whiskyFrame.src = `views/whisky/gdb_whisky.html?uid=${uid}&t=${Date.now()}`;
    whiskyFrame.onload = () => {
      syncWhiskyToolbarToFrame();
    };
  }
  currentView = "whiskyList";
  setWhiskyViewTitle("Whisky");
}

function leaveWhiskyList() {
  setWhiskyViewTitle("Whisky");
  setWhiskyToolbarVisible(false);
  whiskyListView?.classList.add("hidden");
  if (whiskyFrame) {
    whiskyFrame.onload = null;
    whiskyFrame.setAttribute("src", "");
  }
  resetWhiskyToolbarState();
  showDashboard();
}

  function setDashboardMsg(text = "", cls = "hint") {
  const el = document.getElementById("dashboardMsg");
  if (!el) return;

  if (!text) {
    el.style.display = "none";
    el.textContent = "";
    el.className = "";
    return;
  }

  el.style.display = "block";
  el.textContent = text;
  el.className = cls;
}

function setWhiskyMsg(text = "", cls = "hint") {
  const el = document.getElementById("whiskyMsg");
  if (!el) return;

  if (!text) {
    el.style.display = "none";
    el.textContent = "";
    el.className = "";
    return;
  }

  el.style.display = "block";
  el.textContent = text;
  el.className = cls;
}

// Backwards compatibility: old name writes to dashboard
function setAppMsg(text = "", cls = "hint") {
  setDashboardMsg(text, cls);
}

// Dashboard: Whisky-Kachel
const tileWhisky = document.getElementById("tileWhisky");
tileWhisky?.addEventListener("click", (e) => {
  e.preventDefault?.();
  setWhiskyMsg("");
  setDashboardMsg("");

  if (!window.GdbPermissions?.requirePermission?.("whisky", "read")) {
    return;
  }

  showWhiskyList();
});

backToDashFromWhiskyBtn?.addEventListener("click", () => {
  setWhiskyMsg("");
  setDashboardMsg("");
  handleTopbarBack();
});

whiskySearchEl?.addEventListener("input", () => {
  postToWhiskyFrame({
    type: "gdb-set-search",
    value: whiskySearchEl.value || ""
  });
});

function sendSortToFrame() {
  postToWhiskyFrame({
    type: "gdb-set-sort",
    value: {
      mode: whiskySortEl?.value || "name",
      dir: whiskySortDirEl?.dataset.dir || "asc"
    }
  });
}

whiskySortEl?.addEventListener("change", sendSortToFrame);
whiskySortDirEl?.addEventListener("click", () => {
  const nextDir = whiskySortDirEl.dataset.dir === "desc" ? "asc" : "desc";
  whiskySortDirEl.dataset.dir = nextDir;
  whiskySortDirEl.textContent = nextDir === "desc" ? "↓" : "↑";
  whiskySortDirEl.setAttribute(
    "aria-label",
    nextDir === "desc" ? "Sortierreihenfolge absteigend" : "Sortierreihenfolge aufsteigend"
  );
  sendSortToFrame();
});

whiskyCompareStockEl?.addEventListener("change", async () => {
  setWhiskyMsg("");

  if (!whiskyCompareStockEl.checked) {
    selectedCompareUserId = null;
    syncWhiskyToolbarToFrame();
    return;
  }

  if (!compareStockUsers.length) {
    await loadCompareStockUsers();
  }

  openCompareStockModal();
});

btnListEl?.addEventListener("click", () => {
  setWhiskyMsg("");

  if (currentView !== "whiskyList") {
    showWhiskyList();
    resetWhiskyToolbarState();
    syncWhiskyToolbarToFrame();
    return;
  }

  resetWhiskyToolbarState();
  syncWhiskyToolbarToFrame();
});

btnDashboardEl?.addEventListener("click", () => {
  setWhiskyMsg("");
  ensureWhiskyToolbarPlacement();
  setWhiskyToolbarVisible(false);

  if (whiskyFrame) {
    whiskyFrame.onload = null;
    whiskyFrame.src = `views/whisky/gdb_whisky_dashboard.html?uid=${encodeURIComponent(currentUser?.id || "")}&t=${Date.now()}`;
  }

  currentView = "whiskyDashboard";
  setBackToWorldMapVisible(false, { mode: "world" });
  setWhiskyViewTitle("Whisky – Dashboard");
});

btnNewWhiskyEl?.addEventListener("click", () => {
  setWhiskyMsg("");

  if (!window.GdbPermissions?.requirePermission?.("whisky", "create")) {
    return;
  }

  ensureWhiskyToolbarPlacement();
  setWhiskyToolbarVisible(false);

  if (whiskyFrame) {
    whiskyFrame.onload = null;
    whiskyFrame.src = `views/whisky/gdb_whisky_create.html?t=${Date.now()}`;
  }

  currentView = "whiskyDetail";
  setWhiskyViewTitle("Whisky – Neuer Eintrag");
});

compareStockCloseBtn?.addEventListener("click", () => {
  if (whiskyCompareStockEl) whiskyCompareStockEl.checked = false;
  closeCompareStockModal();
});

compareStockCancelBtn?.addEventListener("click", () => {
  if (whiskyCompareStockEl) whiskyCompareStockEl.checked = false;
  closeCompareStockModal();
});

compareStockApplyBtn?.addEventListener("click", () => {
  applyCompareStockSelection();
});

compareStockUserList?.addEventListener("change", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.name !== "compareStockUser") return;

  selectedCompareUserId = target.value || null;
  renderCompareStockUsers();
});

// ==========================================================
// POPUPS (global im Parent): PLI + Bewertungen aus Whisky-iFrame
// ==========================================================
(function initWhiskyPopupsInParent(){
  const pliModal = document.getElementById("pliModal");
  const pliCloseBtn = document.getElementById("pliCloseBtn");

  const ratingsModal = document.getElementById("ratingsModal");
  const ratingsCloseBtn = document.getElementById("ratingsCloseBtn");
  const ratingsTitle = document.getElementById("ratingsModalTitle");
  const ratingsBody = document.getElementById("ratingsModalContent");

  const stocksModal = document.getElementById("stocksModal");
  const stocksCloseBtn = document.getElementById("stocksCloseBtn");
  const stocksBody = document.getElementById("stocksBody");
  const stocksTitle = document.getElementById("stocksTitle");

  function openModal(modal){
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal(modal){
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  pliCloseBtn?.addEventListener("click", () => closeModal(pliModal));
  ratingsCloseBtn?.addEventListener("click", () => closeModal(ratingsModal));
  stocksCloseBtn.addEventListener("click", () => closeModal(stocksModal));
  compareStockCloseBtn?.addEventListener("click", () => closeCompareStockModal());

  // Klick auf Backdrop schließt
  document.addEventListener("click", (e) => {
    const el = e.target?.closest?.("[data-close-modal]");
    const id = el?.getAttribute?.("data-close-modal");
    if (!id) return;
    if (id === "pliModal"          ) closeModal(pliModal);
    if (id === "ratingsModal"      ) closeModal(ratingsModal);
    if (id === "stocksModal"       ) closeModal(stocksModal);
    if (id === "compareStockModal" ) {
      if (whiskyCompareStockEl) whiskyCompareStockEl.checked = false;
      closeCompareStockModal();
    }
  });

  // ESC schließt (wenn offen)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (pliModal && !pliModal.classList.contains("hidden")) closeModal(pliModal);
    if (ratingsModal && !ratingsModal.classList.contains("hidden")) closeModal(ratingsModal);
    if (stocksModal && !stocksModal.classList.contains("hidden")) closeModal(stocksModal);
    if (compareStockModal && !compareStockModal.classList.contains("hidden")) {
      if (whiskyCompareStockEl) whiskyCompareStockEl.checked = false;
      closeCompareStockModal();
    }
  });

  // Messages vom iFrame
  window.addEventListener("message", (e) => {
    const data = e.data || {};

    const whiskyViewTitle = document.getElementById("whiskyViewTitle");

    if (data.type === "set-title") {
      if (whiskyViewTitle) whiskyViewTitle.textContent = data.value || "Whisky";
      return;
    }

    if (data.type === "gdb-dashboard-map-state") {
      const showWorldBack = !!data.showWorldBack;
      const backMode = data.backMode === "uk" ? "uk" : "world";
      setBackToWorldMapVisible(showWorldBack && currentView === "whiskyDashboard", { mode: backMode });
      return;
    }

    if (data.type === "gdb-whisky-count") {
      const count = Number(data.count);
      const safe = Number.isNaN(count) ? 0 : count;

      if (whiskyCountEl) {
        whiskyCountEl.textContent = safe === 1
          ? "1 Whisky"
          : `${safe} Whiskys`;
      }
      return;
    }
    
    if (data.type === "nav") {

      if (data.view === "whiskyDetail" && data.id) {
      console.log("NAV received in parent:", data);
      setWhiskyToolbarVisible(false);
      whiskyFrame.src =
        `views/whisky/gdb_whisky_detail.html` +
        `?id=${encodeURIComponent(data.id)}` +
        `&avg=${encodeURIComponent(data.avgRating ?? "")}` +
        `&cnt=${encodeURIComponent(data.cntRating ?? 0)}` +
        `&pli=${encodeURIComponent(data.avgPli ?? "")}` +
        `&pcnt=${encodeURIComponent(data.cntPli ?? 0)}` +
        `&plimin=${encodeURIComponent(data.pliMin ?? "")}` +
        `&plimax=${encodeURIComponent(data.pliMax ?? "")}` +
        `&mystock=${encodeURIComponent(data.myStockMl ?? 0)}` +
        `&myrating=${encodeURIComponent(data.myRating ?? "")}` +
        `&mypli=${encodeURIComponent(data.myPli ?? "")}`+
        `&notes=${encodeURIComponent(data.myNotes ?? "")}`+
        `&t_color=${encodeURIComponent(data.myColor ?? "")}`+
        `&t_nose=${encodeURIComponent(data.myNose ?? "")}`+
        `&t_palate=${encodeURIComponent(data.myPalate ?? "")}`+
        `&t_finish=${encodeURIComponent(data.myFinish ?? "")}`+
        `&t_summary=${encodeURIComponent(data.mySummary ?? "")}`+
        `&t_trinkgelegenheit=${encodeURIComponent(data.myTrinkgelegenheit ?? "")}`+
        `&wishlist=${encodeURIComponent(data.myWishlist ?? "")}` +
        `&created_at=${encodeURIComponent(data.created_at ?? "")}`+
        `&updated_at=${encodeURIComponent(data.updated_at ?? "")}`+
        `&created_by=${encodeURIComponent(data.created_by ?? "")}`+
        `&updated_by=${encodeURIComponent(data.updated_by ?? "")}`+
        `&my_created_at=${encodeURIComponent(data.my_created_at ?? "")}`+
        `&my_updated_at=${encodeURIComponent(data.my_updated_at ?? "")}`;

        whiskyDetailBackView = data.source === "whiskyDashboard" ? "whiskyDashboard" : "whiskyList";
        setBackToWorldMapVisible(false, { mode: "world" });
        currentView = "whiskyDetail";
        return;
      }
      console.log("Detail URL:", whiskyFrame.src);
      
      if (data.view === "whiskyList") {
        ensureWhiskyToolbarPlacement();
        setWhiskyToolbarVisible(true);
        whiskyFrame.src = `views/whisky/gdb_whisky.html?uid=${encodeURIComponent(currentUser?.id || "")}&t=${Date.now()}`;
        whiskyFrame.onload = () => {
          syncWhiskyToolbarToFrame();
        };
        currentView = "whiskyList";
        setBackToWorldMapVisible(false, { mode: "world" });
        setWhiskyViewTitle("Whisky");
        return;
      }

      if (data.view === "home") {
        setWhiskyToolbarVisible(false);
        whiskyFrame.src = "";
        currentView = "home";
        setBackToWorldMapVisible(false, { mode: "world" });
        setWhiskyViewTitle("Whisky");
        return;
      }
    }

    if (data.type === "gdb-open-pli") {
      openModal(pliModal);
      stocksModal.querySelector(".modal-card")?.focus();
      return;
    }
    if (data.type === "gdb-open-ratings") {
      if (ratingsTitle) ratingsTitle.innerHTML = data.title || "Alle Bewertungen";
      if (ratingsBody) ratingsBody.innerHTML = data.html || "";
      openModal(ratingsModal);
      stocksModal.querySelector(".modal-card")?.focus();
      return;
    }
    if (e.data.type === "gdb-open-stocks") {
      if (stocksTitle) stocksTitle.innerHTML = e.data.title || "Bestände";
      if (stocksBody) stocksBody.innerHTML = e.data.html || "";
      openModal(stocksModal);
      stocksModal.querySelector(".modal-card")?.focus();
      return;
    }

  });
})();

