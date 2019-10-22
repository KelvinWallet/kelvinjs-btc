"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var classify = __importStar(require("bitcoinjs-lib/src/classify"));
var AddressType;
(function (AddressType) {
    AddressType["LEGACY"] = "LEGACY";
    AddressType["P2SH"] = "P2SH";
    AddressType["BECH32"] = "BECH32";
})(AddressType = exports.AddressType || (exports.AddressType = {}));
var ScriptType;
(function (ScriptType) {
    ScriptType[ScriptType["P2PKH_PKHASH"] = 0] = "P2PKH_PKHASH";
    ScriptType[ScriptType["P2SH_SHASH"] = 1] = "P2SH_SHASH";
    ScriptType[ScriptType["P2WPKH_PKHASH"] = 2] = "P2WPKH_PKHASH";
    ScriptType[ScriptType["P2WSH_SHASH"] = 3] = "P2WSH_SHASH";
    ScriptType[ScriptType["UNKNOWN_SCRIPT"] = 4] = "UNKNOWN_SCRIPT";
})(ScriptType = exports.ScriptType || (exports.ScriptType = {}));
exports.ClassifyTypeToAddressType = (_a = {},
    _a[classify.types.P2PKH] = AddressType.LEGACY,
    _a[classify.types.P2SH] = AddressType.P2SH,
    _a[classify.types.P2WPKH] = AddressType.BECH32,
    _a);
exports.ClassifyTypeToScriptType = (_b = {},
    _b[classify.types.P2PKH] = ScriptType.P2PKH_PKHASH,
    _b[classify.types.P2SH] = ScriptType.P2SH_SHASH,
    _b[classify.types.P2WPKH] = ScriptType.P2WPKH_PKHASH,
    _b[classify.types.P2WSH] = ScriptType.P2WSH_SHASH,
    _b[classify.types.NONSTANDARD] = ScriptType.UNKNOWN_SCRIPT,
    _b);
