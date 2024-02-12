import libPhoneNumber from 'google-libphonenumber';
const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();


function parse(number, iso2) {
    try {
        return phoneUtil.parse(number, iso2);
    } catch (err) {
        return null;
    }
}

export default function isValidNumber(number, iso2) {
    if (number.length < 4) return false;
    const phoneInfo = parse(number, iso2);
    if (phoneInfo) {
        return phoneUtil.isValidNumber(phoneInfo);
    }
    return false;
}