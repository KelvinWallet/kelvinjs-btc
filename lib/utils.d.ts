/// <reference types="node" />
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import * as ArmadilloProtob from 'kelvinjs-protob';
import { AddressType, ScriptType } from './model/address';
export declare function getAccountPath(index: number): number[];
export declare type BufferInput = string | number | Buffer | BigNumber | undefined;
export declare function toSafeBuffer(value: BufferInput): Buffer;
export declare function hexencode(arr: Uint8Array | number[], addHexPrefix?: boolean): string;
export declare function hexdecode(hexstring: string): Buffer;
export declare function addressTypeToMode(inputType: AddressType): ArmadilloProtob.Bitcoin.BtcCommand.BtcMode;
export declare function convertToScript(network: bitcoin.Network, address: string): [ScriptType, Buffer];
export declare function createPkhashFromPKey(publicKey: string, type: AddressType): string;
export declare function pkhashToAddress(network: bitcoin.Network, pkhash: string, type: AddressType): string;
