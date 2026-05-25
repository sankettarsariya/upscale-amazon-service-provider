import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "/firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rows = document.getElementById("lead-rows");
const count = document.getElementById("lead-count");
const empty = document.getElementById("empty-state");
const loginBox = document.getElementById("admin-login");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const exportBtn = document.getElementById("export-btn");
const logoutBtn = document.getElementById("logout-btn");

let currentLeads = [];

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "-";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function setLoginMessage(text, isError = false) {
  loginMessage.textContent = text;
  loginMessage.classList.toggle("err", isError);
  loginMessage.style.display = text ? "block" : "none";
}

function renderLeads(leads) {
  count.textContent = `${leads.length} lead${leads.length === 1 ? "" : "s"} captured`;
  empty.hidden = leads.length !== 0;
  rows.innerHTML = leads.map(lead => `
    <tr>
      <td>${escapeHtml(formatDate(lead.createdAt))}</td>
      <td><strong>${escapeHtml(lead.name)}</strong></td>
      <td>${escapeHtml(lead.phone)}</td>
      <td>${escapeHtml(lead.email || "-")}</td>
      <td>${escapeHtml(lead.product || "-")}</td>
      <td>${escapeHtml(lead.message || "-")}</td>
    </tr>
  `).join("");
}

async function loadLeads() {
  count.textContent = "Loading leads...";
  const leadsQuery = query(collection(db, "leads"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(leadsQuery);
  currentLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderLeads(currentLeads);
}

function csvEscape(value) {
  return `"${String(value || "").replaceAll('"', '""')}"`;
}

function exportCsv() {
  const header = ["Created At", "Name", "Phone", "Email", "Product", "Message"];
  const lines = currentLeads.map(lead => [
    formatDate(lead.createdAt),
    lead.name,
    lead.phone,
    lead.email,
    lead.product,
    lead.message
  ].map(csvEscape).join(","));
  const csv = [header.map(csvEscape).join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "upscale-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value;
  const button = loginForm.querySelector("button");

  button.disabled = true;
  button.textContent = "Logging in...";
  setLoginMessage("");

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    setLoginMessage(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Login";
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));
exportBtn.addEventListener("click", exportCsv);

onAuthStateChanged(auth, async user => {
  loginBox.hidden = Boolean(user);
  logoutBtn.hidden = !user;
  exportBtn.hidden = !user;

  if (!user) {
    rows.innerHTML = "";
    empty.hidden = false;
    empty.textContent = "Login to view leads.";
    count.textContent = "Admin login required";
    return;
  }

  try {
    await loadLeads();
  } catch (error) {
    count.textContent = "Unable to load leads.";
    empty.hidden = false;
    empty.textContent = error.message;
  }
});
