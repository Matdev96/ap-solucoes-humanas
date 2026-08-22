/* ===========================================================
   AP Soluções Humanas — comportamento do site
   =========================================================== */

// #################################################################
// ###  URLs DOS WEBHOOKS DO N8N (nó "Webhook1")                   ###
// ###  Cada uma corresponde a um fluxo importado no n8n:          ###
// ###   - contato    -> fluxo "Contato"             (path: Contato)            ###
// ###   - curriculo  -> fluxo "Cadastrar Currículo" (path: CadastrarCurriculo) ###
// ###  OBS: o formulário do MeEscutaRH NÃO usa este arquivo — ele  ###
// ###  tem seu próprio <script> inline dentro de me-escuta-rh.html ###
// ###  (com a URL do webhook já configurada lá).                  ###
// #################################################################
const FORM_ENDPOINTS = {
  contato: "https://criadordigital-n8n-webhook.syxuur.easypanel.host/webhook/Contato",
  curriculo: "https://criadordigital-n8n-webhook.syxuur.easypanel.host/webhook/CadastrarCurriculo",
};
// #################################################################

(function () {
  // ---- Menu mobile ----
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();

/* ---- Carrossel de depoimentos ---- */
(function () {
  const track = document.getElementById("depoimentosCarousel");
  const dotsWrap = document.getElementById("depoimentosDots");
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", "Ir para depoimento " + (i + 1));
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => {
      slides[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = slides.indexOf(entry.target);
          dots.forEach((d) => d.classList.remove("is-active"));
          if (dots[idx]) dots[idx].classList.add("is-active");
        }
      });
    },
    { root: track, threshold: 0.6 }
  );
  slides.forEach((s) => observer.observe(s));

  let autoplay = setInterval(() => {
    const current = dots.findIndex((d) => d.classList.contains("is-active"));
    const next = (current + 1) % slides.length;
    slides[next].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, 4000);
  track.addEventListener("mouseenter", () => clearInterval(autoplay));
  track.addEventListener("touchstart", () => clearInterval(autoplay), { passive: true });
})();

/* ---- Helper genérico de envio de formulário ---- */
function setupGenericForm(formId, endpointKey, successMsg) {
  const form = document.getElementById(formId);
  if (!form) return;

  const feedback = form.querySelector(".form-feedback");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    feedback.className = "form-feedback";
    feedback.textContent = "";

    if (!form.checkValidity()) {
      form.reportValidity();
      feedback.className = "form-feedback err";
      feedback.textContent = "Preencha todos os campos obrigatórios antes de enviar.";
      return;
    }

    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput && fileInput.files.length) {
      const maxBytes = 5 * 1024 * 1024;
      if (fileInput.files[0].size > maxBytes) {
        feedback.className = "form-feedback err";
        feedback.textContent = "O arquivo deve ter no máximo 5MB.";
        return;
      }
    }

    const endpoint = FORM_ENDPOINTS[endpointKey];
    if (!endpoint || endpoint.startsWith("COLE_")) {
      feedback.className = "form-feedback err";
      feedback.textContent =
        "Configuração pendente: o endpoint deste formulário ainda não foi definido.";
      return;
    }

    const fd = new FormData(form);
    submitBtn.disabled = true;
    const original = submitBtn.textContent;
    submitBtn.textContent = "Enviando...";

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      feedback.className = "form-feedback ok";
      feedback.textContent = successMsg;
      form.reset();
    } catch (err) {
      feedback.className = "form-feedback err";
      feedback.textContent =
        "Não foi possível enviar agora. Verifique a conexão e tente novamente.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
}

setupGenericForm("contatoForm", "contato", "Mensagem enviada com sucesso! Em breve entraremos em contato.");
setupGenericForm("curriculoForm", "curriculo", "Currículo enviado com sucesso! Obrigado pelo interesse.");
