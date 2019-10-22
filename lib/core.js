"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var bitcoin = __importStar(require("bitcoinjs-lib"));
var classify = __importStar(require("bitcoinjs-lib/src/classify"));
var coinselect_1 = __importDefault(require("coinselect"));
var ArmadilloProtob = __importStar(require("kelvinjs-protob"));
var address_1 = require("./model/address");
var network_1 = require("./model/network");
var Utils = __importStar(require("./utils"));
var unit = new bignumber_js_1.default(Math.pow(10, 8));
function getSupportedNetworks() {
    return [network_1.Networks.MAINNET, network_1.Networks.TESTNET];
}
exports.getSupportedNetworks = getSupportedNetworks;
function getSupportedNetwork(network) {
    if (!getSupportedNetworks().includes(network)) {
        throw Error("invalid network: " + network);
    }
    return network_1.supportedNetworks[network];
}
exports.getSupportedNetwork = getSupportedNetwork;
function getFeeOptionUnit() {
    return 'sat/kB';
}
exports.getFeeOptionUnit = getFeeOptionUnit;
function isValidFeeOption(network, feeOpt) {
    if (!getSupportedNetworks().includes(network)) {
        throw Error("invalid network: " + network);
    }
    var feeRate = parseFloat(feeOpt);
    return !Number.isNaN(feeRate) && feeRate > 0;
}
exports.isValidFeeOption = isValidFeeOption;
function isValidAddr(network, addr) {
    var btcNetwork = getSupportedNetwork(network);
    try {
        bitcoin.address.toOutputScript(addr, btcNetwork.config);
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.isValidAddr = isValidAddr;
function isValidNormAmount(amount) {
    if (!/^(0|[1-9][0-9]*)(\.[0-9]*)?$/.test(amount)) {
        return false;
    }
    var amountNumber = new bignumber_js_1.default(amount, 10);
    if (amountNumber.isNaN()) {
        return false;
    }
    if (amountNumber.isInteger()) {
        return true;
    }
    var fraction = amount.split('.')[1];
    while (fraction.substr(fraction.length - 1) === '0') {
        fraction = fraction.slice(0, fraction.length - 2);
    }
    if (fraction.length > 5) {
        return false;
    }
    return true;
}
exports.isValidNormAmount = isValidNormAmount;
function convertNormAmountToBaseAmount(amount) {
    if (isValidNormAmount(amount)) {
        return (new bignumber_js_1.default(amount, 10)).multipliedBy(unit).toString();
    }
    else {
        throw Error('invalid amount');
    }
}
exports.convertNormAmountToBaseAmount = convertNormAmountToBaseAmount;
function convertBaseAmountToNormAmount(amount) {
    var amountNumber = new bignumber_js_1.default(amount, 10);
    if (amountNumber.isNaN() || !amountNumber.isInteger()) {
        throw Error('invalid amount');
    }
    return amountNumber.dividedBy(unit).toString();
}
exports.convertBaseAmountToNormAmount = convertBaseAmountToNormAmount;
function explorerUrlOfNetwork(network) {
    var btcNetwork = getSupportedNetwork(network);
    return btcNetwork.explorerUrl;
}
function getUrlForAddr(network, addr) {
    return explorerUrlOfNetwork(network) + "/address/" + addr;
}
exports.getUrlForAddr = getUrlForAddr;
function getUrlForTx(network, txid) {
    return explorerUrlOfNetwork(network) + "/tx/" + txid;
}
exports.getUrlForTx = getUrlForTx;
function encodePubkeyToAddr(network, pubkey, type) {
    if (type === void 0) { type = address_1.AddressType.P2SH; }
    var btcNetwork = getSupportedNetwork(network);
    if (!/^04[0-9a-fA-F]{128}$/.test(pubkey)) {
        throw Error('invalid uncompressed public key');
    }
    var pkhash = Utils.createPkhashFromPKey(pubkey, type);
    var address = Utils.pkhashToAddress(btcNetwork.config, pkhash, type);
    return address;
}
exports.encodePubkeyToAddr = encodePubkeyToAddr;
function getFeeOptions(network) {
    return __awaiter(this, void 0, void 0, function () {
        var btcNetwork, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    btcNetwork = getSupportedNetwork(network);
                    return [4 /*yield*/, axios_1.default.get(btcNetwork.apiUrl + "/fee-estimates", { validateStatus: function () { return true; } })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, ["" + response.data['2'], "" + response.data['4'], "" + response.data['10']]];
            }
        });
    });
}
exports.getFeeOptions = getFeeOptions;
function getHistorySchema() {
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
exports.getHistorySchema = getHistorySchema;
function submitTransaction(network, signedTx) {
    return __awaiter(this, void 0, void 0, function () {
        var btcNetwork, resp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    btcNetwork = getSupportedNetwork(network);
                    return [4 /*yield*/, axios_1.default.post(btcNetwork.apiUrl + "/tx", signedTx, {
                            headers: {
                                'Content-Type': 'text/plain',
                            },
                            validateStatus: function () { return true; },
                        })];
                case 1:
                    resp = _a.sent();
                    if (resp.status !== 200) {
                        throw new Error(resp.data);
                    }
                    return [2 /*return*/, resp.data];
            }
        });
    });
}
exports.submitTransaction = submitTransaction;
function prepareCommandGetPubkey(network, accountIndex, type) {
    if (type === void 0) { type = address_1.AddressType.P2SH; }
    var btcNetwork = getSupportedNetwork(network);
    var req = new ArmadilloProtob.Bitcoin.BtcCommand();
    var msg = new ArmadilloProtob.Bitcoin.BtcCommand.BtcGetXPub();
    var pathList = Utils.getAccountPath(accountIndex);
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
exports.prepareCommandGetPubkey = prepareCommandGetPubkey;
function parsePubkeyResponse(walletRsp) {
    var response = ArmadilloProtob.Bitcoin.BtcResponse.deserializeBinary(walletRsp.payload);
    var data = response.getXpub();
    if (!data) {
        throw Error('invalid wallet response');
    }
    var publicKey = Buffer.concat([
        Buffer.from([0x04]),
        Buffer.from(data.getXpub_asU8().slice(0, 64)),
    ]);
    return publicKey.toString('hex');
}
exports.parsePubkeyResponse = parsePubkeyResponse;
function prepareCommandShowAddr(network, accountIndex, type) {
    if (type === void 0) { type = address_1.AddressType.P2SH; }
    var btcNetwork = getSupportedNetwork(network);
    var req = new ArmadilloProtob.Bitcoin.BtcCommand();
    var msg = new ArmadilloProtob.Bitcoin.BtcCommand.BtcShowAddr();
    var pathList = Utils.getAccountPath(accountIndex);
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
exports.prepareCommandShowAddr = prepareCommandShowAddr;
function getBalance(network, addr) {
    return __awaiter(this, void 0, void 0, function () {
        var btcNetwork, resp, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    btcNetwork = getSupportedNetwork(network);
                    return [4 /*yield*/, axios_1.default(btcNetwork.apiUrl + "/address/" + addr, { validateStatus: function () { return true; } })];
                case 1:
                    resp = _a.sent();
                    data = resp.data;
                    if (resp.status !== 200) {
                        throw new Error(resp.data);
                    }
                    return [2 /*return*/, convertBaseAmountToNormAmount("" + (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum))];
            }
        });
    });
}
exports.getBalance = getBalance;
function getRecentHistory(network, addr) {
    return __awaiter(this, void 0, void 0, function () {
        var btcNetwork, resp, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    btcNetwork = getSupportedNetwork(network);
                    return [4 /*yield*/, axios_1.default(btcNetwork.apiUrl + "/address/" + addr + "/txs", { validateStatus: function () { return true; } })];
                case 1:
                    resp = _a.sent();
                    if (resp.status !== 200) {
                        throw new Error(resp.data);
                    }
                    result = resp.data;
                    return [2 /*return*/, result.map(function (tx) {
                            var isSelf = tx.vout.every(function (vout) { return vout.scriptpubkey_address === addr; });
                            var isSent = tx.vin.some(function (vin) { return !!vin.prevout && vin.prevout.scriptpubkey_address === addr; });
                            var input = tx.vin.reduce(function (sum, vin) { return sum + (!!vin.prevout && vin.prevout.value || 0); }, 0);
                            var output = tx.vout.reduce(function (sum, vout) { return sum + vout.value; }, 0);
                            var change = isSelf ? (tx.vout.length > 1 ? (tx.vout
                                .slice(tx.vout.length - 1)
                                .reduce(function (sum, vout) { return sum + vout.value; }, 0)) : 0) : (tx.vout
                                .filter(function (vout) { return vout.scriptpubkey_address === addr; })
                                .reduce(function (sum, vout) { return sum + vout.value; }, 0));
                            var toAddress = isSelf ? addr : tx.vout
                                .filter(function (vout) { return vout.scriptpubkey_address !== addr; })
                                .reduce(function (_, item) { return item.scriptpubkey_address; }, '');
                            var date = tx.status.confirmed ? new Date(tx.status.block_time * 1000) : new Date();
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
                                    value: convertBaseAmountToNormAmount("" + (output - change)),
                                },
                                fee: {
                                    value: convertBaseAmountToNormAmount("" + (input - output)),
                                },
                                isConfirmed: {
                                    value: '' + tx.status.confirmed,
                                },
                            };
                        })];
            }
        });
    });
}
exports.getRecentHistory = getRecentHistory;
function getPreparedTxSchema() {
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
exports.getPreparedTxSchema = getPreparedTxSchema;
function getAccountUnspents(network, address, type) {
    return __awaiter(this, void 0, void 0, function () {
        var resp, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default(network.apiUrl + "/address/" + address + "/utxo", { validateStatus: function () { return true; } })];
                case 1:
                    resp = _a.sent();
                    if (resp.status !== 200) {
                        throw new Error(resp.data);
                    }
                    result = resp.data;
                    return [2 /*return*/, result.map(function (item) { return ({
                            type: type,
                            txId: item.txid,
                            vout: item.vout,
                            value: item.value,
                            confirmations: item.status.confirmed,
                        }); })];
            }
        });
    });
}
function prepareCommandSignTx(req) {
    return __awaiter(this, void 0, void 0, function () {
        var btcNetwork, from, to, value, inputType, utxos, outputType, output, feeRate, res, inputs, outputs, command, msg, armadillCommand, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    btcNetwork = getSupportedNetwork(req.network);
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
                    from = encodePubkeyToAddr(req.network, req.fromPubkey);
                    to = req.toAddr;
                    if (from === to) {
                        throw Error('sending funds back to the same address is prohibited');
                    }
                    value = convertNormAmountToBaseAmount(req.amount);
                    inputType = classify.output(bitcoin.address.toOutputScript(from, btcNetwork.config));
                    return [4 /*yield*/, getAccountUnspents(btcNetwork, from, address_1.ClassifyTypeToAddressType[inputType])];
                case 1:
                    utxos = _a.sent();
                    outputType = classify.output(bitcoin.address.toOutputScript(to, btcNetwork.config));
                    output = [
                        {
                            address: to,
                            value: parseInt(value, 10),
                            type: address_1.ClassifyTypeToAddressType[outputType],
                        },
                    ];
                    feeRate = parseFloat(req.feeOpt);
                    res = coinselect_1.default(utxos, output, feeRate);
                    if (!res.outputs) {
                        throw new Error("Can't select output, please check your balance");
                    }
                    if (!res.inputs) {
                        throw new Error('No inputs');
                    }
                    if (res.inputs.length > 10) {
                        throw new Error("Can't select output, too long to handle");
                    }
                    if (res.outputs.length === output.length + 1) {
                        // set change to inPkhash
                        res.outputs[res.outputs.length - 1].address = from;
                        res.outputs[res.outputs.length - 1].type = address_1.ClassifyTypeToAddressType[inputType];
                    }
                    inputs = res.inputs.map(function (i) {
                        var txIn = new ArmadilloProtob.Bitcoin.BtcCommand.BtcSignTx.BtcTxIn();
                        var pathList = Utils.getAccountPath(req.accountIndex);
                        if (pathList.length !== 3) {
                            throw Error('invalid path');
                        }
                        txIn.setPathList(pathList);
                        txIn.setPrevTid(Utils.hexdecode(i.txId).reverse());
                        txIn.setPrevIndex(i.vout);
                        txIn.setValue(i.value);
                        return txIn;
                    });
                    outputs = res.outputs.map(function (o) {
                        var txOut = new ArmadilloProtob.Bitcoin.BtcCommand.BtcSignTx.BtcTxOut();
                        if (o.value < 0 || Math.floor(o.value) !== o.value) {
                            throw new Error('invalid output value');
                        }
                        txOut.setValue(o.value);
                        var _a = Utils.convertToScript(btcNetwork.config, o.address), scriptType = _a[0], publicKeyScript = _a[1];
                        switch (scriptType) {
                            case address_1.ScriptType.P2PKH_PKHASH:
                                if (publicKeyScript.length !== 20) {
                                    throw new Error('invalid public key script');
                                }
                                txOut.setP2pkhPkhash(publicKeyScript);
                                break;
                            case address_1.ScriptType.P2SH_SHASH:
                                if (publicKeyScript.length !== 20) {
                                    throw new Error('invalid public key script');
                                }
                                txOut.setP2shShash(publicKeyScript);
                                break;
                            case address_1.ScriptType.P2WPKH_PKHASH:
                                if (publicKeyScript.length !== 20) {
                                    throw new Error('invalid public key script');
                                }
                                txOut.setP2wpkhPkhash(publicKeyScript);
                                break;
                            case address_1.ScriptType.P2WSH_SHASH:
                                if (publicKeyScript.length !== 32) {
                                    throw new Error('invalid public key script');
                                }
                                txOut.setP2wshShash(publicKeyScript);
                                break;
                            case address_1.ScriptType.UNKNOWN_SCRIPT:
                                txOut.setUnknownScript(publicKeyScript);
                                break;
                            default:
                                throw Error("unexpected script type: " + scriptType);
                        }
                        return txOut;
                    });
                    command = new ArmadilloProtob.Bitcoin.BtcCommand();
                    msg = new ArmadilloProtob.Bitcoin.BtcCommand.BtcSignTx();
                    msg.setInputsList(inputs);
                    msg.setOutputsList(outputs);
                    command.setTestnet(btcNetwork.isTestnet);
                    command.setMode(Utils.addressTypeToMode(address_1.ClassifyTypeToAddressType[inputType]));
                    command.setSignTx(msg);
                    armadillCommand = {
                        commandId: ArmadilloProtob.BITCOIN_CMDID,
                        payload: Buffer.from(command.serializeBinary()),
                    };
                    transaction = {
                        to: {
                            value: to,
                            link: getUrlForAddr(req.network, to),
                        },
                        value: {
                            value: req.amount,
                        },
                        fee: {
                            value: convertBaseAmountToNormAmount("" + res.fee),
                        },
                    };
                    return [2 /*return*/, [armadillCommand, transaction]];
            }
        });
    });
}
exports.prepareCommandSignTx = prepareCommandSignTx;
function buildSignedTx(req, preparedTx, walletRsp) {
    var response = ArmadilloProtob.Bitcoin.BtcResponse.deserializeBinary(walletRsp.payload);
    var data = response.getSignedTx();
    if (!data) {
        throw Error('invalid wallet response');
    }
    return Buffer.from(data.getRawtx_asU8()).toString('hex');
}
exports.buildSignedTx = buildSignedTx;
