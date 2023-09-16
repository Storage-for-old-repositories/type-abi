import { AbiParserFunc, ParsedFuncArtifact } from "./abi-parser-func/";
import { ABI } from "./shared.types";

import abi from "../.abi/tests_contracts_ForTyping_sol_ForTyping.json";
import { TsTypeGenerator } from "./ts-gen-func";

type CompilerObject = { abi: ABI | ABI[] };
export type ParserInput = ABI | ABI[] | CompilerObject;

class AbiParser {
  private abi: ABI[] = [];
  private parsedFuncs: Map<string, ParsedFuncArtifact> = new Map();

  private parserFunc = new AbiParserFunc();

  private constructor() {}

  public static parse(input: ParserInput) {
    const parser = new AbiParser();
    parser.setAbiFromInput(input);
    parser.parse();
    return {
      funcs: parser.parsedFuncs,
    };
  }

  private setAbiFromInput(input: ParserInput) {
    const abi = "abi" in input ? input.abi : input;
    this.abi = [abi].flat();
  }

  private parse() {
    for (const abi of this.abi) {
      if (abi.type === "function") {
        this.parseFunc(abi);
      }
    }
  }

  private parseFunc(abi: ABI) {
    this.parserFunc.setAbi(abi);
    this.parsedFuncs.set(abi.name, this.parserFunc.parse());
  }
}

const parsed = AbiParser.parse(abi as any as ABI);
const json = [...parsed.funcs.values()];

const generator = new TsTypeGenerator();
const parsedSignature = json[3]!;
generator.setArtifact(parsedSignature);
generator.setConfig({
  emitMetaInfoType: false,
  replaceTuplesOnStruct: true,
  verbose: true,
})

console.log(parsedSignature)

const type = generator.generate();
console.log(JSON.stringify(parsedSignature, undefined, 2));
console.log(type);
