import {el,add,button,panel} from './render-utils.js';
import {ranges} from './question-repository.js';
import {orphanIds} from './state-store.js';

export function dashboard(ctx){
 const {root,state,bank,save,render}=ctx;
 const unseen=bank.questions.filter(q=>!state.cards[q.sourceId]?.attempts).length;
 const due=bank.questions.filter(q=>state.cards[q.sourceId]&&(state.cards[q.sourceId].dueAt<=Date.now()||state.cards[q.sourceId].examWrong)).length;
 add(root,el('p','BẮT ĐẦU TỪ CÂU SỐ 1',{class:'eyebrow'}),el('h1','Học từng câu. Không cần biết trước.'),el('p','Mỗi câu sẽ hiện cả câu hỏi và đáp án. Đọc để hiểu, thử nhắc lại, rồi app sẽ đưa câu chưa thuộc quay lại.',{class:'muted'}));
 const start=panel(root);start.classList.add('hero');
 add(start,el('h2',state.session?.mode==='learn'?'Bạn đang học một nhóm câu.':unseen?'Bắt đầu học câu mới':'Đến lượt ôn lại.'),el('p',`${unseen} câu chưa học · ${due} câu cần ôn lại`,{class:'muted'}));
 const resume=state.session&&state.session.count<20;
 add(start,button(resume?(state.session.mode==='recall'?'Tiếp tục ôn lại →':'Tiếp tục học →'):unseen?'Học 20 câu tiếp theo →':'Ôn lại câu chưa thuộc →',()=>ctx.study(resume?state.session.mode:unseen?'learn':'review'),'primary'));
 start.append(el('p',`Ngân hàng hiện có ${bank.questions.length}/600 câu. Tiến độ lưu trên trình duyệt này.`,{class:'save'}));
 if(bank.missingIds.length)start.append(el('p',`Còn thiếu câu ${ranges(bank.missingIds)}. Khi bạn gửi trang này, mình sẽ bổ sung.`,{class:'warning'}));
 const guide=panel(root,'Cách học');
 for(const [n,t] of [['1','Đọc câu hỏi và đáp án cùng nhau.'],['2','Che đáp án trong đầu hoặc trên giấy, rồi thử nhớ lại.'],['3','Chọn “Chưa thuộc” hoặc “Đã nhớ”; câu khó sẽ được hỏi lại.']])add(guide,add(el('div',null,{class:'row guide-step'}),el('strong',n),el('span',t)));
 const days=panel(root,'Kế hoạch 3 ngày');
 const dayRow=el('div',null,{class:'row'});for(let i=1;i<=3;i++)dayRow.append(button(`Ngày ${i}`,()=>{state.day=i;save();render();},state.day===i?'primary':''));days.append(dayRow);
 days.append(el('p',state.day===1?'Học thật nhiều câu mới trước. Sau đó chỉ ôn những câu chưa thuộc.':state.day===2?'Tiếp tục học câu mới và ôn lại câu hôm qua.':`Ôn câu khó trước, rồi thử đề mẫu 30 câu trong 60 phút.`));
 if(state.day===3)days.append(button(state.exam?'Mở bài thi đang lưu →':'Thử đề mẫu 30 câu · 60 phút',()=>ctx.exam(),'primary'));
 const io=panel(root,'Chuyển máy hoặc sao lưu');add(io,el('p','Tiến độ nằm riêng trong trình duyệt của bạn.',{class:'muted'}));const row=el('div',null,{class:'row'});add(row,button('Xuất tiến độ',ctx.exportState),button('Nhập tiến độ',ctx.importState));io.append(row);
 const orphans=orphanIds(state,bank.questions);if(orphans.length)io.append(el('p',`Đang giữ tiến độ của ${orphans.length} câu hiện chưa có trong danh sách.`,{class:'warning'}));
}
