import { expect } from 'chai';

import { KelvinWallet } from 'kelvinjs-usbhid';
import Bitcoin from '../src/index';
import { IArmadilloCommand, ISignTxRequest } from '../src/model/currency';
import { Networks } from '../src/model/network';
import * as Utils from '../src/utils';

function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function send(command: IArmadilloCommand): Promise<string> {
  const device = new KelvinWallet();
  const [status, buffer] = device.send(
    command.commandId,
    command.payload,
  );

  device.close();

  if (status !== 0) {
    throw Error(`error status code ${status}`);
  }

  return buffer.toString('hex');
}

const bitcoin = new Bitcoin();

let address: string = '';
let toAddress: string = '';
let publicKey: string = '';
let feeOpts: string[] = [];

describe('Bitcoin Test', async () => {
  it('prepareCommandGetPubkey(1)', async () => {
    const command = bitcoin.prepareCommandGetPubkey(Networks.TESTNET, 1);
    const response = await send(command);
    publicKey = bitcoin.parsePubkeyResponse({ payload: Utils.hexdecode(response) });
    toAddress = bitcoin.encodePubkeyToAddr(Networks.TESTNET, publicKey);

    expect(publicKey).to.be.a('string');
    expect(bitcoin.isValidAddr(Networks.TESTNET, toAddress)).to.be.true; // tslint:disable-line

    console.log(toAddress);
  });

  it('prepareCommandGetPubkey()', async () => {
    const command = bitcoin.prepareCommandGetPubkey(Networks.TESTNET, 0);
    const response = await send(command);
    publicKey = bitcoin.parsePubkeyResponse({ payload: Utils.hexdecode(response) });
    address = bitcoin.encodePubkeyToAddr(Networks.TESTNET, publicKey);

    expect(publicKey).to.be.a('string');
    expect(bitcoin.isValidAddr(Networks.TESTNET, address)).to.be.true; // tslint:disable-line

    console.log(address);
  });

  it('prepareCommandShowAddr()', async () => {
    const command = bitcoin.prepareCommandShowAddr(Networks.TESTNET, 0);
    const response = await send(command);

    expect(response).to.be.a('string');
    expect(response).to.deep.eq('0800');
  }).timeout(60000);

  it('getBalance()', async () => {
    const balance = await bitcoin.getBalance(Networks.TESTNET, address);

    expect(balance).to.be.a('string');
    console.log(balance);
  });

  it('getFeeOptions()', async () => {
    feeOpts = await bitcoin.getFeeOptions(Networks.TESTNET);

    expect(feeOpts).to.be.instanceof(Array);
    expect(feeOpts.length).to.be.gte(0);
    expect(feeOpts[0]).to.be.a('string');
    expect(bitcoin.isValidFeeOption(Networks.TESTNET, feeOpts[0])).to.be.true; // tslint:disable-line
  });

  it('getRecentHistory()', async () => {
    const schema = bitcoin.getHistorySchema();
    const txList = await bitcoin.getRecentHistory(Networks.TESTNET, address);

    expect(txList).to.be.instanceof(Array);

    for (let i = 0; i < txList.length && i < 10; i++) {
      const tx = txList[i];
      for (const field of schema) {
        console.log(field.label, ':', tx[field.key].value);
      }
      console.log();
    }
  });

  it('sign & submit tx', async () => {
    const schema = bitcoin.getPreparedTxSchema();
    const req: ISignTxRequest = {
      network: Networks.TESTNET,
      accountIndex: 0,
      toAddr: toAddress,
      fromPubkey: publicKey,
      amount: '0.0001',
      feeOpt: feeOpts[0],
    };
    const [command, txinfo] = await bitcoin.prepareCommandSignTx(req);

    expect(command.commandId).to.be.a('number');
    expect(command.payload).to.be.instanceof(Buffer);
    expect(txinfo).to.be.a('object');
    Object.keys(txinfo).forEach((key) => {
      expect(txinfo[key].value).to.be.a('string');
    });

    for (const field of schema) {
      console.log(field.label, ':', txinfo[field.key].value);
    }
    console.log();

    const walletResp = await send(command);
    expect(walletResp).to.be.a('string');

    const signedTx = bitcoin.buildSignedTx(req, command, { payload: Utils.hexdecode(walletResp)});
    expect(signedTx).to.be.a('string');
    expect(signedTx).to.match(/^[0-9a-fA-F]+$/);
    console.log(signedTx);

    const txhash = await bitcoin.submitTransaction(Networks.TESTNET, signedTx);
    console.log(txhash);
  }).timeout(60000);
});
