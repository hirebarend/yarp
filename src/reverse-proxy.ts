import * as http from 'http';
import * as https from 'https';
import { Router } from './router';

export class ReverseProxy {
  protected httpServer: http.Server | null = null;

  protected httpAgent: http.Agent = new http.Agent();

  protected httpsAgent: https.Agent = new https.Agent();

  constructor(
    protected ports: { http: number; https: number },
    protected router: Router
  ) {
    this.initialize();
  }

  protected httpRequestListener(
    httpIncomingMessageSource: http.IncomingMessage,
    httpServerResponse: http.ServerResponse
  ) {
    const route = this.router.get(
      httpIncomingMessageSource.headers.host || '',
      httpIncomingMessageSource.method || '',
      httpIncomingMessageSource.url || ''
    );

    if (route.protocol === 'http:') {
      const request = http.request(
        {
          agent: this.httpAgent,
          headers: {
            ...httpIncomingMessageSource.headers,
            host: route.host, // TODO
          },
          host: route.host,
          method: httpIncomingMessageSource.method,
          path: httpIncomingMessageSource.url,
        },
        (httpIncomingMessageDestination) => {
          for (const headerName in httpIncomingMessageDestination.headers) {
            httpServerResponse.setHeader(
              headerName,
              httpIncomingMessageDestination.headers[headerName] || ''
            );
          }

          httpIncomingMessageDestination.pipe(httpServerResponse);
        }
      );

      httpIncomingMessageSource.pipe(request);
    }

    if (route.protocol === 'https:') {
      const request = https.request(
        {
          agent: this.httpsAgent,
          headers: {
            ...httpIncomingMessageSource.headers,
            host: route.host, // TODO
          },
          host: route.host,
          method: httpIncomingMessageSource.method,
          path: httpIncomingMessageSource.url,
        },
        (httpIncomingMessageDestination) => {
          for (const headerName in httpIncomingMessageDestination.headers) {
            httpServerResponse.setHeader(
              headerName,
              httpIncomingMessageDestination.headers[headerName] || ''
            );
          }

          httpIncomingMessageDestination.pipe(httpServerResponse);
        }
      );

      httpIncomingMessageSource.pipe(request);
    }
  }

  public async initialize(): Promise<ReverseProxy> {
    this.httpServer = http.createServer(
      (
        httpIncomingMessageSource: http.IncomingMessage,
        httpServerResponse: http.ServerResponse
      ) =>
        this.httpRequestListener(httpIncomingMessageSource, httpServerResponse)
    );

    return this;
  }

  public async start(): Promise<ReverseProxy> {
    if (this.httpServer) {
      this.httpServer.listen(this.ports.http);
    }

    return this;
  }
}
