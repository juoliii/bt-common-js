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
                        <div class="customTab activedTab">
                            高级搜索
                        </div>
                        <span class="mycustomsave" @click="visible=false">
                            <Icon type="md-close" size="20"/>
                        </span>
                    </div>
                    <div class="advancedSearch">
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
                                    <Input v-if="ele.showType=='text'" :type="ele.type==2?'textarea':'text'" v-model.trim="groups[index].details[num].value" style="width: 100%;" />
                                    <Input v-else-if="ele.showType=='number'" type="number" v-model.number="groups[index].details[num].value" style="width: 100%;" />
                                    <Select v-else-if="ele.showType=='select'" v-model="groups[index].details[num].value" multiple style="width: 100%;" transfer>
                                        <Option v-for="ops in ele.options()" :label="ops.label" :value="ops.value+''"></Option>
                                    </Select>
                                    <DatePicker v-else-if="ele.showType=='date'" type="date" :format="ele.dateFormat||'YYYY-MM-DD'" :model-value="groups[index].details[num].value" @on-change="(date)=>{ groups[index].details[num].value=date }" style="width: 100%;" transfer/>
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
                    <div style="height: 50px;display: flex;align-items: center;justify-content: center;position: relative;">
                        <Button type="primary" @click="doSearch">搜 索</Button>
                        <Button type="default" @click="doReset" style="margin-left: 15px;">清 空</Button>
                    </div>
                </div>
            </template>
        </Dropdown>
    </div>
</template>

<script>
import _ from "lodash";
import moment from 'moment';

export default {
    name:'advancedSearch',
    emits:['search'],
    props:{
        conditions:{
            type:Array,
            default:[]
        }
    },
    data(){
        return {
            visible:false,
            groups:[{details:[{showType:'text'}]}],
            algorithmList:[
                {label:'=',value:1,type:['number','date','text']},
                {label:'in',value:2,type:['select','text']},
                {label:'≠',value:3,type:['number','date','text']},
                {label:'包含',value:4,type:['text']},
                {label:'<',value:5,type:['number','date']},
                {label:'>',value:6,type:['number','date']},
                {label:'≤',value:7,type:['number','date']},
                {label:'≥',value:8,type:['number','date']},
            ]
        }
    },
    methods:{
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
            let item=this.conditions.filter(item=>item.key==value.value.split('-')[1]&&item.title==value.label)
            if(item.length==1){
                let obj={
                    condition:this.groups[index].details[num].condition,
                    dynamic:!!item[0].isDynamic,
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
                        if(!ele.value){
                            ele.value=null
                        }
                    })
                }
            })
            this.$emit('search',result)
            this.visible=false;
        },
        doReset(){
            this.emit('search',[])
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
    }

    .advancedSearch{
        .eachCol{
            width: 100%;
            padding: 10px 0;
            display: flex;
            align-items: center;
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