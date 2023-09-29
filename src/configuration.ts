export type Configuration = {
  routes: Array<{
    downstream: {
      headers: { [key: string]: string };
      hostAndPorts: Array<{ host: string; port: number }>;
      path: string;
      scheme: string;
    };
    upstream: {
      methods: Array<string>;
      path: string;
    };
  }>;
};
