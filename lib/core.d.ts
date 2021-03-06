import { AddressType } from './model/address';
import { IArmadilloCommand, IArmadilloResponse, ISignTxRequest, ITransaction, ITransactionSchema } from './model/currency';
import { IBitcoinNetwork } from './model/network';
export declare function getSupportedNetworks(): string[];
export declare function getSupportedNetwork(network: string): IBitcoinNetwork;
export declare function getFeeOptionUnit(): string;
export declare function isValidFeeOption(network: string, feeOpt: string): boolean;
export declare function isValidAddr(network: string, addr: string): boolean;
export declare function isValidNormAmount(amount: string): boolean;
export declare function convertNormAmountToBaseAmount(amount: string): string;
export declare function convertBaseAmountToNormAmount(amount: string): string;
export declare function getUrlForAddr(network: string, addr: string): string;
export declare function getUrlForTx(network: string, txid: string): string;
export declare function encodePubkeyToAddr(network: string, pubkey: string, type?: AddressType): string;
export declare function getFeeOptions(network: string): Promise<string[]>;
export declare function getHistorySchema(): ITransactionSchema[];
export declare function submitTransaction(network: string, signedTx: string): Promise<string>;
export declare function prepareCommandGetPubkey(network: string, accountIndex: number, type?: AddressType): IArmadilloCommand;
export declare function parsePubkeyResponse(walletRsp: IArmadilloResponse): string;
export declare function prepareCommandShowAddr(network: string, accountIndex: number, type?: AddressType): IArmadilloCommand;
export declare function getBalance(network: string, addr: string): Promise<string>;
export declare function getRecentHistory(network: string, addr: string): Promise<ITransaction[]>;
export declare function getPreparedTxSchema(): ITransactionSchema[];
export declare function prepareCommandSignTx(req: ISignTxRequest): Promise<[IArmadilloCommand, ITransaction]>;
export declare function buildSignedTx(req: ISignTxRequest, preparedTx: IArmadilloCommand, walletRsp: IArmadilloResponse): string;
