import {el,add,button,panel} from './render-utils.js';
import {listMarkedQuestions,markColorButtons} from './question-marks.js';

export function markedView(ctx){
 const {root,state,bank,save,render}=ctx;
 root.append(button('← Trang chủ',ctx.home,'quiet back'),el('h1','Câu đã đánh dấu'));
 const questions=listMarkedQuestions(bank.questions,state);
 if(!questions.length){root.append(el('p','Chưa có câu nào được đánh dấu.'));return;}
 root.append(el('p',`${questions.length} câu`,{class:'muted'}));
 for(const q of questions){
  const card=panel(root);
  add(card,el('p',`CÂU #${q.sourceId} · ${state.starredIds[q.sourceId]==='red'?'ĐỎ':state.starredIds[q.sourceId]==='yellow'?'VÀNG':'XANH'}`,{class:'eyebrow'}),el('h2',q.question,{class:'question'}));
  if(q.questionVi)card.append(el('p',q.questionVi,{class:'translation'}));
  const answer=el('div',null,{class:'answer'});add(answer,el('p','ĐÁP ÁN',{class:'eyebrow'}),el('strong',q.sourceAnswer));
  if(q.answerVi)answer.append(el('p',q.answerVi,{class:'translation'}));
  card.append(answer,markColorButtons(state,q.sourceId,save,render),button('Mở câu',()=>{state.readQuestionId=q.sourceId;ctx.study('read');},'primary'));
 }
}
