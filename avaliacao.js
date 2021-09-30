let Aluno = require('./aluno');

let aluno1 = new Aluno('Marcos', 6, [7, 5, 9, 3]);
let aluno2 = new Aluno('Clayton', 2, [9, 8, 8, 9]);
let aluno3 = new Aluno('Erick', 1, [9, 8, 8, 9]);
let turma = [aluno1, aluno2, aluno3];

let curso = {
  nomeCurso: 'Programação Imperativa',
  notaAprovacao: 7,
  faltasMax: 3,
  estudantes: turma,
  adicionarAluno: function (a, b, c) {
    this.estudantes.push(new Aluno(a, b, c));
  },
  aprovacao: function (aluno) {
    if (
      (aluno.calcularMedia() >= this.notaAprovacao &&
        aluno.faltas < this.faltasMax) ||
      (aluno.calcularMedia() > this.notaAprovacao * 1.1 &&
        aluno.faltas == this.faltasMax)
    ) {
      return true;
    } else {
      return false;
    }
  },
  aprovados: function (a) {
    for (let v = 0; v < a.length; v++) {
      if (curso.aprovacao(a[v]) === true) {
        console.log(
          a[v].nome + ' está aprovado com média de ' + a[v].calcularMedia()
        );
      } else {
        console.log(
          a[v].nome + ' está reprovado com média de ' + a[v].calcularMedia()
        );
      }
    }
  }
};

curso.adicionarAluno('Gui', 0, [9, 8, 8, 9]);
curso.adicionarAluno('Heberth', 1, [9, 8, 8, 9]);
curso.adicionarAluno('Lana', 3, [9, 8, 8, 9]);

console.log('---- Nova lista de alunos ----');
console.log(curso.estudantes);

console.log('---- Lista de Aprovação ----');
curso.aprovados(curso.estudantes);
