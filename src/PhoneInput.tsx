import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies, no-use-before-define
import {
    Image, 
} from 'react-native';
import Country from './country';
import Flags from './resources/flags';
import PhoneNumber from './PhoneNumber';

import { ReactNativePhoneInputProps } from './typings';

import { TextInput} from '@jmstechnologiesinc/react-native-paper';

/* @ts-ignore */
import { moderateScale } from '@jmstechnologiesinc/react-native-size-matters';

const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

export default class PhoneInput<TextComponentType extends React.ComponentType = typeof TextInput>
    extends React.Component<ReactNativePhoneInputProps<TextComponentType>, any> {
    static setCustomCountriesData(json) {
        Country.setCustomCountriesData(json);
    }

    private picker: any;

    private inputPhone: any;

    constructor(props) {
        super(props);

        let {
            initialCountry, initialValue, mode, inputActionHandler,
        } = this.props;

        const {
            countriesList, disabled
        } = this.props;

        if (countriesList) {
            Country.setCustomCountriesData(countriesList);
        }

        let displayValue = ''

        if (initialValue) {
            if (initialValue[0] !== '+') {
                initialValue = `+${initialValue}`;
            }

            initialCountry = PhoneNumber.getCountryCodeOfNumber(initialValue);
            displayValue = this.format(initialValue, initialCountry);
        } else {
            const countryData = PhoneNumber.getCountryDataByCode(initialCountry);
            initialValue = countryData ? `+${countryData.dialCode}` : '';
            displayValue = initialValue;
        }
        
        const phone = this.getDialCodeNumber(displayValue)

        this.state = {
            disabled,
            iso2: initialCountry,
            displayValue,
            value: initialValue,
            mode,
            onValue: phone?.number,
            dialCode: phone?.dialCode ? phone?.dialCode : initialValue
        };
    }

    componentDidUpdate() {
        const { disabled } = this.props;
        if (disabled !== this.state.disabled) {
            this.setState({ disabled }); // eslint-disable-line react/no-did-update-set-state
        }
    }


    onChangePhoneNumber = (number) => {
    
        this.props.onChangePhoneNumber?.(this.state.dialCode +number, this.state.iso2); 
    }

 
    onPressFlag = () => {
        if (this.props.onPressFlag) {
            this.props.onPressFlag();
        } else {
            if (this.state.iso2) this.picker.selectCountry(this.state.iso2);
            this.picker.show();
        }
    }

    // eslint-disable-next-line class-methods-use-this
    getPickerData() {
        return PhoneNumber.getAllCountries().map((country, index) => ({
            key: index,
            image: Flags.get(country.iso2),
            label: country.name,
            dialCode: `+${country.dialCode}`,
            iso2: country.iso2
        }));
    }

    getCountryCode() {
        const countryData = PhoneNumber.getCountryDataByCode(this.state.iso2);
        return countryData ? countryData.dialCode : null;
    }

    // eslint-disable-next-line class-methods-use-this
    getAllCountries() {
        return PhoneNumber.getAllCountries();
    }

    // eslint-disable-next-line class-methods-use-this
    getFlag = (iso2) => Flags.get(iso2);

    getDialCode() {
        return PhoneNumber.getDialCode(this.state.value);
    }

    getValue(text?) {
        return text ? text.replace(/[^0-9]/g, '') : this.state.dialCode + this.state.onValue;
    }

    getNumberType() {
        return PhoneNumber.getNumberType(
            this.state.value,
            this.state.iso2
        );
    }

    getISOCode = () => this.state.iso2;

    selectCountry = (iso2) => {
        if (this.state.iso2 !== iso2) {
            const countryData = PhoneNumber.getCountryDataByCode(iso2);
            if (countryData) {
                this.setState(
                    {
                        iso2,
                        displayValue: this.format(`+${countryData.dialCode}`),
                        dialCode: `+${countryData.dialCode}`,
                        onValue: '',
                        value: `+${countryData.dialCode}`
                    },
                    () => {
                        if (this.props.onSelectCountry) this.props.onSelectCountry(iso2);
                    }
                );
            }
        }
    }



    isValidNumber() {
        let phone = this.state.value + this.state.onValue
        if (phone.length < 4) return false;
        return PhoneNumber.isValidNumber(
            phone,
            this.state.iso2
        );
    }

    format(text, iso2?) {
        return this.props.autoFormat
            ? PhoneNumber.format(text, iso2 || this.state.iso2)
            : text;
    }



    getAccessibilityLabel() {
        return this.props.accessibilityLabel || 'Telephone input';
    }

    getDialCodeNumber(phone) {
        try {
            const phoneNumber = phoneUtil.parse(phone);
            const dialCode = '+' + phoneNumber.getCountryCode();
            const number = phone.slice(dialCode.length);
            return {
                dialCode: dialCode,
                number
            };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    

    render() {
        const { iso2,  disabled, mode, onValue, dialCode } = this.state;

        return (    
            <>

                <TextInput
                autoFocus
                    ref={(ref) => {
                        this.inputPhone = ref;
                    }}
                    mode={mode}
                    label={"Phone Number"}
                    accessibilityLabel={this.getAccessibilityLabel()}
                    editable={!disabled}
                    autoCorrect={false}
                    onChangeText={(text) => {
                        this.setState({ onValue: text });
                        this.onChangePhoneNumber(text)
                    }}
                    left={ <TextInput.Affix  text={dialCode}  textStyle={{color: 'rgb(80, 69, 57)'}} />}
                    right={
                        <TextInput.Icon
                            onPress={this.onPressFlag}
                            icon={({ size }) => (
                                <Image
                                    source={Flags.get(iso2)}
                                    style={{ width: moderateScale(size), height: moderateScale(size), }}
                                    accessibilityIgnoresInvertColors
                                />
                            )}
                        />
                    }
                    keyboardType="phone-pad"
                    value={onValue}
                />
            </>
        );
    }
}
