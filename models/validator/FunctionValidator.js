import BaseValidator from "./BaseValidator";

export default class FunctionValidator extends BaseValidator {
    async run() {
        return await this.getRuleItemValue('callback')({
            validator: this,
            model: this.model,
            attribute: this.attribute,
            ruleItem: this.ruleItem,
            addError: this.addError
        })
    }
}