import {el,add,button,panel,note} from './render-utils.js';

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

 if(mode==='read'){
  const answer=el('div',null,{class:'answer'});add(answer,el('p','ĐÁP ÁN',{class:'eyebrow'}),el('strong',q.sourceAnswer));card.append(answer);
  const language=button(showVietnamese?'Ẩn nghĩa':'Dịch nghĩa',()=>{state.readVietnamese=!showVietnamese;save();render();},'language-toggle');language.setAttribute('aria-expanded',String(showVietnamese));card.append(language);
  const colors=el('div',null,{class:'mark-colors','aria-label':'Mark knowledge'}),active=state.starredIds?.[q.sourceId]||'';
  for(const color of ['red','yellow','green']){const mark=button('',()=>{state.starredIds||={};if(active===color)delete state.starredIds[q.sourceId];else state.starredIds[q.sourceId]=color;save();render();},`mark-dot ${color}${active===color?' selected':''}`);mark.setAttribute('aria-label',`${color} mark`);mark.setAttribute('aria-pressed',String(active===color));colors.append(mark);}card.append(colors);
  if(showVietnamese){card.append(el('p',q.questionVi||'',{class:'translation'}));answer.append(el('p',q.answerVi||'',{class:'translation'}));}
 }else{
  const revealed=state.allTestRevealed===true,form=el('form',null,{class:'test-form'});
  if(!revealed){
   const input=el('input',null,{type:'text',autocomplete:'off',placeholder:'Nhập đáp án','aria-label':'Đáp án của bạn'}),submit=el('button','Hiện đáp án',{type:'submit',class:'primary'});add(form,input,submit);
   form.onsubmit=event=>{event.preventDefault();state.allTestTyped=input.value;state.allTestRevealed=true;save();render();};
   form.append(button('Bỏ qua',()=>{state.allTestTyped='';state.allTestRevealed=true;save();render();}));
  }else{
   if(state.allTestTyped)add(form,el('p',`Bạn nhập: ${state.allTestTyped}`,{class:'muted'}));
   const answer=el('div',null,{class:'answer'});add(answer,el('p','ĐÁP ÁN',{class:'eyebrow'}),el('strong',q.sourceAnswer));form.append(answer);
   form.append(button(index===questions.length-1?'Kết thúc':'Câu tiếp theo',()=>{if(index<questions.length-1)state.allTestIndex=index+1;state.allTestTyped='';state.allTestRevealed=false;save();render();},'primary'));
  }
  card.append(form);
 }
 if(mode==='read'){
  const nav=el('div',null,{class:'actions'}),prev=button('← Trước',()=>move(index-1)),next=button('Sau →',()=>move(index+1),'primary');prev.disabled=index===0;next.disabled=index===questions.length-1;add(nav,prev,next);root.append(nav);
  const jump=el('form',null,{class:'jump-row'}),input=el('input',null,{id:'question-number',type:'number',min:'1',max:'600',inputmode:'numeric',placeholder:'Số câu',value:String(q.sourceId),required:'required','aria-label':'Số câu'}),open=el('button','Mở câu',{type:'submit',class:'primary'});add(jump,input,open);
  jump.onsubmit=event=>{event.preventDefault();const target=Number(input.value);if(!Number.isInteger(target)||target<1||target>600){note('Nhập số câu từ 1 đến 600.');return;}if(!questions.some(item=>item.sourceId===target)){note(`Chưa có câu ${target} trong dữ liệu.`);return;}state.readQuestionId=target;save();render();};root.append(jump);
 }
 function move(nextIndex){state.readQuestionId=questions[nextIndex].sourceId;save();render();}
}
