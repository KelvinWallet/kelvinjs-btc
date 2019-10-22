"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Core = __importStar(require("./core"));
var Bitcoin = /** @class */ (function () {
    function Bitcoin() {
    }
    Bitcoin.prototype.getSupportedNetworks = function () {
        return Core.getSupportedNetworks();
    };
    Bitcoin.prototype.getFeeOptionUnit = function () {
        return Core.getFeeOptionUnit();
    };
    Bitcoin.prototype.isValidFeeOption = function (network, feeOpt) {
        return Core.isValidFeeOption(network, feeOpt);
    };
    Bitcoin.prototype.isValidAddr = function (network, addr) {
        return Core.isValidAddr(network, addr);
    };
    Bitcoin.prototype.isValidNormAmount = function (amount) {
        return Core.isValidNormAmount(amount);
    };
    Bitcoin.prototype.convertNormAmountToBaseAmount = function (amount) {
        return Core.convertNormAmountToBaseAmount(amount);
    };
    Bitcoin.prototype.convertBaseAmountToNormAmount = function (amount) {
        return Core.convertBaseAmountToNormAmount(amount);
    };
    Bitcoin.prototype.getUrlForAddr = function (network, addr) {
        return Core.getUrlForAddr(network, addr);
    };
    Bitcoin.prototype.getUrlForTx = function (network, txid) {
        return Core.getUrlForTx(network, txid);
    };
    Bitcoin.prototype.encodePubkeyToAddr = function (network, pubkey) {
        return Core.encodePubkeyToAddr(network, pubkey);
    };
    Bitcoin.prototype.getBalance = function (network, addr) {
        return Core.getBalance(network, addr);
    };
    Bitcoin.prototype.getHistorySchema = function () {
        return Core.getHistorySchema();
    };
    Bitcoin.prototype.getRecentHistory = function (network, addr) {
        return Core.getRecentHistory(network, addr);
    };
    Bitcoin.prototype.getFeeOptions = function (network) {
        return Core.getFeeOptions(network);
    };
    Bitcoin.prototype.getPreparedTxSchema = function () {
        return Core.getPreparedTxSchema();
    };
    Bitcoin.prototype.prepareCommandSignTx = function (req) {
        return Core.prepareCommandSignTx(req);
    };
    Bitcoin.prototype.buildSignedTx = function (req, preparedTx, walletRsp) {
        return Core.buildSignedTx(req, preparedTx, walletRsp);
    };
    Bitcoin.prototype.submitTransaction = function (network, signedTx) {
        return Core.submitTransaction(network, signedTx);
    };
    Bitcoin.prototype.prepareCommandGetPubkey = function (network, accountIndex) {
        return Core.prepareCommandGetPubkey(network, accountIndex);
    };
    Bitcoin.prototype.parsePubkeyResponse = function (walletRsp) {
        return Core.parsePubkeyResponse(walletRsp);
    };
    Bitcoin.prototype.prepareCommandShowAddr = function (network, accountIndex) {
        return Core.prepareCommandShowAddr(network, accountIndex);
    };
    return Bitcoin;
}());
exports.default = Bitcoin;
