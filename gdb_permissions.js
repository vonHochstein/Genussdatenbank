

(function () {
  let currentPermissions = [];
  let permissionModalReady = false;

  function getDeps() {
    return window.GDB_PERMISSION_DEPS || {};
  }

  function getSupabaseClient() {
    return getDeps().getSupabaseClient?.() || null;
  }

  function getCurrentUser() {
    return getDeps().getCurrentUser?.() || null;
  }

  function getSetMsg() {
    return getDeps().setMsg || null;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function uniqueSorted(list) {
    return Array.from(new Set((Array.isArray(list) ? list : []).map(normalize).filter(Boolean))).sort();
  }

  function toReadablePermission(perm) {
    const key = normalize(perm);
    if (key === "read") return "Lesen";
    if (key === "create") return "Anlegen";
    if (key === "update") return "Bearbeiten";
    if (key === "delete") return "Löschen";
    if (key === "manage") return "Verwalten";
    return perm || "–";
  }

  function toReadableScope(scope) {
    const key = normalize(scope);
    if (key === "whisky") return "Whisky";
    if (key === "wine") return "Wein";
    if (key === "cigar") return "Zigarren";
    if (key === "system") return "System";
    if (key === "users") return "Nutzer";
    return scope || "–";
  }

  async function loadCurrentUserPermissions(userId) {
    const supabaseClient = getSupabaseClient();
    const currentUser = getCurrentUser();
    const effectiveUserId = userId || currentUser?.id || null;

    if (!supabaseClient || !effectiveUserId) {
      currentPermissions = [];
      return currentPermissions;
    }

    const { data, error } = await supabaseClient
      .from("gdb_user_permissions")
      .select("scope, perm")
      .eq("user_id", effectiveUserId);

    if (error) {
      console.error("Permissions konnten nicht geladen werden:", error);
      currentPermissions = [];
      throw error;
    }

    currentPermissions = Array.isArray(data) ? data.map((row) => ({
      scope: normalize(row.scope),
      perm: normalize(row.perm)
    })) : [];

    return currentPermissions;
  }

  function getCurrentPermissions() {
    return Array.isArray(currentPermissions) ? [...currentPermissions] : [];
  }

  function getPermissionsForScope(scope) {
    const normalizedScope = normalize(scope);
    return getCurrentPermissions()
      .filter((entry) => entry.scope === normalizedScope)
      .map((entry) => entry.perm);
  }

  function hasPermission(scope, perm) {
    const normalizedScope = normalize(scope);
    const normalizedPerm = normalize(perm);
    return getCurrentPermissions().some((entry) => {
      return entry.scope === normalizedScope && entry.perm === normalizedPerm;
    });
  }

  function hasAnyPermission(scope, perms) {
    const requested = Array.isArray(perms) ? perms : [perms];
    return requested.some((perm) => hasPermission(scope, perm));
  }

  function getReadablePermissions(scope) {
    return uniqueSorted(getPermissionsForScope(scope)).map(toReadablePermission);
  }

  function buildPermissionDeniedMessage(scope, perm) {
    const readableScope = toReadableScope(scope);
    const readablePerm = toReadablePermission(perm);
    const rights = getReadablePermissions(scope);

    if (!rights.length) {
      return `Keine Berechtigung für diese Aktion.\n\nDir sind aktuell keine Rechte im Bereich ${readableScope} zugewiesen.`;
    }

    return `Keine Berechtigung für diese Aktion (${readablePerm}).\n\nDeine Rechte im Bereich ${readableScope}:\n${rights.join("\n")}`;
  }

function getAllKnownPermissionsForScope(scope) {
const normalizedScope = normalize(scope);
if (normalizedScope === "whisky") {
    return ["read", "create", "update", "delete"];
}
return uniqueSorted(getPermissionsForScope(scope));
}

function ensurePermissionModal() {
if (permissionModalReady) return;
permissionModalReady = true;

if (!document.getElementById("gdbPermissionModalStyles")) {
    const style = document.createElement("style");
    style.id = "gdbPermissionModalStyles";
    style.textContent = `
    .gdb-perm-modal.hidden{display:none !important;}
    .gdb-perm-modal{position:fixed;inset:0;z-index:12000;display:grid;place-items:center;padding:24px;}
    .gdb-perm-modal__backdrop{position:absolute;inset:0;background:rgba(0,0,0,.68);}
    .gdb-perm-modal__card{position:relative;z-index:1;width:min(100%,560px);background:#1f1f1f;border:1px solid #353535;border-radius:18px;padding:22px;color:#f2efe8;box-shadow:0 24px 80px rgba(0,0,0,.45);}
    .gdb-perm-modal__title{margin:0 0 10px 0;font-size:24px;line-height:1.2;}
    .gdb-perm-modal__lead{margin:0 0 16px 0;color:#d6c7ac;}
    .gdb-perm-modal__scope{margin:0 0 14px 0;font-size:13px;color:#b7ae9a;text-transform:uppercase;letter-spacing:.08em;}
    .gdb-perm-modal__grid{display:grid;gap:10px;margin:0 0 18px 0;}
    .gdb-perm-modal__row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;border:1px solid #353535;border-radius:12px;background:#181818;}
    .gdb-perm-modal__label{font-weight:600;}
    .gdb-perm-modal__state{font-weight:700;font-size:14px;}
    .gdb-perm-modal__state.is-yes{color:#b8efc6;}
    .gdb-perm-modal__state.is-no{color:#ffcccc;}
    .gdb-perm-modal__hint{margin:0 0 18px 0;color:#b7ae9a;font-size:14px;}
    .gdb-perm-modal__actions{display:flex;justify-content:flex-end;gap:10px;}
    .gdb-perm-modal__btn{padding:10px 14px;border-radius:10px;border:1px solid #353535;background:transparent;color:#f2efe8;cursor:pointer;font-weight:600;}
    .gdb-perm-modal__btn:hover{border-color:#8a6a31;color:#f6e7c7;background:rgba(138,106,49,.08);}
    `;
    document.head.appendChild(style);
}

if (!document.getElementById("gdbPermissionModal")) {
    const modal = document.createElement("div");
    modal.id = "gdbPermissionModal";
    modal.className = "gdb-perm-modal hidden";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
    <div class="gdb-perm-modal__backdrop" data-gdb-perm-close></div>
    <div class="gdb-perm-modal__card" role="dialog" aria-modal="true" aria-labelledby="gdbPermModalTitle">
        <div class="gdb-perm-modal__scope" id="gdbPermModalScope">Berechtigungen</div>
        <h3 class="gdb-perm-modal__title" id="gdbPermModalTitle">Keine Berechtigung</h3>
        <p class="gdb-perm-modal__lead" id="gdbPermModalLead">Für diese Aktion fehlen dir die erforderlichen Rechte.</p>
        <div class="gdb-perm-modal__grid" id="gdbPermModalGrid"></div>
        <p class="gdb-perm-modal__hint" id="gdbPermModalHint"></p>
        <div class="gdb-perm-modal__actions">
        <button type="button" class="gdb-perm-modal__btn" id="gdbPermModalOkBtn">Verstanden</button>
        </div>
    </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener("click", (event) => {
    if (event.target?.hasAttribute?.("data-gdb-perm-close")) {
        closePermissionModal();
    }
    });

    modal.querySelector("#gdbPermModalOkBtn")?.addEventListener("click", closePermissionModal);

    document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePermissionModal();
    });
}
}

function closePermissionModal() {
const modal = document.getElementById("gdbPermissionModal");
if (!modal) return;
modal.classList.add("hidden");
modal.setAttribute("aria-hidden", "true");
}

function openPermissionModal(scope, perm) {
ensurePermissionModal();

const modal = document.getElementById("gdbPermissionModal");
const scopeEl = document.getElementById("gdbPermModalScope");
const titleEl = document.getElementById("gdbPermModalTitle");
const leadEl = document.getElementById("gdbPermModalLead");
const gridEl = document.getElementById("gdbPermModalGrid");
const hintEl = document.getElementById("gdbPermModalHint");
if (!modal || !scopeEl || !titleEl || !leadEl || !gridEl || !hintEl) return;

const readableScope = toReadableScope(scope);
const readablePerm = toReadablePermission(perm);
const knownPerms = getAllKnownPermissionsForScope(scope);

scopeEl.textContent = `Bereich: ${readableScope}`;
titleEl.textContent = `Keine Berechtigung für ${readablePerm}`;
leadEl.textContent = `Du kannst diese Aktion aktuell nicht ausführen. Deine vorhandenen Rechte in diesem Bereich sind:`;

gridEl.innerHTML = knownPerms.map((knownPerm) => {
    const allowed = hasPermission(scope, knownPerm);
    const stateClass = allowed ? "is-yes" : "is-no";
    const symbol = allowed ? "✓" : "✕";
    const stateText = allowed ? "erlaubt" : "nicht erlaubt";
    return `
    <div class="gdb-perm-modal__row">
        <div class="gdb-perm-modal__label">${toReadablePermission(knownPerm)}</div>
        <div class="gdb-perm-modal__state ${stateClass}">${symbol} ${stateText}</div>
    </div>
    `;
}).join("");

hintEl.textContent = `Benötigt für diese Aktion: ${readablePerm}`;

modal.classList.remove("hidden");
modal.setAttribute("aria-hidden", "false");
}

function showPermissionDenied(scope, perm) {
  openPermissionModal(scope, perm);
  return false;
}

  function requirePermission(scope, perm) {
    if (hasPermission(scope, perm)) return true;
    return showPermissionDenied(scope, perm);
  }

  window.GdbPermissions = {
    loadCurrentUserPermissions,
    getCurrentPermissions,
    getPermissionsForScope,
    getReadablePermissions,
    hasPermission,
    hasAnyPermission,
    buildPermissionDeniedMessage,
    closePermissionModal,
    openPermissionModal,
    showPermissionDenied,
    requirePermission,
    toReadablePermission,
    toReadableScope
  };
})();