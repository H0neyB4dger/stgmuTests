const fs = require('fs');
const r0 = /(?<=\n)\d*(\r\n|$)/g;
let questions = fs.readFileSync('../txt/polyclinicTherapyQuestions.txt', 'utf-8').replace(r0, '');
let answers = fs.readFileSync('../txt/polyclinicTherapyAnswers.txt', 'utf-8');
const blockName = 'polyclinicTherapy_';
const type = "single";
const r1 = /\r\n\d+\./g;
const r2 = /\r\n[A-Za-zА-Яа-я]\) +/g;
const r3 = /(\r\n)+/g;
let questionsArr = questions.split(r1).slice(1).map(v => v.split(r2));
let answersArr = answers.split('\r\n').slice(1);
let answersObj = {};
for (let i = 0; i < answersArr.length; i++) {
    const key = blockName + i;
    const value = {type, answer: [answersArr[i].split('-')[1].codePointAt(0) - "а".charCodeAt(0)]};
    const obj = {};
    answersObj[key] = value;
}
const finalJson = JSON.stringify({
    answers: answersObj,
    questions: questionsArr.map((v, i) => {
        return {id: blockName + i, arr: v}
    }),
}, null, "\r\n").replace(r3, '');

//fs.writeFileSync('../json/polyclinicTherapy.json', finalJson);
