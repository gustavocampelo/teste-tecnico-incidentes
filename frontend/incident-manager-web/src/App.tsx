import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { api } from "./services/api";
import "./App.css";

type IncidentSeverity = "Baixa" | "Media" | "Alta" | "Critica";
type IncidentStatus = "Aberto" | "EmAnalise" | "Resolvido";
type ApiStatus = "checking" | "online" | "offline";

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  description: string;
  severity: IncidentSeverity | "";
}

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    severity: "",
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  const stats = useMemo(() => {
    return {
      total: incidents.length,
      open: incidents.filter((incident) => incident.status === "Aberto").length,
      analysis: incidents.filter((incident) => incident.status === "EmAnalise").length,
      resolved: incidents.filter((incident) => incident.status === "Resolvido").length,
    };
  }, [incidents]);

  async function loadIncidents() {
    setLoading(true);
    setApiStatus("checking");

    try {
      const params: Record<string, string> = {};

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (severityFilter) {
        params.severity = severityFilter;
      }

      const response = await api.get<Incident[]>("/incidents", { params });

      setIncidents(response.data);
      setApiStatus("online");
      setErrors([]);
    } catch {
      setApiStatus("offline");
      setErrors([
        "Não foi possível carregar os incidentes. Verifique se a API está rodando.",
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadIncidents();
  }, [statusFilter, severityFilter]);

  function validateForm() {
    const validationErrors: string[] = [];

    if (!formData.title.trim()) {
      validationErrors.push("O título é obrigatório.");
    }

    if (formData.title.trim().length > 0 && formData.title.trim().length < 3) {
      validationErrors.push("O título deve ter pelo menos 3 caracteres.");
    }

    if (!formData.description.trim()) {
      validationErrors.push("A descrição é obrigatória.");
    }

    if (
      formData.description.trim().length > 0 &&
      formData.description.trim().length < 10
    ) {
      validationErrors.push("A descrição deve ter pelo menos 10 caracteres.");
    }

    if (!formData.severity) {
      validationErrors.push("A severidade é obrigatória.");
    }

    setErrors(validationErrors);
    setSuccessMessage("");

    return validationErrors.length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await api.post("/incidents", {
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
      });

      setFormData({
        title: "",
        description: "",
        severity: "",
      });

      setApiStatus("online");
      setErrors([]);
      setSuccessMessage("Incidente cadastrado com sucesso.");

      await loadIncidents();
    } catch {
      setApiStatus("offline");
      setSuccessMessage("");
      setErrors(["Não foi possível cadastrar o incidente. Verifique se a API está rodando."]);
    }
  }

  async function updateStatus(id: string, status: IncidentStatus) {
    try {
      await api.patch(`/incidents/${id}/status`, { status });

      setApiStatus("online");
      setErrors([]);
      setSuccessMessage("Status atualizado com sucesso.");

      await loadIncidents();
    } catch {
      setApiStatus("offline");
      setSuccessMessage("");
      setErrors(["Não foi possível atualizar o status do incidente. Verifique se a API está rodando."]);
    }
  }

  function clearFilters() {
    setStatusFilter("");
    setSeverityFilter("");
  }

  function formatStatus(status: IncidentStatus) {
    const statusMap: Record<IncidentStatus, string> = {
      Aberto: "Aberto",
      EmAnalise: "Em análise",
      Resolvido: "Resolvido",
    };

    return statusMap[status];
  }

  function formatSeverity(severity: IncidentSeverity) {
    const severityMap: Record<IncidentSeverity, string> = {
      Baixa: "Baixa",
      Media: "Média",
      Alta: "Alta",
      Critica: "Crítica",
    };

    return severityMap[severity];
  }

  function getStatusClass(status: IncidentStatus) {
    return status.toLowerCase();
  }

  function getSeverityClass(severity: IncidentSeverity) {
    return severity.toLowerCase();
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Teste Técnico Full Stack</span>

          <h1>Gestão de Incidentes</h1>

          <p>
            Cadastre, acompanhe e priorize incidentes com uma experiência simples,
            clara e orientada ao diagnóstico.
          </p>

          <div className="hero-actions">
            <a href="#novo-incidente" className="primary-link">
              Cadastrar incidente
            </a>

            <a href="#incidentes" className="secondary-link">
              Ver listagem
            </a>
          </div>
        </div>

        <div className="hero-panel" aria-label="Status da API">
          <div className={`pulse-dot ${apiStatus}`} />

          <strong>
            {apiStatus === "online" && "API conectada"}
            {apiStatus === "offline" && "API indisponível"}
            {apiStatus === "checking" && "Verificando API"}
          </strong>

          <span>
            {apiStatus === "online" &&
              "Back-end ASP.NET Core respondendo corretamente."}

            {apiStatus === "offline" &&
              "Inicie a API em http://localhost:5252 para carregar os dados."}

            {apiStatus === "checking" && "Consultando conexão com o back-end."}
          </span>
        </div>
      </section>

      <section className="stats-grid" aria-label="Resumo dos incidentes">
        <article className="stat-card">
          <span>Total</span>
          <strong>{stats.total}</strong>
          <small>Incidentes na visão atual</small>
        </article>

        <article className="stat-card">
          <span>Abertos</span>
          <strong>{stats.open}</strong>
          <small>Aguardando tratativa</small>
        </article>

        <article className="stat-card">
          <span>Em análise</span>
          <strong>{stats.analysis}</strong>
          <small>Em diagnóstico</small>
        </article>

        <article className="stat-card">
          <span>Resolvidos</span>
          <strong>{stats.resolved}</strong>
          <small>Concluídos</small>
        </article>
      </section>

      <section id="novo-incidente" className="content-card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">Cadastro</span>
            <h2>Novo incidente</h2>
          </div>

          <p>
            Registre o problema com informações objetivas para facilitar a análise
            técnica.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="feedback feedback-error">
            <strong>Revise os pontos abaixo:</strong>

            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        {successMessage && (
          <div className="feedback feedback-success">
            <strong>{successMessage}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              type="text"
              placeholder="Ex: Erro ao carregar painel administrativo"
              value={formData.title}
              onChange={(event) =>
                setFormData({ ...formData, title: event.target.value })
              }
            />
          </div>

          <div className="field">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              placeholder="Descreva o comportamento observado, impacto, contexto e passos para reprodução"
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="severity">Severidade</label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    severity: event.target.value as IncidentSeverity,
                  })
                }
              >
                <option value="">Selecione uma severidade</option>
                <option value="Baixa">Baixa</option>
                <option value="Media">Média</option>
                <option value="Alta">Alta</option>
                <option value="Critica">Crítica</option>
              </select>
            </div>

            <div className="submit-area">
              <button type="submit">Cadastrar incidente</button>
            </div>
          </div>
        </form>
      </section>

      <section id="incidentes" className="content-card">
        <div className="section-toolbar">
          <div>
            <span className="section-kicker">Monitoramento</span>
            <h2>Incidentes cadastrados</h2>
            <p>{incidents.length} incidente(s) encontrado(s)</p>
          </div>

          <div className="filters">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrar por status"
            >
              <option value="">Todos os status</option>
              <option value="Aberto">Aberto</option>
              <option value="EmAnalise">Em análise</option>
              <option value="Resolvido">Resolvido</option>
            </select>

            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              aria-label="Filtrar por severidade"
            >
              <option value="">Todas as severidades</option>
              <option value="Baixa">Baixa</option>
              <option value="Media">Média</option>
              <option value="Alta">Alta</option>
              <option value="Critica">Crítica</option>
            </select>

            <button type="button" className="ghost-button" onClick={clearFilters}>
              Limpar filtros
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loader" />
            <h3>Carregando incidentes...</h3>
            <p>Buscando dados atualizados na API.</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <h3>Nenhum incidente encontrado</h3>
            <p>Cadastre um novo incidente ou ajuste os filtros utilizados.</p>
          </div>
        ) : (
          <div className="incident-list">
            {incidents.map((incident) => (
              <article key={incident.id} className="incident-card">
                <div className="incident-main">
                  <div className="incident-title-group">
                    <span className={`status-dot ${getStatusClass(incident.status)}`} />

                    <div>
                      <h3>{incident.title}</h3>
                      <p>{incident.description}</p>
                    </div>
                  </div>

                  <span className={`severity-badge ${getSeverityClass(incident.severity)}`}>
                    {formatSeverity(incident.severity)}
                  </span>
                </div>

                <div className="incident-meta">
                  <div>
                    <span>Status atual</span>
                    <strong>{formatStatus(incident.status)}</strong>
                  </div>

                  <div>
                    <span>Criado em</span>
                    <strong>{new Date(incident.createdAt).toLocaleString("pt-BR")}</strong>
                  </div>

                  <div>
                    <span>Atualizar status</span>
                    <select
                      value={incident.status}
                      onChange={(event) =>
                        updateStatus(incident.id, event.target.value as IncidentStatus)
                      }
                    >
                      <option value="Aberto">Aberto</option>
                      <option value="EmAnalise">Em análise</option>
                      <option value="Resolvido">Resolvido</option>
                    </select>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;