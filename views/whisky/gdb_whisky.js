// ==========================================================
    // 1) SUPABASE KONFIG (aus alter Whiskybibliothek übernommen)
    // ==========================================================
    const SUPABASE_URL = "https://dffqempnuqymcofvgkxx.supabase.co";
    const SUPABASE_ANON_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZnFlbXBudXF5bWNvZnZna3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTY3NDMsImV4cCI6MjA3NTU3Mjc0M30.jHxiRy2Q2dQpvA-RuV3xcJsAy3hkDm6psYnOeNjY6pA";

    import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // User-ID der aktuellen Anmeldung auslesen
    const params = new URLSearchParams(window.location.search);
    const CURRENT_UID = params.get("uid"); // eingeloggter Nutzer aus Parent

    // User-spezifische Daten (Stock) werden nachgeladen und gemappt
    let MY_STOCK_BY_ID = new Map();       // whisky_id -> stock (ml) vom eingeloggten User
    let OTHERS_STOCK_BY_ID = new Map();   // whisky_id -> stock-Summe (ml) aller anderen

    // User-spezifische Daten (Rating) werden nachgeladen und gemappt
    let MY_RATING_BY_ID = new Map();
    let AVG_RATING_BY_ID = new Map();   // whisky_id -> avg (0..10)
    let CNT_RATING_BY_ID = new Map();   // whisky_id -> count

    // User-spezifische Daten (PLI)
    let MY_PLI_BY_ID = new Map();
    let AVG_PLI_BY_ID = new Map();
    let CNT_PLI_BY_ID = new Map();

    // Alle Bestände pro Whisky (für Infobox)
    let STOCKS_BY_ID = new Map();      // whisky_id -> [{ user_id, stock }]
    let WHISKY_VOL_BY_ID = new Map();  // whisky_id -> volume_ml (Number)

    // Bewertungen pro Whisky (für Infobox)
    let RATINGS_BY_ID = new Map(); // whisky_id -> Array<{ user_id, rating }>
    let USER_NAME_BY_ID = new Map(); // user_id -> display_name

    // Whisky-Name nach ID (für Parent-Popup-Titel)
    let WHISKY_NAME_BY_ID = new Map(); // whisky_id -> name

    // PLI Min/Max Index (für Skala in Whisky Karte)
    let PLI_MIN = null;
    let PLI_MAX = null;

    //  User-spezifische Notizen
    let MY_NOTES_BY_ID = new Map();

    //  User-spezifische Farbe
    let MY_COLOR_BY_ID = new Map();

    //  User-spezifischer Geruch
    let MY_NOSE_BY_ID = new Map();

    //  User-spezifischer Geschmack
    let MY_PALATE_BY_ID = new Map();

    // User-spezifischer Finish
    let MY_FINISH_BY_ID = new Map();

    // User-spezifische Zusammenfassung
    let MY_SUMMARY_BY_ID = new Map();

    // User-spezifische Trinkgelegenheit
    let MY_TRINKGELEGENHEIT_BY_ID = new Map();

    let MY_WISHLIST_BY_ID = new Map();

    // whisky_id -> { created_at, updated_at }
    let WHISKY_META_BY_ID = new Map();

    // whisky_id -> created_at / updated_at (für Detail-View)
    let WHISKY_CREATED_AT_BY_ID = new Map();
    let WHISKY_UPDATED_AT_BY_ID = new Map();

    // whisky_id -> created_by / updated_by (für Detail-View)
    let WHISKY_CREATED_BY_BY_ID = new Map();
    let WHISKY_UPDATED_BY_BY_ID = new Map();

    // whisky_id -> my_created_at / my_updated_at (für Detail-View)
    let MY_CREATED_AT_BY_WHISKY_ID = new Map();
    let MY_UPDATED_AT_BY_WHISKY_ID = new Map();

    // Listenzustand (Toolbar / Filter)
    let ALL_WHISKYS = [];
    let CURRENT_SEARCH_TERM = "";
    let CURRENT_SORT_MODE = "name";
    let CURRENT_SORT_DIRECTION = "asc";
    let CURRENT_COMPARE_STOCK = false;
    let CURRENT_COMPARE_USER_ID = null;

    // ==========================================================
    // 2) THEME (minimal: Default dunkel, optional umstellbar später)
    // ==========================================================
    (function initTheme(){
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const useDark = saved ? (saved === "dark") : (prefersDark || true);
      document.body.classList.toggle("dark", useDark);
    })();

    // Parent benachrichtigen bei Popup-Öffnung/Schließung
    function notifyParentPopupOpen(){
      window.parent?.postMessage({ type: "popup-open" }, "*");
    }

    function notifyParentPopupClose(){
      window.parent?.postMessage({ type: "popup-close" }, "*");
    }
    // ==========================================================
    // 3) HELFER: Sterne, Durchschnitt, Stock-Farbe
    // ==========================================================

    function renderStars(value){
      if (value == null || isNaN(value)) return '<span class="muted">nicht bewertet</span>';
      const starsHalf = Math.round((value / 2) * 2) / 2; // 0..5 in 0.5
      let html = '<span class="stars readonly">';
      for (let i = 1; i <= 5; i++) {
        if (starsHalf >= i) html += `<span class="star full"></span>`;
        else if (starsHalf + 0.5 === i) html += `<span class="star half"></span>`;
        else html += `<span class="star"></span>`;
      }
      html += '</span>';
      return html;
    }

    function getStockColor(stock_ml, volume_ml) {
      const vol = Number(volume_ml);
      const stk = Number(stock_ml);
      if (!vol || vol <= 0 || isNaN(vol) || isNaN(stk)) return 'gray';
      const percent = (stk / vol) * 100;
      if (percent >= 90) return 'green';
      if (percent >= 75) return 'yellowgreen';
      if (percent >= 25) return 'yellow';
      if (percent >= 10) return 'orange';
      return 'red';
    }

    function escapeHtml(s){
      return s
        ? String(s).replace(/[&<>"']/g, c =>
            ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
          )
        : '';
    }

    function notifyParentWhiskyCount(count) {
      window.parent?.postMessage({ type: "gdb-whisky-count", count }, "*");
    }

    function getFilteredAndSortedList(list) {
    const search = (CURRENT_SEARCH_TERM || "").trim().toLowerCase();
    const terms = search.split(/\s+/).filter(Boolean);
      let result = Array.isArray(list) ? [...list] : [];

      if (terms.length) {
        result = result.filter((w) => {
          const haystack = [
            w.name,
            w.distillery,
            w.bottler,
            w.country,
            w.region,
            w.fasstyp,
            MY_NOTES_BY_ID.get(w.id),
            MY_COLOR_BY_ID.get(w.id),
            MY_NOSE_BY_ID.get(w.id),
            MY_PALATE_BY_ID.get(w.id),
            MY_FINISH_BY_ID.get(w.id),
            MY_SUMMARY_BY_ID.get(w.id),
            MY_TRINKGELEGENHEIT_BY_ID.get(w.id)
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return terms.every(term => haystack.includes(term));
        });
      }

      if (CURRENT_COMPARE_STOCK && CURRENT_COMPARE_USER_ID) {
        result = result.filter((w) => {
          const myStock = Number(MY_STOCK_BY_ID.get(w.id) ?? 0);
          if (!(myStock > 0)) return false;

          const stockRows = STOCKS_BY_ID.get(w.id) || [];
          return stockRows.some((row) =>
            row.user_id === CURRENT_COMPARE_USER_ID && Number(row.stock ?? 0) > 0
          );
        });
      }

      const dir = CURRENT_SORT_DIRECTION === "desc" ? -1 : 1;

      if (CURRENT_SORT_MODE === "rating_avg") {
        result.sort((a, b) => {
          const av = AVG_RATING_BY_ID.get(a.id);
          const bv = AVG_RATING_BY_ID.get(b.id);
          const aVal = (av == null || Number.isNaN(Number(av))) ? -1 : Number(av);
          const bVal = (bv == null || Number.isNaN(Number(bv))) ? -1 : Number(bv);

          if (aVal !== bVal) return (aVal - bVal) * dir;
          return (a.name || "").localeCompare((b.name || ""), "de", { sensitivity: "base" }) * dir;
        });

      } else if (CURRENT_SORT_MODE === "rating_user") {
        result.sort((a, b) => {
          const av = MY_RATING_BY_ID.get(a.id);
          const bv = MY_RATING_BY_ID.get(b.id);
          const aVal = (av == null || Number.isNaN(Number(av))) ? -1 : Number(av);
          const bVal = (bv == null || Number.isNaN(Number(bv))) ? -1 : Number(bv);

          if (aVal !== bVal) return (aVal - bVal) * dir;
          return (a.name || "").localeCompare((b.name || ""), "de", { sensitivity: "base" }) * dir;
        });

      } else if (CURRENT_SORT_MODE === "pli_avg") {
        result.sort((a, b) => {
          const av = AVG_PLI_BY_ID.get(a.id);
          const bv = AVG_PLI_BY_ID.get(b.id);
          const aVal = (av == null || Number.isNaN(Number(av))) ? -1 : Number(av);
          const bVal = (bv == null || Number.isNaN(Number(bv))) ? -1 : Number(bv);

          if (aVal !== bVal) return (aVal - bVal) * dir;
          return (a.name || "").localeCompare((b.name || ""), "de", { sensitivity: "base" }) * dir;
        });

      } else if (CURRENT_SORT_MODE === "pli_user") {
        result.sort((a, b) => {
          const av = MY_PLI_BY_ID.get(a.id);
          const bv = MY_PLI_BY_ID.get(b.id);
          const aVal = (av == null || Number.isNaN(Number(av))) ? -1 : Number(av);
          const bVal = (bv == null || Number.isNaN(Number(bv))) ? -1 : Number(bv);

          if (aVal !== bVal) return (aVal - bVal) * dir;
          return (a.name || "").localeCompare((b.name || ""), "de", { sensitivity: "base" }) * dir;
        });

      } else if (CURRENT_SORT_MODE === "price") {
        result.sort((a, b) => {
          const aVal = (a.price_eur == null || Number.isNaN(Number(a.price_eur))) ? Infinity : Number(a.price_eur);
          const bVal = (b.price_eur == null || Number.isNaN(Number(b.price_eur))) ? Infinity : Number(b.price_eur);

          if (aVal !== bVal) return (aVal - bVal) * dir;
          return (a.name || "").localeCompare((b.name || ""), "de", { sensitivity: "base" }) * dir;
        });

      } else if (CURRENT_SORT_MODE === "created") {
        result.sort((a, b) => {
          const aVal = new Date(a.created_at || 0).getTime();
          const bVal = new Date(b.created_at || 0).getTime();
          return (aVal - bVal) * dir;
        });

      } else if (CURRENT_SORT_MODE === "updated") {
        result.sort((a, b) => {
          const aVal = new Date(a.updated_at || 0).getTime();
          const bVal = new Date(b.updated_at || 0).getTime();
          return (aVal - bVal) * dir;
        });

      } else {
        result.sort((a, b) =>
          (a.name || "").localeCompare((b.name || ""), "de", { sensitivity: "base" }) * dir
        );
      }

      return result;
    }

    function rerenderCurrentList() {
      const nextList = getFilteredAndSortedList(ALL_WHISKYS);
      renderList(nextList);
      notifyParentWhiskyCount(nextList.length);
    }    

    // PLI Skala rendern
    function renderPliScale(v) {
      if (v === null || v === undefined || v === "") return `<span class="muted">–</span>`;

      const val = Number(v);
      let pct = 50;

      if (PLI_MIN !== null && PLI_MAX !== null && PLI_MAX !== PLI_MIN) {
        const t = (val - PLI_MIN) / (PLI_MAX - PLI_MIN);
        const clamped = Math.max(0, Math.min(1, t));
        pct = clamped * 100;
      }

      return `
        <div class="pli-scale" title="PLI Skala: min/max dynamisch">
          <span class="pli-marker" style="left:${pct}%;"></span>
        </div>
      `;
    }

// ==========================================================
// 4) RENDER: Nur Listenkarte (Übersichtskarte), NICHT klickbar
// ==========================================================
function renderList(list){
  const content = document.getElementById("content");

  if(!list || !list.length){
    content.innerHTML = "<p class='muted'>Keine Einträge gefunden.</p>";
    notifyParentWhiskyCount(0);
    return;
  }

  content.innerHTML = list.map(w => {
    const myRating10 = MY_RATING_BY_ID.get(w.id); // null oder 0..10

    const myPli = MY_PLI_BY_ID.get(w.id);
    const avgPli = AVG_PLI_BY_ID.get(w.id);
    const cntPli = CNT_PLI_BY_ID.get(w.id);

    const cardClass =
      (w.provisional ? "provisional" : (w.collector ? "collector" : ""));

    const imgSrc = w.image_url || "../../img/fallback_image.jpg";

    // Bestand-Balken:
    // - mein Bestand: gdb_whisky_user.stock für CURRENT_UID (ml)
    // - sonstige Bestände: Summe gdb_whisky_user.stock aller anderen (ml)
    const bottleMl = Number(w.volume_ml) || 0;

    const myBarMl = Math.max(0, Math.round(Number(MY_STOCK_BY_ID.get(w.id) ?? 0)));
    const friendsBarMl = Math.max(0, Math.round(Number(OTHERS_STOCK_BY_ID.get(w.id) ?? 0)));

    // Prozent (0..100) bezogen auf Flaschenvolumen
    const myBarPct = bottleMl > 0 ? Math.min(100, Math.round((myBarMl / bottleMl) * 100)) : 0;
    const friendsBarPct = bottleMl > 0 ? Math.min(100, Math.round((friendsBarMl / bottleMl) * 100)) : 0;

    const price = (w.price_eur != null && w.price_eur !== "")
      ? (Number(w.price_eur).toFixed(2) + " €")
      : "";

    const pricePerL = (w.price_per_liter_eur != null && w.price_per_liter_eur !== "")
      ? ("(" + Number(w.price_per_liter_eur).toFixed(2) + " €/L)")
      : "";

    const countryRegion =
      `${w.country || ""}${w.region ? " – " + w.region : ""}${w.age_years ? " • " + w.age_years + " Jahre" : ""}`;

    const flagHtml = `
      ${w.flag_url ? `<img src="${w.flag_url}" alt="${escapeHtml(w.country||"")}" style="height:1em;vertical-align:middle;margin-right:3px;">` : ""}
      ${w.region && w.region_flag_url ? `<img src="${w.region_flag_url}" alt="${escapeHtml(w.region||"")}" style="height:1em;vertical-align:middle;margin-right:3px;">` : ""}
    `;

    return `
      <div class="card ${cardClass}" data-whisky-id="${w.id}">
        <div class="row whisky-row">
          <div class="whisky-img-col">
            <div class="whisky-img-wrap">
              <img loading="lazy" src="${imgSrc}" class="whisky-img" alt="">
            </div>

            ${w.collector ? `
              <div class="collector-badge" title="Sammlerflasche">
                <img src="../../img/collectors_badge.png" alt="Sammlerflasche" class="collector-img">
              </div>
            ` : ""}
          </div>

          <div style="flex:1">
            <div class="card-infoblock">
              <strong>${escapeHtml(w.name || "")}</strong>
              ${w.distillery ? `<br>${escapeHtml(w.distillery)}` : ""}
              ${w.distillery && w.bottler ? " • " : (w.bottler ? "<br>" : "")}
              ${w.bottler ? `${escapeHtml(w.bottler)}` : ""}
              <br>

              <span class="muted">
                ${flagHtml}
                ${escapeHtml(countryRegion)}
              </span><br>

              <span>${w.volume_ml ?? "-"} ml | ${w.abv ?? "-"} % vol</span><br>
              <span>${price} ${pricePerL}</span>
            </div>

            <hr class="block-divider">
            
            <div class="metrics-block metrics-3col">

              <!-- Eigener Bestand -->
              <div class="metric-row" title="Dein aktueller Bestand (ml)">
                <div class="stockbar-label">Bestand</div>
                <div class="stockbar-track">
                  <div class="stockbar-fill" style="width:${100 - myBarPct}%;"></div>
                </div>
                <div class="stockbar-ml">${myBarMl} ml</div>
              </div>

              <!-- Sonstige Bestände -->
              <div class="metric-row" title="Bestand deiner Freunde (Summe ohne dich, ml)">
                <div class="stockbar-label">
                  sonstige
                  <span class="info-link" data-stock-info="${w.id}" title="Alle Bestände">ⓘ</span>
                </div>
                <div class="stockbar-track">
                  <div class="stockbar-fill" style="width:${100 - friendsBarPct}%;"></div>
                </div>
                <div class="stockbar-ml">${friendsBarMl} ml</div>
              </div>

            </div>

            <hr class="block-divider">

            <div class="metrics-block metrics-3col">
              <!-- Zeile 1: meine Bewertung -->
              <div class="stockbar-label" style="line-height:1;">Bewertung</div>
              <div class="stars-wrap detail-metrics">
                ${renderStars(myRating10)}
              </div>
              <div class="rating-num">
                ${myRating10 != null ? `${myRating10}/10` : ""}
              </div>

              <!-- Zeile 2: Ø Bewertung -->
              <div class="stockbar-label">
                Bewertung ⌀ <span class="info-link" data-rating-info="${w.id}" title="Alle Bewertungen">ⓘ</span>
              </div>
              <div class="stars-wrap detail-metrics">
                ${renderStars(AVG_RATING_BY_ID.get(w.id))}
              </div>
              <div class="rating-num">
                ${AVG_RATING_BY_ID.get(w.id) != null ? `${AVG_RATING_BY_ID.get(w.id).toFixed(1)}` : ""}
                ${CNT_RATING_BY_ID.get(w.id) ? ` (${CNT_RATING_BY_ID.get(w.id)})` : ""}
              </div>
            </div>

            <hr class="block-divider">

            <div class="metrics-block metrics-3col">
              <!-- Zeile 1: PLI -->
              <div class="stockbar-label" style="line-height:1;">
                PLI <span class="info-link" data-pli-info title="Info">ⓘ</span>
              </div>
              <div class="pli-scale-wrap">
                ${renderPliScale(myPli)}
              </div>
              <div class="rating-num">
                ${myPli != null ? `${myPli.toFixed(2)}` : ""}
              </div>

              <!-- Zeile 2: PLI Durchschnitt -->
              <div class="stockbar-label">PLI ⌀</div>
              <div class="pli-scale-wrap">
                ${renderPliScale(avgPli)}
              </div>
              <div class="rating-num">
                ${avgPli != null ? `${avgPli.toFixed(2)}` : ""}
                ${cntPli ? ` (${cntPli})` : ""}
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }).join("");
}

    // ==========================================================
    // 6) POPUPS (PLI + Bewertungen) werden im Parent gerendert
    //    -> iFrame sendet nur Events + Content via postMessage
    // ==========================================================
    (function initPopupBridge(){
      
      // PLI öffnen
      document.addEventListener("click", (e) => {
        const btn = e.target?.closest?.("[data-pli-info]");
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        window.parent?.postMessage({ type: "gdb-open-pli" }, "*");
      });

      // Bewertungen öffnen
      document.addEventListener("click", (e) => {
        const btn = e.target?.closest?.("[data-rating-info]");
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        const id = btn.getAttribute("data-rating-info");
        if (!id) return;

        const rows = RATINGS_BY_ID.get(id) || [];
        let html = "";
        if (!rows.length) {
          html = `<p class="muted">Noch keine Bewertungen vorhanden.</p>`;
        } else {
          const sorted = [...rows].sort((a,b) => (b.rating ?? 0) - (a.rating ?? 0));
          html = `
            <div style="display:grid; grid-template-columns: 1fr auto; gap:8px 12px; align-items:center;">
              ${sorted.map(r => {
                const name = USER_NAME_BY_ID.get(r.user_id) || "Unbekannt";
                const val = (r.rating != null) ? Number(r.rating) : null;
                return `
                  <div>${escapeHtml(name)}</div>
                  <div style="display:flex; gap:10px; align-items:center; justify-content:flex-end;">
                    ${renderStars(val)}
                    <span class="rating-num">${val != null ? `${val}/10` : ""}</span>
                  </div>
                `;
              }).join("")}
            </div>
          `;
        }

        const whiskyName = WHISKY_NAME_BY_ID.get(id) || "";
        window.parent?.postMessage({
          type: "gdb-open-ratings",
          whiskyId: id,
          title: whiskyName
            ? `Bewertungen<br><small>${whiskyName}</small>`
            : "Bewertungen",
          html
        }, "*");
      });
    })();

    // Bestände öffnen
    document.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("[data-stock-info]");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const whiskyId = btn.getAttribute("data-stock-info");
      if (!whiskyId) return;

      const rows = STOCKS_BY_ID.get(whiskyId) || [];
      const vol = WHISKY_VOL_BY_ID.get(whiskyId) || 0;

      let html = "";
      if (!rows.length) {
        html = `<p class="muted">Keine Bestände vorhanden.</p>`;
      } else {
        const sorted = [...rows].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));

        html = `
          <div class="metrics-block metrics-3col-popup">
            ${sorted.map(r => {
              const name = USER_NAME_BY_ID.get(r.user_id) || "Unbekannt";
              const ml = Number(r.stock ?? 0);

              const pct = (vol > 0) ? Math.max(0, Math.min(100, (ml / vol) * 100)) : 0;
              const empty = 100 - pct;

              return `
                <div class="metric-row">
                  <div class="stockbar-label">${escapeHtml(name)}</div>
                  <div class="stockbar-track">
                    <div class="stockbar-fill" style="width:${empty}%;"></div>
                  </div>
                  <div class="stockbar-ml">${Math.round(ml)} ml</div>
                </div>
              `;
            }).join("")}
          </div>
        `;
      }

      const whiskyName = WHISKY_NAME_BY_ID.get(whiskyId) || "";
      window.parent?.postMessage({
        type: "gdb-open-stocks",
        whiskyId,
        title: whiskyName
          ? `Bestände<br><small>${whiskyName}</small>`
          : "Bestände",
        html
      }, "*");
    });

// ==========================================================
// 8) START: Sofort laden und rendern
// ==========================================================
async function boot(){
  console.time("boot_total");

  const content = document.getElementById("content");
  content.innerHTML = "<p class='muted'>Lade Whiskys …</p>";

  // --- 1) Whiskys laden ---
  console.time("q_whiskys");
  const { data, error } = await supabase
    .from("gdb_whiskys")
    .select([
      "id",
      "name",
      "distillery",
      "bottler",
      "country",
      "region",
      "fasstyp",
      "flag_url",
      "region_flag_url",
      "age_years",
      "volume_ml",
      "abv",
      "price_eur",
      "price_per_liter_eur",
      "image_url",
      "provisional",
      "collector",
      "created_at",
      "updated_at",
      "created_by",
      "updated_by",
    ].join(","))
    .order("created_at", { ascending: false });

  console.timeEnd("q_whiskys");

  if (error) {
    content.innerHTML = `<p class="muted">Fehler: ${escapeHtml(error.message)}</p>`;
    console.timeEnd("boot_total");
    return;
  }

  // --- Bestände laden: mein Bestand (CURRENT_UID) + sonstige (Summe ohne mich) ---
  MY_STOCK_BY_ID = new Map();
  OTHERS_STOCK_BY_ID = new Map();
  WHISKY_VOL_BY_ID = new Map((data || []).map(w => [w.id, Number(w.volume_ml ?? 0)]));

  // Wir definieren ids EINMAL sauber (wird mehrfach gebraucht)
  const ids = (data || []).map(w => w.id);

  // Promises vorbereiten (laufen parallel los)
  console.time("q_parallel_total");

  const myRowsPromise = (CURRENT_UID && ids.length)
    ? supabase
        .from("gdb_whisky_user")
        .select("whisky_id, stock, rating, pli, notes, t_color, t_nose, t_palate, t_finish, t_summary, t_trinkgelegenheit, wishlist, created_at, updated_at")
        .eq("user_id", CURRENT_UID)
        .in("whisky_id", ids)
    : Promise.resolve({ data: [], error: null });

  const stockRowsAllPromise = (CURRENT_UID && ids.length)
    ? supabase
        .from("gdb_whisky_user")
        .select("whisky_id, user_id, stock")
        .in("whisky_id", ids)
        .not("stock", "is", null)
    : Promise.resolve({ data: [], error: null });

  const ratingRowsPromise = ids.length
    ? supabase
        .from("gdb_whisky_user")
        .select("whisky_id, user_id, rating")
        .in("whisky_id", ids)
        .not("rating", "is", null)
    : Promise.resolve({ data: [], error: null });

  const pliRowsAllPromise = ids.length
    ? supabase
        .from("gdb_whisky_user")
        .select("whisky_id, pli")
        .in("whisky_id", ids)
    : Promise.resolve({ data: [], error: null });

  // parallel abholen
  const [
    { data: myRows, error: myErr },
    { data: stockRowsAll, error: stockAllErr },
    { data: ratingRows, error: ratingErr },
    { data: pliRowsAll, error: pliErr },
  ] = await Promise.all([
    myRowsPromise,
    stockRowsAllPromise,
    ratingRowsPromise,
    pliRowsAllPromise,
  ]);

  console.timeEnd("q_parallel_total");

  // --- 2) Mein User-Block ---
  if (CURRENT_UID && ids.length) {

    if (!myErr && myRows) {
      for (const r of myRows) {
        MY_STOCK_BY_ID.set(r.whisky_id, Number(r.stock ?? 0));
        MY_RATING_BY_ID.set(
          r.whisky_id,
          (r.rating === null || r.rating === undefined) ? null : Number(r.rating)
        );
        MY_PLI_BY_ID.set(
          r.whisky_id,
          (r.pli === null || r.pli === undefined) ? null : Number(r.pli)
        );
        MY_NOTES_BY_ID.set(r.whisky_id, (r.notes ?? "").toString());
        MY_COLOR_BY_ID.set(r.whisky_id, (r.t_color ?? "").toString());
        MY_NOSE_BY_ID.set(r.whisky_id, (r.t_nose ?? "").toString());
        MY_PALATE_BY_ID.set(r.whisky_id, (r.t_palate ?? "").toString());
        MY_FINISH_BY_ID.set(r.whisky_id, (r.t_finish ?? "").toString());
        MY_SUMMARY_BY_ID.set(r.whisky_id, (r.t_summary ?? "").toString());
        MY_TRINKGELEGENHEIT_BY_ID.set(r.whisky_id, (r.t_trinkgelegenheit ?? "").toString());
        MY_WISHLIST_BY_ID.set(r.whisky_id, !!r.wishlist);
        WHISKY_CREATED_AT_BY_ID = new Map((data || []).map(w => [w.id, w.created_at || ""]));
        WHISKY_UPDATED_AT_BY_ID = new Map((data || []).map(w => [w.id, w.updated_at || ""]));
        WHISKY_CREATED_BY_BY_ID = new Map((data || []).map(w => [w.id, w.created_by || ""]));
        WHISKY_UPDATED_BY_BY_ID = new Map((data || []).map(w => [w.id, w.updated_by || ""]));
        MY_CREATED_AT_BY_WHISKY_ID.set(r.whisky_id, r.created_at || "");
        MY_UPDATED_AT_BY_WHISKY_ID.set(r.whisky_id, r.updated_at || "");
      }
    }

    // --- 3) Alle Bestände (für Popup + sonstige Summe) ---
    STOCKS_BY_ID = new Map();

    if (!stockAllErr && stockRowsAll) {
      for (const r of stockRowsAll) {
        const ml = Number(r.stock ?? 0);
        if (ml <= 0) continue;

        const key = r.whisky_id;
        if (!STOCKS_BY_ID.has(key)) STOCKS_BY_ID.set(key, []);
        STOCKS_BY_ID.get(key).push({ user_id: r.user_id, stock: ml });
      }

      OTHERS_STOCK_BY_ID = new Map();
      for (const [whiskyId, rows] of STOCKS_BY_ID.entries()) {
        let sum = 0;
        for (const r of rows) {
          if (r.user_id === CURRENT_UID) continue;
          sum += Number(r.stock ?? 0);
        }
        OTHERS_STOCK_BY_ID.set(whiskyId, sum);
      }
    }
  } else {
    // wichtig: wenn CURRENT_UID fehlt, müssen diese Maps trotzdem existieren
    STOCKS_BY_ID = new Map();
  }

  // --- 4) Bewertungen (alle) für Ø + Popup ---
  AVG_RATING_BY_ID = new Map();
  CNT_RATING_BY_ID = new Map();
  RATINGS_BY_ID = new Map(); // wichtig: immer initialisieren, sonst knallt später USER-Loop

  if (ids.length) {

    if (!ratingErr && ratingRows) {
      const sum = new Map();
      const cnt = new Map();

      for (const r of ratingRows) {
        const k = r.whisky_id;
        const v = Number(r.rating);
        if (Number.isNaN(v)) continue;

        sum.set(k, (sum.get(k) || 0) + v);
        cnt.set(k, (cnt.get(k) || 0) + 1);

        if (!RATINGS_BY_ID.has(k)) RATINGS_BY_ID.set(k, []);
        RATINGS_BY_ID.get(k).push({ user_id: r.user_id, rating: v });
      }

      for (const [k, c] of cnt.entries()) {
        const s = sum.get(k) || 0;
        CNT_RATING_BY_ID.set(k, c);
        AVG_RATING_BY_ID.set(k, s / c);
      }
    }

    // --- 5) PLI (alle) für Ø + min/max ---
    AVG_PLI_BY_ID = new Map();
    CNT_PLI_BY_ID = new Map();

    if (!pliErr && pliRowsAll) {
      const sum = new Map();
      const cnt = new Map();

      let min = null;
      let max = null;

      for (const r of pliRowsAll) {
        const vRaw = r.pli;
        if (vRaw === null || vRaw === undefined || vRaw === "") continue;

        const k = r.whisky_id;
        const v = Number(vRaw);
        if (Number.isNaN(v)) continue;

        sum.set(k, (sum.get(k) || 0) + v);
        cnt.set(k, (cnt.get(k) || 0) + 1);

        if (min === null || v < min) min = v;
        if (max === null || v > max) max = v;
      }

      PLI_MIN = min;
      PLI_MAX = max;

      for (const [k, c] of cnt.entries()) {
        if (c > 0) {
          AVG_PLI_BY_ID.set(k, (sum.get(k) || 0) / c);
          CNT_PLI_BY_ID.set(k, c);
        }
      }
    }
  } else {
    AVG_PLI_BY_ID = new Map();
    CNT_PLI_BY_ID = new Map();
    PLI_MIN = null;
    PLI_MAX = null;
  }

  // --- 6) Display-Namen für alle User laden ---
  USER_NAME_BY_ID = new Map();

  const userIds = new Set();
  for (const arr of RATINGS_BY_ID.values()) {
    for (const r of arr) userIds.add(r.user_id);
  }
  for (const rows of STOCKS_BY_ID.values()) {
    for (const r of rows) userIds.add(r.user_id);
  }

  // zusätzlich: created_by / updated_by aus Stammdaten in den User-Pool aufnehmen
  for (const w of (data || [])) {
    if (w.created_by) userIds.add(w.created_by);
    if (w.updated_by) userIds.add(w.updated_by);
  }
  
  if (userIds.size) {
    console.time("q_users");
    const { data: users, error: usersErr } = await supabase
      .from("gdb_users")
      .select("id, display_name")
      .in("id", Array.from(userIds));
    console.timeEnd("q_users");

    if (!usersErr && users) {
      for (const u of users) {
        USER_NAME_BY_ID.set(u.id, u.display_name || "Unbekannt");
      }
    }
  }

  // Namen-Mapping für Popups im Parent
  WHISKY_NAME_BY_ID = new Map((data || []).map(w => [w.id, w.name || ""]));

  WHISKY_META_BY_ID = new Map((data || []).map(w => [w.id, {
    created_at: w.created_at || "",
    updated_at: w.updated_at || ""
  }]));

  console.time("renderList");
  ALL_WHISKYS = data || [];
  rerenderCurrentList();
  console.timeEnd("renderList");

  console.timeEnd("boot_total");
}

    const overlay = document.getElementById("globalOverlay");
    const whiskyFrame = document.getElementById("whiskyFrame");

    window.addEventListener("message", (e) => {
      
      if (!e.data || !e.data.type) return;

      if (e.data.type === "popup-open") {
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
      }

      if (e.data.type === "popup-close") {
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
      }

      if (e.data.type === "gdb-set-search") {
        CURRENT_SEARCH_TERM = (e.data.value || "").toString();
        rerenderCurrentList();
      }

      if (e.data.type === "gdb-set-sort") {
        CURRENT_SORT_MODE = (e.data.value?.mode || "name").toString();
        CURRENT_SORT_DIRECTION = (e.data.value?.dir || "asc").toString();
        rerenderCurrentList();
      }

      if (e.data.type === "gdb-set-compare-stock") {
        CURRENT_COMPARE_STOCK = !!e.data.value?.enabled;
        CURRENT_COMPARE_USER_ID = e.data.value?.userId || null;
        rerenderCurrentList();
      }
    });

    boot();

// Karten-Klick -> Parent-Navigation (Detailansicht kommt später)
document.addEventListener("click", (e) => {
  // nicht auslösen, wenn auf Buttons/Links innerhalb der Karte geklickt wird
  if (e.target.closest("button, a, .info-btn")) return;
  if (e.target.closest(".info-link")) return;

  const card = e.target.closest(".card[data-whisky-id]");
  if (!card) return;

  const whiskyId = card.getAttribute("data-whisky-id");
  if (!whiskyId) return;

  const avgRating = AVG_RATING_BY_ID.get(whiskyId);
  const cntRating = CNT_RATING_BY_ID.get(whiskyId) || 0;

  const avgPli = AVG_PLI_BY_ID.get(whiskyId);
  const cntPli = CNT_PLI_BY_ID.get(whiskyId) || 0;

  const pliMin = PLI_MIN;
  const pliMax = PLI_MAX;

  const myStockMl = MY_STOCK_BY_ID.get(whiskyId) || 0;
  const myRating = MY_RATING_BY_ID.get(whiskyId);
  const myPli    = MY_PLI_BY_ID.get(whiskyId);

  const myNotes = MY_NOTES_BY_ID.get(whiskyId) || "";
  const myColor = MY_COLOR_BY_ID.get(whiskyId) || "";
  const myNose  = MY_NOSE_BY_ID.get(whiskyId) || "";
  const myPalate = MY_PALATE_BY_ID.get(whiskyId) || "";
  const myFinish = MY_FINISH_BY_ID.get(whiskyId) || "";
  const mySummary = MY_SUMMARY_BY_ID.get(whiskyId) || "";
  const myTrinkgelegenheit = MY_TRINKGELEGENHEIT_BY_ID.get(whiskyId) || "";
  const myWishlist = MY_WISHLIST_BY_ID.get(whiskyId) ? 1 : 0;

  const createdById = WHISKY_CREATED_BY_BY_ID.get(whiskyId) || "";
  const updatedById = WHISKY_UPDATED_BY_BY_ID.get(whiskyId) || "";

  const createdByName = (createdById && USER_NAME_BY_ID.get(createdById)) ? USER_NAME_BY_ID.get(createdById) : (createdById || "");
  const updatedByName = (updatedById && USER_NAME_BY_ID.get(updatedById)) ? USER_NAME_BY_ID.get(updatedById) : (updatedById || "");

  // console.log("NAV_PAYLOAD", whiskyId, avgPli, cntPli);
  console.log("NAV payload test", { whiskyId, myColor: (MY_COLOR_BY_ID?.get(whiskyId) ?? null) });

  window.parent.postMessage(
  {
    type: "nav",
    view: "whiskyDetail",
    id: whiskyId,
    avgRating, 
    cntRating,
    avgPli, cntPli,
    pliMin, pliMax,
    myStockMl: myStockMl,
    myRating: (myRating == null ? "" : myRating),
    myPli: (myPli == null ? "" : myPli),
    myNotes: myNotes,
    myColor: myColor,
    myNose: myNose,
    myPalate: myPalate,
    myFinish: myFinish,
    mySummary: mySummary,
    myTrinkgelegenheit: myTrinkgelegenheit,
    myWishlist: myWishlist,
    created_at: WHISKY_CREATED_AT_BY_ID.get(whiskyId) || "",
    updated_at: WHISKY_UPDATED_AT_BY_ID.get(whiskyId) || "",

    created_by: createdByName,
    updated_by: updatedByName,

    my_created_at: MY_CREATED_AT_BY_WHISKY_ID.get(whiskyId) || "",
    my_updated_at: MY_UPDATED_AT_BY_WHISKY_ID.get(whiskyId) || "",

    // optional (für später Admin/Debug – kann drin bleiben)
    created_by_id: createdById,
    updated_by_id: updatedById,
  },
  "*"
);
  
}); 
