
import '../eventstream/eventsource.min.js';
import '../eventstream/reconnecting-eventsource.js';


class PushService{
    private endPoint:string = '/events/';
    private sources:{name:string, es:EventSource, handler:(e: MessageEvent<string>) => void}[] = [];

    public open(channel:string, onMessage:(data: {text:string})=>void){
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const es: EventSource = new ReconnectingEventSource(`${this.endPoint}${channel}/`);

        const handler = (e:MessageEvent<string>) => {
            // console.log(e);
            // console.log(e.data);
            onMessage(JSON.parse(e.data));
        }
        es.addEventListener('message', handler, false);
        es.addEventListener('close', () =>
            es.close()
        )

        this.sources.push({name:channel, es:es, handler:handler});
    }

    public close(channel:string){
        const hits = this.sources.filter((e)=>e.name==channel)
        if (hits.length > 0){
            for (const hit of hits){
                console.log("Closing: ", hit)
                hit.es.removeEventListener('message', hit.handler);
                hit.es.close();
            }
        }
    }
}

const pushService = new PushService();
export default pushService;