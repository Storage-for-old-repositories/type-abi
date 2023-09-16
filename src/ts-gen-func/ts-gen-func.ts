import { StringBuilder } from "../utility/string/string-builder";
import { ParsedFuncArtifact, Tokens } from "../abi-parser-func";
import { GeneratorsForTokens } from "./generators-for-tokens";
import { SharedMemory } from "./shared-memory";

const DEFAULT_CONFIG: Readonly<TsTypeGenerationConfig> = {
  verbose: false,
  emitMetaInfoType: true,
  replaceTuplesOnStruct: false,
};

export interface TsTypeGenerationConfig {
  verbose: boolean;
  emitMetaInfoType: boolean;
  replaceTuplesOnStruct: boolean;
}

export class TsTypeGenerator {
  private artifact!: ParsedFuncArtifact;

  private generators: Generator<string | Tokens>[] = [];

  private sharedMemory = new SharedMemory();

  private sBuilder = new StringBuilder();

  private callerToken = new GeneratorsForTokens(this.sharedMemory);

  public setArtifact(artifact: ParsedFuncArtifact) {
    this.artifact = artifact;
  }

  public clearArtifact() {
    this.artifact = null!; /** memory control */
    this.clearState();
  }

  private clearState() {
    this.sBuilder = new StringBuilder();
    this.generators = [];
  }

  public setConfig(config?: Partial<TsTypeGenerationConfig>) {
    this.sharedMemory.config = { ...DEFAULT_CONFIG };
    if (!config) {
      return;
    }
    for (const [key, value] of Object.entries(config)) {
      const _tcKey = key as keyof TsTypeGenerationConfig;
      this.sharedMemory.config[_tcKey] = (value as any) ?? config[_tcKey];
    }
  }

  public generate() {
    try {
      const signature = this.generateSignature();
      return signature;
    } catch (error) {
      this.clearState();
      throw error;
    }
  }

  private generateSignature() {
    this.sBuilder.push(this.artifact.name!);
    this.generateInputs(this.artifact.input.type!);
    this.generateOutputs(this.artifact.output.type!);
    const signature = this.sBuilder.join("");
    return signature;
  }

  private generateInputs(token: Tokens) {
    const generator = this.callerToken.argument(token);
    this.pushGenerator(generator);
    this.loopGenerate();
  }

  private generateOutputs(token: Tokens) {
    const generator = this.callerToken.result(token);
    this.pushGenerator(generator);
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
        this.pushGenerator(this.callerToken.tuple(value));
      } else if (value.kind === "array") {
        this.pushGenerator(this.callerToken.array(value));
      } else if (value.kind === "arrayConst") {
        this.pushGenerator(this.callerToken.arrayConst(value));
      } else if (value.kind === "struct") {
        this.pushGenerator(this.callerToken.struct(value));
      } else {
        this.pushGenerator(this.callerToken.alias(value));
      }
    }
  }

  private pushGenerator(generator: Generator<string | Tokens>) {
    this.generators.push(generator);
  }

  private popGenerator() {
    const generator = this.generators.pop();
    return generator;
  }
}
