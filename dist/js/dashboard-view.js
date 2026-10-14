import {el,add,button,panel} from './render-utils.js';

export function dashboard(ctx){
 const {root,bank,state}=ctx;
 add(root,el('p','600 QUESTIONS',{class:'eyebrow'}),el('h1','Choose a mode.'));
 const guide=panel(root,'Guide');
 add(guide,el('p','Read: answers are visible. Enter a question number to jump to it. Star questions you do not know.'),el('p','Test all: type an answer and press Enter, or skip. The answer appears before you continue.'),el('p','Mock test: 30 random questions, 60 minutes. Write answers on paper.'));
 const modes=el('div',null,{class:'mode-grid'});
 add(modes,button('Read',()=>ctx.study('read'),'primary'),button('Test all',()=>ctx.study('all')),
  button('Mock test · 30 questions · 60 minutes',ctx.exam));
 root.append(modes);
 const count=bank.questions.length;
 if(count<600)add(root,el('p',`${count}/600 questions loaded. Missing: ${bank.missingIds.join(', ')}.`,{class:'warning'}));
 const backup=el('details',null,{class:'card'});backup.append(el('summary','Progress backup'),el('p','Progress is saved in this browser.'));
 const actions=el('div',null,{class:'row'});add(actions,button('Export progress',ctx.exportState),button('Import progress',ctx.importState));backup.append(actions);root.append(backup);
 if(Object.keys(state.cards).length||Object.keys(state.starredIds||{}).length)root.append(el('p','Progress is saved in this browser.',{class:'save'}));
}
