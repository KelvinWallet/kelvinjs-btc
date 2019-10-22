import * as classify from 'bitcoinjs-lib/src/classify';

export enum AddressType {
  LEGACY = 'LEGACY',
  P2SH = 'P2SH',
  BECH32 = 'BECH32',
}

export enum ScriptType {
  P2PKH_PKHASH = 0,
  P2SH_SHASH = 1,
  P2WPKH_PKHASH = 2,
  P2WSH_SHASH = 3,
  UNKNOWN_SCRIPT = 4,
}

export const ClassifyTypeToAddressType = {
  [classify.types.P2PKH]: AddressType.LEGACY,
  [classify.types.P2SH]: AddressType.P2SH,
  [classify.types.P2WPKH]: AddressType.BECH32,
};

export const ClassifyTypeToScriptType = {
  [classify.types.P2PKH]: ScriptType.P2PKH_PKHASH,
  [classify.types.P2SH]: ScriptType.P2SH_SHASH,
  [classify.types.P2WPKH]: ScriptType.P2WPKH_PKHASH,
  [classify.types.P2WSH]: ScriptType.P2WSH_SHASH,
  [classify.types.NONSTANDARD]: ScriptType.UNKNOWN_SCRIPT,
};
