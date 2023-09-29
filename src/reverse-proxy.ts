import * as http from 'http';
import * as https from 'https';
import * as moment from 'moment';
import { Router } from './router';

export class ReverseProxy {
  protected httpServer: http.Server | null = null;

  protected httpAgent: http.Agent = new http.Agent();

  protected httpsAgent: https.Agent = new https.Agent();

  constructor(
    protected ports: { http: number; https: number },
    protected router: Router,
  ) {
    this.initialize();
  }

  protected httpRequestListener(
    httpIncomingMessageSource: http.IncomingMessage,
    httpServerResponse: http.ServerResponse,
  ) {
    try {
      const timestamp1 = new Date().getTime();

      const routerResult = this.router.get({
        headers: {},
        host: httpIncomingMessageSource.headers.host || '',
        method: httpIncomingMessageSource.method || '',
        path: httpIncomingMessageSource.url || '',
        query: {},
        scheme: 'https',
      });

      if (routerResult.scheme === 'http') {
        throw new Error('not supported yet');
      }

      if (routerResult.scheme === 'https') {
        const request = https.request(
          {
            agent: this.httpsAgent,
            headers: {
              ...httpIncomingMessageSource.headers,
              ...routerResult.headers,
              host: routerResult.host, // TODO
            },
            host: routerResult.host,
            method: httpIncomingMessageSource.method,
            path: httpIncomingMessageSource.url,
            searchParams: new URLSearchParams(routerResult.query),
          },
          (httpIncomingMessageDestination) => {
            const timestamp2 = new Date().getTime();

            const message = `${
              httpIncomingMessageSource.socket.remoteAddress
            } - ${moment().format('YYYY-MM-DD HH:mm:ss')} "${
              httpIncomingMessageSource.method
            } ${httpIncomingMessageSource.url}" ${
              httpIncomingMessageDestination.statusCode
            } ${timestamp2 - timestamp1}`;

            console.log(message); // TODO

            if (httpIncomingMessageDestination.statusCode) {
              httpServerResponse.writeHead(
                httpIncomingMessageDestination.statusCode,
                Object.keys(httpIncomingMessageDestination.headers).reduce(
                  (dict, key) => {
                    dict[key] = httpIncomingMessageDestination.headers[key];

                    return dict;
                  },
                  {} as { [key: string]: string | string[] | undefined },
                ),
              );
            }

            httpIncomingMessageDestination.pipe(httpServerResponse);
          },
        );

        request.on('error', (error) => {
          httpServerResponse.writeHead(500, 'Internal Server Error', {
            'Content-Type': 'application/json',
          });

          httpServerResponse.end(
            JSON.stringify({ message: error.message }),
            'utf-8',
          );
        });

        httpIncomingMessageSource.pipe(request);
      }
    } catch (error: any) {
      httpServerResponse.writeHead(500, 'Internal Server Error', {
        'Content-Type': 'application/json',
      });

      httpServerResponse.end(
        JSON.stringify({ message: error.message }),
        'utf-8',
      );
    }
  }

  public async initialize(): Promise<ReverseProxy> {
    this.httpServer = http.createServer(
      (
        httpIncomingMessageSource: http.IncomingMessage,
        httpServerResponse: http.ServerResponse,
      ) =>
        this.httpRequestListener(httpIncomingMessageSource, httpServerResponse),
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
