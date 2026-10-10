const $ = (id) => document.getElementById(id);
const toast = (message) => {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2300);
};
const safeId = (value) => /^\d{5,25}$/.test(value.trim());
const readStore = (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const writeStore = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { toast("Penyimpanan browser tidak tersedia."); } };
async function copyText(value) {
  try { await navigator.clipboard.writeText(value); toast("Berhasil disalin."); }
  catch { const t = document.createElement("textarea"); t.value = value; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); toast("Berhasil disalin."); }
}
$("menuToggle").addEventListener("click", () => $("nav").classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
  document.querySelectorAll(".nav-link").forEach(x => x.classList.remove("active")); link.classList.add("active"); $("nav").classList.remove("open");
}));

let audioUrl = null;
$("audioFile").addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0]; if (!file) return;
  if (!file.type.startsWith("audio/")) { toast("Pilih file audio yang valid."); return; }
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = URL.createObjectURL(file);
  $("audioName").textContent = file.name;
  $("audioSize").textContent = (file.size / 1024 / 1024).toFixed(2) + " MB · hanya di perangkat";
  $("audioInfo").classList.remove("hidden"); $("audioPlayer").src = audioUrl; $("audioPlayer").classList.remove("hidden");
  toast("Audio siap diputar secara lokal.");
});
$("clearAudio").addEventListener("click", () => {
  $("audioPlayer").pause(); $("audioPlayer").removeAttribute("src"); $("audioPlayer").classList.add("hidden");
  $("audioInfo").classList.add("hidden"); $("audioFile").value = "";
  if (audioUrl) URL.revokeObjectURL(audioUrl); audioUrl = null;
});
function renderList(key, targetId, kind) {
  const target = $(targetId); target.innerHTML = ""; const items = readStore(key);
  if (!items.length) { target.innerHTML = '<p class="micro-note">Belum ada item tersimpan.</p>'; return; }
  items.forEach((item, index) => {
    const row = document.createElement("div"); row.className = "saved-item";
    const text = document.createElement("div"); text.className = "saved-text";
    const title = document.createElement("b"); title.textContent = item.label;
    const sub = document.createElement("small"); sub.textContent = "ID: " + item.id;
    text.append(title, sub);
    const copy = document.createElement("button"); copy.textContent = "Salin ID"; copy.addEventListener("click", () => copyText(item.id));
    const remove = document.createElement("button"); remove.textContent = "Hapus"; remove.addEventListener("click", () => {
      const next = readStore(key); next.splice(index, 1); writeStore(key, next); renderList(key, targetId, kind); toast("Item dihapus.");
    });
    row.append(text, copy, remove);
    if (kind === "decal") {
      const open = document.createElement("button"); open.textContent = "Buka"; open.addEventListener("click", () => window.open("https://www.roblox.com/library/" + encodeURIComponent(item.id), "_blank", "noopener")); row.append(open);
    }
    target.append(row);
  });
}
$("audioForm").addEventListener("submit", (event) => {
  event.preventDefault(); const label = $("audioLabel").value.trim(), id = $("audioId").value.trim();
  if (!safeId(id)) { toast("Masukkan ID angka yang valid (5–25 digit)."); return; }
  const items = readStore("umrtzy_audio"); items.unshift({label,id}); writeStore("umrtzy_audio", items);
  $("audioForm").reset(); renderList("umrtzy_audio","audioList","audio"); toast("Audio ID tersimpan di browser.");
});
$("decalForm").addEventListener("submit", (event) => {
  event.preventDefault(); const label = $("decalLabel").value.trim(), id = $("decalId").value.trim();
  if (!safeId(id)) { toast("Masukkan ID angka yang valid (5–25 digit)."); return; }
  const items = readStore("umrtzy_decals"); items.unshift({label,id}); writeStore("umrtzy_decals", items);
  $("decalForm").reset(); renderList("umrtzy_decals","decalList","decal"); toast("Decal tersimpan di browser.");
});
renderList("umrtzy_audio","audioList","audio"); renderList("umrtzy_decals","decalList","decal");

document.querySelectorAll(".sky-card").forEach(card => card.addEventListener("click", () => {
  document.querySelectorAll(".sky-card").forEach(x => x.classList.remove("selected")); card.classList.add("selected");
  $("skyTitle").textContent = card.dataset.sky; $("skyDesc").textContent = card.dataset.desc; $("skyColors").textContent = card.dataset.colors;
  $("copySky").dataset.note = card.dataset.sky + "\n" + card.dataset.desc + "\nPalet: " + card.dataset.colors;
}));
$("copySky").addEventListener("click", () => copyText($("copySky").dataset.note || "Cyan Horizon\nLangit cyan, awan terang, clean.\nPalet: Cyan • Biru muda • Putih"));
