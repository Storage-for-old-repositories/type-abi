import type { ABI, ABIFragment } from "../shared.types";
import type {
  ParsedFuncArtifact,
  ParsedArtifactInput,
  ParsedArtifactOutput,
} from "./interface.types";
import type {
  ByteSizeofSet,
  IntSizeofSet,
  StructToken,
  Tokens,
  TupleToken,
} from "./tokens.types";

export class AbiParserFunc {
  private abi!: ABI;
  private tokensProviders: {
    provide: (tokens: Tokens[]) => void;
    fragments: ABIFragment[];
  }[] = [];

  public setAbi(abi: ABI) {
    this.abi = abi;
    this.tokensProviders = [];
  }

  public clearABI() {
    this.abi = null! /** memory control */;
  }

  public parse(): ParsedFuncArtifact {
    try {
      const { name, inputs, outputs, stateMutability } = this.abi;
      const result = {
        name,
        input: this.parseInputs(inputs),
        output: this.parseOutputs(outputs),
        stateMutability,
      };
      return result;
    } finally {
      this.tokensProviders = [];
    }
  }

  private parseInputs(inputs: ABIFragment[]): ParsedArtifactInput {
    return { type: this.parseTypeFromFragments(inputs) };
  }

  private parseOutputs(outputs: ABIFragment[]): ParsedArtifactOutput {
    return { type: this.parseTypeFromFragments(outputs) };
  }

  private parseTypeFromFragments(fragments: ABIFragment[]): null | Tokens {
    if (fragments.length === 0) {
      return null;
    }
    const token =
      fragments.length === 1
        ? this.parseFragment(fragments[0]!)
        : this.parseFragments(fragments);

    while (this.tokensProviders.length > 0) {
      const { fragments, provide } = this.tokensProviders.pop()!;
      const tokens = this.parseFragments(fragments);
      provide(tokens.tokens);
    }

    return token;
  }

  private parseFragment(fragment: ABIFragment): Exclude<Tokens, TupleToken> {
    const { type, arrayFormat, typeSizeof } = this.parseType(fragment.type);
    const { internalType, name } = fragment;

    let token: null | Tokens = null;
    if (type === "bool") {
      token = {
        kind: "bool",
        alias: "uint8",
        name,
      };
    } else if (type === "string") {
      token = {
        kind: "string",
        name,
      };
    } else if (type === "address") {
      token = {
        kind: "address",
        alias: "uint160",
        name,
      };
    } else if (type === "uint") {
      const match = type.match(/^enum ([a-zA-Z\d]*)(\.([a-zA-Z\d]*))*/);
      if (match) {
        token = {
          kind: "enum",
          enumName: match[3]! ?? match[1]!,
          name,
        };
      } else {
        token = {
          kind: "uint",
          sizeof: (typeSizeof ?? 256) as IntSizeofSet,
          name,
        };
      }
    } else if (type === "int") {
      token = {
        kind: "int",
        sizeof: (typeSizeof ?? 256) as IntSizeofSet,
        name,
      };
    } else if (type === "bytes") {
      if (typeSizeof) {
        token = {
          kind: "bytesLimit",
          sizeof: typeSizeof as ByteSizeofSet,
          name,
        };
      } else {
        token = {
          kind: "bytes",
          name,
        };
      }
    } else if (type === "tuple") {
      const match = internalType.match(
        /struct ([a-zA-Z\d]*)(\.([a-zA-Z\d]*))*/
      );
      if (match) {
        token = {
          kind: "struct",
          structName: match[3]! ?? match[1]!,
          fields: [],
          name,
        };

        const consumer = token as StructToken;
        this.tokensProviders.push({
          fragments: fragment.components!,
          provide: (tokens) => {
            consumer.fields = tokens;
          },
        });
      } else {
        throw new Error();
      }
    }

    if (!token) {
      throw new Error();
    }

    for (const arrformat of arrayFormat) {
      token.containerName = token?.name;
      token.name = undefined;

      if (typeof arrformat === "number") {
        token = {
          kind: "arrayConst",
          sizeof: arrformat,
          token,
          name,
        };
      } else {
        token = {
          kind: "array",
          token,
          name,
        };
      }
    }

    return token;
  }

  private parseType(type: string) {
    const format = type.match(/^([a-z]+)(\d*)(.*)$/);
    this.validateMatchedTypeFormat(format);

    const [, typeName, typeSizeof, arrayFormatRaw] = format;
    const arrayFormat = this.parseArrayFormat(arrayFormatRaw ?? "");

    return {
      type: typeName!,
      arrayFormat,
      typeSizeof: typeSizeof ? +typeSizeof : null,
    };
  }

  private validateMatchedTypeFormat(
    format: RegExpMatchArray | null
  ): asserts format is RegExpMatchArray {
    if (!format) {
      throw new Error();
    }
  }

  private parseArrayFormat(arrayFormat: string) {
    const format = [] as (number | undefined)[];
    const parts = arrayFormat.split(/\[(\d*)\]*/);
    for (let i = 1; i < parts.length; i += 2) {
      const sizeof = parts[i];
      if (sizeof) {
        format.push(+sizeof);
      } else {
        format.push(undefined);
      }
    }
    return format;
  }

  private parseFragments(fragments: ABIFragment[]): TupleToken {
    const tokens = fragments.map((frag) => this.parseFragment(frag));
    return {
      kind: "tuple",
      tokens,
      isAllFieldsHasNames: tokens.every(({ name }) => !!name),
    };
  }
}
