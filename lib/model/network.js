"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var bitcoin = __importStar(require("bitcoinjs-lib"));
var Networks;
(function (Networks) {
    Networks["MAINNET"] = "mainnet";
    Networks["TESTNET"] = "testnet";
})(Networks = exports.Networks || (exports.Networks = {}));
exports.supportedNetworks = (_a = {},
    _a[Networks.MAINNET] = {
        config: bitcoin.networks.bitcoin,
        apiUrl: 'https://blockstream.info/api',
        explorerUrl: 'https://live.blockcypher.com/btc',
        isTestnet: false,
    },
    _a[Networks.TESTNET] = {
        config: bitcoin.networks.testnet,
        apiUrl: 'https://blockstream.info/testnet/api',
        explorerUrl: 'https://live.blockcypher.com/btc-testnet',
        isTestnet: true,
    },
    _a);
