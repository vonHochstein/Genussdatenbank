(function () {
  const SUPABASE_URL = "https://dffqempnuqymcofvgkxx.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZnFlbXBudXF5bWNvZnZna3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTY3NDMsImV4cCI6MjA3NTU3Mjc0M30.jHxiRy2Q2dQpvA-RuV3xcJsAy3hkDm6psYnOeNjY6pA";
  const DEFAULT_IMAGE_URL = "../../img/fallback_image.jpg";
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

  const originalRegionOptions = Array.from(document.getElementById('editRegion')?.options || []).map(opt => ({value: opt.value, text: opt.textContent || ''}));
  const imgEl = document.getElementById('whiskyImage');
  const editWhiskyNameEl = document.getElementById('editWhiskyName');
  const editDistilleryEl = document.getElementById('editDistillery');
  const editBottlerEl = document.getElementById('editBottler');
  const editCountryEl = document.getElementById('editCountry');
  const editRegionEl = document.getElementById('editRegion');
  const editFlagUrlEl = document.getElementById('editFlagUrl');
  const editRegionFlagUrlEl = document.getElementById('editRegionFlagUrl');
  const editCountryFlagPreviewEl = document.getElementById('editCountryFlagPreview');
  const editRegionFlagPreviewEl = document.getElementById('editRegionFlagPreview');
  const editAgeYearsEl = document.getElementById('editAgeYears');
  const editIsNasEl = document.getElementById('editIsNas');
  const editVolumeMlEl = document.getElementById('editVolumeMl');
  const editAbvEl = document.getElementById('editAbv');
  const editCaskTypeEl = document.getElementById('editCaskType');
  const editPriceEurEl = document.getElementById('editPriceEur');
  const editBottleOutturnEl = document.getElementById('editBottleOutturn');
  const editIsCollectorEl = document.getElementById('editIsCollector');
  const editIsIncompleteEl = document.getElementById('editIsIncomplete');
  const editImageUploadEl = document.getElementById('editImageUpload');
  const btnDeleteImageEl = document.getElementById('btnDeleteImage');
  const imageEditHintEl = document.getElementById('imageEditHint');
  const fileNameEl = document.getElementById('editImageFileName');
  const collectorBadgeEl = document.getElementById('whiskyCollectorBadge');
  const provisionalBadgeEl = document.getElementById('whiskyProvisionalBadge');
  const hintEl = document.getElementById('masterDataEditHint');
  const btnSave = document.getElementById('btnSaveMasterData');
  const btnCancel = document.getElementById('btnCancelMasterDataEdit');

  let pendingImageFile = null;
  let deleteImageOnSave = false;

  function resolveCurrentUser() {
    return window.parent?.currentUser || window.currentUser || null;
  }

  function requireCreatePermission() {
    return window.parent?.GdbPermissions?.requirePermission?.('whisky', 'create') ?? true;
  }

  function getCountryFlagUrl(countryValue) {
    const key = (countryValue ?? '').toString().trim();
    return key && COUNTRY_FLAG_MAP[key] ? `${FLAG_BASE_URL}${COUNTRY_FLAG_MAP[key]}` : '';
  }

  function getRegionFlagUrl(regionValue) {
    const key = (regionValue ?? '').toString().trim();
    return key && REGION_FLAG_MAP[key] ? `${FLAG_BASE_URL}${REGION_FLAG_MAP[key]}` : '';
  }

  function syncNasUi() {
    const isNas = !!editIsNasEl?.checked;
    if (!editAgeYearsEl) return;
    editAgeYearsEl.readOnly = isNas;
    editAgeYearsEl.setAttribute('aria-readonly', isNas ? 'true' : 'false');
    if (isNas) editAgeYearsEl.value = '';
  }

  function filterRegionsByCountry() {
    if (!editCountryEl || !editRegionEl) return;
    const selectedCountry = (editCountryEl.value || '').trim();
    const allowedRegions = REGION_BY_COUNTRY[selectedCountry] || [];
    const currentRegion = (editRegionEl.value || '').trim();

    editRegionEl.innerHTML = '';

    if (!selectedCountry) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Region wählen …';
      editRegionEl.appendChild(opt);
      editRegionEl.disabled = true;
      return;
    }

    if (!allowedRegions.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Keine Regionen verfügbar';
      editRegionEl.appendChild(opt);
      editRegionEl.disabled = true;
      return;
    }

    originalRegionOptions.forEach((optData) => {
      if (!optData.value) {
        const opt = document.createElement('option');
        opt.value = optData.value;
        opt.textContent = optData.text;
        editRegionEl.appendChild(opt);
        return;
      }
      if (!allowedRegions.includes(optData.value)) return;
      const opt = document.createElement('option');
      opt.value = optData.value;
      opt.textContent = optData.text;
      editRegionEl.appendChild(opt);
    });

    editRegionEl.disabled = false;
    editRegionEl.value = allowedRegions.includes(currentRegion) ? currentRegion : '';
  }

  function syncFlagFieldsFromSelection() {
    const countryValue = (editCountryEl?.value || '').trim();
    const regionValue = (editRegionEl?.value || '').trim();
    const nextFlagUrl = getCountryFlagUrl(countryValue);
    const nextRegionFlagUrl = getRegionFlagUrl(regionValue);

    if (editFlagUrlEl) editFlagUrlEl.value = nextFlagUrl;
    if (editRegionFlagUrlEl) editRegionFlagUrlEl.value = nextRegionFlagUrl;

    if (editCountryFlagPreviewEl) {
      if (nextFlagUrl) {
        editCountryFlagPreviewEl.src = nextFlagUrl;
        editCountryFlagPreviewEl.style.display = 'inline-block';
      } else {
        editCountryFlagPreviewEl.style.display = 'none';
      }
    }

    if (editRegionFlagPreviewEl) {
      if (nextRegionFlagUrl) {
        editRegionFlagPreviewEl.src = nextRegionFlagUrl;
        editRegionFlagPreviewEl.style.display = 'inline-block';
      } else {
        editRegionFlagPreviewEl.style.display = 'none';
      }
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

  function getLogDisplayName(user) {
    return user?.display_name || user?.username || null;
  }

  async function writeLogEntry({ action, itemType, itemId, itemName, details }) {
    const currentUser = resolveCurrentUser();
    const accessToken = await getAccessToken();
    const payload = {
      user_id: currentUser?.id || null,
      username: getLogDisplayName(currentUser),
      action: action || null,
      item_type: itemType || null,
      item_id: itemId || null,
      item_name: itemName || null,
      details: details || null
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/gdb_log`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Logeintrag fehlgeschlagen (HTTP ${res.status})`);
    }
  }

  function buildCreateLogDetails(payload) {
    const lines = [];
    const addLine = (label, value) => {
      const normalized = value == null || value === '' ? null : String(value).trim();
      if (!normalized) return;
      lines.push(`${label}: ${normalized}`);
    };

    addLine('Name', payload?.name);
    addLine('Brennerei', payload?.distillery);
    addLine('Abfüller', payload?.bottler);
    addLine('Land', payload?.country);
    addLine('Region', payload?.region);
    addLine('Alter', payload?.age_years === 0 ? 'NAS' : payload?.age_years);
    addLine('Volumen', payload?.volume_ml);
    addLine('Vol.-%', payload?.abv);
    addLine('Fasstyp', payload?.fasstyp);
    addLine('Preis (EUR)', payload?.price_eur);
    addLine('Flaschenanzahl', payload?.bottle_outturn);
    addLine('Sammler', payload?.collector ? 'Ja' : 'Nein');
    addLine('Unvollständig', payload?.provisional ? 'Ja' : 'Nein');

    return lines.join('\n') || 'Whisky angelegt';
  }

  async function saveImageToStorage(newId) {
    const parentSupabase = window.parent?.supabaseClient || window.parent?.supabase || window.supabaseClient || window.supabase || null;
    if (!parentSupabase?.storage?.from || !pendingImageFile) return '';

    const ext = (pendingImageFile.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const filePath = `whisky_${newId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await parentSupabase.storage
      .from('whiskys')
      .upload(filePath, pendingImageFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: pendingImageFile.type || undefined
      });

    if (uploadError) throw uploadError;
    const { data: publicUrlData } = parentSupabase.storage.from('whiskys').getPublicUrl(filePath);
    return publicUrlData?.publicUrl || '';
  }

  async function patchImageUrl(newId, imageUrl) {
    const accessToken = await getAccessToken();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/gdb_whiskys?id=eq.${encodeURIComponent(newId)}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ image_url: imageUrl || null })
    });
    if (!res.ok) throw new Error(`Bild speichern fehlgeschlagen (HTTP ${res.status})`);
  }

  function setHint(text = '', kind = 'muted') {
    if (!hintEl) return;
    hintEl.hidden = !text;
    hintEl.textContent = text;
    hintEl.className = `detail-edit-hint ${kind}`.trim();
  }

  function goBackToWhiskyList() {
    window.parent?.postMessage({ type: 'nav', view: 'whiskyList' }, '*');
  }

  function buildPayload() {
    const currentUser = resolveCurrentUser();
    const isNas = !!editIsNasEl?.checked;
    const country = (editCountryEl?.value || '').trim() || null;
    const region = (editRegionEl?.value || '').trim() || null;

    return {
      id: crypto.randomUUID(),
      name: (editWhiskyNameEl?.value || '').trim() || null,
      distillery: (editDistilleryEl?.value || '').trim() || null,
      bottler: (editBottlerEl?.value || '').trim() || null,
      country,
      region,
      flag_url: getCountryFlagUrl(country),
      region_flag_url: getRegionFlagUrl(region),
      age_years: isNas ? 0 : ((editAgeYearsEl?.value === '' || editAgeYearsEl?.value == null) ? null : Math.max(1, Number(editAgeYearsEl.value))),
      volume_ml: (editVolumeMlEl?.value === '' || editVolumeMlEl?.value == null) ? null : Math.max(0, Number(editVolumeMlEl.value)),
      abv: (editAbvEl?.value === '' || editAbvEl?.value == null) ? null : Math.max(0, Number(editAbvEl.value)),
      fasstyp: (editCaskTypeEl?.value || '').trim() || null,
      price_eur: (editPriceEurEl?.value === '' || editPriceEurEl?.value == null) ? null : Math.max(0, Number(editPriceEurEl.value)),
      bottle_outturn: (editBottleOutturnEl?.value === '' || editBottleOutturnEl?.value == null) ? null : Math.max(0, Number(editBottleOutturnEl.value)),
      provisional: !!editIsIncompleteEl?.checked,
      collector: !!editIsCollectorEl?.checked,
      created_by: currentUser?.id || null,
      updated_by: currentUser?.id || null
    };
  }

  async function saveWhisky() {
    if (!requireCreatePermission()) {
      return;
    }
    const payload = buildPayload();
    if (!payload.name) {
      setHint('Bitte zuerst einen Whiskyname eingeben', 'err');
      return;
    }

    btnSave.disabled = true;
    btnCancel.disabled = true;
    setHint('Speichere…');

    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`${SUPABASE_URL}/rest/v1/gdb_whiskys`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const newId = data?.[0]?.id;
      if (!newId) throw new Error('Keine ID zurückgegeben');

      if (pendingImageFile && !deleteImageOnSave) {
        const publicUrl = await saveImageToStorage(newId);
        if (publicUrl) await patchImageUrl(newId, publicUrl);
      }

      await writeLogEntry({
        action: 'create',
        itemType: 'whisky',
        itemId: newId,
        itemName: payload.name || data?.[0]?.name || 'Unbekannter Whisky',
        details: buildCreateLogDetails(payload)
      });

      window.location.href = `gdb_whisky_detail.html?id=${encodeURIComponent(newId)}&t=${Date.now()}`;
    } catch (err) {
      console.error(err);
      setHint('Speichern fehlgeschlagen', 'err');
    } finally {
      btnSave.disabled = false;
      btnCancel.disabled = false;
    }
  }

  function init() {
    document.title = 'Whisky – Neuer Eintrag';
    window.parent?.postMessage({ type: 'set-title', value: 'Whisky – Neuer Eintrag' }, '*');
    if (!requireCreatePermission()) {
      btnSave.disabled = true;
      setHint('Keine Berechtigung zum Anlegen neuer Whisky-Einträge.', 'err');
    }
    if (imgEl) {
      imgEl.src = DEFAULT_IMAGE_URL;
      imgEl.onerror = () => { imgEl.src = DEFAULT_IMAGE_URL; };
    }
    filterRegionsByCountry();
    syncFlagFieldsFromSelection();
    syncNasUi();

    if (editIsIncompleteEl) {
      editIsIncompleteEl.checked = true;
    }
    if (provisionalBadgeEl && editIsIncompleteEl) {
      provisionalBadgeEl.hidden = !editIsIncompleteEl.checked;
      provisionalBadgeEl.style.display = editIsIncompleteEl.checked ? 'inline-block' : 'none';
    }

    setHint('* Pflichtfeld');

    editCountryEl?.addEventListener('change', () => {
      filterRegionsByCountry();
      syncFlagFieldsFromSelection();
    });
    editRegionEl?.addEventListener('change', syncFlagFieldsFromSelection);
    editIsNasEl?.addEventListener('change', syncNasUi);
    editAgeYearsEl?.addEventListener('focus', () => {
      if (editIsNasEl?.checked) {
        editIsNasEl.checked = false;
        syncNasUi();
      }
    });
    editAgeYearsEl?.addEventListener('input', () => {
      if (editAgeYearsEl.value !== '' && editIsNasEl?.checked) {
        editIsNasEl.checked = false;
        syncNasUi();
      }
    });
    editIsCollectorEl?.addEventListener('change', () => {
      if (collectorBadgeEl) collectorBadgeEl.style.display = editIsCollectorEl.checked ? 'inline-flex' : 'none';
    });
    editIsIncompleteEl?.addEventListener('change', () => {
      if (!provisionalBadgeEl) return;
      provisionalBadgeEl.hidden = !editIsIncompleteEl.checked;
      provisionalBadgeEl.style.display = editIsIncompleteEl.checked ? 'inline-block' : 'none';
    });
    editImageUploadEl?.addEventListener('change', () => {
      const file = editImageUploadEl.files?.[0];
      if (!file) {
        if (fileNameEl) fileNameEl.textContent = 'Keine Datei ausgewählt';
        return;
      }
      pendingImageFile = file;
      deleteImageOnSave = false;
      if (fileNameEl) fileNameEl.textContent = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (imgEl && e.target?.result) imgEl.src = e.target.result;
      };
      reader.readAsDataURL(file);
      if (imageEditHintEl) {
        imageEditHintEl.hidden = false;
        imageEditHintEl.textContent = 'Neues Bild ausgewählt (wird beim Speichern hochgeladen)';
      }
    });
    btnDeleteImageEl?.addEventListener('click', () => {
      pendingImageFile = null;
      deleteImageOnSave = true;
      if (imgEl) imgEl.src = DEFAULT_IMAGE_URL;
      if (editImageUploadEl) editImageUploadEl.value = '';
      if (fileNameEl) fileNameEl.textContent = 'Keine Datei ausgewählt';
      if (imageEditHintEl) {
        imageEditHintEl.hidden = false;
        imageEditHintEl.textContent = 'Bild wird nicht übernommen';
      }
    });
    btnCancel?.addEventListener('click', goBackToWhiskyList);
    btnSave?.addEventListener('click', saveWhisky);
  }

  init();
})();
