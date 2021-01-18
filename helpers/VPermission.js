export default class VPermission {

    /**
     * 检查是否拥有指定权限
     * 拥有权限返回 true，否则返回 false
     * @param {string} name 权限名
     * @returns {boolean}
     */
    static hasPermission(name) {

        if( !name ) {
            return true;
        }

        let permission = store.state.permission;
        return permission.indexOf( name ) !== -1;
    }

    /**
     * 检查是否全部拥有指定权限
     * 全部拥有权限返回 true，有任何一个不拥有的权限返回 false
     * @param {array} list 权限名列表
     * @returns {boolean}
     */
    static hasPermissionAnd(list) {
        if( !list ) {
            return true;
        }
        let result = true;
        let permission = store.state.permission;
        for ( let index in list ) {
            result = result && permission.indexOf( list[index] ) !== -1;
            if( !result ) {
                break;
            }
        }
        return result;
    }

    /**
     * 检查是否拥有指定权限中的任何一个
     * 拥有 list 中任何一个权限则返回 true,否则返回 false
     * @param list
     * @returns {boolean}
     */
    static hasPermissionOr(list) {
        if( !list ) {
            return true;
        }
        let result = false;
        let permission = store.state.permission;
        for ( let index in list ) {
            result = permission.indexOf( list[index] ) !== -1;
            if( result ) {
                break;
            }
        }
        return result;
    }

    /**
     * 权限判断
     * @param {string} condition 校验方式，允许的值有 permission，permissionAnd，permissionOr
     * @param {string | array} permission 权限名或权限名列表
     * @returns {string | array}
     */
    static checkPermission({ condition, permission }) {
        let forbidden = {
            state: false,
            condition: undefined,
            permission: undefined,
        };
        if( typeof permission === 'string') {
            if( !VPermission.hasPermission( permission ) ) {
                forbidden = {
                    state: true,
                    condition: 'permission',
                    permission: permission,
                };
            }
        }
        if( condition === "permissionAnd" && Array.isArray( permission )) {
            if( !VPermission.hasPermissionAnd( permission ) ) {
                forbidden = {
                    state: true,
                    condition: 'permissionAnd',
                    permission: permission,
                };
            }
        }
        if( condition === "permissionOr" && Array.isArray( permission )) {
            if( !VPermission.hasPermissionOr( permission ) ) {
                forbidden = {
                    state: true,
                    condition: 'permissionOr',
                    permission: permission,
                };
            }
        }
        store.commit('update', {
            target: store.state.forbidden,
            data: forbidden
        });
        return permission;
    }


    /**
     * 刷新权限
     * @returns {undefined|Promise<any>|*|void}
     */
    static refreshPermission() {
        return VPermission.checkPermission(store.state.forbidden);
    }
}
