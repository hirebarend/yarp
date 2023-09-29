import { Configuration } from './configuration';
import { RouterResult } from './router-result';

export class Router {
  constructor(protected configuration: Configuration) {}

  public setConfig(configuration: Configuration): Router {
    this.configuration = configuration;

    return this;
  }

  public get(request: {
    headers: { [key: string]: string };
    host: string;
    method: string;
    path: string;
    query: { [key: string]: string };
    scheme: string;
  }): RouterResult {
    for (const route of this.configuration.routes) {
      if (!route.upstream.methods.includes(request.method)) {
        continue;
      }

      const regExpExecArray: RegExpExecArray | null = new RegExp(
        route.upstream.path,
      ).exec(request.path);

      if (!regExpExecArray) {
        continue;
      }

      const params = {
        ...request.query,
        ...regExpExecArray.groups,
        path: request.path,
      };

      return {
        headers: Object.keys(route.downstream.headers).reduce(
          (dict, key) => {
            dict[key] = this.buildTemplate(
              route.downstream.headers[key],
              params,
            );
            return {};
          },
          {} as { [key: string]: string },
        ),
        host: route.downstream.hostAndPorts[0].host, // TODO: load balancer
        method: request.method,
        path: this.buildTemplate(route.downstream.path, params),
        query: Object.keys(request.query).reduce(
          (dict, x) => {
            dict[x] = this.buildTemplate(dict[x], params);

            return dict;
          },
          {} as { [key: string]: string },
        ),
        scheme: 'https',
      };
    }

    throw new Error();
  }

  protected buildTemplate(
    template: string,
    params: { [key: string]: string },
  ): string {
    let result: string = '';

    let key: string | null = null;

    for (let i = 0; i < template.length; i++) {
      if (key === null && template[i] === '{') {
        key = '';

        continue;
      }

      if (key !== null && template[i] === '}') {
        result += params[key];

        continue;
      }

      if (key !== null) {
        key += template[i];

        continue;
      }

      result += template[i];
    }

    return result;
  }
}
