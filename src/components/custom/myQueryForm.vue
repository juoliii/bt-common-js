<template>
    <Card class="bt-card">
        <Form label-position="right" :label-width="100">
            <Row :gutter="20">
                <template v-for="(item,index) in items">
                    <Col :span="6" v-show="index<3 || (index>2 && showDetailQuery)">
                        <FormItem :label="item.title">
                            
                            <Input v-if="item.type=='text'" v-model.trim="modelValue[item.key]" />

                            <Input v-else-if="item.type=='number'" type="number" v-model.number="modelValue[item.key]" />

                            <Cascader v-else-if="item.type=='cascade'" :data="item.data" @on-change="p=>{modelValue[item.key]=p[1];item.onChange && item.onChange(p[1])}"/>

                            <Select v-else-if="item.type=='select'" v-model="modelValue[item.key]" :multiple="!!item.multiple" @on-change="value=>!!item.onChange && item.onChange(value)">
                                <Option v-for="option in item.options" :label="option.label" :value="option.value"></Option>
                            </Select>

                            <DatePicker v-else-if="item.type=='datetime'" v-model="modelValue[item.key]" type="datetime" @on-change="p=>modelValue[item.key]=p" />

                            <template v-else-if="item.type=='numberRange'">
                                <Input type="number" v-model.number="modelValue[item.key+'Start']" style="width: 50px;"/>
                                <span> - </span>
                                <Input type="number" v-model.number="modelValue[item.key+'End']" style="width: 50px;"/>
                            </template>
                            <template v-else-if="item.type=='dateRange'">
                                <DatePicker type="daterange" v-model="modelValue[item.key]" @on-change="p=>{modelValue[item.key+'Start']=p[0],modelValue[item.key+'End']=p[1]}" />
                            </template>
                        </FormItem>
                    </Col>
                </template>
                
                <Col :span="showDetailQuery?24:(items.length>3?6:((4-items.length)*6))" class="toRight">
                    <FormItem :label-width="0">
                        <Button type="primary" @click="search" icon="ios-search">查询</Button>&nbsp;
                        <Button type="default" @click="doReset" icon="md-refresh">重置</Button>&nbsp;
                        <a v-if="showDetailQuery" class="ivu-ml-8" @click="changeQueryForm"> 收起 <Icon type="ios-arrow-up" /></a>
                        <a v-else-if="!showDetailQuery && items.length>3" class="ivu-ml-8" @click="changeQueryForm"> 展开 <Icon type="ios-arrow-down" /></a>
                    </FormItem>
                </Col>
            </Row>
        </Form>
    </Card>
</template>
<script>
export default{
    name: "myQueryForm",
    emits:['update:modelValue','on-success','on-changePanel'],
    props:{
        modelValue:{
            type:Object,
            default:{}
        },
        //{type:'',title:'',key:'',onChange:function(){},options:[{label:'',value:''}],multiple:false}
        //type: text number cascade datetime select numberRange
        items:{
            type:Array,
            required:true
        },
        search:{
            type:Function,
            default:()=>{}
        },
        reset:{
            type:Function,
            default:()=>{}
        },
        expand:{
            type:Boolean,
            default:false
        }
    },
    mounted() {
        this.showDetailQuery=this.expand;
    },
    data(){
        return {
            showDetailQuery:false
        }
    },
    methods:{
        doReset(){
            this.$emit('update:modelValue',{});
            this.reset();
        },
        changeQueryForm(){
            this.showDetailQuery=!this.showDetailQuery;
            this.$emit('on-changePanel',this.showDetailQuery);
        }
    }
}
</script>
<style scoped>
.toRight{
    text-align: right;
}
.bt-card{
    margin-bottom: 10px;
}
</style>