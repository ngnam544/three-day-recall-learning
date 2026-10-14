export function normalize(value,policy='prose'){const s=value.trim().replace(/\s+/g,' ').replace(/\.$/,'');return policy==='exact'?s:s.toLocaleLowerCase('en');}
export function evaluate(question,value){return [question.sourceAnswer,...question.acceptedAliases].some(a=>normalize(a,question.matchingPolicy)===normalize(value,question.matchingPolicy));}

