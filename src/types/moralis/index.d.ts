import { Percent } from "@uniswap/sdk";

export interface MoralisSwap {
  confirmed:         boolean;
  chainId:           string;
  abi:               ABI[];
  streamId:          string;
  tag:               string;
  retries:           number;
  block:             Block;
  logs:              Log[];
  txs:               any[];
  txsInternal:       any[];
  erc20Transfers:    any[];
  erc20Approvals:    any[];
  nftTokenApprovals: any[];
  nftApprovals:      NftApprovals;
  nftTransfers:      any[];
  nativeBalances:    any[];
}

export type FirebaseSwapDoc = {
  address: string;
  amount0In: string;
  amount0Out: string;
  amount1In: string;
  amount1Out: string;
  blockHash: string;
  blockNumber: number;
  blockTimestamp: number;
  chainId: number;
  confirmed: boolean;
  id: string;
  logIndex: number;
  name: string;
  sender: string;
  to: string;
  transactionHash: string;
  triggers: { name: string; value: string }[];
  updatedAt: { _seconds: number; _nanoseconds: number };
};

export interface ABI {
  anonymous: boolean;
  inputs:    Input[];
  name:      string;
  type:      string;
}

export interface Input {
  indexed:      boolean;
  internalType: Type;
  name:         string;
  type:         Type;
}

export enum Type {
  Address = "address",
  Uint112 = "uint112",
  Uint256 = "uint256",
}

export interface Block {
  number:    string;
  hash:      string;
  timestamp: string;
}

export interface Log {
  logIndex:        string;
  transactionHash: string;
  address:         string;
  data:            string;
  topic0:          string;
  topic1:          string;
  topic2:          string;
  topic3:          null;
  sender:          string;
  amount0In:       string;
  amount1In:       string;
  amount0Out:      string;
  amount1Out:      string;
  to:              string;
  triggers:        Trigger[];
}

export interface Trigger {
  name:  string;
  value: string;
}

export interface NftApprovals {
  ERC721:  any[];
  ERC1155: any[];
}

export interface Dex {
  name: string;
  icon: string;
  tax: Percent;
  chartUrl: string;
}
