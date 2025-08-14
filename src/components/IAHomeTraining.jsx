// src/components/IAHomeTraining.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Play, Pause, SkipForward, CheckCircle2, XCircle, ChevronDown, ChevronUp, TimerReset, Flag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Detecta base de API: si hay VITE_API_URL lo usa, si no usa el mismo origen
const API_BASE = import.meta?.env?.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api`
  : "/api";

/**
 * IAHomeTraining.jsx
 * - Muestra modal “La IA está comprobando tu perfil…”
 * - Llama a /api/ia/home-training/generate-today (userId + equipamiento + tipo)
 * - Encabezado: “HIIT en Casa” (sin “Semana Actual”) + subtítulo
 * - Player (trabajo/descanso o reps)
 * - Al terminar (o al pulsar “Terminar ahora”) registra la sesión en /api/ia/home-training/log-session
 *
 * Props:
 *  - equipamiento: "minimo" | "basico" | "avanzado"
 *  - tipo: "funcional" | "hiit" | "fuerza"
 *  - autoStart?: boolean
 */
export default function IAHomeTraining({
  equipamiento = "minimo",
  tipo = "hiit",
  autoStart = false,
}) {
  const { getCurrentUserInfo } = useAuth();
  const userInfo = getCurrentUserInfo?.();
  const userId = userInfo?.id || userInfo?.userId || userInfo?.uid;

  // --- Estado de datos de IA ---
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  // --- Estado del Player ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSerie, setCurrentSerie] = useState(1);
  const [phase, setPhase] = useState("idle"); // "idle" | "work" | "rest" | "done"
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const tickRef = useRef(null);

  // Track de series completadas por ejercicio
  const [seriesCompleted, setSeriesCompleted] = useState([]);

  // Control de guardado de sesión
  const [saveState, setSaveState] = useState({ status: "idle", message: "" }); // idle | saving | saved | error
  const loggedRef = useRef(false);

  // Métricas de duración real (de la sesión)
  const sessionStartAtRef = useRef(null);   // timestamp (ms)
  const pausedAccumRef = useRef(0);         // ms acumulados en pausa
  const pausedAtRef = useRef(null);         // timestamp cuando se pausó

  // Para plegado/desplegado del listado
  const [openIndex, setOpenIndex] = useState(null);

  // Normaliza cadenas
  const tipoCanon = String(tipo || "").toLowerCase();
  const equipCanon = String(equipamiento || "").toLowerCase();

  // ---------------------------------------------------------------------------
  // Helpers duración
  // ---------------------------------------------------------------------------
  const ensureSessionStarted = useCallback(() => {
    // Si la sesión aún no tiene inicio, lo marcamos ahora
    if (!sessionStartAtRef.current) {
      sessionStartAtRef.current = Date.now();
    }
  }, []);

  const handlePauseResumeAccounting = useCallback((running) => {
    // running=true: reanuda -> sumar tiempo pausado a acumulado
    // running=false: pausa -> marcar timestamp de pausa
    if (running) {
      ensureSessionStarted();
      if (pausedAtRef.current) {
        pausedAccumRef.current += Date.now() - pausedAtRef.current;
        pausedAtRef.current = null;
      }
    } else {
      if (sessionStartAtRef.current && !pausedAtRef.current) {
        pausedAtRef.current = Date.now();
      }
    }
  }, [ensureSessionStarted]);

  const computeDurationSeconds = useCallback(() => {
    if (!sessionStartAtRef.current) return 0;
    const now = Date.now();
    const pausedExtra = pausedAtRef.current ? (now - pausedAtRef.current) : 0;
    const ms = now - sessionStartAtRef.current - pausedAccumRef.current - pausedExtra;
    return Math.max(0, Math.round(ms / 1000));
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch plan de HOY
  // ---------------------------------------------------------------------------
  const fetchTodayPlan = useCallback(async () => {
    if (!userId) {
      setError("No se encontró el usuario autenticado.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ia/home-training/generate-today`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          equipamiento: equipCanon,
          tipoEntrenamiento: tipoCanon,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Error al generar el entrenamiento.");
      }

      const json = await res.json();
      const data = json?.data || null;

      // Sanitiza ejercicios
      const ejercicios = Array.isArray(data?.ejercicios) ? data.ejercicios.map((e) => ({
        nombre: e?.nombre || "Ejercicio",
        tipo: (e?.tipo === "time" || e?.tipo === "reps") ? e.tipo : (e?.duracion_seg ? "time" : "reps"),
        series: Number(e?.series) > 0 ? Number(e.series) : 3,
        repeticiones: e?.repeticiones ?? null,
        duracion_seg: Number(e?.duracion_seg) > 0 ? Number(e.duracion_seg) : null,
        descanso_seg: Number(e?.descanso_seg) >= 0 ? Number(e.descanso_seg) : 45,
        notas: e?.notas || "",
      })) : [];

      const parsedPlan = {
        titulo: data?.titulo || `${tipoCanon.toUpperCase()} en Casa`,
        subtitulo: data?.subtitulo || "Entrenamiento personalizado adaptado a tu equipamiento",
        fecha: data?.fecha || new Date().toISOString().slice(0, 10),
        equipamiento: data?.equipamiento || equipCanon,
        tipoEntrenamiento: data?.tipoEntrenamiento || tipoCanon,
        duracion_estimada_min: Number(data?.duracion_estimada_min) || 30,
        ejercicios,
      };

      setPlan(parsedPlan);
      setLoading(false);

      // Inicializa player
      setCurrentIndex(0);
      setCurrentSerie(1);
      setPhase("idle");
      setSecondsLeft(0);
      setIsRunning(autoStart ? true : false);
      setSeriesCompleted(Array(ejercicios.length).fill(0));

      // Reset métricas de sesión
      loggedRef.current = false;
      setSaveState({ status: "idle", message: "" });
      sessionStartAtRef.current = null;
      pausedAccumRef.current = 0;
      pausedAtRef.current = null;

      // Si autoStart arranca en true, marcamos inicio y “reanudar”
      if (autoStart) {
        ensureSessionStarted();
        handlePauseResumeAccounting(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al generar el entrenamiento.");
      setLoading(false);
    }
  }, [userId, equipCanon, tipoCanon, autoStart, ensureSessionStarted, handlePauseResumeAccounting]);

  useEffect(() => {
    fetchTodayPlan();
  }, [fetchTodayPlan]);

  // ---------------------------------------------------------------------------
  // Lógica del player (interval)
  // ---------------------------------------------------------------------------
  const incSeries = useCallback((idx) => {
    setSeriesCompleted(prev => {
      const arr = [...prev];
      const maxSeries = plan?.ejercicios?.[idx]?.series || 1;
      arr[idx] = Math.min((arr[idx] || 0) + 1, maxSeries);
      return arr;
    });
  }, [plan]);

  useEffect(() => {
    if (!plan || !plan.ejercicios?.length) return;
    if (!isRunning) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }

    // Si estamos en idle y es time, arrancamos fase de trabajo; si es reps, no se autoarranca
    const ex = plan.ejercicios[currentIndex];
    if (phase === "idle") {
      if (ex.tipo === "time") {
        setPhase("work");
        setSecondsLeft(ex.duracion_seg || 30);
      } else {
        // reps: espera acción manual
      }
    }

    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (phase === "work" || phase === "rest") {
          if (s <= 1) {
            // Al acabar trabajo, contamos la serie
            if (phase === "work") {
              incSeries(currentIndex);
              const rest = ex.descanso_seg || 30;
              if (rest > 0) {
                setPhase("rest");
                return rest;
              } else {
                // Sin descanso, avanzar
                advanceAfterRestOrWork();
                return 0;
              }
            } else if (phase === "rest") {
              // Termina descanso y avanza
              advanceAfterRestOrWork();
              return 0;
            }
          }
          return s - 1;
        }
        return s;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, currentIndex, currentSerie, plan, incSeries]);

  const advanceAfterRestOrWork = useCallback(() => {
    const ex = plan.ejercicios[currentIndex];
    const totalSeries = ex.series || 3;
    // Ojo: la serie ya se incrementó cuando terminó "work"
    const doneSeries = seriesCompleted[currentIndex] || 0;

    if (doneSeries < totalSeries) {
      setCurrentSerie(doneSeries + 1);
      if (ex.tipo === "time") {
        setPhase("work");
        setSecondsLeft(ex.duracion_seg || 30);
      } else {
        setPhase("idle"); // para reps sigue siendo manual
        setSecondsLeft(0);
      }
    } else {
      // avanzar al siguiente ejercicio
      goNextExercise();
    }
  }, [plan, currentIndex, seriesCompleted]);

  const goNextExercise = useCallback(() => {
    const next = currentIndex + 1;
    if (next < (plan?.ejercicios?.length || 0)) {
      setCurrentIndex(next);
      // colocar serie actual a la que corresponda (1 o la que tenga hecha)
      const nextDone = seriesCompleted[next] || 0;
      setCurrentSerie(Math.min(nextDone + 1, plan.ejercicios[next].series || 1));
      const ex = plan.ejercicios[next];
      if (ex.tipo === "time") {
        setPhase("work");
        setSecondsLeft(ex.duracion_seg || 30);
      } else {
        setPhase("idle");
        setSecondsLeft(0);
      }
    } else {
      // fin del entrenamiento
      setPhase("done");
      setIsRunning(false);
    }
  }, [currentIndex, plan, seriesCompleted]);

  const skipExercise = useCallback(() => {
    goNextExercise();
  }, [goNextExercise]);

  const toggleRun = useCallback(() => {
    setIsRunning((s) => {
      const next = !s;
      handlePauseResumeAccounting(next);
      if (next) ensureSessionStarted();
      return next;
    });
  }, [handlePauseResumeAccounting, ensureSessionStarted]);

  const restartExercise = useCallback(() => {
    const ex = plan?.ejercicios?.[currentIndex];
    if (!ex) return;
    // no tocamos el contador de series completadas
    if (ex.tipo === "time") {
      setPhase("work");
      setSecondsLeft(ex.duracion_seg || 30);
    } else {
      setPhase("idle");
      setSecondsLeft(0);
    }
    setIsRunning(false);
    handlePauseResumeAccounting(false);
  }, [plan, currentIndex, handlePauseResumeAccounting]);

  const markRepSerieDone = useCallback(() => {
    const ex = plan?.ejercicios?.[currentIndex];
    if (!ex || ex.tipo !== "reps") return;

    // arrancar sesión si aún no estaba iniciada
    ensureSessionStarted();

    // contamos la serie
    incSeries(currentIndex);
    const totalSeries = ex.series || 3;

    const doneSeries = (seriesCompleted[currentIndex] || 0) + 0; // incSeries se aplicará async; usamos cálculo inmediato en flujo
    const rest = ex.descanso_seg || 45;

    if (doneSeries < totalSeries) {
      // descanso entre series
      setPhase("rest");
      setSecondsLeft(rest);
      setIsRunning(true);
      handlePauseResumeAccounting(true);
      setCurrentSerie(doneSeries + 1);
    } else {
      // última serie -> siguiente
      goNextExercise();
    }
  }, [plan, currentIndex, seriesCompleted, incSeries, goNextExercise, ensureSessionStarted, handlePauseResumeAccounting]);

  // ---------------------------------------------------------------------------
  // Guardado de sesión (auto cuando termina)
  // ---------------------------------------------------------------------------
  const totalExercises = plan?.ejercicios?.length || 0;
  const exercisesFullyCompleted = useMemo(() => {
    if (!plan) return 0;
    return plan.ejercicios.reduce((acc, ex, idx) => {
      const done = seriesCompleted[idx] || 0;
      return acc + (done >= (ex.series || 1) ? 1 : 0);
    }, 0);
  }, [plan, seriesCompleted]);


  const logSession = useCallback(
    async (status = "completed") => {
      if (!userId || !plan) {
        const msg = "No hay usuario o plan disponible. Sesión no guardada.";
        console.warn(msg);
        setSaveState({ status: "error", message: msg });
        return;
      }

      try {
        setSaveState({ status: "saving", message: "" });

        const duracion_real_seg = computeDurationSeconds();
        const metrics = {
          duracion_estimada_min: plan.duracion_estimada_min,
          duracion_real_seg,
          total_ejercicios: totalExercises,
          completados: exercisesFullyCompleted,
          status,
        };

        const body = {
          userId,
          plan,
          metrics,
          seriesCompleted,
          startedAt: sessionStartAtRef.current,
          finishedAt: Date.now(),
        };

        const res = await fetch(`${API_BASE}/ia/home-training/log-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const msg =
            (await res.json().catch(() => ({})))?.error ||
            "No se pudo guardar la sesión.";
          throw new Error(msg);
        }

        setSaveState({ status: "saved", message: "Sesión guardada ✅" });
        loggedRef.current = true;
      } catch (e) {
        console.error(e);
        setSaveState({
          status: "error",
          message: e?.message || "Error al guardar la sesión",
        });
      }
    },
    [
      userId,
      plan,
      totalExercises,
      exercisesFullyCompleted,
      seriesCompleted,
      computeDurationSeconds,
    ]
  );

  // Auto-guardar cuando el player termine
  useEffect(() => {
    if (phase === "done" && plan && !loggedRef.current) {
      logSession("completed");
    }
  }, [phase, plan, logSession]);

  // Botón “Terminar ahora”
  const finishNow = useCallback(async () => {
    if (phase === "done") return;
    // Pausar el conteo y cerrar
    setIsRunning(false);
    handlePauseResumeAccounting(false);
    setPhase("done");
    // Guardar como parcial
    await logSession("partial");
  }, [phase, logSession, handlePauseResumeAccounting]);

  // ---------------------------------------------------------------------------
  // Derivados de UI
  // ---------------------------------------------------------------------------
  const completedExercises = useMemo(() => {
    // Para barra de progreso visual:
    // ejercicios finalizados completamente + si estamos “done”, todos
    return phase === "done" ? totalExercises : exercisesFullyCompleted;
  }, [phase, totalExercises, exercisesFullyCompleted]);

  const progressPct = totalExercises ? Math.min(100, Math.round((completedExercises / totalExercises) * 100)) : 0;

  const Header = () => (
    <div className="bg-[#0d1522] border border-yellow-400/20 rounded-xl p-5 md:p-6">
      <div className="flex items-center gap-3 text-yellow-300 text-lg md:text-xl font-semibold">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-300/30">⏱</span>
        {plan?.titulo || `${tipoCanon.toUpperCase()} en Casa`}
      </div>
      <p className="mt-1 text-sm text-gray-300">{plan?.subtitulo || "Entrenamiento personalizado adaptado a tu equipamiento"}</p>

      {/* Progress */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Progreso</span>
          <span>{progressPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-700/60 overflow-hidden">
          <div className="h-2 bg-yellow-400 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Meta */}
      <div className="mt-4 text-xs text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
        <span><b className="text-gray-200">Fecha:</b> {plan?.fecha}</span>
        <span><b className="text-gray-200">Equipo:</b> {plan?.equipamiento}</span>
        <span><b className="text-gray-200">Tipo:</b> {plan?.tipoEntrenamiento}</span>
        <span><b className="text-gray-200">Duración estimada:</b> {plan?.duracion_estimada_min} min</span>
      </div>

      {/* Estado de guardado */}
      {saveState.status !== "idle" && (
        <div className={`mt-4 text-sm rounded-lg border px-3 py-2 ${
          saveState.status === "saving" ? "border-yellow-400/40 text-yellow-300 bg-yellow-400/10" :
          saveState.status === "saved" ? "border-green-500/40 text-green-300 bg-green-500/10" :
          "border-red-500/40 text-red-300 bg-red-500/10"
        }`}>
          {saveState.status === "saving" && <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Guardando sesión…</span>}
          {saveState.status === "saved" && <span>Sesión guardada ✅</span>}
          {saveState.status === "error" && (
            <span className="inline-flex items-center gap-2">
              {saveState.message || "No se pudo guardar."}
              <button
                onClick={() => logSession(phase === "done" ? "completed" : "partial")}
                className="ml-2 underline hover:opacity-80"
              >
                Reintentar
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );

  const ExercisePlayer = () => {
    const ex = plan?.ejercicios?.[currentIndex];
    if (!ex) return null;

    const totalSeries = ex.series || 3;
    const isTime = ex.tipo === "time";
    const doneSeries = seriesCompleted[currentIndex] || 0;

    return (
      <div className="bg-[#0d1522] border border-yellow-400/20 rounded-xl mt-6">
        {/* Cabezera del ejercicio activo */}
        <div className="p-5 md:p-6 border-b border-gray-700/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-gray-400">Ejercicio {currentIndex + 1} de {totalExercises}</div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-100">{ex.nombre}</h3>
              <div className="mt-1 text-xs text-gray-400">
                <span className="mr-3"><b className="text-gray-200">Series:</b> {Math.min(doneSeries + (phase !== "done" ? 1 : 0), totalSeries)}/{totalSeries}</span>
                {isTime ? (
                  <span><b className="text-gray-200">Trabajo:</b> {ex.duracion_seg ?? 30}s · <b className="text-gray-200">Descanso:</b> {ex.descanso_seg ?? 30}s</span>
                ) : (
                  <span><b className="text-gray-200">Repeticiones:</b> {ex.repeticiones ?? "12"}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-200 hover:bg-gray-700"
                onClick={restartExercise}
                title="Reiniciar ejercicio"
              >
                <TimerReset className="w-4 h-4" />
              </button>
              {phase !== "done" && (
                <button
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isRunning ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-yellow-400 text-black hover:bg-yellow-300"} font-medium`}
                  onClick={toggleRun}
                >
                  {isRunning ? <><Pause className="w-4 h-4" /> Pausar</> : <><Play className="w-4 h-4" /> Iniciar</>}
                </button>
              )}
              {phase !== "done" && (
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-200 hover:bg-gray-700"
                  onClick={skipExercise}
                >
                  <SkipForward className="w-4 h-4" /> Saltar
                </button>
              )}
              {phase !== "done" && (
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/90 text-white hover:bg-red-500"
                  onClick={finishNow}
                  title="Terminar ahora (guardará como parcial)"
                >
                  <Flag className="w-4 h-4" /> Terminar ahora
                </button>
              )}
            </div>
          </div>

          {/* Panel de conteo */}
          <div className="mt-5 flex items-center justify-center">
            {phase === "done" ? (
              <div className="flex items-center gap-2 text-green-400 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                ¡Entrenamiento completado!
              </div>
            ) : isTime ? (
              <div className="text-center">
                <div className="text-5xl font-bold tabular-nums text-yellow-300">{secondsLeft}s</div>
                <div className="mt-1 text-sm text-gray-400">{phase === "work" ? "Trabajo" : phase === "rest" ? "Descanso" : "Listo"}</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl font-semibold text-gray-100">{ex.repeticiones ?? "—"}</div>
                <div className="mt-1 text-sm text-gray-400">Repeticiones objetivo</div>
                <button
                  onClick={markRepSerieDone}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-black font-medium hover:bg-green-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Marcar serie completada
                </button>
              </div>
            )}
          </div>

          {ex.notas ? (
            <div className="mt-4 text-xs text-gray-400"><b className="text-gray-300">Notas:</b> {ex.notas}</div>
          ) : null}
        </div>

        {/* Lista de ejercicios con acordeón */}
        <div className="divide-y divide-gray-700/60">
          {plan.ejercicios.map((item, idx) => {
            const active = idx === currentIndex;
            const isOpen = openIndex === idx || active;
            return (
              <div key={`${item.nombre}-${idx}`} className={`p-4 md:p-5 ${active ? "bg-gray-900/40" : ""}`}>
                <button
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
                >
                  <div>
                    <div className="text-sm text-gray-400">#{idx + 1} · {item.tipo === "time" ? "Tiempo" : "Reps"}</div>
                    <div className="font-medium text-gray-100">{item.nombre}</div>
                  </div>
                  <div className="ml-4 shrink-0 text-gray-400">{isOpen ? <ChevronUp /> : <ChevronDown />}</div>
                </button>

                {isOpen && (
                  <div className="mt-3 text-xs text-gray-300">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span><b className="text-gray-200">Series:</b> {item.series}</span>
                      {item.tipo === "time" ? (
                        <>
                          <span><b className="text-gray-200">Trabajo:</b> {item.duracion_seg ?? 30}s</span>
                          <span><b className="text-gray-200">Descanso:</b> {item.descanso_seg ?? 30}s</span>
                        </>
                      ) : (
                        <span><b className="text-gray-200">Reps:</b> {item.repeticiones ?? "12"}</span>
                      )}
                    </div>
                    {item.notas ? <div className="mt-2 text-gray-400">Notas: {item.notas}</div> : null}
                    {idx !== currentIndex && phase !== "done" && (
                      <button
                        onClick={() => {
                          setCurrentIndex(idx);
                          // no modificamos seriesCompleted; actualizamos UI de serie visible
                          const nextDone = seriesCompleted[idx] || 0;
                          setCurrentSerie(Math.min(nextDone + 1, item.series || 1));
                          if (item.tipo === "time") {
                            setPhase("work");
                            setSecondsLeft(item.duracion_seg || 30);
                            setIsRunning(false);
                            handlePauseResumeAccounting(false);
                          } else {
                            setPhase("idle");
                            setSecondsLeft(0);
                            setIsRunning(false);
                            handlePauseResumeAccounting(false);
                          }
                        }}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200 text-xs"
                      >
                        Ir a este ejercicio
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
        <div className="max-w-md w-full bg-[#0b1220] border border-yellow-400/20 rounded-xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-300/30 mb-3">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">La IA está comprobando tu perfil…</h3>
          <p className="mt-1 text-sm text-gray-400">
            Preparando tu mejor entrenamiento para hoy según tu equipamiento y nivel.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0d1522] border border-red-500/30 text-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 font-medium"><XCircle className="w-4 h-4" /> {error}</div>
        <button
          onClick={fetchTodayPlan}
          className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/20 border border-red-500/40 text-red-100 hover:bg-red-500/30"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div>
      <Header />
      <ExercisePlayer />
    </div>
  );
}
