/* 동현텐 예제. 동현랭이 출력한 정수 둘이 차례로 Add 횟수와 Hint 횟수다. 기본은 Add 7, Hint 3. */
function expression(n){
  if(n===0)return '도옹ㅠ';
  if(n<0)return 'ㅠ '+expression(-n);
  if(n<=10)return '도'+'오'.repeat(n-1)+'옹';
  for(let a=10;a>=2;a--)if(n%a===0)return expression(a)+' '+expression(n/a);
  return '도'+'오'.repeat(n-1)+'옹';
}
const output=(...ns)=>ns.map(n=>'뿡뿡 '+expression(n)+'~뿡뿡뿡').join('~');
const wrap=a=>['나는 동현이냐?',...a,'동현이구나'].join('\n');
const pair=(label,add,hint)=>wrap(['ㅋㅋ '+label,'ㅋㅋ Add '+add,output(add),'ㅋㅋ Hint '+hint,output(hint)]);
const examples=[
 {id:'basic',title:'01 · 기본 (7 · 3)',note:'Add 7 · Hint 3. 동현텐의 기본값이다. 막히면 남은 수를 일곱 번까지 다시 적을 수 있고, 짝을 세 번까지 물어볼 수 있다.',code:pair('기본 · Add 7 · Hint 3',7,3)},
 {id:'tight',title:'02 · 아껴 쓰기 (5 · 1)',note:'Add 5 · Hint 1. 다시 적기 다섯 번, 힌트 한 번. 줄을 통째로 지워 판을 짧게 유지해 보자.',code:pair('아껴 쓰기 · Add 5 · Hint 1',5,1)},
 {id:'bare',title:'03 · 맨손 (0 · 0)',note:'Add 0 · Hint 0. 다시 적기도 힌트도 없다. 처음 42개의 수만으로 얼마나 지울 수 있을까.',code:pair('맨손 · Add 0 · Hint 0',0,0)}
];
if(typeof module!=='undefined')module.exports={examples,expression};
