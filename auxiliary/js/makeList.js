const blockName = 'polyclinicTherapy';
fetch('../json/polyclinicTherapy.json')
    .then(response => {
        const json = response.json();
        return json;
    })
    .then(json => {
        const questions = json.questions;
        let list = '';
        for (let i = 0; i < questions.length; i++) {
            list += `<li class="testContainer" id="${blockName}_${i}">
    <h2>
      ${questions[i].arr[0]}
    </h2>`
            for (let j = 1; j <questions[i].arr.length; j++) {
    list += `
    <div class="answerContainer focus hover" id="${blockName}_${i}_${j - 1}" data-value="${j - 1}" tabindex="0">
      <span class="answerSpan answerLetter">${String.fromCodePoint("a".codePointAt(0) + (j - 1))}) </span>
      <span class="answerSpan answerText">${questions[i].arr[j]}</span>
      <span class="answerSpan answerMark"></span>
    </div>`
            }
  list += `</li>`;
        }
    document.querySelector('#list').innerHTML = list;
    });
