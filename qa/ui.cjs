// 화면 시험: node qa/ui.cjs (dist/index.html을 파일로 연다)
const {chromium}=require('playwright');const path=require('path');
(async()=>{
  const url='file://'+path.join(__dirname,'..','dist','index.html');
  const b=await chromium.launch();const errs=[];
  for(const [w,h,name] of [[1280,900,'desk'],[390,844,'mob']]){
    const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:w<500?2:1});
    p.on('pageerror',e=>errs.push(name+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(name+': '+m.text());});
    await p.goto(url);await p.waitForTimeout(400);
    await p.screenshot({path:`/tmp/ten-${name}.png`,fullPage:name==='desk'});
    // 짝 하나 지우기(힌트로)
    await p.click('#hint');await p.waitForTimeout(200);
    const hp=await p.$$eval('.cell.hint',e=>e.map(x=>+x.dataset.i));
    await p.screenshot({path:`/tmp/ten-${name}-hint.png`});
    await p.click(`.cell[data-i="${hp[0]}"]`);await p.click(`.cell[data-i="${hp[1]}"]`);await p.waitForTimeout(150);
    const st=await p.evaluate(()=>({score:document.querySelector('#score').textContent,hint:document.querySelector('#hint-n').textContent,dead:document.querySelectorAll('.cell.dead').length,status:document.querySelector('#status').textContent}));
    console.log(name,JSON.stringify({hp,...st}));
    await p.click('#add');await p.waitForTimeout(500);
    await p.screenshot({path:`/tmp/ten-${name}-add.png`});
    console.log(name,'add',await p.$eval('#add-n',e=>e.textContent),await p.$$eval('.cell.fresh',e=>e.length));
    // 규약 오류
    await p.fill('#code','나는 동현이냐?\n뿡뿡 도오옹~뿡뿡뿡\n동현이구나');await p.click('#run');
    console.log(name,'err',await p.$eval('#result',e=>e.textContent));
    // 맨손 예제 → 끝까지 자동
    await p.selectOption('#example','bare');await p.click('#run');
    for(let k=0;k<200;k++){
      if(await p.$eval('#over',e=>!e.hidden))break;
      const pr=await p.evaluate(()=>{const cs=[...document.querySelectorAll('#board>.cell')];const live=cs.map((c,i)=>c.tagName==='BUTTON'?+c.textContent:null);
        const fit=(a,b)=>a===b||a+b===10;for(let i=0;i<live.length;i++){if(live[i]==null)continue;for(const st of [1,8,9,10]){let k=i+st;while(k<live.length){if(st!==1){const dc=k%9-i%9,dr=Math.floor(k/9)-Math.floor(i/9);if(st===9&&dc)break;if(st===10&&dc!==dr)break;if(st===8&&dc!==-dr)break;}if(live[k]!=null){if(fit(live[i],live[k]))return[i,k];break;}k+=st;}}}return null;});
      if(!pr)break;await p.click(`.cell[data-i="${pr[0]}"]`);await p.click(`.cell[data-i="${pr[1]}"]`);
    }
    await p.waitForTimeout(200);
    console.log(name,'over',await p.$eval('#over',e=>!e.hidden),await p.$eval('#over-score',e=>e.textContent),await p.$eval('#over-note',e=>e.textContent));
    await p.screenshot({path:`/tmp/ten-${name}-over.png`});
    for(const t of ['protocol','rules','about']){await p.click(`.tabs button[data-tab="${t}"]`);await p.waitForTimeout(100);if(name==='desk')await p.screenshot({path:`/tmp/ten-${t}.png`,fullPage:true});}
    await p.close();
  }
  console.log('errors',JSON.stringify(errs));await b.close();
})();
