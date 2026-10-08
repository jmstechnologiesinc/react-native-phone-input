import { expect } from 'chai';
import PhoneNumber from '../src/PhoneNumber';

describe('getNumberType', () => {
    it('returns UNKNOWN type', () => {
        const number = '+44000';
        const iso2 = 'gb';
        const numberType = PhoneNumber.getNumberType(number, iso2);
        expect(numberType).to.equal('UNKNOWN');
    });

    it('returns MOBILE type', () => {
        const number = '+447900000001';
        const iso2 = 'gb';
        const numberType = PhoneNumber.getNumberType(number, iso2);
        expect(numberType).to.equal('MOBILE');
    });

    it('returns FIXED_LINE type', () => {
        const number = '+442072212217';
        const iso2 = 'gb';
        const numberType = PhoneNumber.getNumberType(number, iso2);
        expect(numberType).to.equal('FIXED_LINE');
    });
});

describe('internationalNumber', () => {
    it('splits a whole international number into its own code, country and national part', () => {
        expect(PhoneNumber.internationalNumber('+19787712261')).to.deep.equal({
            dialCode: '+1', nationalNumber: '9787712261', iso2: 'us',
        });
        expect(PhoneNumber.internationalNumber('+1 978-771-2261')).to.include({ dialCode: '+1', nationalNumber: '9787712261' });
        expect(PhoneNumber.internationalNumber('+447900000001')).to.deep.equal({
            dialCode: '+44', nationalNumber: '7900000001', iso2: 'gb',
        });
    });

    it('leaves any other text to the affix, as before', () => {
        expect(PhoneNumber.internationalNumber('9787712261')).to.equal(null);
        expect(PhoneNumber.internationalNumber('(978) 771-2261')).to.equal(null);
        expect(PhoneNumber.internationalNumber('+')).to.equal(null);
        expect(PhoneNumber.internationalNumber('')).to.equal(null);
    });
});
