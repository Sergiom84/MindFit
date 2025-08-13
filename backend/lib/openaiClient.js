// backend/lib/openaiClient.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Carga variables de entorno lo antes posible
dotenv.config();

let client = null;

/**
 * Devuelve una única instancia reutilizable del cliente de OpenAI.
 * Si falta la OPENAI_API_KEY, devuelve null (y el endpoint responderá 503 sin crashear).
 */
export function getOpenAI() {
  if (client) return client;

  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === '') {
    console.warn('⚠️ OPENAI_API_KEY no está configurada; funciones de IA desactivadas.');
    return null;
  }

  client = new OpenAI({ apiKey: key });
  return client;
}
