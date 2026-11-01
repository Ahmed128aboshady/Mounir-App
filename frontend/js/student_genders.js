/* No embedded student directory: use authenticated record properties only. */
(()=>{
 window.STUDENT_GENDER_MAP={};window.STUDENT_GENDER_BY_NAME={};window.STUDENT_AGE_MAP={};window.STUDENT_AGE_BY_NAME={};
 window.normalizeArabicName=value=>String(value||'').trim().replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ');
 window.getStudentGender=(identifier,name,explicitGender)=>{const g=String(explicitGender||'').toLowerCase().trim();if(['f','female','بنت','أنثى','انثى'].includes(g))return 'f';if(['m','male','ولد','ذكر'].includes(g))return 'm';return null};
 window.getStudentAge=(code,name,age)=>{const n=Number(age);return Number.isFinite(n)&&n>0?n:null};
})();
