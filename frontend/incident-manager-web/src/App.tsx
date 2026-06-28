import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { api } from "./services/api";
import "./App.css";

type IncidentSeverity = "Baixa" | "Media" | "Alta" | "Critica";
type IncidentStatus = "Aberto" | "EmAnalise" | "Resolvido";

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
  const [loading, setLoading] = useState(false);

  async function loadIncidents() {
    setLoading(true);

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
    } catch {
      setErrors(["Não foi possível carregar os incidentes. Verifique se a API está rodando."]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncidents();
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

    if (formData.description.trim().length > 0 && formData.description.trim().length < 10) {
      validationErrors.push("A descrição deve ter pelo menos 10 caracteres.");
    }

    if (!formData.severity) {
      validationErrors.push("A severidade é obrigatória.");
    }

    setErrors(validationErrors);

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

      setErrors([]);
      await loadIncidents();
    } catch {
      setErrors(["Não foi possível cadastrar o incidente."]);
    }
  }

  async function updateStatus(id: string, status: IncidentStatus) {
    try {
      await api.patch(`/incidents/${id}/status`, { status });
      await loadIncidents();
    } catch {
      setErrors(["Não foi possível atualizar o status do incidente."]);
    }
  }

  function formatStatus(status: IncidentStatus) {
    if (status === "EmAnalise") {
      return "Em análise";
    }

    return status;
  }

  return (
    <main className="container">
      <section className="hero">
        <div>
          <span className="tag">Teste Técnico</span>
          <h1>Gestão de Incidentes</h1>
          <p>
            Aplicação full stack para cadastro, acompanhamento e análise de incidentes.
          </p>
        </div>
      </section>

      <section className="card">
        <h2>Novo incidente</h2>

        {errors.length > 0 && (
          <div className="errors">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
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
              placeholder="Descreva o comportamento observado, impacto e contexto do incidente"
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
            />
          </div>

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
              <option value="">Selecione</option>
              <option value="Baixa">Baixa</option>
              <option value="Media">Média</option>
              <option value="Alta">Alta</option>
              <option value="Critica">Crítica</option>
            </select>
          </div>

          <button type="submit">Cadastrar incidente</button>
        </form>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Incidentes cadastrados</h2>
            <p>{incidents.length} incidente(s) encontrado(s)</p>
          </div>

          <div className="filters">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="Aberto">Aberto</option>
              <option value="EmAnalise">Em análise</option>
              <option value="Resolvido">Resolvido</option>
            </select>

            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
            >
              <option value="">Todas as severidades</option>
              <option value="Baixa">Baixa</option>
              <option value="Media">Média</option>
              <option value="Alta">Alta</option>
              <option value="Critica">Crítica</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Carregando incidentes...</p>
        ) : incidents.length === 0 ? (
          <p className="empty">Nenhum incidente encontrado.</p>
        ) : (
          <div className="incident-list">
            {incidents.map((incident) => (
              <article key={incident.id} className="incident-card">
                <div className="incident-header">
                  <div>
                    <h3>{incident.title}</h3>
                    <p>{incident.description}</p>
                  </div>

                  <span className={`severity severity-${incident.severity.toLowerCase()}`}>
                    {incident.severity === "Media" ? "Média" : incident.severity}
                  </span>
                </div>

                <div className="incident-footer">
                  <div>
                    <strong>Status:</strong> {formatStatus(incident.status)}
                  </div>

                  <div>
                    <strong>Criado em:</strong>{" "}
                    {new Date(incident.createdAt).toLocaleString("pt-BR")}
                  </div>

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
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;