/// <reference types="node" />
import { AddressType } from './address';
export interface IBlockstreamAddressResponse {
    address: string;
    chain_stats: {
        funded_txo_count: number;
        funded_txo_sum: number;
        spent_txo_count: number;
        spent_txo_sum: number;
        tx_count: number;
    };
    mempool_stats: {
        funded_txo_count: number;
        funded_txo_sum: number;
        spent_txo_count: number;
        spent_txo_sum: number;
        tx_count: number;
    };
}
export interface IBlockstreamTxInput {
    txid: string;
    vout: number;
    prevout: {
        scriptpubkey: string;
        scriptpubkey_asm: string;
        scriptpubkey_address: string;
        scriptpubkey_type: string;
        value: number;
    };
    scriptsig: string;
    scriptsig_asm: string;
    is_coinbase: boolean;
    sequence: number;
}
export interface IBlockstreamTxOutput {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_address: string;
    scriptpubkey_type: string;
    value: number;
}
export interface IBlockstreamTxStatus {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
}
export interface IBlockstreamTransactionResponse {
    txid: string;
    version: number;
    locktime: number;
    vin: IBlockstreamTxInput[];
    vout: IBlockstreamTxOutput[];
    size: number;
    weight: number;
    fee: number;
    status: IBlockstreamTxStatus;
}
export interface IBlockstreamUnspentResponse {
    txid: string;
    vout: number;
    status: {
        confirmed: boolean;
        block_height: number;
        block_hash: string;
        block_time: number;
    };
    value: number;
}
export interface ISignResponse {
    r: Buffer;
    s: Buffer;
}
export interface IOutput {
    type: AddressType;
    address: string;
    value: number;
}
export interface IUnspent {
    type: AddressType;
    txId: string;
    vout: number;
    value: number;
    isChange?: boolean;
    confirmations: boolean;
}
