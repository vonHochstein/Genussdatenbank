const SUPABASE_URL = "https://dffqempnuqymcofvgkxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZnFlbXBudXF5bWNvZnZna3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTY3NDMsImV4cCI6MjA3NTU3Mjc0M30.jHxiRy2Q2dQpvA-RuV3xcJsAy3hkDm6psYnOeNjY6pA";

const params = new URLSearchParams(window.location.search);
const uid = params.get("uid") || "";

const statsGridEl = document.getElementById("dashboardStatsGrid");
const careListEl = document.getElementById("dashboardCareList");
const worldMapEl = document.getElementById("dashboardWorldMap");
const mapSelectionTitleEl = document.getElementById("dashboardMapSelectionTitle");
const mapSelectionHintEl = document.getElementById("dashboardMapSelectionHint");
const mapSelectionListEl = document.getElementById("dashboardMapSelectionList");

const mapStatusValueEl = document.getElementById("dashboardMapStatusValue");
const mapBackButtonEl = document.getElementById("dashboardMapBackButton");
const mapIntroEl = document.getElementById("dashboardMapIntro");

let currentCareItems = [];
let currentCareExpandedKey = null;
let currentWhiskys = [];
let currentUserRows = [];

let currentMapView = "world";
let currentMapCountry = null;
let currentMapRegion = null;
let currentSelectedRegionNode = null;

let worldMapViewBoxState = null;
let worldMapPointerState = {
  active: false,
  pointerId: null,
  startClientX: 0,
  startClientY: 0,
  lastClientX: 0,
  lastClientY: 0,
  moved: false,
  suppressClickUntil: 0,
  downTarget: null
};
let worldMapTouchState = {
  pinchActive: false,
  lastDistance: 0,
  lastMidX: 0,
  lastMidY: 0
};

const WORLD_MAP_SVG_PATH = "../../assets/maps/BlankMap-World.svg";
const GERMANY_MAP_SVG_PATH = "../../assets/maps/BlankMap-Germany.svg";
const SCOTLAND_MAP_SVG_PATH = "../../assets/maps/BlankMap-Scottland.svg";
const USA_MAP_SVG_PATH = "../../assets/maps/BlankMap-USA.svg";
const UK_MAP_SVG_PATH = "../../assets/maps/BlankMap-UK.svg";
const WORLD_MAP_CONFIG = {
  "Deutschland": {
    selectors: ["#de", "g#de", "[id='de']", "[class~='de']", "[name='de']", "[inkscape\\:label='de']", "[title='Germany']", "[aria-label='Germany']"],
    focusViewBox: "450 150 120 120",
    statusLabel: "Deutschland",
    entryCountries: ["Deutschland"],
    regionMap: {
      type: "svg",
      path: GERMANY_MAP_SVG_PATH,
      statusLabel: "Deutschland – Bundesländer"
    }
  },
  "Großbritannien & Irland": {
    selectors: [
      "#gb", "g#gb", "[id='gb']", "[class~='gb']", "[name='gb']", "[inkscape\\:label='gb']", "[title='United Kingdom']", "[aria-label='United Kingdom']",
      "#ie", "g#ie", "[id='ie']", "[class~='ie']", "[name='ie']", "[inkscape\\:label='ie']", "[title='Ireland']", "[aria-label='Ireland']"
    ],
    focusViewBox: "330 85 200 180",
    statusLabel: "Großbritannien & Irland",
    entryCountries: ["Schottland", "Irland", "Nordirland", "England", "Wales", "Großbritannien", "Vereinigtes Königreich"],
    regionMap: {
      type: "svg",
      path: UK_MAP_SVG_PATH,
      mode: "subregions",
      statusLabel: "Großbritannien & Irland"
    }
  },
  "USA": {
    selectors: ["#us", "g#us", "[id='us']", "[class~='us']", "[name='us']", "[inkscape\\:label='us']", "[title='United States']", "[aria-label='United States']"],
    focusViewBox: "120 160 270 130",
    statusLabel: "USA",
    entryCountries: ["USA"],
    regionMap: {
      type: "svg",
      path: USA_MAP_SVG_PATH,
      statusLabel: "USA – Bundesstaaten"
    }
  },
  "Japan": {
    selectors: ["#jp", "g#jp", "[id='jp']", "[class~='jp']", "[name='jp']", "[inkscape\\:label='jp']", "[title='Japan']", "[aria-label='Japan']"],
    focusViewBox: "1090 170 120 120",
    statusLabel: "Japan",
    entryCountries: ["Japan"]
  },
  "Finnland": {
    selectors: ["#fi", "g#fi", "[id='fi']", "[class~='fi']", "[name='fi']", "[inkscape\\:label='fi']", "[title='Finland']", "[aria-label='Finland']"],
    focusViewBox: "500 60 130 140",
    statusLabel: "Finnland",
    entryCountries: ["Finnland"]
  },
  "Schweiz": {
    selectors: ["#ch", "g#ch", "[id='ch']", "[class~='ch']", "[name='ch']", "[inkscape\\:label='ch']", "[title='Switzerland']", "[aria-label='Switzerland']"],
    focusViewBox: "470 175 90 70",
    statusLabel: "Schweiz",
    entryCountries: ["Schweiz"]
  },
  "Kanada": {
    selectors: ["#ca", "g#ca", "[id='ca']", "[class~='ca']", "[name='ca']", "[inkscape\\:label='ca']", "[title='Canada']", "[aria-label='Canada']"],
    focusViewBox: "80 55 320 160",
    statusLabel: "Kanada",
    entryCountries: ["Kanada"]
  },
  "Taiwan": {
    selectors: ["#tw", "g#tw", "[id='tw']", "[class~='tw']", "[name='tw']", "[inkscape\\:label='tw']", "[title='Taiwan']", "[aria-label='Taiwan']"],
    focusViewBox: "1025 215 95 95",
    statusLabel: "Taiwan",
    entryCountries: ["Taiwan"]
  },
  "Indien": {
    selectors: ["#in", "g#in", "[id='in']", "[class~='in']", "[name='in']", "[inkscape\\:label='in']", "[title='India']", "[aria-label='India']"],
    focusViewBox: "760 220 175 150",
    statusLabel: "Indien",
    entryCountries: ["Indien"]
  },
  "Australien": {
    selectors: ["#au", "g#au", "[id='au']", "[class~='au']", "[name='au']", "[inkscape\\:label='au']", "[title='Australia']", "[aria-label='Australia']"],
    focusViewBox: "1040 360 250 150",
    statusLabel: "Australien",
    entryCountries: ["Australien"]
  }
};

const GERMANY_REGION_CONFIG = {
  "Baden-Württemberg": { id: "Baden-Württemberg" },
  "Bayern": { id: "Bayern" },
  "Berlin": { id: "Berlin" },
  "Brandenburg": { id: "Brandenburg" },
  "Bremen": { id: "Bremen" },
  "Hamburg": { id: "Hamburg" },
  "Hessen": { id: "Hessen" },
  "Mecklenburg-Vorpommern": { id: "Mecklenburg-Vorpommern" },
  "Niedersachsen": { id: "Niedersachsen" },
  "Nordrhein-Westfalen": { id: "Nordrhein-Westfalen" },
  "Rheinland-Pfalz": { id: "Rheinland-Pfalz" },
  "Saarland": { id: "Saarland" },
  "Sachsen": { id: "Sachsen" },
  "Sachsen-Anhalt": { id: "Sachsen-Anhalt" },
  "Schleswig-Holstein": { id: "Schleswig-Holstein" },
  "Thüringen": { id: "Thüringen" }
};

const SCOTLAND_REGION_CONFIG = {
  "Lowlands": { id: "scotland-lowlands" },
  "Highlands": { id: "scotland-highlands" },
  "Speyside": { id: "scotland-speyside" },
  "Islands": { id: "scotland-islands" },
  "Campbeltown": { id: "scotland-campbeltown" },
  "Islay": { id: "scotland-islay" }
};

const USA_REGION_CONFIG = {
  "Alabama": { id: "AL" },
  "Alaska": { id: "AK" },
  "Arizona": { id: "AZ" },
  "Arkansas": { id: "AR" },
  "California": { id: "CA" },
  "Colorado": { id: "CO" },
  "Connecticut": { id: "CT" },
  "Delaware": { id: "DE" },
  "Florida": { id: "FL" },
  "Georgia": { id: "GA" },
  "Hawaii": { id: "HI" },
  "Idaho": { id: "ID" },
  "Illinois": { id: "IL" },
  "Indiana": { id: "IN" },
  "Iowa": { id: "IA" },
  "Kansas": { id: "KS" },
  "Kentucky": { id: "KY" },
  "Louisiana": { id: "LA" },
  "Maine": { id: "ME" },
  "Maryland": { id: "MD" },
  "Massachusetts": { id: "MA" },
  "Michigan": { id: "MI" },
  "Minnesota": { id: "MN" },
  "Mississippi": { id: "MS" },
  "Missouri": { id: "MO" },
  "Montana": { id: "MT" },
  "Nebraska": { id: "NE" },
  "Nevada": { id: "NV" },
  "New Hampshire": { id: "NH" },
  "New Jersey": { id: "NJ" },
  "New Mexico": { id: "NM" },
  "New York": { id: "NY" },
  "North Carolina": { id: "NC" },
  "North Dakota": { id: "ND" },
  "Ohio": { id: "OH" },
  "Oklahoma": { id: "OK" },
  "Oregon": { id: "OR" },
  "Pennsylvania": { id: "PA" },
  "Rhode Island": { id: "RI" },
  "South Carolina": { id: "SC" },
  "South Dakota": { id: "SD" },
  "Tennessee": { id: "TN" },
  "Texas": { id: "TX" },
  "Utah": { id: "UT" },
  "Vermont": { id: "VT" },
  "Virginia": { id: "VA" },
  "Washington": { id: "WA" },
  "West Virginia": { id: "WV" },
  "Wisconsin": { id: "WI" },
  "Wyoming": { id: "WY" }
};

const UK_SUBREGION_CONFIG = {
  "Schottland": {
    selectors: ["#GB-SCT"],
    entryCountries: ["Schottland"],
    action: "regionMap"
  },
  "England": {
    selectors: ["#GB-ENG"],
    entryCountries: ["England", "Großbritannien", "Vereinigtes Königreich"],
    action: "countryList"
  },
  "Wales": {
    selectors: ["#GB-WLS"],
    entryCountries: ["Wales", "Großbritannien", "Vereinigtes Königreich"],
    action: "countryList"
  },
  "Nordirland": {
    selectors: ["#GB-NIR"],
    entryCountries: ["Nordirland"],
    action: "countryList"
  },
  "Irland": {
    selectors: ["#IE"],
    entryCountries: ["Irland"],
    action: "countryList"
  }
};

function fmtNum(val, digits = 2) {
  const n = Number(val);
  if (!Number.isFinite(n)) return "–";
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function notifyParentAboutMapState() {
  const backMode = isScotlandRegionMapActive() ? "uk" : "world";

  window.parent?.postMessage({
    type: "gdb-dashboard-map-state",
    showWorldBack: currentMapView !== "world",
    backMode
  }, "*");
}


function getDashboardReturnContext() {
  return {
    source: "whiskyDashboard",
    view: "whiskyDashboard",
    mapView: currentMapView,
    mapCountry: currentMapCountry,
    mapRegion: currentMapRegion
  };
}

function openWhiskyDetail(whiskyId) {
  if (!whiskyId) return;

  const returnContext = getDashboardReturnContext();

  try {
    sessionStorage.setItem("gdbWhiskyDashboardReturnContext", JSON.stringify(returnContext));
  } catch (_) {
    // ignore sessionStorage errors
  }

  window.parent?.postMessage({
    type: "nav",
    view: "whiskyDetail",
    id: whiskyId,
    source: "whiskyDashboard",
    returnContext
  }, "*");
}

function readDashboardReturnContext() {
  try {
    const raw = sessionStorage.getItem("gdbWhiskyDashboardReturnContext");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.view !== "whiskyDashboard") return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

function clearDashboardReturnContext() {
  try {
    sessionStorage.removeItem("gdbWhiskyDashboardReturnContext");
  } catch (_) {
    // ignore sessionStorage errors
  }
}

async function restoreDashboardFromReturnContext() {
  const returnContext = readDashboardReturnContext();
  if (!returnContext) return false;

  clearDashboardReturnContext();

  if (returnContext.mapView === "country-regions" && returnContext.mapCountry === "Deutschland") {
    currentMapCountry = "Deutschland";
    currentMapRegion = returnContext.mapRegion || null;
    currentSelectedRegionNode = null;
    await loadCountryRegionMap("Deutschland", GERMANY_MAP_SVG_PATH);
    return true;
  }

  if (returnContext.mapView === "country-regions" && returnContext.mapCountry === "Schottland") {
    currentMapCountry = "Schottland";
    currentMapRegion = returnContext.mapRegion || null;
    currentSelectedRegionNode = null;
    await loadCountryRegionMap("Schottland", SCOTLAND_MAP_SVG_PATH);
    return true;
  }

  if (returnContext.mapView === "country-regions" && returnContext.mapCountry === "USA") {
    currentMapCountry = "USA";
    currentMapRegion = returnContext.mapRegion || null;
    currentSelectedRegionNode = null;
    await loadCountryRegionMap("USA", USA_MAP_SVG_PATH);
    return true;
  }

  if (returnContext.mapView === "country-subregions" && returnContext.mapCountry === "Großbritannien & Irland") {
    currentMapCountry = "Großbritannien & Irland";
    currentMapRegion = returnContext.mapRegion || null;
    currentSelectedRegionNode = null;
    await loadCountryRegionMap("Großbritannien & Irland", UK_MAP_SVG_PATH);
    return true;
  }

  if (returnContext.mapView === "world") {
    currentMapView = "world";
    currentMapCountry = null;
    currentMapRegion = null;
    currentSelectedRegionNode = null;
    await loadWorldMapSvg();
    return true;
  }

  return false;
}

function renderCareDetails(items) {
  if (!items.length) {
    return `<div class="dashboard-empty">Keine passenden Einträge gefunden.</div>`;
  }

  return items.map((item) => {
    const title = escapeHtml(item.name || "Unbenannter Whisky");
    const metaParts = [];
    if ((item.country || "").trim()) metaParts.push(escapeHtml(item.country));
    if ((item.region || "").trim()) metaParts.push(escapeHtml(item.region));
    if ((item.distillery || "").trim()) metaParts.push(escapeHtml(item.distillery));
    const meta = metaParts.join(" · ");

    return `
      <button type="button" class="dashboard-list-item dashboard-care-detail-item" data-care-whisky-id="${escapeHtml(item.id)}">
        <div class="dashboard-list-item-title">${title}</div>
        <div class="dashboard-list-item-meta">${meta || "–"}</div>
      </button>
    `;
  }).join("");
}

function renderStats(stats) {
  statsGridEl.innerHTML = `
    <div class="dashboard-stat card">
      <div class="dashboard-stat-value">${stats.totalWhiskys}</div>
      <div class="dashboard-stat-label">Whiskys gesamt</div>
    </div>

    <div class="dashboard-stat card">
      <div class="dashboard-stat-value">${stats.totalCountries}</div>
      <div class="dashboard-stat-label">Länder</div>
    </div>

    <div class="dashboard-stat card">
      <div class="dashboard-stat-value">${stats.avgRating}</div>
      <div class="dashboard-stat-label">Ø Bewertung</div>
    </div>

    <div class="dashboard-stat card">
      <div class="dashboard-stat-value">${stats.avgPli}</div>
      <div class="dashboard-stat-label">Ø PLI</div>
    </div>

    <div class="dashboard-stat card">
      <div class="dashboard-stat-value">${stats.collectorCount}</div>
      <div class="dashboard-stat-label">${stats.collectorCount === 1 ? "Sammlerflasche" : "Sammlerflaschen"}</div>
    </div>

    <div class="dashboard-stat card">
      <div class="dashboard-stat-value">${stats.provisionalCount}</div>
      <div class="dashboard-stat-label">${stats.provisionalCount === 1 ? "Vorläufiger Eintrag" : "Vorläufige Einträge"}</div>
    </div>
  `;
}

function renderCare(items) {
  currentCareItems = Array.isArray(items) ? items : [];

  if (!currentCareItems.length) {
    careListEl.innerHTML = `<div class="dashboard-empty">Kein Pflegebedarf erkannt.</div>`;
    return;
  }

  careListEl.innerHTML = currentCareItems.map((item) => {
    const isOpen = currentCareExpandedKey === item.key;
    const detailsHtml = isOpen
      ? `<div class="dashboard-care-details">${renderCareDetails(item.entries || [])}</div>`
      : "";

    return `
      <div class="dashboard-care-block">
        <button type="button" class="dashboard-list-item dashboard-care-toggle${isOpen ? " is-open" : ""}" data-care-key="${escapeHtml(item.key)}">
          <div class="dashboard-list-item-title">${escapeHtml(item.label)}</div>
          <div class="dashboard-list-item-meta">${item.value}</div>
        </button>
        ${detailsHtml}
      </div>
    `;
  }).join("");
}

function renderMapPlaceholder(message = "Weltkarte wird vorbereitet…") {
  if (worldMapEl) {
    worldMapEl.innerHTML = `<div class="dashboard-empty">${escapeHtml(message)}</div>`;
  }

  if (mapStatusValueEl) {
    if (currentMapView === "world") {
      mapStatusValueEl.textContent = "Weltkarte";
    } else if (currentMapView === "country-regions") {
      mapStatusValueEl.textContent = currentMapCountry ? `${currentMapCountry} – Regionen` : "Regionen";
    } else {
      mapStatusValueEl.textContent = currentMapCountry || "Landfokus";
    }
  }

  if (mapBackButtonEl) {
    mapBackButtonEl.disabled = currentMapView === "world";
  }

  if (mapIntroEl) {
    if (currentMapView === "world") {
      mapIntroEl.textContent = "Wähle auf der Weltkarte ein Herkunftsland aus. Die Karte lässt sich mit Maus oder Finger zoomen und verschieben. Für manche Länder steht zusätzlich eine Regionenkarte zur Verfügung.";
    } else if (currentMapView === "country-regions") {
      mapIntroEl.textContent = `Regionenansicht: ${currentMapCountry || "Land"}. Ein Klick auf eine Region zeigt darunter die passenden Einträge.`;
    } else {
      mapIntroEl.textContent = `Fokusansicht: ${currentMapCountry || "Land"}. Für dieses Land ist derzeit noch keine separate Regionenkarte hinterlegt.`;
    }
  }

  if (mapSelectionTitleEl) {
    mapSelectionTitleEl.textContent = "Kartenauswahl";
  }

  if (mapSelectionHintEl) {
    mapSelectionHintEl.textContent = "Nach Auswahl eines Landes oder einer Region werden die passenden Einträge hier direkt angezeigt.";
    mapSelectionHintEl.classList.remove("dashboard-map-selection-active");
  }

  if (mapSelectionListEl) {
    mapSelectionListEl.innerHTML = `<div class="dashboard-empty">Noch keine Kartenauswahl getroffen.</div>`;
  }

  notifyParentAboutMapState();
}

function normalizeWorldSvgMarkup(svgText) {
  if (!svgText) return "";

  return String(svgText)
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<svg\b([^>]*)>/i, (match, attrs) => {
      const widthMatch = attrs.match(/\swidth="([^"]*)"/i);
      const heightMatch = attrs.match(/\sheight="([^"]*)"/i);
      const viewBoxMatch = attrs.match(/\sviewBox="([^"]*)"/i);
      const preserveAspectRatioMatch = attrs.match(/\spreserveAspectRatio="([^"]*)"/i);

      const widthValue = widthMatch ? widthMatch[1].replace(/px$/i, "") : "";
      const heightValue = heightMatch ? heightMatch[1].replace(/px$/i, "") : "";
      const viewBoxValue = viewBoxMatch ? viewBoxMatch[1] : "";
      const preserveAspectRatioValue = preserveAspectRatioMatch ? preserveAspectRatioMatch[1] : "xMidYMid meet";

      const cleanedAttrs = attrs
        .replace(/\sclass="[^"]*"/gi, "")
        .replace(/\sid="[^"]*"/gi, "")
        .replace(/\sstyle="[^"]*"/gi, "")
        .replace(/\swidth="[^"]*"/gi, "")
        .replace(/\sheight="[^"]*"/gi, "")
        .replace(/\sviewBox="[^"]*"/gi, "")
        .replace(/\spreserveAspectRatio="[^"]*"/gi, "");

      const finalViewBox = viewBoxValue || (widthValue && heightValue ? `0 0 ${widthValue} ${heightValue}` : "0 0 1405 601");

      return `<svg${cleanedAttrs} viewBox="${finalViewBox}" preserveAspectRatio="${preserveAspectRatioValue}" class="dashboard-map-svg" id="dashboardWorldSvg" aria-label="Herkunftsweltkarte der Genussdatenbank" role="img">`;
    });
}

function getWorldSvgEl() {
  return document.getElementById("dashboardWorldSvg");
}

function parseViewBoxValue(value) {
  const parts = String(value || "")
    .trim()
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n));

  if (parts.length !== 4) return null;
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
}

function formatViewBoxValue(box) {
  return `${box.x} ${box.y} ${box.width} ${box.height}`;
}

function cloneViewBox(box) {
  return { x: box.x, y: box.y, width: box.width, height: box.height };
}

function getCurrentWorldViewBox() {
  const svgEl = getWorldSvgEl();
  if (!svgEl) return null;
  return parseViewBoxValue(svgEl.getAttribute("viewBox"));
}

function clampWorldViewBox(box) {
  if (!worldMapViewBoxState?.base) return box;

  const base = worldMapViewBoxState.base;
  const minWidth = base.width * 0.12;
  const minHeight = base.height * 0.12;
  const maxWidth = base.width;
  const maxHeight = base.height;

  const next = cloneViewBox(box);
  next.width = Math.min(Math.max(next.width, minWidth), maxWidth);
  next.height = Math.min(Math.max(next.height, minHeight), maxHeight);

  const maxX = base.x + base.width - next.width;
  const maxY = base.y + base.height - next.height;

  next.x = Math.min(Math.max(next.x, base.x), maxX);
  next.y = Math.min(Math.max(next.y, base.y), maxY);

  return next;
}

function applyWorldViewBox(box) {
  const svgEl = getWorldSvgEl();
  if (!svgEl || !box) return;

  const clamped = clampWorldViewBox(box);
  svgEl.setAttribute("viewBox", formatViewBoxValue(clamped));
  if (worldMapViewBoxState) {
    worldMapViewBoxState.current = cloneViewBox(clamped);
  }
}

function resetWorldInteractionState() {
  worldMapPointerState = {
    active: false,
    pointerId: null,
    startClientX: 0,
    startClientY: 0,
    lastClientX: 0,
    lastClientY: 0,
    moved: false,
    suppressClickUntil: 0,
    downTarget: null
  };

  worldMapTouchState = {
    pinchActive: false,
    lastDistance: 0,
    lastMidX: 0,
    lastMidY: 0
  };
}

function resetWorldViewBox() {
  if (!worldMapViewBoxState?.base) return;
  applyWorldViewBox(worldMapViewBoxState.base);
}

function clientPointToWorld(svgEl, clientX, clientY, viewBox = null) {
  if (!svgEl) return null;

  const rect = svgEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const box = viewBox || getCurrentWorldViewBox();
  if (!box) return null;

  const relX = (clientX - rect.left) / rect.width;
  const relY = (clientY - rect.top) / rect.height;

  return {
    x: box.x + relX * box.width,
    y: box.y + relY * box.height
  };
}

function zoomWorldMapAtPoint(clientX, clientY, zoomFactor) {
  const svgEl = getWorldSvgEl();
  if (!svgEl) return;

  const current = getCurrentWorldViewBox();
  if (!current) return;

  const anchor = clientPointToWorld(svgEl, clientX, clientY, current);
  if (!anchor) return;

  const nextWidth = current.width * zoomFactor;
  const nextHeight = current.height * zoomFactor;
  const scaleX = (anchor.x - current.x) / current.width;
  const scaleY = (anchor.y - current.y) / current.height;

  const next = {
    x: anchor.x - nextWidth * scaleX,
    y: anchor.y - nextHeight * scaleY,
    width: nextWidth,
    height: nextHeight
  };

  applyWorldViewBox(next);
}

function panWorldMapByClientDelta(deltaX, deltaY) {
  const svgEl = getWorldSvgEl();
  const current = getCurrentWorldViewBox();
  if (!svgEl || !current) return;

  const rect = svgEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const next = {
    x: current.x - (deltaX / rect.width) * current.width,
    y: current.y - (deltaY / rect.height) * current.height,
    width: current.width,
    height: current.height
  };

  applyWorldViewBox(next);
}

function getTouchDistance(touchA, touchB) {
  const dx = touchB.clientX - touchA.clientX;
  const dy = touchB.clientY - touchA.clientY;
  return Math.hypot(dx, dy);
}

function getTouchMidpoint(touchA, touchB) {
  return {
    x: (touchA.clientX + touchB.clientX) / 2,
    y: (touchA.clientY + touchB.clientY) / 2
  };
}

function updateMapUiForView() {
  const countryLabel = WORLD_MAP_CONFIG[currentMapCountry]?.statusLabel || currentMapCountry || "Land";

  if (mapStatusValueEl) {
    if (currentMapView === "world") {
      mapStatusValueEl.textContent = "Weltkarte";
    } else if (currentMapView === "country-subregions") {
      mapStatusValueEl.textContent = currentMapRegion
        ? `Großbritannien & Irland – ${currentMapRegion}`
        : "Großbritannien & Irland";
    } else if (currentMapView === "country-regions") {
      mapStatusValueEl.textContent = currentMapRegion
        ? `${countryLabel} – ${currentMapRegion}`
        : `${countryLabel} – Regionen`;
    } else {
      mapStatusValueEl.textContent = countryLabel;
    }
  }

  if (mapBackButtonEl) {
    mapBackButtonEl.disabled = currentMapView === "world";

    if (isScotlandRegionMapActive()) {
      mapBackButtonEl.textContent = "Zurück zu Großbritannien & Irland";
    } else if (currentMapView !== "world") {
      mapBackButtonEl.textContent = "Zurück zur Weltkarte";
    } else {
      mapBackButtonEl.textContent = "Zurück";
    }
  }

  if (mapIntroEl) {
    if (currentMapView === "world") {
      mapIntroEl.textContent = "Wähle auf der Weltkarte ein Herkunftsland aus. Die Karte lässt sich mit Maus oder Finger zoomen und verschieben. Für manche Länder steht zusätzlich eine Regionenkarte zur Verfügung.";
    } else if (currentMapView === "country-subregions") {
      mapIntroEl.textContent = currentMapRegion
        ? `Zwischenebene: Großbritannien & Irland – ${currentMapRegion}. Unten werden die passenden Einträge angezeigt.`
        : "Zwischenebene: Großbritannien & Irland. Schottland führt weiter in die Whiskyregionen, die übrigen Bereiche filtern direkt die passenden Einträge.";
    } else if (currentMapView === "country-regions") {
      mapIntroEl.textContent = currentMapRegion
        ? `Regionenansicht: ${countryLabel} – ${currentMapRegion}. Unten werden die passenden Einträge angezeigt.`
        : `Regionenansicht: ${countryLabel}. Ein Klick auf eine Region zeigt darunter die passenden Einträge.`;
    } else {
      mapIntroEl.textContent = `Fokusansicht: ${countryLabel}. Für dieses Land ist derzeit noch keine separate Regionenkarte hinterlegt.`;
    }
  }

  if (mapSelectionTitleEl) {
    if (currentMapView === "world") {
      mapSelectionTitleEl.textContent = "Kartenauswahl";
    } else if (currentMapView === "country-subregions") {
      mapSelectionTitleEl.textContent = currentMapRegion
        ? `Kartenauswahl – ${currentMapRegion}`
        : "Kartenauswahl – Großbritannien & Irland";
    } else if (currentMapView === "country-regions") {
      mapSelectionTitleEl.textContent = currentMapRegion
        ? `Kartenauswahl – ${currentMapRegion}`
        : `Kartenauswahl – ${countryLabel}`;
    } else {
      mapSelectionTitleEl.textContent = `Kartenauswahl – ${countryLabel}`;
    }
  }

  if (mapSelectionHintEl) {
    if (currentMapView === "world") {
      mapSelectionHintEl.textContent = "Die Weltkarte ist geladen. Wähle ein Land aus, um die passende Karten- oder Fokusansicht zu öffnen.";
      mapSelectionHintEl.classList.remove("dashboard-map-selection-active");
    } else if (currentMapView === "country-subregions") {
      mapSelectionHintEl.textContent = currentMapRegion
        ? `Gefiltert nach Auswahl: ${currentMapRegion}.`
        : "Die Zwischenkarte ist geladen. Bitte einen Bereich auswählen.";
      mapSelectionHintEl.classList.toggle("dashboard-map-selection-active", !!currentMapRegion);
    } else if (currentMapView === "country-regions") {
      mapSelectionHintEl.textContent = currentMapRegion
        ? `Gefiltert nach Region: ${currentMapRegion}.`
        : "Die Regionenkarte ist geladen. Bitte eine Region auswählen.";
      mapSelectionHintEl.classList.toggle("dashboard-map-selection-active", !!currentMapRegion);
    } else {
      mapSelectionHintEl.textContent = "Für dieses Land ist aktuell noch keine separate Regionenkarte hinterlegt.";
      mapSelectionHintEl.classList.remove("dashboard-map-selection-active");
    }
  }

  if (mapSelectionListEl) {
    if (currentMapView === "world") {
      mapSelectionListEl.innerHTML = `<div class="dashboard-empty">Noch keine Kartenauswahl getroffen.</div>`;
    } else if (currentMapView === "country-subregions") {
      if (currentMapRegion) {
        const subregionConfig = UK_SUBREGION_CONFIG[currentMapRegion];
        const entryCountries = Array.isArray(subregionConfig?.entryCountries) && subregionConfig.entryCountries.length
          ? subregionConfig.entryCountries
          : [currentMapRegion];
        renderCountrySelectionListByNames(entryCountries, currentMapRegion);
        syncUkSubregionSelectionFromState();
      } else {
        mapSelectionListEl.innerHTML = `<div class="dashboard-empty">Bitte einen Bereich in Großbritannien & Irland auswählen.</div>`;
      }
    } else if (currentMapView === "country-regions") {
      if (currentMapRegion) {
        renderRegionSelectionList(currentMapCountry, currentMapRegion);
      } else {
        mapSelectionListEl.innerHTML = `<div class="dashboard-empty">Bitte eine Region in ${escapeHtml(countryLabel)} auswählen.</div>`;
      }

      if (currentMapCountry === "Deutschland") {
        syncGermanyRegionSelectionFromState();
      } else if (currentMapCountry === "Schottland") {
        syncScotlandRegionSelectionFromState();
      } else if (currentMapCountry === "USA") {
        syncUsaRegionSelectionFromState();
      }
    } else {
      if (currentMapCountry) {
        renderCountrySelectionList(currentMapCountry);
      } else {
        mapSelectionListEl.innerHTML = `<div class="dashboard-empty">Noch keine Kartenauswahl getroffen.</div>`;
      }
    }
  }

  notifyParentAboutMapState();
}

function normalizeRegionName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function countryHasWhiskys(countryName) {
  const config = WORLD_MAP_CONFIG[countryName] || null;
  const countryNames = Array.isArray(config?.entryCountries) && config.entryCountries.length
    ? config.entryCountries
    : [countryName];

  const normalizedCountries = countryNames.map((name) => normalizeRegionName(name));

  return currentWhiskys.some((item) => normalizedCountries.includes(normalizeRegionName(item.country)));
}

function regionHasWhiskys(countryName, regionName) {
  const normalizedCountry = normalizeRegionName(countryName);
  const normalizedRegion = normalizeRegionName(regionName);

  return currentWhiskys.some((item) => {
    const countryOk = normalizeRegionName(item.country) === normalizedCountry;
    const regionOk = normalizeRegionName(item.region) === normalizedRegion;
    return countryOk && regionOk;
  });
}

function renderRegionSelectionList(countryName, regionName) {
  if (!mapSelectionListEl) return;

  const normalizedRegion = normalizeRegionName(regionName);
  const entries = currentWhiskys.filter((item) => {
    const countryOk = normalizeRegionName(item.country) === normalizeRegionName(countryName);
    const regionOk = normalizeRegionName(item.region) === normalizedRegion;
    return countryOk && regionOk;
  });

  if (!entries.length) {
    mapSelectionListEl.innerHTML = `<div class="dashboard-empty">Keine Einträge für ${escapeHtml(regionName)} gefunden.</div>`;
    return;
  }

  mapSelectionListEl.innerHTML = entries.map((item) => {
    const title = escapeHtml(item.name || "Unbenannter Eintrag");
    const metaParts = [];
    if ((item.distillery || "").trim()) metaParts.push(escapeHtml(item.distillery));
    if ((item.region || "").trim()) metaParts.push(escapeHtml(item.region));
    if ((item.country || "").trim()) metaParts.push(escapeHtml(item.country));
    const meta = metaParts.join(" · ");

    return `
      <button type="button" class="dashboard-list-item dashboard-care-detail-item" data-care-whisky-id="${escapeHtml(item.id)}">
        <div class="dashboard-list-item-title">${title}</div>
        <div class="dashboard-list-item-meta">${meta || "–"}</div>
      </button>
    `;
  }).join("");
}

function renderCountrySelectionList(countryName) {
  if (!mapSelectionListEl) return;

  const normalizedCountry = normalizeRegionName(countryName);
  const entries = currentWhiskys.filter((item) => {
    return normalizeRegionName(item.country) === normalizedCountry;
  });

  if (!entries.length) {
    mapSelectionListEl.innerHTML = `<div class="dashboard-empty">Keine Einträge für ${escapeHtml(countryName)} gefunden.</div>`;
    return;
  }

  mapSelectionListEl.innerHTML = entries.map((item) => {
    const title = escapeHtml(item.name || "Unbenannter Eintrag");
    const metaParts = [];
    if ((item.distillery || "").trim()) metaParts.push(escapeHtml(item.distillery));
    if ((item.region || "").trim()) metaParts.push(escapeHtml(item.region));
    if ((item.country || "").trim()) metaParts.push(escapeHtml(item.country));
    const meta = metaParts.join(" · ");

    return `
      <button type="button" class="dashboard-list-item dashboard-care-detail-item" data-care-whisky-id="${escapeHtml(item.id)}">
        <div class="dashboard-list-item-title">${title}</div>
        <div class="dashboard-list-item-meta">${meta || "–"}</div>
      </button>
    `;
  }).join("");
}

function renderCountrySelectionListByNames(countryNames, label) {
  if (!mapSelectionListEl) return;

  const normalizedCountries = (Array.isArray(countryNames) ? countryNames : [countryNames])
    .map((name) => normalizeRegionName(name));

  const entries = currentWhiskys.filter((item) => {
    return normalizedCountries.includes(normalizeRegionName(item.country));
  });

  if (!entries.length) {
    mapSelectionListEl.innerHTML = `<div class="dashboard-empty">Keine Einträge für ${escapeHtml(label)} gefunden.</div>`;
    return;
  }

  mapSelectionListEl.innerHTML = entries.map((item) => {
    const title = escapeHtml(item.name || "Unbenannter Eintrag");
    const metaParts = [];
    if ((item.distillery || "").trim()) metaParts.push(escapeHtml(item.distillery));
    if ((item.region || "").trim()) metaParts.push(escapeHtml(item.region));
    if ((item.country || "").trim()) metaParts.push(escapeHtml(item.country));
    const meta = metaParts.join(" · ");

    return `
      <button type="button" class="dashboard-list-item dashboard-care-detail-item" data-care-whisky-id="${escapeHtml(item.id)}">
        <div class="dashboard-list-item-title">${title}</div>
        <div class="dashboard-list-item-meta">${meta || "–"}</div>
      </button>
    `;
  }).join("");
}

function getGermanyRegionSvgEl() {
  return document.getElementById("dashboardGermanySvg");
}

function getScotlandRegionSvgEl() {
  return document.getElementById("dashboardScotlandSvg");
}

function getUsaRegionSvgEl() {
  return document.getElementById("dashboardUsaSvg");
}

function getUkSubregionSvgEl() {
  return document.getElementById("dashboardUkSvg");
}

function isScotlandRegionMapActive() {
  return currentMapView === "country-regions"
    && (currentMapCountry === "Schottland" || !!getScotlandRegionSvgEl());
}

function bringSvgNodeToFront(node) {
  if (!(node instanceof Element)) return;
  const parent = node.parentNode;
  if (!parent) return;
  parent.appendChild(node);
}

function clearGermanyRegionSelection() {
  if (!(currentSelectedRegionNode instanceof Element)) return;
  currentSelectedRegionNode.classList.remove("is-selected");
  currentSelectedRegionNode = null;
}

function setGermanyRegionSelection(regionNode) {
  clearGermanyRegionSelection();
  if (!(regionNode instanceof Element)) return;
  regionNode.classList.add("is-selected");
  currentSelectedRegionNode = regionNode;
}

function syncGermanyRegionSelectionFromState() {
  clearGermanyRegionSelection();
  if (!currentMapRegion) return;

  const svgEl = getGermanyRegionSvgEl();
  if (!svgEl) return;

  const selectedNode = Array.from(svgEl.querySelectorAll("[data-map-region]")).find(
    (node) => node.getAttribute("data-map-region") === currentMapRegion
  );
  if (!(selectedNode instanceof Element)) return;

  selectedNode.classList.add("is-selected");
  currentSelectedRegionNode = selectedNode;
}

function clearScotlandRegionSelection() {
  if (!(currentSelectedRegionNode instanceof Element)) return;
  currentSelectedRegionNode.classList.remove("is-selected");
  currentSelectedRegionNode = null;
}

function setScotlandRegionSelection(regionNode) {
  clearScotlandRegionSelection();
  if (!(regionNode instanceof Element)) return;
  regionNode.classList.add("is-selected");
  currentSelectedRegionNode = regionNode;
}

function syncScotlandRegionSelectionFromState() {
  clearScotlandRegionSelection();
  if (!currentMapRegion) return;

  const svgEl = getScotlandRegionSvgEl();
  if (!svgEl) return;

  const selectedNode = Array.from(svgEl.querySelectorAll("[data-map-region]"))
    .find((node) => node.getAttribute("data-map-region") === currentMapRegion);

  if (!(selectedNode instanceof Element)) return;

  selectedNode.classList.add("is-selected");
  currentSelectedRegionNode = selectedNode;
}

function markScotlandRegions(svgEl) {
  if (!svgEl) return;

  const colorFallbacks = [
    { regionName: "Lowlands", id: "scotland-lowlands", fills: ["#8cc056", "rgb(140,192,86)"] },
    { regionName: "Highlands", id: "scotland-highlands", fills: ["#cd9c62", "rgb(205,156,98)"] },
    { regionName: "Islands", id: "scotland-islands", fills: ["#d1c370", "rgb(209,195,112)"] },
    { regionName: "Islay", id: "scotland-islay", fills: ["#d17070", "rgb(209,112,112)"] },
    { regionName: "Campbeltown", id: "scotland-campbeltown", fills: ["#7462cd", "rgb(116,98,205)"] },
    { regionName: "Speyside", id: "scotland-speyside", fills: ["#618ebd", "rgb(97,142,189)"] }
  ];

  const normalizeColor = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "");

  const applyRegionNode = (node, regionName, regionId) => {
    if (!(node instanceof Element)) return;

    if (!node.id) {
      node.id = regionId;
    }

    node.setAttribute("data-map-region", regionName);
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    node.classList.add("dashboard-map-region-target");

    if (regionHasWhiskys("Schottland", regionName)) {
      node.classList.add("has-entries");
    } else {
      node.classList.remove("has-entries");
    }
  };

  Object.entries(SCOTLAND_REGION_CONFIG).forEach(([regionName, config]) => {
    const directNode = svgEl.getElementById(config.id) || svgEl.querySelector(`#${config.id}`);
    if (directNode instanceof Element) {
      applyRegionNode(directNode, regionName, config.id);
    }
  });

  colorFallbacks.forEach(({ regionName, id, fills }) => {
    const existingNode = svgEl.getElementById(id) || svgEl.querySelector(`#${id}`);
    if (existingNode instanceof Element) {
      applyRegionNode(existingNode, regionName, id);
      return;
    }

    const candidates = Array.from(svgEl.querySelectorAll("path, g"));
    const match = candidates.find((node) => {
      if (!(node instanceof Element)) return false;

      const fillAttr = normalizeColor(node.getAttribute("fill"));
      const styleAttr = normalizeColor(node.getAttribute("style"));
      const styleFillMatch = styleAttr.match(/fill:([^;]+)/i);
      const styleFill = normalizeColor(styleFillMatch ? styleFillMatch[1] : "");

      return fills.some((fill) => {
        const normalizedFill = normalizeColor(fill);
        return fillAttr === normalizedFill || styleFill === normalizedFill || styleAttr.includes(`fill:${normalizedFill}`);
      });
    });

    if (match instanceof Element) {
      applyRegionNode(match, regionName, id);
    }
  });
}

function bindScotlandRegionInteractions() {
  const svgEl = getScotlandRegionSvgEl();
  if (!svgEl) return;

  const regionNodes = Array.from(
    svgEl.querySelectorAll(
      "[data-map-region], #scotland-lowlands, #scotland-highlands, #scotland-speyside, #scotland-islands, #scotland-campbeltown, #scotland-islay"
    )
  );

  regionNodes.forEach((regionNode) => {
    if (!(regionNode instanceof Element)) return;

    regionNode.style.cursor = "pointer";

    regionNode.addEventListener("mouseenter", () => {
      bringSvgNodeToFront(regionNode);
    });

    regionNode.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const regionName = regionNode.getAttribute("data-map-region") || null;
      if (!regionName) return;

      currentMapView = "country-regions";
      currentMapCountry = "Schottland";
      currentMapRegion = regionName;
      bringSvgNodeToFront(regionNode);
      setScotlandRegionSelection(regionNode);
      updateMapUiForView();
    });

    regionNode.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.stopPropagation();

      const regionName = regionNode.getAttribute("data-map-region") || null;
      if (!regionName) return;

      currentMapView = "country-regions";
      currentMapCountry = "Schottland";
      currentMapRegion = regionName;
      bringSvgNodeToFront(regionNode);
      setScotlandRegionSelection(regionNode);
      updateMapUiForView();
    });
  });
}

function clearUsaRegionSelection() {
  if (!(currentSelectedRegionNode instanceof Element)) return;
  currentSelectedRegionNode.classList.remove("is-selected");
  currentSelectedRegionNode = null;
}

function setUsaRegionSelection(regionNode) {
  clearUsaRegionSelection();
  if (!(regionNode instanceof Element)) return;
  regionNode.classList.add("is-selected");
  currentSelectedRegionNode = regionNode;
}

function syncUsaRegionSelectionFromState() {
  clearUsaRegionSelection();
  if (!currentMapRegion) return;

  const svgEl = getUsaRegionSvgEl();
  if (!svgEl) return;

  const selectedNode = Array.from(svgEl.querySelectorAll("[data-map-region]"))
    .find((node) => node.getAttribute("data-map-region") === currentMapRegion);

  if (!(selectedNode instanceof Element)) return;

  selectedNode.classList.add("is-selected");
  currentSelectedRegionNode = selectedNode;
}

function clearUkSubregionSelection() {
  if (!(currentSelectedRegionNode instanceof Element)) return;
  currentSelectedRegionNode.classList.remove("is-selected");
  currentSelectedRegionNode = null;
}

function setUkSubregionSelection(regionNode) {
  clearUkSubregionSelection();
  if (!(regionNode instanceof Element)) return;
  regionNode.classList.add("is-selected");
  currentSelectedRegionNode = regionNode;
}

function syncUkSubregionSelectionFromState() {
  clearUkSubregionSelection();
  if (!currentMapRegion) return;

  const svgEl = getUkSubregionSvgEl();
  if (!svgEl) return;

  const selectedNode = Array.from(svgEl.querySelectorAll("[data-map-region]"))
    .find((node) => node.getAttribute("data-map-region") === currentMapRegion);

  if (!(selectedNode instanceof Element)) return;

  selectedNode.classList.add("is-selected");
  currentSelectedRegionNode = selectedNode;
}

function markUkSubregions(svgEl) {
  if (!svgEl) return;

  Object.entries(UK_SUBREGION_CONFIG).forEach(([regionName, config]) => {
    const selectorList = Array.isArray(config.selectors) ? config.selectors.filter(Boolean) : [];
    if (!selectorList.length) return;

    const nodes = Array.from(svgEl.querySelectorAll(selectorList.join(",")))
      .filter((node) => node instanceof Element);

    if (!nodes.length) return;

    nodes.forEach((node) => {
      node.setAttribute("data-map-region", regionName);
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", "button");
      node.classList.add("dashboard-map-region-target");

      const entryCountries = Array.isArray(config.entryCountries) && config.entryCountries.length
        ? config.entryCountries
        : [regionName];
      const hasEntries = currentWhiskys.some((item) => {
        return entryCountries.some((countryName) => normalizeRegionName(item.country) === normalizeRegionName(countryName));
      });

      if (hasEntries) {
        node.classList.add("has-entries");
      } else {
        node.classList.remove("has-entries");
      }
    });
  });
}

function bindUkSubregionInteractions() {
  const svgEl = getUkSubregionSvgEl();
  if (!svgEl) return;

  const regionNodes = Array.from(svgEl.querySelectorAll("[data-map-region]"));

  regionNodes.forEach((regionNode) => {
    if (!(regionNode instanceof Element)) return;

    regionNode.style.cursor = "pointer";

    regionNode.addEventListener("mouseenter", () => {
      bringSvgNodeToFront(regionNode);
    });

    const handleActivate = async () => {
      const regionName = regionNode.getAttribute("data-map-region") || null;
      if (!regionName) return;

      const config = UK_SUBREGION_CONFIG[regionName];
      if (!config) return;

      if (config.action === "regionMap" && regionName === "Schottland") {
        currentMapCountry = "Schottland";
        currentMapRegion = null;
        currentSelectedRegionNode = null;
        await loadCountryRegionMap("Schottland", SCOTLAND_MAP_SVG_PATH);
        return;
      }

      const initialRegionName = regionNode.getAttribute("data-map-region") || "";
      if (!regionNode.hasAttribute("data-map-country") && initialRegionName) {
        regionNode.setAttribute("data-map-country", initialRegionName);
      }

      currentMapView = "country-subregions";
      currentMapCountry = "Großbritannien & Irland";
      currentMapRegion = regionName;
      bringSvgNodeToFront(regionNode);
      setUkSubregionSelection(regionNode);
      updateMapUiForView();
    };

    regionNode.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      void handleActivate();
    });

    regionNode.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.stopPropagation();
      void handleActivate();
    });
  });
}

function markUsaRegions(svgEl) {
  if (!svgEl) return;

  Object.entries(USA_REGION_CONFIG).forEach(([regionName, config]) => {
    const node = svgEl.getElementById(config.id) || svgEl.querySelector(`#${config.id}`);
    if (!(node instanceof Element)) return;

    node.setAttribute("data-map-region", regionName);
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    node.classList.add("dashboard-map-region-target");

    if (regionHasWhiskys("USA", regionName)) {
      node.classList.add("has-entries");
    } else {
      node.classList.remove("has-entries");
    }
  });
}

function bindUsaRegionInteractions() {
  const svgEl = getUsaRegionSvgEl();
  if (!svgEl) return;

  const regionNodes = Array.from(svgEl.querySelectorAll("[data-map-region]"));

  regionNodes.forEach((regionNode) => {
    if (!(regionNode instanceof Element)) return;

    regionNode.style.cursor = "pointer";

    regionNode.addEventListener("mouseenter", () => {
      bringSvgNodeToFront(regionNode);
    });

    regionNode.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const regionName = regionNode.getAttribute("data-map-region") || null;
      if (!regionName) return;

      currentMapView = "country-regions";
      currentMapCountry = "USA";
      currentMapRegion = regionName;
      bringSvgNodeToFront(regionNode);
      setUsaRegionSelection(regionNode);
      updateMapUiForView();
    });

    regionNode.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.stopPropagation();

      const regionName = regionNode.getAttribute("data-map-region") || null;
      if (!regionName) return;

      currentMapView = "country-regions";
      currentMapCountry = "USA";
      currentMapRegion = regionName;
      bringSvgNodeToFront(regionNode);
      setUsaRegionSelection(regionNode);
      updateMapUiForView();
    });
  });
}

function markGermanyRegions(svgEl) {
  if (!svgEl) return;

  Object.entries(GERMANY_REGION_CONFIG).forEach(([regionName, config]) => {
    const node = svgEl.getElementById(config.id) || svgEl.querySelector(`[id="${config.id}"]`);
    if (!(node instanceof Element)) return;

    node.setAttribute("data-map-region", regionName);
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    node.classList.add("dashboard-map-region-target");

    if (regionHasWhiskys("Deutschland", regionName)) {
      node.classList.add("has-entries");
    } else {
      node.classList.remove("has-entries");
    }
  });
}

function bindGermanyRegionInteractions() {
  const svgEl = getGermanyRegionSvgEl();
  if (!svgEl) return;

  const regionNodes = Array.from(svgEl.querySelectorAll("[data-map-region]"));

  regionNodes.forEach((regionNode) => {
    if (!(regionNode instanceof Element)) return;

    regionNode.style.cursor = "pointer";

    regionNode.addEventListener("mouseenter", () => {
      bringSvgNodeToFront(regionNode);
    });

    regionNode.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const regionName = regionNode.getAttribute("data-map-region") || null;
      if (!regionName) return;

      currentMapView = "country-regions";
      currentMapCountry = "Deutschland";
      currentMapRegion = regionName;
      bringSvgNodeToFront(regionNode);
      setGermanyRegionSelection(regionNode);
      updateMapUiForView();
    });

    regionNode.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.stopPropagation();

      const regionName = regionNode.getAttribute("data-map-region") || null;
      if (!regionName) return;

      currentMapView = "country-regions";
      currentMapCountry = "Deutschland";
      currentMapRegion = regionName;
      bringSvgNodeToFront(regionNode);
      setGermanyRegionSelection(regionNode);
      updateMapUiForView();
    });
  });
}

function findCountryElements(svgEl, selectors) {
  if (!svgEl || !Array.isArray(selectors)) return [];

  const hits = [];
  const seen = new Set();

  selectors.forEach((selector) => {
    svgEl.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof Element)) return;
      if (seen.has(node)) return;
      seen.add(node);
      hits.push(node);
    });
  });

  return hits;
}

function markInteractiveCountries(svgEl) {
  if (!svgEl) return;

  Object.entries(WORLD_MAP_CONFIG).forEach(([countryName, config]) => {
    const nodes = findCountryElements(svgEl, config.selectors);
    if (!nodes.length) return;

    nodes.forEach((node) => {
      node.setAttribute("data-map-country", countryName);
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", "button");
      node.classList.add("dashboard-map-country-target");

      if (countryHasWhiskys(countryName)) {
        node.classList.add("has-entries");
      } else {
        node.classList.remove("has-entries");
      }
    });
  });
}

function setWorldCountryHoverState(countryName, isActive) {
  const svgEl = getWorldSvgEl();
  if (!svgEl || !countryName) return;

  svgEl.querySelectorAll(`[data-map-country="${CSS.escape(countryName)}"]`).forEach((node) => {
    if (!(node instanceof Element)) return;
    node.classList.toggle("is-hovered", !!isActive);
  });
}

function bindWorldCountryHoverInteractions() {
  const svgEl = getWorldSvgEl();
  if (!svgEl) return;

  const countryNodes = Array.from(svgEl.querySelectorAll("[data-map-country]"));

  countryNodes.forEach((countryNode) => {
    if (!(countryNode instanceof Element)) return;

    const countryName = countryNode.getAttribute("data-map-country") || "";
    if (!countryName) return;

    countryNode.addEventListener("mouseenter", () => {
      setWorldCountryHoverState(countryName, true);
    });

    countryNode.addEventListener("mouseleave", () => {
      setWorldCountryHoverState(countryName, false);
    });

    countryNode.addEventListener("focus", () => {
      setWorldCountryHoverState(countryName, true);
    });

    countryNode.addEventListener("blur", () => {
      setWorldCountryHoverState(countryName, false);
    });
  });
}

function setSvgViewBox(viewBoxValue) {
  const svgEl = getWorldSvgEl();
  if (!svgEl || !viewBoxValue) return;
  svgEl.setAttribute("viewBox", viewBoxValue);
}

async function setCountryFocus(countryName) {
  const config = WORLD_MAP_CONFIG[countryName];
  if (!config) return;

  currentMapCountry = countryName;
  currentMapRegion = null;

  if (config.regionMap?.type === "svg" && config.regionMap.path) {
    await loadCountryRegionMap(countryName, config.regionMap.path);
    return;
  }

  currentMapView = "country";
  updateMapUiForView();
}

function bindWorldMapInteractions() {
  const svgEl = getWorldSvgEl();
  if (!svgEl) return;

  svgEl.style.touchAction = "none";

  svgEl.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.94 : 1.06;
    zoomWorldMapAtPoint(e.clientX, e.clientY, zoomFactor);
  }, { passive: false });

  svgEl.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;

    worldMapPointerState.active = true;
    worldMapPointerState.pointerId = e.pointerId;
    worldMapPointerState.startClientX = e.clientX;
    worldMapPointerState.startClientY = e.clientY;
    worldMapPointerState.lastClientX = e.clientX;
    worldMapPointerState.lastClientY = e.clientY;
    worldMapPointerState.moved = false;
    worldMapPointerState.downTarget = e.target instanceof Element ? e.target : null;
    svgEl.setPointerCapture?.(e.pointerId);
  });

  svgEl.addEventListener("pointermove", (e) => {
    if (!worldMapPointerState.active || worldMapPointerState.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - worldMapPointerState.lastClientX;
    const deltaY = e.clientY - worldMapPointerState.lastClientY;
    const totalDx = e.clientX - worldMapPointerState.startClientX;
    const totalDy = e.clientY - worldMapPointerState.startClientY;

    if (Math.hypot(totalDx, totalDy) > 4) {
      worldMapPointerState.moved = true;
    }

    if (worldMapPointerState.moved) {
      panWorldMapByClientDelta(deltaX, deltaY);
    }

    worldMapPointerState.lastClientX = e.clientX;
    worldMapPointerState.lastClientY = e.clientY;
  });

  const endPointerGesture = (e) => {
    if (!worldMapPointerState.active || worldMapPointerState.pointerId !== e.pointerId) return;

    const wasMoved = worldMapPointerState.moved;
    const downTarget = worldMapPointerState.downTarget;

    if (wasMoved) {
      worldMapPointerState.suppressClickUntil = Date.now() + 180;
    }

    worldMapPointerState.active = false;
    worldMapPointerState.pointerId = null;
    worldMapPointerState.moved = false;
    worldMapPointerState.downTarget = null;
    svgEl.releasePointerCapture?.(e.pointerId);

    if (wasMoved) return;
    if (!(downTarget instanceof Element)) return;

    const countryNode = downTarget.closest("[data-map-country]");
    if (!(countryNode instanceof Element)) return;

    const countryName = countryNode.getAttribute("data-map-country") || "";
    if (!countryName) return;

    void setCountryFocus(countryName);
  };

  svgEl.addEventListener("pointerup", endPointerGesture);
  svgEl.addEventListener("pointercancel", endPointerGesture);

  svgEl.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      worldMapPointerState.active = true;
      worldMapPointerState.pointerId = "touch-pan";
      worldMapPointerState.startClientX = touch.clientX;
      worldMapPointerState.startClientY = touch.clientY;
      worldMapPointerState.lastClientX = touch.clientX;
      worldMapPointerState.lastClientY = touch.clientY;
      worldMapPointerState.moved = false;
      worldMapTouchState.pinchActive = false;
      return;
    }

    if (e.touches.length === 2) {
      e.preventDefault();
      const first = e.touches[0];
      const second = e.touches[1];
      const mid = getTouchMidpoint(first, second);
      worldMapTouchState.pinchActive = true;
      worldMapTouchState.lastDistance = getTouchDistance(first, second);
      worldMapTouchState.lastMidX = mid.x;
      worldMapTouchState.lastMidY = mid.y;
      worldMapPointerState.active = false;
      worldMapPointerState.pointerId = null;
    }
  }, { passive: false });

  svgEl.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && worldMapTouchState.pinchActive) {
      e.preventDefault();
      const first = e.touches[0];
      const second = e.touches[1];
      const distance = getTouchDistance(first, second);
      const mid = getTouchMidpoint(first, second);

      if (worldMapTouchState.lastDistance > 0 && distance > 0) {
        const zoomFactor = worldMapTouchState.lastDistance / distance;
        zoomWorldMapAtPoint(mid.x, mid.y, zoomFactor);
      }

      panWorldMapByClientDelta(mid.x - worldMapTouchState.lastMidX, mid.y - worldMapTouchState.lastMidY);

      worldMapTouchState.lastDistance = distance;
      worldMapTouchState.lastMidX = mid.x;
      worldMapTouchState.lastMidY = mid.y;
      worldMapPointerState.suppressClickUntil = Date.now() + 220;
      return;
    }

    if (e.touches.length === 1 && worldMapPointerState.active && worldMapPointerState.pointerId === "touch-pan") {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - worldMapPointerState.lastClientX;
      const deltaY = touch.clientY - worldMapPointerState.lastClientY;
      const totalDx = touch.clientX - worldMapPointerState.startClientX;
      const totalDy = touch.clientY - worldMapPointerState.startClientY;

      if (Math.hypot(totalDx, totalDy) > 6) {
        worldMapPointerState.moved = true;
      }

      if (worldMapPointerState.moved) {
        panWorldMapByClientDelta(deltaX, deltaY);
        worldMapPointerState.suppressClickUntil = Date.now() + 220;
      }

      worldMapPointerState.lastClientX = touch.clientX;
      worldMapPointerState.lastClientY = touch.clientY;
    }
  }, { passive: false });

  svgEl.addEventListener("touchend", () => {
    if (worldMapPointerState.moved) {
      worldMapPointerState.suppressClickUntil = Date.now() + 220;
    }
    worldMapPointerState.active = false;
    worldMapPointerState.pointerId = null;
    worldMapPointerState.moved = false;

    if (worldMapTouchState.pinchActive) {
      worldMapTouchState.pinchActive = false;
      worldMapTouchState.lastDistance = 0;
    }
  });

  svgEl.addEventListener("touchcancel", () => {
    resetWorldInteractionState();
  });

  svgEl.addEventListener("click", (e) => {
    if (Date.now() < worldMapPointerState.suppressClickUntil) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  svgEl.addEventListener("keydown", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    if (e.key !== "Enter" && e.key !== " ") return;

    const countryNode = target.closest("[data-map-country]");
    if (!(countryNode instanceof Element)) return;

    e.preventDefault();
    const countryName = countryNode.getAttribute("data-map-country") || "";
    if (!countryName) return;

    void setCountryFocus(countryName);
  });
}

function normalizeGermanySvgMarkup(svgText) {
  if (!svgText) return "";

  return String(svgText)
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<svg\b([^>]*)>/i, (match, attrs) => {
      const widthMatch = attrs.match(/\swidth="([^"]*)"/i);
      const heightMatch = attrs.match(/\sheight="([^"]*)"/i);
      const viewBoxMatch = attrs.match(/\sviewBox="([^"]*)"/i);
      const preserveAspectRatioMatch = attrs.match(/\spreserveAspectRatio="([^"]*)"/i);

      const widthValue = widthMatch ? widthMatch[1].replace(/px$/i, "") : "";
      const heightValue = heightMatch ? heightMatch[1].replace(/px$/i, "") : "";
      const viewBoxValue = viewBoxMatch ? viewBoxMatch[1] : "";
      const preserveAspectRatioValue = preserveAspectRatioMatch ? preserveAspectRatioMatch[1] : "xMidYMid meet";

      const cleanedAttrs = attrs
        .replace(/\sclass="[^"]*"/gi, "")
        .replace(/\sid="[^"]*"/gi, "")
        .replace(/\sstyle="[^"]*"/gi, "")
        .replace(/\swidth="[^"]*"/gi, "")
        .replace(/\sheight="[^"]*"/gi, "")
        .replace(/\sviewBox="[^"]*"/gi, "")
        .replace(/\spreserveAspectRatio="[^"]*"/gi, "");

      const finalViewBox = viewBoxValue || (widthValue && heightValue ? `0 0 ${widthValue} ${heightValue}` : "0 0 591.504 800.504");

      return `<svg${cleanedAttrs} viewBox="${finalViewBox}" preserveAspectRatio="${preserveAspectRatioValue}" class="dashboard-map-svg dashboard-map-svg--germany" id="dashboardGermanySvg" aria-label="Deutschlandkarte der Genussdatenbank" role="img">`;
    });
}

function normalizeScotlandSvgMarkup(svgText) {
  if (!svgText) return "";

  return String(svgText)
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<svg\b([^>]*)>/i, (match, attrs) => {
      const widthMatch = attrs.match(/\swidth="([^"]*)"/i);
      const heightMatch = attrs.match(/\sheight="([^"]*)"/i);
      const viewBoxMatch = attrs.match(/\sviewBox="([^"]*)"/i);
      const preserveAspectRatioMatch = attrs.match(/\spreserveAspectRatio="([^"]*)"/i);

      const widthValue = widthMatch ? widthMatch[1].replace(/px$/i, "") : "";
      const heightValue = heightMatch ? heightMatch[1].replace(/px$/i, "") : "";
      const viewBoxValue = viewBoxMatch ? viewBoxMatch[1] : "";
      const preserveAspectRatioValue = preserveAspectRatioMatch ? preserveAspectRatioMatch[1] : "xMidYMid meet";

      const cleanedAttrs = attrs
        .replace(/\sclass="[^"]*"/gi, "")
        .replace(/\sid="[^"]*"/gi, "")
        .replace(/\sstyle="[^"]*"/gi, "")
        .replace(/\swidth="[^"]*"/gi, "")
        .replace(/\sheight="[^"]*"/gi, "")
        .replace(/\sviewBox="[^"]*"/gi, "")
        .replace(/\spreserveAspectRatio="[^"]*"/gi, "");

      const finalViewBox = viewBoxValue || (widthValue && heightValue ? `0 0 ${widthValue} ${heightValue}` : "0 0 700 700");

      return `<svg${cleanedAttrs} viewBox="${finalViewBox}" preserveAspectRatio="${preserveAspectRatioValue}" class="dashboard-map-svg dashboard-map-svg--scotland" id="dashboardScotlandSvg" aria-label="Schottlandkarte der Genussdatenbank" role="img">`;
    });
}

function normalizeUsaSvgMarkup(svgText) {
  if (!svgText) return "";

  return String(svgText)
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<svg\b([^>]*)>/i, (match, attrs) => {
      const widthMatch = attrs.match(/\swidth="([^"]*)"/i);
      const heightMatch = attrs.match(/\sheight="([^"]*)"/i);
      const viewBoxMatch = attrs.match(/\sviewBox="([^"]*)"/i);
      const preserveAspectRatioMatch = attrs.match(/\spreserveAspectRatio="([^"]*)"/i);

      const widthValue = widthMatch ? widthMatch[1].replace(/px$/i, "") : "";
      const heightValue = heightMatch ? heightMatch[1].replace(/px$/i, "") : "";
      const viewBoxValue = viewBoxMatch ? viewBoxMatch[1] : "";
      const preserveAspectRatioValue = preserveAspectRatioMatch ? preserveAspectRatioMatch[1] : "xMidYMid meet";

      const cleanedAttrs = attrs
        .replace(/\sclass="[^"]*"/gi, "")
        .replace(/\sid="[^"]*"/gi, "")
        .replace(/\sstyle="[^"]*"/gi, "")
        .replace(/\swidth="[^"]*"/gi, "")
        .replace(/\sheight="[^"]*"/gi, "")
        .replace(/\sviewBox="[^"]*"/gi, "")
        .replace(/\spreserveAspectRatio="[^"]*"/gi, "");

      const finalViewBox = viewBoxValue || (widthValue && heightValue ? `0 0 ${widthValue} ${heightValue}` : "0 0 958.691 592.79");

      return `<svg${cleanedAttrs} viewBox="${finalViewBox}" preserveAspectRatio="${preserveAspectRatioValue}" class="dashboard-map-svg dashboard-map-svg--usa" id="dashboardUsaSvg" aria-label="USA-Karte der Genussdatenbank" role="img">`;
    });
}

function normalizeUkSvgMarkup(svgText) {
  if (!svgText) return "";

  return String(svgText)
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<svg\b([^>]*)>/i, (match, attrs) => {
      const widthMatch = attrs.match(/\swidth="([^"]*)"/i);
      const heightMatch = attrs.match(/\sheight="([^"]*)"/i);
      const viewBoxMatch = attrs.match(/\sviewBox="([^"]*)"/i);
      const preserveAspectRatioMatch = attrs.match(/\spreserveAspectRatio="([^"]*)"/i);

      const widthValue = widthMatch ? widthMatch[1].replace(/px$/i, "") : "";
      const heightValue = heightMatch ? heightMatch[1].replace(/px$/i, "") : "";
      const viewBoxValue = viewBoxMatch ? viewBoxMatch[1] : "";
      const preserveAspectRatioValue = preserveAspectRatioMatch ? preserveAspectRatioMatch[1] : "xMidYMid meet";

      const cleanedAttrs = attrs
        .replace(/\sclass="[^"]*"/gi, "")
        .replace(/\sid="[^"]*"/gi, "")
        .replace(/\sstyle="[^"]*"/gi, "")
        .replace(/\swidth="[^"]*"/gi, "")
        .replace(/\sheight="[^"]*"/gi, "")
        .replace(/\sviewBox="[^"]*"/gi, "")
        .replace(/\spreserveAspectRatio="[^"]*"/gi, "");

      const finalViewBox = viewBoxValue || (widthValue && heightValue ? `0 0 ${widthValue} ${heightValue}` : "0 0 885.546 1368.581");

      return `<svg${cleanedAttrs} viewBox="${finalViewBox}" preserveAspectRatio="${preserveAspectRatioValue}" class="dashboard-map-svg dashboard-map-svg--uk" id="dashboardUkSvg" aria-label="Großbritannien-und-Irland-Karte der Genussdatenbank" role="img">`;
    });
}

function renderGermanyRegionSvg(svgText) {
  if (!worldMapEl) return;

  const normalizedSvg = normalizeGermanySvgMarkup(svgText);
  if (!normalizedSvg) {
    renderMapPlaceholder("Deutschlandkarte konnte nicht vorbereitet werden.");
    return;
  }

  worldMapEl.innerHTML = `
    <div class="dashboard-map-stage dashboard-map-stage--country-regions">
      ${normalizedSvg}
    </div>
  `;

  const svgEl = getGermanyRegionSvgEl();
  if (svgEl) {
    markGermanyRegions(svgEl);
    bindGermanyRegionInteractions();
  }

  currentMapView = "country-regions";
  currentMapCountry = "Deutschland";
  syncGermanyRegionSelectionFromState();
  updateMapUiForView();
}

function renderScotlandRegionSvg(svgText) {
  if (!worldMapEl) return;

  const normalizedSvg = normalizeScotlandSvgMarkup(svgText);
  if (!normalizedSvg) {
    renderMapPlaceholder("Schottlandkarte konnte nicht vorbereitet werden.");
    return;
  }

  worldMapEl.innerHTML = `
    <div class="dashboard-map-stage dashboard-map-stage--country-regions">
      ${normalizedSvg}
    </div>
  `;

  const svgEl = getScotlandRegionSvgEl();
  if (svgEl) {
    markScotlandRegions(svgEl);
    bindScotlandRegionInteractions();
  }

  currentMapView = "country-regions";
  currentMapCountry = "Schottland";
  syncScotlandRegionSelectionFromState();
  updateMapUiForView();
}

function renderUsaRegionSvg(svgText) {
  if (!worldMapEl) return;

  const normalizedSvg = normalizeUsaSvgMarkup(svgText);
  if (!normalizedSvg) {
    renderMapPlaceholder("USA-Karte konnte nicht vorbereitet werden.");
    return;
  }

  worldMapEl.innerHTML = `
    <div class="dashboard-map-stage dashboard-map-stage--country-regions">
      ${normalizedSvg}
    </div>
  `;

  const svgEl = getUsaRegionSvgEl();
  if (svgEl) {
    markUsaRegions(svgEl);
    bindUsaRegionInteractions();
  }

  currentMapView = "country-regions";
  currentMapCountry = "USA";
  syncUsaRegionSelectionFromState();
  updateMapUiForView();
}

function renderUkSubregionSvg(svgText) {
  if (!worldMapEl) return;

  const normalizedSvg = normalizeUkSvgMarkup(svgText);
  if (!normalizedSvg) {
    renderMapPlaceholder("Großbritannien-&-Irland-Karte konnte nicht vorbereitet werden.");
    return;
  }

  worldMapEl.innerHTML = `
    <div class="dashboard-map-stage dashboard-map-stage--country-regions">
      ${normalizedSvg}
    </div>
  `;

  const svgEl = getUkSubregionSvgEl();
  if (svgEl) {
    markUkSubregions(svgEl);
    bindUkSubregionInteractions();
  }

  currentMapView = "country-subregions";
  currentMapCountry = "Großbritannien & Irland";
  syncUkSubregionSelectionFromState();
  updateMapUiForView();
}

async function loadCountryRegionMap(countryName, svgPath) {
  if (!worldMapEl) return;

  renderMapPlaceholder(`${countryName} wird geladen…`);

  try {
    const res = await fetch(svgPath, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${svgPath}`);
    }

    const svgText = await res.text();
    currentMapCountry = countryName;
    currentMapRegion = null;
    currentSelectedRegionNode = null;
    resetWorldInteractionState();

    if (countryName === "Deutschland") {
      renderGermanyRegionSvg(svgText);
      return;
    }

    if (countryName === "Schottland") {
      renderScotlandRegionSvg(svgText);
      return;
    }

    if (countryName === "Großbritannien & Irland") {
      renderUkSubregionSvg(svgText);
      return;
    }

    if (countryName === "USA") {
      renderUsaRegionSvg(svgText);
      return;
    }

    renderMapPlaceholder(`Für ${countryName} ist noch keine Regionenkarte hinterlegt.`);
  } catch (err) {
    console.error(err);
    renderMapPlaceholder(`${countryName} konnte nicht geladen werden.`);
  }
}

function renderWorldSvg(svgText) {
  if (!worldMapEl) return;

  const normalizedSvg = normalizeWorldSvgMarkup(svgText);
  if (!normalizedSvg) {
    renderMapPlaceholder("Weltkarte konnte nicht vorbereitet werden.");
    return;
  }

  worldMapEl.innerHTML = `
    <div class="dashboard-map-stage dashboard-map-stage--world">
      ${normalizedSvg}
    </div>
  `;

  const svgEl = getWorldSvgEl();
  if (svgEl) {
    const originalViewBox = parseViewBoxValue(svgEl.getAttribute("viewBox") || "0 0 1405 601") || { x: 0, y: 0, width: 1405, height: 601 };
    worldMapViewBoxState = {
      base: cloneViewBox(originalViewBox),
      current: cloneViewBox(originalViewBox)
    };
    resetWorldInteractionState();
    markInteractiveCountries(svgEl);
    bindWorldCountryHoverInteractions();
    bindWorldMapInteractions();
    applyWorldViewBox(originalViewBox);
  }

  currentMapView = "world";
  currentMapCountry = null;
  currentMapRegion = null;
  currentSelectedRegionNode = null;
  resetWorldViewBox();
  updateMapUiForView();
}

async function loadWorldMapSvg() {
  if (!worldMapEl) return;

  renderMapPlaceholder("Weltkarte wird geladen…");

  try {
    const res = await fetch(WORLD_MAP_SVG_PATH, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${WORLD_MAP_SVG_PATH}`);
    }

    const svgText = await res.text();
    currentMapView = "world";
    currentMapCountry = null;
    currentMapRegion = null;
    currentSelectedRegionNode = null;
    resetWorldInteractionState();
    renderWorldSvg(svgText);
  } catch (err) {
    console.error(err);
    renderMapPlaceholder("Weltkarte konnte nicht geladen werden. Prüfe den lokalen SVG-Pfad.");
  }
}

async function getAccessToken() {
  const parentSupabase = window.parent?.supabaseClient || window.supabaseClient || null;
  let accessToken = SUPABASE_ANON_KEY;

  if (parentSupabase?.auth?.getSession) {
    const { data, error } = await parentSupabase.auth.getSession();
    if (error) throw error;
    accessToken = data?.session?.access_token || accessToken;
  }

  return accessToken;
}

async function fetchJson(path) {
  const accessToken = await getAccessToken();

  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${path}`);
  }

  return await res.json();
}

async function loadDashboard() {
  document.title = "Whisky – Dashboard";
  window.parent?.postMessage({ type: "set-title", value: "Whisky – Dashboard" }, "*");

  try {
    const whiskys = await fetchJson(`/rest/v1/gdb_whiskys?select=id,country,image_url,provisional,collector,name,region,distillery`);
    const userRows = uid
      ? await fetchJson(`/rest/v1/gdb_whisky_user?user_id=eq.${encodeURIComponent(uid)}&select=whisky_id,rating,pli,notes`)
      : [];

    currentWhiskys = whiskys;
    currentUserRows = userRows;

    const totalWhiskys = whiskys.length;
    const countries = [...new Set(
      whiskys
        .map((w) => (w.country || "").trim())
        .filter(Boolean)
    )];

    const collectorCount = whiskys.filter((w) => !!w.collector).length;
    const provisionalCount = whiskys.filter((w) => !!w.provisional).length;

    const ratings = userRows
      .map((r) => Number(r.rating))
      .filter((v) => Number.isFinite(v));

    const plis = userRows
      .map((r) => Number(r.pli))
      .filter((v) => Number.isFinite(v));

    const avgRating = ratings.length
      ? fmtNum(ratings.reduce((a, b) => a + b, 0) / ratings.length, 2)
      : "–";

    const avgPli = plis.length
      ? fmtNum(plis.reduce((a, b) => a + b, 0) / plis.length, 2)
      : "–";

    const userMap = new Map(userRows.map((r) => [r.whisky_id, r]));

    const provisionalEntries = whiskys.filter((w) => !!w.provisional);
    const imageMissingEntries = whiskys.filter((w) => !(w.image_url || "").trim());
    const ratingMissingEntries = whiskys.filter((w) => {
      const row = userMap.get(w.id);
      return !row || row.rating == null || row.rating === "";
    });
    const notesMissingEntries = whiskys.filter((w) => {
      const row = userMap.get(w.id);
      return !row || !(row.notes || "").trim();
    });

    renderStats({
      totalWhiskys,
      totalCountries: countries.length,
      avgRating,
      avgPli,
      collectorCount,
      provisionalCount
    });

    renderCare([
      { key: "provisional", label: "Vorläufige Einträge", value: provisionalCount, entries: provisionalEntries },
      { key: "without_image", label: "Ohne Bild", value: imageMissingEntries.length, entries: imageMissingEntries },
      { key: "without_rating", label: "Ohne eigene Bewertung", value: ratingMissingEntries.length, entries: ratingMissingEntries },
      { key: "without_notes", label: "Ohne eigene Notizen", value: notesMissingEntries.length, entries: notesMissingEntries }
    ]);

    renderMapPlaceholder("Weltkarte wird vorbereitet…");
    const restored = await restoreDashboardFromReturnContext();
    if (!restored) {
      await loadWorldMapSvg();
    }
  } catch (err) {
    console.error(err);

    statsGridEl.innerHTML = `
      <div class="dashboard-stat card">
        <div class="dashboard-stat-value">–</div>
        <div class="dashboard-stat-label">Dashboard konnte nicht geladen werden</div>
      </div>
    `;

    careListEl.innerHTML = `<div class="dashboard-empty">Dashboard konnte nicht geladen werden.</div>`;
    currentMapView = "world";
    currentMapCountry = null;
    currentMapRegion = null;
    currentSelectedRegionNode = null;
    renderMapPlaceholder("Karte konnte nicht geladen werden.");
  }
}

document.addEventListener("click", (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;

  const whiskyBtn = target.closest("[data-care-whisky-id]");
  if (whiskyBtn instanceof HTMLElement) {
    openWhiskyDetail(whiskyBtn.getAttribute("data-care-whisky-id") || "");
    return; 
  }

  const toggleBtn = target.closest("[data-care-key]");
  if (toggleBtn instanceof HTMLElement && careListEl?.contains(toggleBtn)) {
    const key = toggleBtn.getAttribute("data-care-key") || "";
    currentCareExpandedKey = currentCareExpandedKey === key ? null : key;
    renderCare(currentCareItems);
  }
});

mapBackButtonEl?.addEventListener("click", () => {
  if (currentMapView === "country-regions") {
    if (isScotlandRegionMapActive()) {
      currentMapCountry = "Großbritannien & Irland";
      currentMapRegion = null;
      currentSelectedRegionNode = null;
      void loadCountryRegionMap("Großbritannien & Irland", UK_MAP_SVG_PATH);
      return;
    }

    void loadWorldMapSvg();
    return;
  }

  if (currentMapView === "country-subregions") {
    void loadWorldMapSvg();
    return;
  }

  currentMapView = "world";
  currentMapCountry = null;
  currentMapRegion = null;
  currentSelectedRegionNode = null;
  resetWorldViewBox();
  updateMapUiForView();
});

window.addEventListener("message", (e) => {
  const data = e.data || {};

  if (data.type === "gdb-dashboard-back-to-uk") {
    if (!isScotlandRegionMapActive()) return;
    currentMapCountry = "Großbritannien & Irland";
    currentMapRegion = null;
    currentSelectedRegionNode = null;
    void loadCountryRegionMap("Großbritannien & Irland", UK_MAP_SVG_PATH);
    return;
  }

  if (data.type === "gdb-dashboard-back-to-world") {
    if (currentMapView === "world") return;
    void loadWorldMapSvg();
  }
});

loadDashboard();