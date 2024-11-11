export interface Memento<T, T2> {
  toMemento(): T;
  fromMemento(memento: T): T2;
}
