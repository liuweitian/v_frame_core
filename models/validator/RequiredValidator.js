import BaseValidator from "./BaseValidator";

/**
 * 必填校验器
 * 数值 0 返回 true
 * 其它诸如 空字符串，null，undefined，空数组，空对象都返回 false
 */
export default class RequiredValidator extends BaseValidator {
    run() {
        let value = this.getValidateValue()
        let message = '{attribute}不能为空'

        // 如果是数字 0，则放行
        if( typeof value === 'number' && parseInt(value) === 0 ) {
            return true;
        }

        // 判断诸如 null，undefined 或者 空字符串之类的空值
        if( !value ) {
            this.addError(message)
            return false
        }

        // 判断空数组
        if( Array.isArray( value ) && value.length === 0 ) {
            this.addError(message)
            return false
        }

        // 判断空对象
        // 对象即使存在key，当所有key对应的value都是空时，也会视为空
        if( typeof value === 'object' && Object.values( value ).filter(v => !!v).length === 0 ) {
            this.addError(message)
            return false
        }

        return true
    }
}