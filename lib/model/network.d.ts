import * as bitcoin from 'bitcoinjs-lib';
export declare enum Networks {
    MAINNET = "mainnet",
    TESTNET = "testnet"
}
export interface IBitcoinNetwork {
    config: bitcoin.Network;
    apiUrl: string;
    explorerUrl: string;
    isTestnet: boolean;
}
export declare const supportedNetworks: {
    [network: string]: IBitcoinNetwork;
};
