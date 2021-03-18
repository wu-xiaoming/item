<template>
    <div class="box">
        <el-row>
            <el-col :span="16">
                <div class="elInput">
                    <el-autocomplete
                        v-model="state"
                        @keyup.native="$event.target.value = $event.target.value.replace(/^\s+|\s+$/gm,'')"
                        value-key="name"
                        :fetch-suggestions="querySearchAsync"
                        placeholder="请输入姓名"
                        @select="handleSelect"
                    ></el-autocomplete>
                    <el-button type="primary" class="button" @click="queryName(state)">搜索</el-button>
                    <el-button type="primary" class="button" @click="loadClassAll(page)">搜索全部</el-button>
                </div>
                
            </el-col>
            <!-- @focus="getFocus" -->
            <el-col :span="8">
                <!-- from表单 -->
                <div class="biandan">
                    <el-dialog :title="title"  :visible.sync="dialogFormVisible" >
                        <el-form :model="form"  :rules="rules" ref="form">
                            <el-form-item label="姓名" prop="name" :label-width="formLabelWidth">
                                <el-input v-model="form.name" autocomplete="off"></el-input>
                            </el-form-item>
                            <el-form-item label="创建日期"  required :label-width="formLabelWidth">
                                <el-col :span="11">
                                <el-form-item prop="openDate">
                                    <el-date-picker type="date" placeholder="选择日期" v-model="form.openDate" style="width: 100%;"></el-date-picker>
                                </el-form-item>
                                </el-col>
                                <el-col class="line" :span="2">-</el-col>
                                
                            </el-form-item>
                            <el-form-item label="教师" prop="teacherIds" :label-width="formLabelWidth">
                                <el-select @focus="queryTeacher" v-model="form.teacherIds" clearable multiple placeholder="请选择">
                                    <el-option
                                    v-for="(item,index) in options"
                                    :key="index"
                                    :label="item.teacherName"
                                    :value="item.teacherName">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                           
                            <el-form-item label="状态" prop="status" :label-width="formLabelWidth">
                                <el-select v-model="form.status"   placeholder="请选择">
                                    <el-option v-for="(item,index) in statusSZ" :key="index"  :label="item" :value="index"></el-option>
                                    
                                    <!-- <el-option label="正常" value="0"></el-option>
                                    <el-option label="离职" value="1"></el-option> -->
                                </el-select>
                            </el-form-item>
                             <el-form-item label="部门描述" prop="remark" :label-width="formLabelWidth">
                                <el-input v-model="form.remark" autocomplete="off"></el-input>
                            </el-form-item>
                            
                        </el-form>
                        <div slot="footer" class="dialog-footer">
                            <el-button @click="dialogFormVisible = false, form = {}">取 消</el-button>
                            <el-button type="primary" @click="submit('form')">确 定</el-button>
                        </div>
                    </el-dialog>
                </div>
                <el-button type="primary" class="button" @click="dialogFormVisible=true,title='新增班级',from='' ">新增班级</el-button>
            </el-col>
        </el-row>

        <el-table
            ref="multipleTable"
            :data="tableData"
            tooltip-effect="dark"
            style="width: 100%"
            @selection-change="handleSelectionChange">
            <el-table-column
                type="selection"
                width="55">
            </el-table-column>
            <el-table-column
                label="创建日期"
                width="150">
            <template slot-scope="scope">{{ scope.row.openDate }}</template>
            </el-table-column>
            <el-table-column
                prop="name"
                label="姓名"
                width="150">
            </el-table-column>
            <el-table-column
                prop="status"
                label="状态"
                width="150">
                <template slot-scope="scope">
                    <div>
                        {{scope.row.status==0?'正常':'离职'}}
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                prop="teacherIds"
                label="教师"
                width="150">
            </el-table-column>
            <el-table-column
                prop="remark"
                label="描述"
                width="250">
            </el-table-column>
            <el-table-column
                label="操作">
                <template slot-scope="scope">
                    <el-button size="mini" type="success" @click="() => {dialogFormVisible=true; title='编辑班级'; scopeClass(scope.row)}">修 改</el-button>
                    <el-button size="mini" type="danger" @click="del(scope.row.id)">删 除</el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination" >
            <el-button type="primary" @click="delBatch(multipleSelection)">批量删除</el-button>
            <el-pagination
            background
            layout="prev, pager, next"
            :current-page="page"
            @current-change="currentChange"
            :page-size="10"
            :total="total">
            </el-pagination>
        </div>
    </div>
</template>

<script>
import { queryClass,queryNameClass,getJiaoxue,addClass,delClass,updataClass,delBatchClass,findOne } from '@/api/index.js';

export default {
    data() {
      return {
        restaurants: [],
        state: '',
        timeout:  null,
        numStr:1,
        page:1,
        data:[],
        total:0,
        className:{},
        multipleSelection: [],
        tableData: [],
        options:[],
        teacherPage:'',
        teacherNum:1,
        form:{
            name:'',
            openDate:'',
            remark:'',
            status:'',
            teacherIds:'',
        },
        dialogFormVisible:false,
        title:'新增班级',
        formLabelWidth: '120px',
        statusSZ:['正常','离职'],
        rules: {
          name: [
            { required: true, message: '请输入活动名称', trigger: 'blur' },
            { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
            
          ],
          openDate: [
            { required: true, message: '请选择日期', trigger: 'blur' }
          ],
          teacherIds: [
            // { type: 'number', message: '年龄必须为数字值'},
            {  required: true, message: '请输入教师', trigger: 'blur' }
          ],
          status: [
            
            { required: true, message: '请选择', trigger: 'blur' }
          ],
        }
      };
    },
    mounted() {
        this.loadAll(this.page)
        this.nameAll(this.page)
    },
    methods:{
        loadAll(page) {
            queryClass({limit:10,page:page}).then(res => {
                this.tableData = res.data.list
                this.total = res.data.totalCount
                this.page = res.data.curPage
                console.log(res.data);

                
            })
            
        },
        nameAll(page){
           return new Promise((r,j)=>{
                queryNameClass({limit:100,page:page}).then(res => {
                    this.restaurants = res.data.list
                    r()
            })
           })
            
        },
        
        //form表单获取教师
        queryTeacher(){
            this.teacherNum=1
            getJiaoxue({limit:10,page:this.teacherNum}).then((res)=>{
                        this.options = res.data.list
                        this.teacherPage = res.data.totalPage
                    })
            var elScrollbarThumb = document.getElementsByClassName('el-select-dropdown__wrap')[0]
            elScrollbarThumb.onscroll = () => {
                var h = elScrollbarThumb.scrollHeight+17
                var vh = elScrollbarThumb.offsetHeight
                var top = elScrollbarThumb.scrollTop
                if ((top+vh)>=h) {
                    console.log('dd');
                    if ((++this.teacherNum) <= this.teacherPage) {
                       getJiaoxue({limit:10,page:this.teacherNum}).then((res)=>{
                        //    console.log(res);
                            this.options = this.options.concat(res.data.list)
                       })
                          
                    }
                }
            }
            
            
        },
        
        
        //搜索全部
        loadClassAll(num){
            this.state = ''
            this.loadAll(num)
        },
        //schoolheigth
        getFocus(){
            var elScrollbarThumb = document.getElementsByClassName('el-autocomplete-suggestion__wrap')[0]
            elScrollbarThumb.onscroll = () => {
                var h = elScrollbarThumb.scrollHeight+17
                var vh = elScrollbarThumb.offsetHeight
                var top = elScrollbarThumb.scrollTop
                if ((top+vh)>=h) {
                    if ((++this.numStr) <= Math.ceil(this.total/10)) {
                        
                    }
                    
                }
                
            }    
        },
        
        //获取当前scope.row
        scopeClass(row){
            if (!Array.isArray(row.teacherIds)) {
                row.teacherIds=row.teacherIds.split(',')
            }
            
            this.form = JSON.parse(JSON.stringify(row))
            console.log(row);
            
        },
        
        //新增班级和修改
        submit(formName){
             this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.dialogFormVisible = false;
                    var d =  new Date(this.form.openDate)
                    this.form.openDate=d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
                    console.log(this.form);
                    // console.log(this.form);
                    if (this.title == '新增班级') {
                        console.log(this.form);
                        addClass(this.form).then(res => {
                            this.form ={}
                            this.$message.success({message:res.msg,duration:1000})
                            if (this.state !== '') {
                                console.log('xinzeng');
                                var promise = new Promise((resolve, reject) => {
                                    this.loadAll(this.page)
                                    this.nameAll(this.page)
                                    resolve()
                                });
                                promise.then(this.queryName(this.state))
                            } else {
                                this.loadAll(this.page)
                                
                            }
                            // this.pages()
                        })
                    }  else if (this.title == '编辑班级'){
                        console.log(this.form);
                        delete(this.form.createTime)
                        delete(this.form.delFlag)
                        delete(this.form.updateTime)
                        updataClass(this.form).then(res => {
                            console.log(res);
                            this.form ={}
                            this.$message.success({message:res.msg,duration:1000})
                            if (this.state !== '') {
                                var promise = new Promise((resolve, reject) => {
                                    this.loadAll(this.page)
                                    this.nameAll(this.page)
                                    resolve()
                                });
                                promise.then(this.queryName(this.state))
                            } else {
                                this.loadAll(this.page)
                                this.restaurants = this.tableData
                            }
                        }) 
                        
                    }
                }
            });
                
            
            
        },

       
        querySearchAsync(queryString, cb) {
            
            var elScrollbarThumb = document.getElementsByClassName('el-autocomplete-suggestion__wrap')[0]
            elScrollbarThumb.onscroll = () => {
                console.log('人呢');
                var h = elScrollbarThumb.scrollHeight+17
                var vh = elScrollbarThumb.offsetHeight
                var top = elScrollbarThumb.scrollTop
                if ((top+vh)>=h) {
                    if ((++this.numStr) < Math.ceil(this.total/10)) {
                       this.nameAll(this.numStr).then(()=>{
                           cb(this.restaurants)
                       })
                          
                    }
                }
            } 
            var restaurants = this.restaurants;
                console.log('执行啊');
                var results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : restaurants;
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    cb(results);
            },0); 
        },
        
        
        createStateFilter(queryString) {
                return (state) => {
                    return (state.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                };
            },
                
        //组件获取单个班级信息    
        handleSelect(item) {
            console.log(item);
            // this.className = {"id":item.id}
            // this.queryClassId(this.className)
            
        },
        queryClassId(id){
            findOne(id).then(res => {
                    console.log(res);
                    this.$message.success({message:res.msg,duration:1000})
                    this.tableData = []
                    this.tableData.push(res.data)
                    this.total = 1
            })
        },


        toggleSelection(rows) {
            if (rows) {
                rows.forEach(row => {
                    this.$refs.multipleTable.toggleRowSelection(row);
                });
            } else {
                this.$refs.multipleTable.clearSelection();
            }
        },
        //获取id
        handleSelectionChange(val) {
            var ids = []
            val.forEach( (item,) => {
                ids.push(item.id)
            });
            this.multipleSelection = ids;
            console.log(this.multipleSelection);
        },
        //删除
        del(id){
            console.log(id);
            delClass(id).then(res => {
                this.$message.success({message:res.msg})
                if (this.state !== '') {
                    console.log('qwe');
                    this.restaurants.forEach((item,index) => {
                        if (item.id == id) {
                            this.restaurants.splice(index,1)
                        }      
                    })

                    this.queryName(this.state)
                } else {
                    this.loadAll(this.page)
                }
                    

            })
            
            
        },
        //展示不同页面
        // pages(){
        //     if (this.state.length>0) {
        //             this.queryName(this.state)
        //         } else {
        //             this.loadAll(this.page)
        //             // this.queryName(this.state)
        //         }
        // },

        //批量删除
        delBatch(ids){
            console.log(ids);
            delBatchClass(ids).then( res => {
                console.log(res);
            })
        },
        //查询班级详情
        queryName(calssName){
            // console.log(calssName);
            // console.log(this.restaurants);
            var nameAll = this.restaurants.filter(item => item.name == calssName)
            // console.log();
            console.log(nameAll);
            if (nameAll.length > 0) {
                console.log('ok');
                this.tableData=nameAll
                this.total=nameAll.length
            } else if (nameAll.length == 0) {
                this.$message.success({message:"本页未发现数据",duration:1000})
                // this.className = {"id":id}
                // this.queryClassId(this.className)
                // this.loadAll(this.page)
                // 
            }    
        },
        //分页获取
        currentChange(e){
            this.loadAll(e)
        },
    },
        
}
</script>

<style scoped>
    .box{
        padding: 10px;
    }
     .el-row{
        margin-bottom: 10px  !important;
    }
    .elInput .button{
        margin-left: 20px;
        
    } 
    .pagination{
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        margin-right: 25px;
        
    }
    >>> .el-form-item__content{
        width: 300px !important;
    }
</style>