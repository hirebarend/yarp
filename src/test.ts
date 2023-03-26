import { ReverseProxy } from './reverse-proxy';
import { Router } from './router';

(async () => {
  const reverseProxy: ReverseProxy = new ReverseProxy(
    { http: 8080, https: 8081 },
    await new Router({
      clusters: {
        one: {
          destinations: ['https://hirebarend.com'],
        },
      },
      routes: [
        {
          clusterId: 'one',
          hosts: [],
          methods: [],
          path: '^.*$',
        },
      ],
    })
  );

  reverseProxy.start();
})();
