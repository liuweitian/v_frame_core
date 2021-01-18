import VPermission from '../helpers/Permission'
import Axios from 'axios'
import VPosition from '../helpers/Position'

export default class VApi
{
    constructor()
    {

        this.apiPath = undefined

        this.urlItem = undefined

        this.successCallback = undefined

        this.errorCallBack = main.api.errorCallBack

        this.getParams = {}

        this.postParams = {}

        this.headers = {}

    }

    static instance()
    {
        return new this()
    }

    /**
     * 设置 接口路径
     * @param {string} path
     * @returns {VApi}
     */
    setUrlPath(path)
    {
        this.apiPath = path
        this.urlItem = undefined
        return this
    }

    /**
     * 设置 成功回调
     * @param {function} callback
     * @returns {VApi}
     */
    setSuccessCallback(callback)
    {
        this.successCallback = callback
        return this
    }

    /**
     * 设置 失败回调
     * @param {function} callback
     * @returns {VApi}
     */
    setErrorCallback(callback)
    {
        this.errorCallBack = callback
        return this
    }

    /**
     * 设置 GET请求参数
     * @param {object} params
     * @returns {VApi}
     */
    setGetParams(params)
    {
        this.getParams = params
        return this
    }

    /**
     * 获取 GET请求参数
     * @returns {{}}
     */
    getGetParams()
    {
        return this.getParams
    }

    /**
     * 设置 POST请求参数
     * @param {object} params
     * @returns {VApi}
     */
    setPostParams(params)
    {
        this.postParams = params
        return this
    }

    /**
     * 获取 POST请求参数
     * @param {boolean} toJSON 是否转成JSON
     * @returns {{}}
     */
    getPostParams(toJSON = false)
    {
        return toJSON && typeof this.postParams === 'string' ? JSON.stringify(this.postParams) : this.postParams
    }

    /**
     * 设置 请求头信息
     * @param {object} headers
     * @returns {VApi}
     */
    setHeaders(headers)
    {
        this.headers = headers
        return this
    }

    /**
     * 获取 请求头信息
     * @returns {{}}
     */
    getHeaders()
    {
        this.headers = this.headers || {}
        let authConfig = main.api.auth
        if (authConfig && authConfig.autoAdd === true && store.state.user.getAccessToken()) {
            this.headers[authConfig.authName] = authConfig.authTemplate.replace('{token}', store.state.user.getAccessToken())
        }
        // this.getPosition()
        if (store.state.position.lng && store.state.position.lat) {
            this.headers['HW-POSITION-LNG'] = store.state.position.lng
            this.headers['HW-POSITION-LAT'] = store.state.position.lat
        }
        return this.headers
    }

    getPosition(callback)
    {
        VPosition.getPosition((isSuccess, position) => {
            if( isSuccess ) {
                store.commit('update', {
                    target: store.state.position,
                    data: {
                        lng: position.lng,
                        lat: position.lat,
                    },
                });
            }

            typeof callback === 'function' ? callback() : ''
        });
    }

    /**
     * 根据传入的参数，获取对应的接口配置
     * @returns {Object | null}
     */
    getUrlItem()
    {
        if (!this.urlItem) {
            this.urlItem = ObjectHelper.getDataForPath(api, this.apiPath)
        }

        if (!this.urlItem) {
            this.urlItem = {}
            console.error('API ' + this.apiPath + ' 未配置，请在 configs/api.apiConfig.js 中配置好对应的接口信息。')
        }

        return this.urlItem
    }

    /**
     * 接口权限校验
     * @returns {boolean}
     */
    validate()
    {
        let urlItem = this.getUrlItem()
        let result = true
        if (urlItem.permission && typeof urlItem.permission === 'string') {
            result = VPermission.hasPermission(urlItem.permission)
        }
        if (urlItem.permissionAnd && typeof urlItem.permissionAnd === 'object') {
            result = VPermission.hasPermissionAnd(urlItem.permissionAnd)
        }
        if (urlItem.permissionOr && typeof urlItem.permissionOr === 'object') {
            result = VPermission.hasPermissionOr(urlItem.permissionOr)
        }
        return result
    }

    /**
     * 请求之前的钩子
     * @returns {boolean}
     */
    beforeCall()
    {
        if (!this.validate()) {
            let res = { status: 403, message: '无权访问' }
            this.errorCallBack({ res })
            return false
        }

        if (typeof this.getUrlItem() !== 'object') {
            let res = { status: 500, message: '接口未配置' }
            this.errorCallBack({ res })
            return false
        }

        return true
    }

    /**
     * 请求成功之后的钩子
     * @param {object} res
     */
    afterCall(res)
    {
        let urlItem = this.getUrlItem()

        if (main.api && main.api.defaultMaps) {
            if (typeof urlItem.maps !== 'object') {
                urlItem.maps = main.api.defaultMaps
            }
        }

        // 查询规则必须是个object才会进行处理
        if (typeof urlItem.maps === 'object') {
            for (let map of urlItem.maps) {
                let result = true
                for (let _path in map.items) {
                    // 根据配置好的字符串路径查找对象中的数据
                    let value = ObjectHelper.getDataForPath(res, _path)
                    let strict = ObjectHelper.getValue(map, 'strict', true)

                    // 如果查找到的数据和预定义的数据相等，则认为是命中条件的
                    result = result && ((strict && value === map.items[_path]) || (value == map.items[_path]))
                }
                // 如果单个类型配置中的条件全部命中，则调用成功回调
                if (result) {
                    let data = {}
                    if (map.data) {
                        for (let name in map.data) {
                            data[name] = ObjectHelper.getDataForPath(res, map.data[name])
                        }
                    }

                    this.successCallback({
                        type: map.type,
                        data: data,
                    }, res)
                    return
                }
            }
        }
        this.successCallback({
            type: undefined,
            data: {
                message: '未命中接口 maps 规则',
            },
        }, res)
    }

    /**
     * 创建axios实例
     * @param {object} config
     * @returns {AxiosInstance}
     */
    create(config)
    {
        config = Object.assign({}, config, {
            params: this.getGetParams(),
            data: this.getPostParams(),
            headers: this.getHeaders(),
        })
        return Vue.axios.create(config)
    }

    /**
     * 发起 GET 请求
     * @returns {Promise<AxiosResponse<any>>}
     */
    get()
    {
        if (!this.beforeCall()) {
            return
        }

        let urlItem = this.getUrlItem()

        return this.create({
            url: urlItem.url,
        }).get(urlItem.url, { params: this.getGetParams() }).then((res) => {
            this.afterCall(res)
        }).catch((e) => {
            let r = e.response
            this.errorCallBack({ res: r })
        })
    }

    /**
     * 发起 POST 请求
     */
    post()
    {
        if (!this.beforeCall()) {
            return
        }
        let urlItem = this.getUrlItem()

        let url = urlItem.url
        let getParams = this.getGetParams()
        if (JSON.stringify(getParams) !== '{}') {
            let params = []
            for (let name in getParams) {
                params.push(name + '=' + getParams[name])
            }
            url += '?' + params.join('&')
        }

        return this.create({
            url,
        }).post(url, this.getPostParams()).then((res) => {
            this.afterCall(res)
        }).catch((e) => {
            let r = e.response
            this.errorCallBack({ res: r })
        })
    }

    /**
     * 发起 Raw 请求
     */
    raw()
    {
        if (!this.beforeCall()) {
            return
        }
        let urlItem = this.getUrlItem()

        let url = urlItem.url

        let getParams = this.getGetParams()
        if (JSON.stringify(getParams) !== '{}') {
            let params = []
            for (let name in getParams) {
                params.push(name + '=' + getParams[name])
            }
            url += '?' + params.join('&')
        }

        this.setHeaders(Object.assign({
            'Content-Type': 'application/json',
        }, this.getHeaders()))

        Axios.post(url, this.getPostParams(true), {
            headers: this.getHeaders(),
        }).then((res) => {
            this.afterCall(res)
        }).catch((e) => {
            let r = e.response
            this.errorCallBack({ res: r })
        })
    }
}