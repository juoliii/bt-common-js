<template>
    <Button v-if="showButton" :disabled="disabled" class="my-btn" type="default" @click="init"><slot>导出</slot></Button>
    <Modal
        v-model="showExcelDlg"
        :mask-closable="false"
        width="50"
        transfer
        title="导出">
        <Form ref="exportFormRef" :model="form" label-position="top">
            <FormItem label="选择字段：" prop="columns" :rules="{required:true,message:'至少选择一个'}">
                <CheckboxGroup v-model="form.columns" >
                    <Checkbox :label="item.key" v-for="item in columns">{{ item.title }}</Checkbox>
                </CheckboxGroup>
            </FormItem>
            <FormItem label="选择导出格式：">
                <RadioGroup v-model="form.format">
                    <Radio label="excel"></Radio>
                </RadioGroup>
            </FormItem>
        </Form>

        <template #footer>
            <div class="ivu-text-center">
                <Button type="default"  @click="showExcelDlg=false">取消</Button>
                <Button type="primary" @click="doExport">导出</Button>
            </div>
        </template>
    </Modal>
    
</template>
<script>
    export default {
        name:'myExportList',
        props:{
            title:{
                type:String,
                default:'选择字段'
            },
            columns:{
                type:Array,
                default:[]
            },
            disabled:{
                type:Boolean,
                default:false
            },
            showButton:{
                type:Boolean,
                default:true
            },
            onSuccess:{
                type:Function,
                default:()=>{}
            }
        },
        data(){
            return {
                showExcelDlg:false,
                form:{}
            }
        },
        methods:{
            init(){
                this.showExcelDlg=true;
                this.form={};
                this.form.columns=this.columns.map(item=>item.key);
                this.form.format='excel';
            },
            doExport(){
                this.$refs['exportFormRef'].validate((valid) => {
                    if(valid) {
                        this.form.fullColumns=this.columns.filter(item=>this.form.columns.includes(item.key));
                        this.onSuccess(this.form);
                        this.showExcelDlg=false;
                    }
                });
            }
        }
    }
</script>