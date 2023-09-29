import { ReverseProxy } from './reverse-proxy';
import { Router } from './router';

(async () => {
  const reverseProxy: ReverseProxy = new ReverseProxy(
    { http: 8080, https: 8081 },
    new Router({
      routes: [
        {
          downstream: {
            headers: {
              hello: 'world',
            },
            hostAndPorts: [
              {
                host: 'www.whatismybrowser.com',
                port: 443,
              },
            ],
            path: '{path}',
            scheme: 'https',
          },
          upstream: {
            methods: ['GET'],
            path: '^.*$',
          },
        },
      ],
    }),
  );

  reverseProxy.start();
})();
