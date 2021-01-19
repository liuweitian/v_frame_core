import BaseValidator from "./BaseValidator";

/**
 * 裁剪
 */
export default class TrimValidator extends BaseValidator {
    run() {
        let value = this.getValidateValue()
        if( typeof value === 'string' ) {
            this.model.setAttribute( this.attribute, value.trim() )
        }
        return true
    }
}