import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const app = express();
const port = 3000;
// const port = process.env.PORT || 3000;

// redefine file and dirname for ESM module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname + "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
})

app.listen(port, () => {
  console.log(`Server has opened on port ${port}`);
});