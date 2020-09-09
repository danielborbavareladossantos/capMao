/*
  Autor: Daniel dos Santos
  Data: 11/04/2020
  Observação: Classe que controla processamento de imagem
*/

class controllerCamProcess {

    static actionAtiva = async () => {
        if (!Camera.isLigado()) {
            Camera.ativa();

            //espera camera ligar
            setTimeout(() => {
                
                //chama processamento a cada 10 frames
                window.setInterval(() => {
                    controllerCamProcess.processaImagem();
                }, 10);

            }, 3000);

        } else {
            alert("Sua camera já esta ligada!");
        }
    };

    static actionDesativa = async () => {
        if (Camera.isLigado()) {
            Camera.desliga();
            clearInterval();
        } else {
            alert("Sua camera já esta desligada!");
        }
    };

    static processaImagem = () => {

        //desenha no canvas imagem original do video
        var context = Control.getSnapshot().getContext('2d');
        context.drawImage(Control.getPlayer(), 0, 0, Control.getSnapshot().width, Control.getSnapshot().height);

        //captura do canvas stream do video
        var imgData = context.getImageData(0, 0, Control.getSnapshot().width, Control.getSnapshot().height);
        
        //processa imagem
        // controllerCamProcess.removeAcima60(imgData);
        controllerCamProcess.deixaBranco(imgData);

        //coloca imagem processada em canvas novamente
        context.putImageData(imgData, 0, 0);

    };

    static removeAcima60 = (imgData) => {
        for (var i = 0; i < imgData.data.length; i+=4) {
            if (imgData.data[i] > 60) {
                imgData.data[i] = 255;
            }
            if (imgData.data[i+1] > 60) {
                imgData.data[i+1] = 255;
            }
            if (imgData.data[i+2] > 60) {
                imgData.data[i+2] = 255;
            }
        }
    };

    static deixaBranco = (imgData) => {
        var min = 90;
        var max = 255;
        for (var i = 0; i < imgData.data.length; i+=4) {

            if (imgData.data[i] > min && imgData.data[i] < max)
                imgData.data[i] = 255;
            else
                imgData.data[i] = 0;

            if (imgData.data[i] == max)
                imgData.data[i+1] = 255;
            else
                imgData.data[i+1] = 0;

            if (imgData.data[i] == max)
                imgData.data[i+2] = 255;
            else
                imgData.data[i+2] = 0;

        }
    };

  }