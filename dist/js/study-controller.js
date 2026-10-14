import {el,add,button,panel} from './render-utils.js';
import {newSession,selectCard,gradeCard} from './recall-engine.js';

export function studyView(ctx){
 const {root,state,bank,save,render}=ctx;let s=state.session;
 add(root,button('← Trang học',ctx.home,'quiet back'));
 if(!s){state.session=newSession();state.session.mode=ctx.studyMode||'learn';s=state.session;}
 if(s.count>=20){
  add(root,el('p','20 CÂU',{class:'eyebrow'}),el('h1',s?'Xong 20 câu.':'Câu hỏi và đáp án.'),el('p',s?'Bắt đầu nhóm tiếp theo.':'Đọc câu hỏi cùng đáp án trước. Tự kiểm tra sau.',{class:'muted'}));
  root.append(button(s?'Bắt đầu nhóm 20 câu tiếp theo →':'Bắt đầu nhóm 20 câu →',()=>{state.session=newSession();state.session.mode=ctx.studyMode||'learn';ctx.promptStarted=Date.now();save();render();},'primary'));return;
 }
 if(s.mode==='review'){if(!s.learnQueue.length&&!s.current)s.learnQueue=bank.questions.filter(x=>state.cards[x.sourceId]?.attempts&&(state.cards[x.sourceId].dueAt<=Date.now()||state.cards[x.sourceId].examWrong)).slice(0,20).map(x=>x.sourceId);s.studyPhase='recall';}
 else if(!s.learnQueue?.length&&!s.current&&s.history.length===0)s.learnQueue=bank.questions.filter(x=>!state.cards[x.sourceId]?.attempts).slice(0,20).map(x=>x.sourceId);
 if(!s.current){const pick=s.learnQueue?.length?s.learnQueue[0]:null;if(pick)s.current=pick;else if(s.mode==='learn')s.studyPhase='recall';}
 if(s.mode==='recall'&&!s.learnQueue.length&&s.count>0){s.count=20;save();return studyView(ctx);}
 if(s.studyPhase==='recall'||s.mode==='review'){
  if(!s.current){const result=selectCard(bank.questions,state);if(!result.card){add(root,el('h1','Không có câu cần ôn.'),button('Về trang học',ctx.home,'primary'));return;}s.current=result.card.sourceId;s.reason=result.reason;}
 }
 const q=bank.questions.find(item=>item.sourceId===s.current);if(!q){add(root,el('p','Không tìm thấy câu này trong ngân hàng.'),button('Quay lại',ctx.home));return;}
 if(s.studyPhase!=='recall'&&s.studyPhase!=='recall-answer')s.studyPhase='learn';
 const position=s.mode==='learn'&&s.history.length<20?s.history.length+1:s.count+1;
 add(root,el('p',`${s.mode==='review'?'ÔN LẠI':'HỌC'} · ${position}/20`,{class:'eyebrow'}));
 const card=panel(root);add(card,el('p',`CÂU #${q.sourceId}`,{class:'eyebrow'}),el('h2',q.question,{class:'question'}));
 if(s.studyPhase==='learn'&&s.mode==='learn'){
  const answer=el('div',null,{class:'answer'});add(answer,el('span','ĐÁP ÁN',{class:'eyebrow'}),el('strong',q.sourceAnswer));if(q.reviewFlags.length)answer.append(el('p',q.reviewFlags.map(f=>typeof f==='string'?f:JSON.stringify(f)).join(' · '),{class:'warning'}));card.append(answer);
  add(card,el('p','Đọc cả hai. Chưa cần nhớ.',{class:'muted'}),button('Tiếp theo →',()=>{s.learnQueue=s.learnQueue.filter(id=>id!==q.sourceId);s.history.push(q.sourceId);if(s.learnQueue.length===0){s.mode='recall';s.studyPhase='recall';s.learnQueue=[...s.history];}s.current=s.learnQueue[0]||null;save();render();},'primary'));
 }else if(s.studyPhase==='learn'||s.studyPhase==='recall'){
  add(card,el('p','Thử trả lời trước khi xem đáp án.',{class:'muted'}),button('Hiện đáp án',()=>{s.studyPhase='recall-answer';save();render();},'primary'));
 }else{
  const answer=el('div',null,{class:'answer'});add(answer,el('span','ĐÁP ÁN',{class:'eyebrow'}),el('strong',q.sourceAnswer));if(q.reviewFlags.length)answer.append(el('p',q.reviewFlags.map(f=>typeof f==='string'?f:JSON.stringify(f)).join(' · '),{class:'warning'}));card.append(answer);
  add(card,el('p','Tự đánh giá câu trả lời của bạn:',{class:'muted'}),add(el('div',null,{class:'actions'}),button('Chưa thuộc',()=>finish('wrong'),'danger'),button('Gần nhớ',()=>finish('slow')),button('Đã nhớ',()=>finish('correct'),'good')));
 }
 function finish(grade){gradeCard(state,q.sourceId,grade,Date.now());s.mode='recall';s.studyPhase='learn';s.learnQueue=s.learnQueue.filter(id=>id!==q.sourceId);if(!s.learnQueue.length)s.count=20;s.current=s.learnQueue[0]||null;ctx.promptStarted=Date.now();save();render();}
}
