export interface LoadBalancerPolicy<T> {
  get(): T | null;
}
