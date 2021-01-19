import BaseValidator from "./BaseValidator";

/**
 * 枚举校验器
 * 两个特有参数：
 * in: 在列表中，该值需要传入一个数组，非数组时直接跳过，校验值必须在该数组里出现，该参数的优先级高于 notIn
 * notIn：不再列表中，该值需要传入一个数组，非数组时直接跳过，校验值不可出现在该数组里
 */
export default class EnumValidator extends BaseValidator {
    run() {
        let value = this.getValidateValue()
        let inList = this.getRuleItemValue( 'in' )
        let notInList = this.getRuleItemValue( 'notIn' )

        if( Array.isArray( inList ) ) {
            if( inList.indexOf( value ) === -1 ) {
                this.addError('{attribute}的值不在可选范围内')
                return false
            }
        }
        if( Array.isArray( notInList ) ) {
            if( notInList.indexOf( value ) !== -1 ) {
                this.addError('{attribute}不可使用该值')
                return false
            }
        }

        return true
    }
}