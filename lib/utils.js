"use strict";
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
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var bitcoin = __importStar(require("bitcoinjs-lib"));
var classify = __importStar(require("bitcoinjs-lib/src/classify"));
var ArmadilloProtob = __importStar(require("kelvinjs-protob"));
var secp256k1_1 = __importDefault(require("secp256k1"));
var address_1 = require("./model/address");
function getAccountPath(index) {
    return [0x80000000 + index, 0, 0];
}
exports.getAccountPath = getAccountPath;
function toSafeBuffer(value) {
    var result;
    if (typeof value === 'string') {
        if (!/^(0x)?([0-9a-fA-F]+)?$/.test(value)) {
            throw Error("invalid string: \"" + value + "\"");
        }
        if (/^[0-9]+$/.test(value)) {
            var bigNumber = new bignumber_js_1.default(value);
            result = hexdecode(bigNumber.toString(16));
        }
        else {
            result = hexdecode(value);
        }
    }
    else if (typeof value === 'number') {
        if (value < 0 || Math.floor(value) !== value) {
            throw Error("invalid number: " + value + ", only accept uint");
        }
        var byteLength = Math.max(1, Math.ceil(Math.log2(value) / 8));
        result = Buffer.alloc(byteLength);
        result.writeUIntBE(value, 0, byteLength);
    }
    else if (value instanceof Buffer) {
        result = value;
    }
    else if (value instanceof bignumber_js_1.default) {
        result = hexdecode(value.toString(16));
    }
    else if (typeof value === 'undefined') {
        result = Buffer.alloc(0);
    }
    else {
        throw Error("invalid type " + typeof value);
    }
    while (result[0] === 0) {
        result = result.slice(1);
    }
    return result;
}
exports.toSafeBuffer = toSafeBuffer;
function hexencode(arr, addHexPrefix) {
    if (addHexPrefix === void 0) { addHexPrefix = false; }
    if (!(arr instanceof Uint8Array || arr instanceof Array)) {
        throw new Error('input type error');
    }
    var uint8Array = new Uint8Array(arr);
    var buffer = Buffer.from(uint8Array);
    if (addHexPrefix) {
        return "0x" + buffer.toString('hex');
    }
    else {
        return buffer.toString('hex');
    }
}
exports.hexencode = hexencode;
function hexdecode(hexstring) {
    var str = hexstring;
    if (/^0x/.test(hexstring)) {
        str = hexstring.slice(2);
    }
    return Buffer.from(str, 'hex');
}
exports.hexdecode = hexdecode;
function addressTypeToMode(inputType) {
    switch (inputType) {
        case address_1.AddressType.LEGACY:
            return ArmadilloProtob.Bitcoin.BtcCommand.BtcMode.P2PKH;
        case address_1.AddressType.BECH32:
            return ArmadilloProtob.Bitcoin.BtcCommand.BtcMode.P2WPKH;
        case address_1.AddressType.P2SH:
        default:
            return ArmadilloProtob.Bitcoin.BtcCommand.BtcMode.P2SH_P2WPKH;
    }
}
exports.addressTypeToMode = addressTypeToMode;
function convertToScript(network, address) {
    var type = classify.output(bitcoin.address.toOutputScript(address, network));
    switch (type) {
        case classify.types.P2WPKH:
        case classify.types.P2WSH:
            try {
                var result = bitcoin.address.fromBech32(address);
                return [
                    address_1.ClassifyTypeToScriptType[type],
                    result.data,
                ];
            }
            catch (error) {
                throw Error('unsupported script');
            }
        case classify.types.P2PKH:
        case classify.types.P2SH:
            try {
                var result = bitcoin.address.fromBase58Check(address);
                return [
                    address_1.ClassifyTypeToScriptType[type],
                    result.hash,
                ];
            }
            catch (error) {
                throw Error('unsupported script');
            }
        default:
            throw Error('unsupported script');
    }
}
exports.convertToScript = convertToScript;
function createPkhashFromPKey(publicKey, type) {
    if (!/^04[0-9a-fA-F]{128}$/.test(publicKey)) {
        throw Error('invalid public key');
    }
    var pubkey = secp256k1_1.default.publicKeyConvert(hexdecode(publicKey), true);
    switch (type) {
        case address_1.AddressType.LEGACY:
            var p2pkh = bitcoin.payments.p2pkh({ pubkey: pubkey }).hash;
            if (!p2pkh) {
                throw Error('unexpected error');
            }
            return p2pkh.toString('hex');
        case address_1.AddressType.P2SH:
            var p2sh = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({ pubkey: pubkey }),
            }).hash;
            if (!p2sh) {
                throw Error('unexpected error');
            }
            return p2sh.toString('hex');
        case address_1.AddressType.BECH32:
            var p2wpkh = bitcoin.payments.p2wpkh({ pubkey: pubkey }).hash;
            if (!p2wpkh) {
                throw Error('unexpected error');
            }
            return p2wpkh.toString('hex');
        default:
            return '';
    }
}
exports.createPkhashFromPKey = createPkhashFromPKey;
function pkhashToAddress(network, pkhash, type) {
    try {
        var hash = hexdecode(pkhash);
        switch (type) {
            case address_1.AddressType.LEGACY:
                return bitcoin.address.toBase58Check(hash, network.pubKeyHash);
            case address_1.AddressType.P2SH:
                return bitcoin.address.toBase58Check(hash, network.scriptHash);
            case address_1.AddressType.BECH32:
                return bitcoin.address.toBech32(hash, 0, network.bech32);
            default:
                return '';
        }
    }
    catch (error) {
        console.error(error);
        return '';
    }
}
exports.pkhashToAddress = pkhashToAddress;
