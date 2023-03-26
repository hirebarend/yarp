import { LoadBalancerPolicy } from './interfaces';

export class RoundRobinLoadBalancerPolicy
  implements LoadBalancerPolicy<string>
{
  protected values: IterableIterator<string>;

  constructor(protected set: Set<string>) {
    this.values = this.set.values();
  }

  public get(): string | null {
    const iteratorResult: IteratorResult<string, any> = this.values.next();

    if (iteratorResult.done) {
      this.values = this.set.values();

      return this.get();
    }

    return iteratorResult.value;
  }
}
