const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
function send(res,status,value,type='application/json') {res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(type==='application/json'?JSON.stringify(value):value)}
async function body(req){let s='';for await(const chunk of req){s+=chunk;if(s.length>4096)throw new Error('Request exceeds 4096 bytes')}return JSON.parse(s||'{}')}
function staticFile(req,res){if(req.url==='/'||req.url==='/style.css'){const f=req.url==='/'?'index.html':'style.css';send(res,200,fs.readFileSync(path.join(__dirname,'public',f)),f==='index.html'?'text/html; charset=utf-8':'text/css');return true}return false}
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath(path.join(__dirname,'assets','DejaVuSans.ttf'),'DejaVu');
http.createServer(async(req,res)=>{try{
 if(staticFile(req,res))return;
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/card'){const title=url.searchParams.get('title')||'Community evening';if(title.length>40)return send(res,422,{error:'Title must be at most 40 characters'});const canvas=createCanvas(960,540);const ctx=canvas.getContext('2d');ctx.fillStyle='#113d32';ctx.fillRect(0,0,960,540);ctx.fillStyle='#d8f184';ctx.beginPath();ctx.arc(870,60,180,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='24px DejaVu';ctx.fillText('YOU ARE INVITED',60,110);ctx.font='bold 42px DejaVu';ctx.fillText(title,60,250,820);ctx.font='26px DejaVu';ctx.fillText('Friday · 18:00 · The workshop',60,340);const png=await canvas.encode('png');console.log('Skia card rendered',png.length);return send(res,200,png,'image/png')}
 send(res,404,{error:'Not found'});
 }catch(e){console.error('Canvas failed',e.message);send(res,500,{error:e.message})}
}).listen(Number(process.env.PORT)||3244,'0.0.0.0',()=>console.log('Event card studio ready'));
