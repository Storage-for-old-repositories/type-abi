export type StateMutability =
  | "pure"
  | "view"
  | "constant"
  | "payable"
  | "nonpayable";

export interface ABIFragment {
  type: string;
  internalType: string;
  name?: string;
  components?: ABIFragment[];
}

export interface ABI {
  name: string;
  type: string;
  inputs: ABIFragment[];
  outputs: ABIFragment[];
  stateMutability: StateMutability;
}
