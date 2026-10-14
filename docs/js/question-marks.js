import {el,button} from './render-utils.js';

export const MARK_COLORS=['red','yellow','green'];

export function toggleQuestionMark(state,questionId,color){
 state.starredIds||={};
 if(state.starredIds[questionId]===color)delete state.starredIds[questionId];
 else state.starredIds[questionId]=color;
}

export function listMarkedQuestions(questions,state){
 return questions.filter(question=>state.starredIds?.[question.sourceId]);
}

export function markColorButtons(state,questionId,save,render){
 const container=el('div',null,{class:'mark-colors','aria-label':'Màu đánh dấu'});
 const active=state.starredIds?.[questionId]||'';
 for(const color of MARK_COLORS){
  const mark=button('',()=>{toggleQuestionMark(state,questionId,color);save();render();},`mark-dot ${color}${active===color?' selected':''}`);
  mark.setAttribute('aria-label',`Đánh dấu ${color==='red'?'đỏ':color==='yellow'?'vàng':'xanh'}`);
  mark.setAttribute('aria-pressed',String(active===color));container.append(mark);
 }
 return container;
}
