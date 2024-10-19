import { Buffer } from "node:buffer";
import { AppRequest } from "./app.ts";

class FileParser {
  private getBoundary(contentType: string): string {
    const items = contentType.split(";");
    for (let i = 0; i < items.length; i++) {
      const item = items[i].trim();
      if (item.startsWith("boundary=")) {
        return item.slice(9);
      }
    }
    return "";
  }

  parseMultipartFormData(req: AppRequest, callback: () => void) {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      callback();
      return;
    }

    const boundary = `--${this.getBoundary(contentType)}`;
    const boundaryBuffer = Buffer.from(boundary);
    const chunks: Buffer[] = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      const rawBody = Buffer.concat(chunks);
      let currentPosition = 0;

      while (true) {
        const boundaryIndex = rawBody.indexOf(boundaryBuffer, currentPosition);
        if (boundaryIndex === -1) break;

        currentPosition = boundaryIndex + boundaryBuffer.length;

        const nextBoundaryIndex = rawBody.indexOf(
          boundaryBuffer,
          currentPosition
        );
        if (nextBoundaryIndex === -1) break;

        const partBuffer = rawBody.slice(currentPosition, nextBoundaryIndex);
        const headersEndIndex = partBuffer.indexOf("\r\n\r\n");
        if (headersEndIndex === -1) continue;

        const headersBuffer = partBuffer.slice(0, headersEndIndex).toString();
        const bodyBuffer = partBuffer.slice(
          headersEndIndex + 4,
          partBuffer.length - 2
        );

        const disposition = headersBuffer.match(/Content-Disposition: (.+)/);
        if (disposition && disposition[1].includes("filename")) {
          const filenameMatch = /filename="([^"]+)"/.exec(disposition[1]);
          const filename = filenameMatch ? filenameMatch[1] : null;

          if (filename) {
            const contentTypeMatch = headersBuffer.match(/Content-Type: (.+)/);
            const contentType = contentTypeMatch
              ? contentTypeMatch[1]
              : "application/octet-stream";

            const fileSize = bodyBuffer.byteLength

            req.files = req.files || [];
            req.files.push({ filename, contentType, fileBuffer: bodyBuffer, size: fileSize });
          }
        } else {
          const nameMatch = /name="([^"]+)"/.exec(
            disposition ? disposition[1] : ""
          );
          if (nameMatch) {
            const fieldName = nameMatch[1];
            if (!req.body) req.body = {};
            req.body[fieldName] = bodyBuffer.toString();
          }
        }

        currentPosition = nextBoundaryIndex;
      }
      callback();
    });
  }
}

export default FileParser;
