function Aluno(a, b, c) {
  this.nome = a;
  this.faltas = b;
  this.notas = c;
  this.calcularMedia = function () {
    let media = 0;
    for (i = 0; i < this.notas.length; i++) {
      media += this.notas[i];
    }

    return media / this.notas.length;
  };

  this.ausente = function () {
    this.faltas++;
  };
}

module.exports = Aluno;
