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
            initialCountry, initialValue, variant, inputActionHandler,
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

        this.state = {
            disabled,
            iso2: initialCountry,
            displayValue,
            value: initialValue,
            variant,
        };
    }

    componentDidUpdate() {
        const { disabled } = this.props;
        if (disabled !== this.state.disabled) {
            this.setState({ disabled }); // eslint-disable-line react/no-did-update-set-state
        }
    }

    onChangePhoneNumber = (number) => {
        const actionAfterSetState = this.props.onChangePhoneNumber
            ? (displayValue: string, iso2: string) => {
                this.props.onChangePhoneNumber?.(displayValue, iso2);
            }
            : null;
        this.updateValue(number, actionAfterSetState);
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
        return text ? text.replace(/[^0-9]/g, '') : this.state.value;
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
                        value: `+${countryData.dialCode}`
                    },
                    () => {
                        if (this.props.onSelectCountry) this.props.onSelectCountry(iso2);
                    }
                );
            }
        }
    }

    setValue = (number) => {
        if (this.state.value !== number) {
            this.updateValue(number);
        }
    }

    isValidNumber() {
        if (this.state.value.length < 4) return false;
        return PhoneNumber.isValidNumber(
            this.state.value,
            this.state.iso2
        );
    }

    format(text, iso2?) {
        return this.props.autoFormat
            ? PhoneNumber.format(text, iso2 || this.state.iso2)
            : text;
    }

    updateValue(number, actionAfterSetState: any = null) {
        let modifiedNumber = this.getValue(number);
        const { allowZeroAfterCountryCode } = this.props;

        if (modifiedNumber[0] !== '+' && number.length) {
            modifiedNumber = `+${modifiedNumber}`;
        }
        modifiedNumber = allowZeroAfterCountryCode
            ? modifiedNumber
            : this.possiblyEliminateZeroAfterCountryCode(modifiedNumber);
        const iso2: string = PhoneNumber.getCountryCodeOfNumber(modifiedNumber);

        let countryDialCode;
        if (iso2) {
            const countryData = PhoneNumber.getCountryDataByCode(iso2);
            countryDialCode = countryData.dialCode;
        }

        let displayValue;
        if (modifiedNumber === `+${countryDialCode}`) {
            displayValue = modifiedNumber;
        } else {
            displayValue = this.format(modifiedNumber);
        }

        this.setState({
            iso2,
            displayValue,
            value: modifiedNumber,
        }, () => {
            if (actionAfterSetState) {
                actionAfterSetState(displayValue, iso2);
            }
        });
    }

    // eslint-disable-next-line class-methods-use-this
    possiblyEliminateZeroAfterCountryCode(number) {
        const dialCode = PhoneNumber.getDialCode(number);
        return number.startsWith(`${dialCode}0`)
            ? dialCode + number.substr(dialCode.length + 1)
            : number;
    }

    getAccessibilityLabel() {
        return this.props.accessibilityLabel || 'Telephone input';
    }

    focus() {
        this.inputPhone.focus();
    }

    blur() {
        this.inputPhone.blur();
    }

    render() {
        const { iso2, displayValue, disabled, variant } = this.state;

        

       


        return (    
            <>

                <TextInput
                    ref={(ref) => {
                        this.inputPhone = ref;
                    }}
                    mode={variant}
                    label={"Phone Number"}
                    accessibilityLabel={this.getAccessibilityLabel()}
                    editable={!disabled}
                    autoCorrect={false}
                    onChangeText={(text) => {
                        this.onChangePhoneNumber(text);
                        if(this.props.inputActionHandler){
                         
                            this.props.inputActionHandler('phone', text)
                        }
                    }}
                    left={
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
                    value={displayValue}
                />

             
            </>
        );
    }
}
