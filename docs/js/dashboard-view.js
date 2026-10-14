import {el,add,button,panel} from './render-utils.js';

export function dashboard(ctx){
 const {root,bank,state}=ctx;
 add(root,el('p','600 CÂU HỎI',{class:'eyebrow'}),el('h1','Chọn chế độ.'));
 const guide=panel(root,'Cách dùng');
 add(guide,el('p','Đọc: đáp án hiện sẵn bằng tiếng Việt. Dùng VI/EN để đổi ngôn ngữ. Chọn màu để đánh dấu mức độ thuộc.'),el('p','Test hết: nhập đáp án rồi nhấn Enter, hoặc bỏ qua. Đáp án hiện trước khi sang câu tiếp.'),el('p','Thi thử: 30 câu ngẫu nhiên, 60 phút. Viết đáp án trên giấy.'));
 const modes=el('div',null,{class:'mode-grid'});
 add(modes,button('Đọc',()=>ctx.study('read'),'primary'),button('Test hết',()=>ctx.study('all')),
  button('Thi thử · 30 câu · 60 phút',ctx.exam));
 root.append(modes);
 const count=bank.questions.length;
 if(count<600)add(root,el('p',`Trong app: ${count}/600 câu. Thiếu: ${bank.missingIds.join(', ')}.`,{class:'warning'}));
 const backup=el('details',null,{class:'card'});backup.append(el('summary','Sao lưu tiến độ'),el('p','Tiến độ lưu trên trình duyệt này.'));
 const actions=el('div',null,{class:'row'});add(actions,button('Xuất tiến độ',ctx.exportState),button('Nhập tiến độ',ctx.importState));backup.append(actions);root.append(backup);
}
