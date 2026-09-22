/* Herramienta opcional de pruebas: Node nativo + Chrome aislado, sin paquetes. */
'use strict';
const {spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const base=process.argv[2]||'http://127.0.0.1:4173';
const chromePath=process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ccm-browser-test-'));
const browser=spawn(chromePath,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--window-size=1672,1100','--user-data-dir='+profile],{windowsHide:true,stdio:['ignore','ignore','pipe']});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let socket,sequence=0;const pending=new Map();
function call(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
(async()=>{
 try{
  const endpoint=await new Promise((resolve,reject)=>{let buffer='';const timer=setTimeout(()=>reject(new Error('Chrome no inició en 10 segundos.')),10000);browser.once('error',reject);browser.stderr.on('data',data=>{buffer+=data.toString();const match=buffer.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1]);}});});
  socket=new WebSocket(endpoint);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{const message=JSON.parse(event.data),entry=pending.get(message.id);if(entry){pending.delete(message.id);message.error?entry.reject(new Error(message.error.message)):entry.resolve(message.result);}});
  const {targetId}=await call('Target.createTarget',{url:base+'/tests/browser.html'}),{sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});
  let outcome;for(let index=0;index<160;index++){await sleep(250);const value=await call('Runtime.evaluate',{expression:'JSON.stringify({status:document.body?.dataset.result,text:document.querySelector("#results")?.textContent})',returnByValue:true},sessionId);outcome=JSON.parse(value.result.value||'{}');if(outcome.status)break;}
  console.log(outcome?.text||'Sin resultado de interfaz.');if(outcome?.status!=='PASS')throw new Error('La prueba de interfaz falló o excedió 40 segundos.');
  await call('Page.navigate',{url:base+'/tests/responsive.html'},sessionId);let responsive;
  for(let i=0;i<40;i++){await sleep(100);const value=await call('Runtime.evaluate',{expression:'JSON.stringify({status:document.body?.dataset.result,text:document.querySelector("#result")?.textContent})',returnByValue:true},sessionId);responsive=JSON.parse(value.result.value||'{}');if(responsive.status)break;}
  console.log(responsive?.text||'Sin resultado móvil.');if(responsive?.status!=='PASS')throw new Error('La prueba móvil falló.');
 }catch(error){console.error(error.message);process.exitCode=1;}
 finally{if(socket?.readyState===WebSocket.OPEN){await call('Browser.close').catch(()=>{});socket.close();}else browser.kill();}
})();
