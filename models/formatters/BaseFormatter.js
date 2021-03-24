/**
 * 注意，在格式器内，不可调用 model.getValue(attribute) ，否则会死循环
 */
export default class BaseFormatter {
    model

    attribute

    options

    /**
     * 设置数据模型实例
     * @param {VDataModel} model
     */
    setModel(model) {
        this.model = model
    }

    /**
     * 设置格式器参数
     * @param options
     */
    setOptions(options) {
        this.options = options || {}
    }

    /**
     * 设置需要处理的属性名
     * @param attribute
     */
    setAttribute(attribute) {
        this.attribute = attribute
    }

    /**
     * 获取格式化后的数据
     * @return {*}
     */
    getValue() {
        new Error('getValue 方法请在子类自行实现')
    }
}