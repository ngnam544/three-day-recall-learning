import {el,add,button,panel} from './render-utils.js';
import {listMarkedQuestions,markColorButtons} from './question-marks.js?v=ui20261014m';

export function markedView(ctx){
 const {root,state,bank,save,render}=ctx;
 root.append(button('← Trang chủ',ctx.home,'quiet back'),el('h1','Câu đã đánh dấu'));
 const allQuestions=listMarkedQuestions(bank.questions,state),filter=ctx.markedColorFilter||'all';
 const filters=[['all','Tất cả'],['red','Đỏ'],['yellow','Vàng'],['green','Xanh']],controls=el('div',null,{class:'actions mark-filters'});
 for(const [color,label]of filters){
  const count=color==='all'?allQuestions.length:listMarkedQuestions(bank.questions,state,color).length;
  controls.append(button(`${label} (${count})`,()=>{ctx.markedColorFilter=color;render();},filter===color?'primary':''));
 }
 root.append(controls);
 if(!allQuestions.length){root.append(el('p','Chưa có câu nào được đánh dấu.'));return;}
 const questions=listMarkedQuestions(bank.questions,state,filter);
 if(!questions.length){root.append(el('p',`Không có câu màu ${filter==='red'?'đỏ':filter==='yellow'?'vàng':'xanh'}.`));return;}
 root.append(el('p',`${questions.length} câu`,{class:'muted'}));
 for(const q of questions){
  const card=panel(root);
  add(card,el('p',`CÂU #${q.sourceId} · ${state.starredIds[q.sourceId]==='red'?'ĐỎ':state.starredIds[q.sourceId]==='yellow'?'VÀNG':'XANH'}`,{class:'eyebrow'}),el('h2',q.question,{class:'question'}));
  if(q.questionVi)card.append(el('p',q.questionVi,{class:'translation'}));
  const answer=el('div',null,{class:'answer'});add(answer,el('p','ĐÁP ÁN',{class:'eyebrow'}),el('strong',q.sourceAnswer));
  if(q.answerVi)answer.append(el('p',q.answerVi,{class:'translation'}));
  answer.hidden=true;
  const reveal=button('Hiện đáp án',()=>{answer.hidden=!answer.hidden;reveal.textContent=answer.hidden?'Hiện đáp án':'Ẩn đáp án';});
  card.append(reveal,answer,markColorButtons(state,q.sourceId,save,render),button('Mở câu',()=>{state.readQuestionId=q.sourceId;ctx.study('read');},'primary'));
 }
}
