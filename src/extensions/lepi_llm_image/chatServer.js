const express = require('express')
const { crud, sequelizeCrud } = require('express-sequelize-crud')
var cors = require('cors');
const multer = require("multer");
var morgan = require('morgan');
const http = require('http')
const https = require("https");

const axios = require('axios');
const queryString=require('querystringify')

const moment = require('moment')

const Sequelize = require('sequelize');
const Op = Sequelize.Op
const spawn = require('child_process').spawn

var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
const crypto = require('crypto');
 //配置ssl
// var privateCrt = fs.readFileSync(path.join(process.cwd(), 'https/rise.jslepi.com.pem'), 'utf8');
// var privateKey = fs.readFileSync(path.join(process.cwd(), 'https/rise.jslepi.com.key'), 'utf8');
// const HTTPS_OPTOIN = {
//   key: privateKey,
//   cert: privateCrt
// };
const {
courseLog,
studentDataRec,
plantImg,
programHistroy
} = require('./models');
const { json } = require('body-parser');
// const { Json } = require('sequelize/types/utils');

// 转换时间显示格式
// "2021-02-03T14:16:29.000Z" -> "2021-02-03 22:16"
// Z表示国际时间
function format_date(date){
    // let d=date.setHours(date.getHours()+8);
    // date=new Date(d);
    var year=date.getFullYear();
    /* 在日期格式中，月份是从0开始的，因此要加0
     * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
     * */
    var month= date.getMonth()+1<10 ? "0"+(date.getMonth()+1) : date.getMonth()+1;
    var day=date.getDate()<10 ? "0"+date.getDate() : date.getDate();
    var hour=change(date.getHours());
    var minute=change(date.getMinutes());
    var second=change(date.getSeconds());
    function change(t){
        if(t<10){
            return "0"+t;
        }else{
            return t;
        }
    }
    return year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
}

const app = new express()
app.use(bodyParser.json({limit: '10mb', extended: true})); 
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}))
app.use(cors())
app.use(morgan('short'));
// // 跨域设置
app.all('*', function(req, response, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    response.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
    //跨域允许的请求方式
    response.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    //设置响应头信息
    response.header("X-Powered-By",' 3.2.1')
    // response.header("Content-Type", "application/json;charset=utf-8");

    next();

});

//调试用接口
app.use('/', express.static(__dirname + '/public'))

app.get('/uploadData', cors(),async function(req, res) {//处理学生端上报数据，保存学生学习过程操作
    // console.log(req.query)
    let data=req.query
    // console.log(data)
    try{
        await courseLog.create({timestamp:data.timestamp,  courseID:data.courseID,studentID:data.studentID, courseData: data.courseData})   .catch(err=>{console.log(err)})        
        let studentDataLine=await studentDataRec.findOne({ where: { courseID:data.courseID,studentID:data.studentID} }) .catch(err=>{console.log(err)})
        if (studentDataLine) {
            studentDataLine.timestamp = data.timestamp
            studentDataLine.courseData=data.courseData
            studentDataLine.save()
        } else {
            console.log('new student')
            await studentDataRec.create({timestamp:data.timestamp,  courseID:data.courseID,studentID:data.studentID, courseData: data.courseData})       .catch(err=>{console.log(err)})    
        }
        res.end('done')
    }
    catch(err){
        console.log(err)
    }

});
app.post('/test',async function(req, res){//处理upload，用于上传带base64图片的学生课堂数据
    var data=req.body
    console.log(data)
    let newDataArray=JSON.parse(data.message)
    newDataArray.pop()
    console.log(newDataArray)
    var myMode=newDataArray[newDataArray.length-1].mode
    if(myMode=='智能对话'||myMode=='角色扮演'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        const py=spawn('python3', ['zhipuAIglm.py',JSON.stringify(newDataArray)])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {text:rawdata.toString(),mode:myMode},})
            })
    }
    else if(myMode=='图像生成'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        const py=spawn('python3', ['zhipuAIview.py',JSON.stringify(newDataArray)])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {text:rawdata.toString(),mode:myMode},})
                })
    }
    else if(myMode=='视频生成'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        let prompt=JSON.stringify(newDataArray[newDataArray.length-1].content)
        console.log(prompt)
        const py=spawn('python3', ['zhipuAIVideoGene.py',prompt])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {result_id:rawdata.toString().slice(0,-1),mode:myMode},})//去除掉result_id末尾的\n \n竟然算是一个字符
                })
    }
});

app.post('/shijingshan',async function(req, res){//石景山附中接口
    var data=req.body
    console.log(data)
    let newDataArray=JSON.parse(data.message)
    newDataArray.pop()
    console.log(newDataArray)
    var myMode=newDataArray[newDataArray.length-1].mode
    if(myMode=='智能对话'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        const py=spawn('python3', ['zhipuAIglmShijingshan.py',JSON.stringify(newDataArray)])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {text:rawdata.toString(),mode:myMode},})
            })
    }
    else if(myMode=='角色扮演'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        const py=spawn('python3', ['zhipuAIglm.py',JSON.stringify(newDataArray)])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {text:rawdata.toString(),mode:myMode},})
            })
    }
    else if(myMode=='图像生成'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        const py=spawn('python3', ['zhipuAIview.py',JSON.stringify(newDataArray)])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {text:rawdata.toString(),mode:myMode},})
                })
    }
    else if(myMode=='视频生成'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        let prompt=JSON.stringify(newDataArray[newDataArray.length-1].content)
        console.log(prompt)
        const py=spawn('python3', ['zhipuAIVideoGene.py',prompt])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {result_id:rawdata.toString().slice(0,-1),mode:myMode},})//去除掉result_id末尾的\n \n竟然算是一个字符
                })
    }
});


app.post('/doubao',async function(req, res){//豆包接口
    var data=req.body
    let newDataArray=JSON.parse(data.message)
    newDataArray.pop()
    console.log(newDataArray)
    var myMode=newDataArray[newDataArray.length-1].mode
    if(myMode=='智能对话'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        const py=spawn('python3', ['doubao.py',JSON.stringify(newDataArray)])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            console.log("finished at "+Date.now())
            console.log('xx----------------------------------------xx')
            res.json({   message: 'success',
            code: 0,
            data: {text:rawdata.toString(),mode:myMode},})
            })
    }
    else if(myMode=='诗词创作'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        const py=spawn('python3', ['doubao.py',JSON.stringify(newDataArray)])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {text:rawdata.toString(),mode:myMode},})
            })
    }
    else if(myMode=='英语助教'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        const py=spawn('python3', ['doubao.py',JSON.stringify(newDataArray)])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {text:rawdata.toString(),mode:myMode},})
            })
    }
    else if(myMode=='角色扮演'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        const py=spawn('python3', ['doubaoCharacter.py',JSON.stringify(newDataArray)])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {text:rawdata.toString(),mode:myMode},})
            })
    }
    else if(myMode=='图像生成'){
        newDataArray=newDataArray.map((item)=>{
            return{
                "role": item.type,
                 "content": item.content
            }
        })
        const py=spawn('python3', ['doubaoImg.py',JSON.stringify(newDataArray[newDataArray.length-1].content)])//调用python获取ppi计算得到的参数
                 
        py.stdout.on('data', async function(rawdata){
            console.log(rawdata.toString())
            res.json({   message: 'success',
            code: 0,
            data: {text:rawdata.toString(),mode:myMode},})
                })
    }
});

app.post('/getVideo',async function(req, res){//根据视频result_Id获取视频生成结果
    var data=req.body
    console.log(data)

    const py=spawn('python3', ['zhipuAIVideoGet.py',JSON.stringify(data)])//调用python获取ppi计算得到的参数
                
    py.stdout.on('data', async function(rawdata){
        console.log(rawdata.toString())
        if(rawdata.toString()=='not ready\n'){
            res.json({   message: 'success',
            code: 0,
            data: {videoUrl:rawdata.toString().slice(0,-1)},})//去除掉result_id末尾的\n \n竟然算是一个字符
        }
        else{
            res.json({   message: 'success',
            code: 0,
            data: {videoUrl:rawdata.toString().slice(0,-1)},})//去除掉result_id末尾的\n \n竟然算是一个字符
        }
    })
    
});
// var httpsServer=https.createServer(HTTPS_OPTOIN, app)
// httpsServer.listen(3002, () => {
//     console.log('https应用正在监听 443 端口!');
// });
var server = http.createServer(app);
server.listen(9001, () => {
    console.log('http应用正在监听 9001 端口!');
});
