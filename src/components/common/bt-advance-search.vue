<template>
    <div class="myAdvanceSearchModal" style="display: flex;margin-right: 10px;align-items: center;">
        &nbsp;&nbsp;<a @click="doReset">重置</a>&nbsp;&nbsp;
        <Dropdown placement="bottom-end" trigger="custom" :visible="visible">
            <div class="addEventListener">
                <a @click="visible=!visible">高级搜索</a>
            </div>
            <template #list>
                <div class="addEventListener" style="width: 50rem;overflow: hidden;">
                    <div style="display: flex;width: 100%;position: relative;">
                        <div class="customTab" @click="modalShowType=1" :class="modalShowType==1?'activedTab':''">
                            高级搜索
                        </div>
                        <div class="customTab" v-if="!!tableKey" @click="modalShowType=2" :class="modalShowType==2?'activedTab':''">
                            已保存搜索
                        </div>
                        <span class="mycustomsave" @click="visible=false">
                            <Icon type="md-close" size="20"/>
                        </span>
                    </div>
                    <div v-if="modalShowType==1" class="advancedSearch">
                        <Row v-for="item,index of groups" :gutter="10">
                            <div class="eachCol" v-for="ele,num of item.details">
                                <Col :span="3" style="text-align: center;">
                                    <span v-if="num===0">{{ '第 '+(index+1)+' 组' }}</span>
                                    <Select v-else v-model="groups[index].details[num].condition" style="width:100%" size="small">
                                        <Option value="and">且</Option>
                                        <Option value="or">或</Option>
                                    </Select>
                                </Col>
                                <Col :span="6">
                                    <Select v-model="groups[index].details[num].key" @on-select="(val)=>{onItemSelectChange(val,index,num)}" placeholder="请选择筛选字段" style="width:100%" transfer>
                                        <Option v-for="item in conditions" :value="item.alias+'-'+item.key" :key="item.key+item.alias">{{ item.title }}</Option>
                                    </Select>
                                </Col>
                                <Col :span="5">
                                    <Select v-model="groups[index].details[num].type" placeholder="请选择算法条件" style="width:100%" transfer>
                                        <Option v-for="ops in algorithmList.filter(item=>item.type.indexOf((ele.showType=='input'&&ele.valType=='number')?'number':ele.showType)>-1)" :key="ops.value" :value="ops.value" :label="ops.label"></Option>
                                    </Select>
                                </Col>
                                <Col :span="8">
                                    <Input v-if="ele.showType=='text'" :type="ele.type=='in'?'textarea':'text'" v-model.trim="groups[index].details[num].value" style="width: 100%;" />
                                    <Input v-else-if="ele.showType=='number'" type="number" v-model.number="groups[index].details[num].value" style="width: 100%;" />
                                    <Select v-else-if="ele.showType=='select'" v-model="groups[index].details[num].value" multiple style="width: 100%;" transfer>
                                        <Option v-for="ops in ele.options()" :label="ops.label" :value="ops.value+''"></Option>
                                    </Select>
                                    <DatePicker v-else-if="ele.showType=='date'" type="date" :format="ele.dateFormat||'yyyy-MM-dd'" :model-value="groups[index].details[num].value" @on-change="(date)=>{ groups[index].details[num].value=date }" style="width: 100%;" transfer/>
                                </Col>
                                <Col :span="1">
                                    <Icon type="md-add-circle" @click="addOneItem(index,num)" size="20"/>
                                </Col>
                                <Col :span="1">
                                    <Icon v-if="groups[index].details.length>1" @click="deleteOneItem(index,num)" type="ios-trash" size="20"/>
                                </Col>
                            </div>
                            <div class="eachCol">
                                <template v-if="index==(groups.length-1)">
                                    <Col :span="22">
                                        <div class="addButton" @click="addOneGroup()">
                                            添加组
                                        </div>
                                    </Col>
                                </template>
                                <template v-else>
                                    <Col :span="9"></Col>
                                    <Col :span="5" style="text-align: center;">
                                        <Select v-model="groups[index+1].condition" style="width:100%">
                                            <Option value="and">且</Option>
                                            <Option value="or">或</Option>
                                        </Select>
                                    </Col>
                                    <Col :span="8"></Col>
                                </template>
                                <Col :span="2">
                                    <div v-if="groups.length>1" class="addButton" @click="deleteOneGroup(index)">
                                        删除组
                                    </div>
                                </Col>
                            </div>
                        </Row>
                    </div>
                    <div v-else class="advancedSearch" style="display:flex;flex-direction: row;flex-wrap:wrap;">
                        <div class="myCustomTag" style="max-width:calc(100% - 20px);min-width: 15%;" v-for="item of saveFormList">
                            <span style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;" @click="toDetail(item)">
                                {{ item.name }}
                            </span>
                            <div class="deleteTag">
                                <Icon type="md-options" size="13" @click="editSaveItem(item)"></Icon>&nbsp;&nbsp;
                                <Icon type="ios-trash" size="15" @click="deleteSave(item)"></Icon>
                            </div>
                        </div>
                        <div v-if="saveFormList.length==0" style="margin-top: 15px;">
                            暂未保存任何搜索条件！
                        </div>
                    </div>
                    <div style="height: 50px;display: flex;align-items: center;justify-content: center;position: relative;">
                        <Button type="primary" @click="doSearch" v-if="modalShowType==1">搜 索</Button>
                        <Button type="default" @click="doReset" style="margin-left: 15px;" v-if="modalShowType==1">清 空</Button>
                        <span class="mycustomsave" @click="saveForm={status:'1',isMenu:true};showSaveModal=true"  v-if="modalShowType==1 && !!tableKey">&nbsp;保存</span>
                    </div>
                </div>
            </template>
        </Dropdown>
    </div>

    <Modal
        v-model="showSaveModal"
        :title="(!saveForm.id?'保存':'编辑')+'搜索条件'">
        <Form label-position="right" :label-width="120" ref="formValidate" :model="saveForm">
            <Row>
                <Col :span="20">
                    <FormItem label="名称" prop="name" :rules="[{required:true, message: '必填'}]">
                        <Input class="myinput" maxlength="100" type="text" placeholder="请输入" v-model="saveForm.name"></Input>
                    </FormItem>
                </Col>
                <Col :span="20">
                    <FormItem label="权限">
                        <RadioGroup v-model="saveForm.status">
                            <Radio label="1">个人</Radio>
                            <Radio label="2">公开</Radio>
                        </RadioGroup>
                    </FormItem>
                </Col>
            </Row>
        </Form>
        <template #footer>
            <div style="text-align: right;">
                <div>
                    <Button type="primary" @click="doSave">保 存</Button>
                    <Button @click="showSaveModal=false">取 消</Button>
                </div>
            </div>
        </template>
    </Modal>

</template>

<script>
import _ from "lodash";

export default {
    name:'bt-advance-search',
    emits:['search'],
    props:{
        //text,number,select,date {key: 'code',title: '样本编号',showType:'text',alias:'s',dynamic:false}
        conditions:{
            type:Array,
            default:[]
        },
        tableKey:{
            type:String,
            default:''
        }
    },
    data(){
        return {
            modalShowType:1,
            saveForm:{},
            showSaveModal:false,
            saveFormList:[],
            visible:false,
            groups:[{details:[{showType:'text'}]}],
            algorithmList:[
                {label:'=',value:'eq',type:['number','date','text']},
                {label:'in',value:'in',type:['select','text']},
                {label:'≠',value:'ne',type:['number','date','text']},
                {label:'包含',value:'like',type:['text']},
                {label:'<',value:'lt',type:['number','date']},
                {label:'>',value:'gt',type:['number','date']},
                {label:'≤',value:'lte',type:['number','date']},
                {label:'≥',value:'gte',type:['number','date']},
            ]
        }
    },
    mounted(){
        if(this.tableKey){
            this.getQueryFormList();
        }
    },
    watch:{
        tableKey(newValue,oldValue){
            if(newValue){
                this.getQueryFormList();
            }
        }
    },
    methods:{
        doSave(){
            let self=this;
            this.$refs['formValidate'].validate((valid)=>{
                if(valid){
                    if(!this.saveForm.id){
                        this.saveForm.tableKey=this.tableKey;
                        this.saveForm.data=JSON.stringify(this.groups)
                    }
                    this.$http.postJSON('/lims3/api/other/saveQueryCondition',this.saveForm).then(data=>{
                        self.$Message.success('保存成功！')
                        self.modalShowType=2;
                        self.showSaveModal=false;
                        self.getQueryFormList()
                    })
                }
            })
        },
        editSaveItem(item){
            let obj={id:item.id,name:item.name,status:item.status+'',isMenu:item.isMenu}
            this.saveForm={...obj}
            this.showSaveModal=true
        },
        deleteSave(item){
            let self=this;
            this.$Modal.confirm({
                title:'是否确认删除保存条件？',
                content:'条件名：' + item.name,
                onOk(){
                    self.$http.post('/lims3/api/other/removeQueryCondition',{id:item.id}).then(data=>{
                        self.$Message.success('删除成功！')
                        self.getQueryFormList()
                    })
                }
            })
        },
        toDetail(searchItem){
            searchItem.data.forEach(item=>{
                if(!!item.details){
                    item.details.forEach(ele=>{
                        if(ele.showType=='select'){
                            let arr=this.conditions.filter(cc=>(cc.alias+'-'+cc.code)==ele.key)
                            if(arr.length==1){
                                ele.options=arr[0].options
                            }else{
                                ele.options=function(){
                                    return {label:'未找到该项',value:'0'}
                                }
                                ele.value=''
                            }
                        }
                    })
                }
            })
            this.groups=searchItem.data;
            this.modalShowType=1;
            if(!this.visible)
                this.visible=true
        },
        getQueryFormList(){
            this.$http.post('/lims3/api/other/getQueryConditionList',{tableKey:this.tableKey}).then(data=>{
                data.forEach(item=>{
                    item.data=JSON.parse(item.data)
                })
                this.saveFormList=data
            })
        },
        addOneItem(index,num){
            this.groups[index].details.splice((num+1),0,{condition:'and'})
        },
        addOneGroup(){
            this.groups.push({condition:'and',details:[{}]})
        },
        deleteOneItem(index,num){
           this.groups[index].details.splice(num,1)
        },
        deleteOneGroup(index){
            this.groups.splice(index,1)
        },
        onItemSelectChange(value,index,num){
            let item=this.conditions.filter(item=>item.key==value.value.split('-')[1] && item.title==value.label)
            if(item.length==1){
                let obj={
                    condition:this.groups[index].details[num].condition,
                    dynamic:!!item[0].dynamic,
                    alias:item[0].alias,
                    value:'',
                    showType:item[0].showType,
                }
                if(obj.showType=='date'){
                    obj.dateFormat=item[0].dateFormat
                }
                if(obj.showType=='select'){
                    obj.options=item[0].options
                }
                let arr=this.algorithmList.find(item=>item.type.includes(obj.showType))
                arr && (obj.type=arr.value)
                this.groups[index].details[num]=obj
            }
        },
        doSearch(){
            let result=_.cloneDeep(this.groups)
            result.forEach((item,index)=>{
                if(item.details && item.details.length>0){
                    item.details=item.details.filter(ele=>!!ele.key)
                }
            })
            result=result.filter(item=>item.details?.length>0)
            result.forEach((item,index)=>{
                if(index==0){
                    if(item.condition) delete item.condition
                }
                if(item.details && item.details.length>0){
                    item.details.forEach((ele,num)=>{
                        if(num==0){
                            if(ele.condition) delete ele.condition
                        }
                        ele.key=ele.key.split('-')[1]
                        if(ele.value===null || ele.value==='' || ele.value===undefined){
                            ele.value=null
                        }
                    })
                }
            })
            this.$emit('search',result)
            this.visible=false;
        },
        doReset(){
            this.groups=[{details:[{showType:'text'}]}];
            this.$emit('search',[])
            this.visible=false;
        }
    }

}


</script>

<style lang="less" scoped>
@keyframes floatingDown {
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.myAdvanceSearchModal{
    --advance-main-padding:0.9375rem;
    .customTab{
        padding: 15px 10px;
        margin-left: 10px;
        color: #333333;
        border-bottom: 1px solid #3d92ee00;
        cursor: pointer;
        transition: color 0.3s, border-bottom .3s;
        &:hover{
            color: #3d93ee;
            border-bottom: 1px solid #3d93ee;
        }
        box-sizing: border-box;
    }
    .activedTab{
        color: #2D8cF0;
        border-bottom: 1px solid #2D8cF0;
    }
    .addButton{
        width: 100%;
        border-radius: 2px;
        border: 1px dashed #DDDDDD;
        line-height: 2rem;
        text-align: center;
        cursor: pointer;
        &:hover{
            color: rgb(22, 119, 255);
            border: 1px dashed #a7bef7;
        }
    }
    .advancedSearch{
        width:100%;
        max-height:25rem;
        padding:0 var(--advance-main-padding);
        overflow-y: auto;
        overflow-x:hidden;
        .eachCol{
            width: 100%;
            padding: 10px 0;
            display: flex;
            align-items: center;
        }
        .myCustomTag{
            --custom-tag-border:1px solid gray;
            border: var(--custom-tag-border);
            border-radius: 5px;
            display: flex;
            flex-direction: row;
            padding-right: 50px;
            margin-top: 10px;
            position: relative;
            margin-right: 10px;
            > span{
                padding: 5px;
                width: 100%;
                font-size: 0.75rem;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                &:hover{
                    &::before{
                        content:'详情';
                        position: absolute;
                        width: 100%;
                        text-align: center;
                        border-radius: 5px 0 0 5px;
                        top: 0;
                        left: 0;
                        padding: 5px;
                        background-color: #a7bef7;
                        animation: floatingDown 1s ease forwards;
                    }
                }
            }
            .deleteTag{
                position: absolute;
                width: 50px;
                height: 100%;
                top: 0;
                right: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-left: var(--custom-tag-border);
                :first-child{
                    color: #2D8cF0;
                    cursor: pointer;
                    &:hover{
                        color: #3b92ee;
                    }
                }
                :nth-child(2){
                    color: #ed4014;
                    cursor: pointer;
                    &:hover{
                        color: #ee4d25;
                    }
                }
            }
        }
    }

    .mycustomsave{
        position: absolute;
        height: 100%;
        top: 0;
        right: 0;
        display: flex;
        color: #333333;
        transition: color 0.3s;
        align-items: center;
        justify-content: center;
        padding-right: calc(var(--advance-main-padding) * 1.1);
        font-size: 0.875rem;
        cursor: pointer;
        &:hover{
            color: rgb(22, 119, 255);
        }
    }
    .myAdvancedDrop{
        .ivu-dropdown-item{
            padding: 10px 18px;
            display: flex;
        }
        .custom_div{
            display: flex;
            align-items: center;
        }
    }
    a{
        font-size: 0.875rem;
    }
}
</style>