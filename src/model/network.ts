import * as bitcoin from 'bitcoinjs-lib';

export enum Networks {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

export interface IBitcoinNetwork {
  config: bitcoin.Network;
  apiUrl: string;
  explorerUrl: string;
  isTestnet: boolean;
}

export const supportedNetworks: { [network: string]: IBitcoinNetwork } = {
  [Networks.MAINNET]: {
    config: bitcoin.networks.bitcoin,
    apiUrl: 'https://blockstream.info/api',
    explorerUrl: 'https://live.blockcypher.com/btc',
    isTestnet: false,
  },
  [Networks.TESTNET]: {
    config: bitcoin.networks.testnet,
    apiUrl: 'https://blockstream.info/testnet/api',
    explorerUrl: 'https://live.blockcypher.com/btc-testnet',
    isTestnet: true,
  },
};
