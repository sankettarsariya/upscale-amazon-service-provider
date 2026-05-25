import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { addDoc, collection, getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { businessSettings, firebaseConfig } from "/firebase-config.js";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
isSupported().then(supported => {
  if (supported) getAnalytics(firebaseApp);
});

const cur = document.getElementById("cur");
const curl = document.getElementById("curl");
let settings = businessSettings;

const icons = {
  account: '<svg viewBox="0 0 24 24"><path d="M15 19a6 6 0 0 0-12 0"/><circle cx="9" cy="8" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.2.6.78 1 1.41 1H21a2 2 0 0 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></svg>',
  listing: '<svg viewBox="0 0 24 24"><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h5"/><path d="M10 12h7"/><path d="M10 16h5"/><path d="M4 7v14"/></svg>',
  brand: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.5-2.9 7.6-7 9-4.1-1.4-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-5"/></svg>',
  rocket: '<svg viewBox="0 0 24 24"><path d="M5 19c1.5.5 3 .5 4.5-.5L19 9l2-6-6 2-9.5 9.5C4.5 16 4.5 17.5 5 19Z"/><path d="M15 5l4 4"/><path d="M7 17l-4 4"/><path d="M9 15l-2 6"/></svg>',
  prime: '<svg viewBox="0 0 24 24"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9z"/></svg>',
  ads: '<svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h17"/><path d="M8 16v-5"/><path d="M13 16V8"/><path d="M18 16v-3"/><path d="M7 7h12"/></svg>',
  coupon: '<svg viewBox="0 0 24 24"><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M9 9h.01"/><path d="M15 15h.01"/><path d="M15 9l-6 6"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M5 19l1-3.3A8 8 0 1 1 9.1 18Z"/><path d="M9.5 8.8c.2 3 2 4.7 5.2 5.4l1.2-1.3-2-1-1 .9c-1.2-.5-2-1.2-2.6-2.4l.9-1-.9-1.9z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg>',
  location: '<svg viewBox="0 0 24 24"><path d="M12 21s7-5.2 7-12A7 7 0 0 0 5 9c0 6.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>'
};

document.querySelectorAll("[data-icon]").forEach(el => {
  const icon = icons[el.dataset.icon];
  if (icon) el.innerHTML = icon;
});

if (cur && curl) {
  let mx = 0;
  let my = 0;
  let rx = 0;
  let ry = 0;
  document.addEventListener("mousemove", event => {
    mx = event.clientX;
    my = event.clientY;
  });
  (function loop() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    cur.style.left = `${mx}px`;
    cur.style.top = `${my}px`;
    curl.style.left = `${rx}px`;
    curl.style.top = `${ry}px`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll("a,button,.svc-card,.tc,.step,.ci-whatsapp,.ci-email,.ci-location").forEach(el => {
    el.addEventListener("mouseenter", () => {
      cur.style.transform = "translate(-50%,-50%) scale(2.5)";
      curl.style.opacity = ".8";
    });
    el.addEventListener("mouseleave", () => {
      cur.style.transform = "translate(-50%,-50%) scale(1)";
      curl.style.opacity = ".5";
    });
  });
}

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("on");
  });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal,.rev-l,.rev-r").forEach(el => io.observe(el));

function whatsappUrl(text) {
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function updateContactLinks() {
  document.querySelectorAll("[data-setting]").forEach(el => {
    const key = el.getAttribute("data-setting");
    if (settings[key]) el.textContent = settings[key];
  });

  const defaultText = "Hi Upscale! I want to open a free Amazon seller account.";
  const whatsappLink = document.getElementById("whatsapp-link");
  const ctaWhatsapp = document.getElementById("cta-whatsapp");
  const emailLink = document.getElementById("email-link");

  if (whatsappLink) whatsappLink.href = whatsappUrl(defaultText);
  if (ctaWhatsapp) ctaWhatsapp.href = whatsappUrl(defaultText);
  if (emailLink) emailLink.href = `mailto:${settings.email}`;
}

function loadSettings() {
  updateContactLinks();
}

function showFormMessage(text, isError = false) {
  const box = document.getElementById("cf-ok");
  box.textContent = text;
  box.classList.toggle("err", isError);
  box.style.display = "block";
}

async function submitLead(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());

  if (!data.name.trim() || !data.phone.trim()) {
    showFormMessage("Please enter your name and phone number.", true);
    return;
  }

  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Submitting...";

  try {
    await addDoc(collection(db, "leads"), {
      name: data.name.trim().slice(0, 120),
      phone: data.phone.trim().slice(0, 40),
      email: (data.email || "").trim().slice(0, 160),
      product: (data.product || "").trim().slice(0, 180),
      message: (data.message || "").trim().slice(0, 800),
      source: "website",
      createdAt: serverTimestamp()
    });

    showFormMessage("Thank you! Your lead is saved. We will reach out within 24 hours.");
    const text = `Hi Upscale!\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email || "-"}\nProduct: ${data.product || "-"}\nI want to open a free Amazon seller account.`;
    window.open(whatsappUrl(text), "_blank", "noopener");
    form.reset();
  } catch (error) {
    showFormMessage(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Submit - Get Free Consultation ->";
  }
}

document.getElementById("lead-form")?.addEventListener("submit", submitLead);
loadSettings();
