(function () {
  function normalizeDetailsForNews(row) {
    const action = String(row?.action || "").toLowerCase();
    const details = String(row?.details || "").trim();
    const itemName = String(row?.item_name || "").trim();

    if (!details) return "";

    if (action === "delete" && details === "Whisky gelöscht") {
      return "";
    }

    if (action === "create") {
      const lines = details
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => {
          if (!/^name\s*:/i.test(line)) return true;
          const value = line.replace(/^name\s*:/i, "").trim();
          return itemName ? value !== itemName : true;
        });

      return lines.join("\n");
    }

    if (action === "update") {
      return details
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean)
        .join("\n");
    }

    if (action === "system") {
      return details;
    }
    return details;
  }


  function getDeps() {
    return window.GDB_NEWS_DEPS || {};
  }

  function getSupabaseClient() {
    return getDeps().getSupabaseClient?.() || null;
  }

  function getNewsModal() {
    return getDeps().getNewsModal?.() || null;
  }

  function getNewsList() {
    return getDeps().getNewsList?.() || null;
  }

  function getNewsOkBtn() {
    return getDeps().getNewsOkBtn?.() || null;
  }

  function escapeHtml(value) {
    const helper = getDeps().escapeHtml;
    if (typeof helper === "function") return helper(value);
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function openNewsModal() {
    const modal = getNewsModal();
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeNewsModal() {
    const modal = getNewsModal();
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  function fmtTs(ts) {
    try {
      return new Date(ts).toLocaleString("de-DE", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    } catch {
      return ts || "";
    }
  }

  function getActionLabel(row) {
    const action = String(row?.action || "").toLowerCase();
    const itemType = String(row?.item_type || "").toLowerCase();
    const itemName = String(row?.item_name || "").trim();

    if (action === "create" && itemType === "whisky") {
      return `Neuer Whisky angelegt${itemName ? `: ${itemName}` : ""}`;
    }
    if (action === "update" && itemType === "whisky") {
      return `Whisky bearbeitet${itemName ? `: ${itemName}` : ""}`;
    }
    if (action === "delete" && itemType === "whisky") {
      return `Whisky gelöscht${itemName ? `: ${itemName}` : ""}`;
    }
    if (action === "system" || itemType === "system") {
      return itemName || "Systemmeldung";
    }
    return `${action.toUpperCase()}${itemType ? ` – ${itemType}` : ""}${itemName ? `: ${itemName}` : ""}`;
  }

  function shouldShowNewsRow(row) {
    const action = String(row?.action || "").toLowerCase();
    const itemType = String(row?.item_type || "").toLowerCase();

    if (action === "login") return false;
    if (["create", "update", "delete"].includes(action)) return true;
    if (action === "system" || itemType === "system") return true;
    return false;
  }

  function renderNewsItems(rows) {
    const newsList = getNewsList();
    if (!newsList) return;

    const visibleRows = Array.isArray(rows) ? rows.filter(shouldShowNewsRow) : [];

    if (!visibleRows.length) {
      newsList.innerHTML = `<div class="news-item"><div class="meta">Keine neuen Änderungen seit deinem letzten Login.</div></div>`;
      return;
    }

    newsList.innerHTML = visibleRows.map((row) => {
      const isSystemRow = String(row?.action || "").toLowerCase() === "system"
        || String(row?.item_type || "").toLowerCase() === "system";
      const who = escapeHtml(row.username || (isSystemRow ? "System" : "Unbekannt"));
      const when = escapeHtml(fmtTs(row.timestamp));
      const title = escapeHtml(getActionLabel(row));
      const details = normalizeDetailsForNews(row);
      const detailsHtml = details
        ? `<div class="meta">${escapeHtml(details).replace(/\n/g, "<br>")}</div>`
        : "";

      return `
        <div class="news-item">
          <div class="meta">${when} · ${who}</div>
          <div class="title">${title}</div>
          ${detailsHtml}
        </div>
      `;
    }).join("");
  }

  async function showNewsSince(previousLoginTs, user) {
    if (!previousLoginTs) return;

    const newsList = getNewsList();
    const supabaseClient = getSupabaseClient();
    if (!newsList || !supabaseClient) return;

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

    renderNewsItems(data || []);
    openNewsModal();
  }

  function bindNewsModalEvents() {
    const newsOkBtn = getNewsOkBtn();
    const newsModal = getNewsModal();

    newsOkBtn?.addEventListener("click", closeNewsModal);
    newsModal?.addEventListener("click", (e) => {
      if (e.target === newsModal) closeNewsModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNewsModal();
    });
  }

  window.GdbNews = {
    openNewsModal,
    closeNewsModal,
    fmtTs,
    showNewsSince,
    renderNewsItems,
    shouldShowNewsRow,
    getActionLabel,
    bindNewsModalEvents
  };

  bindNewsModalEvents();
})();