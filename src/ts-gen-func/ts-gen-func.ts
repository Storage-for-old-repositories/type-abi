import { MultiStringBuilder } from "utility/string/string-builder";
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
  struct: function* (token: StructToken) {
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
  tuple: function* (token: TupleToken) {
    yield "[";

    for (const field of token.tokens) {
      yield field;
      yield ",";
    }

    yield `]`;
  },
  tupleStructMode: function* (token: TupleToken) {
    yield* TOKEN_GENERATORS.struct({
      kind: "struct",
      structName: "<AutoTuple>",
      fields: token.tokens,
      containerName: token.containerName,
      name: token.name,
    });
  },
};

// ? { [k in Key as EndofTokens["kind"]]: 2 }
// : never;

const DEFAULT_CONFIG: Readonly<TsTypeGenerationConfig> = {
  verbose: false,
  // tupleToStructIfAllHasName,
};

export interface TsTypeGenerationConfig {
  verbose: boolean;
  // tupleIs;
}

interface TsTypeGeneratorIterConfig {}

class TsTypeGenerator {
  private artifact!: ParsedFuncArtifact;
  private config!: TsTypeGenerationConfig;

  // private iterConfig!: TsTypeGeneratorIterConfig;
  // private iterConfigStack: TsTypeGeneratorIterConfig[] = [];

  private multiBuilder = new MultiStringBuilder();

  public setArtifact(artifact: ParsedFuncArtifact) {
    this.artifact = artifact;
  }

  public clearArtifact() {
    this.artifact = null!; /** memory control */
    // this.iterConfigStack = [];
    this.multiBuilder.clearBuilders();
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

  public generate() {
    this.multiBuilder.clearBuilders();
    // this.iterConfigStack = [];
  }

  private tokenToGenerator(token: Tokens) {
    this.multiBuilder.pushBuilder();

    switch (token.kind) {
      case "tuple":
        break;
    }
  }

  // private pushConfig() {
  //   // this.iterConfigStack.push(this.iterConfig);
  //   // this.iterConfig =
  // }
}

type k = Exclude<TokensKinds, EndofTokens["kind"]>;
