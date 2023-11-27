/**
 * Some simple Queue service
 */


export default class Queue {
    queue:Array<Function>
    working:boolean

    constructor(){
        this.queue = []
        this.working = false
    }

    push(event:Function){
        this.queue.push(event)
        if(!this.working){
            this.work()
        }
    }

    work(){
        this.working = true
        // work is async BUT each task is dealt with in order
        setTimeout(()=> {
            while(this.queue.length > 0){
                const event = this.queue.shift() as Function
                event()
            }
            this.working = false
        })
    }

    clear(){
        this.queue = []
    }
}