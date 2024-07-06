<template>
    <slot name="topQuery" :queryForm="queryForm" :search="search" :reset="reset"></slot>
    <Card class="mainCustomTable" :class="customClass" :padding="10" :dis-hover="true" :bordered="false">
        <template #title>
            <div style="display: flex;min-height: 30px;"><slot :tableData="tableData" :queryForm="queryForm">&nbsp;</slot></div>
        </template>
        <template #extra>
            <div style="width:50rem;display: flex;align-items: center;justify-content:flex-end;">
                <Input style="width: 15rem;margin-right: 20px;" search v-if="quickInputBox.show" type="text" :placeholder="quickInputBox.placeholder" v-model.trim="queryForm.key" @on-search="search"/>
                <advancedSearch v-if="searchConditions.length>0" :conditions="searchConditions" @search="groups=>{queryForm._groups=groups;search();}"></advancedSearch>
                <Tooltip content="列设置" placement="top" :transfer="true">
                    <Icon type="ios-list" @click="showColumns=true" size="30"/>
                </Tooltip>
            </div>
            <Drawer v-model="showColumns" title="请选择列" class-name="TableDrawer">
                <div class="verticalCheckbox">
                    <Checkbox v-for="(item,index) in _columns" :style="index>0?{marginTop: '0.9rem'}:{}" @on-change="val=>{saveColume(!val,item.key)}" :key="index" v-model="item.hidden" :true-value="false" :false-value="true">{{item.title}}</Checkbox>
                </div>
            </Drawer>
        </template>
        <Table ref="selection" :columns="tableColumns" :max-height="height" :border="true" :data="tableData.list" @on-selection-change="selectionChange" @on-column-width-resize="resizeWidth" @on-sort-change="sortChange">
            <template #op="{row,index}" v-if="showOperate">
                <slot name="op" :row="row" :index="index"></slot>
            </template>
        </Table>
        <Page v-if="showPage" transfer :total="tableData.total" v-model="queryForm.pn" :page-size="queryForm.ps"  @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,50,100]" :show-total="true" :show-sizer="true" :show-elevator="true" class-name="mypage"/>
    </Card>
</template>
<script>
    import { prefix } from '@/utils'
    import advancedSearch from './bt-advance-search.vue'

    export default {
        name: "bt-table",
        components:{advancedSearch},
        emits:['update:modelValue'],
        props: {
            url:{
                type:String,
                required:true,
            },
            modelValue:{
                type:Object,
                default:{
                }
            },
            selectionChange:{
                type:Function,
                default:()=>{}
            },
            extraData:{
                type:Object,
                default:{}
            },
            columns:{
                type:Array,
                default:[]
            },
            height:{
                type:Number,
                default:null
            },
            searchConditions:{
                type:Array,
                default:[]
            },
            showCheckBox:{
                type:Boolean,
                default:false
            },
            showOperate:{
                type:Boolean,
                default:true
            },
            operateWidth:{
                type:Number,
                default:100
            },
            saveColumnId:{
                type:String,
                default:''
            },
            customClass:{
                type:String,
                default:''
            },
            showPage:{
                type:Boolean,
                default:true
            },
            quickInputBox:{
                type:Object,
                default:{
                    show:true,
                    placeholder:'请输入',
                }
            }
        },
        data() {
            return {
                showColumns:false,
                _columns:[],
                saveColumnsList:[],
                saveColumnsWidth:[],
                queryForm:{pn:1,ps:10,showDetailQuery:false,exportParams:{}},
                tableData:{total:0,list:[]}
            }
        },
        watch:{
            columns(val){
                this.init();
            }
        },
        mounted() {
            this.init();
        },
        computed:{
            tableColumns(){
                return this._columns.filter(item=>!item.hidden)
            }
        },
        methods: {
            init(){
                this.renderColumn();
                this.queryForm=Object.assign({},this.queryForm,this.extraData,{exportParams:{fullColumns:this.columns}})
                this.search();
            },
            changePage(page){
                this.queryForm.pn=page;
                this.getList();
            },
            changePageSize(ps){
                this.queryForm.pn=1;
                this.queryForm.ps=ps;
                this.getList();
            },
            async search(){
                this.queryForm.pn=1;
                return await this.getList();
            },
            async reset(){
                this.queryForm=Object.assign({},{pn:1,ps:10,showDetailQuery:this.queryForm.showDetailQuery,dynamicFields:{}},this.extraData);
                return await this.getList();
            },
            async getList(){
                this.queryForm=Object.assign({},this.queryForm,this.extraData);
                this.tableData=await this.$http.postJSON(this.url,this.queryForm);
                if(!!this.selectionChange){
                    this.selectionChange([])
                }
                return this.tableData
            },
            sortChange(param){
                if(param.key){
                    this.queryForm.pn=1;
                    this.queryForm.sortDynamic=!!param.column.dynamic;
                    this.queryForm.sortName=param.order=='normal'?'':param.key;
                    this.queryForm.sortType=param.order=='normal'?'':param.order;
                    this.getList();
                }
            },
            renderColumn(){
                this._columns=[...this.columns];
                this._columns.forEach(item=>item.resizable=true);
                if(this.showCheckBox){
                    this._columns.unshift({type: 'selection', width: 60,align: 'center' ,fixed:'left'});
                }
                if(this.showOperate){
                    this._columns.push({ title: '操作',align: 'center',slot: 'op',width: this.operateWidth,fixed:'right'});
                }
                if(!!this.saveColumnId){
                    let list=localStorage.getItem(prefix+'saveColumnsList'+this.saveColumnId);
                    let widthList=localStorage.getItem(prefix+'saveColumnsWidth'+this.saveColumnId);
                    if(list){
                        list=JSON.parse(list);
                        if(!!list){
                            this.saveColumnsList=list;
                        }
                    }
                    if(widthList){
                        widthList=JSON.parse(widthList);
                        if(!!widthList){
                            saveColumnsWidth=widthList;
                        }
                    }
                    this._columns.forEach(item=>{
                        this.saveColumnsList.forEach(ele=>{
                            if(ele.key==item.key){
                                item.hidden=ele.value
                            }
                        })
                        this.saveColumnsWidth.forEach(ele=>{
                            if(ele.key==item.key){
                                item.minWidth=ele.value
                            }
                        })
                    })
                }
            },
            saveColume(val,key){
                if(!!this.saveColumnId&&!!key){
                    if(this.saveColumnsList.some(item=>item.key==key)){
                        this.saveColumnsList.forEach(ele => {
                            if(ele.key==key){
                                ele.value=!val
                            }
                        });
                    }else{
                        this.saveColumnsList.push({key:key,value:!val})
                    }
                    localStorage.setItem(prefix+'saveColumnsList'+this.saveColumnId,JSON.stringify(this.saveColumnsList))
                }
            },
            resizeWidth(newWidth, oldWidth, column){
                if(!!this.saveColumnId&&(!!column.key)){
                    if(this.saveColumnsWidth.some(item=>item.key==column.key)){
                        this.saveColumnsWidth.forEach(ele => {
                            if(ele.key==column.key){
                                ele.value=newWidth
                            }
                        });
                    }else{
                        this.saveColumnsWidth.push({key:column.key,value:newWidth})
                    }
                    localStorage.setItem(prefix+'saveColumnsWidth'+this.saveColumnId,JSON.stringify(this.saveColumnsWidth))
                }
            }
        }
    }
</script>
<style scoped lang="less">
</style>