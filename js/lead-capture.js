/* =====================================================
   lead-capture.js
   Script de captura de lead — fala com a API de captura
   ===================================================== */

(function () {
    "use strict";

    // 🔧 CONFIG: URL da API
    // Em dev local, abra o console e rode antes de testar:
    //   localStorage.setItem('API_BASE_URL', 'http://localhost:8000')
    // Ou inclua um <script>window.API_BASE_URL='http://localhost:8000'</script>
    // antes deste script no HTML (só em ambiente de dev).
    const API_BASE =
        window.API_BASE_URL ||
        localStorage.getItem("API_BASE_URL") ||
        "https://api.brunanardy.com.br";

    const form = document.getElementById("leadForm");
    if (!form) return;

    const submitBtn = document.getElementById("submitBtn");
    const msgBox = document.getElementById("formMsg");
    const source = form.dataset.source || "unknown";

    function showMessage(text, type) {
        msgBox.className = "form-message " + type;
        msgBox.textContent = text;
    }

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? "Enviando..." : "Quero receber o ebook";
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const consent = document.getElementById("consent").checked;
        const resultado = document.getElementById("resultado")?.value || null;

        // validações básicas do lado do cliente
        if (nome.length < 2) {
            showMessage("Por favor, informe seu primeiro nome.", "error");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage("Por favor, informe um email válido.", "error");
            return;
        }
        if (!consent) {
            showMessage("Marque a caixa de consentimento pra continuar.", "error");
            return;
        }

        setLoading(true);
        msgBox.className = "form-message";
        msgBox.textContent = "";

        try {
            const response = await fetch(API_BASE + "/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    source: source,
                    resultado: resultado,
                    referrer: document.referrer || null,
                    page: window.location.pathname
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || "Erro ao enviar");
            }

            // sucesso — redireciona pro thank you
            window.location.href = "obrigado.html?source=" + encodeURIComponent(source);

        } catch (err) {
            console.error("Capture error:", err);
            showMessage(
                "Não consegui te cadastrar agora. Tenta de novo em alguns minutos, por favor.",
                "error"
            );
            setLoading(false);
        }
    });
})();
