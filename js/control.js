/*
  Autor: Daniel dos Santos
  Data: 11/04/2020
  Observação: Classe que retorna objetos de elementos da tela.
*/

class Control {
  
  static getPlayer = () => {
    return document.getElementById("player");
  };

  static getSnapshot = () => {
    return document.getElementById("snapshot");
  };

  static getBtAtiva = () => {
    return document.getElementById("bt_ativa");
  };

  static getBtDesliga = () => {
    return document.getElementById("bt_desliga");
  };
  
}