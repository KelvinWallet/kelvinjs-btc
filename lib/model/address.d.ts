export declare enum AddressType {
    LEGACY = "LEGACY",
    P2SH = "P2SH",
    BECH32 = "BECH32"
}
export declare enum ScriptType {
    P2PKH_PKHASH = 0,
    P2SH_SHASH = 1,
    P2WPKH_PKHASH = 2,
    P2WSH_SHASH = 3,
    UNKNOWN_SCRIPT = 4
}
export declare const ClassifyTypeToAddressType: {
    [x: string]: AddressType;
};
export declare const ClassifyTypeToScriptType: {
    [x: string]: ScriptType;
};
