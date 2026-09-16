import { getResource } from "../js/api.js";
import { icon } from "./icons.js";

const darkModeScript = document.createElement("script");
darkModeScript.src = "../js/dark-mode.js";
document.head.appendChild(darkModeScript);

const $ = (selector) => document.querySelector(selector);
const listData = (payload) => Array.isArray(payload) ? payload : payload.results || [];
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
const mediaUrl = (value) => value || "";

function initPageNavigation() {
  const header = $(".page-header");
  if (!header) return;
  const menu = document.createElement("button");
  menu.className = "page-menu-toggle";
  menu.type = "button";
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-controls", "page-navigation");
  menu.setAttribute("aria-label", "Ouvrir le menu");
  menu.innerHTML = "<span></span><span></span><span></span>";
  const backdrop = document.createElement("button");
  backdrop.className = "page-nav-backdrop";
  backdrop.type = "button";
  backdrop.setAttribute("aria-label", "Fermer le menu");
  const nav = document.createElement("nav");
  nav.className = "page-nav";
  nav.id = "page-navigation";
  nav.setAttribute("aria-label", "Navigation principale");
  nav.innerHTML = '<a href="../index.html#about">À propos</a><a href="../index.html#mission">Vision & mission</a><a href="projects.html">Projets</a><a href="events.html">Événements</a><a href="blog.html">Actualités</a><a href="../index.html#contact">Contact</a>';
  header.append(menu, backdrop, nav);
  const close = () => { nav.classList.remove("is-open"); backdrop.classList.remove("is-open"); menu.setAttribute("aria-expanded", "false"); document.body.classList.remove("page-menu-open"); };
  menu.addEventListener("click", () => { const open = menu.getAttribute("aria-expanded") === "true"; if (open) close(); else { menu.setAttribute("aria-expanded", "true"); nav.classList.add("is-open"); backdrop.classList.add("is-open"); document.body.classList.add("page-menu-open"); } });
  backdrop.addEventListener("click", close);
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
}

function renderCards(view, items) {
  const target = $("[data-resource-list]");
  if (!items.length) { target.innerHTML = '<p class="empty-page">Aucun contenu publié pour le moment.</p>'; return; }
  target.innerHTML = items.map((item) => {
     if (view === "projects") return `<a class="resource-card" href="project-detail.html?slug=${encodeURIComponent(item.slug)}"><div class="resource-media" style="background-image:url('${mediaUrl(item.photo)}')"><span>${icon("image", escapeHtml(item.status))}</span></div><div class="resource-body"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><div class="resource-meta">${icon("pin", escapeHtml(item.location || "Projet social"))}</div></div></a>`;
     if (view === "events") return `<article class="resource-card"><div class="resource-media" style="background-image:url('${mediaUrl(item.image)}')"><span>${icon("calendar", escapeHtml(item.icon || "Événement"))}</span></div><div class="resource-body"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><div class="resource-meta">${icon("calendar", new Date(item.event_date).toLocaleString("fr-FR", { dateStyle:"medium", timeStyle:"short" }))} · ${icon("pin", escapeHtml(item.location || ""))}</div></div></article>`;
    const media = item.media_type === "VIDEO" ? `<video class="detail-video" controls preload="metadata"><source src="${mediaUrl(item.video_url)}"></video>` : `<div class="resource-media" style="background-image:url('${mediaUrl(item.image)}')"><span>IMAGE</span></div>`;
    return `<a class="resource-card" href="blog-detail.html?slug=${encodeURIComponent(item.slug)}">${media}<div class="resource-body"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt)}</p><div class="resource-meta">${icon("arrow", "Voir plus")}</div></div></a>`;
  }).join("");
}

async function loadList() {
  const view = document.body.dataset.page;
  const response = await getResource(`/${view}/`);
  renderCards(view, listData(response));
}

async function loadDetail() {
  const view = document.body.dataset.page;
  const slug = new URLSearchParams(location.search).get("slug");
  const response = await getResource(`/${view}/`);
  const item = listData(response).find((entry) => entry.slug === slug);
  const target = $("[data-detail]");
  if (!item) { target.innerHTML = '<p class="empty-page">Ce contenu est introuvable.</p>'; return; }
  if (view === "projects") target.innerHTML = `<p class="resource-meta">${icon("image", escapeHtml(item.status))} · ${icon("pin", escapeHtml(item.location || ""))}</p><h1>${escapeHtml(item.title)}</h1><div class="detail-media" style="background-image:url('${mediaUrl(item.photo)}')"></div><div class="detail-copy"><p>${escapeHtml(item.description)}</p></div>`;
  else { const media = item.media_type === "VIDEO" ? `<video class="detail-video" controls><source src="${mediaUrl(item.video_url)}"></video>` : `<div class="detail-media" style="background-image:url('${mediaUrl(item.image)}')"></div>`; target.innerHTML = `<p class="resource-meta">${icon("calendar", item.published_at ? new Date(item.published_at).toLocaleDateString("fr-FR") : "")}</p><h1>${escapeHtml(item.title)}</h1>${media}<div class="detail-copy"><p>${escapeHtml(item.content)}</p></div>`; }
}

initPageNavigation();
(document.body.dataset.detail ? loadDetail() : loadList()).catch(() => { $("[data-resource-list], [data-detail]").innerHTML = '<p class="empty-page">Le contenu est momentanément indisponible.</p>'; });
