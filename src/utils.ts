import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import * as classify from 'bitcoinjs-lib/src/classify';
import * as ArmadilloProtob from 'kelvinjs-protob';
import secp256k1 from 'secp256k1';

import { AddressType, ClassifyTypeToScriptType, ScriptType } from './model/address';

export function getAccountPath(index: number): number[] {
  return [0x80000000 + index, 0, 0];
}

export type BufferInput = string | number | Buffer | BigNumber | undefined;

export function toSafeBuffer(value: BufferInput): Buffer {
  let result: Buffer;
  if (typeof value === 'string') {
    if (!/^(0x)?([0-9a-fA-F]+)?$/.test(value)) {
      throw Error(`invalid string: "${value}"`);
    }
    if (/^[0-9]+$/.test(value)) {
      const bigNumber = new BigNumber(value);
      result = hexdecode(bigNumber.toString(16));
    } else {
      result = hexdecode(value);
    }
  } else if (typeof value === 'number') {
    if (value < 0 || Math.floor(value) !== value) {
      throw Error(`invalid number: ${value}, only accept uint`);
    }

    const byteLength = Math.max(1, Math.ceil(Math.log2(value) / 8));
    result = Buffer.alloc(byteLength);
    result.writeUIntBE(value, 0, byteLength);
  } else if (value instanceof Buffer) {
    result = value;
  } else if (value instanceof BigNumber) {
    result = hexdecode(value.toString(16));
  } else if (typeof value === 'undefined') {
    result = Buffer.alloc(0);
  } else {
    throw Error(`invalid type ${typeof value}`);
  }

  while (result[0] === 0) {
    result = result.slice(1);
  }

  return result;
}

export function hexencode(arr: Uint8Array | number[], addHexPrefix: boolean = false): string {
  if (!(arr instanceof Uint8Array || arr instanceof Array)) {
    throw new Error('input type error');
  }

  const uint8Array = new Uint8Array(arr);
  const buffer = Buffer.from(uint8Array);

  if (addHexPrefix) {
    return `0x${buffer.toString('hex')}`;
  } else {
    return buffer.toString('hex');
  }
}

export function hexdecode(hexstring: string): Buffer {
  let str = hexstring;
  if (/^0x/.test(hexstring)) {
    str = hexstring.slice(2);
  }

  return Buffer.from(str, 'hex');
}

export function addressTypeToMode(inputType: AddressType): ArmadilloProtob.Bitcoin.BtcCommand.BtcMode {
  switch (inputType) {
    case AddressType.LEGACY:
      return ArmadilloProtob.Bitcoin.BtcCommand.BtcMode.P2PKH;
    case AddressType.BECH32:
      return ArmadilloProtob.Bitcoin.BtcCommand.BtcMode.P2WPKH;
    case AddressType.P2SH:
    default:
      return ArmadilloProtob.Bitcoin.BtcCommand.BtcMode.P2SH_P2WPKH;
  }
}

export function convertToScript(network: bitcoin.Network, address: string): [ScriptType, Buffer] {
  const type = classify.output(bitcoin.address.toOutputScript(address, network));
  switch (type) {
    case classify.types.P2WPKH:
    case classify.types.P2WSH:
      try {
        const result = bitcoin.address.fromBech32(address);
        return [
          ClassifyTypeToScriptType[type],
          result.data,
        ];
      } catch (error) {
        throw Error('unsupported script');
      }
    case classify.types.P2PKH:
    case classify.types.P2SH:
      try {
        const result = bitcoin.address.fromBase58Check(address);
        return [
          ClassifyTypeToScriptType[type],
          result.hash,
        ];
      } catch (error) {
        throw Error('unsupported script');
      }
    default:
      throw Error('unsupported script');
  }
}

export function createPkhashFromPKey(publicKey: string, type: AddressType): string {
  if (!/^04[0-9a-fA-F]{128}$/.test(publicKey)) {
    throw Error('invalid public key');
  }
  const pubkey = secp256k1.publicKeyConvert(hexdecode(publicKey), true);
  switch (type) {
    case AddressType.LEGACY:
      const { hash: p2pkh } = bitcoin.payments.p2pkh({ pubkey });
      if (!p2pkh) {
        throw Error('unexpected error');
      }

      return p2pkh.toString('hex');
    case AddressType.P2SH:
      const { hash: p2sh } = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({ pubkey }),
      });
      if (!p2sh) {
        throw Error('unexpected error');
      }

      return p2sh.toString('hex');
    case AddressType.BECH32:
      const { hash: p2wpkh } = bitcoin.payments.p2wpkh({ pubkey });
      if (!p2wpkh) {
        throw Error('unexpected error');
      }

      return p2wpkh.toString('hex');
    default:
      return '';
  }
}

export function pkhashToAddress(network: bitcoin.Network, pkhash: string, type: AddressType): string {
  try {
    const hash = hexdecode(pkhash);
    switch (type) {
      case AddressType.LEGACY:
        return bitcoin.address.toBase58Check(hash, network.pubKeyHash);
      case AddressType.P2SH:
        return bitcoin.address.toBase58Check(hash, network.scriptHash);
      case AddressType.BECH32:
        return bitcoin.address.toBech32(hash, 0, network.bech32);
      default:
        return '';
    }
  } catch (error) {
    console.error(error);
    return '';
  }

}
