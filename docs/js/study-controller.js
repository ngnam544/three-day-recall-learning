import {el,add,button,panel,note} from './render-utils.js';

export function studyView(ctx){
 const {root,state,bank,save,render}=ctx;
 const mode=ctx.practiceMode||'read';
 const questions=bank.questions;
 const allIndex=Math.max(0,Math.min(state.allTestIndex||0,questions.length-1));
 const readId=state.readQuestionId||questions[0].sourceId;
 const readIndex=questions.findIndex(q=>q.sourceId===readId);
 const index=mode==='read'?(readIndex<0?0:readIndex):allIndex;
 const q=questions[index];
 add(root,button('← Home',ctx.home,'quiet back'),el('h1',mode==='read'?'Read':'Test all'));
 const card=panel(root);
 add(card,el('p',`QUESTION #${q.sourceId} · ${index+1}/${questions.length}`,{class:'eyebrow'}),el('h2',q.question,{class:'question'}));

 if(mode==='read'){
  const answer=el('div',null,{class:'answer'});add(answer,el('p','ANSWER',{class:'eyebrow'}),el('strong',q.sourceAnswer));card.append(answer);
  const marked=!!state.starredIds?.[q.sourceId];
  add(card,button(marked?'★ Unknown':'☆ Mark unknown',()=>{state.starredIds||={};if(marked)delete state.starredIds[q.sourceId];else state.starredIds[q.sourceId]=true;save();render();}));
  const jump=el('form',null,{class:'jump-row'});add(jump,el('label','Question number',{for:'question-number'}));
  const input=el('input',null,{id:'question-number',type:'number',min:'1',max:'600',inputmode:'numeric',value:String(q.sourceId),required:'required'});
  const open=el('button','Open question',{type:'submit',class:'primary'});add(jump,input,open);jump.onsubmit=event=>{event.preventDefault();const target=Number(input.value);if(!Number.isInteger(target)||target<1||target>600){note('Enter a question number from 1 to 600.');return;}if(!questions.some(item=>item.sourceId===target)){note(`Question ${target} is not loaded.`);return;}state.readQuestionId=target;save();render();};card.append(jump);
 }else{
  const revealed=state.allTestRevealed===true;
  const form=el('form',null,{class:'test-form'});
  if(!revealed){
   const input=el('input',null,{type:'text',autocomplete:'off',placeholder:'Type your answer', 'aria-label':'Your answer'});
   const submit=el('button','Show answer',{type:'submit',class:'primary'});add(form,input,submit);
   form.onsubmit=event=>{event.preventDefault();state.allTestTyped=input.value;state.allTestRevealed=true;save();render();};
   const skip=button('Skip',()=>{state.allTestTyped='';state.allTestRevealed=true;save();render();});form.append(skip);
  }else{
   if(state.allTestTyped)add(form,el('p',`Your answer: ${state.allTestTyped}`,{class:'muted'}));
   const answer=el('div',null,{class:'answer'});add(answer,el('p','ANSWER',{class:'eyebrow'}),el('strong',q.sourceAnswer));form.append(answer);
   form.append(button(index===questions.length-1?'Finish':'Next question',()=>{if(index<questions.length-1)state.allTestIndex=index+1;state.allTestTyped='';state.allTestRevealed=false;save();render();},'primary'));
  }
  card.append(form);
 }
 if(questions.length<600)add(root,el('p',`${questions.length}/600 questions loaded.`,{class:'warning'}));
 if(mode==='read'){
  const nav=el('div',null,{class:'actions'});
  const prev=button('Previous',()=>move(index-1));const next=button('Next',()=>move(index+1),'primary');prev.disabled=index===0;next.disabled=index===questions.length-1;add(nav,prev,next);root.append(nav);
 }
 function move(nextIndex){state.readQuestionId=questions[nextIndex].sourceId;save();render();}
}
