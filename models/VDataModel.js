import BaseValidator from "./validator/BaseValidator";

export default class VDataModel {
    /**
     * 列表接口
     * 列表接口可通过 this.onList() 方法直接调用
     * @type String
     */
    static ListApi

    /**
     * 详情接口
     * 详情接口可通过 this.onView 方法调用
     * @type String
     */
    static ViewApi

    /**
     * 操作接口
     * 操作接口可通过 this.onAction 方法调用
     * @type String
     */
    static ActionApi

    /**
     * 数据格式化配置
     * @type {Object}
     */
    $formats = {}

    /**
     * 主键属性名
     * 修改这个属性的值，会影响 getId 方法的返回值
     * @type {string}
     */
    $primaryKey = 'id'

    /**
     * 属性格式化后缀
     * @type {string}
     */
    $attributePostfix = '_view'

    /**
     * 错误信息
     * @type {Array}
     */
    #$errors = []

    /**
     * 属性名列表
     * 通过 setValue 和 setValue 方法添加的属性名，会自动记录到这里
     * 通过 getAttributeNames 方法获取这个属性值
     * @type {[]}
     */
    #attributes = []

    /**
     * 获取数据校验规则
     * 可配合 validator 中的数据校验器进行数据校验
     * 格式：
     * [
     *      { attributes: [ 'id' ], validator: 'Required' }
     * ]
     * @returns {Array}
     */
    getRules() {
        return []
    }

    /**
     * 获取主键的值
     * 可修改 $primaryKey 来影响该方法的返回值
     * @returns {*}
     */
    getId() {
        return this.getSource( this.$primaryKey )
    }

    /**
     * 获取源数据值
     * 源数据的值将直接返回模型对应的属性值
     * @param {string} attribute 属性名
     * @returns {*}
     */
    getSource(attribute) {
        return this[attribute]
    }

    /**
     * 获取源数据值
     * 源数据的值将直接返回模型对应的属性值
     * @param {array} attributes 属性名
     * @returns {*}
     */
    getSources(attributes) {
        let values = {}
        for (let attr of attributes) {
            values[attr] = this.getSource(attr)
        }
        return values
    }

    /**
     * 获取格式化后的数据值
     * @param {string} attribute 属性名
     * @returns {*}
     */
    getValue(attribute) {
        // 获取原始数据
        let source = this.getSource(attribute)
        // 带后缀的原始数据
        let postfixValue = this.getSource(attribute + this.$attributePostfix)

        // 获取格式器
        let format = this.$formats[attribute]

        if( typeof format === 'object' ) {
            let Formatter = format.formatter
            let formatterValue = undefined
            if( typeof Formatter === 'function' ) {
                let formatter = new Formatter()
                formatter.setModel(this)
                formatter.setAttribute(attribute)
                formatter.setOptions( format.formatterOptions )
                formatterValue = formatter.getValue()
            }
            // 根据格式配置配置的 value 属性，进行数据格式化
            switch (typeof format.value) {
                /**
                 * 闭包参数：
                 * source: 原始字段值
                 * postfixValue: 带后缀的字段原始值
                 * formatterValue: 使用格式器处理后的值
                 */
                case 'function':
                    source = format.value(source, postfixValue, formatterValue)
                    break
                case 'object':
                    source = format.value[source]
                    break
                default:
                    if( typeof Formatter === 'function' ) {
                        source = formatterValue
                    }
            }
        } else {
            if( this.getHasAttribute(attribute + this.$attributePostfix) ) {
                source = postfixValue
            }
        }

        return source
    }

    /**
     * 设置属性值
     * @param {string} attribute
     * @param {*} value
     */
    setValue(attribute, value) {
        this._pushAttribute(attribute)
        this[attribute] = value
    }

    /**
     * 获取格式化后的数据值
     * @param {array} attributes 属性名
     * @returns {object}
     */
    getValues(attributes) {
        attributes = attributes || this.getAttributeNames()

        let values = {}
        for ( let attr of attributes ) {
            values[attr] = this.getValue(attr)
        }
        return values
    }

    /**
     * 批量设置属性值
     * @param {object} values
     */
    setValues(values) {
        for ( let attr in values ) {
            this._pushAttribute(attr)
            this.setValue( attr, values[attr] )
        }
    }

    /**
     * 将属性名添加进列表中
     * @param {string} attribute
     */
    _pushAttribute(attribute) {
        this.#attributes.indexOf(attribute) === -1 && this.#attributes.push(attribute)
    }

    /**
     * 获取属性名列表
     * @returns {*[]}
     */
    getAttributeNames() {
        return this.#attributes
    }

    /**
     * 返回该属性是否存在
     * @param {string} attribute
     * @returns {boolean}
     */
    getHasAttribute(attribute) {
        return this.#attributes.indexOf(attribute) !== -1
    }

    /**
     * 返回属性别名列表
     * 例如：{"id":"Id","name":"姓名"}
     * @returns {Object}
     */
    attributeLabels() {
        return {}
    }

    /**
     * 获取调用列表接口时参数
     * @returns {Object}
     */
    getListRequestParams() {
        return this.getValues()
    }

    /**
     * 获取调用操作接口时的参数
     * @returns {{get: Object, body: Object}}
     */
    getActionRequestParams() {
        return {
            get: {
                id: this.getId(),
            },
            body: this.getValues()
        }
    }

    /**
     * 获取属性名
     * 通过重写 getAttributeLabels 方法，可影响该方法的返回值
     * 如果在配置好的labels里匹配不到，则返回attribute反驼峰后的值
     * @param {string} attribute 属性名
     * @returns {*}
     */
    getLabel(attribute) {
        return this.attributeLabels()[ attribute ] || attribute.split('_')
            .map(d => {
                d = d.split('')
                d[0] = d[0].toUpperCase()
                return d.join('')
            }).join('');
    }

    /**
     * 添加错误信息
     * @param {string} attribute 属性名
     * @param {string} message 错误信息
     */
    addError(attribute, message) {
        if( !Array.isArray( this.#$errors[ attribute ] ) ) {
            this.#$errors[attribute] = []
        }
        this.#$errors[attribute].push(message)
    }

    /**
     * 批量添加错误信息
     * @param {Object} errors 错误信息列表，例如 {"id":"Id不能为空"}
     */
    addErrors(errors) {
        for ( let attribute in errors ) {
            this.addError( attribute, errors[attribute] );
        }
    }

    /**
     * 清空错误信息
     */
    clearErrors() {
        this.#$errors = [];
    }

    /**
     * 获取是否有错误信息
     * @returns {boolean}
     */
    getHasErrors() {
        return this.#$errors.length !== 0
    }

    /**
     * 获取错误信息
     * @returns {Array}
     */
    getErrors() {
        return this.#$errors
    }

    /**
     * 根据属性值获取错误信息
     * @param {string} attribute 根据属性名获取错误信息
     * @returns {array} 返回所有错误信息，所以这里是个数组，如果需要获取单个错误信息，请使用 this.getOneError() 方法
     */
    getError( attribute ) {
        return this.#$errors[ attribute ] || []
    }

    /**
     * 获取一个错误信息的文本
     * @param {string|null} attribute 需要获取错误信息的属性名，为null时将获取第一个属性
     * @param {*} defaultValue 当不存在错误信息时返回的默认值
     * @returns {null|*}
     */
    getOneError(attribute = null, defaultValue = null) {
        if( !this.getHasErrors() ) {
            return defaultValue
        }

        if( attribute ) {
            let error = this.getError(attribute);
            return error.length === 0 ? defaultValue : error[0]
        }
        return Object.values( this.#$errors )[0][0]
    }

    /**
     * 根据 this.getRules 方法 ，执行数据属性校验
     * 最终返回是否存在错误，错误信息可通过 this.getErrors()、this.getOneError() 或 this.getError() 等方法获取
     * @returns {boolean}
     */
    validate() {
        let rules = this.getRules()
        for ( let ruleItem of rules ) {
            for ( let attribute of ruleItem.attributes ) {
                BaseValidator.do( this, attribute, ruleItem )
            }
        }
        return this.getHasErrors()
    }

    /**
     * 获取调用操作接口时的 get 参数
     * @returns {Object}
     */
    getViewRequest() {
        return {
            id: this.getId(),
        }
    }

    /**
     * 调用 ActionApi 接口
     * @returns {Promise}
     */
    onAction() {
        return new Promise(resolve => {
            resolve();
        })
    }

    /**
     * 调用 ListApi 接口
     * @returns {Promise}
     */
    onList() {
        return new Promise(resolve => {
            resolve();
        })
    }

    /**
     * 调用 ViewApi 接口
     * @returns {Promise}
     */
    onView() {
        return new Promise(resolve => {
            resolve();
        })
    }

    /**
     * 获取模型表单需要的配置信息
     * @returns {Object}
     */
    getFormConfig() {
        return {}
    }
}