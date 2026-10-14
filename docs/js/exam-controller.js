import {el,add,button,panel,checkbox} from './render-utils.js';
import {startExam,finalizeExam,remainingMs,gradeExam,examTotals} from './exam-engine.js';
export function examView(ctx){const {root,state,bank,save,render}=ctx;let e=state.exam;root.append(button('← Trang học',ctx.home,'quiet back'));
 if(!e){add(root,el('p','THI THỬ',{class:'eyebrow'}),el('h1','30 câu · 60 phút'),el('p','Viết đáp án trên giấy. Đáp án hiện sau khi nộp bài.'));const c=panel(root);add(c,el('p',`Ngẫu nhiên từ ${bank.questions.length}/600 câu. ${bank.questions.length<600?'Ngân hàng chưa đầy đủ.':''}`,{class:'warning'}),button('Bắt đầu thi',()=>{state.exam=startExam(bank.questions);if(save())render();else state.exam=null;},'primary'));return;}
 if(e.finalizedAt===null&&remainingMs(e)===0){finalizeExam(e,'timeout');save();}
 const live=e.finalizedAt===null,q=e.questions[e.index];add(root,el('div',live?'THI TRÊN GIẤY · ĐANG LÀM':'ĐÃ KẾT THÚC · TỰ CHẤM',{class:'eyebrow'}));
 if(live){const top=el('div',null,{class:'row between'});add(top,el('h1',`${e.index+1} / 30`),el('span','',{id:'exam-timer',class:'timer','aria-label':'Thời gian còn lại'}));root.append(top);}else{const t=examTotals(e);add(root,el('h1','Kết quả tự chấm'),el('p',`${t.correct} đúng · ${t.wrong} sai · ${t.ungraded} chưa chấm.`,{class:'warning'}),el('p',e.reason==='timeout'?'Hết giờ.':'Đã nộp bài.',{class:'muted'}));}
 const c=panel(root);add(c,el('p',`CÂU ${e.index+1} · #${q.sourceId}`,{class:'eyebrow'}),el('h2',q.question,{class:'question'}));
 if(live)c.append(checkbox('Đã viết câu trả lời trên giấy',!!e.checked[q.sourceId],v=>{e.checked[q.sourceId]=v;save();render();}));
 else{const a=el('div',null,{class:'answer'});add(a,el('p','ĐÁP ÁN',{class:'eyebrow'}),el('strong',q.sourceAnswer));if(q.reviewFlags.length)a.append(el('p',q.reviewFlags.map(f=>typeof f==='string'?f:JSON.stringify(f)).join(' · '),{class:'warning'}));c.append(a,el('p',`Tự chấm: ${e.grades[q.sourceId]==='correct'?'Đúng':e.grades[q.sourceId]==='wrong'?'Sai':'Chưa chấm'}`));add(c,add(el('div',null,{class:'actions'}),button('Sai',()=>{gradeExam(state,q.sourceId,'wrong');save();render();},'danger'),button('Đúng',()=>{gradeExam(state,q.sourceId,'correct');save();render();},'good')));}
 const nav=el('div',null,{class:'actions'});const prev=button('← Trước',()=>move(-1)),next=button('Tiếp →',()=>move(1));prev.disabled=e.index===0;next.disabled=e.index===29;add(nav,prev,next);c.append(nav);
 function move(delta){e.index+=delta;save();render();}
 const grid=el('div',null,{class:'number-grid'});e.questions.forEach((item,i)=>{const b=button(String(i+1),()=>{e.index=i;save();render();},`${e.index===i?'selected ':''}${e.checked[item.sourceId]?'checked':''}`);b.setAttribute('aria-label',`Câu ${i+1}${e.checked[item.sourceId]?', đã viết':''}`);grid.append(b);});root.append(grid);
 if(live)root.append(button('Nộp bài',()=>{if(confirm('Nộp bài ngay? Đồng hồ sẽ dừng và đáp án sẽ hiện.')){finalizeExam(e,'submit');save();render();}},'danger'));
 else root.append(button('Làm đề mới',()=>{if(confirm('Xóa kết quả đề này và tạo đề mới?')){state.exam=null;save();render();}}));
}
export function updateExamTimer(ctx){const e=ctx.state?.exam;if(!e||e.finalizedAt!==null)return;const ms=remainingMs(e);if(ms===0){finalizeExam(e,'timeout');ctx.save();ctx.render();return;}const timer=document.querySelector('#exam-timer');if(timer){const sec=Math.ceil(ms/1000);timer.textContent=`${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;}}

