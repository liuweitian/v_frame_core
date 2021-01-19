/**
 * 校验器基类
 * 需要自定义校验器时继承该类，然后重写 run 方法，
 * 自行调用 this.addError 方法添加错误信息，并在 run 方法返回校验是否通过
 */
export default class BaseValidator {
    /**
     * 需要校验的数据模型
     * @type {VDataModel}
     */
    model

    /**
     * 需要校验的字段名
     * @type {string}
     */
    attribute

    /**
     * 校验规则
     * @type {Object}
     */
    ruleItem = {}

    constructor(model, attribute, ruleItem) {
        this.model = model
        this.attribute = attribute
        this.ruleItem = ruleItem
    }

    /**
     * 实例化
     * @param {VDataModel} model
     * @param {string} attribute
     * @param {Object} ruleItem
     */
    static instance({model, attribute, ruleItem}) {
        return new this(model, attribute, ruleItem)
    }

    /**
     * 获取待校验的字段值
     * @returns {*}
     */
    getValidateValue() {
        return this.model.getSourceValue(this.attribute)
    }

    /**
     * 根据键名获取 this.ruleItem 的值
     * @param {string} key 键名
     * @returns {*}
     */
    getRuleItemValue(key) {
        return this.ruleItem[key]
    }

    /**
     * 执行校验器，并返回校验结果
     * @returns {boolean}
     */
    validate() {
        // 调用抽象方法，抽象方法必须由子类实现
        return this.run();
    }

    /**
     * 添加错误信息
     * @param {string|null} message 需要添加的错误消息，支持 {attribute} 变量
     * @returns {string}
     */
    addError(message) {
        // message 字段支持变量 {attribute}，这里将 {attribute} 替换成 字段label
        message = message.split('{attribute}').join(this.model.getLabel(this.attribute))
        this.model.addError(this.attribute, message)
        return message
    }

    async static do(model, attribute, ruleItem) {
        let validator = undefined

        switch (typeof ruleItem.validator) {
            case 'function':
                validator = new ruleItem.validator.instance({
                    model,
                    attribute,
                    ruleItem
                })
                break;
            case 'string':
                validator = await import(ruleItem.validator)
                break;
        }
        if( !validator ) {
            return true;
        }

        return validator.validate()
    }
}
