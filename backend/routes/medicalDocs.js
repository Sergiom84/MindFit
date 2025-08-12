import express from 'express';
// Nota: Requiere la columna jsonb en la tabla users:
//   ALTER TABLE users ADD COLUMN IF NOT EXISTS historial_medico_docs jsonb;

import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { query } from '../db.js';

const router = express.Router();

// Garantiza que la columna exista (idempotente)
const ensureDocsColumn = async () => {
  try {
    await query("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS historial_medico_docs jsonb");
    await query("ALTER TABLE public.users ALTER COLUMN historial_medico_docs SET DEFAULT '[]'::jsonb");
  } catch (e) {
    // log suave; no bloquear
    console.warn('⚠️ No se pudo asegurar historial_medico_docs:', e.message);
  }
};

// Storage para PDFs de documentación médica
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.id;
    const dest = path.join('uploads', 'medical', String(userId));
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${ts}-${safe}`);
  }
});

const uploadPdf = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    return cb(new Error('Solo se permiten archivos PDF'));
  }
});

// GET: listar documentos
router.get('/users/:id/medical-docs', async (req, res) => {
  try {
    await ensureDocsColumn();
    const userId = req.params.id;
    const result = await query('SELECT historial_medico_docs FROM public.users WHERE id=$1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    const docs = result.rows[0].historial_medico_docs || [];
    return res.json({ success: true, docs });
  } catch (e) {
    console.error('Error listando docs médicos:', e);
    return res.status(500).json({ success: false, error: e.message || 'Error interno' });
  }
});

// POST: subir PDF y anexar metadatos en jsonb
router.post('/users/:id/medical-docs', uploadPdf.single('file'), async (req, res) => {
  try {
    await ensureDocsColumn();
    const userId = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'Archivo no recibido' });

    const url = `/uploads/medical/${userId}/${file.filename}`;
    // Obtener docs actuales
    const current = await query('SELECT historial_medico_docs FROM public.users WHERE id=$1', [userId]);
    if (current.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

    const prev = current.rows[0].historial_medico_docs || [];
    const doc = {
      id: String(Date.now()),
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      url,
      uploadedAt: new Date().toISOString(),
      ai: null
    };
    const next = [...prev, doc];

    await query('UPDATE public.users SET historial_medico_docs=$1, updated_at=NOW() WHERE id=$2', [JSON.stringify(next), userId]);

    return res.json({ success: true, doc, docs: next });
  } catch (e) {
    console.error('Error subiendo doc médico:', e);
    return res.status(500).json({ success: false, error: e.message || 'Error interno' });
  }
});

// POST: extraer texto del PDF (requiere pdf-parse)
router.post('/users/:id/medical-docs/:docId/extract', async (req, res) => {
  try {
    const { id, docId } = req.params;
    const result = await query('SELECT historial_medico_docs FROM public.users WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    const docs = result.rows[0].historial_medico_docs || [];
    const doc = docs.find(d => String(d.id) === String(docId));
    if (!doc) return res.status(404).json({ success: false, error: 'Documento no encontrado' });

    const filePath = path.join(process.cwd(), doc.url.replace(/^\//, ''));

    let pdfParse;
    try {
      pdfParse = (await import('pdf-parse')).default;
    } catch (e) {
      return res.status(501).json({ success: false, error: 'pdf-parse no instalado' });
    }

    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(dataBuffer);
    return res.json({ success: true, plainText: parsed.text || '' });
  } catch (e) {
    console.error('Error extrayendo texto de PDF:', e);
    return res.status(500).json({ success: false, error: e.message || 'Error interno' });
  }
});

export default router;

