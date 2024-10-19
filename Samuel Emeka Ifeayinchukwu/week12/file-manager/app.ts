import http from "node:http";
import FileParser from "./fileParser.ts";
import { QueueFromLinkedList } from "../../week7/assignments/queuefromlinkedlist.ts";

const fileParser = new FileParser();

interface IAppResponse extends http.ServerResponse {
  json: (jsonBody: any) => void;
  send: (body: any) => void;
  status: (statusCode: number) => IAppResponse;
}

class AppResponse extends http.ServerResponse implements IAppResponse {
  json(jsonBody: any) {
    this.setHeader("Content-Type", "application/json");
    this.write(JSON.stringify(jsonBody));
  }

  send(body: any) {
    this.end(body);
  }

  status(statusCode: number) {
    this.statusCode = statusCode;
    return this;
  }
}

interface IAppRequest extends http.IncomingMessage {
  body: any;
  params: any;
  file: any;
  files: any[];
}

class AppRequest extends http.IncomingMessage implements IAppRequest {
  body: any;
  file: any;
  files: any[];
  params: any;

  constructor(socket: any) {
    super(socket);
    this.body = null;
    this.file = null;
    this.files = [];
    this.params = {};
  }
}

export type NextHandler = (error?: Error) => void;

type methods = "GET" | "POST" | "PUT" | "DELETE";
type handlerType = (
  req: AppRequest,
  res: AppResponse,
  next: NextHandler
) => void;

interface listener {
  method: methods;
  path: string;
  handler: handlerType;
}

class App {
  private httpServer: http.Server;
  private middleWareQueue: QueueFromLinkedList<listener>;
  protected justVisitedHandlerReq: AppRequest | http.IncomingMessage | null;

  constructor() {
    this.httpServer = http.createServer(this.requestHandler.bind(this));
    this.middleWareQueue = new QueueFromLinkedList();
    this.justVisitedHandlerReq = null;
  }

  private createCustomResponse(res: http.ServerResponse): http.ServerResponse {
    res["json"] = function json(jsonBody: any) {
      this.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(jsonBody));
    };
    res["send"] = function send(body: any) {
      this.end(body);
    };

    res["status"] = function status(statusCode: number) {
      this.statusCode = statusCode;
      return this;
    };

    return res;
  }

  protected requestHandler(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) {
    if (this.justVisitedHandlerReq) req = this.justVisitedHandlerReq;
    const customRes = this.createCustomResponse(res);
    this.justVisitedHandlerReq = req;

    const runNextMiddleware = () => {
      let currentHandler = this.middleWareQueue.dequeue();
      if (currentHandler) {
        const path = currentHandler.path;
        const method = currentHandler.method;
        const handler = currentHandler.handler;

        const next: NextHandler = (error?: Error) => {
          if (error) {
            this.justVisitedHandlerReq = null;
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(error.message));
            return;
          }
          runNextMiddleware();
        };

        const parseRequest = () => {
          if (req.headers["content-type"] == "application/json") {
            this.parseRequestBody(req as AppRequest, () => {
              handler(req as AppRequest, customRes as AppResponse, next);
            });
          } else {
            fileParser.parseMultipartFormData(req as AppRequest, () => {
              handler(req as AppRequest, customRes as AppResponse, next);
            });
          }
        };
        if (currentHandler.method === req.method) {
          if (req.url === path) {
            if (method == "POST" || method == "PUT") {
              parseRequest();
            } else {
              handler(req as AppRequest, customRes as AppResponse, next);
            }
          } else if (
            Object.keys(this.getParams(path, req.url as string)).length
          ) {
            const params = this.getParams(path, req.url as string);
            this.parseRequestParams(req as AppRequest, params, () => {
              if (method == "POST" || method == "PUT") {
                parseRequest();
              } else {
                handler(req as AppRequest, customRes as AppResponse, next);
              }
            });
          } else {
            runNextMiddleware();
          }
        } else {
          runNextMiddleware();
        }
      }
    };
    runNextMiddleware();
  }

  private parseRequestBody(req: AppRequest, callback: () => void) {
    let bodyData = "";
    req.on("data", (chunk) => {
      bodyData += chunk.toString();
    });
    req.on("end", () => {
      try {
        req.body = JSON.parse(bodyData);
      } catch (error) {
        req.body = bodyData;
      }
      callback();
    });
  }

  private parseRequestParams(
    req: AppRequest,
    params: any,
    callback: () => void
  ) {
    req.params = params;
    callback();
  }

  private getParams(path: string, url: string) {
    const params: any = {};
    const pathSegments = path.split("/");
    const urlSegments = url.split("/");

    const pathRegex = path.replace(/:[^/]+/g, "([^/]+)");
    const regex = new RegExp(`^${pathRegex}$`);
    const match = url.match(regex);

    if (match) {
      pathSegments.forEach((segment, index) => {
        if (segment.startsWith(":")) {
          const paramName = segment.slice(1);
          params[paramName] = urlSegments[index];
        }
      });
    }

    return params;
  }

  get(path: string, ...requestListeners: handlerType[]) {
    const method = "GET";
    for (const handler of requestListeners) {
      const listener: listener = {
        path,
        method,
        handler,
      };
      this.middleWareQueue.enqueue(listener);
    }
  }

  post(path: string, ...requestListeners: handlerType[]) {
    const method = "POST";
    for (const handler of requestListeners) {
      const listener: listener = {
        path,
        method,
        handler,
      };
      this.middleWareQueue.enqueue(listener);
    }
  }

  put(path: string, ...requestListeners: handlerType[]) {
    const method = "PUT";
    for (const handler of requestListeners) {
      const listener: listener = {
        path,
        method,
        handler,
      };
      this.middleWareQueue.enqueue(listener);
    }
  }

  delete(path: string, ...requestListeners: handlerType[]) {
    const method = "DELETE";
    for (const handler of requestListeners) {
      const listener: listener = {
        path,
        method,
        handler,
      };
      this.middleWareQueue.enqueue(listener);
    }
  }

  listen(port: number, callback: () => void) {
    this.httpServer.listen(port, callback);
  }
}

export { App, AppRequest, AppResponse };
