/*
  Autor: Daniel dos Santos
  Data: 11/04/2020
  Observação: Classe que seta listeners de componentes.
*/

class Action {

  constructor() {

    Control.getBtAtiva().addEventListener('click', () => {
      controllerCamProcess.actionAtiva();
    });

    Control.getBtDesliga().addEventListener('click', () => {
      controllerCamProcess.actionDesativa();
    });

  }
  
}