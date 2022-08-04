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
    code: '',

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
   
    analyze: function(heap, c, m) {
        if(this.win(heap)) return c%2==m%2
        if(c>m) return false
        const next = this.getMoves(heap).map(el=>this.analyze(el,c+1,m))
        return (c+1)%2==m%2 ? next.some(el=>el) : next.every(el=>el)
    },

    analyze2: function(heap, c) {
        if(this.win(heap)) return c%2==0
        if(c>2) return false
        const next = this.getMoves(heap).map(el=>this.analyze2(el,c+1))
        return next.some(el=>el)
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
                    s+=this.addEdge(heap, options[i], player) + this.plotEdges(options[i],winner,step+1)
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
        let step2=[], step21=[], step3=[], step4=[]

        this.heap.forEach( el => {
            for(let i=1;i<=4;i++) {
                if (this.analyze2(el,0)) step21.push(el)
                if(this.analyze(el,0,i)) {
                    if (i==2) step2.push(el)
                    if (i==3) step3.push(el)
                    if (i==4) step4.push(el)
                    return
                }
            }
        });
        this.answer = {step2, step21, step3, step4}
    },

    generateCode: function() {
        if(this.type==1) {
            return `from functools import lru_cache<br>
            <br>
            def moves(h):<br>
            &nbsp;&nbsp;return h+${this.a}, h*${this.b}<br>
            <br>
            @lru_cache(None)<br>
            def game(h):<br>
            &nbsp;&nbsp;if h >= ${this.winS}: return 'w'<br>
            &nbsp;&nbsp;if any(game(i)=='w' for i in moves(h)): return 'p1'<br>
            &nbsp;&nbsp;if all(game(i)=='p1' for i in moves(h)): return 'v1'<br>
            &nbsp;&nbsp;if any(game(i)=='v1' for i in moves(h)): return 'p2'<br>
            &nbsp;&nbsp;if all(game(i)=='p1' or game(i)=='p2' for i in moves(h)): return 'v2'<br>
            <br>
            &nbsp;&nbsp;print('19',[s for s in range(1, ${this.winS}) if game(s)=='v1'])<br>
            &nbsp;&nbsp;print('20',[s for s in range(1, ${this.winS}) if game(s)=='p2'])<br>
            &nbsp;&nbsp;print('21',[s for s in range(1, ${this.winS}) if game(s)=='v2'])`
        }
        if(this.type==2) {
            return `from functools import lru_cache<br>
            <br>
            def moves(h):<br>
            &nbsp;&nbsp;return (a+${this.a},b), (a*${this.b},b), (a,b+${this.a}), (a,b*${this.b})
            <br>
            @lru_cache(None)<br>
            def game(h):<br>
            &nbsp;&nbsp;if sum(h) >= ${this.winS}: return 'w'<br>
            &nbsp;&nbsp;if any(game(i)=='w' for i in moves(h)): return 'p1'<br>
            ${this.answer.step2.length==0 ? '&nbsp;&nbsp;#для 19 задания all заменяется на any<br>' : ''}
            &nbsp;&nbsp;if all(game(i)=='p1' for i in moves(h)): return 'v1'<br>
            &nbsp;&nbsp;if any(game(i)=='v1' for i in moves(h)): return 'p2'<br>
            &nbsp;&nbsp;if all(game(i)=='p1' or game(i)=='p2' for i in moves(h)): return 'v2'<br>
            <br>
            ${(this.answer.step2.length==0) ? 
                `&nbsp;&nbsp;print('19',min(s for s in range(1, ${this.winS-this.heap[0][0]}) if game((${this.heap[0][0]}, s))=='v1'))<br>` :
                `&nbsp;&nbsp;print('19',[s for s in range(1, ${this.winS-this.heap[0][0]}) if game((${this.heap[0][0]}, s))=='v1'])<br>`
            }
            &nbsp;&nbsp;print('20',[s for s in range(1, ${this.winS-this.heap[0][0]}) if game((${this.heap[0][0]}, s))=='p2'])<br>
            &nbsp;&nbsp;print('21',[s for s in range(1, ${this.winS-this.heap[0][0]}) if game((${this.heap[0][0]}, s))=='v2'])`           
        }
    },
   
    init: function() {
        if (Math.random()<=0) {
            this.type = 1
            let s = randint(50,100)
            this.a = randint(1,3)
            this.b = randint(2,4)
            for(let i=1;i<=s;i++) this.heap.push([i])
            this.winS = s+1
            this.move = [s=>s+this.a, s=>s*this.b]
            this.getAnswer()
            this.code = this.generateCode()
        }
		else {
            this.type = 2
            let first = randint(1,10)
            let s = randint(50,100)
            this.a = randint(1,3)
            this.b = randint(2,4)
            for(let i=1;i<=s;i++) this.heap.push([first,i])
            this.winS = first+s+1
            this.move = [s=>s+this.a, s=>s*this.b]
            this.getAnswer()
            if(this.answer.step3.length==0 || this.answer.step4.length==0) {
                this.answer = {}
                this.heap = []
                this.init()
            }
            this.code = this.generateCode()
        }
    }
}

game.init()
export default game