import { expect } from 'chai';

import * as Core from './core';
import { Networks } from './model/network';

describe('Offline Test', () => {
  it('getSupportedNetworks()', () => {
    const networks = Core.getSupportedNetworks();

    expect(networks).to.contain(Networks.MAINNET);
    expect(networks).to.contain('testnet');
  });

  it('getFeeOptionUnit()', () => {
    const unit = Core.getFeeOptionUnit();

    expect(unit).to.contain('sat/kB');
  });

  describe('isValidFeeOption()', () => {
    it('valid network and amount', () => {
      const result = Core.isValidFeeOption(Networks.MAINNET, '1.1');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('valid network and invalid amount', () => {
      const result = Core.isValidFeeOption(Networks.MAINNET, 'two');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('valid network and zero amount', () => {
      const result = Core.isValidFeeOption(Networks.MAINNET, '0');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('invalid network', (done) => {
      try {
        Core.isValidFeeOption('regtest', '1.1');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid network');
        done();
      }
    });
  });

  describe('isValidAddr()', () => {
    it('valid P2SH address', () => {
      const result = Core.isValidAddr(Networks.MAINNET, '3PXwLBbpwy5UfeowBeVvsqKqfW4rVTpqqo');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('valid Legacy address', () => {
      const result = Core.isValidAddr(Networks.MAINNET, '18TBLeqahHCWuDLrnxRjxED8HBkVEBX8Qm');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('valid P2SH address', () => {
      const result = Core.isValidAddr(Networks.TESTNET, '2N2hc5RiCVZYDWGdZ1F3xJB3RdqKqmroEyu');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('valid Bech32 address', () => {
      const result = Core.isValidAddr(Networks.TESTNET, 'tb1qd2wpsgt3gje38unh37m0dx9yun9my0czlk228r');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('invalid address', () => {
      const result = Core.isValidAddr(Networks.MAINNET, '2N2hc5RiCVZYDWGdZ1F3xJB3RdqKqmroEyu');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('invalid address (white space)', () => {
      const result = Core.isValidAddr(Networks.MAINNET, '2N2hc5RiCVZYDWGdZ1F3xJB3RdqKqmroEyu ');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('invalid network', (done) => {
      try {
        Core.isValidAddr('regtest', '3PXwLBbpwy5UfeowBeVvsqKqfW4rVTpqqo');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid network');
        done();
      }
    });
  });

  describe('isValidNormAmount()', () => {
    it('valid amount', () => {
      const result = Core.isValidNormAmount('23.1');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('valid amount, 1000 Satoshi', () => {
      const result = Core.isValidNormAmount('0.00001');

      expect(result).to.be.true; // tslint:disable-line
    });

    it('invalid amount', () => {
      const result = Core.isValidNormAmount('ten');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('invalid amount (white space)', () => {
      const result = Core.isValidNormAmount(' 123');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('invalid amount (negative)', () => {
      const result = Core.isValidNormAmount('-123');

      expect(result).to.be.false; // tslint:disable-line
    });

    it('too small amount, 1 Satoshi', () => {
      const result = Core.isValidNormAmount('0.00000001');

      expect(result).to.be.false; // tslint:disable-line
    });
  });

  describe('convertNormAmountToBaseAmount()', () => {
    it('valid amount: 2.21', () => {
      const baseAmount = Core.convertNormAmountToBaseAmount('2.21');

      expect(baseAmount).to.deep.eq('221000000');
    });

    it('valid amount: 0.05521', () => {
      const baseAmount = Core.convertNormAmountToBaseAmount('0.05521');

      expect(baseAmount).to.deep.eq('5521000');
    });

    it('invalid amount: 0.l', (done) => {
      try {
        Core.convertNormAmountToBaseAmount('0.l');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid amount');
        done();
      }
    });

    it('invalid amount: 0.000000001', (done) => {
      try {
        Core.convertNormAmountToBaseAmount('0.000000001');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid amount');
        done();
      }
    });
  });

  describe('convertBaseAmountToNormAmount()', () => {
    it('valid amount: 71506', () => {
      const normalAmount = Core.convertBaseAmountToNormAmount('71506');

      expect(normalAmount).to.deep.eq('0.00071506');
    });

    it('valid amount: 1604900000', () => {
      const normalAmount = Core.convertBaseAmountToNormAmount('1604900000');

      expect(normalAmount).to.deep.eq('16.049');
    });

    it('invalid amount: l10', (done) => {
      try {
        Core.convertBaseAmountToNormAmount('l10');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid amount');
        done();
      }
    });

    it('invalid amount: 0.1', (done) => {
      try {
        Core.convertBaseAmountToNormAmount('0.1');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid amount');
        done();
      }
    });
  });

  describe('getUrlForAddr()', () => {
    it('valid network', () => {
      const url = Core.getUrlForAddr(Networks.MAINNET, '18TBLeqahHCWuDLrnxRjxED8HBkVEBX8Qm');

      expect(url).to.be.a('string');
    });

    it('invalid network', (done) => {
      try {
        Core.getUrlForAddr('regtest', '18TBLeqahHCWuDLrnxRjxED8HBkVEBX8Qm');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid network');
        done();
      }
    });
  });

  describe('getUrlForTx()', () => {
    it('valid network', () => {
      const url = Core.getUrlForTx(
        Networks.MAINNET, 'f54278adb0325fc581d409a2ad93a2a5978b7f311e28137cc72e65d26dafb70a',
      );

      expect(url).to.be.a('string');
    });

    it('invalid network', (done) => {
      try {
        Core.getUrlForTx('regtest', '177401a0d5a639fedf58d3cc5eb8f0062fdb84ae2148a76119bda217d5eff16b');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid network');
        done();
      }
    });
  });

  describe('encodePubkeyToAddr()', () => {
    /* tslint:disable:max-line-length */
    it('valid network, valid hexstring', () => {
      const address = Core.encodePubkeyToAddr(Networks.MAINNET, '04b37077fa6135ed9cbe83c6d81977f5bc1f4869dcca2185a00624b4f742435f4c866e83f24bdc30d5bedfe127a06f4436bded21ca651089f2eaefaa8b575f58ce');

      expect(address).to.be.a('string');
      expect(address).to.deep.eq('34feZKy8DGaXM2YbfoDa34oDirGk3FHQb9');
    });

    it('valid network, valid hexstring', () => {
      const address = Core.encodePubkeyToAddr(Networks.TESTNET, '0463c445706989ccf1817f2dde733aa6087613c89ee300722a3cc98d5fe45531f6a75ef79d026a42e5b5d847f1c842505a9242929ffda4f95d1d8019a973d42da9');

      expect(address).to.be.a('string');
      expect(address).to.deep.eq('2NBghsxQGvCaZRoVjW1ENREvbfzd8rEJ2rL');
    });

    it('valid network, invalid hexstring', (done) => {
      try {
        Core.encodePubkeyToAddr(Networks.TESTNET, '0363c445706989ccf1817f2dde733aa6087613c89ee300722a3cc98d5fe45531f6');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid uncompressed');
        done();
      }
    });

    it('invalid network', (done) => {
      try {
        Core.encodePubkeyToAddr('regtest', '04b37077fa6135ed9cbe83c6d81977f5bc1f4869dcca2185a00624b4f742435f4c866e83f24bdc30d5bedfe127a06f4436bded21ca651089f2eaefaa8b575f58ce');
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.contains('invalid network');
        done();
      }
    });
    /* tslint:enable:max-line-length */
  });
});
