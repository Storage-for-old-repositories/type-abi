export interface ParseToken {
  kind: string;
  name?: string;
  containerName?: string;
}

export interface AddressToken extends ParseToken {
  kind: "address";
  alias: "uint160";
}

export interface StringToken extends ParseToken {
  kind: "string";
}

export interface BoolToken extends ParseToken {
  kind: "bool";
  alias: "uint8";
}

export type IntSizeofSet =
  | 8
  | 16
  | 24
  | 32
  | 40
  | 48
  | 56
  | 64
  | 72
  | 80
  | 88
  | 96
  | 104
  | 112
  | 120
  | 128
  | 136
  | 144
  | 152
  | 160
  | 168
  | 176
  | 184
  | 192
  | 200
  | 208
  | 216
  | 224
  | 232
  | 240
  | 248
  | 256;

export interface IntToken extends ParseToken {
  kind: "int";
  sizeof: IntSizeofSet;
}

export interface UintToken extends ParseToken {
  kind: "uint";
  sizeof: IntSizeofSet;
}

export type ByteSizeofSet =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32;

export interface BytesLimitToken extends ParseToken {
  kind: "bytesLimit";
  sizeof: ByteSizeofSet;
}

export interface BytesToken extends ParseToken {
  kind: "bytes";
}

export interface EnumToken extends ParseToken {
  kind: "enum";
  enumName: string;
}

export type EndofTokens =
  | AddressToken
  | StringToken
  | BoolToken
  | IntToken
  | UintToken
  | BytesLimitToken
  | BytesToken
  | EnumToken;

export type Tokens =
  | EndofTokens
  | StructToken
  | TupleToken
  | ArrayConstToken
  | ArrayToken;

export interface StructToken extends ParseToken {
  kind: "struct";
  fields: Tokens[];
  structName: string;
}

export interface TupleToken extends ParseToken {
  kind: "tuple";
  tokens: Tokens[];
  isAllFieldsHasNames: boolean;
}

export interface ArrayConstToken extends ParseToken {
  kind: "arrayConst";
  token: Tokens;
  sizeof: number;
}

export interface ArrayToken extends ParseToken {
  kind: "array";
  token: Tokens;
}
