export type RouterResult = {
  headers: { [key: string]: string };

  host: string;

  method: string;

  path: string;

  query: { [key: string]: string };

  scheme: string;
};
