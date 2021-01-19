import BaseValidator from "./BaseValidator";

/**
 * 整数校验器
 * 两个特有参数
 * min：下限值（含界点）。若不设置，则验证器不检查下限
 * max：上限值（含界点）。若不设置，则验证器不检查上限
 */
export default class IntegerValidator extends BaseValidator {
    run() {
        let value = this.getValidateValue()

        // 整数取整后依然等于自身
        if( Number.isInteger( value ) ) {
            this.addError('{attribute}必须是整数')
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