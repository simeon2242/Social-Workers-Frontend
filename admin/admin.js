const API_URL = window.SWF_API_BASE_URL || "http://127.0.0.1:8000/api";
const TOKEN_KEY = "swf_admin_tokens";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[char]));

const valueLabels = {
  status: { PLANNED: "Planifié", IN_PROGRESS: "En cours", COMPLETED: "Terminé", SUSPENDED: "Suspendu" },
  media_type: { IMAGE: "Image", VIDEO: "Vidéo" },
  kind: { VISION: "Vision", MISSION: "Mission" },
};
const jsonDefaults = { useful_links: [], social_links: {} }; 
const labelFor = (name, value) => valueLabels[name]?.[value] || value;

const resources = {
  landing: { label: "Landing page", singleton: true, endpoint: "/landing/", title: "title", columns: [["title", "Titre"], ["primary_button_label", "Bouton principal"], ["is_active", "Actif"]], fields: [
    ["title", "Titre principal", "text"], ["description", "Petite description", "textarea"], ["image", "Photo du landing", "file"], ["primary_button_label", "Texte du bouton principal", "text"], ["primary_button_url", "Lien du bouton principal", "text"], ["secondary_button_label", "Texte du second bouton", "text"], ["secondary_button_url", "Lien du second bouton", "text"], ["is_active", "Actif", "checkbox"],
  ] },
  about: { label: "Qui sommes-nous ?", singleton: true, endpoint: "/about/", title: "title", columns: [["title", "Titre"], ["conclusion", "Phrase de conclusion"], ["is_active", "Actif"]], fields: [
    ["title", "Titre", "text"], ["description", "Description", "textarea"], ["image", "Image", "file"], ["conclusion", "Phrase de conclusion", "textarea"], ["is_active", "Actif", "checkbox"],
  ] },
  "vision-missions": { label: "Vision & mission", endpoint: "/vision-missions/", title: "title", columns: [["kind", "Type"], ["title", "Titre"], ["display_order", "Ordre"], ["is_active", "Actif"]], fields: [
    ["kind", "Type", "select", true, ["VISION", "MISSION"]], ["title", "Titre", "text"], ["description", "Explication", "textarea"], ["icon", "Icône", "text"], ["display_order", "Ordre d’affichage", "number"], ["is_active", "Actif", "checkbox"],
  ] },
  "core-values": { label: "Valeurs fondamentales", endpoint: "/core-values/", title: "title", columns: [["title", "Titre"], ["icon", "Icône"], ["display_order", "Ordre"], ["is_active", "Actif"]], fields: [
    ["icon", "Icône", "text"], ["title", "Titre", "text"], ["description", "Explication", "textarea"], ["display_order", "Ordre d’affichage", "number"], ["is_active", "Actif", "checkbox"],
  ] },
  "site-settings": { label: "Configuration du site", singleton: true, endpoint: "/site-settings/", title: "organization_name", columns: [["organization_name", "Organisation"], ["email", "Email"], ["phone", "Téléphone"], ["updated_at", "Modifié le"]], fields: [
    ["organization_name", "Nom de l’organisation", "text"], ["description", "Description", "textarea"], ["email", "Email", "email"], ["phone", "Téléphone", "text"], ["address", "Adresse", "text"], ["whatsapp_url", "Lien WhatsApp", "url"], ["facebook_url", "Lien Facebook", "url"], ["instagram_url", "Lien Instagram", "url"], ["linkedin_url", "Lien LinkedIn", "url"],
  ] },
  "contact-information": { label: "Informations de contact", singleton: true, endpoint: "/contact-information/", title: "email", columns: [["email", "Email"], ["phone", "Téléphone"], ["address", "Adresse"]], fields: [
    ["address", "Adresse", "text"], ["email", "Email", "email"], ["phone", "Téléphone", "text"], ["whatsapp_url", "Lien WhatsApp", "url"], ["facebook_url", "Lien Facebook", "url"], ["instagram_url", "Lien Instagram", "url"], ["linkedin_url", "Lien LinkedIn", "url"],
  ] },
  footer: { label: "Footer", singleton: true, endpoint: "/footer/", title: "copyright_text", columns: [["copyright_text", "Copyright"], ["description", "Description"]], fields: [
    ["description", "Description", "textarea"], ["copyright_text", "Copyright", "text"], ["useful_links", "Liens utiles (JSON)", "json"],
  ] },
  projects: { label: "Projets", endpoint: "/projects/", title: "title", columns: [["title", "Titre"], ["status", "Statut"], ["location", "Lieu"], ["is_published", "Publié"]], fields: [
    ["title", "Titre", "text"], ["slug", "Slug", "text"], ["description", "Description", "textarea"], ["photo", "Photo", "file"], ["location", "Localisation", "text"], ["status", "Statut", "select", false, ["PLANNED", "IN_PROGRESS", "COMPLETED", "SUSPENDED"]], ["start_date", "Date de début", "date"], ["end_date", "Date de fin", "date"], ["display_order", "Ordre d’affichage", "number"], ["is_featured", "Mis en avant", "checkbox"], ["is_published", "Publié", "checkbox"],
  ] },
  events: { label: "Événements", endpoint: "/events/", title: "title", columns: [["title", "Titre"], ["event_date", "Date"], ["location", "Lieu"], ["is_published", "Publié"]], fields: [
    ["title", "Titre", "text"], ["slug", "Slug", "text"], ["icon", "Icône", "text"], ["event_date", "Date", "datetime-local"], ["description", "Description", "textarea"], ["image", "Image", "file"], ["location", "Lieu", "text"], ["display_order", "Ordre d’affichage", "number"], ["is_published", "Publié", "checkbox"],
  ] },
  team: { label: "Équipe", endpoint: "/team/", title: "full_name", columns: [["full_name", "Nom"], ["position", "Fonction"], ["email", "Email"], ["is_active", "Actif"]], fields: [
    ["full_name", "Nom complet", "text"], ["position", "Fonction", "text"], ["description", "Description", "textarea"], ["photo", "Photo", "file"], ["email", "Email", "email"], ["phone", "Téléphone", "text"], ["social_links", "Réseaux sociaux (JSON)", "json"], ["is_active", "Actif", "checkbox"],
  ] },
  blog: { label: "Actualités", endpoint: "/blog/", title: "title", columns: [["title", "Titre"], ["media_type", "Média"], ["is_published", "Publié"], ["published_at", "Publication"]], fields: [
    ["title", "Titre", "text"], ["slug", "Slug", "text"], ["excerpt", "Résumé", "textarea"], ["content", "Contenu", "textarea"], ["media_type", "Type de média", "select", false, ["IMAGE", "VIDEO"]], ["image", "Image", "file"], ["video_url", "URL vidéo", "url"], ["published_at", "Date de publication", "datetime-local"], ["is_published", "Publié", "checkbox"],
  ] },
  gallery: { label: "Galerie", endpoint: "/gallery/", title: "title", columns: [["title", "Titre"], ["captured_at", "Date"], ["is_active", "Actif"]], fields: [
    ["title", "Titre", "text"], ["description", "Description", "textarea"], ["photo", "Photo", "file"], ["event", "Événement lié", "event-select"], ["captured_at", "Date", "date"], ["is_active", "Actif", "checkbox"],
  ] },
  messages: { label: "Messages", endpoint: "/contact/messages/", title: "full_name", columns: [["full_name", "Nom"], ["email", "Email"], ["message", "Message"], ["is_read", "Lu"], ["created_at", "Reçu le"]], fields: [] },
};

function getTokens() { return JSON.parse(localStorage.getItem(TOKEN_KEY) || "null"); }
function logout() { localStorage.removeItem(TOKEN_KEY); location.reload(); }
function toast(message, error = false) { const element = $("[data-toast]"); element.textContent = message; element.className = `toast visible ${error ? "error" : ""}`; setTimeout(() => element.classList.remove("visible"), 3000); }

async function request(path, options = {}) {
  const currentTokens = getTokens();
  const isMultipart = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...(isMultipart ? {} : { "Content-Type": "application/json" }), ...(currentTokens?.access ? { Authorization: `Bearer ${currentTokens.access}` } : {}), ...(options.headers || {}) },
  });
  if (response.status === 401) { logout(); throw new Error("Session expirée"); }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || Object.values(body).flat().join(" ") || "Une erreur est survenue");
  return body;
}

function displayValue(value, key) {
  if (typeof value === "boolean") return `<span class="status-pill ${value ? "is-on" : "is-off"}">${value ? "Oui" : "Non"}</span>`;
  if (!value) return "<span class=muted>—</span>";
  if (valueLabels[key]?.[value]) return escapeHtml(valueLabels[key][value]);
  if (key.includes("date")) return new Date(value).toLocaleDateString("fr-FR");
  return escapeHtml(String(value).slice(0, 80));
}

function formatDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function renderResource(view, data) {
  const config = resources[view];
  const panel = $(`[data-view-panel="${view}"]`);
  const rows = data.map((item) => {
    const actions = view === "messages"
      ? `<button data-toggle-read="${item.id}" data-read-current="${item.is_read ? "1" : "0"}" data-resource="${view}" aria-label="${item.is_read ? "Marquer comme non lu" : "Marquer comme lu"}" title="${item.is_read ? "Marquer non lu" : "Marquer lu"}">✓</button><button data-delete="${item.id}" data-resource="${view}" aria-label="Supprimer">×</button>`
      : `<button data-edit="${item.id}" data-resource="${view}" aria-label="Modifier">✎</button><button data-delete="${item.id}" data-resource="${view}" aria-label="Supprimer">×</button>`;
    return `<tr><td><strong>${escapeHtml(item[config.title] || "Sans titre")}</strong></td>${config.columns.slice(1).map(([key]) => `<td>${displayValue(item[key], key)}</td>`).join("")}<td class="row-actions">${actions}</td></tr>`;
  }).join("");
  const canCreate = view !== "messages" && !(config.singleton && data.length >= 1);
  panel.innerHTML = `<div class="resource-head"><div><p class="overline">Gestion de contenu</p><h1>${config.label}</h1><p class="muted">${data.length} élément${data.length > 1 ? "s" : ""} enregistré${data.length > 1 ? "s" : ""}</p></div>${canCreate ? `<button class="primary-button" data-new="${view}">+ Ajouter</button>` : ""}</div><div class="panel table-panel"><div class="table-toolbar"><input type="search" placeholder="Rechercher..." data-filter="${view}"><span class="muted">Mise à jour en temps réel</span></div><div class="table-scroll"><table><thead><tr>${config.columns.map(([, label]) => `<th>${label}</th>`).join("")}<th></th></tr></thead><tbody>${rows || `<tr><td colspan="${config.columns.length + 1}" class="empty-state">Aucun contenu pour le moment.</td></tr>`}</tbody></table></div></div>`;
}

async function loadResource(view) {
  const response = await request(resources[view].endpoint);
  renderResource(view, Array.isArray(response) ? response : response.results || []);
}

function fieldMarkup(field, item) {
  const [name, label, type, required, options = []] = field;
  if (type === "json") {
    const raw = typeof item[name] === "string" ? item[name] : JSON.stringify(item[name] ?? jsonDefaults[name] ?? null, null, 2);
    return `<label class="wide">${label}<textarea name="${name}" rows="4">${escapeHtml(raw)}</textarea></label>`;
  }
  if (type === "event-select") return `<label>${label}<select name="${name}" data-event-select><option value="">Aucun</option></select></label>`;
  const value = name === "useful_links" && typeof item[name] !== "string" ? JSON.stringify(item[name] || [], null, 2) : item[name] || "";
  if (type === "textarea") return `<label class="wide">${label}<textarea name="${name}" rows="4" ${required ? "required" : ""}>${escapeHtml(value)}</textarea></label>`;
  if (type === "select") return `<label>${label}<select name="${name}">${options.map((option) => `<option value="${option}" ${item[name] === option ? "selected" : ""}>${escapeHtml(labelFor(name, option))}</option>`).join("")}</select></label>`;
  if (type === "checkbox") return `<label class="check-label"><input name="${name}" type="checkbox" ${item[name] ? "checked" : ""}>${label}</label>`;
  if (type === "file") return `<label>${label}<input name="${name}" type="file" accept="image/jpeg,image/png,image/webp" ${required && !item[name] ? "required" : ""}></label>`;
  if (type === "datetime-local") return `<label>${label}<input name="${name}" type="datetime-local" step="900" value="${formatDateTimeLocal(item[name])}" ${required ? "required" : ""}><small class="field-help">Sélectionnez la date, puis l’heure de début.</small></label>`;
  return `<label>${label}<input name="${name}" type="${type}" value="${escapeHtml(value)}" ${required ? "required" : ""}></label>`;
}

function formMarkup(view, item = {}) {
  const config = resources[view];
  const itemId = item.id || "";
  return `<div class="modal-backdrop" data-modal><form class="modal-card" data-resource-form data-resource="${view}" data-id="${itemId}"><button type="button" class="modal-close" data-close-modal>×</button><p class="overline">${item.id ? "Modifier" : "Nouveau"} contenu</p><h2>${item.id ? "Modifier" : "Créer"} ${config.label.toLowerCase().replace(/s$/, "")}</h2><div class="form-grid">${config.fields.map((field) => fieldMarkup(field, item)).join("")}</div><p class="form-error" data-modal-error></p><button class="primary-button" type="submit">Enregistrer <span>↗</span></button></form></div>`;
}

async function hydrateDynamicFields(form, item) {
  const eventSelect = form.querySelector("[data-event-select]");
  if (!eventSelect) return;
  try {
    const events = await request("/events/");
    const list = Array.isArray(events) ? events : events.results || [];
    eventSelect.insertAdjacentHTML("beforeend", list.map((event) => `<option value="${event.id}">${escapeHtml(event.title)}</option>`).join(""));
    eventSelect.value = item.event || "";
  } catch {
    eventSelect.value = "";
  }
}

async function openEditor(view, id = null) {
  const item = id ? await request(`${resources[view].endpoint}${id}/`) : {};
  document.body.insertAdjacentHTML("beforeend", formMarkup(view, item));
  await hydrateDynamicFields($("[data-resource-form]"), item);
}

async function saveForm(form) {
  const view = form.dataset.resource;
  const id = form.dataset.id;
  const payload = {};
  const formData = new FormData(form);
  resources[view].fields.forEach(([name, , type]) => {
    payload[name] = type === "checkbox" ? formData.has(name) : formData.get(name) || "";
  });
  resources[view].fields.forEach(([name, , type]) => {
    if (type === "datetime-local" && payload[name]) {
      const date = new Date(payload[name]);
      if (!Number.isNaN(date.getTime())) payload[name] = date.toISOString();
    }
  });
  resources[view].fields.forEach(([name, , type]) => {
    if (type !== "json") return;
    const raw = payload[name];
    if (!raw) {
      payload[name] = jsonDefaults[name];
      return;
    }
    try {
      payload[name] = JSON.parse(raw);
    } catch {
      throw new Error(`Le champ « ${name} » doit être un JSON valide.`);
    }
  });
  if (payload.event === "") delete payload.event;
  Object.entries(payload).forEach(([name, value]) => {
    if (value === "" || value === undefined || value === null) delete payload[name];
  });
  const hasFile = resources[view].fields.some(([, , type]) => type === "file");
  let body = JSON.stringify(payload);
  if (hasFile) {
    body = new FormData();
    resources[view].fields.forEach(([name, , type]) => {
      const value = formData.get(name);
      if (type === "file") {
        if (value?.size) body.append(name, value);
      } else if (name in payload) {
        body.append(name, typeof payload[name] === "object" ? JSON.stringify(payload[name]) : payload[name]);
      }
    });
  }
  const headers = hasFile ? {} : { "Content-Type": "application/json" };
  await request(`${resources[view].endpoint}${id ? `${id}/` : ""}`, { method: id ? "PATCH" : "POST", headers, body });
  $("[data-modal]").remove();
  toast("Contenu enregistré");
  await loadResource(view);
}

function switchView(view) {
  $$(".view").forEach((panel) => panel.classList.toggle("active", panel.dataset.viewPanel === view));
  $$('[data-view]').forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  $("[data-page-title]").textContent = resources[view]?.label || "Vue générale";
  if (resources[view]) loadResource(view).catch((error) => toast(error.message, true));
}

async function loadOverview() {
  const names = Object.keys(resources);
  const results = await Promise.allSettled(names.map((view) => request(resources[view].endpoint)));
  const counts = results.map((result) => result.status === "fulfilled" ? (Array.isArray(result.value) ? result.value.length : result.value.results?.length || 0) : 0);
  const countFor = (viewName) => counts[names.indexOf(viewName)] || 0;
  $("[data-stats]").innerHTML = [{ label: "Projets actifs", value: countFor("projects"), tone: "lime" }, { label: "Événements", value: countFor("events"), tone: "coral" }, { label: "Membres de l’équipe", value: countFor("team"), tone: "cream" }, { label: "Messages reçus", value: countFor("messages"), tone: "ink" }].map((stat) => `<div class="stat-card ${stat.tone}"><span>${stat.label}</span><strong>${stat.value}</strong><small>Voir le détail ↗</small></div>`).join("");
  $("[data-message-count]").textContent = countFor("messages");
  $("[data-recent-activity]").innerHTML = names.slice(0, 5).map((view, index) => `<div class="activity-row"><span class="activity-icon">${index + 1}</span><div><strong>${resources[view].label}</strong><p>${counts[index]} élément${counts[index] > 1 ? "s" : ""} disponible${counts[index] > 1 ? "s" : ""}</p></div><span>↗</span></div>`).join("");
}

function bindLogin() {
  $("[data-login-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Identifiants invalides");
      localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
      location.reload();
    } catch (error) { $("[data-login-error]").textContent = error.message; }
  });
}

function bindApp() {
  $("[data-login-screen]").hidden = true;
  $("[data-app]").hidden = false;
  loadOverview().catch((error) => toast(error.message, true));
  $$('[data-view]').forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  $$('[data-quick-view]').forEach((button) => button.addEventListener("click", () => switchView(button.dataset.quickView)));
  $("[data-logout]").addEventListener("click", logout);
  $("[data-menu-toggle]").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
  document.addEventListener("click", async (event) => {
    const newButton = event.target.closest("[data-new]");
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");
    const readButton = event.target.closest("[data-toggle-read]");
    if (newButton) await openEditor(newButton.dataset.new);
    if (editButton) await openEditor(editButton.dataset.resource, editButton.dataset.edit);
    if (deleteButton && confirm("Supprimer définitivement cet élément ?")) {
      await request(`${resources[deleteButton.dataset.resource].endpoint}${deleteButton.dataset.delete}/`, { method: "DELETE" });
      toast("Élément supprimé");
      await loadResource(deleteButton.dataset.resource);
    }
    if (readButton) {
      const isRead = readButton.dataset.readCurrent === "1";
      await request(`${resources[readButton.dataset.resource].endpoint}${readButton.dataset.toggleRead}/`, { method: "PATCH", body: JSON.stringify({ is_read: !isRead }) });
      toast(isRead ? "Message marqué non lu" : "Message marqué lu");
      await loadResource(readButton.dataset.resource);
    }
    if (event.target.closest("[data-close-modal]")) $("[data-modal]").remove();
  });
  document.addEventListener("input", (event) => {
    const filter = event.target.closest("[data-filter]");
    if (!filter) return;
    const term = filter.value.toLowerCase();
    const rows = $$(`[data-view-panel="${filter.dataset.filter}"] tbody tr`);
    rows.forEach((row) => row.hidden = Boolean(term) && !row.textContent.toLowerCase().includes(term));
  });
  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-resource-form]");
    if (!form) return;
    event.preventDefault();
    saveForm(form).catch((error) => { $("[data-modal-error]").textContent = error.message; });
  });
}

if (getTokens()?.access) bindApp(); else bindLogin();
