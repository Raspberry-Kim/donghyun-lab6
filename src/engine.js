/* 동현텐 규칙 엔진. 화면과 따로 돌고, Node에서도 시험한다.
   같은 수이거나 합이 10인 두 수를 지운다. 둘은 가로·세로·대각선 한 줄 위에 있고, 사이에는 지워진 칸만 있어야 한다.
   가로줄은 읽는 순서로 이어진다. 그래서 줄 끝의 수는 다음 줄 첫 수와 짝이 될 수 있다. */
(function(root){
const COLS=9, START=42;
const SCORE={near:1, far:4, row:10, board:150};

function newDigits(n,rng){const a=[];for(let i=0;i<n;i++)a.push(1+Math.floor(rng()*9));return a;}

function Game(opt){
  opt=opt||{};
  this.rng=opt.rng||Math.random;
  this.addMax=opt.add==null?7:opt.add;
  this.hintMax=opt.hint==null?3:opt.hint;
  this.score=0; this.stage=0; this.pairs=0; this.batch=0;
  this.nextStage();
}
Game.prototype.nextStage=function(){
  this.stage++; this.adds=this.addMax; this.hints=this.hintMax; this.batch=0;
  // 시작할 때 짝이 하나도 없는 판은 다시 뽑는다.
  for(let t=0;t<200;t++){this.cells=newDigits(START,this.rng).map(v=>({v,live:true,batch:0}));if(this.findPair())break;}
};
Game.prototype.liveCount=function(){return this.cells.reduce((s,c)=>s+(c.live?1:0),0);};
const fits=(a,b)=>a===b||a+b===10;

/* i<j가 한 줄 위에서 지워진 칸만 사이에 두고 이어지면, 그 줄의 한 칸 간격(step)을 돌려준다. 아니면 0. */
Game.prototype.link=function(i,j){
  if(i>j){const t=i;i=j;j=t;}
  const c=this.cells, clear=(st)=>{for(let k=i+st;k<j;k+=st)if(c[k].live)return false;return true;};
  if(clear(1))return 1;                                  // 가로, 줄 끝 → 다음 줄 첫 칸
  const r1=Math.floor(i/COLS),c1=i%COLS,r2=Math.floor(j/COLS),c2=j%COLS,dr=r2-r1,dc=c2-c1;
  if(dr>0&&dc===0&&clear(COLS))return COLS;              // 세로
  if(dr>0&&dc===dr&&clear(COLS+1))return COLS+1;         // 대각선 ↘
  if(dr>0&&dc===-dr&&clear(COLS-1))return COLS-1;        // 대각선 ↙
  return 0;
};
Game.prototype.canPair=function(i,j){
  const c=this.cells;
  if(i===j||!c[i]||!c[j]||!c[i].live||!c[j].live)return false;
  return fits(c[i].v,c[j].v)&&this.link(i,j)>0;
};
/* 판 위에서 맨 처음 만나는 짝을 찾는다. 힌트와 게임 끝 판정에 쓴다. */
Game.prototype.findPair=function(){
  const c=this.cells,n=c.length;
  for(let i=0;i<n;i++){if(!c[i].live)continue;
    // 각 방향으로 지워진 칸을 건너뛰고 처음 만나는 수만 보면 된다.
    for(const st of [1,COLS-1,COLS,COLS+1]){
      let k=i+st;
      while(k<n){
        if(st!==1){const dc=(k%COLS)-(i%COLS),dr=Math.floor(k/COLS)-Math.floor(i/COLS);
          if(st===COLS&&dc!==0)break; if(st===COLS+1&&dc!==dr)break; if(st===COLS-1&&dc!==-dr)break;}
        if(c[k].live){if(fits(c[i].v,c[k].v))return [i,k];break;}
        k+=st;
      }
    }
  }
  return null;
};
/* 짝을 지운다. 빈 줄은 판에서 빠진다. 판이 비면 150점을 더하고 다음 판으로 간다. */
Game.prototype.match=function(i,j){
  if(!this.canPair(i,j))return {ok:false};
  if(i>j){const t=i;i=j;j=t;}
  const step=this.link(i,j), near=(j-i)===step;
  this.cells[i].live=this.cells[j].live=false; this.pairs++;
  let pts=near?SCORE.near:SCORE.far, rows=0, cleared=false;
  const rowsTouched=[...new Set([Math.floor(j/COLS),Math.floor(i/COLS)])].sort((a,b)=>b-a);
  for(const r of rowsTouched){
    const seg=this.cells.slice(r*COLS,r*COLS+COLS);
    if(seg.length&&seg.every(x=>!x.live)){this.cells.splice(r*COLS,seg.length);rows++;}
  }
  pts+=rows*SCORE.row;
  // 끝에 남은 지워진 칸만으로 된 꼬리는 줄로 치지 않는다. 판에 산 수가 없으면 판을 비운 것이다.
  if(this.liveCount()===0){pts+=SCORE.board;cleared=true;}
  this.score+=pts;
  const res={ok:true,points:pts,near,rows,cleared,stage:this.stage};
  if(cleared)this.nextStage();
  return res;
};
/* Add: 판에 남은 수를 같은 순서로 맨 뒤에 다시 적는다. */
Game.prototype.add=function(){
  if(this.adds<=0)return {ok:false};
  const live=this.cells.filter(c=>c.live).map(c=>c.v);
  if(!live.length)return {ok:false};
  this.adds--; this.batch++;
  for(const v of live)this.cells.push({v,live:true,batch:this.batch});
  return {ok:true,count:live.length};
};
/* Hint: 짝 하나를 보여 준다. 짝이 없고 Add가 남았으면 Add를 가리킨다. 짝을 보여 줄 때만 하나를 쓴다. */
Game.prototype.hint=function(){
  if(this.hints<=0)return {ok:false,reason:'none'};
  const p=this.findPair();
  if(p){this.hints--;return {ok:true,pair:p};}
  if(this.adds>0)return {ok:true,add:true};
  return {ok:false,reason:'over'};
};
Game.prototype.over=function(){return this.adds<=0&&!this.findPair();};

const api={Game,COLS,START,SCORE};
if(typeof module!=='undefined'&&module.exports)module.exports=api; else root.Ten=api;
})(this);
