import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const getOpenAI = () => {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'tu_api_key_de_openai_aqui') {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
};

// Generate pose feedback from metrics
router.post('/pose-feedback', async (req, res) => {
  try {
    const { metrics = {}, userVariables = {} } = req.body || {};
    const openai = getOpenAI();
    if (!openai) return res.status(503).json({ success:false, error:'OpenAI no configurado' });

    const usuario = userVariables.usuario || 'Usuario';
    const nivel = userVariables.nivel || 'principiante';
    const ejercicio = metrics.ejercicio || 'ejercicio';
    const errores = Array.isArray(metrics.erroresDetectados) ? metrics.erroresDetectados.join(', ') : 'ninguno';
    const datos = [];
    if (metrics.anguloMinRodilla) datos.push(`Ángulo mínimo de rodilla: ${metrics.anguloMinRodilla}°`);
    if (metrics.tempoConc && metrics.tempoEcc) datos.push(`Tempo concéntrico: ${metrics.tempoConc}s, excéntrico: ${metrics.tempoEcc}s`);
    if (metrics.precision) datos.push(`Precisión general: ${metrics.precision}%`);
    if (metrics.repeticiones) datos.push(`Repeticiones completadas: ${metrics.repeticiones}`);

    const messages = [
      { role: 'system', content: 'Eres un entrenador personal experto en biomecánica. Da feedback técnico, claro y seguro.' },
      { role: 'user', content: `Usuario: ${usuario}\nNivel: ${nivel}\nEjercicio: ${ejercicio}\nErrores: ${errores}\nDatos: ${datos.join(' | ')}` }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.6,
      max_tokens: 600
    });

    const content = completion.choices?.[0]?.message?.content || '';
    res.json({ success:true, feedback: content, timestamp: new Date().toISOString() });
  } catch (e) {
    console.error('Error pose-feedback:', e);
    res.status(500).json({ success:false, error: e.message || 'Error interno' });
  }
});

export default router;
