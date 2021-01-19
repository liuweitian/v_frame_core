import BaseValidator from "./BaseValidator";

/**
 * 数值校验器
 * 两个特有参数
 * min：下限值（含界点）。若不设置，则验证器不检查下限
 * max：上限值（含界点）。若不设置，则验证器不检查上限
 */
export default class NumberValidator extends BaseValidator {
    run() {
        let message = '{attribute}必须是数值'
        let value = this.getValidateValue()

        if( typeof value !== 'number' ) {
            this.addError(message)
            return false
        }

        // NaN也不会当成 number
        if( Number.isNaN( value ) ) {
            this.addError(message)
            return false
        }

        let min = this.getRuleItemValue('min')
        if( typeof min === 'number' && value < min) {
            this.addError('{attribute}不能小于' + min)
            return false
        }

        let max = this.getRuleItemValue('max')
        if( typeof max === 'number' && value > max) {
            this.addError('{attribute}不能大于' + max)
            return false
        }

        return true
    }
}