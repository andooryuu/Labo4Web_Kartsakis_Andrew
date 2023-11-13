import * as utilities from "../utilities.js";
import * as serverVariables from "../serverVariables.js";
import { log } from "../log.js";

let repositoryCachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");
globalThis.CachedRequests = [];
export default class CachedRequestsManager {

    //stock l'url
    // la reponse
    //etag(optionnelle)
    //si on rappelle la requete une autre fois,
    //Quand le etag change, la cache n'est plus bonne
    static add(url, content, ETag = "") {
        if (url != null) {
            CachedRequestsManager.clear(url);
            CachedRequests.push({
                url,
                content,
                ETag: ETag || null,
                Expire_Time: utilities.nowInSeconds() + repositoryCachesExpirationTime
            })
            console.log("File data of " + url + ".json added in respository cache");
        }
    }
    static find(url) {
        try {
            if (url != null) {

                for (let cache of CachedRequests) {
                    if (cache.url.toLowerCase() == url.toLowerCase()) {
                        // renew cache
                        cache.Expire_Time = utilities.nowInSeconds() + repositoryCachesExpirationTime;
                        console.log("File data of " + cache.url + ".json retreived from respository cache");
                        return cache;
                    }
                }
            }
        } catch (error) {
            console.log("repository cache error!", error);
        }
        return null;
    }
    static clear(url) {
        if (url != null) {
            let indexToDelete = [];
            let index = 0;
            for (let cache of CachedRequests) {
                if (cache.url.toLowerCase().indexOf(url.toLowerCase()) > -1) {
                    indexToDelete.push(index);
                }
                index++;
            }
            utilities.deleteByIndex(CachedRequests, indexToDelete);
            console.log("cleared");
        }
    }
    /*
    static clear(model){
        if()
    }
*/
    //Comment donner l'url et comment l'appeler sans que l'url soi nul
    //Gère le changement de Etag ou repositery
    static flushExpired() {
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for (let cache of CachedRequests) {
            if (cache.Expire_Time < now) {
                console.log("Cached file data of " + cache.url + ".json expired");
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(CachedRequests, indexToDelete);
    }

    static get(HttpContext) {
        let cachedUrl = CachedRequestsManager.find(HttpContext.req.url);
        if (cachedUrl != null && HttpContext.req.method == "GET") {
            HttpContext.response.JSON(cachedUrl.content, cachedUrl.ETag, true)
            return true
        }
        return false;
    }

}
setInterval(CachedRequestsManager.flushExpired, repositoryCachesExpirationTime * 1000);
log(BgWhite, FgBlack, "Periodic repository caches cleaning process started...");