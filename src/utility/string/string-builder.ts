export class StringBuilder {
  private textBuffer: string[] = [];

  public push(...texts: string[]) {
    this.textBuffer.push(...texts);
  }

  public clear() {
    this.textBuffer = [];
  }

  public join(seq = "\n") {
    return this.textBuffer.join(seq);
  }
}
