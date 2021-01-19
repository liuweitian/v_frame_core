import BaseValidator from "./BaseValidator";

/**
 * 字符串校验器
 * 三个特有参数：
 * min: 长度最小值
 * max: 长度最大值
 * length: 长度值
 */
export default class StringValidator extends BaseValidator {
    run() {
        let message = '{attribute}必须是一段文字'
        let value = this.getValidateValue()
        if( typeof value !== 'string' ) {
            this.addError(message)
            return false
        }

        let min = this.getRuleItemValue('min')
        if( typeof min === 'number' && value.length < min) {
            this.addError('{attribute}不能长度不能小于' + min)
            return false
        }

        let max = this.getRuleItemValue('max')
        if( typeof max === 'number' && value.length > min) {
            this.addError('{attribute}不能长度不能大于' + max)
            return false
        }

        let length = this.getRuleItemValue('length')
        if( typeof length === 'number' && value.length !== length) {
            this.addError('{attribute}不能长度必须等于' + length)
            return false
        }

        return false
    }
}