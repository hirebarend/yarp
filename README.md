# YARP (Yet Another Reverse Proxy)

```typescript
(async () => {
  const reverseProxy: ReverseProxy = new ReverseProxy(
    { http: 8080, https: 8081 },
    new Router({
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
```
