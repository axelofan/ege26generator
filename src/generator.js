import type2 from './type2'

const randint = (min, max) => Math.floor(min + Math.random() * (max + 1 - min))

Array.prototype.max = function() {return Math.max.apply(null, this);}
Array.prototype.sum = function() {return this.reduce((s,el)=>s+el)}
Array.prototype.random = function() {return this[randint(0,this.length-1)]}

const game = {
    count: 0,
	heap: [], //elements is Arrays of Integer
    winS: 0,
    a: 0,
    b: 0,
    move: [],
    answer: {},
    strategy: {},
   
  
    //функции, отвечающие за нахождение выигрышных стратегий
    win: function(heap) { return heap.sum() >= this.winS },
   
    getMoves: function(heap) {
    let moves=[]
        for (let i=0;i<heap.length;i++) {
            for (let j=0;j<this.move.length;j++) {
                let tmp=[].concat(heap)
                tmp[i]=this.move[j](tmp[i])
                moves.push(tmp)
            }
        }
        return moves
    },
   
    isWin: function(heap) {
        return this.getMoves(heap).some(el => this.win(el))
    }, 
   
    analyze: function(heap,step=1) {
        if (this.isWin(heap)) return step
        else if (step>4) return null
        else {
            let player=step % 2
            let wins=this.getMoves(heap).map(el => this.analyze(el,step+1))
            if (wins.some(el => el == null)) {
                //el>=4 - специальный bugfix
                if (wins.every(el=>el==null || el%2 != player || el>=4)) return null
                else wins = wins.filter(el => el!=null)
            }
            if (wins.some(el => el % 2 == player)) return wins.filter(el => el % 2 == player).max()
            else return wins.filter(el => el % 2 != player).max()
        }
    },
   
    //функции, отвечающие за создание деревьев решений
    addEdge: function(heap1,heap2,player) {
        return `"${heap1}" -> "${heap2}"\n [label="${player==1 ? 'П' : 'В'}"]`
    },
   
    winMove: function(heap, player) {
        let moves = this.getMoves(heap)
            for(let i=0;i<moves.length;i++){
            if(this.win(moves[i])) {
                return this.addEdge(heap,moves[i],player)
            }
        }
    },
   
    plotEdges: function(heap, winner,step=1) {
        let player = step % 2
        if (this.isWin(heap) && (winner==player)) return this.winMove(heap, player)
        else {
            let options = this.getMoves(heap)
            let wins = options.map(el => this.analyze(el, step+1))
            let winners = wins.map(el => el!=null ? el%2 : null)
            let s=''
            for (let i=0;i<winners.length;i++) {
                if (winners[i]==winner) {
                    s+=this.addEdge(heap, options[i],player) + this.plotEdges(options[i],winner,step+1)
                    if (winners[i]==player) break
                }
            }
        return s
        }
    },
   
    plotGraph: function(heap) {
    let wStep = this.analyze(heap)
        let wPlayer = wStep % 2
        let s = 'strict digraph { rankdir="LR"\n' + this.plotEdges(heap, wPlayer) + '\n}'
        return s
    },
    
    //функции инициализации и вывода ответа
    getAnswer: function() {
        let step1=[], step2=[], step3=[], step4=[]

        this.heap.forEach( el => {
            let winner = this.analyze(el)
            if (winner==1) step1.push(el)
            if (winner==2) step2.push(el)
            if (winner==3) step3.push(el)
            if (winner==4) step4.push(el)
        });
      
        this.answer = {step1, step2, step3, step4}
    },
   
    init: function() {
        if (Math.random()<0.1) {
            this.type = 1
            let s = randint(50,100)
            this.a = randint(1,3)
            this.b = randint(2,4)
            for(let i=1;i<=s;i++) this.heap.push([i])
            this.winS = s+1
            this.move = [s=>s+this.a, s=>s*this.b]
            this.getAnswer()
        }
		else {
            this.type = 2
            let g = type2.random()
            let first=g.first
            this.a = g.a
            this.b = g.b
            for(let i=1;i<=g.s;i++) this.heap.push([first,i])
            this.winS=g.first+g.s+1
            this.move = [s=>s+this.a, s=>s*this.b]
            this.getAnswer()
        }
    }
}

game.init()
export default game