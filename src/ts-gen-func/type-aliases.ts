import {
  BytesLimitToken,
  EndofTokens,
  EnumToken,
  IntToken,
  Tokens,
  UintToken,
} from "../abi-parser-func";
import { TsTypeGenerationConfig } from "./ts-gen-func";

const buildAliasType =
  <T extends Tokens>({
    type,
    originType,
    tokenField = "kind",
  }: {
    type: string;
    originType?: string;
    tokenField?: keyof T;
  }) =>
  (token: T, config: TsTypeGenerationConfig) => {
    if (config.emitMetaInfoType) {
      const texts = ["["];
      texts.push(type);

      if (originType) {
        texts.push(", ");
        texts.push(`"${originType}"`);
      }

      const field = token[tokenField];
      texts.push(", ");
      texts.push(`${typeof field === "string" ? `"${field}"` : field}`);

      texts.push("]");
      texts.push("[0]");

      return texts.join("");
    }
    return type;
  };

export const TYPE_ALIAS: {
  [Key in EndofTokens["kind"]]:
    | string
    | ((
        token: Extract<EndofTokens, { kind: Key }>,
        config: TsTypeGenerationConfig
      ) => string);
} = {
  string: "string",
  address: buildAliasType({ type: "string" }),
  bool: buildAliasType({ type: "boolean" }),
  bytes: buildAliasType({ type: "string" }),
  enum: buildAliasType<EnumToken>({
    type: "bigint",
    originType: "enum",
    tokenField: "enumName",
  }),
  bytesLimit: buildAliasType<BytesLimitToken>({
    type: "bigint",
    originType: "bytes",
    tokenField: "sizeof",
  }),
  int: buildAliasType<IntToken>({
    type: "bigint",
    originType: "int",
    tokenField: "sizeof",
  }),
  uint: buildAliasType<UintToken>({
    type: "bigint",
    originType: "uint",
    tokenField: "sizeof",
  }),
};
