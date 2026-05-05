// gdb_whisky_detail.js

function fmtDE(iso) {
  if (!iso) return "–";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "–";
  return d.toLocaleString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

(function () {
  const params                  = new URLSearchParams(window.location.search);

  console.log("DETAIL params:", Object.fromEntries(params.entries()));
  
  const id                      = params.get("id") || "";
  const avgParam                = params.get("avg");
  const cntParam                = params.get("cnt");

  const avgRating               = (avgParam === null || avgParam === "") ? null : Number(avgParam);
  const cntRating               = Number(cntParam || 0);

  const pliParam                = params.get("pli");
  const pcntParam               = params.get("pcnt");

  const avgPli                  = (pliParam === null || pliParam === "") ? null : Number(pliParam);
  const cntPli                  = Number(pcntParam || 0);

  let currentAvgRating          = (avgRating == null || Number.isNaN(avgRating)) ? null : Number(avgRating);
  let currentCntRating          = Number(cntRating || 0);
  let currentAvgPli             = (avgPli == null || Number.isNaN(avgPli)) ? null : Number(avgPli);
  let currentCntPli             = Number(cntPli || 0);

  const pliMinParam             = params.get("plimin");
  const pliMaxParam             = params.get("plimax");

  const pliMin                  = (pliMinParam === null || pliMinParam === "") ? null : Number(pliMinParam);
  const pliMax                  = (pliMaxParam === null || pliMaxParam === "") ? null : Number(pliMaxParam);

  const myStockParam            = params.get("mystock");
  const myStockMl               = Number(myStockParam || 0);

  const myRatingParam           = params.get("myrating");
  const myPliParam              = params.get("mypli");

  const myRating                = (myRatingParam === null || myRatingParam === "") ? null : Number(myRatingParam);
  const myPli                   = (myPliParam === null || myPliParam === "") ? null : Number(myPliParam);

  const notesParam              = params.get("notes");
  const myNotes                 = (notesParam ?? "");

  const colorParam              = params.get("t_color");
  const myColor                 = (colorParam ?? "");

  const noseParam               = params.get("t_nose");
  const myNose                  = (noseParam ?? "");

  const palateParam             = params.get("t_palate");
  const myPalate                = (palateParam ?? "");

  const finishParam             = params.get("t_finish");
  const myFinish                = (finishParam ?? "");

  const summaryParam            = params.get("t_summary");
  const mySummary               = (summaryParam ?? "");

  const trinkgelegenheitParam   = params.get("t_trinkgelegenheit");
  const myTrinkgelegenheit      = (trinkgelegenheitParam ?? "");

  const myWishlistParam         = params.get("myWishlist");
  const myWishlist              = (myWishlistParam === "1" || myWishlistParam === "true");

  const created_atParam         = params.get("created_at") || "";
  const updated_atParam         = params.get("updated_at") || "";

  const created_by              = params.get("created_by") || "";
  const updated_by              = params.get("updated_by") || "";

  const myCreatedAt             = params.get("my_created_at") || "";
  const myUpdatedAt             = params.get("my_updated_at") || "";

  const dbg                     = document.getElementById("detailDebug");

  // if (dbg) dbg.textContent = `whisky id=${id}`;

  // Ziel-Element in der HTML
  const titleEl                 = document.getElementById("whiskyName");
  const distilleryEl            = document.getElementById("whiskyDistillery");
  const dotEl                   = document.getElementById("whiskyDot");
  const bottlerEl               = document.getElementById("whiskyBottler");
  const countryFlagImg          = document.getElementById("countryFlagImg");
  const countryTextEl           = document.getElementById("countryText");
  const regionFlagImg           = document.getElementById("regionFlagImg");
  const regionTextEl            = document.getElementById("regionText");
  const originLine              = document.getElementById("whiskyOriginLine");
  const imgWrapEl               = document.getElementById("whiskyImageWrap");
  const imgEl                   = document.getElementById("whiskyImage");
  const ageEl                   = document.getElementById("whiskyAge");
  const volumeEl                = document.getElementById("whiskyVolume");
  const abvEl                   = document.getElementById("whiskyAbv");
  const statsLineEl             = document.getElementById("whiskyStatsLine");
  const sepAgeVolEl             = document.getElementById("sepAgeVol");
  const sepVolAbvEl             = document.getElementById("sepVolAbv");
  const caskLineEl              = document.getElementById("whiskyCaskLine");
  const caskEl                  = document.getElementById("whiskyCaskType");
  const priceEl                 = document.getElementById("whiskyPrice");
  const outturnLineEl           = document.getElementById("whiskyOutturnLine");
  const outturnEl               = document.getElementById("whiskyOutturn");
  const editBottleOutturnEl     = document.getElementById("editBottleOutturn");
  const collectorBadgeEl        = document.getElementById("whiskyCollectorBadge");
  const provisionalBadgeEl      = document.getElementById("whiskyProvisionalBadge");
  const masterDataEditFieldsEl  = document.getElementById("masterDataEditFields");
  const editPriceEurEl          = document.getElementById("editPriceEur");
  const editVolumeMlEl          = document.getElementById("editVolumeMl");
  const editAbvEl               = document.getElementById("editAbv");
  const editWhiskyNameEl        = document.getElementById("editWhiskyName");
  const editDistilleryEl        = document.getElementById("editDistillery");
  const editBottlerEl           = document.getElementById("editBottler");
  const editCountryEl            = document.getElementById("editCountry");
  const editRegionEl             = document.getElementById("editRegion");
  const originalRegionOptions    = editRegionEl ? Array.from(editRegionEl.options).map(opt => ({ value: opt.value, text: opt.textContent || "" })) : [];
  const editFlagUrlEl            = document.getElementById("editFlagUrl");
  const editRegionFlagUrlEl      = document.getElementById("editRegionFlagUrl");
  const editCountryFlagPreviewEl = document.getElementById("editCountryFlagPreview");
  const editRegionFlagPreviewEl  = document.getElementById("editRegionFlagPreview");
  const editAgeYearsEl          = document.getElementById("editAgeYears");
  if (editAgeYearsEl) editAgeYearsEl.min = "1";
  const editIsNasEl             = document.getElementById("editIsNas");
  const editIsIncompleteEl      = document.getElementById("editIsIncomplete");
  const editIsCollectorEl       = document.getElementById("editIsCollector");
  const editCaskTypeEl          = document.getElementById("editCaskType");
  const imageEditFieldsEl       = document.getElementById("imageEditFields");
  const editImageUploadEl       = document.getElementById("editImageUpload");
  const btnDeleteImageEl        = document.getElementById("btnDeleteImage");
  const imageEditHintEl         = document.getElementById("imageEditHint");
  const detailAvgRatingStarsEl  = document.getElementById("detailAvgRatingStars");
  const detailAvgRatingTextEl   = document.getElementById("detailAvgRatingText");
  const detailAvgPliTextEl      = document.getElementById("detailAvgPliText");
  const detailPliScaleEl        = document.getElementById("detailPliScale");
  const detailMyRatingStarsEl   = document.getElementById("detailMyRatingStars");
  const detailMyRatingTextEl    = document.getElementById("detailMyRatingText");
  const editMyRatingWrapEl      = document.getElementById("editMyRatingWrap");
  const editMyRatingStarsEl     = document.getElementById("editMyRatingStars");
  const detailMyPliTextEl       = document.getElementById("detailMyPliText");
  const detailMyPliScaleEl      = document.getElementById("detailMyPliScale");
  const btnEditMyDetails        = document.getElementById("btnEditMyDetails");
  const btnCancelMyDetailsEdit  = document.getElementById("btnCancelMyDetailsEdit");
  const myDetailsEditHintEl     = document.getElementById("myDetailsEditHint");
  const myDetailsViewModeEl     = document.getElementById("myDetailsViewMode");
  const btnEditMasterData       = document.getElementById("btnEditMasterData");
  const btnDeleteWhisky         = document.getElementById("btnDeleteWhisky");
  const btnCancelMasterDataEdit = document.getElementById("btnCancelMasterDataEdit");
  const deleteWhiskyModalEl     = document.getElementById("deleteWhiskyModal");
  const deleteWhiskyModalTextEl = document.getElementById("deleteWhiskyModalText");
  const btnCancelDeleteWhisky   = document.getElementById("btnCancelDeleteWhisky");
  const btnConfirmDeleteWhisky  = document.getElementById("btnConfirmDeleteWhisky");
  const masterDataEditHintEl    = document.getElementById("masterDataEditHint");
  const masterDataViewModeEl    = document.getElementById("masterDataViewMode");
  const notesEl                 = document.getElementById("detailMyNotes");
  const editMyNotesEl           = document.getElementById("editMyNotes");
  if (notesEl) notesEl.textContent = myNotes.trim() ? myNotes : "–";
  if (editMyNotesEl) editMyNotesEl.value = myNotes;
  const colorEl                 = document.getElementById("detailMyColor");
  if (colorEl) colorEl.textContent = myColor.trim() ? myColor : "–";
  const editMyColorEl           = document.getElementById("editMyColor");
  if (editMyColorEl) editMyColorEl.value = myColor;
  const noseEl                 = document.getElementById("detailMyNose");
  if (noseEl) noseEl.textContent = myNose.trim() ? myNose : "–";
  const editMyNoseEl           = document.getElementById("editMyNose");
  if (editMyNoseEl) editMyNoseEl.value = myNose;
  const palateEl                 = document.getElementById("detailMyPalate");
  if (palateEl) palateEl.textContent = myPalate.trim() ? myPalate : "–";
  const editMyPalateEl           = document.getElementById("editMyPalate");
  if (editMyPalateEl) editMyPalateEl.value = myPalate;
  const finishEl                 = document.getElementById("detailMyFinish");
  if (finishEl) finishEl.textContent = myFinish.trim() ? myFinish : "–";
  const editMyFinishEl           = document.getElementById("editMyFinish");
  if (editMyFinishEl) editMyFinishEl.value = myFinish;
  const summaryEl                 = document.getElementById("detailMySummary");
  if (summaryEl) summaryEl.textContent = mySummary.trim() ? mySummary : "–";
  const editMySummaryEl          = document.getElementById("editMySummary");
  if (editMySummaryEl) editMySummaryEl.value = mySummary;
  const trinkgelegenheitEl       = document.getElementById("detailMyTrinkgelegenheit");
  if (trinkgelegenheitEl) trinkgelegenheitEl.textContent = myTrinkgelegenheit.trim() ? myTrinkgelegenheit : "–";
  const editMyTrinkgelegenheitEl = document.getElementById("editMyTrinkgelegenheit");
  if (editMyTrinkgelegenheitEl) editMyTrinkgelegenheitEl.value = myTrinkgelegenheit;
  const wishlistEl = document.getElementById("detailMyWishlist");
  if (wishlistEl) wishlistEl.textContent = myWishlist ? "✔" : "–";
  const editMyWishlistEl        = document.getElementById("editMyWishlist");
  if (editMyWishlistEl) editMyWishlistEl.checked = !!myWishlist;
  const detailBottleWrapEl      = document.getElementById("detailBottleWrap");
  const detailChangelogListEl   = document.getElementById("detailChangelogList");

  const stockTextEl             = document.getElementById("detailStockText");
  const editMyStockWrapEl       = document.getElementById("editMyStockWrap");
  const editMyStockEl           = document.getElementById("editMyStock");
  const btnStockMinus2cl        = document.getElementById("btnStockMinus2cl");
  const btnStockMinus4cl        = document.getElementById("btnStockMinus4cl");
  if (editMyStockEl) editMyStockEl.value = Number.isFinite(myStockMl) ? String(myStockMl) : "0";

  const cEl = document.getElementById("detail_created_at");
  const uEl = document.getElementById("detail_updated_at");
  if (cEl) cEl.textContent = fmtDE(created_atParam);
  if (uEl) uEl.textContent = fmtDE(updated_atParam);

  const createdByEl = document.getElementById("detail_created_by");
  const updatedByEl = document.getElementById("detail_updated_by");

  if (createdByEl) createdByEl.textContent = created_by ? created_by : "–";
  if (updatedByEl) updatedByEl.textContent = updated_by ? updated_by : "–";

  const myCreatedEl = document.getElementById("detail_my_created_at");
  if (myCreatedEl) myCreatedEl.textContent = myCreatedAt ? fmtDE(myCreatedAt) : "–";

  const myUpdatedEl = document.getElementById("detail_my_updated_at");
  if (myUpdatedEl) myUpdatedEl.textContent = myUpdatedAt ? fmtDE(myUpdatedAt) : "–";

  let isMyDetailsEditMode = false;
  let isMasterDataEditMode = false;
  let savedWhiskyName = "";
  let savedDistillery = "";
  let savedBottler = "";
  let savedCountry = "";
  let savedRegion = "";
  let savedFlagUrl = "";
  let savedRegionFlagUrl = "";
  let savedAgeYears = null;
  let savedIsNas = false;
  let savedVolumeMl = null;
  let savedAbv = null;
  let savedCaskType = "";
  let savedPriceEur = null;
  let savedPricePerLiter = null;
  let savedProvisional = false;
  let savedCollector = false;
  let savedBottleOutturn = null;

  let savedImageUrl = "";
  let originalImageUrl = "";
  let pendingImageFile = null;
  let deleteImageOnSave = false;

  let originalWhiskyName = "";
  let originalDistillery = "";
  let originalBottler = "";
  let originalCountry = "";
  let originalRegion = "";
  let originalFlagUrl = "";
  let originalRegionFlagUrl = "";
  let originalAgeYears = null;
  let originalIsNas = false;
  let originalVolumeMl = null;
  let originalAbv = null;
  let originalCaskType = "";
  let originalPriceEur = null;
  let originalProvisional = false;
  let originalCollector = false;
  let originalBottleOutturn = null;
  const FLAG_BASE_URL = "https://commons.wikimedia.org/wiki/Special:FilePath/";

  const COUNTRY_FLAG_MAP = {
    "Deutschland": "Flag_of_Germany.svg",
    "Schottland": "Flag_of_the_United_Kingdom.svg",
    "Nordirland": "Flag_of_the_United_Kingdom.svg",
    "Irland": "Flag_of_Ireland.svg",
    "USA": "Flag_of_the_United_States.svg",
    "Japan": "Flag_of_Japan.svg",
    "Australien": "Flag_of_Australia.svg",
    "Kanada": "Flag_of_Canada_(Pantone).svg",
    "Indien": "Flag_of_India.svg",
    "Schweiz": "Flag_of_Switzerland.svg",
    "Taiwan": "Flag_of_Taiwan.svg",
    "Finnland": "Flag_of_Finland.svg"
  };

  const REGION_FLAG_MAP = {
    "Baden-Württemberg": "Flag_of_Baden-W%C3%BCrttemberg.svg",
    "Bayern": "Flag_of_Bavaria_(lozengy).svg",
    "Berlin": "Flag_of_Berlin.svg",
    "Brandenburg": "Flag_of_Brandenburg.svg",
    "Bremen": "Flag_of_Bremen.svg",
    "Hamburg": "Flag_of_Hamburg.svg",
    "Hessen": "Flag_of_Hesse.svg",
    "Mecklenburg-Vorpommern": "Flag_of_Mecklenburg-Western_Pomerania.svg",
    "Niedersachsen": "Flag_of_Lower_Saxony.svg",
    "Nordrhein-Westfalen": "Flag_of_North_Rhine-Westphalia.svg",
    "Rheinland-Pfalz": "Flag_of_Rhineland-Palatinate.svg",
    "Saarland": "Flag_of_Saarland.svg",
    "Sachsen": "Flag_of_Saxony_(state).svg",
    "Sachsen-Anhalt": "Flag_of_Saxony-Anhalt.svg",
    "Schleswig-Holstein": "Flag_of_Schleswig-Holstein.svg",
    "Thüringen": "Flag_of_Thuringia_(state).svg",
    "Highlands": "Flag_of_Scotland.svg",
    "Speyside": "Flag_of_Scotland.svg",
    "Lowlands": "Flag_of_Scotland.svg",
    "Islay": "Flag_of_Scotland.svg",
    "Islands": "Flag_of_Scotland.svg",
    "Campbeltown": "Flag_of_Scotland.svg",
    "Leinster": "Flag_of_Leinster.svg",
    "Cork/ Munster": "Flag_of_Munster.svg",
    "Antrim": "Flag_of_Northern_Ireland.svg",
    "Victoria/ Melbourne": "Flag_of_Victoria_(Australia).svg",
    "Kentucky": "Flag_of_Kentucky.svg",
    "Indiana": "Flag_of_Indiana.svg",
    "Manitoba": "Flag_of_Canada_(Pantone).svg"
  };

  const REGION_BY_COUNTRY = {
    "Deutschland": ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"],
    "Schottland": ["Highlands", "Speyside", "Lowlands", "Islay", "Islands", "Campbeltown"],
    "Irland": ["Leinster", "Cork/ Munster"],
    "Nordirland": ["Antrim"],
    "USA": ["Kentucky", "Indiana"],
    "Australien": ["Victoria/ Melbourne"],
    "Kanada": ["Manitoba"]
  };

  function getCountryFlagUrl(countryValue) {
    const key = (countryValue ?? "").toString().trim();
    return key && COUNTRY_FLAG_MAP[key] ? `${FLAG_BASE_URL}${COUNTRY_FLAG_MAP[key]}` : "";
  }

  function getRegionFlagUrl(regionValue) {
    const key = (regionValue ?? "").toString().trim();
    return key && REGION_FLAG_MAP[key] ? `${FLAG_BASE_URL}${REGION_FLAG_MAP[key]}` : "";
  }

  function syncFlagFieldsFromSelection() {
    const countryValue = (editCountryEl?.value || "").trim();
    const regionValue = (editRegionEl?.value || "").trim();

    const nextFlagUrl = getCountryFlagUrl(countryValue);
    const nextRegionFlagUrl = getRegionFlagUrl(regionValue);

    if (editFlagUrlEl) editFlagUrlEl.value = nextFlagUrl;
    if (editRegionFlagUrlEl) editRegionFlagUrlEl.value = nextRegionFlagUrl;

    if (countryFlagImg) {
      if (nextFlagUrl) {
        countryFlagImg.src = nextFlagUrl;
        countryFlagImg.style.display = "inline";
      } else {
        countryFlagImg.style.display = "none";
      }
    }

    if (regionFlagImg) {
      if (nextRegionFlagUrl) {
        regionFlagImg.src = nextRegionFlagUrl;
        regionFlagImg.style.display = "inline";
      } else {
        regionFlagImg.style.display = "none";
      }
    }

    if (editCountryFlagPreviewEl) {
      if (nextFlagUrl) {
        editCountryFlagPreviewEl.src = nextFlagUrl;
        editCountryFlagPreviewEl.style.display = "inline-block";
      } else {
        editCountryFlagPreviewEl.style.display = "none";
      }
    }

    if (editRegionFlagPreviewEl) {
      if (nextRegionFlagUrl) {
        editRegionFlagPreviewEl.src = nextRegionFlagUrl;
        editRegionFlagPreviewEl.style.display = "inline-block";
      } else {
        editRegionFlagPreviewEl.style.display = "none";
      }
    }
  }

  function filterRegionsByCountry() {
    if (!editCountryEl || !editRegionEl) return;

    const selectedCountry = (editCountryEl.value || "").trim();
    const hasCountrySelection = selectedCountry !== "";
    const allowedRegions = REGION_BY_COUNTRY[selectedCountry] || [];
    const currentRegion = (editRegionEl.value || "").trim();

    editRegionEl.innerHTML = "";

    if (hasCountrySelection && allowedRegions.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Keine Regionen verfügbar";
      editRegionEl.appendChild(opt);
      editRegionEl.value = "";
      editRegionEl.disabled = true;
      return;
    }

    originalRegionOptions.forEach((optData) => {
      if (!optData.value) {
        const opt = document.createElement("option");
        opt.value = optData.value;
        opt.textContent = optData.text;
        editRegionEl.appendChild(opt);
        return;
      }

      if (allowedRegions.length > 0 && !allowedRegions.includes(optData.value)) {
        return;
      }

      const opt = document.createElement("option");
      opt.value = optData.value;
      opt.textContent = optData.text;
      editRegionEl.appendChild(opt);
    });

    editRegionEl.disabled = false;

    if (allowedRegions.length > 0 && currentRegion && allowedRegions.includes(currentRegion)) {
      editRegionEl.value = currentRegion;
    } else {
      editRegionEl.value = "";
    }
  }

  const defaultMasterDataHintText = masterDataEditHintEl
    ? (masterDataEditHintEl.textContent || "Bearbeitungsmodus aktiv")
    : "Bearbeitungsmodus aktiv";

  function renderMasterDataView() {
    if (titleEl) {
      titleEl.textContent = savedWhiskyName || "";
    }

    if (distilleryEl) {
      distilleryEl.textContent = savedDistillery || "";
    }

    if (bottlerEl) {
      bottlerEl.textContent = savedBottler || "";
    }

    const hasDistillery = !!savedDistillery;
    const hasBottler = !!savedBottler;

    if (dotEl) {
      dotEl.style.display = (hasDistillery && hasBottler) ? "inline" : "none";
    }

    if (countryTextEl) countryTextEl.textContent = savedCountry || "";
    if (regionTextEl) regionTextEl.textContent = savedRegion || "";

    if (countryFlagImg) {
      if (savedFlagUrl) {
        countryFlagImg.src = savedFlagUrl;
        countryFlagImg.style.display = "inline";
      } else {
        countryFlagImg.style.display = "none";
      }
    }

    if (regionFlagImg) {
      if (savedRegionFlagUrl) {
        regionFlagImg.src = savedRegionFlagUrl;
        regionFlagImg.style.display = "inline";
      } else {
        regionFlagImg.style.display = "none";
      }
    }

    if (originLine) {
      const sep = originLine.querySelector(".sep");
      if (sep) {
        sep.style.display = (savedCountry && savedRegion) ? "inline" : "none";
      }
    }

    const hasAge = savedIsNas || !!(savedAgeYears != null && Number(savedAgeYears) >= 1);
    const hasVol = !!(savedVolumeMl && Number(savedVolumeMl) > 0);
    const hasAbv = !!(savedAbv && Number(savedAbv) > 0);

    if (ageEl) {
      ageEl.textContent = savedIsNas
        ? "NAS"
        : (hasAge ? `${savedAgeYears} Jahre` : "");
      ageEl.style.display = hasAge ? "inline" : "none";
    }

    if (volumeEl) {
      volumeEl.textContent = hasVol ? `${savedVolumeMl} ml` : "";
      volumeEl.style.display = hasVol ? "inline" : "none";
    }

    if (abvEl) {
      abvEl.textContent = hasAbv ? `${savedAbv} % vol` : "";
      abvEl.style.display = hasAbv ? "inline" : "none";
    }

    if (sepAgeVolEl) {
      sepAgeVolEl.style.display = (hasAge && (hasVol || hasAbv)) ? "inline" : "none";
    }

    if (sepVolAbvEl) {
      sepVolAbvEl.style.display = (hasVol && hasAbv) ? "inline" : "none";
    }

    if (statsLineEl) {
      statsLineEl.style.display = (hasAge || hasVol || hasAbv) ? "" : "none";
    }

    const caskText = (savedCaskType ?? "").toString().trim();
    if (caskLineEl && caskEl) {
      caskEl.textContent = caskText || "-";
      caskLineEl.style.display = "";
    }

    if (priceEl) {
      const priceText = formatEuro(savedPriceEur);
      const literText = formatEuro(savedPricePerLiter);
      priceEl.textContent = `${priceText} € (${literText} €/L)`;
    }

    if (outturnLineEl && outturnEl) {
      if (savedBottleOutturn != null && !Number.isNaN(savedBottleOutturn)) {
        outturnEl.textContent = `${savedBottleOutturn} Flaschen`;
        outturnLineEl.style.display = "";
      } else {
        outturnLineEl.style.display = "none";
      }
    }

    currentBottleVolumeMl = Number(savedVolumeMl || 0);
    updateStockVisual(savedMyStock);

    if (savedWhiskyName) {
      document.title = `Whisky – ${savedWhiskyName}`;
      window.parent?.postMessage({ type: "set-title", value: `Whisky – ${savedWhiskyName}` }, "*");
    }

    if (collectorBadgeEl) {
      collectorBadgeEl.style.display = savedCollector ? "inline-block" : "none";
    }

    if (provisionalBadgeEl) {
      provisionalBadgeEl.hidden = !savedProvisional;
      provisionalBadgeEl.style.display = savedProvisional ? "inline-block" : "none";
    }
  }

  function resolveCurrentUser() {
    const directUser = window.parent?.currentUser || window.currentUser || null;
    if (directUser?.id) return directUser;

    const candidateKeys = [
      "currentUser",
      "gdb_current_user",
      "gdbUser",
      "user"
    ];

    for (const key of candidateKeys) {
      try {
        const raw = window.localStorage?.getItem(key) || window.sessionStorage?.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed?.id) return parsed;
      } catch {
        // ignore invalid storage data
      }
    }

    return null;
  }

  function requireUpdatePermission() {
    return window.parent?.GdbPermissions?.requirePermission?.('whisky', 'update') ?? true;
  }

  function requireDeletePermission() {
    return window.parent?.GdbPermissions?.requirePermission?.('whisky', 'delete') ?? true;
  }

  async function saveMasterDataToDb(nextMasterData) {
    const parentSupabase = window.parent?.supabaseClient || window.supabaseClient || null;
    const currentUser = resolveCurrentUser();

    if (!id) {
      throw new Error("Whisky-ID fehlt");
    }

    let accessToken = SUPABASE_ANON_KEY;

    if (parentSupabase?.auth?.getSession) {
      const { data, error } = await parentSupabase.auth.getSession();
      if (error) throw error;
      accessToken = data?.session?.access_token || accessToken;
    }

    const payload = {
      ...nextMasterData,
      updated_by: currentUser?.id || null
    };

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/gdb_whiskys?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      throw new Error(`Stammdaten speichern fehlgeschlagen (HTTP ${res.status})`);
    }

    return await res.json();
  }

  async function deleteWhiskyFromDb() {
    const parentSupabase = window.parent?.supabaseClient || window.supabaseClient || null;
    let accessToken = SUPABASE_ANON_KEY;

    if (!id) {
      throw new Error("Whisky-ID fehlt");
    }

    if (parentSupabase?.auth?.getSession) {
      const { data, error } = await parentSupabase.auth.getSession();
      if (error) throw error;
      accessToken = data?.session?.access_token || accessToken;
    }

    const imagePath = getStoragePathFromPublicUrl(savedImageUrl || originalImageUrl || "");

    if (imagePath && parentSupabase?.storage?.from) {
      const { error: storageError } = await parentSupabase.storage
        .from("whiskys")
        .remove([imagePath]);

      if (storageError) {
        throw storageError;
      }
    }

    const deleteUserRes = await fetch(
      `${SUPABASE_URL}/rest/v1/gdb_whisky_user?whisky_id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!deleteUserRes.ok) {
      throw new Error(`Whisky-Nutzerdaten löschen fehlgeschlagen (HTTP ${deleteUserRes.status})`);
    }

    const deleteItemsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/gdb_items?type=eq.whisky&ref_id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!deleteItemsRes.ok) {
      throw new Error(`Indexeintrag löschen fehlgeschlagen (HTTP ${deleteItemsRes.status})`);
    }

    const deleteWhiskyRes = await fetch(
      `${SUPABASE_URL}/rest/v1/gdb_whiskys?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!deleteWhiskyRes.ok) {
      throw new Error(`Whisky löschen fehlgeschlagen (HTTP ${deleteWhiskyRes.status})`);
    }
  }

  function openDeleteWhiskyModal(whiskyLabel) {
  if (!deleteWhiskyModalEl) return;
  if (deleteWhiskyModalTextEl) {
    deleteWhiskyModalTextEl.innerHTML = `
      Soll „${whiskyLabel}“ wirklich endgültig gelöscht werden?<br><br>
      Dabei werden die Stammdaten, alle zugehörigen Nutzerdaten, der Eintrag in der Gesamtübersicht und ein vorhandenes Bild dauerhaft entfernt.
    `;
  }
  deleteWhiskyModalEl.classList.remove("hidden");
  deleteWhiskyModalEl.setAttribute("aria-hidden", "false");
}

function closeDeleteWhiskyModal() {
  if (!deleteWhiskyModalEl) return;
  deleteWhiskyModalEl.classList.add("hidden");
  deleteWhiskyModalEl.setAttribute("aria-hidden", "true");
}

  async function fetchUserDisplayMap(userIds) {
    const ids = Array.from(new Set((userIds || []).filter(Boolean)));
    if (ids.length === 0) return {};

    const parentSupabase = window.parent?.supabaseClient || window.supabaseClient || null;
    let accessToken = SUPABASE_ANON_KEY;

    if (parentSupabase?.auth?.getSession) {
      const { data, error } = await parentSupabase.auth.getSession();
      if (error) throw error;
      accessToken = data?.session?.access_token || accessToken;
    }

    const idList = ids.map(v => `"${v}"`).join(",");
    const url =
      `${SUPABASE_URL}/rest/v1/gdb_users` +
      `?id=in.(${encodeURIComponent(idList)})` +
      `&select=id,username,display_name`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      throw new Error(`Benutzerdaten laden fehlgeschlagen (HTTP ${res.status})`);
    }

    const rows = await res.json();
    const map = {};
    rows.forEach((row) => {
      if (!row?.id) return;
      map[row.id] = (row.display_name || row.username || "–").toString();
    });
    return map;
  }

  function formatLogValue(value, type = "text") {
    if (value == null || value === "") return "–";

    if (type === "boolean") return value ? "Ja" : "Nein";
    if (type === "price") return `${formatEuro(value)} €`;
    if (type === "abv") return `${Number(value)} % vol`;
    if (type === "volume") return `${Number(value)} ml`;
    if (type === "outturn") return `${Number(value)} Flaschen`;
    if (type === "age") return Number(value) === 0 ? "NAS" : `${Number(value)} Jahre`;

    return String(value);
  }

  function buildMasterDataLogDetails(originalData, nextData, extraChanges = []) {
    const changes = [];

    const fields = [
      ["Name", originalData.name, nextData.name, "text"],
      ["Brennerei", originalData.distillery, nextData.distillery, "text"],
      ["Abfüller", originalData.bottler, nextData.bottler, "text"],
      ["Land", originalData.country, nextData.country, "text"],
      ["Region", originalData.region, nextData.region, "text"],
      ["Alter", originalData.age_years, nextData.age_years, "age"],
      ["Volumen", originalData.volume_ml, nextData.volume_ml, "volume"],
      ["Alkohol", originalData.abv, nextData.abv, "abv"],
      ["Fasstyp", originalData.fasstyp, nextData.fasstyp, "text"],
      ["Preis", originalData.price_eur, nextData.price_eur, "price"],
      ["Flaschenauflage", originalData.bottle_outturn, nextData.bottle_outturn, "outturn"],
      ["Vorläufig", originalData.provisional, nextData.provisional, "boolean"],
      ["Sammlerflasche", originalData.collector, nextData.collector, "boolean"]
    ];

    fields.forEach(([label, before, after, type]) => {
      const left = before == null ? null : String(before);
      const right = after == null ? null : String(after);
      if (left === right) return;
      changes.push(`${label}: ${formatLogValue(before, type)} → ${formatLogValue(after, type)}`);
    });

    extraChanges.forEach((entry) => {
      if (entry) changes.push(entry);
    });

    return changes.join(" | ");
  }

  function getLogDisplayName(user) {
    return user?.display_name || user?.username || null;
  }

  async function writeLogEntry({ action, itemType, itemId, itemName, details }) {
    const parentSupabase = window.parent?.supabaseClient || window.supabaseClient || null;
    const currentUser = resolveCurrentUser();

    let accessToken = SUPABASE_ANON_KEY;

    if (parentSupabase?.auth?.getSession) {
      const { data, error } = await parentSupabase.auth.getSession();
      if (error) throw error;
      accessToken = data?.session?.access_token || accessToken;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/gdb_log`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: currentUser?.id || null,
        username: getLogDisplayName(currentUser),
        action,
        item_type: itemType,
        item_id: itemId,
        item_name: itemName || null,
        details: details || null
      })
    });

    if (!res.ok) {
      throw new Error(`Logeintrag schreiben fehlgeschlagen (HTTP ${res.status})`);
    }
  }

  function renderDetailChangelog(entries) {
    if (!detailChangelogListEl) return;

    if (!Array.isArray(entries) || entries.length === 0) {
      detailChangelogListEl.innerHTML = `<div class="detail-changelog-empty">Noch keine Änderungen vorhanden.</div>`;
      return;
    }

    detailChangelogListEl.innerHTML = entries.map((entry) => {
      const ts = fmtDE(entry.timestamp);
      const userText = entry.display_name || entry.username || "–";
      const detailsText = entry.details || "–";
      return `
        <div class="detail-changelog-entry">
          <div class="detail-changelog-meta">${ts} · ${userText}</div>
          <div class="detail-changelog-details">${detailsText}</div>
        </div>
      `;
    }).join("");
  }

  async function loadDetailChangelog() {
    if (!detailChangelogListEl || !id) return;

    const parentSupabase = window.parent?.supabaseClient || window.supabaseClient || null;
    let accessToken = SUPABASE_ANON_KEY;

    if (parentSupabase?.auth?.getSession) {
      const { data, error } = await parentSupabase.auth.getSession();
      if (error) throw error;
      accessToken = data?.session?.access_token || accessToken;
    }

    const url =
      `${SUPABASE_URL}/rest/v1/gdb_log` +
      `?item_type=eq.whisky` +
      `&item_id=eq.${encodeURIComponent(id)}` +
      `&order=timestamp.desc` +
      `&limit=10` +
      `&select=timestamp,username,user_id,details`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      throw new Error(`Änderungsverlauf laden fehlgeschlagen (HTTP ${res.status})`);
    }

  const rows = await res.json();

  try {
    const userIds = rows.map(r => r.user_id).filter(Boolean);
    const userMap = await fetchUserDisplayMap(userIds);

    rows.forEach(r => {
      if (r.user_id && userMap[r.user_id]) {
        r.display_name = userMap[r.user_id];
      }
    });
  } catch (e) {
    console.error(e);
  }

  renderDetailChangelog(rows);
  }  

  function getStoragePathFromPublicUrl(publicUrl) {
    if (!publicUrl) return null;

    try {
      const url = new URL(publicUrl, window.location.origin);
      const marker = "/storage/v1/object/public/whiskys/";
      const idx = url.pathname.indexOf(marker);
      if (idx === -1) return null;
      return decodeURIComponent(url.pathname.slice(idx + marker.length));
    } catch {
      return null;
    }
  }

  async function saveImageToStorage() {
    const parentSupabase = window.parent?.supabaseClient || window.parent?.supabase || window.supabaseClient || window.supabase || null;

    if (!id) {
      throw new Error("Whisky-ID fehlt");
    }

    if (!parentSupabase?.storage?.from) {
      throw new Error("Supabase Storage nicht verfügbar");
    }

    const oldPath = getStoragePathFromPublicUrl(originalImageUrl);

    if (deleteImageOnSave) {
      if (oldPath) {
        await parentSupabase.storage.from("whiskys").remove([oldPath]);
      }

      const rows = await saveMasterDataToDb({ image_url: null });
      const row = Array.isArray(rows) ? rows[0] : null;
      savedImageUrl = (row?.image_url ?? "").toString();
      originalImageUrl = savedImageUrl;
      pendingImageFile = null;
      deleteImageOnSave = false;
      return savedImageUrl;
    }

    if (!pendingImageFile) {
      return savedImageUrl;
    }

    const ext = (pendingImageFile.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
    const filePath = `whisky_${id}_${Date.now()}.${safeExt}`;

    const { error: uploadError } = await parentSupabase.storage
      .from("whiskys")
      .upload(filePath, pendingImageFile, {
        cacheControl: "3600",
        upsert: true,
        contentType: pendingImageFile.type || undefined
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = parentSupabase.storage
      .from("whiskys")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl || "";
    const rows = await saveMasterDataToDb({ image_url: publicUrl || null });
    const row = Array.isArray(rows) ? rows[0] : null;

    if (oldPath && oldPath !== filePath) {
      await parentSupabase.storage.from("whiskys").remove([oldPath]);
    }

    savedImageUrl = (row?.image_url ?? publicUrl ?? "").toString();
    originalImageUrl = savedImageUrl;
    pendingImageFile = null;
    deleteImageOnSave = false;
    return savedImageUrl;
  }
  function syncNasUi() {
    if (!editAgeYearsEl) return;

    const isNas = !!editIsNasEl?.checked;
    editAgeYearsEl.readOnly = isNas;
    editAgeYearsEl.setAttribute("aria-readonly", isNas ? "true" : "false");

    if (isNas) {
      editAgeYearsEl.value = "";
    }
  }

  function applyMasterDataEditMode() {
    if (masterDataEditHintEl) {
      masterDataEditHintEl.hidden = !isMasterDataEditMode;
    }

    if (masterDataViewModeEl) {
      masterDataViewModeEl.dataset.editMode = isMasterDataEditMode ? "on" : "off";
    }

    if (titleEl) {
      titleEl.hidden = isMasterDataEditMode;
      titleEl.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (distilleryEl) {
      distilleryEl.hidden = isMasterDataEditMode;
      distilleryEl.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (dotEl) {
      dotEl.hidden = isMasterDataEditMode;

      if (isMasterDataEditMode) {
        dotEl.style.display = "none";
      } else {
        const hasDistillery = !!((savedDistillery ?? "").toString().trim());
        const hasBottler = !!((savedBottler ?? "").toString().trim());
        dotEl.style.display = (hasDistillery && hasBottler) ? "inline" : "none";
      }
    }

    if (bottlerEl) {
      bottlerEl.hidden = isMasterDataEditMode;
      bottlerEl.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (originLine) {
      originLine.hidden = isMasterDataEditMode;
      originLine.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (statsLineEl) {
      statsLineEl.hidden = isMasterDataEditMode;
      statsLineEl.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (caskLineEl) {
      caskLineEl.hidden = isMasterDataEditMode;
      caskLineEl.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (priceEl) {
      priceEl.hidden = isMasterDataEditMode;
      priceEl.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (outturnLineEl) {
      outturnLineEl.hidden = isMasterDataEditMode;
      outturnLineEl.style.display = isMasterDataEditMode ? "none" : (savedBottleOutturn != null && !Number.isNaN(savedBottleOutturn) ? "" : "none");
    }

    if (detailAvgRatingStarsEl) {
      detailAvgRatingStarsEl.hidden = isMasterDataEditMode;
      detailAvgRatingStarsEl.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (detailAvgRatingTextEl) {
      detailAvgRatingTextEl.hidden = isMasterDataEditMode;
      detailAvgRatingTextEl.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (detailAvgPliTextEl) {
      detailAvgPliTextEl.hidden = isMasterDataEditMode;
      detailAvgPliTextEl.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (detailPliScaleEl) {
      detailPliScaleEl.hidden = isMasterDataEditMode;
      detailPliScaleEl.style.display = isMasterDataEditMode ? "none" : "";
    }

    const avgRatingContainer = detailAvgRatingTextEl?.closest(".metrics-block") || document.getElementById("detailAvgRatingBlock");
    if (avgRatingContainer) {
      avgRatingContainer.hidden = isMasterDataEditMode;
      avgRatingContainer.style.display = isMasterDataEditMode ? "none" : "";
    }

    const avgPliContainer = detailAvgPliTextEl?.closest(".metrics-block") || document.getElementById("detailAvgPliBlock");
    if (avgPliContainer) {
      avgPliContainer.hidden = isMasterDataEditMode;
      avgPliContainer.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (masterDataEditFieldsEl) {
      masterDataEditFieldsEl.hidden = !isMasterDataEditMode;
      masterDataEditFieldsEl.style.display = isMasterDataEditMode ? "block" : "none";
    }
    if (imageEditFieldsEl) {
      imageEditFieldsEl.hidden = !isMasterDataEditMode;
      imageEditFieldsEl.style.display = isMasterDataEditMode ? "block" : "none";
    }

    if (isMasterDataEditMode) {
      if (editWhiskyNameEl) editWhiskyNameEl.value = originalWhiskyName || "";
      if (editDistilleryEl) editDistilleryEl.value = originalDistillery || "";
      if (editBottlerEl) editBottlerEl.value = originalBottler || "";
      if (editCountryEl) editCountryEl.value = originalCountry || "";
      if (editRegionEl) editRegionEl.value = originalRegion || "";
      filterRegionsByCountry();
      if (editFlagUrlEl) editFlagUrlEl.value = originalFlagUrl || "";
      if (editRegionFlagUrlEl) editRegionFlagUrlEl.value = originalRegionFlagUrl || "";
      syncFlagFieldsFromSelection();
      if (editAgeYearsEl) editAgeYearsEl.value = originalAgeYears == null ? "" : String(originalAgeYears);
      if (editIsNasEl) editIsNasEl.checked = !!originalIsNas;
      syncNasUi();
      if (editVolumeMlEl) editVolumeMlEl.value = originalVolumeMl == null ? "" : String(originalVolumeMl);
      if (editAbvEl) editAbvEl.value = originalAbv == null ? "" : String(originalAbv);
      if (editCaskTypeEl) editCaskTypeEl.value = originalCaskType || "";
      if (editPriceEurEl) editPriceEurEl.value = originalPriceEur == null ? "" : String(originalPriceEur);
      if (editBottleOutturnEl) editBottleOutturnEl.value = originalBottleOutturn == null ? "" : String(originalBottleOutturn);
      if (editIsIncompleteEl) editIsIncompleteEl.checked = !!originalProvisional;
      if (editIsCollectorEl) editIsCollectorEl.checked = !!originalCollector;
      if (collectorBadgeEl) {
        collectorBadgeEl.style.display = originalCollector ? "inline-flex" : "none";
      }
      if (provisionalBadgeEl) {
        provisionalBadgeEl.hidden = !originalProvisional;
        provisionalBadgeEl.style.display = originalProvisional ? "inline-block" : "none";
      }
      pendingImageFile = null;
      deleteImageOnSave = false;
      if (editImageUploadEl) {
        editImageUploadEl.value = "";
      }
      if (imageEditHintEl) {
        imageEditHintEl.hidden = true;
        imageEditHintEl.textContent = "";
      }
    }

    if (btnEditMasterData) {
      btnEditMasterData.textContent = isMasterDataEditMode
        ? "Speichern & Bearbeitung beenden"
        : "Stammdaten bearbeiten";
      btnEditMasterData.setAttribute("aria-pressed", isMasterDataEditMode ? "true" : "false");
    }

    if (btnDeleteWhisky) {
      btnDeleteWhisky.hidden = isMasterDataEditMode;
      btnDeleteWhisky.style.display = isMasterDataEditMode ? "none" : "";
    }

    if (btnCancelMasterDataEdit) {
      btnCancelMasterDataEdit.hidden = !isMasterDataEditMode;
    }
  }
if (btnEditMasterData) {
  btnEditMasterData.addEventListener("click", async () => {
    if (!isMasterDataEditMode) {
      if (!requireUpdatePermission()) {
        return;
      }

      originalWhiskyName = savedWhiskyName;
        originalDistillery = savedDistillery;
        originalBottler = savedBottler;
        originalCountry = savedCountry;
        originalRegion = savedRegion;
        originalFlagUrl = savedFlagUrl;
        originalRegionFlagUrl = savedRegionFlagUrl;
        originalAgeYears = savedAgeYears;
        originalIsNas = savedIsNas;
        originalVolumeMl = savedVolumeMl;
        originalAbv = savedAbv;
        originalCaskType = savedCaskType;
        originalPriceEur = savedPriceEur;
        originalProvisional = savedProvisional;
        originalCollector = savedCollector;
        originalBottleOutturn = savedBottleOutturn;
        originalImageUrl = savedImageUrl;

        if (masterDataEditHintEl) {
          masterDataEditHintEl.textContent = defaultMasterDataHintText;
        }

        isMasterDataEditMode = true;
        applyMasterDataEditMode();
        return;
      }

      if (!requireUpdatePermission()) {
        return;
      }

      const nextWhiskyName = (editWhiskyNameEl?.value || "").trim();
      const nextDistillery = (editDistilleryEl?.value || "").trim();
      const nextBottler = (editBottlerEl?.value || "").trim();
      const nextCountry = (editCountryEl?.value || "").trim();
      const nextRegion = (editRegionEl?.value || "").trim();
      const nextFlagUrl = getCountryFlagUrl(nextCountry);
      const nextRegionFlagUrl = getRegionFlagUrl(nextRegion);
      const nextIsNas = !!editIsNasEl?.checked;
      const nextAgeYears = nextIsNas
        ? 0
        : ((editAgeYearsEl?.value === "" || editAgeYearsEl?.value == null)
            ? null
            : Math.max(1, Number(editAgeYearsEl.value)));
      const nextVolumeMl = (editVolumeMlEl?.value === "" || editVolumeMlEl?.value == null)
        ? null
        : Math.max(0, Number(editVolumeMlEl.value));
      const nextAbv = (editAbvEl?.value === "" || editAbvEl?.value == null)
        ? null
        : Math.max(0, Number(editAbvEl.value));
      const nextCaskType = (editCaskTypeEl?.value || "").trim();
      const nextPriceEur = (editPriceEurEl?.value === "" || editPriceEurEl?.value == null)
        ? null
        : Math.max(0, Number(editPriceEurEl.value));
      const nextBottleOutturn = (editBottleOutturnEl?.value === "" || editBottleOutturnEl?.value == null)
        ? null
        : Math.max(0, Number(editBottleOutturnEl.value));
      const nextProvisional = !!editIsIncompleteEl?.checked;
      const nextCollector = !!editIsCollectorEl?.checked;
      const hadPendingImageFile = !!pendingImageFile;
      const hadDeleteImageOnSave = !!deleteImageOnSave;

      if (btnEditMasterData) btnEditMasterData.disabled = true;
      if (btnCancelMasterDataEdit) btnCancelMasterDataEdit.disabled = true;
      if (masterDataEditHintEl) {
        masterDataEditHintEl.hidden = false;
        masterDataEditHintEl.textContent = "Speichere…";
      }

      try {
        const savedRows = await saveMasterDataToDb({
          name: nextWhiskyName || null,
          distillery: nextDistillery || null,
          bottler: nextBottler || null,
          country: nextCountry || null,
          region: nextRegion || null,
          flag_url: nextFlagUrl || null,
          region_flag_url: nextRegionFlagUrl || null,
          age_years: nextAgeYears,
          volume_ml: nextVolumeMl,
          abv: nextAbv,
          fasstyp: nextCaskType || null,
          price_eur: nextPriceEur,
          bottle_outturn: nextBottleOutturn,
          provisional: nextProvisional,
          collector: nextCollector
        });

        const savedRow = Array.isArray(savedRows) ? savedRows[0] : null;

        savedWhiskyName = (savedRow?.name ?? nextWhiskyName ?? "").toString();
        savedDistillery = (savedRow?.distillery ?? nextDistillery ?? "").toString();
        savedBottler = (savedRow?.bottler ?? nextBottler ?? "").toString();
        savedCountry = (savedRow?.country ?? nextCountry ?? "").toString();
        savedRegion = (savedRow?.region ?? nextRegion ?? "").toString();
        savedFlagUrl = (savedRow?.flag_url ?? nextFlagUrl ?? "").toString();
        savedRegionFlagUrl = (savedRow?.region_flag_url ?? nextRegionFlagUrl ?? "").toString();
        savedAgeYears = (savedRow?.age_years == null || Number.isNaN(Number(savedRow?.age_years))) ? null : Number(savedRow.age_years);
        savedIsNas = savedAgeYears === 0;
        savedVolumeMl = (savedRow?.volume_ml == null || Number.isNaN(Number(savedRow?.volume_ml))) ? null : Number(savedRow.volume_ml);
        savedAbv = (savedRow?.abv == null || Number.isNaN(Number(savedRow?.abv))) ? null : Number(savedRow.abv);
        savedCaskType = (savedRow?.fasstyp ?? nextCaskType ?? "").toString();
        savedPriceEur = (savedRow?.price_eur == null || Number.isNaN(Number(savedRow?.price_eur))) ? null : Number(savedRow.price_eur);
        savedPricePerLiter = (savedRow?.price_per_liter_eur == null || Number.isNaN(Number(savedRow?.price_per_liter_eur))) ? null : Number(savedRow.price_per_liter_eur);
        savedBottleOutturn = (savedRow?.bottle_outturn == null || Number.isNaN(Number(savedRow?.bottle_outturn))) ? null : Number(savedRow.bottle_outturn);
        savedProvisional = !!(savedRow?.provisional ?? nextProvisional);
        savedCollector = !!(savedRow?.collector ?? nextCollector);

        const logOriginalData = {
          name: originalWhiskyName || null,
          distillery: originalDistillery || null,
          bottler: originalBottler || null,
          country: originalCountry || null,
          region: originalRegion || null,
          age_years: originalIsNas ? 0 : originalAgeYears,
          volume_ml: originalVolumeMl,
          abv: originalAbv,
          fasstyp: originalCaskType || null,
          price_eur: originalPriceEur,
          bottle_outturn: originalBottleOutturn,
          provisional: !!originalProvisional,
          collector: !!originalCollector
        };

        await saveImageToStorage();

        const logNextData = {
          name: savedWhiskyName || null,
          distillery: savedDistillery || null,
          bottler: savedBottler || null,
          country: savedCountry || null,
          region: savedRegion || null,
          age_years: savedIsNas ? 0 : savedAgeYears,
          volume_ml: savedVolumeMl,
          abv: savedAbv,
          fasstyp: savedCaskType || null,
          price_eur: savedPriceEur,
          bottle_outturn: savedBottleOutturn,
          provisional: !!savedProvisional,
          collector: !!savedCollector
        };

        const extraLogChanges = [];
        if (hadDeleteImageOnSave) extraLogChanges.push("Bild: gelöscht");
        else if (hadPendingImageFile) extraLogChanges.push("Bild: geändert");

        const logDetails = buildMasterDataLogDetails(logOriginalData, logNextData, extraLogChanges);
        if (logDetails) {
          try {
            await writeLogEntry({
              action: "update",
              itemType: "whisky",
              itemId: id,
              itemName: savedWhiskyName || nextWhiskyName || null,
              details: logDetails
            });
            await loadDetailChangelog();
          } catch (logErr) {
            console.error(logErr);
          }
        }

        originalWhiskyName = savedWhiskyName;
        originalDistillery = savedDistillery;
        originalBottler = savedBottler;
        originalCountry = savedCountry;
        originalRegion = savedRegion;
        originalFlagUrl = savedFlagUrl;
        originalRegionFlagUrl = savedRegionFlagUrl;
        originalAgeYears = savedAgeYears;
        originalIsNas = savedIsNas;
        originalVolumeMl = savedVolumeMl;
        originalAbv = savedAbv;
        originalCaskType = savedCaskType;
        originalPriceEur = savedPriceEur;
        originalProvisional = savedProvisional;
        originalCollector = savedCollector;
        originalBottleOutturn = savedBottleOutturn;
        originalImageUrl = savedImageUrl;

        if (imgEl) {
          imgEl.src = savedImageUrl || DEFAULT_IMAGE_URL;
        }

        if (editImageUploadEl) {
          editImageUploadEl.value = "";
        }
        if (imageEditHintEl) {
          imageEditHintEl.hidden = true;
          imageEditHintEl.textContent = "";
        }

        renderMasterDataView();

        if (cEl) cEl.textContent = fmtDE(savedRow?.created_at || "");
        if (uEl) uEl.textContent = fmtDE(savedRow?.updated_at || "");

        try {
          const savedCreatedBy = savedRow?.created_by || "";
          const savedUpdatedBy = savedRow?.updated_by || "";
          const userMap = await fetchUserDisplayMap([savedCreatedBy, savedUpdatedBy]);
          if (createdByEl) createdByEl.textContent = savedCreatedBy ? (userMap[savedCreatedBy] || "–") : "–";
          if (updatedByEl) updatedByEl.textContent = savedUpdatedBy ? (userMap[savedUpdatedBy] || "–") : "–";
        } catch (userErr) {
          console.error(userErr);
        }

        isMasterDataEditMode = false;
        if (masterDataEditHintEl) {
          masterDataEditHintEl.textContent = defaultMasterDataHintText;
        }
        applyMasterDataEditMode();
      } catch (err) {
        console.error(err);
        if (masterDataEditHintEl) {
          masterDataEditHintEl.hidden = false;
          masterDataEditHintEl.textContent = "Speichern fehlgeschlagen";
        }
      } finally {
        if (btnEditMasterData) btnEditMasterData.disabled = false;
        if (btnCancelMasterDataEdit) btnCancelMasterDataEdit.disabled = false;
      }
    });
  }

  if (btnCancelMasterDataEdit) {
    btnCancelMasterDataEdit.addEventListener("click", () => {
      if (editWhiskyNameEl) editWhiskyNameEl.value = originalWhiskyName || "";
      if (editDistilleryEl) editDistilleryEl.value = originalDistillery || "";
      if (editBottlerEl) editBottlerEl.value = originalBottler || "";
      if (editCountryEl) editCountryEl.value = originalCountry || "";
      if (editRegionEl) editRegionEl.value = originalRegion || "";
      filterRegionsByCountry();
      if (editFlagUrlEl) editFlagUrlEl.value = originalFlagUrl || "";
      if (editRegionFlagUrlEl) editRegionFlagUrlEl.value = originalRegionFlagUrl || "";
      syncFlagFieldsFromSelection();
      if (editAgeYearsEl) editAgeYearsEl.value = originalAgeYears == null ? "" : String(originalAgeYears);
      if (editIsNasEl) editIsNasEl.checked = !!originalIsNas;
      syncNasUi();
      if (editVolumeMlEl) editVolumeMlEl.value = originalVolumeMl == null ? "" : String(originalVolumeMl);
      if (editAbvEl) editAbvEl.value = originalAbv == null ? "" : String(originalAbv);
      if (editCaskTypeEl) editCaskTypeEl.value = originalCaskType || "";
      if (editPriceEurEl) editPriceEurEl.value = originalPriceEur == null ? "" : String(originalPriceEur);
      if (editBottleOutturnEl) editBottleOutturnEl.value = originalBottleOutturn == null ? "" : String(originalBottleOutturn);
      if (editIsIncompleteEl) editIsIncompleteEl.checked = !!originalProvisional;
      if (editIsCollectorEl) editIsCollectorEl.checked = !!originalCollector;
      if (collectorBadgeEl) {
        collectorBadgeEl.style.display = originalCollector ? "inline-flex" : "none";
      }
      if (provisionalBadgeEl) {
        provisionalBadgeEl.hidden = !originalProvisional;
        provisionalBadgeEl.style.display = originalProvisional ? "inline-block" : "none";
      }
      pendingImageFile = null;
      deleteImageOnSave = false;
      savedImageUrl = originalImageUrl;
      if (imgEl) {
        imgEl.src = savedImageUrl || DEFAULT_IMAGE_URL;
      }
      if (editImageUploadEl) {
        editImageUploadEl.value = "";
      }
      if (imageEditHintEl) {
        imageEditHintEl.hidden = true;
        imageEditHintEl.textContent = "";
      }
      isMasterDataEditMode = false;
      applyMasterDataEditMode();
    });
  }

if (btnDeleteWhisky) {
  btnDeleteWhisky.addEventListener("click", () => {
    if (!requireDeletePermission()) {
      return;
    }

    const whiskyLabel = (savedWhiskyName || originalWhiskyName || "dieser Whisky").trim();
    openDeleteWhiskyModal(whiskyLabel);
  });
}

if (btnCancelDeleteWhisky) {
  btnCancelDeleteWhisky.addEventListener("click", () => {
    closeDeleteWhiskyModal();
  });
}

if (btnConfirmDeleteWhisky) {
  btnConfirmDeleteWhisky.addEventListener("click", async () => {
    if (!requireDeletePermission()) {
      return;
    }

    const whiskyLabel = (savedWhiskyName || originalWhiskyName || "dieser Whisky").trim();
    const originalDeleteText = btnDeleteWhisky?.textContent || "Whisky löschen";
    const originalHintText = masterDataEditHintEl?.textContent || defaultMasterDataHintText;

    closeDeleteWhiskyModal();

    if (btnDeleteWhisky) btnDeleteWhisky.disabled = true;
    if (btnEditMasterData) btnEditMasterData.disabled = true;
    if (masterDataEditHintEl) {
      masterDataEditHintEl.hidden = false;
      masterDataEditHintEl.textContent = "Lösche Whisky…";
    }

    try {
      await deleteWhiskyFromDb();

      try {
        await writeLogEntry({
          action: "delete",
          itemType: "whisky",
          itemId: id,
          itemName: whiskyLabel,
          details: "Whisky gelöscht"
        });
      } catch (logErr) {
        console.error(logErr);
      }

      window.parent?.postMessage({ type: "nav", view: "whiskyList" }, "*");
    } catch (err) {
      console.error(err);
      if (masterDataEditHintEl) {
        masterDataEditHintEl.hidden = false;
        masterDataEditHintEl.textContent = "Löschen fehlgeschlagen";
      }
    } finally {
      if (btnDeleteWhisky) {
        btnDeleteWhisky.disabled = false;
        btnDeleteWhisky.textContent = originalDeleteText;
      }
      if (btnEditMasterData) btnEditMasterData.disabled = false;
      if (masterDataEditHintEl && !isMasterDataEditMode) {
        masterDataEditHintEl.hidden = true;
        masterDataEditHintEl.textContent = originalHintText;
      }
    }
  });
}

if (deleteWhiskyModalEl) {
  deleteWhiskyModalEl.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.hasAttribute("data-close-delete-modal")) {
      closeDeleteWhiskyModal();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (deleteWhiskyModalEl && !deleteWhiskyModalEl.classList.contains("hidden")) {
    closeDeleteWhiskyModal();
  }
});

  let originalMyNotes = myNotes;
  let savedMyRating = (myRating == null || Number.isNaN(myRating)) ? null : Number(myRating);
  let originalMyRating = savedMyRating;
  let currentEditMyRating = savedMyRating;
  let savedMyPli = (myPli == null || Number.isNaN(myPli)) ? null : Number(myPli);
  let originalMyPli = savedMyPli;
  let savedMyColor = myColor;
  let originalMyColor = myColor;
  let savedMyNose = myNose;
  let originalMyNose = myNose;
  let savedMyPalate = myPalate;
  let originalMyPalate = myPalate;
  let savedMyFinish = myFinish;
  let originalMyFinish = myFinish;
  let savedMySummary = mySummary;
  let originalMySummary = mySummary;
  let savedMyTrinkgelegenheit = myTrinkgelegenheit;
  let originalMyTrinkgelegenheit = myTrinkgelegenheit;
  let savedMyWishlist = !!myWishlist;
  let originalMyWishlist = !!myWishlist;
  let savedMyStock = Number.isFinite(myStockMl) ? Math.max(0, myStockMl) : 0;
  let originalMyStock = savedMyStock;
  let currentBottleVolumeMl = 0;

  const defaultMyDetailsHintText = myDetailsEditHintEl
    ? (myDetailsEditHintEl.textContent || "Bearbeitungsmodus aktiv")
    : "Bearbeitungsmodus aktiv";

  async function saveMyDetailsToDb(nextNotes, nextColor, nextNose, nextPalate, nextFinish, nextSummary, nextTrinkgelegenheit, nextWishlist, nextStock, nextRating) {
    const parentSupabase = window.parent?.supabaseClient || window.supabaseClient || null;
    const parentCurrentUser = window.parent?.currentUser || window.currentUser || null;

    if (!id) {
      throw new Error("Whisky-ID fehlt");
    }

    if (!parentCurrentUser?.id) {
      throw new Error("Kein eingeloggter Nutzer gefunden");
    }

    let accessToken = SUPABASE_ANON_KEY;

    if (parentSupabase?.auth?.getSession) {
      const { data, error } = await parentSupabase.auth.getSession();
      if (error) throw error;
      accessToken = data?.session?.access_token || accessToken;
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/gdb_whisky_user?on_conflict=whisky_id,user_id`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify({
          whisky_id: id,
          user_id: parentCurrentUser.id,
          notes: nextNotes,
          t_color: nextColor,
          t_nose: nextNose,
          t_palate: nextPalate,
          t_finish: nextFinish,
          t_summary: nextSummary,
          t_trinkgelegenheit: nextTrinkgelegenheit,
          wishlist: nextWishlist,
          stock: nextStock,
          rating: nextRating
        })
      }
    );

    if (!res.ok) {
      throw new Error(`Speichern fehlgeschlagen (HTTP ${res.status})`);
    }

    return await res.json();
  }

  function updateMyRatingView(ratingValue) {
    const val = (ratingValue == null || Number.isNaN(ratingValue)) ? null : Number(ratingValue);

    if (detailMyRatingStarsEl) {
      detailMyRatingStarsEl.innerHTML = renderStars(val);
    }

    if (detailMyRatingTextEl) {
      detailMyRatingTextEl.textContent = (val == null)
        ? "-/10"
        : `${Math.round(val)}/10`;
    }
  }

  function updateMyPliView(pliValue) {
    const val = (pliValue == null || Number.isNaN(pliValue)) ? null : Number(pliValue);

    if (detailMyPliTextEl) {
      detailMyPliTextEl.textContent = (val == null) ? "–" : val.toFixed(2);
    }

    if (detailMyPliScaleEl) {
      if (val == null || pliMin == null || pliMax == null) {
        detailMyPliScaleEl.innerHTML = `<span class="muted">–</span>`;
      } else {
        detailMyPliScaleEl.innerHTML = renderPliScaleDetail(val, pliMin, pliMax);
      }
    }
  }

  function updateAvgRatingView(avgValue, countValue) {
    const val = (avgValue == null || Number.isNaN(avgValue)) ? null : Number(avgValue);
    const cnt = Math.max(0, Number(countValue) || 0);

    if (detailAvgRatingStarsEl) {
      detailAvgRatingStarsEl.innerHTML = renderStars(val);
    }

    if (detailAvgRatingTextEl) {
      detailAvgRatingTextEl.textContent = (val == null || cnt === 0)
        ? "-/10 (0)"
        : `${Math.round(val)}/10 (${cnt})`;
    }
  }

  function updateAvgPliView(avgValue, countValue) {
    const val = (avgValue == null || Number.isNaN(avgValue)) ? null : Number(avgValue);
    const cnt = Math.max(0, Number(countValue) || 0);

    if (detailAvgPliTextEl) {
      detailAvgPliTextEl.textContent = (val == null || cnt === 0)
        ? "– (0)"
        : `${val.toFixed(2)} (${cnt})`;
    }

    if (detailPliScaleEl) {
      if (val == null || cnt === 0) {
        detailPliScaleEl.innerHTML = `<span class="muted">–</span>`;
      } else {
        detailPliScaleEl.innerHTML = renderPliScaleDetail(val, pliMin, pliMax);
      }
    }
  }

  function renderEditableRatingStars(value) {
    if (!editMyRatingStarsEl) return;

    const current = (value == null || Number.isNaN(value)) ? null : Number(value);
    editMyRatingStarsEl.innerHTML = "";

    for (let i = 1; i <= 10; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "detail-rating-star-btn";
      btn.setAttribute("aria-label", `Bewertung ${i} von 10`);
      btn.setAttribute("aria-checked", current === i ? "true" : "false");
      btn.dataset.value = String(i);
      btn.textContent = i <= (current || 0) ? "★" : "☆";
      btn.addEventListener("click", () => {
        currentEditMyRating = (currentEditMyRating === i) ? null : i;
        renderEditableRatingStars(currentEditMyRating);
      });
      editMyRatingStarsEl.appendChild(btn);
    }
  }

  function updateStockVisual(stockMl) {
    const stock = Math.max(0, Number(stockMl) || 0);
    const vol = Math.max(0, Number(currentBottleVolumeMl) || 0);
    const pct = vol > 0 ? Math.min(1, stock / vol) : 0;
    const bottleWrapEl = detailBottleWrapEl || document.getElementById("detailBottleWrap");

    if (bottleWrapEl) {
      bottleWrapEl.hidden = false;
      bottleWrapEl.style.display = "block";
      bottleWrapEl.innerHTML = renderBottleSvg(pct);

      const svgEl = bottleWrapEl.querySelector("svg");
      if (svgEl) {
        svgEl.style.display = "block";
      }
    }

    if (stockTextEl) {
      stockTextEl.textContent = vol > 0
        ? `${stock.toFixed(0)} ml (${Math.round(pct * 100)}%)`
        : `${stock.toFixed(0)} ml`;
    }
  }

  function applyMyDetailsEditMode() {
    if (wishlistEl) {
      wishlistEl.hidden = isMyDetailsEditMode;
      wishlistEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (editMyWishlistEl) {
      editMyWishlistEl.hidden = !isMyDetailsEditMode;
      editMyWishlistEl.style.display = isMyDetailsEditMode ? "inline-block" : "none";
      if (isMyDetailsEditMode) {
        editMyWishlistEl.checked = !!savedMyWishlist;
      }
    }
    if (stockTextEl) {
      stockTextEl.hidden = isMyDetailsEditMode;
      stockTextEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (editMyStockWrapEl) {
      editMyStockWrapEl.hidden = !isMyDetailsEditMode;
      editMyStockWrapEl.style.display = isMyDetailsEditMode ? "block" : "none";
    }

    if (editMyStockEl && isMyDetailsEditMode) {
      editMyStockEl.value = String(Math.max(0, Number(savedMyStock) || 0));
    }
    if (detailBottleWrapEl) {
      detailBottleWrapEl.hidden = isMyDetailsEditMode;
      detailBottleWrapEl.style.display = isMyDetailsEditMode ? "none" : "block";
    }
    if (myDetailsEditHintEl) {
      myDetailsEditHintEl.hidden = !isMyDetailsEditMode;
    }

    if (myDetailsViewModeEl) {
      myDetailsViewModeEl.dataset.editMode = isMyDetailsEditMode ? "on" : "off";
    }

    if (detailMyRatingStarsEl) {
      detailMyRatingStarsEl.hidden = isMyDetailsEditMode;
      detailMyRatingStarsEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (detailMyRatingTextEl) {
      detailMyRatingTextEl.hidden = isMyDetailsEditMode;
      detailMyRatingTextEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (detailMyPliTextEl) {
      detailMyPliTextEl.hidden = isMyDetailsEditMode;
      detailMyPliTextEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (detailMyPliScaleEl) {
      detailMyPliScaleEl.hidden = isMyDetailsEditMode;
      detailMyPliScaleEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    const pliContainer = detailMyPliTextEl?.closest(".metrics-block") || document.getElementById("detailMyPliBlock");
    if (pliContainer) {
      pliContainer.hidden = isMyDetailsEditMode;
      pliContainer.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (editMyRatingWrapEl) {
      editMyRatingWrapEl.hidden = !isMyDetailsEditMode;
      editMyRatingWrapEl.style.display = isMyDetailsEditMode ? "flex" : "none";
      if (isMyDetailsEditMode) {
        renderEditableRatingStars(currentEditMyRating);
      }
    }

    if (notesEl) {
      notesEl.hidden = isMyDetailsEditMode;
      notesEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (editMyNotesEl) {
      editMyNotesEl.hidden = !isMyDetailsEditMode;
      editMyNotesEl.style.display = isMyDetailsEditMode ? "block" : "none";
      if (isMyDetailsEditMode) {
        editMyNotesEl.value = notesEl && notesEl.textContent && notesEl.textContent !== "–"
          ? notesEl.textContent
          : myNotes;
      }
    }

    if (colorEl) {
      colorEl.hidden = isMyDetailsEditMode;
      colorEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (editMyColorEl) {
      editMyColorEl.hidden = !isMyDetailsEditMode;
      editMyColorEl.style.display = isMyDetailsEditMode ? "block" : "none";
      if (isMyDetailsEditMode) {
        editMyColorEl.value = colorEl && colorEl.textContent && colorEl.textContent !== "–"
          ? colorEl.textContent
          : myColor;
      }
    }

    if (noseEl) {
      noseEl.hidden = isMyDetailsEditMode;
      noseEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (editMyNoseEl) {
      editMyNoseEl.hidden = !isMyDetailsEditMode;
      editMyNoseEl.style.display = isMyDetailsEditMode ? "block" : "none";
      if (isMyDetailsEditMode) {
        editMyNoseEl.value = noseEl && noseEl.textContent && noseEl.textContent !== "–"
          ? noseEl.textContent
          : myNose;
      }
    }

    if (palateEl) {
      palateEl.hidden = isMyDetailsEditMode;
      palateEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (editMyPalateEl) {
      editMyPalateEl.hidden = !isMyDetailsEditMode;
      editMyPalateEl.style.display = isMyDetailsEditMode ? "block" : "none";
      if (isMyDetailsEditMode) {
        editMyPalateEl.value = palateEl && palateEl.textContent && palateEl.textContent !== "–"
          ? palateEl.textContent
          : myPalate;
      }
    }

    if (finishEl) {
      finishEl.hidden = isMyDetailsEditMode;
      finishEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (editMyFinishEl) {
      editMyFinishEl.hidden = !isMyDetailsEditMode;
      editMyFinishEl.style.display = isMyDetailsEditMode ? "block" : "none";
      if (isMyDetailsEditMode) {
        editMyFinishEl.value = finishEl && finishEl.textContent && finishEl.textContent !== "–"
          ? finishEl.textContent
          : myFinish;
      }
    }

    if (summaryEl) {
      summaryEl.hidden = isMyDetailsEditMode;
      summaryEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (editMySummaryEl) {
      editMySummaryEl.hidden = !isMyDetailsEditMode;
      editMySummaryEl.style.display = isMyDetailsEditMode ? "block" : "none";
      if (isMyDetailsEditMode) {
        editMySummaryEl.value = summaryEl && summaryEl.textContent && summaryEl.textContent !== "–"
          ? summaryEl.textContent
          : mySummary;
      }
    }

    if (trinkgelegenheitEl) {
      trinkgelegenheitEl.hidden = isMyDetailsEditMode;
      trinkgelegenheitEl.style.display = isMyDetailsEditMode ? "none" : "";
    }

    if (editMyTrinkgelegenheitEl) {
      editMyTrinkgelegenheitEl.hidden = !isMyDetailsEditMode;
      editMyTrinkgelegenheitEl.style.display = isMyDetailsEditMode ? "block" : "none";
      if (isMyDetailsEditMode) {
        editMyTrinkgelegenheitEl.value = trinkgelegenheitEl && trinkgelegenheitEl.textContent && trinkgelegenheitEl.textContent !== "–"
          ? trinkgelegenheitEl.textContent
          : myTrinkgelegenheit;
      }
    }

    if (btnEditMyDetails) {
      btnEditMyDetails.textContent = isMyDetailsEditMode
        ? "Speichern & Bearbeitung beenden"
        : "Meine Eindrücke bearbeiten";
      btnEditMyDetails.setAttribute("aria-pressed", isMyDetailsEditMode ? "true" : "false");
    }

    if (btnCancelMyDetailsEdit) {
      btnCancelMyDetailsEdit.hidden = !isMyDetailsEditMode;
    }
  }

  if (btnEditMyDetails) {
    btnEditMyDetails.addEventListener("click", async () => {
      if (!isMyDetailsEditMode) {
        originalMyNotes = notesEl && notesEl.textContent && notesEl.textContent !== "–"
          ? notesEl.textContent
          : myNotes;
        originalMyColor = colorEl && colorEl.textContent && colorEl.textContent !== "–"
          ? colorEl.textContent
          : savedMyColor;
        originalMyNose = noseEl && noseEl.textContent && noseEl.textContent !== "–"
          ? noseEl.textContent
          : savedMyNose;
        originalMyPalate = palateEl && palateEl.textContent && palateEl.textContent !== "–"
          ? palateEl.textContent
          : savedMyPalate;
        originalMyFinish = finishEl && finishEl.textContent && finishEl.textContent !== "–"
          ? finishEl.textContent
          : savedMyFinish;
        originalMySummary = summaryEl && summaryEl.textContent && summaryEl.textContent !== "–"
          ? summaryEl.textContent
          : savedMySummary;
        originalMyTrinkgelegenheit = trinkgelegenheitEl && trinkgelegenheitEl.textContent && trinkgelegenheitEl.textContent !== "–"
          ? trinkgelegenheitEl.textContent
          : savedMyTrinkgelegenheit;
        originalMyWishlist = !!savedMyWishlist;
        originalMyStock = Math.max(0, Number(savedMyStock) || 0);
        originalMyRating = savedMyRating;
        currentEditMyRating = savedMyRating;

        if (myDetailsEditHintEl) {
          myDetailsEditHintEl.textContent = defaultMyDetailsHintText;
        }

        isMyDetailsEditMode = true;
        applyMyDetailsEditMode();
        return;
      }

      if (!notesEl || !editMyNotesEl) return;

      const nextNotes = (editMyNotesEl.value || "").trim();
      const nextColor = (editMyColorEl?.value || "").trim();
      const nextNose = (editMyNoseEl?.value || "").trim();
      const nextPalate = (editMyPalateEl?.value || "").trim();
      const nextFinish = (editMyFinishEl?.value || "").trim();
      const nextSummary = (editMySummaryEl?.value || "").trim();
      const nextTrinkgelegenheit = (editMyTrinkgelegenheitEl?.value || "").trim();
      const nextWishlist = !!editMyWishlistEl?.checked;
      const nextStock = Math.max(0, Number(editMyStockEl?.value || 0));
      const nextRating = (currentEditMyRating == null || Number.isNaN(currentEditMyRating)) ? null : Number(currentEditMyRating);

      if (btnEditMyDetails) btnEditMyDetails.disabled = true;
      if (btnCancelMyDetailsEdit) btnCancelMyDetailsEdit.disabled = true;
      if (myDetailsEditHintEl) {
        myDetailsEditHintEl.hidden = false;
        myDetailsEditHintEl.textContent = "Speichere…";
      }

      try {
        const savedRows = await saveMyDetailsToDb(nextNotes, nextColor, nextNose, nextPalate, nextFinish, nextSummary, nextTrinkgelegenheit, nextWishlist, nextStock, nextRating);
        const savedRow = Array.isArray(savedRows) ? savedRows[0] : null;
        const nextPli = (savedRow && savedRow.pli != null && !Number.isNaN(Number(savedRow.pli)))
          ? Number(savedRow.pli)
          : null;

        const prevRating = savedMyRating;
        const prevPli = savedMyPli;

        notesEl.textContent = nextNotes ? nextNotes : "–";
        originalMyNotes = nextNotes;
        if (colorEl) {
          colorEl.textContent = nextColor ? nextColor : "–";
        }
        savedMyColor = nextColor;
        originalMyColor = nextColor;
        if (noseEl) {
          noseEl.textContent = nextNose ? nextNose : "–";
        }
        savedMyNose = nextNose;
        originalMyNose = nextNose;
        if (palateEl) {
          palateEl.textContent = nextPalate ? nextPalate : "–";
        }
        savedMyPalate = nextPalate;
        originalMyPalate = nextPalate;

        if (finishEl) {
          finishEl.textContent = nextFinish ? nextFinish : "–";
        }
        savedMyFinish = nextFinish;
        originalMyFinish = nextFinish;

        if (summaryEl) {
          summaryEl.textContent = nextSummary ? nextSummary : "–";
        }
        savedMySummary = nextSummary;
        originalMySummary = nextSummary;

        if (trinkgelegenheitEl) {
          trinkgelegenheitEl.textContent = nextTrinkgelegenheit ? nextTrinkgelegenheit : "–";
        }
        savedMyTrinkgelegenheit = nextTrinkgelegenheit;
        originalMyTrinkgelegenheit = nextTrinkgelegenheit;
        if (wishlistEl) {
          wishlistEl.textContent = nextWishlist ? "✔" : "–";
        }
        savedMyWishlist = nextWishlist;
        originalMyWishlist = nextWishlist;
        savedMyStock = nextStock;
        originalMyStock = nextStock;
        updateStockVisual(nextStock);
        savedMyRating = nextRating;
        originalMyRating = nextRating;
        currentEditMyRating = nextRating;
        updateMyRatingView(nextRating);
        savedMyPli = nextPli;
        originalMyPli = nextPli;
        updateMyPliView(nextPli);

        const prevRatingHadValue = !(prevRating == null || Number.isNaN(prevRating));
        const nextRatingHadValue = !(nextRating == null || Number.isNaN(nextRating));

        if (!prevRatingHadValue && nextRatingHadValue) {
          currentAvgRating = currentCntRating > 0 && currentAvgRating != null
            ? ((currentAvgRating * currentCntRating) + nextRating) / (currentCntRating + 1)
            : nextRating;
          currentCntRating += 1;
        } else if (prevRatingHadValue && !nextRatingHadValue) {
          if (currentCntRating <= 1) {
            currentAvgRating = null;
            currentCntRating = 0;
          } else {
            currentAvgRating = ((currentAvgRating * currentCntRating) - prevRating) / (currentCntRating - 1);
            currentCntRating -= 1;
          }
        } else if (prevRatingHadValue && nextRatingHadValue && currentCntRating > 0 && currentAvgRating != null) {
          currentAvgRating = ((currentAvgRating * currentCntRating) - prevRating + nextRating) / currentCntRating;
        }

        const prevPliHadValue = !(prevPli == null || Number.isNaN(prevPli));
        const nextPliHadValue = !(nextPli == null || Number.isNaN(nextPli));

        if (!prevPliHadValue && nextPliHadValue) {
          currentAvgPli = currentCntPli > 0 && currentAvgPli != null
            ? ((currentAvgPli * currentCntPli) + nextPli) / (currentCntPli + 1)
            : nextPli;
          currentCntPli += 1;
        } else if (prevPliHadValue && !nextPliHadValue) {
          if (currentCntPli <= 1) {
            currentAvgPli = null;
            currentCntPli = 0;
          } else {
            currentAvgPli = ((currentAvgPli * currentCntPli) - prevPli) / (currentCntPli - 1);
            currentCntPli -= 1;
          }
        } else if (prevPliHadValue && nextPliHadValue && currentCntPli > 0 && currentAvgPli != null) {
          currentAvgPli = ((currentAvgPli * currentCntPli) - prevPli + nextPli) / currentCntPli;
        }

        updateAvgRatingView(currentAvgRating, currentCntRating);
        updateAvgPliView(currentAvgPli, currentCntPli);

        isMyDetailsEditMode = false;

        if (myDetailsEditHintEl) {
          myDetailsEditHintEl.textContent = defaultMyDetailsHintText;
        }

        applyMyDetailsEditMode();
      } catch (err) {
        console.error(err);
        if (myDetailsEditHintEl) {
          myDetailsEditHintEl.hidden = false;
          myDetailsEditHintEl.textContent = "Speichern fehlgeschlagen";
        }
      } finally {
        if (btnEditMyDetails) btnEditMyDetails.disabled = false;
        if (btnCancelMyDetailsEdit) btnCancelMyDetailsEdit.disabled = false;
      }
    });
  }

  if (btnCancelMyDetailsEdit) {
    btnCancelMyDetailsEdit.addEventListener("click", () => {
      if (notesEl) {
        notesEl.textContent = originalMyNotes && originalMyNotes.trim()
          ? originalMyNotes
          : "–";
      }

      if (editMyNotesEl) {
        editMyNotesEl.value = originalMyNotes || "";
      }

      if (colorEl) {
        colorEl.textContent = originalMyColor && originalMyColor.trim()
          ? originalMyColor
          : "–";
      }

      if (editMyColorEl) {
        editMyColorEl.value = originalMyColor || "";
      }

      if (noseEl) {
        noseEl.textContent = originalMyNose && originalMyNose.trim()
          ? originalMyNose
          : "–";
      }

      if (editMyNoseEl) {
        editMyNoseEl.value = originalMyNose || "";
      }

      if (palateEl) {
        palateEl.textContent = originalMyPalate && originalMyPalate.trim()
          ? originalMyPalate
          : "–";
      }

      if (editMyPalateEl) {
        editMyPalateEl.value = originalMyPalate || "";
      }

      if (finishEl) {
        finishEl.textContent = originalMyFinish && originalMyFinish.trim()
          ? originalMyFinish
          : "–";
      }

      if (editMyFinishEl) {
        editMyFinishEl.value = originalMyFinish || "";
      }

      if (summaryEl) {
        summaryEl.textContent = originalMySummary && originalMySummary.trim()
          ? originalMySummary
          : "–";
      }

      if (editMySummaryEl) {
        editMySummaryEl.value = originalMySummary || "";
      }

      if (trinkgelegenheitEl) {
        trinkgelegenheitEl.textContent = originalMyTrinkgelegenheit && originalMyTrinkgelegenheit.trim()
          ? originalMyTrinkgelegenheit
          : "–";
      }

      if (editMyTrinkgelegenheitEl) {
        editMyTrinkgelegenheitEl.value = originalMyTrinkgelegenheit || "";
      }

      if (wishlistEl) {
        wishlistEl.textContent = originalMyWishlist ? "✔" : "–";
      }

      if (editMyWishlistEl) {
        editMyWishlistEl.checked = !!originalMyWishlist;
      }

      if (editMyStockEl) {
        editMyStockEl.value = String(Math.max(0, Number(originalMyStock) || 0));
      }

      updateStockVisual(originalMyStock);
      currentEditMyRating = originalMyRating;
      updateMyRatingView(originalMyRating);
      updateMyPliView(originalMyPli);

      if (myDetailsEditHintEl) {
        myDetailsEditHintEl.textContent = defaultMyDetailsHintText;
      }
      isMyDetailsEditMode = false;
      applyMyDetailsEditMode();
    });
  }

  if (btnStockMinus2cl) {
    btnStockMinus2cl.addEventListener("click", () => {
      if (!editMyStockEl) return;
      const current = Math.max(0, Number(editMyStockEl.value || 0));
      editMyStockEl.value = String(Math.max(0, current - 20));
    });
  }

  if (btnStockMinus4cl) {
    btnStockMinus4cl.addEventListener("click", () => {
      if (!editMyStockEl) return;
      const current = Math.max(0, Number(editMyStockEl.value || 0));
      editMyStockEl.value = String(Math.max(0, current - 40));
    });
  }

  applyMasterDataEditMode();
  applyMyDetailsEditMode();

  // Supabase REST (wir nutzen hier bewusst kein supabase-js import, weil diese Datei kein module ist)
  const SUPABASE_URL = "https://dffqempnuqymcofvgkxx.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZnFlbXBudXF5bWNvZnZna3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTY3NDMsImV4cCI6MjA3NTU3Mjc0M30.jHxiRy2Q2dQpvA-RuV3xcJsAy3hkDm6psYnOeNjY6pA";
  
  // Fallback-Bild-URL
  const DEFAULT_IMAGE_URL = "/img/fallback_image.jpg";

  // Fallback-Titel (falls Laden fehlschlägt)
  window.parent?.postMessage({ type: "set-title", value: "Whisky – Detailkarte" }, "*");

  if (!id || !titleEl) return;

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

  function renderPliScaleDetail(v, min, max) {
    if (v === null || v === undefined || v === "") return `<span class="muted">–</span>`;

    const val = Number(v);
    let pct = 50;

    if (min !== null && max !== null && max !== min) {
      const t = (val - min) / (max - min);
      const clamped = Math.max(0, Math.min(1, t));
      pct = clamped * 100;
    }

    return `
      <div class="pli-scale" title="PLI Skala: min/max dynamisch">
        <span class="pli-marker" style="left:${pct}%;"></span>
      </div>
    `;
  }

  function renderBottleSvg(fillPct){
    // clamp 0..1
    const p = Math.max(0, Math.min(1, Number(fillPct) || 0));

    // Wir füllen von unten nach oben: yStart hängt von p ab
    // ViewBox-Höhe = 200. Flüssigkeitsbereich: y=40..190 (150px Höhe)
    const FILL_TOP_Y = 75;     // 100% beginnt erst hier (tiefer = realistischer)
    const FILL_BOTTOM_Y = 196; // Boden innen (bei uns ist der Boden auf y=196)
    const liquidTop = FILL_TOP_Y + (1 - p) * (FILL_BOTTOM_Y - FILL_TOP_Y);

    return `
    <svg class="bottle-svg" viewBox="0 0 100 200" width="100%" height="100%" aria-label="Flaschenfüllstand">

      <defs>
        <linearGradient id="goldLiquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(212,175,55,0.55)"/>
          <stop offset="60%" stop-color="rgba(212,175,55,0.35)"/>
          <stop offset="100%" stop-color="rgba(212,175,55,0.20)"/>
        </linearGradient>

        <!-- Innenform der Flasche als Clip -->
        <clipPath id="bottleClip">
          <path d="
                M 40 8
                Q 40 4 44 4
                H 56
                Q 60 4 60 8
                V 28
                Q 60 34 54 34
                H 46
                Q 40 34 40 28
                C 40 48 38 53 36 58
                C 34 64 34 72 36 80
                C 37 86 34 92 29 97
                C 22 104 18 116 18 132
                V 170
                C 18 186 28 196 42 196
                H 58
                C 72 196 82 186 82 170
                V 132
                C 82 116 78 104 71 97
                C 66 92 63 86 64 80
                C 66 72 66 64 64 58
                C 62 53 60 48 60 42
                V 28
                Z    
                  "/>
        </clipPath>
      </defs>

      <!-- Flüssigkeit -->
      <g clip-path="url(#bottleClip)">
        <rect x="0" y="${liquidTop}" width="100" height="${FILL_BOTTOM_Y - liquidTop}" fill="url(#goldLiquid)"></rect>

        <!-- leichter Glanz -->
        <rect x="22" y="45" width="12" height="140" fill="rgba(255,255,255,0.10)"></rect>
      </g>

      <!-- Flaschen-Outline -->
      <path d="
                M 40 8
                Q 40 4 44 4
                H 56
                Q 60 4 60 8
                V 28
                Q 60 34 54 34
                H 46
                Q 40 34 40 28
                Z
              "
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"/>

      <path d="
                M 40 42
                C 40 48 38 53 36 58
                C 34 64 34 72 36 80
                C 37 86 34 92 29 97
                C 22 104 18 116 18 132
                V 170
                C 18 186 28 196 42 196
                H 58
                C 72 196 82 186 82 170
                V 132
                C 82 116 78 104 71 97
                C 66 92 63 86 64 80
                C 66 72 66 64 64 58
                C 62 53 60 48 60 42
                Z
              "
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"/>

    </svg>`;
  }

  async function loadWhiskyName() {
    try {
      const url =
        `${SUPABASE_URL}/rest/v1/gdb_whiskys` +
        `?id=eq.${encodeURIComponent(id)}` +
        `&select=name,distillery,bottler,country,region,flag_url,region_flag_url,image_url,age_years,volume_ml,abv,fasstyp,price_eur,price_per_liter_eur,bottle_outturn,provisional,collector,created_at,updated_at,created_by,updated_by`;
      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const rows            = await res.json();
      const name            = rows?.[0]?.name;
      const distillery      = rows?.[0]?.distillery;
      const bottler         = rows?.[0]?.bottler;

      const row             = rows?.[0] || {};

      const country         = row.country;
      const region          = row.region;

      const countryFlagUrl  = row.flag_url;
      const regionFlagUrl   = row.region_flag_url;

      const imageUrl        = rows?.[0]?.image_url;
      savedImageUrl         = (imageUrl ?? "").toString();
      originalImageUrl      = savedImageUrl;

      const whiskyCreatedAt = rows?.[0]?.created_at || "";
      const whiskyUpdatedAt = rows?.[0]?.updated_at || "";
      const whiskyCreatedBy = rows?.[0]?.created_by || "";
      const whiskyUpdatedBy = rows?.[0]?.updated_by || "";

      const ageYears        = rows?.[0]?.age_years;
      const volumeMl        = rows?.[0]?.volume_ml;
      const abv             = rows?.[0]?.abv;

      const fasstyp         = rows?.[0]?.fasstyp;

      const priceEur        = rows?.[0]?.price_eur;
      const pricePerLiter   = rows?.[0]?.price_per_liter_eur;
      const bottleOutturn   = rows?.[0]?.bottle_outturn;
      savedWhiskyName       = (name ?? "").toString();
      savedDistillery       = (distillery ?? "").toString();
      savedBottler          = (bottler ?? "").toString();
      savedCountry          = (country ?? "").toString();
      savedRegion           = (region ?? "").toString();
      savedFlagUrl          = (countryFlagUrl ?? "").toString();
      savedRegionFlagUrl    = (regionFlagUrl ?? "").toString();
      savedAgeYears         = (ageYears == null || Number.isNaN(Number(ageYears))) ? null : Number(ageYears);
      savedIsNas            = savedAgeYears === 0;
      savedVolumeMl         = (volumeMl == null || Number.isNaN(Number(volumeMl))) ? null : Number(volumeMl);
      savedAbv              = (abv == null || Number.isNaN(Number(abv))) ? null : Number(abv);
      savedCaskType         = (fasstyp ?? "").toString();
      savedPriceEur         = (priceEur == null || Number.isNaN(Number(priceEur))) ? null : Number(priceEur);
      savedPricePerLiter    = (pricePerLiter == null || Number.isNaN(Number(pricePerLiter))) ? null : Number(pricePerLiter);
      savedBottleOutturn    = (bottleOutturn == null || Number.isNaN(Number(bottleOutturn))) ? null : Number(bottleOutturn);
      savedProvisional      = !!row.provisional;
      savedCollector        = !!row.collector;

      originalWhiskyName    = savedWhiskyName;
      originalDistillery    = savedDistillery;
      originalBottler       = savedBottler;
      originalCountry       = savedCountry;
      originalRegion        = savedRegion;
      originalFlagUrl       = savedFlagUrl;
      originalRegionFlagUrl = savedRegionFlagUrl;
      originalAgeYears      = savedAgeYears;
      originalIsNas         = savedIsNas;
      originalVolumeMl      = savedVolumeMl;
      originalAbv           = savedAbv;
      originalCaskType      = savedCaskType;
      originalPriceEur      = savedPriceEur;
      originalBottleOutturn = savedBottleOutturn;
      originalProvisional   = savedProvisional;
      originalCollector     = savedCollector;

      // Land-Flagge
      if (countryFlagImg) {
        if (countryFlagUrl) {
          countryFlagImg.src = countryFlagUrl;
          countryFlagImg.style.display = "inline";
        } else {
          countryFlagImg.style.display = "none";
        }
      }

      // Region-Flagge
      if (regionFlagImg) {
        if (region && country) {
          regionFlagImg.src = regionFlagUrl;
          regionFlagImg.style.display = "inline";
        } else {
          regionFlagImg.style.display = "none";
        }
      }

      renderMasterDataView();

      if (cEl) cEl.textContent = fmtDE(whiskyCreatedAt);
      if (uEl) uEl.textContent = fmtDE(whiskyUpdatedAt);

      try {
        const userMap = await fetchUserDisplayMap([whiskyCreatedBy, whiskyUpdatedBy]);
        if (createdByEl) createdByEl.textContent = whiskyCreatedBy ? (userMap[whiskyCreatedBy] || "–") : "–";
        if (updatedByEl) updatedByEl.textContent = whiskyUpdatedBy ? (userMap[whiskyUpdatedBy] || "–") : "–";
      } catch (userErr) {
        console.error(userErr);
        if (createdByEl) createdByEl.textContent = whiskyCreatedBy ? whiskyCreatedBy : "–";
        if (updatedByEl) updatedByEl.textContent = whiskyUpdatedBy ? whiskyUpdatedBy : "–";
      }

      if (imgEl && imgWrapEl) {
        const src = savedImageUrl || DEFAULT_IMAGE_URL;

        imgEl.src = src;
        imgEl.alt = name ? `${name}` : "Whisky";

        // falls selbst das Fallback mal nicht lädt (theoretisch)
        imgEl.onerror = () => {
          imgEl.src = DEFAULT_IMAGE_URL;
        };

        imgWrapEl.style.display = "";
      }

      try {
        await loadDetailChangelog();
      } catch (logLoadErr) {
        console.error(logLoadErr);
        renderDetailChangelog([]);
      }

      updateAvgRatingView(currentAvgRating, currentCntRating);

      updateAvgPliView(currentAvgPli, currentCntPli);

      currentBottleVolumeMl = Number(volumeMl || 0);
      updateStockVisual(savedMyStock);

      // --- Meine Eindrücke: Bewertung (persönlich) ---
      if (detailMyRatingStarsEl) {
        detailMyRatingStarsEl.innerHTML = renderStars(myRating);
      }

      if (detailMyRatingTextEl) {
        if (myRating == null || Number.isNaN(myRating)) {
          detailMyRatingTextEl.textContent = "-/10";
        } else {
          detailMyRatingTextEl.textContent = `${Math.round(myRating)}/10`;
        }
      }

      // --- Meine Eindrücke: PLI (persönlich) ---
      updateMyPliView(savedMyPli);

    } catch (e) {
      // bewusst still: Platzhalter bleibt stehen
      if (dbg) dbg.textContent += ` | name-load-error`;
    }
  }

  if (editCountryEl) {
    editCountryEl.addEventListener("change", () => {
      filterRegionsByCountry();
      syncFlagFieldsFromSelection();
    });
  }

  if (editRegionEl) {
    editRegionEl.addEventListener("change", () => {
      syncFlagFieldsFromSelection();
    });
  }

  if (editIsNasEl) {
    editIsNasEl.addEventListener("change", () => {
      syncNasUi();
    });
  }

  if (editAgeYearsEl) {
    const clearNasForAgeInput = () => {
      if (editIsNasEl?.checked) {
        editIsNasEl.checked = false;
        syncNasUi();
      }
    };

    editAgeYearsEl.addEventListener("pointerdown", clearNasForAgeInput);
    editAgeYearsEl.addEventListener("focus", clearNasForAgeInput);

    editAgeYearsEl.addEventListener("input", () => {
      const hasValue = editAgeYearsEl.value !== "" && editAgeYearsEl.value != null;

      if (hasValue && editIsNasEl?.checked) {
        editIsNasEl.checked = false;
        syncNasUi();
      }
    });
  }

  // Live update for collector badge while editing
  if (editIsCollectorEl) {
    editIsCollectorEl.addEventListener("change", () => {
      if (collectorBadgeEl) {
        collectorBadgeEl.style.display = editIsCollectorEl.checked ? "inline-flex" : "none";
      }
    });
  }

  if (editIsIncompleteEl) {
    editIsIncompleteEl.addEventListener("change", () => {
      if (provisionalBadgeEl) {
        provisionalBadgeEl.hidden = !editIsIncompleteEl.checked;
        provisionalBadgeEl.style.display = editIsIncompleteEl.checked ? "inline-block" : "none";
      }
    });
  }

  if (editImageUploadEl) {
    editImageUploadEl.addEventListener("change", () => {
      const file = editImageUploadEl.files?.[0];

      const fileNameEl = document.getElementById("editImageFileName");

      if (!file) {
        if (fileNameEl) fileNameEl.textContent = "Keine Datei ausgewählt";
        return;
      }

      pendingImageFile = file;
      deleteImageOnSave = false;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (imgEl && e.target?.result) {
          imgEl.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);

      if (fileNameEl) {
        fileNameEl.textContent = file.name;
      }

      if (imageEditHintEl) {
        imageEditHintEl.hidden = false;
        imageEditHintEl.textContent = "Neues Bild ausgewählt (wird beim Speichern hochgeladen)";
      }
    });
  }

  if (btnDeleteImageEl) {
    btnDeleteImageEl.addEventListener("click", () => {
      pendingImageFile = null;
      deleteImageOnSave = true;
      savedImageUrl = "";

      if (imgEl) {
        imgEl.src = DEFAULT_IMAGE_URL;
      }

      if (editImageUploadEl) {
        editImageUploadEl.value = "";
      }

      const fileNameEl = document.getElementById("editImageFileName");
      if (fileNameEl) {
        fileNameEl.textContent = "Keine Datei ausgewählt";
      }

      if (imageEditHintEl) {
        imageEditHintEl.hidden = false;
        imageEditHintEl.textContent = "Bild wird beim Speichern gelöscht";
      }
    });
  }

  Promise.all([
    loadWhiskyName(),
  ]);
  
})();

function formatEuro(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
