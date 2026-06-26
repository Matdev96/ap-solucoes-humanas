/* ===========================================================
   AP Soluções Humanas — comportamento do site
   =========================================================== */

// #################################################################
// ###  COLE AQUI OS ENDPOINTS DO SEU SERVIÇO DE FORMULÁRIO       ###
// ###  (Formspree: https://formspree.io | Web3Forms: web3forms.com) ###
const FORM_ENDPOINTS = {
  contato: "COLE_O_ENDPOINT_DO_FORMULARIO_DE_CONTATO_AQUI",
  curriculo: "COLE_O_ENDPOINT_DO_FORMULARIO_DE_CURRICULO_AQUI",
  meescuta: "COLE_O_ENDPOINT_DO_FORMULARIO_MEESCUTA_AQUI",
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

/* ===========================================================
   MeEscutaRH — lógica condicional ("filtro") + envio
   =========================================================== */
(function () {
  const form = document.getElementById("merForm");
  if (!form) return;

  const tipo = document.getElementById("tipoSolicitacao");
  const empresa = document.getElementById("empresa");
  const wrapEmpManual = document.getElementById("wrapEmpresaManual");
  const empManual = document.getElementById("empresaManual");
  const wrapLocal = document.getElementById("wrapLocalidade");
  const cidade = document.getElementById("cidade");
  const estado = document.getElementById("estado");
  const wrapSetor = document.getElementById("wrapSetor");
  const setor = document.getElementById("setor");
  const wrapMotivo = document.getElementById("wrapMotivo");
  const motivo = document.getElementById("motivo");
  const wrapAnexo = document.getElementById("wrapAnexo");
  const anexo = document.getElementById("anexo");
  const lblDescricao = document.getElementById("lblDescricao");
  const descricao = document.getElementById("descricao");
  const nome = document.getElementById("nome");
  const whatsapp = document.getElementById("whatsapp");
  const email = document.getElementById("email");
  const contatoState = document.getElementById("contatoState");
  const reqDyn = document.querySelectorAll(".req-dyn");
  const feedback = document.getElementById("merFeedback");
  const submitBtn = document.getElementById("merSubmit");

  const show = (el) => el.classList.remove("is-hidden");
  const hide = (el) => el.classList.add("is-hidden");

  function isCliente() {
    return empresa.value !== "" && empresa.value !== "__OUTRA__";
  }
  function isNaoCliente() {
    return empresa.value === "__OUTRA__";
  }

  function atualizar() {
    const t = tipo.value;

    if (isNaoCliente()) {
      show(wrapEmpManual);
      show(wrapLocal);
    } else {
      hide(wrapEmpManual);
      hide(wrapLocal);
    }

    if (t === "Denúncias") {
      show(wrapSetor);
      show(wrapMotivo);
    } else {
      hide(wrapSetor);
      hide(wrapMotivo);
    }

    if (t === "Envio de documentos") {
      show(wrapAnexo);
    } else {
      hide(wrapAnexo);
    }

    if (t === "Sugestões") {
      lblDescricao.textContent = "Sua sugestão";
      descricao.placeholder = "Descreva sua sugestão de melhoria";
    } else {
      lblDescricao.textContent = "Descrição da solicitação";
      descricao.placeholder = "Descreva sua solicitação";
    }

    const contatoObrigatorio = t === "Envio de documentos" || t === "Dúvidas";
    reqDyn.forEach((s) => (s.style.visibility = contatoObrigatorio ? "visible" : "hidden"));
    contatoState.textContent = contatoObrigatorio ? "(obrigatório)" : "(opcional)";
  }

  tipo.addEventListener("change", atualizar);
  empresa.addEventListener("change", atualizar);
  atualizar();

  form.addEventListener("input", (e) => {
    if (e.target.classList) e.target.classList.remove("is-invalid");
  });

  function marcarErro(el) {
    el.classList.add("is-invalid");
  }
  function visivel(wrap) {
    return !wrap.classList.contains("is-hidden");
  }

  function validar() {
    const erros = [];
    document.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

    const t = tipo.value;
    if (!t) {
      marcarErro(tipo);
      erros.push("Selecione o tipo de solicitação.");
    }
    if (!empresa.value) {
      marcarErro(empresa);
      erros.push("Selecione a empresa.");
    }

    if (isNaoCliente()) {
      if (!empManual.value.trim()) {
        marcarErro(empManual);
        erros.push("Informe o nome da empresa.");
      }
      if (!cidade.value.trim()) {
        marcarErro(cidade);
        erros.push("Informe a cidade.");
      }
      if (!estado.value.trim()) {
        marcarErro(estado);
        erros.push("Informe o estado.");
      }
    }

    if (t === "Denúncias") {
      if (!setor.value) {
        marcarErro(setor);
        erros.push("Selecione o setor.");
      }
      if (!motivo.value) {
        marcarErro(motivo);
        erros.push("Selecione o motivo da denúncia.");
      }
    }

    if (t === "Envio de documentos") {
      if (!anexo.files.length) {
        marcarErro(anexo);
        erros.push("Anexe o documento (JPG ou PDF).");
      } else if (!/\.(jpe?g|pdf)$/i.test(anexo.files[0].name)) {
        marcarErro(anexo);
        erros.push("O documento deve ser JPG ou PDF.");
      }
    }

    if (t === "Envio de documentos" || t === "Dúvidas") {
      if (!nome.value.trim()) {
        marcarErro(nome);
        erros.push("Informe seu nome.");
      }
      if (!whatsapp.value.trim()) {
        marcarErro(whatsapp);
        erros.push("Informe seu WhatsApp.");
      }
      if (!email.value.trim()) {
        marcarErro(email);
        erros.push("Informe seu e-mail.");
      }
    }
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      marcarErro(email);
      erros.push("E-mail inválido.");
    }
    return erros;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    feedback.className = "form-feedback";
    feedback.textContent = "";

    const erros = validar();
    if (erros.length) {
      feedback.className = "form-feedback err";
      feedback.textContent = erros[0];
      return;
    }

    const endpoint = FORM_ENDPOINTS.meescuta;
    if (!endpoint || endpoint.startsWith("COLE_")) {
      feedback.className = "form-feedback err";
      feedback.textContent = "Configuração pendente: o endpoint deste formulário ainda não foi definido.";
      return;
    }

    const fd = new FormData();
    fd.append("tipo_solicitacao", tipo.value);
    fd.append("eh_cliente", isCliente() ? "sim" : "nao");
    fd.append("empresa", isNaoCliente() ? empManual.value.trim() : empresa.value);
    fd.append("cidade", visivel(wrapLocal) ? cidade.value.trim() : "");
    fd.append("estado", visivel(wrapLocal) ? estado.value.trim() : "");
    fd.append("setor", visivel(wrapSetor) ? setor.value : "");
    fd.append("motivo_denuncia", visivel(wrapMotivo) ? motivo.value : "");
    fd.append("descricao", descricao.value.trim());
    fd.append("nome", nome.value.trim());
    fd.append("whatsapp", whatsapp.value.trim());
    fd.append("email", email.value.trim());
    fd.append("origem", "MeEscutaRH - site");
    fd.append("data_envio", new Date().toISOString());
    if (visivel(wrapAnexo) && anexo.files.length) {
      fd.append("anexo", anexo.files[0], anexo.files[0].name);
    }

    submitBtn.disabled = true;
    const txtOriginal = submitBtn.textContent;
    submitBtn.textContent = "Enviando...";

    try {
      const resp = await fetch(endpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      feedback.className = "form-feedback ok";
      feedback.textContent = "Solicitação enviada com segurança. Obrigado!";
      form.reset();
      atualizar();
    } catch (err) {
      feedback.className = "form-feedback err";
      feedback.textContent = "Não foi possível enviar agora. Verifique a conexão e tente novamente.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = txtOriginal;
    }
  });
})();
