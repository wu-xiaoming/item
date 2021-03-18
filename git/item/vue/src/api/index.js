import request from '@/utils/request'
//请求所有的班级
export function queryNameClass(data) {
    return request({
        method:'GET',
        url:'api/class/search'+query(data)
    })
}

//获取教员
export function getJiaoxue(data) {
    return request({
        method:'GET',
        url:'api/teacher/search'+query(data)
    })
}

//添加班级
export function addClass(data) {
    return request({
        method:'POST',
        url:'api/class/save'+query(data)
    })
}

//更新班级
export function updataClass(data) {
    return request({
        method:'PUT',
        url:'/api/class/update'+query(data)
    })    
}

//查找班级
export function queryClass(data){
    return request({
        method:'GET',
        url:'api/class/search'+query(data)
    })
}
//删除班级
export function delClass(id){
    return request({
        method:'DELETE',
        url:'api/class/delete?id='+id
    })
}
//批量删除
export function delBatchClass(params) {
    return request({
        method:'DELETE',
        url:'api/class/delBatch/'+query(params)
    })
}
//查询班级详情
export function findOne(id) {
    return request({
        method:'GET',
        url:'api/class/findOne/'+query(id)
    })
}

function query(data) {
    
    let value = '?'
    for (const key in data) {
        value += key+'='+data[key]+'&'
    }
    console.log(value.substr(0,value.length-1));
    return value.substr(0,value.length-1)
}