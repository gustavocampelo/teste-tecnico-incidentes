import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { api } from "./services/api";
import "./App.css";

type IncidentSeverity = "Baixa" | "Media" | "Alta" | "Critica";
type IncidentStatus = "Aberto" | "EmAnalise" | "Resolvido";
type ApiStatus = "checking" | "online" | "offline";
type ActivePage = "dashboard" | "processes";

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
  status: IncidentStatus;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  severity: "",
  status: "Aberto",
};

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingIncidentId, setEditingIncidentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  const isEditing = Boolean(editingIncidentId);

  const stats = useMemo(() => ({
    total: incidents.length,
    open: incidents.filter((i) => i.status === "Aberto").length,
    analysis: incidents.filter((i) => i.status === "EmAnalise").length,
    resolved: incidents.filter((i) => i.status === "Resolvido").length,
    critical: incidents.filter((i) => i.severity === "Critica").length,
  }), [incidents]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesStatus = statusFilter ? incident.status === statusFilter : true;
      const matchesSeverity = severityFilter ? incident.severity === severityFilter : true;

      return matchesStatus && matchesSeverity;
    });
  }, [incidents, statusFilter, severityFilter]);

  const latestIncidents = useMemo(() => incidents.slice(0, 3), [incidents]);

  const resolutionRate = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0;

  async function loadIncidents() {
    setLoading(true);
    setApiStatus("checking");

    try {
      const response = await api.get<Incident[]>("/incidents");

      setIncidents(response.data);
      setApiStatus("online");
      setErrors([]);
    } catch {
      setApiStatus("offline");
      setErrors(["Não foi possível carregar os incidentes. Verifique se a API está rodando."]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadIncidents();
  }, []);

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

    if (formData.description.trim().length > 0 && formData.description.trim().length < 10) {
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
      if (editingIncidentId) {
        await api.put(`/incidents/${editingIncidentId}`, {
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          status: formData.status,
        });

        setSuccessMessage("Incidente atualizado com sucesso.");
        setActivePage("processes");
      } else {
        await api.post("/incidents", {
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
        });

        setSuccessMessage("Incidente cadastrado com sucesso.");
      }

      setFormData(initialFormData);
      setEditingIncidentId(null);
      setApiStatus("online");
      setErrors([]);

      await loadIncidents();
    } catch {
      setApiStatus("offline");
      setSuccessMessage("");
      setErrors([
        isEditing
          ? "Não foi possível atualizar o incidente. Verifique se a API está rodando."
          : "Não foi possível cadastrar o incidente. Verifique se a API está rodando.",
      ]);
    }
  }

  function handleEditIncident(incident: Incident) {
    setActivePage("processes");
    setEditingIncidentId(incident.id);

    setFormData({
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
    });

    setErrors([]);
    setSuccessMessage("");

    setTimeout(() => {
      document
        .getElementById("editor-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function cancelEdit() {
    setEditingIncidentId(null);
    setFormData(initialFormData);
    setErrors([]);
    setSuccessMessage("");
  }

  async function handleDeleteIncident(id: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este incidente? Essa ação não poderá ser desfeita."
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/incidents/${id}`);

      if (editingIncidentId === id) {
        cancelEdit();
      }

      setApiStatus("online");
      setErrors([]);
      setSuccessMessage("Incidente excluído com sucesso.");

      await loadIncidents();
    } catch {
      setApiStatus("offline");
      setSuccessMessage("");
      setErrors(["Não foi possível excluir o incidente. Verifique se a API está rodando."]);
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

  function changePage(page: ActivePage) {
    if (page === "dashboard") {
      cancelEdit();
    }

    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function formatStatus(status: IncidentStatus) {
    return {
      Aberto: "Aberto",
      EmAnalise: "Em análise",
      Resolvido: "Resolvido",
    }[status];
  }

  function formatSeverity(severity: IncidentSeverity) {
    return {
      Baixa: "Baixa",
      Media: "Média",
      Alta: "Alta",
      Critica: "Crítica",
    }[severity];
  }

  const severityConfig: Record<IncidentSeverity, { dot: string; badge: string; glow: string }> = {
    Baixa: { dot: "#30D158", badge: "severity-low", glow: "rgba(48,209,88,0.3)" },
    Media: { dot: "#FFD60A", badge: "severity-medium", glow: "rgba(255,214,10,0.3)" },
    Alta: { dot: "#FF9F0A", badge: "severity-high", glow: "rgba(255,159,10,0.3)" },
    Critica: { dot: "#FF453A", badge: "severity-critical", glow: "rgba(255,69,58,0.4)" },
  };

  const statusConfig: Record<IncidentStatus, { dot: string; badge: string }> = {
    Aberto: { dot: "#FF9F0A", badge: "status-open" },
    EmAnalise: { dot: "#0A84FF", badge: "status-analysis" },
    Resolvido: { dot: "#30D158", badge: "status-resolved" },
  };

  const apiStatusMap: Record<ApiStatus, { label: string; desc: string; cls: string; dot: string }> = {
    online: {
      label: "Sistema operacional",
      desc: "API respondendo normalmente",
      cls: "api-online",
      dot: "#30D158",
    },
    offline: {
      label: "API indisponível",
      desc: "Verifique a conexão com o back-end",
      cls: "api-offline",
      dot: "#FF453A",
    },
    checking: {
      label: "Verificando conexão",
      desc: "Consultando o back-end...",
      cls: "api-checking",
      dot: "#FFD60A",
    },
  };

  const apiInfo = apiStatusMap[apiStatus];

  function renderMessages() {
    return (
      <>
        {errors.length > 0 && (
          <div className="alert alert-error">
            <span className="alert-icon">!</span>
            <div>
              <strong>Revise os pontos abaixo</strong>
              {errors.map((e) => <p key={e}>{e}</p>)}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <div>
              <strong>{successMessage}</strong>
            </div>
          </div>
        )}
      </>
    );
  }

  function renderIncidentForm() {
    return (
      <form onSubmit={handleSubmit} className="incident-form">
        <div className="field">
          <label htmlFor="title" className="field-label">Título</label>
          <input
            id="title"
            type="text"
            className="field-input"
            placeholder="Ex: Falha no serviço de autenticação"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="description" className="field-label">Descrição</label>
          <textarea
            id="description"
            className="field-input field-textarea"
            placeholder="Descreva o comportamento observado, impacto e passos para reprodução"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="severity" className="field-label">Severidade</label>
            <select
              id="severity"
              className="field-select"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentSeverity })}
            >
              <option value="">Selecione</option>
              <option value="Baixa">Baixa</option>
              <option value="Media">Média</option>
              <option value="Alta">Alta</option>
              <option value="Critica">Crítica</option>
            </select>
          </div>

          {isEditing && (
            <div className="field">
              <label htmlFor="status" className="field-label">Status</label>
              <select
                id="status"
                className="field-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as IncidentStatus })}
              >
                <option value="Aberto">Aberto</option>
                <option value="EmAnalise">Em análise</option>
                <option value="Resolvido">Resolvido</option>
              </select>
            </div>
          )}

          <div className="field field-submit">
            <button type="submit" className="btn-primary btn-full">
              {isEditing ? "Salvar alterações" : "Cadastrar"}
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="form-cancel-row">
            <button type="button" className="btn-ghost-sm" onClick={cancelEdit}>
              Cancelar edição
            </button>
          </div>
        )}
      </form>
    );
  }

  function renderIncidentCard(incident: Incident, index: number) {
    const sev = severityConfig[incident.severity];
    const sta = statusConfig[incident.status];

    return (
      <article
        key={incident.id}
        className="incident-card"
        style={{ animationDelay: `${index * 45}ms` }}
      >
        <div className="incident-top">
          <div className="incident-meta">
            <span
              className="status-dot"
              style={{
                background: sta.dot,
                boxShadow: `0 0 0 4px ${sta.dot}22, 0 0 12px ${sta.dot}55`,
              }}
            />

            <div className="incident-text">
              <h3 className="incident-title">{incident.title}</h3>
              <p className="incident-desc">{incident.description}</p>
            </div>
          </div>

          <span
            className={`severity-badge ${sev.badge}`}
            style={{ boxShadow: `0 0 16px ${sev.glow}` }}
          >
            {formatSeverity(incident.severity)}
          </span>
        </div>

        <div className="incident-details">
          <div className="detail-block">
            <span className="detail-label">Status</span>
            <span className={`status-badge ${sta.badge}`}>
              {formatStatus(incident.status)}
            </span>
          </div>

          <div className="detail-block">
            <span className="detail-label">Criado em</span>
            <span className="detail-value">
              {new Date(incident.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>

          <div className="detail-block">
            <span className="detail-label">Atualizar status</span>
            <select
              value={incident.status}
              className="field-select field-select-sm"
              onChange={(e) => updateStatus(incident.id, e.target.value as IncidentStatus)}
            >
              <option value="Aberto">Aberto</option>
              <option value="EmAnalise">Em análise</option>
              <option value="Resolvido">Resolvido</option>
            </select>
          </div>
        </div>

        <div className="incident-actions">
          <button type="button" className="btn-edit" onClick={() => handleEditIncident(incident)}>
            Editar
          </button>

          <button type="button" className="btn-delete" onClick={() => handleDeleteIncident(incident.id)}>
            Excluir
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className="app-root">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="main-content">
        <nav className="app-nav glass-card">
          <div className="brand-block">
            <span className="brand-mark">GC</span>
            <div>
              <strong>Incident Manager</strong>
              <span>by Gustavo Campelo</span>
            </div>
          </div>

          <div className="nav-actions" aria-label="Navegação principal">
            <button
              type="button"
              className={`nav-tab ${activePage === "dashboard" ? "nav-tab-active" : ""}`}
              onClick={() => changePage("dashboard")}
            >
              Início
            </button>

            <button
              type="button"
              className={`nav-tab ${activePage === "processes" ? "nav-tab-active" : ""}`}
              onClick={() => changePage("processes")}
            >
              Processos
            </button>
          </div>
        </nav>

        {activePage === "dashboard" && (
          <div className="page-view">
            <header className="hero-section">
              <div className="hero-inner">
                <div className="hero-eyebrow">
                  <span className="eyebrow-pill">Dashboard executivo</span>
                </div>

                <h1 className="hero-title">
                  Monitoramento<br />
                  <span className="hero-title-accent">em tempo real.</span>
                </h1>

                <p className="hero-subtitle">
                  Painel inicial para acompanhar saúde da API, volume de incidentes,
                  evolução dos status e pontos de atenção do sistema.
                </p>

                <div className="hero-actions">
                  <button type="button" className="btn-primary" onClick={() => changePage("processes")}>
                    Ver processos
                  </button>

                  <a href="#novo-incidente" className="btn-ghost">
                    Novo incidente
                  </a>
                </div>
              </div>

              <div className="hero-status-card glass-card">
                <div className={`api-badge ${apiInfo.cls}`}>
                  <span
                    className="api-dot"
                    style={{
                      background: apiInfo.dot,
                      boxShadow: `0 0 8px ${apiInfo.dot}`,
                    }}
                  />
                  {apiInfo.label}
                </div>

                <p className="api-desc">{apiInfo.desc}</p>

                <div className="api-stack-row">
                  <span className="stack-label">Stack</span>
                  <span className="stack-value">ASP.NET Core · React · TypeScript</span>
                </div>
              </div>
            </header>

            <section className="stats-grid" aria-label="Resumo">
              {([
                ["Total", stats.total, "incidentes"],
                ["Abertos", stats.open, "aguardando"],
                ["Em análise", stats.analysis, "em diagnóstico"],
                ["Resolvidos", stats.resolved, "concluídos"],
              ] as const).map(([label, value, sub], i) => (
                <article key={label} className="stat-card glass-card" style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="stat-label">{label}</span>
                  <strong className="stat-value">{value}</strong>
                  <span className="stat-sub">{sub}</span>
                </article>
              ))}
            </section>

            <section className="dashboard-grid">
              <article className="dashboard-panel glass-card">
                <span className="section-eyebrow">Eficiência</span>
                <h2 className="section-title">{resolutionRate}%</h2>
                <p className="section-desc">
                  Taxa de resolução calculada com base nos incidentes concluídos.
                </p>

                <div className="progress-track">
                  <span style={{ width: `${resolutionRate}%` }} />
                </div>
              </article>

              <article className="dashboard-panel glass-card">
                <span className="section-eyebrow">Prioridade</span>
                <h2 className="section-title">{stats.critical}</h2>
                <p className="section-desc">
                  Incidente(s) crítico(s) exigindo maior atenção operacional.
                </p>
              </article>

              <article className="dashboard-panel glass-card">
                <span className="section-eyebrow">Últimos registros</span>

                {latestIncidents.length === 0 ? (
                  <p className="section-desc">Nenhum incidente cadastrado até o momento.</p>
                ) : (
                  <div className="mini-list">
                    {latestIncidents.map((incident) => {
                      const sta = statusConfig[incident.status];

                      return (
                        <button
                          key={incident.id}
                          type="button"
                          className="mini-item"
                          onClick={() => handleEditIncident(incident)}
                        >
                          <span
                            className="status-dot"
                            style={{
                              background: sta.dot,
                              boxShadow: `0 0 0 4px ${sta.dot}22, 0 0 12px ${sta.dot}55`,
                            }}
                          />

                          <span>
                            <strong>{incident.title}</strong>
                            <small>{formatStatus(incident.status)}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            </section>

            <section id="novo-incidente" className="form-section glass-card">
              <div className="section-header">
                <div>
                  <span className="section-eyebrow">Cadastro rápido</span>
                  <h2 className="section-title">Novo incidente</h2>
                </div>

                <p className="section-desc">
                  Registre um novo processo diretamente pelo dashboard.
                </p>
              </div>

              {!isEditing && renderMessages()}
              {renderIncidentForm()}
            </section>
          </div>
        )}

        {activePage === "processes" && (
          <div className="page-view">
            <section className="process-hero glass-card">
              <div>
                <span className="section-eyebrow">Processos</span>
                <h1 className="section-title">Filtragem e gestão</h1>
                <p className="section-desc">
                  Visualize cada incidente, filtre por status ou severidade, atualize
                  processos, edite registros e exclua itens quando necessário.
                </p>
              </div>

              <button type="button" className="btn-primary" onClick={() => changePage("dashboard")}>
                Voltar ao início
              </button>
            </section>

            {isEditing && (
              <section id="editor-panel" className="form-section glass-card">
                <div className="section-header">
                  <div>
                    <span className="section-eyebrow">Edição</span>
                    <h2 className="section-title">Editar incidente</h2>
                  </div>

                  <p className="section-desc">
                    Atualize os dados e salve as alterações do processo selecionado.
                  </p>
                </div>

                <div className="alert alert-info">
                  <span className="alert-icon">✦</span>
                  <div>
                    <strong>Modo edição ativo</strong>
                    <p>Para sair deste modo, clique em cancelar edição.</p>
                  </div>
                </div>

                {renderMessages()}
                {renderIncidentForm()}
              </section>
            )}

            {!isEditing && renderMessages()}

            <section id="incidentes" className="list-section glass-card">
              <div className="list-header">
                <div>
                  <span className="section-eyebrow">Monitoramento</span>
                  <h2 className="section-title">Incidentes</h2>
                  <p className="section-count">
                    {filteredIncidents.length} registro{filteredIncidents.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="filters-row">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filtrar por status"
                    className="field-select"
                  >
                    <option value="">Todos os status</option>
                    <option value="Aberto">Aberto</option>
                    <option value="EmAnalise">Em análise</option>
                    <option value="Resolvido">Resolvido</option>
                  </select>

                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    aria-label="Filtrar por severidade"
                    className="field-select"
                  >
                    <option value="">Todas severidades</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Media">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Critica">Crítica</option>
                  </select>

                  <button type="button" className="btn-ghost-sm" onClick={clearFilters}>
                    Limpar
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="empty-state">
                  <div className="spinner" />
                  <p className="empty-title">Carregando incidentes</p>
                  <p className="empty-sub">Buscando dados atualizados</p>
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">◌</span>
                  <p className="empty-title">Nenhum incidente encontrado</p>
                  <p className="empty-sub">Cadastre um novo ou ajuste os filtros</p>
                </div>
              ) : (
                <div className="incidents-list">
                  {filteredIncidents.map((incident, index) => renderIncidentCard(incident, index))}
                </div>
              )}
            </section>
          </div>
        )}

        <footer className="app-footer glass-card">
          <div>
            <strong>Incident Manager</strong>
            <span>Sistema full stack para gestão de incidentes.</span>
          </div>

          <p>
            © {new Date().getFullYear()} Gustavo Campelo. Desenvolvido por Gustavo Campelo.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;