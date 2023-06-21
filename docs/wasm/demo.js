setTimeout(function(){
  var es=exports,self=this,watToBin,logs=this.logs=[],editers={},files=es.data.files={},
  format=[],
  updateFile=es.updateFile=function(){
    var updated=!1;
    if(files.$h!==files.h){
      Function('return '+files.h)()(function({raw},...fs){
        var i=0,l=fs.length;
        for(format=[];i<l;++i){
          format.set(RegExp(raw[i].replace(/(?! )\s/g,''),'g'),fs[i])
        }
      })
      files.$h=files.h;updated=!0;
    }if(files.$main!==files.main){
      files.$main=files.main;updated=!0;
    }if(updated){
      let r,f,o=files.m;for([r,f]of format){
        o=o.replaceAll(r,f);
      };files.out=o;
    };
  },d=document,e=es.canvas=d.createElement('canvas'),
  errorContext=d.createElement('p'),errorTime=0,
  inputA=d.createElement('textarea'),inputB=d.createElement('textarea'),inputC=d.createElement('textarea'),
  inputD=d.createElement('input');
  e.width=800,e.height=600,e.style.border='solid 2px red',
    inputA.style=inputB.style=inputC.style='width:80%;height:60%;font-size:36px;font-family:"Consolas"';
  window.addEventListener('error',function(e){
    e.timeStamp-errorTime>500&&(errorTime=e.timeStamp,errorContext.innerText=(errorTime|0)+'> '+e.data.stack||e.data.message)
  });
  inputD.addEventListener('keydown',function(e){
    if(inputD.value.slice(-2)==='..')(0,eval)(inputD.value=inputD.value.slice(0,-2))
  });
  d.body.append(e,errorContext,inputA,inputB,inputC,inputD);
  Function(exports.file('lz:lib/wabt.js').data)();
  ('function'===typeof WabtModule?WabtModule:
    exports.WabtModule||this.WabtModule||window.WabtModule||
    async function(){throw new Error('WabtModule not find.')}
  )().then(function(wabt){
    es.wabt=wabt;
    watToBin=es.watToBin=function(){
      try{
        setTimeout('/*'+files.out+'*///# sourceURL=file://vm/test.wat',1000);
        var features={},md=wabt.parseWat('test.wast',files.out,{});
        md.resolveNames();
        md.validate(features);
        var bop=md.toBinary({log:!0,write_debug_names:!0});
        logs.push(bop.log);
        files.bin=bop.buffer;
      }catch(e){
        logs.push(e);
        console.error(e);
      }finally{
        if(md)md.destroy();
      };return new Promise(r=>r(files.bin))
    };
    inputA.value='exports.watReplace='+es.watReplace;
    inputB.value='exports.watEnum='+es.watEnum;
    inputC.value='exports.watRaw='+es.watRaw;

    es.update=function(){
      'function'===typeof es.watRaw&&async function(){
        var code=es.watRaw(new es.watEnum),r;
        es.watReplace(function(){
          for(var a=arguments,raw=a[0].raw,i=1,l=raw.length;i<l;++i)
            code=code.replaceAll(new RegExp(raw[i-1],'g'),a[i])
        });files.out=code;
        bin=structuredClone(await es.watToBin());wk.postMessage({type:'initWasm',data:bin})
      }().then(console.log,alert);
    };
    newWK()
  },alert);
  var wksrc=location.href[0]=='f'?URL.createObjectURL(new Blob(['!',exports.init,'({}),exports.AllExtensions=['+exports.AllExtensions+'],',exports.WorkScript,'();//# sourceURL=file://vm/wk.js'])):'wasm-wk.js',wk=null,
  killWK=function(){
    wk!==null&&(wk.terminate(),wk=es.wk=null,console.log('killed worker.'))
  },newWK=function(){
    wk!==null&&killWK(),wk=es.wk=new Worker(wksrc),
    wk.addEventListener('message',wkonMessage),console.log('worker working.');
    es.update&&es.update();
    var sid=setInterval(_=>{
      if(wk===null||!(wk.initTime>0))return clearInterval(sid);
      wk.t=Date.now()-wk.thisFree;
      wk.t>wk.wait&&!confirm('代码未响应,继续等待?')&&(wk.wait+=1e4,wk.terminate(),es.wk=wk=null)
    },20);
  },wkonMessage=function(e){
    var m=e.data;switch(m.type){
      case'error':console.log(m);break;
      case'break':killWK(),console.log(m.message);break;
      case'recall':wk.initTime=Date.now();break;
      case'free-interval':wk.lastFree=wk.thisFree,wk.thisFree=Date.now();break;
      case'canvas':if(m.opcode==='update'){
        es.canvas.getContext('bitmaprenderer').transferFromImageBitmap(m.data);
      }else if(m.opcode==='req'){
        let c=cv.transferControlToOffscreen();postMessage({type:'canvas',opcode:'tc',data:c},[c]);
      };break;
    };
  };
  
},400)
