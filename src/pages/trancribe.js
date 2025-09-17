// src/pages/api/transcribe.js
import { processVideo } from '../../lib/processVideo';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    // Save uploaded file to a temp directory
    const uploadDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    form.uploadDir = uploadDir;
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { files } = await parseForm(req);
    const file = files.video;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Handle formidable v2+ array case
    const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;

    // Transcribe the uploaded video file
    const transcript = await processVideo(filePath);

    // Optionally, delete the temp file after processing
    fs.unlinkSync(filePath);

    res.status(200).json({ transcript });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}