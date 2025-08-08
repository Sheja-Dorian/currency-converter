// server.js — simple static server to serve frontend on configurable PORT
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const STATIC_DIR = path.join(__dirname, 'frontend');
app.use(express.static(STATIC_DIR));
// default route
app.get('/', (req,res)=>res.sendFile(path.join(STATIC_DIR,'index.html')));
app.listen(PORT, ()=>console.log(`Server listening on port ${PORT}`));