import { StateMutability } from "../shared.types";
import { Tokens } from "./tokens.types";

export interface ParsedArtifactInput {
  type: Tokens | null;
}
export interface ParsedArtifactOutput {
  type: Tokens | null;
}
export interface ParsedFuncArtifact {
  name: string;
  input: ParsedArtifactInput;
  output: ParsedArtifactOutput;
  stateMutability: StateMutability;
}
