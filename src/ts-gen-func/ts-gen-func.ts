import { StringBuilder } from "utility/string/string-builder";
import {
  ArrayConstToken,
  ArrayToken,
  EndofTokens,
  ParsedFuncArtifact,
  StructToken,
  Tokens,
  TokensKinds,
  TupleToken,
} from "../abi-parser-func";

const buildAliasType = (type: string) => (token: EndofTokens) => {
  return `[${type}, "${token.kind}"][0]`;
};

const TYPE_ALIAS: {
  [Key in EndofTokens["kind"]]:
    | string
    | ((token: Extract<EndofTokens, { kind: Key }>) => string);
} = {
  string: "string",
  address: buildAliasType("string"),
  bool: buildAliasType("boolean"),
  bytes: buildAliasType("string"),
  enum: (token) => {
    return `[bigint, "enum", "${token.enumName}"][0]`;
  },
  bytesLimit: (token) => {
    return `[string, "bytes", ${token.sizeof}][0]`;
  },
  int: (token) => {
    return `[bigint, "int", ${token.sizeof}][0]`;
  },
  uint: (token) => {
    return `[bigint, "uint", ${token.sizeof}][0]`;
  },
};

const TOKEN_GENERATORS = {
  alias: function* (token: EndofTokens) {
    const alias = TYPE_ALIAS[token.kind]!;
    if (typeof alias === "string") {
      yield alias;
    }
    const aliasCastType = alias as (t: typeof token) => string;
    yield aliasCastType(token);
  },
  array: function* (token: ArrayToken) {
    yield "Array<";
    yield token.token;
    yield ">";
  },
  arrayConst: function* (token: ArrayConstToken) {
    yield "[Array<";
    yield token.token;
    yield `>, ${token.sizeof}][0]`;
  },
  struct: function* (token: StructToken): Generator<string | Tokens> {
    yield "[{";

    for (let i = 0; i < token.fields.length; ++i) {
      const field = token.fields[i]!;
      const name = field.name ?? `auto$field${i}`;

      yield `["${name}"]: `;
      yield field;
      yield ",";
    }

    yield `}, "${token.structName}"][0]`;
  },
  tuple: function* (token: TupleToken): Generator<string | Tokens> {
    yield "[";

    yield token.tokens[0]!;
    for (let i = 1; i < token.tokens.length; ++i) {
      yield ",";
      yield token.tokens[i]!;
    }

    yield `]`;
  },
  tupleStructMode: function* (token: TupleToken): Generator<string | Tokens> {
    yield* TOKEN_GENERATORS.struct({
      kind: "struct",
      structName: "<AutoTuple>",
      fields: token.tokens,
      containerName: token.containerName,
      name: token.name,
    });
  },
  argument: function* (token: Tokens) {
    if (token.kind === "tuple") {
      const firstToken = token.tokens[0]!;
      const name = firstToken.name ?? `auto$field0`;
      yield `${name}: `;
      yield firstToken;

      for (let i = 1; i < token.tokens.length; ++i) {
        const field = token.tokens[i]!;
        const name = field.name ?? `auto$field${i}`;

        yield ",";
        yield `${name}: `;
        yield field;
      }
    }
    const name = token.name ?? "auto$field";
    yield `${name}: `;
    yield token;
  },
  result: function* (token: Tokens) {
    yield token;
  },
};

const DEFAULT_CONFIG: Readonly<TsTypeGenerationConfig> = {
  verbose: false,
};

export interface TsTypeGenerationConfig {
  verbose: boolean;
}

class TsTypeGenerator {
  private artifact!: ParsedFuncArtifact;
  private config!: TsTypeGenerationConfig;

  private generator!: Generator<string | Tokens>;
  private generators: Generator<string | Tokens>[] = [];

  private sBuilder = new StringBuilder();

  public setArtifact(artifact: ParsedFuncArtifact) {
    this.artifact = artifact;
  }

  public clearArtifact() {
    this.artifact = null!; /** memory control */
    this.sBuilder = new StringBuilder();
  }

  public setConfig(config?: Partial<TsTypeGenerationConfig>) {
    this.config = { ...DEFAULT_CONFIG };
    if (!config) {
      return;
    }
    for (const [key, value] of Object.entries(config)) {
      const _tcKey = key as keyof TsTypeGenerationConfig;
      this.config[_tcKey] = (value as any) ?? config[_tcKey];
    }
  }

  public generate() {}

  private generateInputs(token: Tokens) {
    this.generator = TOKEN_GENERATORS.argument(token);
    this.loopGenerate();
  }

  private generateOutputs(token: Tokens) {
    this.generator = TOKEN_GENERATORS.result(token);
    this.loopGenerate();
  }

  private loopGenerate() {
    while (this.generators.length > 0) {
      const generator = this.generators[this.generators.length - 1]!;
      const genResult = generator.next();

      if (genResult.done) {
        this.popGenerator();
        continue;
      }

      const { value } = genResult;

      if (typeof value == "string") {
        this.sBuilder.push(value);
        continue;
      }

      if (value.kind === "tuple") {
        this.pushGenerator(TOKEN_GENERATORS.tuple(value));
      } else if (value.kind === "array") {
        this.pushGenerator(TOKEN_GENERATORS.array(value));
      } else if (value.kind === "arrayConst") {
        this.pushGenerator(TOKEN_GENERATORS.arrayConst(value));
      } else if (value.kind === "struct") {
        this.pushGenerator(TOKEN_GENERATORS.struct(value));
      } else {
        this.pushGenerator(TOKEN_GENERATORS.alias(value));
      }
    }
  }

  private pushGenerator(generator: Generator<string | Tokens>) {
    this.generators.push(this.generator);
    this.generator = generator;
  }

  private popGenerator() {
    this.generator = this.generators.pop()!;
    return this.generator;
  }
}

type k = Exclude<TokensKinds, EndofTokens["kind"]>;
