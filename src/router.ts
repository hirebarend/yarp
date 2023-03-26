import { LoadBalancerPolicy } from './interfaces';
import { RoundRobinLoadBalancerPolicy } from './round-robin-load-balancer-policy';

type RouterConfig = {
  clusters: {
    [key: string]: {
      destinations: Array<string>;
    };
  };
  routes: Array<{
    clusterId: string;
    hosts: Array<string>;
    methods: Array<string>;
    path: string;
  }>;
};

export class Router {
  protected readonly loadBalancerPolicy: {
    [key: string]: LoadBalancerPolicy<string>;
  } = {};

  constructor(protected config: RouterConfig) {
    this.setConfig(null);
  }

  public setConfig(config: RouterConfig | null): Router {
    if (config) {
      this.config = config;
    }

    for (const cluster in this.config.clusters) {
      this.loadBalancerPolicy[cluster] = new RoundRobinLoadBalancerPolicy(
        new Set(this.config.clusters[cluster].destinations)
      );
    }

    return this;
  }

  public get(
    host: string,
    method: string,
    path: string
  ): {
    host: string;
    port: number | null;
    protocol: string;
  } {
    for (const route of this.config.routes) {
      if (route.hosts.length && route.hosts.includes(host)) {
        continue;
      }

      if (route.methods.length && route.methods.includes(method)) {
        continue;
      }

      const regExp = new RegExp(route.path);

      if (!regExp.test(path)) {
        continue;
      }

      const destination: string | null =
        this.loadBalancerPolicy[route.clusterId].get();

      if (!destination) {
        throw new Error();
      }

      const url: URL = new URL(destination);

      return {
        host: url.host,
        port: url.port ? parseInt(url.port) : null,
        protocol: url.protocol,
      };
    }

    throw new Error();
  }
}
