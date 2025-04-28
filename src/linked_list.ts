export class LinkedList<T> {
  public head: LinkedListNode<T> | null;

  constructor() {
    this.head = null;
  }

  clear() {
    this.head = null;
  }

  *iterate() {
    var working = this.head;
    while (working != null) {
      yield working.value;

      working = working.next;
    }
  }

  get first() {
    return this.head?.value;
  }

  add(value: T) {
    var node = new LinkedListNode(value);

    node.next = this.head;
    this.head = node;
  }
}

class LinkedListNode<T> {
  public next: LinkedListNode<T> | null;

  constructor(public value: T) {
    this.next = null;
  }
}
