const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:1000}});
await p.goto('file://'+path.join(__dirname,'..','dist','index.html'));await p.waitForTimeout(300);
await p.click('#hint');await p.waitForTimeout(150);const hp=await p.$$eval('.cell.hint',e=>e.map(x=>+x.dataset.i));
const other=await p.$$eval('button.cell',e=>e.map(x=>+x.dataset.i));await p.click(`.cell[data-i="${other[5]}"]`);
await p.waitForTimeout(100);await p.$eval('.ten-wrap',e=>e.scrollIntoView());await (await p.$('.ten-wrap')).screenshot({path:'/tmp/ten-wrap-hint.png'});
await p.click(`.cell[data-i="${hp[0]}"]`);await p.click(`.cell[data-i="${hp[1]}"]`);await p.waitForTimeout(250);await (await p.$('.ten-wrap')).screenshot({path:'/tmp/ten-wrap-flash.png'});
await p.evaluate(()=>document.documentElement.dataset.theme='dark');await p.click('#add');await p.waitForTimeout(600);await (await p.$('.ten-wrap')).screenshot({path:'/tmp/ten-wrap-dark.png'});
await b.close();})();
