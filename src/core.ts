import axios from 'axios';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import * as classify from 'bitcoinjs-lib/src/classify';
import coinSelect from 'coinselect';
import * as ArmadilloProtob from 'kelvinjs-protob';

import { AddressType, ClassifyTypeToAddressType, ScriptType } from './model/address';
import {
  IArmadilloCommand,
  IArmadilloResponse,
  ISignTxRequest,
  ITransaction,
  ITransactionSchema,
} from './model/currency';
import {
  IBitcoinNetwork,
  Networks,
  supportedNetworks,
} from './model/network';
import {
  IBlockstreamAddressResponse,
  IBlockstreamTransactionResponse,
  IBlockstreamUnspentResponse,
  IOutput,
  IUnspent,
} from './model/transaction';
import * as Utils from './utils';

const unit = new BigNumber(Math.pow(10, 8));

export function getSupportedNetworks(): string[] {
  return [Networks.MAINNET, Networks.TESTNET];
}

export function getSupportedNetwork(network: string): IBitcoinNetwork {
  if (!getSupportedNetworks().includes(network)) {
    throw Error(`invalid network: ${network}`);
  }

  return supportedNetworks[network];
}

export function getFeeOptionUnit(): string {
  return 'sat/kB';
}

export function isValidFeeOption(network: string, feeOpt: string): boolean {
  if (!getSupportedNetworks().includes(network)) {
    throw Error(`invalid network: ${network}`);
  }

  const feeRate = parseFloat(feeOpt);
  return !Number.isNaN(feeRate) && feeRate > 0;
}

export function isValidAddr(network: string, addr: string): boolean {
  const btcNetwork: IBitcoinNetwork = getSupportedNetwork(network);

  try {
    bitcoin.address.toOutputScript(addr, btcNetwork.config);
    return true;
  } catch (error) {
    return false;
  }
}

export function isValidNormAmount(amount: string): boolean {
  if (!/^(0|[1-9][0-9]*)(\.[0-9]*)?$/.test(amount)) {
    return false;
  }

  const amountNumber = new BigNumber(amount, 10);
  if (amountNumber.isNaN()) {
    return false;
  }

  if (amountNumber.isInteger()) {
    return true;
  }

  let fraction = amount.split('.')[1];
  while (fraction.substr(fraction.length - 1) === '0') {
    fraction = fraction.slice(0, fraction.length - 2);
  }

  if (fraction.length > 5) {
    return false;
  }

  return true;
}

export function convertNormAmountToBaseAmount(amount: string): string {
  if (isValidNormAmount(amount)) {
    return (new BigNumber(amount, 10)).multipliedBy(unit).toString();
  } else {
    throw Error('invalid amount');
  }
}

export function convertBaseAmountToNormAmount(amount: string): string {
  const amountNumber = new BigNumber(amount, 10);
  if (amountNumber.isNaN() || !amountNumber.isInteger()) {
    throw Error('invalid amount');
  }

  return amountNumber.dividedBy(unit).toString();
}

function explorerUrlOfNetwork(network: string): string {
  const btcNetwork: IBitcoinNetwork = getSupportedNetwork(network);

  return btcNetwork.explorerUrl;
}

export function getUrlForAddr(network: string, addr: string): string {
  return `${explorerUrlOfNetwork(network)}/address/${addr}`;
}

export function getUrlForTx(network: string, txid: string): string {
  return `${explorerUrlOfNetwork(network)}/tx/${txid}`;
}

export function encodePubkeyToAddr(network: string, pubkey: string, type: AddressType = AddressType.P2SH): string {
  const btcNetwork: IBitcoinNetwork = getSupportedNetwork(network);

  if (!/^04[0-9a-fA-F]{128}$/.test(pubkey)) {
    throw Error('invalid uncompressed public key');
  }

  const pkhash = Utils.createPkhashFromPKey(pubkey, type);
  const address = Utils.pkhashToAddress(btcNetwork.config, pkhash, type);

  return address;
}

export async function getFeeOptions(network: string): Promise<string[]> {
  const btcNetwork: IBitcoinNetwork = getSupportedNetwork(network);

  const response = await axios.get(`${btcNetwork.apiUrl}/fee-estimates`, { validateStatus: () => true });
  return [`${response.data['2']}`, `${response.data['4']}`, `${response.data['10']}`];
}

export function getHistorySchema(): ITransactionSchema[] {
  return [
    {
      key: 'type',
      format: 'string',
      label: 'Type',
    },
    {
      key: 'date',
      format: 'date',
      label: 'Date',
    },
    {
      key: 'txid',
      format: 'hash',
      label: 'TxHash',
    },
    {
      key: 'to',
      format: 'address',
      label: 'To',
    },
    {
      key: 'value',
      format: 'value',
      label: 'Value',
    },
    {
      key: 'fee',
      format: 'value',
      label: 'Fee',
    },
    {
      key: 'isConfirmed',
      label: 'isConfirmed',
      format: 'boolean',
    },
  ];
}

export async function submitTransaction(network: string, signedTx: string): Promise<string> {
  const btcNetwork: IBitcoinNetwork = getSupportedNetwork(network);

  const resp = await axios.post(`${btcNetwork.apiUrl}/tx`, signedTx, {
    headers: {
      'Content-Type': 'text/plain',
    },
    validateStatus: () => true,
  });
  if (resp.status !== 200) {
    throw new Error(resp.data);
  }

  return resp.data as string;
}

export function prepareCommandGetPubkey(
  network: string, accountIndex: number, type: AddressType = AddressType.P2SH,
): IArmadilloCommand {
  const btcNetwork: IBitcoinNetwork = getSupportedNetwork(network);

  const req = new ArmadilloProtob.Bitcoin.BtcCommand();
  const msg = new ArmadilloProtob.Bitcoin.BtcCommand.BtcGetXPub();
  const pathList: number[] = Utils.getAccountPath(accountIndex);

  if (pathList.length !== 3) {
    throw Error('invalid path');
  }

  msg.setPathList(pathList);
  req.setTestnet(btcNetwork.isTestnet);
  req.setMode(Utils.addressTypeToMode(type));
  req.setGetXpub(msg);

  return {
    commandId: ArmadilloProtob.BITCOIN_CMDID,
    payload: Buffer.from(req.serializeBinary()),
  };
}

export function parsePubkeyResponse(walletRsp: IArmadilloResponse): string {
  const response = ArmadilloProtob.Bitcoin.BtcResponse.deserializeBinary(walletRsp.payload);
  const data = response.getXpub();
  if (!data) {
    throw Error('invalid wallet response');
  }
  const publicKey: Buffer = Buffer.concat([
    Buffer.from([0x04]),
    Buffer.from(data.getXpub_asU8().slice(0, 64)),
  ]);

  return publicKey.toString('hex');
}

export function prepareCommandShowAddr(
  network: string, accountIndex: number, type: AddressType = AddressType.P2SH,
): IArmadilloCommand {
  const btcNetwork: IBitcoinNetwork = getSupportedNetwork(network);

  const req = new ArmadilloProtob.Bitcoin.BtcCommand();
  const msg = new ArmadilloProtob.Bitcoin.BtcCommand.BtcShowAddr();
  const pathList: number[] = Utils.getAccountPath(accountIndex);

  if (pathList.length !== 3) {
    throw Error('invalid path');
  }

  msg.setPathList(pathList);
  req.setTestnet(btcNetwork.isTestnet);
  req.setMode(Utils.addressTypeToMode(type));
  req.setShowAddr(msg);

  return {
    commandId: ArmadilloProtob.BITCOIN_CMDID,
    payload: Buffer.from(req.serializeBinary()),
  };
}

export async function getBalance(network: string, addr: string): Promise<string> {
  const btcNetwork: IBitcoinNetwork = getSupportedNetwork(network);
  const resp = await axios(`${btcNetwork.apiUrl}/address/${addr}`, { validateStatus: () => true });
  const data = resp.data as IBlockstreamAddressResponse;
  if (resp.status !== 200) {
    throw new Error(resp.data);
  }

  return convertBaseAmountToNormAmount(`${data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum}`);
}

export async function getRecentHistory(network: string, addr: string): Promise<ITransaction[]> {
  const btcNetwork: IBitcoinNetwork = getSupportedNetwork(network);
  const resp = await axios(`${btcNetwork.apiUrl}/address/${addr}/txs`, { validateStatus: () => true });
  if (resp.status !== 200) {
    throw new Error(resp.data);
  }

  const result = resp.data as IBlockstreamTransactionResponse[];

  return result.map<ITransaction>((tx) => {
    const isSelf = tx.vout.every((vout) => vout.scriptpubkey_address === addr);
    const isSent = tx.vin.some((vin) => !!vin.prevout && vin.prevout.scriptpubkey_address === addr);
    const input = tx.vin.reduce<number>((sum, vin) => sum + (!!vin.prevout && vin.prevout.value || 0), 0);
    const output = tx.vout.reduce<number>((sum, vout) => sum + vout.value, 0);
    const change = isSelf ? (
      tx.vout.length > 1 ? (
        tx.vout
          .slice(tx.vout.length - 1)
          .reduce<number>((sum, vout) => sum + vout.value, 0)
      ) : 0
    ) : (
      tx.vout
        .filter((vout) => vout.scriptpubkey_address === addr)
        .reduce<number>((sum, vout) => sum + vout.value, 0)
    );
    const toAddress = isSelf ? addr : tx.vout
      .filter((vout) => vout.scriptpubkey_address !== addr)
      .reduce<string>((_, item) => item.scriptpubkey_address, '');
    const date = tx.status.confirmed ? new Date(tx.status.block_time * 1000) : new Date();

    return {
      type: {
        value: isSelf ? 'Self' : (isSent ? 'Sent' : 'Received'),
      },
      date: {
        value: date.toISOString(),
      },
      txid: {
        value: tx.txid,
        link: getUrlForTx(network, tx.txid),
      },
      to: {
        value: toAddress,
        link: getUrlForAddr(network, toAddress),
      },
      value: {
        value: convertBaseAmountToNormAmount(`${output - change}`),
      },
      fee: {
        value: convertBaseAmountToNormAmount(`${input - output}`),
      },
      isConfirmed: {
        value: '' + tx.status.confirmed,
      },
    };
  });
}

export function getPreparedTxSchema(): ITransactionSchema[] {
  return [
    {
      key: 'value',
      format: 'value',
      label: 'Value',
    },
    {
      key: 'to',
      format: 'address',
      label: 'To Address',
    },
    {
      key: 'fee',
      format: 'value',
      label: 'Fee',
    },
  ];
}

async function getAccountUnspents(network: IBitcoinNetwork, address: string, type: AddressType): Promise<IUnspent[]> {
  const resp = await axios(`${network.apiUrl}/address/${address}/utxo`, { validateStatus: () => true });
  if (resp.status !== 200) {
    throw new Error(resp.data);
  }

  const result = resp.data as IBlockstreamUnspentResponse[];
  return result.map<IUnspent>((item) => ({
    type,
    txId: item.txid,
    vout: item.vout,
    value: item.value,
    confirmations: item.status.confirmed,
  }));
}

export async function prepareCommandSignTx(req: ISignTxRequest): Promise<[IArmadilloCommand, ITransaction]> {
  const btcNetwork = getSupportedNetwork(req.network);

  if (req.accountIndex < 0) {
    throw Error('invalid account index');
  }

  if (!req.feeOpt) {
    throw Error('no fee option');
  }

  if (!isValidAddr(req.network, req.toAddr)) {
    throw Error('invalid to address');
  }

  if (!isValidNormAmount(req.amount)) {
    throw Error('invalid amount');
  }

  const from = encodePubkeyToAddr(req.network, req.fromPubkey);
  const to = req.toAddr;

  if (from === to) {
    throw Error('sending funds back to the same address is prohibited');
  }

  const value = convertNormAmountToBaseAmount(req.amount);

  const inputType = classify.output(bitcoin.address.toOutputScript(from, btcNetwork.config));
  const utxos = await getAccountUnspents(btcNetwork, from, ClassifyTypeToAddressType[inputType]);

  const outputType = classify.output(bitcoin.address.toOutputScript(to, btcNetwork.config));
  const output: IOutput[] = [
    {
      address: to,
      value: parseInt(value, 10),
      type: ClassifyTypeToAddressType[outputType],
    },
  ];

  const feeRate = parseFloat(req.feeOpt);

  const res = coinSelect<IUnspent, IOutput>(utxos, output, feeRate);
  if (!res.outputs) {
    throw new Error(`Can't select output, please check your balance`);
  }
  if (!res.inputs) {
    throw new Error('No inputs');
  }
  if (res.inputs.length > 10) {
    throw new Error(`Can't select output, too long to handle`);
  }

  if (res.outputs.length === output.length + 1) {
    // set change to inPkhash
    res.outputs[res.outputs.length - 1].address = from;
    res.outputs[res.outputs.length - 1].type = ClassifyTypeToAddressType[inputType];
  }

  const inputs = res.inputs.map((i) => {
    const txIn = new ArmadilloProtob.Bitcoin.BtcCommand.BtcSignTx.BtcTxIn();
    const pathList: number[] = Utils.getAccountPath(req.accountIndex);
    if (pathList.length !== 3) {
      throw Error('invalid path');
    }

    txIn.setPathList(pathList);
    txIn.setPrevTid(Utils.hexdecode(i.txId).reverse());
    txIn.setPrevIndex(i.vout);
    txIn.setValue(i.value);
    return txIn;
  });

  const outputs = res.outputs.map((o) => {
    const txOut = new ArmadilloProtob.Bitcoin.BtcCommand.BtcSignTx.BtcTxOut();
    if (o.value < 0 || Math.floor(o.value) !== o.value)  {
      throw new Error('invalid output value');
    }
    txOut.setValue(o.value);

    const [scriptType, publicKeyScript] = Utils.convertToScript(btcNetwork.config, o.address);
    switch (scriptType) {
      case ScriptType.P2PKH_PKHASH:
        if (publicKeyScript.length !== 20)  {
          throw new Error('invalid public key script');
        }
        txOut.setP2pkhPkhash(publicKeyScript);
        break;
      case ScriptType.P2SH_SHASH:
        if (publicKeyScript.length !== 20)  {
          throw new Error('invalid public key script');
        }
        txOut.setP2shShash(publicKeyScript);
        break;
      case ScriptType.P2WPKH_PKHASH:
        if (publicKeyScript.length !== 20)  {
          throw new Error('invalid public key script');
        }
        txOut.setP2wpkhPkhash(publicKeyScript);
        break;
      case ScriptType.P2WSH_SHASH:
        if (publicKeyScript.length !== 32)  {
          throw new Error('invalid public key script');
        }
        txOut.setP2wshShash(publicKeyScript);
        break;
      case ScriptType.UNKNOWN_SCRIPT:
        txOut.setUnknownScript(publicKeyScript);
        break;
      default:
        throw Error(`unexpected script type: ${scriptType}`);
    }

    return txOut;
  });

  const command = new ArmadilloProtob.Bitcoin.BtcCommand();
  const msg = new ArmadilloProtob.Bitcoin.BtcCommand.BtcSignTx();

  msg.setInputsList(inputs);
  msg.setOutputsList(outputs);

  command.setTestnet(btcNetwork.isTestnet);
  command.setMode(Utils.addressTypeToMode(ClassifyTypeToAddressType[inputType]));
  command.setSignTx(msg);

  const armadillCommand: IArmadilloCommand = {
    commandId: ArmadilloProtob.BITCOIN_CMDID,
    payload: Buffer.from(command.serializeBinary()),
  };

  const transaction: ITransaction = {
    to: {
      value: to,
      link: getUrlForAddr(req.network, to),
    },
    value: {
      value: req.amount,
    },
    fee: {
      value: convertBaseAmountToNormAmount(`${res.fee}`),
    },
  };

  return [armadillCommand, transaction];
}

export function buildSignedTx(
  req: ISignTxRequest,
  preparedTx: IArmadilloCommand,
  walletRsp: IArmadilloResponse,
): string {
  const response = ArmadilloProtob.Bitcoin.BtcResponse.deserializeBinary(walletRsp.payload);

  const data = response.getSignedTx();
  if (!data) {
    throw Error('invalid wallet response');
  }

  return Buffer.from(data.getRawtx_asU8()).toString('hex');
}
