import { getResource, sendContactMessage } from "./api.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const mediaUrl = (value) => value || "";
const listData = (payload) => Array.isArray(payload) ? payload : payload.results || [];
const intro = $("[data-brand-intro]");
const introShownKey = "swf-brand-intro-shown";
const introAlreadyShown = localStorage.getItem(introShownKey) === "true";
let introClosed = introAlreadyShown;

if (!introAlreadyShown) localStorage.setItem(introShownKey, "true");

function closeBrandIntro() {
  if (!intro || introClosed) return;
  introClosed = true;
  intro.classList.add("is-closing");
  window.setTimeout(() => { intro.hidden = true; }, 400);
}

if (introAlreadyShown && intro) intro.hidden = true;
if (!introAlreadyShown) window.setTimeout(closeBrandIntro, 2000);

function setText(selector, value) {
  $$(selector).forEach((element) => { element.textContent = value || ""; });
}

function renderSingle(selector, payload, fields) {
  const item = Array.isArray(payload) ? payload[0] : payload;
  if (!item) return;
  Object.entries(fields).forEach(([selectorKey, field]) => setText(`${selector} ${selectorKey}`, item[field]));
}

function renderLanding(data) {
  renderSingle("", data, { "[data-landing-title]": "title", "[data-landing-description]": "description" });
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return;
  const primary = $("[data-primary-button]");
  const secondary = $("[data-secondary-button]");
  primary.textContent = `${item.primary_button_label || ""} ↗`;
  primary.href = item.primary_button_url || "#projects";
  secondary.hidden = !item.secondary_button_label;
  secondary.textContent = `${item.secondary_button_label || ""} →`;
  secondary.href = item.secondary_button_url || "#contact";
  if (item.image) $(".hero").style.setProperty("--hero-image", `url('${mediaUrl(item.image)}')`);
}

function renderPrinciples(data) {
  $("[data-vision-missions]").innerHTML = listData(data).map((item, index) => `<article class="principle-card reveal" style="--card-index:${index}"><span class="card-index">0${index + 1}</span><span class="principle-type">${escapeHtml(item.kind)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join("");
}

function renderValues(data) {
  $("[data-core-values]").innerHTML = listData(data).map((item, index) => `<article class="value-item reveal" style="--card-index:${index}"><span class="value-icon">${escapeHtml(item.icon || "+")}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></article>`).join("");
}

function renderTeam(data) {
  $("[data-team]").innerHTML = listData(data).slice(0, 4).map((item, index) => `<article class="team-card reveal" style="--card-index:${index}"><div class="team-photo">${item.photo ? `<img src="${mediaUrl(item.photo)}" alt="Photo de ${escapeHtml(item.full_name)}">` : `<span class="team-avatar-fallback" aria-label="Avatar par défaut">${escapeHtml(item.full_name.slice(0, 2).toUpperCase())}</span>`}</div><div class="team-meta"><h3>${escapeHtml(item.full_name)}</h3><strong>${escapeHtml(item.position)}</strong><p>${escapeHtml(item.description || "")}</p></div></article>`).join("");
}

function renderProjects(data) {
  $("[data-projects]").innerHTML = listData(data).slice(0, 3).map((item, index) => `<a class="project-card reveal" style="--card-index:${index}" href="pages/project-detail.html?slug=${encodeURIComponent(item.slug)}"><div class="project-image" style="--project-image:url('${mediaUrl(item.photo)}')"><span>${escapeHtml(item.status)}</span></div><div class="project-meta"><h3>${escapeHtml(item.title)}</h3><span>${escapeHtml(item.location || "")}</span></div></a>`).join("");
}

function renderEvents(data) {
  $("[data-events]").innerHTML = listData(data).slice(0, 3).map((item) => `<article class="event-row"><time datetime="${escapeHtml(item.event_date)}">${new Date(item.event_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</time><div><span class="event-icon">${escapeHtml(item.icon || "◷")}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.location || item.description)}</p></div><span class="event-arrow" aria-hidden="true">↗</span></article>`).join("");
}

function renderBlog(data) {
  $("[data-blog]").innerHTML = listData(data).slice(0, 3).map((item, index) => { const media = item.media_type === "VIDEO" ? `<div class="journal-media journal-video"><video controls preload="metadata"><source src="${mediaUrl(item.video_url)}"></video><span>VIDEO</span></div>` : `<div class="journal-media" style="--journal-image:url('${mediaUrl(item.image)}')"><span>IMAGE</span></div>`; return `<a class="journal-card reveal" style="--card-index:${index}" href="pages/blog-detail.html?slug=${encodeURIComponent(item.slug)}">${media}<div class="journal-meta"><time>${item.published_at ? new Date(item.published_at).toLocaleDateString("fr-FR") : ""}</time><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt)}</p><span class="text-link">Voir plus →</span></div></a>`; }).join("");
}

function renderGallery(data) {
  $("[data-gallery]").innerHTML = listData(data).slice(0, 6).map((item, index) => `<a class="gallery-item reveal" style="--gallery-image:url('${mediaUrl(item.photo)}');--card-index:${index}" href="${mediaUrl(item.photo)}" target="_blank" rel="noreferrer"><div class="gallery-image"><span>${String(index + 1).padStart(2, "0")}</span></div><div class="gallery-caption"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description || "")}</p></div></a>`).join("");
}

function renderSiteSettings(data) {
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return;
  setText("[data-site-name]", item.organization_name);
  setText("[data-intro-name]", item.organization_name);
  const introLogo = $("[data-intro-logo]");
  const introFallback = $("[data-intro-logo-fallback]");
  if (introLogo && item.logo) {
    introLogo.src = item.logo;
    introLogo.hidden = false;
    introFallback.hidden = true;
  }
  const logo = $("[data-site-logo]");
  const logoFallback = $("[data-site-logo-fallback]");
  if (logo && item.logo) {
    logo.src = item.logo;
    logo.hidden = false;
    logoFallback.hidden = true;
  }
  setText("[data-footer-description]", item.description);
  $("[data-footer-email]").textContent = item.email || "";
  $("[data-footer-email]").href = item.email ? `mailto:${item.email}` : "#";
  $("[data-footer-phone]").textContent = item.phone || "";
  $("[data-footer-phone]").href = item.phone ? `tel:${item.phone}` : "#";
}

function renderContactInformation(data) {
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return;
  const address = $("[data-contact-address]");
  const email = $("[data-contact-email]");
  const phone = $("[data-contact-phone]");
  address.textContent = item.address || "";
  email.textContent = item.email || "";
  email.href = item.email ? `mailto:${item.email}` : "#";
  phone.textContent = item.phone || "";
  phone.href = item.phone ? `tel:${item.phone}` : "#";
}

function renderFooter(data) {
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return;
  setText("[data-footer-description]", item.description);
  setText("[data-copyright]", item.copyright_text);
  const links = Array.isArray(item.useful_links) ? item.useful_links : [];
  $("[data-footer-useful-links]").innerHTML = links.map((link) => `<a href="${escapeHtml(link.url || "#")}">${escapeHtml(link.label || "Lien")}</a>`).join(" ");
}

async function loadHome() {
  const requests = await Promise.allSettled([getResource("/site-settings/"), getResource("/landing/"), getResource("/about/"), getResource("/vision-missions/"), getResource("/core-values/"), getResource("/team/"), getResource("/projects/?is_featured=true"), getResource("/events/"), getResource("/blog/"), getResource("/gallery/"), getResource("/contact-information/"), getResource("/footer/")]);
  const values = requests.map((request) => request.status === "fulfilled" ? request.value : null);
  renderSiteSettings(values[0]); renderLanding(values[1]); renderSingle("", values[2], { "[data-about-title]": "title", "[data-about-description]": "description", "[data-about-conclusion]": "conclusion" });
  if (values[3]) renderPrinciples(values[3]); if (values[4]) renderValues(values[4]); if (values[5]) renderTeam(values[5]); if (values[6]) renderProjects(values[6]); if (values[7]) renderEvents(values[7]); if (values[8]) renderBlog(values[8]); if (values[9]) renderGallery(values[9]); if (values[10]) renderContactInformation(values[10]); if (values[11]) renderFooter(values[11]);
  $$(".reveal").forEach((element) => element.classList.add("is-visible"));
}

function initInteractions() {
  const menuButton = $(".menu-toggle"); const nav = $(".main-nav"); const backdrop = $("[data-nav-backdrop]");
  const closeMenu = () => { nav.classList.remove("is-open"); menuButton.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open"); };
  const toggleMenu = () => { const open = menuButton.getAttribute("aria-expanded") === "true"; if (open) closeMenu(); else { menuButton.setAttribute("aria-expanded", "true"); nav.classList.add("is-open"); document.body.classList.add("menu-open"); } };
  menuButton.addEventListener("click", toggleMenu);
  backdrop.addEventListener("click", closeMenu);
  $$(".main-nav a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
  $("[data-contact-form]").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const status = $("[data-form-status]"); const button = form.querySelector("button"); button.disabled = true; status.textContent = "Envoi en cours..."; try { await sendContactMessage(Object.fromEntries(new FormData(form))); form.reset(); status.textContent = "Votre message a bien été envoyé."; } catch (error) { status.textContent = error.message; } finally { button.disabled = false; } });
}

initInteractions();
loadHome().catch(() => { $("[data-form-status]").textContent = "Le contenu est momentanément indisponible."; });