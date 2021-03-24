import BaseFormatter from "@/v_frame_core/models/formatters/BaseFormatter";

export default class NumberFormatter extends BaseFormatter {
    getValue() {
        let source = this.model.getSource(this.attribute)
        if (typeof this.options.toFixed === 'number') {
            source = source.toFixed(this.options.toFixed)
        }
        if( this.options.toInteger === true ) {
            source = parseInt(source)
        }
        if( this.options.toFloat === true ) {
            source = parseFloat(source)
        }
        if( typeof this.options.unit === 'string' ) {
            source += this.options.unit
        }
        return source
    }
}