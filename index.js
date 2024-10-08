import myTable from './src/components/custom/myTable.vue'
import advancedSearch from './src/components/custom/advancedSearch.vue'
import myQueryForm from './src/components/custom/myQueryForm.vue'
import myExportList from './src/components/custom/exportList.vue'
import btTable from './src/components/common/bt-table.vue'
import btSearch from './src/components/common/bt-search.vue'
import btAdvanceSearch from './src/components/common/bt-advance-search.vue'

const components = [advancedSearch,myTable,myQueryForm,myExportList,btTable,btSearch,btAdvanceSearch]

const install = function (Vue) {   
    // 判断是否安装
    if (install.installed) return
    // 遍历注册全局组件
    components.map(component => Vue.component(component.name, component))
}
    
// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}

export default {
    // 导出的对象必须具有 install，才能被 Vue.use() 方法安装
    install,
    // 以下是具体的组件列表
    ...components
}

//相对路径转绝对路径
export function toAbsoluteUrl(relativeUrl) {
    // 创建一个a标签
    var a = document.createElement('a');
    // 设置a标签的href属性为传入的相对URL
    a.href = relativeUrl;
    // 返回转换后的绝对URL
    return a.href;
}