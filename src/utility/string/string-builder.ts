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

export class MultiStringBuilder {
  private _sBuilder = new StringBuilder();
  private sBuildersStack: StringBuilder[] = [];

  get builder() {
    return this._sBuilder;
  }

  public pushBuilder() {
    this.sBuildersStack.push(this._sBuilder);
    this._sBuilder = new StringBuilder();
  }

  public popBuilder() {
    this.validatePopBuilder();
    this._sBuilder = this.sBuildersStack.pop()!;
  }

  public clearBuilders() {
    this._sBuilder = new StringBuilder();
    this.sBuildersStack = [];
  }

  private validatePopBuilder() {
    if (this.sBuildersStack.length === 0) {
      throw new Error(`builders stack empty`);
    }
  }
}
