import {el,add,button,panel} from './render-utils.js';
import {startExam,finishExam,remainingMs,examTotals} from './exam-engine.js?v=ui20261014m';
import {markColorButtons} from './question-marks.js?v=ui20261014m';

export function examView(ctx){
 const {root,state,bank,save,render}=ctx;let e=state.exam;
 root.append(button('← Trang học',ctx.home,'quiet back'));
 if(!e){
  add(root,el('p','THI THỬ',{class:'eyebrow'}),el('h1','30 câu · 60 phút'),el('p','Gõ câu trả lời trong app. Sau khi nộp bài hoặc hết giờ, app sẽ chấm điểm và hiện đáp án.'));
  const card=panel(root);
  add(card,el('p',`Ngẫu nhiên từ ${bank.questions.length}/600 câu. ${bank.questions.length<600?'Ngân hàng chưa đầy đủ.':''}`,{class:'warning'}),button('Bắt đầu thi',()=>{state.exam=startExam(bank.questions);if(save())render();else state.exam=null;},'primary'));
  return;
 }
 if(e.finalizedAt===null&&remainingMs(e)===0){finishExam(state,'timeout');save();}
 const live=e.finalizedAt===null,q=e.questions[e.index];
 root.append(el('p',live?'THI THỬ':'KẾT QUẢ',{class:'eyebrow'}));
 if(live){
  const top=el('div',null,{class:'row between'}),answered=Object.values(e.responses||{}).filter(value=>value.trim()).length;
  add(top,el('h1',`${e.index+1} / 30`),el('span',`${answered} đã nhập`,{class:'muted'}),el('span','',{id:'exam-timer',class:'timer','aria-label':'Thời gian còn lại'}));root.append(top);
 }else{
  const totals=examTotals(e);
  add(root,el('h1',`${totals.correct} / 30 đúng`),el('p',`${totals.wrong} sai · ${totals.ungraded} chưa chấm.`,{class:'warning'}),el('p',e.reason==='timeout'?'Hết giờ.':'Đã nộp bài.',{class:'muted'}));
 }
 const card=panel(root);
 add(card,el('p',`CÂU ${e.index+1} · #${q.sourceId}`,{class:'eyebrow'}),el('h2',q.question,{class:'question'}));
 const response=el('textarea',null,{class:'exam-response',rows:'3',placeholder:'Gõ câu trả lời', 'aria-label':`Câu trả lời cho câu ${e.index+1}`});
 response.disabled=!live;
 response.value=e.responses?.[q.sourceId]||'';
 if(live)response.oninput=()=>{
  e.responses||={};e.responses[q.sourceId]=response.value;save();
  const count=Object.values(e.responses).filter(value=>value.trim()).length;
  root.querySelector('.row.between .muted').textContent=`${count} đã nhập`;
 };
 card.append(response);
 card.append(markColorButtons(state,q.sourceId,save,render));
 if(!live){
  const status=e.grades[q.sourceId]==='correct'?'Đúng':e.grades[q.sourceId]==='wrong'?'Sai':'Chưa chấm';
  const answer=el('div',null,{class:'answer'});add(answer,el('p','ĐÁP ÁN ĐÚNG',{class:'eyebrow'}),el('strong',q.sourceAnswer));
  add(card,el('p',`Kết quả: ${status}`,{class:e.grades[q.sourceId]==='correct'?'good-text':'wrong-text'}),answer);
  if(q.reviewFlags.length)card.append(el('p',q.reviewFlags.map(f=>typeof f==='string'?f:JSON.stringify(f)).join(' · '),{class:'warning'}));
 }
 const nav=el('div',null,{class:'actions'}),prev=button('← Trước',()=>move(-1)),next=button('Tiếp →',()=>move(1));
 prev.disabled=e.index===0;next.disabled=e.index===29;add(nav,prev,next);card.append(nav);
 function move(delta){e.index+=delta;save();render();}
 const grid=el('div',null,{class:'number-grid'});
 e.questions.forEach((item,i)=>{
  const answered=!!e.responses?.[item.sourceId]?.trim(),b=button(String(i+1),()=>{e.index=i;save();render();},`${e.index===i?'selected ':''}${answered?'answered':''}`);
  b.setAttribute('aria-label',`Câu ${i+1}${answered?', đã nhập':''}`);grid.append(b);
 });
 root.append(grid);
 if(live)root.append(button('Nộp bài',()=>{if(confirm('Nộp bài và chấm điểm?')){finishExam(state,'submit');save();render();}},'danger'));
 else root.append(button('Làm đề mới',()=>{if(confirm('Xóa kết quả đề này và tạo đề mới?')){state.exam=null;save();render();}}));
}

export function updateExamTimer(ctx){
 const exam=ctx.state?.exam;if(!exam||exam.finalizedAt!==null)return;
 const ms=remainingMs(exam);
 if(ms===0){finishExam(ctx.state,'timeout');ctx.save();ctx.render();return;}
 const timer=document.querySelector('#exam-timer');
 if(timer){const sec=Math.ceil(ms/1000);timer.textContent=`${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;}
}
