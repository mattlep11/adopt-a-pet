import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { engine } from "express-handlebars";
import { router } from "./adoption-site/router.js"

export const app = express();
const port = 3000;
// const port = process.env.PORT || 3000;

// redefine file and dirname for ESM module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));
app.engine("handlebars", engine(
  { 
    defaultLayout: "main",
    helpers: {
      // indicates if the sidebar icon should be coloured or not
      active: (path, currentRoute) => {
        return path === currentRoute ? 'active' : '';
      }
    } 
  }
));
app.set("views", path.join(__dirname, "adoption-site", "views"));
app.set("view engine", "handlebars");

app.use("/", router);

app.listen(port, () => {
  console.log(`Server has opened on port ${port}`);
});