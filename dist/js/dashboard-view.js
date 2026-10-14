import {el,add,button,panel} from './render-utils.js';

export function dashboard(ctx){
 const {root,bank}=ctx;
 add(root,el('p','600 CÂU HỎI',{class:'eyebrow'}),el('h1','Chọn chế độ.'));
 const guide=panel(root,'Cách dùng');
 add(guide,el('p','Đọc: bấm “Dịch nghĩa” để hiện câu tiếng Việt ngay dưới câu tiếng Anh. Ba nút màu dùng để đánh dấu mức độ thuộc.'),el('p','Test hết: nhập đáp án rồi nhấn Enter, hoặc bỏ qua. Đáp án hiện trước khi sang câu tiếp.'),el('p','Thi thử: nhập đáp án trong app cho 30 câu ngẫu nhiên trong 60 phút. App chấm điểm khi nộp bài hoặc hết giờ.'));
 const modes=el('div',null,{class:'mode-grid'});
 add(modes,button('Đọc',()=>ctx.study('read'),'primary'),button('Test hết',()=>ctx.study('all')),
  button('Thi thử · 30 câu · 60 phút',ctx.exam));
 root.append(modes);
 const count=bank.questions.length;
 if(count<600)add(root,el('p',`Trong app: ${count}/600 câu. Thiếu: ${bank.missingIds.join(', ')}.`,{class:'warning'}));
 add(root,el('p','Tiến độ tự lưu trên trình duyệt này. Mỗi điện thoại có tiến độ riêng.',{class:'save'}));
}
