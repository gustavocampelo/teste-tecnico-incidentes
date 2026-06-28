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
  status: IncidentStatus;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  severity: "",
  status: "Aberto",
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const selectClass =
  "w-full cursor-pointer rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [editingIncidentId, setEditingIncidentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  const isEditing = Boolean(editingIncidentId);

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
      if (editingIncidentId) {
        await api.put(`/incidents/${editingIncidentId}`, {
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          status: formData.status,
        });

        setSuccessMessage("Incidente atualizado com sucesso.");
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
    setEditingIncidentId(incident.id);

    setFormData({
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
    });

    setErrors([]);
    setSuccessMessage("");

    document
      .getElementById("novo-incidente")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      setErrors([
        "Não foi possível excluir o incidente. Verifique se a API está rodando.",
      ]);
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
      setErrors([
        "Não foi possível atualizar o status do incidente. Verifique se a API está rodando.",
      ]);
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

  function getApiStatusContent() {
    const statusMap: Record<
      ApiStatus,
      {
        title: string;
        description: string;
        dotClass: string;
        badgeClass: string;
      }
    > = {
      online: {
        title: "API conectada",
        description: "Back-end ASP.NET Core respondendo corretamente.",
        dotClass: "bg-emerald-400 shadow-emerald-400/40",
        badgeClass: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
      },
      offline: {
        title: "API indisponível",
        description: "Aguarde alguns segundos e atualize a página.",
        dotClass: "bg-red-400 shadow-red-400/40",
        badgeClass: "border-red-300/30 bg-red-400/10 text-red-100",
      },
      checking: {
        title: "Verificando API",
        description: "Consultando conexão com o back-end.",
        dotClass: "bg-amber-300 shadow-amber-300/40",
        badgeClass: "border-amber-300/30 bg-amber-400/10 text-amber-100",
      },
    };

    return statusMap[apiStatus];
  }

  function getSeverityStyles(severity: IncidentSeverity) {
    const severityMap: Record<IncidentSeverity, string> = {
      Baixa: "border-emerald-200 bg-emerald-50 text-emerald-700",
      Media: "border-yellow-200 bg-yellow-50 text-yellow-700",
      Alta: "border-orange-200 bg-orange-50 text-orange-700",
      Critica: "border-red-200 bg-red-50 text-red-700",
    };

    return severityMap[severity];
  }

  function getStatusDotStyles(status: IncidentStatus) {
    const statusMap: Record<IncidentStatus, string> = {
      Aberto: "bg-orange-400 shadow-orange-400/30",
      EmAnalise: "bg-blue-500 shadow-blue-500/30",
      Resolvido: "bg-emerald-500 shadow-emerald-500/30",
    };

    return statusMap[status];
  }

  function getStatusBadgeStyles(status: IncidentStatus) {
    const statusMap: Record<IncidentStatus, string> = {
      Aberto: "border-orange-200 bg-orange-50 text-orange-700",
      EmAnalise: "border-blue-200 bg-blue-50 text-blue-700",
      Resolvido: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };

    return statusMap[status];
  }

  const apiStatusContent = getApiStatusContent();

  return (
    <main className="min-h-screen px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <section className="animate-fade-up relative overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-900/20 sm:px-10 sm:py-12 lg:grid lg:min-h-[360px] lg:grid-cols-[1fr_360px] lg:gap-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative z-10">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 backdrop-blur">
              Teste Técnico Full Stack
            </span>

            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.08em] sm:text-6xl lg:text-7xl">
              Gestão de Incidentes
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              Cadastre, acompanhe, edite, exclua e priorize incidentes com uma
              experiência moderna, clara e orientada ao diagnóstico.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#novo-incidente"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 font-black text-blue-700 shadow-xl shadow-slate-950/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Cadastrar incidente
              </a>

              <a
                href="#incidentes"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 font-black text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/15"
              >
                Ver listagem
              </a>
            </div>
          </div>

          <div className="relative z-10 mt-8 flex items-end lg:mt-0">
            <div className="w-full rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
              <div
                className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 text-sm font-black ${apiStatusContent.badgeClass}`}
              >
                <span
                  className={`h-3 w-3 rounded-full shadow-[0_0_0_8px] animate-soft-pulse ${apiStatusContent.dotClass}`}
                />
                {apiStatusContent.title}
              </div>

              <p className="mt-4 text-sm leading-6 text-blue-100">
                {apiStatusContent.description}
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                  Stack
                </span>
                <p className="mt-2 text-sm font-semibold text-white">
                  ASP.NET Core API + React + TypeScript
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Resumo dos incidentes"
        >
          {[
            ["Total", stats.total, "Incidentes na visão atual"],
            ["Abertos", stats.open, "Aguardando tratativa"],
            ["Em análise", stats.analysis, "Em diagnóstico"],
            ["Resolvidos", stats.resolved, "Concluídos"],
          ].map(([label, value, description], index) => (
            <article
              key={label}
              className="animate-scale-in rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span className="text-sm font-black text-slate-500">{label}</span>
              <strong className="mt-2 block text-4xl font-black tracking-[-0.06em] text-slate-950">
                {value}
              </strong>
              <small className="mt-1 block text-sm leading-5 text-slate-500">
                {description}
              </small>
            </article>
          ))}
        </section>

        <section
          id="novo-incidente"
          className="mt-5 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-7"
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                {isEditing ? "Edição" : "Cadastro"}
              </span>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
                {isEditing ? "Editar incidente" : "Novo incidente"}
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-slate-500">
              {isEditing
                ? "Atualize os dados do incidente selecionado e salve as alterações."
                : "Registre o problema com informações objetivas para facilitar a análise técnica."}
            </p>
          </div>

          {isEditing && (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
              <strong className="block font-black">Modo de edição ativo</strong>
              <span className="mt-1 block text-sm text-slate-600">
                Você está editando um incidente existente. Para criar um novo,
                cancele a edição.
              </span>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
              <strong className="font-black">Revise os pontos abaixo:</strong>

              <div className="mt-2 grid gap-1">
                {errors.map((error) => (
                  <p key={error} className="text-sm">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <strong className="font-black">{successMessage}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="title" className="font-black text-slate-700">
                Título
              </label>
              <input
                id="title"
                type="text"
                className={inputClass}
                placeholder="Ex: Erro ao carregar painel administrativo"
                value={formData.title}
                onChange={(event) =>
                  setFormData({ ...formData, title: event.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="font-black text-slate-700">
                Descrição
              </label>
              <textarea
                id="description"
                className={`${inputClass} min-h-32 resize-y leading-7`}
                placeholder="Descreva o comportamento observado, impacto, contexto e passos para reprodução"
                value={formData.description}
                onChange={(event) =>
                  setFormData({ ...formData, description: event.target.value })
                }
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_220px_240px] lg:items-end">
              <div className="grid gap-2">
                <label htmlFor="severity" className="font-black text-slate-700">
                  Severidade
                </label>
                <select
                  id="severity"
                  className={selectClass}
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

              {isEditing && (
                <div className="grid gap-2">
                  <label htmlFor="status" className="font-black text-slate-700">
                    Status
                  </label>
                  <select
                    id="status"
                    className={selectClass}
                    value={formData.status}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        status: event.target.value as IncidentStatus,
                      })
                    }
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="EmAnalise">Em análise</option>
                    <option value="Resolvido">Resolvido</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="min-h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 font-black text-white shadow-xl shadow-blue-600/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-600/30"
              >
                {isEditing ? "Salvar alterações" : "Cadastrar incidente"}
              </button>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="min-h-11 rounded-2xl border border-slate-200 bg-white px-5 font-black text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 hover:shadow-lg"
                  onClick={cancelEdit}
                >
                  Cancelar edição
                </button>
              </div>
            )}
          </form>
        </section>

        <section
          id="incidentes"
          className="mt-5 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-7"
        >
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                Monitoramento
              </span>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
                Incidentes cadastrados
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {incidents.length} incidente(s) encontrado(s)
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[560px]">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filtrar por status"
                className={selectClass}
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
                className={selectClass}
              >
                <option value="">Todas as severidades</option>
                <option value="Baixa">Baixa</option>
                <option value="Media">Média</option>
                <option value="Alta">Alta</option>
                <option value="Critica">Crítica</option>
              </select>

              <button
                type="button"
                className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 font-black text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 hover:shadow-lg"
                onClick={clearFilters}
              >
                Limpar filtros
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 grid justify-items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <h3 className="text-lg font-black text-slate-900">
                Carregando incidentes...
              </h3>
              <p className="text-sm text-slate-500">
                Buscando dados atualizados na API.
              </p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="mt-6 grid justify-items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <span className="text-4xl">📭</span>
              <h3 className="text-lg font-black text-slate-900">
                Nenhum incidente encontrado
              </h3>
              <p className="max-w-md text-sm leading-6 text-slate-500">
                Cadastre um novo incidente ou ajuste os filtros utilizados.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {incidents.map((incident, index) => (
                <article
                  key={incident.id}
                  className="animate-fade-up overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-900/5 transition duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10"
                  style={{ animationDelay: `${index * 55}ms` }}
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="grid grid-cols-[14px_1fr] gap-4">
                      <span
                        className={`mt-2 h-3.5 w-3.5 rounded-full shadow-[0_0_0_7px] ${getStatusDotStyles(
                          incident.status
                        )}`}
                      />

                      <div>
                        <h3 className="text-lg font-black tracking-[-0.03em] text-slate-950">
                          {incident.title}
                        </h3>

                        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                          {incident.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black ${getSeverityStyles(
                        incident.severity
                      )}`}
                    >
                      {formatSeverity(incident.severity)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                        Status atual
                      </span>
                      <strong
                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${getStatusBadgeStyles(
                          incident.status
                        )}`}
                      >
                        {formatStatus(incident.status)}
                      </strong>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                        Criado em
                      </span>
                      <strong className="mt-2 block text-sm text-slate-800">
                        {new Date(incident.createdAt).toLocaleString("pt-BR")}
                      </strong>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                        Atualizar status
                      </span>
                      <select
                        value={incident.status}
                        className={`${selectClass} mt-2`}
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

                  <div className="mt-5 flex flex-col justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                    <button
                      type="button"
                      className="min-h-11 rounded-2xl border border-slate-200 bg-white px-5 font-black text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 hover:shadow-lg"
                      onClick={() => handleEditIncident(incident)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="min-h-11 rounded-2xl border border-red-200 bg-red-50 px-5 font-black text-red-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-lg"
                      onClick={() => handleDeleteIncident(incident.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;