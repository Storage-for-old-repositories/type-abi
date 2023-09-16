import {
  ArrayConstToken,
  ArrayToken,
  EndofTokens,
  StructToken,
  Tokens,
  TupleToken,
} from "../abi-parser-func";
import { TYPE_ALIAS } from "./type-aliases";
import { TsTypeGenerationConfig } from "./ts-gen-func";
import { SharedMemory } from "./shared-memory";

export class GeneratorsForTokens {
  constructor(private sharedMemory: SharedMemory) {}

  private get config() {
    return this.sharedMemory.config;
  }

  *alias(token: EndofTokens) {
    const alias = TYPE_ALIAS[token.kind]!;
    if (typeof alias === "string") {
      yield alias;
      return;
    }
    const aliasCastType = alias as (
      t: typeof token,
      config: TsTypeGenerationConfig
    ) => string;
    yield aliasCastType(token, this.config);
  }

  *array(token: ArrayToken) {
    yield "Array<";
    yield token.token;
    yield ">";
  }

  *arrayConst(token: ArrayConstToken) {
    const { emitMetaInfoType } = this.config;

    if (emitMetaInfoType) {
      yield "[";
    }

    yield* this.array({
      kind: "array",
      token: token.token,
      containerName: token.containerName,
      name: token.name,
    });

    if (emitMetaInfoType) {
      yield `, ${token.sizeof}][0]`;
    }
  }

  *struct(token: StructToken): Generator<string | Tokens> {
    const { emitMetaInfoType } = this.config;

    if (emitMetaInfoType) {
      yield "[";
    }

    yield "{";
    for (let i = 0; i < token.fields.length; ++i) {
      const field = token.fields[i]!;
      const name = field.name || `auto$field${i}`;

      yield `["${name}"]: `;
      yield field;
      yield ",";
    }
    yield `}`;

    if (emitMetaInfoType) {
      yield `, "${token.structName}"][0]`;
    }
  }

  *tuple(token: TupleToken): Generator<string | Tokens> {
    if (this.sharedMemory.config.replaceTuplesOnStruct) {
      yield* this.tupleStructMode(token);
      return;
    }

    yield "[";
    yield token.tokens[0]!;
    for (let i = 1; i < token.tokens.length; ++i) {
      yield ",";
      yield token.tokens[i]!;
    }
    yield `]`;
  }

  *tupleStructMode(token: TupleToken): Generator<string | Tokens> {
    yield* this.struct({
      kind: "struct",
      structName: "<AutoTuple>",
      fields: token.tokens,
      containerName: token.containerName,
      name: token.name,
    });
  }

  *argument(token: Tokens) {
    if (!token) {
      yield "():";
      return;
    }

    yield "(";
    if (token.kind === "tuple") {
      const firstToken = token.tokens[0]!;
      const name = firstToken.name || `auto$field0`;
      yield `${name}: `;
      yield firstToken;

      for (let i = 1; i < token.tokens.length; ++i) {
        const field = token.tokens[i]!;
        const name = field.name || `auto$field${i}`;

        yield ",";
        yield `${name}: `;
        yield field;
      }
    }
    const name = token.name || "auto$field";
    yield `${name}: `;
    yield token;
    yield "):";
  }

  *result(token: Tokens) {
    yield "Promise<";
    yield token;
    yield ">";
  }
}
