/* 동현텐: 동현랭으로 Add·Hint 횟수를 정하고, 숫자 판에서 짝을 지운다. */
(function(){
const $=s=>document.querySelector(s);
const {Game,COLS}=window.Ten;
const MIN=0, MAX=9, DEF_ADD=7, DEF_HINT=3, VISIBLE_ROWS=12;

/* ---------- 화면 전환과 탭 ---------- */
$('#theme').onclick=()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').setAttribute('aria-pressed',String(dark));};
function showTab(name){
  document.querySelectorAll('.tabs button').forEach(b=>{const on=b.dataset.tab===name;b.classList.toggle('active',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current');});
  document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!=='tab-'+name);
}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
$('.brand').onclick=e=>{e.preventDefault();showTab('play');scrollTo({top:0,behavior:'smooth'});};

/* ---------- 동현랭 편집기(동현랭 시리즈와 같은 모양) ---------- */
for(const ex of examples){const o=document.createElement('option');o.value=ex.id;o.textContent=ex.title;$('#example').append(o);}
const DH_TOKEN=/(ㅋㅋ.*$)|(나는 동현이냐\?|동현이구나)|(오겡끼데스까)|(신중동역|신중동|뭉치)|(뿡뿡뿡|뿡뿡|포동이)|(꽥꽥)|(동+현아)|(동+현)|(도오*옹)|(ㅠ+)|(뚱띠|또치)/g;
const DH_CLS=[null,'t-cmt','t-frame','t-halt','t-ctl','t-out','t-in','t-assign','t-var','t-num','t-minus','t-op'];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function dhLine(line){let html='',last=0;line.replace(DH_TOKEN,(m,...gr)=>{const idx=gr[gr.length-2];html+=esc(line.slice(last,idx));const k=gr.slice(0,11).findIndex(x=>x!==undefined)+1;html+=`<span class="${DH_CLS[k]}">${esc(m)}</span>`;last=idx+m.length;return m;});return html+esc(line.slice(last));}
const code=$('#code'), area=document.createElement('div'), hl=document.createElement('div');
area.className='code-area'; hl.id='hl'; hl.setAttribute('aria-hidden','true'); code.parentNode.insertBefore(area,code); area.append(hl,code);
function hlSync(){hl.scrollTop=code.scrollTop;hl.scrollLeft=code.scrollLeft;}
function hlMetrics(){const cs=getComputedStyle(code);for(const p of ['paddingTop','paddingRight','paddingBottom','paddingLeft','fontFamily','fontSize','lineHeight','tabSize','letterSpacing'])hl.style[p]=cs[p];}
function highlight(){hlMetrics();hl.innerHTML=code.value.split('\n').map(l=>`<span class="ln">${dhLine(l)||' '}</span>`).join('')+'<span class="ln"> </span>';hlSync();}
code.addEventListener('scroll',()=>{hlSync();$('#lines').scrollTop=code.scrollTop;});addEventListener('resize',highlight);
function codeChanged(e){if(!e?.isComposing)indent();const n=code.value.split('\n').length;$('#line-count').textContent=n+'줄';$('#lines').textContent=Array.from({length:n},(_,i)=>i+1).join('\n');highlight();}
// 동현랭 시리즈 들여쓰기: ㅋㅋ 주석 세 칸, 명령 두 칸, '나는 동현이냐?'·'동현이구나'는 들여 쓰지 않는다
function indent(){
  const text=code.value,lines=text.split('\n'),lead=l=>l.length-l.replace(/^[ \t]+/,'').length;
  const next=lines.map(l=>{const b=l.slice(lead(l));if(!b)return '';if(b.startsWith('ㅋㅋ'))return '   '+b;const s=b.split('~')[0].replace(/ㅋㅋ.*$/,'').trim();return (s==='나는 동현이냐?'||s==='동현이구나'?'':'  ')+b;});
  const {selectionStart:a,selectionEnd:b,selectionDirection:dir,scrollTop:y,scrollLeft:x}=code;
  const moved=p=>{let o=0,n=0;for(let i=0;i<lines.length;i++){const L=lines[i].length;if(p<=o+L){const c=p-o,ol=lead(lines[i]),nl=lead(next[i]);return n+Math.min(next[i].length,c<ol?nl:c-ol+nl);}o+=L+1;n+=next[i].length+1;}return n;};
  const value=next.join('\n'),na=moved(a),nb=moved(b);if(value===text&&na===a&&nb===b)return;if(value!==text)code.value=value;code.setSelectionRange(na,nb,dir);code.scrollTop=y;code.scrollLeft=x;
}
code.addEventListener('compositionend',()=>codeChanged());
// 커서가 들여쓰기 안에 놓이면 들여쓰기 뒤로 옮기고, 들여쓰기 바로 뒤에서 Backspace를 누르면 윗줄과 합친다
function codeLead(){const a=code.selectionStart,v=code.value,ls=v.lastIndexOf('\n',a-1)+1,le=v.indexOf('\n',ls);return {a,ls,lead:/^[ \t]*/.exec(v.slice(ls,le<0?v.length:le))[0].length};}
document.addEventListener('selectionchange',()=>{if(document.activeElement!==code||code.selectionStart!==code.selectionEnd)return;const {a,ls,lead}=codeLead();if(a-ls<lead)code.setSelectionRange(ls+lead,ls+lead);});
code.addEventListener('beforeinput',e=>{
  const {a,ls,lead}=codeLead();
  if(a!==code.selectionEnd)return;
  if(e.inputType==='deleteContentBackward'&&ls>0&&a>ls&&a-ls<=lead){e.preventDefault();code.setRangeText('',ls-1,a,'end');codeChanged();}
});
code.oninput=codeChanged;
code.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();start();}});
function selectExample(){const ex=examples.find(e=>e.id===$('#example').value);code.value=ex.code;$('#example-note').textContent=ex.note;codeChanged();}
$('#example').onchange=selectExample; selectExample();
$('#save').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code.value+'\n'],{type:'text/plain;charset=utf-8'}));a.download='ten.dh';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('#open').onchange=async e=>{const f=e.target.files[0];if(!f)return;code.value=(await f.text()).replace(/\r/g,'').replace(/\n$/,'');codeChanged();e.target.value='';};
$('#run').onclick=()=>start();

/* ---------- Add·Hint 규약 ---------- */
function parseSet(out){
  const tok=out.split(/\s+/).filter(Boolean).map(Number);
  if(!tok.length) return {add:DEF_ADD,hint:DEF_HINT,note:`출력이 없어 기본값 Add ${DEF_ADD} · Hint ${DEF_HINT}로 시작한다.`};
  if(tok.length!==2) return {err:`정수를 ${tok.length}개 출력했다. Add와 Hint, 두 개를 차례로 출력하자.`};
  const names=['Add','Hint'];
  for(let k=0;k<2;k++){const v=tok[k];if(!Number.isInteger(v)||v<MIN||v>MAX)return {err:`${names[k]} ${v}은 쓸 수 없다. ${MIN}부터 ${MAX}까지만 된다.`};}
  return {add:tok[0],hint:tok[1]};
}
function setCard(s){
  $('#set-card').innerHTML=[['Add',s.add+'번'],['Hint',s.hint+'번'],['첫 판',COLS+'칸 × 42개']].map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join('');
  $('#stamp-add').innerHTML=`${s.add} <span>Add</span>`;$('#stamp-hint').innerHTML=`${s.hint} <span>Hint</span>`;
}
const result=(t,kind)=>{const r=$('#result');r.textContent=t;r.dataset.kind=kind||'';};
const status=(t,kind)=>{const s=$('#status');s.textContent=t;s.dataset.kind=kind||'';};

/* ---------- 최고 점수(이 브라우저에만) ---------- */
const KEY='donghyunten.best';
const pad=n=>String(n).padStart(2,'0');
function dayKey(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function weekKey(d){const t=new Date(d.getFullYear(),d.getMonth(),d.getDate());const wd=(t.getDay()+6)%7;t.setDate(t.getDate()-wd);return dayKey(t);} // 그 주 월요일
function loadBest(){let b={};try{b=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}const now=new Date();
  if(b.day!==dayKey(now)){b.day=dayKey(now);b.dayBest=0;} if(b.week!==weekKey(now)){b.week=weekKey(now);b.weekBest=0;} b.all=b.all||0;return b;}
function saveBest(score){const b=loadBest();b.dayBest=Math.max(b.dayBest||0,score);b.weekBest=Math.max(b.weekBest||0,score);b.all=Math.max(b.all,score);try{localStorage.setItem(KEY,JSON.stringify(b));}catch(e){}return b;}

/* ---------- 판 ---------- */
let game=null, settings={add:DEF_ADD,hint:DEF_HINT}, sel=-1, hintPair=null, finished=false;
const board=$('#board'), scroll=$('#scroll');
function render(){
  const cells=game.cells, rows=Math.max(VISIBLE_ROWS,Math.ceil(cells.length/COLS)+1), html=[];
  for(let k=0;k<rows*COLS;k++){
    const c=cells[k];
    if(!c){html.push('<span class="cell empty" aria-hidden="true"></span>');continue;}
    const cls=['cell'];if(!c.live)cls.push('dead');if(c.batch)cls.push('fresh');if(k===sel)cls.push('sel');if(hintPair&&hintPair.includes(k))cls.push('hint');
    const r=Math.floor(k/COLS)+1,col=k%COLS+1;
    html.push(c.live?`<button class="${cls.join(' ')}" data-i="${k}" aria-label="${r}줄 ${col}칸 ${c.v}${k===sel?' (고름)':''}">${c.v}</button>`:`<span class="${cls.join(' ')}" aria-hidden="true">${c.v}</span>`);
  }
  board.innerHTML=html.join('');
  $('#score').textContent=game.score.toLocaleString();
  $('#stage-label').textContent='STAGE '+game.stage;
  $('#add-n').textContent=game.adds; $('#hint-n').textContent=game.hints;
  $('#add').disabled=finished||game.adds<=0; $('#hint').disabled=finished||game.hints<=0;
  $('#week-best').textContent=Math.max(loadBest().weekBest||0,game.score).toLocaleString();
}
let flashT=0;
function flash(t){const f=$('#flash');f.textContent=t;f.classList.remove('on');void f.offsetWidth;f.classList.add('on');clearTimeout(flashT);flashT=setTimeout(()=>f.classList.remove('on'),1400);}
function shake(){board.classList.remove('shake');void board.offsetWidth;board.classList.add('shake');}
function checkOver(){
  if(!game.over())return false;
  finished=true; sel=-1; hintPair=null; render();
  const b=saveBest(game.score);
  $('#over-score').textContent=game.score.toLocaleString();
  $('#best-day').textContent=b.dayBest.toLocaleString();$('#best-week').textContent=b.weekBest.toLocaleString();$('#best-all').textContent=b.all.toLocaleString();
  $('#over-note').textContent=`STAGE ${game.stage} · 지운 짝 ${game.pairs}개 · Add ${settings.add} · Hint ${settings.hint}`;
  $('#over').hidden=false; $('#again').focus({preventScroll:true});
  status('끝 · 지울 짝도 Add도 없다');
  return true;
}
function newGame(){
  game=new Game({add:settings.add,hint:settings.hint}); sel=-1; hintPair=null; finished=false;
  $('#over').hidden=true; $('#add').classList.remove('point'); render(); scroll.scrollTop=0;
  status(`STAGE 1 · Add ${settings.add} · Hint ${settings.hint}`);
  checkOver();
}
board.addEventListener('click',e=>{
  const b=e.target.closest('button.cell'); if(!b||finished)return;
  const i=+b.dataset.i;
  if(sel<0){sel=i;render();return;}
  if(sel===i){sel=-1;render();return;}
  const stage=game.stage, r=game.match(sel,i);
  if(!r.ok){shake();sel=i;render();return;}
  sel=-1; hintPair=null; $('#add').classList.remove('point');
  if(r.cleared){flash(`판을 비웠다 +${r.points}`);status(`STAGE ${game.stage}로 · Add·Hint를 다시 채웠다`);scroll.scrollTop=0;}
  else if(r.rows){flash(`줄 ${r.rows}개 +${r.points}`);status(`STAGE ${stage} · 줄을 지웠다`);}
  else {flash('+'+r.points);status(`STAGE ${stage} · ${r.near?'붙은':'떨어진'} 짝 +${r.points}`);}
  render(); checkOver();
});
$('#add').onclick=()=>{
  if(finished)return; const before=game.cells.length, r=game.add(); if(!r.ok)return;
  sel=-1; hintPair=null; $('#add').classList.remove('point'); render();
  status(`남은 수 ${r.count}개를 다시 적었다 · Add ${game.adds}번 남음`);
  const row=board.children[before]; if(row) scroll.scrollTo({top:Math.max(0,row.offsetTop-scroll.clientHeight/3),behavior:'smooth'});
  checkOver();
};
$('#hint').onclick=()=>{
  if(finished)return; const h=game.hint();
  if(h.pair){hintPair=h.pair;sel=-1;render();status(`짝 하나를 노랗게 보였다 · Hint ${game.hints}번 남음`);
    const c=board.children[h.pair[0]]; if(c) scroll.scrollTo({top:Math.max(0,c.offsetTop-scroll.clientHeight/3),behavior:'smooth'});}
  else if(h.add){$('#add').classList.add('point');status('지울 짝이 없다 · Add를 눌러 보자(Hint는 줄지 않았다)');}
};
$('#restart').onclick=()=>newGame();
$('#again').onclick=()=>newGame();

function start(){
  let out;
  try{ out=Donghyun.run(code.value,{maxSteps:300000}).output; }
  catch(e){ result(`동현랭 오류${e.line?` (${e.line}줄)`:''}: ${e.message}`,'error'); status('동현랭 오류','error'); return; }
  const p=parseSet(out);
  if(p.err){ result('동현텐 규약 오류: '+p.err,'error'); status('규약 오류','error'); return; }
  settings={add:p.add,hint:p.hint}; setCard(settings);
  result((p.note?p.note+' ':'')+`Add ${p.add}번 · Hint ${p.hint}번으로 새 판을 시작했다. 같거나 합이 10인 두 수를 차례로 눌러 보자.`);
  newGame();
}
setCard(settings); newGame();
})();
