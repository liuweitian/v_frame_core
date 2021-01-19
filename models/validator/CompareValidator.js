import BaseValidator from "./BaseValidator";

/**
 * 对比校验器
 * 三个特有的参数：
 * 对比符号：operator，支持的符号有 ==,===,!=,!==,>,>=,<,<=
 * 对比值：value，一个固定的值，配合 对比符号 进行对比，该参数的优先级高于 attribute
 * 对比属性：attribute，模型的属性名，直接和模型对应属性的值进行比较
 */
export default class CompareValidator extends BaseValidator {
    run() {
        let attrs = Object.keys( this.ruleItem )
        if( attrs.indexOf( 'value' ) !== -1 ) {
            return this.compare( this.getRuleItemValue( 'value' ) )
        }
        if( attrs.indexOf( 'attribute' ) !== -1 ) {
            return this.compare( this.model.getSourceValue( this.getRuleItemValue('attribute') ) )
        }
        return true
    }

    compare(compareValue) {
        let value = this.getValidateValue()
        let operator = this.getRuleItemValue('operator')
        let symbol = {
            '==': '等于',
            '===': '等于',
            '!=': '不等于',
            '!==': '不等于',
            '>': '大于',
            '>=': '大于或等于',
            '<': '小于',
            '<=': '小于或等于',
        }
        // 如果定义的校验符号不在 symbol 里面，则返回 false
        if( !symbol[operator] ) {
            this.addError('{attribute}定义了一个非法的校验符号')
            return false
        }

        let jsCode = 'compareValue ' + operator + ' value'
        if( eval(jsCode) === false ) {
            this.addError('{attribute}必须' + symbol[operator] + value)
            return false
        }

        return true
    }
}