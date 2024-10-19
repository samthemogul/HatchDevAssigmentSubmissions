import { App } from "./app.ts";
import fs from "node:fs";
import { Buffer } from "node:buffer";
import path from "node:path";
import crypto from "node:crypto";

const app = new App();

app.post("/upload", (req, res, next) => {
  const files = req.files;
  const { desc } = req.body;
  try {
    if (files) {
      for (const file of files) {
        const { filename, contentType, fileBuffer, size } = file;
        const uniqueName = crypto.randomBytes(16).toString("hex");
        const metadata = {
          name: uniqueName,
          filename,
          size,
          type: contentType,
          description: desc ? desc : "",
          createdAt: new Date().toISOString(),
        };
        const metaBuffer = Buffer.from(
          JSON.stringify(metadata, null, 2),
          "utf8"
        );
        fs.writeFileSync(`./file-store/${filename}`, fileBuffer, "binary");
        fs.writeFileSync(
          `./metadata/${filename}.metadata.json`,
          metaBuffer
        );
        res.status(201).json({ message: `File uploaded successfully` });
      }
    } else {
      res.status(400).json({ message: "No files were uploaded" });
    }
  } catch (error) {
    next(error);
  }
});

app.get("/files/:filename", (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join("./file-store", filename);
  try {
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath, "binary");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Type", "application/octet-stream");
      res.send(fileBuffer);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    next(error);
  }
});

app.get("/files/:filename/metadata", (req, res, next) => {
  const { filename } = req.params;
  const metaPath = path.resolve("./metadata", `./${filename}.metadata.json`);
  try {
    if (fs.existsSync(metaPath)) {
      const metaBuffer = fs.readFileSync(metaPath, "utf8");
      const metadata = JSON.parse(metaBuffer);
      res.status(200).json(metadata);
    }
  } catch (error) {
    next(error);
  }
});

app.delete("/files/:filename/delete", (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join("./file-store", filename);
  const metaPath = path.join("./metadata", `${filename}.metadata.json`);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      if (fs.existsSync(metaPath)) {
        fs.unlinkSync(metaPath);
      }
      res.status(200).json({ message: "File deleted successfully" });
    }
  } catch (error) {
    next(error);
  }
});

app.get("/files", (req, res, next) => {
  const files = fs.readdirSync("./file-store");
  try {
    if(files.length == 0){
      res.status(200).json({message: "No files found"});
    } else {
      res.status(200).json({ files: files});
    }
  } catch (error) {
    next(error)
  }
})

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
