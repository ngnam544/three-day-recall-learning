import {el,add,button,panel} from './render-utils.js';
import {ranges} from './question-repository.js';
import {orphanIds} from './state-store.js';

export function dashboard(ctx){
 const {root,state,bank,save,render}=ctx;
 const unseen=bank.questions.filter(q=>!state.cards[q.sourceId]?.attempts).length;
 const due=bank.questions.filter(q=>state.cards[q.sourceId]&&(state.cards[q.sourceId].dueAt<=Date.now()||state.cards[q.sourceId].examWrong)).length;
 add(root,el('p','600 CÂU HỎI',{class:'eyebrow'}),el('h1','Học câu hỏi và đáp án.'),el('p','Bắt đầu bằng cách đọc 20 câu có đáp án. Sau đó ôn lại những câu chưa thuộc.',{class:'muted'}));
 const start=panel(root);start.classList.add('hero');
 const resume=state.session&&state.session.count<20;
 add(start,el('h2',resume?'Tiếp tục nhóm đang học':unseen?'Bắt đầu học':'Ôn lại câu chưa thuộc'),el('p',`${unseen} câu chưa học · ${due} câu cần ôn`,{class:'muted'}));
 add(start,button(resume?'Tiếp tục →':unseen?'Bắt đầu · 20 câu →':'Bắt đầu ôn →',()=>ctx.study(resume?state.session.mode:unseen?'learn':'review'),'primary'));
 start.append(el('p',`${bank.questions.length}/600 câu có trong app.`,{class:'save'}));
 if(bank.missingIds.length)start.append(el('p',`Thiếu câu ${ranges(bank.missingIds)}.`,{class:'warning'}));
 const guide=panel(root,'Cách học');
 for(const [n,t] of [['1','Đọc câu hỏi và đáp án.'],['2','Thử nhớ câu trả lời.'],['3','Chọn “Chưa thuộc”, “Gần nhớ” hoặc “Đã nhớ”.']])add(guide,add(el('div',null,{class:'row guide-step'}),el('strong',n),el('span',t)));
 const days=el('details',null,{class:'card'});days.append(el('summary','Kế hoạch 3 ngày'));const row=el('div',null,{class:'row'});for(let i=1;i<=3;i++)row.append(button(`Ngày ${i}`,()=>{state.day=i;save();render();},state.day===i?'primary':''));days.append(row);
 days.append(el('p',state.day===1?'Ngày 1: học câu mới.':state.day===2?'Ngày 2: học câu mới và ôn lại.':'Ngày 3: ôn câu sai và thi thử.'));
 if(state.day===3)days.append(button(state.exam?'Mở bài thi đang lưu':'Thi thử · 30 câu · 60 phút',()=>ctx.exam(),'primary'));root.append(days);
 const io=el('details',null,{class:'card'});io.append(el('summary','Sao lưu tiến độ'),el('p','Tiến độ lưu trên trình duyệt này.',{class:'muted'}));const backups=el('div',null,{class:'row'});add(backups,button('Xuất tệp',ctx.exportState),button('Nhập tệp',ctx.importState));io.append(backups);root.append(io);
 const orphans=orphanIds(state,bank.questions);if(orphans.length)io.append(el('p',`${orphans.length} câu vắng khỏi ngân hàng; tiến độ vẫn được giữ.`,{class:'warning'}));
}
