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
                // window.setInterval(() => {
                //     controllerCamProcess.processaImagem();
                // }, 10);
                controllerCamProcess.processaImagem();
                // actionDesativa();

            }, 5000);

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
        controllerCamProcess.deixaBranco(imgData);
        context.putImageData(imgData, 0, 0);

        var vertices = controllerCamProcess.criaVertice(imgData,context);

        //seta lista de ajacencia de todos vertices
        vertices = controllerCamProcess.setaAdjacentes(vertices);
        vertices = vertices.filter(e=>e.getAdjacentes().length > 3 && e.getAdjacentes().length < 5);
        
        //calculo distancia euclidiana para verificar adjacentes
        vertices = controllerCamProcess.redefineAdjacentes(vertices);
        const {newVertices, qtdObjetos} = controllerCamProcess.defineStatus(vertices);
        vertices = newVertices;

        const objetosVaretaReconhecidos = controllerCamProcess.defineVareta(vertices,qtdObjetos);

        if (objetosVaretaReconhecidos.length === 0) {
            alert("Nenhum objeto na camera!");
            return;
        }

        if (objetosVaretaReconhecidos.length > 1) {
            alert("Mais de um objeto existente na camera!");
            return;
        }
        
        //colori os vertices coletados
        controllerCamProcess.desenhaVertice(imgData,context,vertices);

        //coloca imagem processada em canvas novamente
        context.putImageData(imgData, 0, 0);

        if (objetosVaretaReconhecidos.length > 0) {
            const posicoes = controllerCamProcess.defineBbox(objetosVaretaReconhecidos[0]);
            controllerCamProcess.desenhaBbox(context,posicoes);
            const {x1,x2,y1,y2} = controllerCamProcess.calculateYlinha(posicoes);
            const angulo = controllerCamProcess.calculateSlope(x1,y1,x2,y2);
            context.font = "12px Arial";
            context.fillText((Math.round(angulo*100)).toString(), x1-25, y1);
            console.log(angulo);
        }
        
    };

    static deixaBranco = (imgData) => {
        var min = 128;
        var max = 255;
        for (var i = 0; i < imgData.data.length; i+=4) {

            //r
            if (
                imgData.data[i] > min && 
                imgData.data[i] < max && 
                imgData.data[i+1] < 62 && 
                imgData.data[i+2] < 62 
            )
                imgData.data[i] = 255;
            else
                imgData.data[i] = 0;

            //g
            if (imgData.data[i] == max)
                imgData.data[i+1] = 255;
            else
                imgData.data[i+1] = 0;

            //b
            if (imgData.data[i] == max)
                imgData.data[i+2] = 255;
            else
                imgData.data[i+2] = 0;

        }
    };

    static criaVertice = (imgData,context) => {
        var array = [];
        const tamLinha = context.canvas.offsetWidth;
        var x = 0;
        var y = 0;
        for (var i = 0; i < imgData.data.length; i+=4) {
            if (
                imgData.data[i] > 244 &&
                imgData.data[i+1] > 244 &&
                imgData.data[i+2] > 244
            ) {
                const v = new Vertice(x,y);
                array.push(v);
            }
            x++;
            if (x == tamLinha) {
                x=0;
                y++;
            }
        }
        return array;
    };

    static desenhaVertice = (imgData,context,vertices) => {
        const tamLinha = context.canvas.offsetWidth;
        var x = 0;
        var y = 0;
        for (var i = 0; i < imgData.data.length; i+=4) {
            vertices.forEach(element => {
                if (element.x == x && element.y == y) {
                    imgData.data[i] = element.color.num1;
                    imgData.data[i+1] = element.color.num2;
                    imgData.data[i+2] = element.color.num3;
                }
            });
            x++;
            if (x == tamLinha) {
                x=0;
                y++;
            }
        }
    };

    static desenhaBbox = (context,posicoes) => {
        context.fillStyle = "rgba(255, 0, 0, 0.4)";
        context.fillRect(
            posicoes.minX, 
            posicoes.minY,
            posicoes.maxX-posicoes.minX, 
            posicoes.maxY-posicoes.minY
        );
    };

    static calculateSlope = (x1, y1, x2, y2) => {
        return (y1 - y2) / (x1 - x2);
    }

    static calculateYlinha = (posicoes) => {
        const dist = posicoes.maxYelement.getDistancia(
            posicoes.minXelement.x,posicoes.minXelement.y
        );
        if (dist < 10) {
            return {
                x1: posicoes.maxYelement.x,
                x2: posicoes.minYelement.x,
                y1: posicoes.maxYelement.y,
                y2: posicoes.minYelement.y
            };
        } else {
            return {
                x1: posicoes.minYelement.x,
                x2: posicoes.maxYelement.x,
                y1: posicoes.minYelement.y,
                y2: posicoes.maxYelement.y
            };
        }
    }

    static setaAdjacentes = (vertices) => {
        vertices.forEach(element => {
            // c1
            const c1 = controllerCamProcess.filtraVertice(vertices,element.x-1,element.y-1);
            if (c1!=null)
                element.addAdjacente(c1);

            // c2
            const c2 = controllerCamProcess.filtraVertice(vertices,element.x-1,element.y);
            if (c2!=null)
                element.addAdjacente(c2);

            // c3
            const c3 = controllerCamProcess.filtraVertice(vertices,element.x-1,element.y+1);
            if (c3!=null)
                element.addAdjacente(c3);

            // c4
            const c4 = controllerCamProcess.filtraVertice(vertices,element.x,element.y-1);
            if (c4!=null)
                element.addAdjacente(c4);

            // c5
            const c5 = controllerCamProcess.filtraVertice(vertices,element.x,element.y+1);
            if (c5!=null)
                element.addAdjacente(c5);

            // c6
            const c6 = controllerCamProcess.filtraVertice(vertices,element.x+1,element.y-1);
            if (c6!=null)
                element.addAdjacente(c6);

            // c7
            const c7 = controllerCamProcess.filtraVertice(vertices,element.x+1,element.y);
            if (c7!=null)
                element.addAdjacente(c7);

            // c8
            const c8 = controllerCamProcess.filtraVertice(vertices,element.x+1,element.y+1);
            if (c8!=null)
                element.addAdjacente(c8);
        });
        return vertices;
    };

    static filtraVertice = (vertices,x,y) => {
        const array = vertices.filter(e=>e.x==x && e.y==y);
        if (array && array.length > 0) {
            return array[0];
        } else {
            return null;
        }
    };

    static redefineAdjacentes = (vertices) => {
        vertices.forEach(c => {
            c.resetAdjacentes();
            vertices.forEach(element => {
                const d = c.getDistancia(element.x,element.y);
                if (d < 20) {
                    c.addAdjacente(element);
                }
            });
        });
        return vertices;
    };

    static defineStatus = (vertices) => {
        var array = [];
        var i = 0;
        
        const recursivo = (lista,cor) => {
            if (array.length === vertices)
            return;
            
            lista.forEach(cf => {
                const check = array.filter(e=>e.x==cf.x && e.y==cf.y);
                if (check.length===0) {
                    cf.status=i;
                    cf.color=cor;
                    array.push(cf);
                    recursivo(cf.adjacentes,cor);
                }
            });
        };
        
        vertices.forEach(c => {
            const check = array.filter(e=>e.x==c.x && e.y==c.y);
            if (check.length===0) {
                const cor = {
                    num1: Math.floor(Math.random() * (255-100 + 1) + 100),
                    num2: Math.floor(Math.random() * (255-100 + 1) + 100),
                    num3: Math.floor(Math.random() * (255-100 + 1) + 100)
                };
                c.status=i;
                c.color=cor;
                array.push(c);
                
                recursivo(c.adjacentes,cor);
                
                i++;
            }
            
        });

        return {
            newVertices: array,
            qtdObjetos: i
        };
    };

    static defineVareta = (vertices,qtdObjetos) => {
        // console.log("Qtd de objs: "+qtdObjetos);
        const minVareta = 40;
        const maxVareta = 160;
        var objetosVaretaReconhecidos = [];

        //faz filtro de objetos que tem range adequado de vertices
        for (let i = 0; i < qtdObjetos; i++) {
            const filter = vertices.filter(e=>e.status==i);
            if (filter.length > minVareta && filter.length < maxVareta) {
                objetosVaretaReconhecidos.push(filter);
            }
            console.log(filter);
        }
        
        return objetosVaretaReconhecidos;
    };

    static defineBbox = (vertices) => {
        //faz filtro de objetos que tem distancias adequadas de vertices
        var maxX = Number.MIN_VALUE;
        var minX = Number.MAX_VALUE;
        var maxY = Number.MIN_VALUE;
        var minY = Number.MAX_VALUE;
        
        var maxXelement = null;
        var minXelement = null;
        var maxYelement = null;
        var minYelement = null;
        
        vertices.forEach(element => {
            if (element.x > maxX) {
                maxX = element.x;
                maxXelement = element;
            }
            if (element.y > maxY) {
                maxY = element.y;
                maxYelement = element;
            }
            if (element.x < minX) {
                minX = element.x;
                minXelement = element;
            }
            if (element.y < minY) {
                minY = element.y;
                minYelement = element;
            }
        });

        return {
            maxX: maxX,
            minX: minX,
            maxY: maxY,
            minY: minY,
            maxXelement: maxXelement,
            minXelement: minXelement,
            maxYelement: maxYelement,
            minYelement: minYelement,
        };
    };

  }