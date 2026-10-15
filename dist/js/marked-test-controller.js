import {el,add,button,panel} from './render-utils.js';
import {listMarkedQuestions} from './question-marks.js?v=ui20261015b';
import {evaluate} from './answer-evaluator.js';

const labels={red:'Đỏ',yellow:'Vàng',green:'Xanh'};

export function markedTestView(ctx){
 const {root,state,bank,save,render}=ctx;
 root.append(button('← Trang chủ',ctx.home,'quiet back'));
 let test=state.markedTest;
 if(!test){setup();return;}
 const questions=test.questionIds.map(id=>bank.questions.find(q=>q.sourceId===id)).filter(Boolean);
 if(questions.length!==test.questionIds.length){root.append(el('p','Không tải được câu hỏi trong bài test này.'));return;}
 const correct=questions.filter(q=>evaluate(q,test.responses[q.sourceId]||'')).length;
 if(test.submitted){
  add(root,el('p','TEST THEO MÀU',{class:'eyebrow'}),el('h1',`${correct} / ${questions.length} đúng`),el('p',`${labels[test.color]} · ${test.order==='random'?'Xáo ngẫu nhiên':'Theo thứ tự'}`));
 }else{
  add(root,el('p',`TEST THEO MÀU · ${labels[test.color]}`,{class:'eyebrow'}),el('h1',`${test.index+1} / ${questions.length}`),el('p',`${Object.values(test.responses).filter(value=>value.trim()).length} câu đã nhập`,{class:'muted'}));
 }
 const q=questions[test.index],card=panel(root);
 add(card,el('p',`CÂU ${test.index+1} · #${q.sourceId}`,{class:'eyebrow'}),el('h2',q.question,{class:'question'}));
 const response=el('textarea',null,{class:'exam-response',rows:'3',placeholder:'Gõ câu trả lời','aria-label':`Câu trả lời cho câu ${test.index+1}`});
 response.value=test.responses[q.sourceId]||'';response.disabled=test.submitted;
 if(!test.submitted)response.oninput=()=>{test.responses[q.sourceId]=response.value;save();const count=Object.values(test.responses).filter(value=>value.trim()).length;root.querySelector('.muted').textContent=`${count} câu đã nhập`;};
 card.append(response);
 if(test.submitted){
  const isCorrect=evaluate(q,test.responses[q.sourceId]||''),answer=el('div',null,{class:'answer'});
  add(answer,el('p','ĐÁP ÁN',{class:'eyebrow'}),el('strong',q.sourceAnswer));
  if(q.answerVi)answer.append(el('p',q.answerVi,{class:'translation'}));
  add(card,el('p',test.responses[q.sourceId]?`Bạn nhập: ${test.responses[q.sourceId]}`:'Bỏ trống',{class:'muted'}),el('p',isCorrect?'Đúng':'Sai',{class:isCorrect?'good-text':'wrong-text'}),answer);
 }else{
  const nav=el('div',null,{class:'actions'}),prev=button('← Trước',()=>move(-1)),next=button('Tiếp →',()=>move(1));
  prev.disabled=test.index===0;next.disabled=test.index===questions.length-1;add(nav,prev,next);card.append(nav);
 }
 const grid=el('div',null,{class:'number-grid'});
 questions.forEach((item,index)=>{const answered=!!test.responses[item.sourceId]?.trim(),b=button(String(index+1),()=>{test.index=index;save();render();},`${test.index===index?'selected ':''}${answered?'answered':''}`);b.setAttribute('aria-label',`Câu ${index+1}${answered?', đã nhập':''}`);grid.append(b);});
 root.append(grid);
 if(test.submitted){
  root.append(button('Test màu khác',()=>{state.markedTest=null;save();render();},'primary'));
 }else{
  root.append(button('Nộp bài',()=>{if(confirm('Nộp bài test và hiện đáp án?')){test.submitted=true;save();render();}},'primary'));
 }
 function move(delta){test.index+=delta;save();render();}

 function setup(){
  add(root,el('p','TEST THEO MÀU',{class:'eyebrow'}),el('h1','Test câu đã đánh dấu'),el('p','Nhập đáp án cho toàn bộ câu trong bộ màu. Không giới hạn số câu hoặc thời gian. Đáp án hiện sau khi nộp bài.'));
  const card=panel(root),color=el('select',null,{'aria-label':'Bộ màu câu hỏi'}),order=el('select',null,{'aria-label':'Thứ tự câu hỏi'});
  for(const [value,label]of Object.entries(labels))color.append(el('option',label,{value}));
  order.append(el('option','Xáo ngẫu nhiên',{value:'random'}),el('option','Theo thứ tự',{value:'linear'}));
  const count=el('p',null,{class:'muted'}),start=button('Bắt đầu test',begin,'primary');
  const update=()=>{const total=listMarkedQuestions(bank.questions,state,color.value).length;count.textContent=`${total} câu màu ${labels[color.value]}.`;start.disabled=total===0;};
  color.onchange=update;update();
  add(card,el('label','Bộ màu'),color,el('label','Thứ tự câu'),order,count,start);
  function begin(){const pool=listMarkedQuestions(bank.questions,state,color.value);if(!pool.length)return;const ordered=order.value==='random'?shuffle(pool):pool;state.markedTest={id:`marked-test-${Date.now()}`,color:color.value,order:order.value,questionIds:ordered.map(q=>q.sourceId),index:0,responses:{},submitted:false};if(save())render();else state.markedTest=null;}
 }
}

function shuffle(items){const result=[...items];for(let index=result.length-1;index>0;index--){const swap=Math.floor(Math.random()*(index+1));[result[index],result[swap]]=[result[swap],result[index]];}return result;}
