/*
  Autor: Daniel dos Santos
  Data: 11/04/2020
  Observação: Classe que cria componentes.
*/

class Build {

  constructor() {
    var video = this.getVideo();
    var canvas = this.getCanvas();
    var bt_ativa = this.getBtAtiva();
    var bt_desliga = this.getBtDesliga();

    this.addElementBody(video);
    this.addElementBody(canvas);
    this.addElementBody(bt_ativa);
    this.addElementBody(bt_desliga);
  }

  addElementBody = (element) => {
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(element);
  };

  getVideo = () => {
    var video = document.createElement("video");
    video.id = "player";
    video.controls = "controls";
    video.autoplay = "autoplay";
    return video;
  };

  getBtAtiva = () => {
    var button = document.createElement("button");
    button.id = "bt_ativa";
    button.innerHTML = "Ativa";
    return button;
  };

  getBtDesliga = () => {
    var button = document.createElement("button");
    button.id = "bt_desliga";
    button.innerHTML = "Desliga";
    return button;
  };

  getCanvas = () => {
    var canvas = document.createElement("canvas");
    canvas.id = "snapshot";
    canvas.width = 320;
    canvas.height = 240;
    return canvas;
  };

}