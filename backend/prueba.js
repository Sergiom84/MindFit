// archivo prueba.js
import express from 'express'
const app = express()
app.get('/ping', (req, res) => res.json({ pong: true }))
app.listen(5050, () => console.log('Escuchando en 5050'))
