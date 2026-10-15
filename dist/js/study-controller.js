import {el,add,button,panel,note} from './render-utils.js';
import {markColorButtons} from './question-marks.js?v=ui20261014m';

export function studyView(ctx){
 const {root,state,bank,save,render}=ctx;
 const mode=ctx.practiceMode||'read',questions=bank.questions;
 const allIndex=Math.max(0,Math.min(state.allTestIndex||0,questions.length-1));
 const readId=state.readQuestionId||questions[0].sourceId;
 const readIndex=questions.findIndex(q=>q.sourceId===readId);
 const index=mode==='read'?(readIndex<0?0:readIndex):allIndex,q=questions[index];
 add(root,button('← Trang chủ',ctx.home,'quiet back'),el('h1',mode==='read'?'Đọc':'Test hết'));
 const card=panel(root),showVietnamese=state.readVietnamese===true;
 add(card,el('p',`CÂU #${q.sourceId} · ${index+1}/${questions.length}`,{class:'eyebrow'}),el('h2',q.question,{class:'question'}));
 if(mode==='read'&&showVietnamese)card.append(el('p',q.questionVi||'',{class:'translation'}));

 if(mode==='read'){
  const answerVisible=state.readAnswerVisibleFor===q.sourceId;
  if(answerVisible){const answer=el('div',null,{class:'answer'});add(answer,el('p','ĐÁP ÁN',{class:'eyebrow'}),el('strong',q.sourceAnswer));if(showVietnamese)answer.append(el('p',q.answerVi||'',{class:'translation'}));card.append(answer);}
  const reveal=button(answerVisible?'Ẩn đáp án':'Hiện đáp án',()=>{state.readAnswerVisibleFor=answerVisible?null:q.sourceId;save();render();},'language-toggle');reveal.setAttribute('aria-expanded',String(answerVisible));card.append(reveal);
  const language=button(showVietnamese?'Ẩn nghĩa':'Dịch nghĩa',()=>{state.readVietnamese=!showVietnamese;save();render();},'language-toggle');language.setAttribute('aria-expanded',String(showVietnamese));card.append(language);
 }else{
  const revealed=state.allTestRevealed===true,skipped=state.allTestSkipped===true,form=el('form',null,{class:'test-form'});
  if(!revealed&&!skipped){
   const input=el('input',null,{type:'text',autocomplete:'off',placeholder:'Nhập đáp án','aria-label':'Đáp án của bạn'}),submit=el('button','Hiện đáp án',{type:'submit',class:'primary'});add(form,input,submit);
   input.value=state.allTestTyped||'';input.oninput=()=>{state.allTestTyped=input.value;save();};
   form.onsubmit=event=>{event.preventDefault();state.allTestTyped=input.value;state.allTestRevealed=true;save();render();};
   form.append(button('Bỏ qua',()=>{state.allTestTyped='';state.allTestRevealed=false;state.allTestSkipped=true;save();render();}));
  }else if(revealed){
   if(state.allTestTyped)add(form,el('p',`Bạn nhập: ${state.allTestTyped}`,{class:'muted'}));
   const answer=el('div',null,{class:'answer'});add(answer,el('p','ĐÁP ÁN',{class:'eyebrow'}),el('strong',q.sourceAnswer));form.append(answer);
  }
  else form.append(el('p','Đã bỏ qua câu này.',{class:'muted'}));
  if(revealed||skipped)form.append(button(index===questions.length-1?'Kết thúc':'Câu tiếp theo',()=>{if(index<questions.length-1)state.allTestIndex=index+1;state.allTestTyped='';state.allTestRevealed=false;state.allTestSkipped=false;save();render();},'primary'));
  card.append(form);
 }
 card.append(markColorButtons(state,q.sourceId,save,render));
 if(mode==='read'){
  const nav=el('div',null,{class:'actions'}),prev=button('← Trước',()=>move(index-1)),next=button('Sau →',()=>move(index+1),'primary');prev.disabled=index===0;next.disabled=index===questions.length-1;add(nav,prev,next);root.append(nav);
  const jump=el('form',null,{class:'jump-row'}),input=el('input',null,{id:'question-number',type:'number',min:'1',max:'600',inputmode:'numeric',placeholder:'Số câu',value:String(q.sourceId),required:'required','aria-label':'Số câu'}),open=el('button','Mở câu',{type:'submit',class:'primary'});add(jump,input,open);
  jump.onsubmit=event=>{event.preventDefault();const target=Number(input.value);if(!Number.isInteger(target)||target<1||target>600){note('Nhập số câu từ 1 đến 600.');return;}if(!questions.some(item=>item.sourceId===target)){note(`Chưa có câu ${target} trong dữ liệu.`);return;}state.readQuestionId=target;save();render();};root.append(jump);
 }
 function move(nextIndex){state.readQuestionId=questions[nextIndex].sourceId;save();render();}
}
