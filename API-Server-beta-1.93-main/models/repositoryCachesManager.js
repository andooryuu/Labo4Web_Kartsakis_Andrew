import * as utilities from "../utilities.js";
import * as serverVariables from "../serverVariables.js";
import { log } from "../log.js";
let repositoryCachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");

// Repository file data models cache
globalThis.CachedRequests = [];

export default class RepositoryCachesManager {
    static add(model, data) {
        if (model != "") {
            RepositoryCachesManager.clear(model);
            CachedRequests.push({
                model,
                data,
                Expire_Time: utilities.nowInSeconds() + repositoryCachesExpirationTime
            });
            console.log("File data of " + model + ".json added in respository cache");
        }
    }
    static clear(model) {
        if (model != "") {
            let indexToDelete = [];
            let index = 0;
            for (let cache of CachedRequests) {
                if (cache.model == model) indexToDelete.push(index);
                index++;
            }
            utilities.deleteByIndex(CachedRequests, indexToDelete);
        }
    }
    static find(model) {
        try {
            if (model != "") {
                for (let cache of CachedRequests) {
                    if (cache.model == model) {
                        // renew cache
                        cache.Expire_Time = utilities.nowInSeconds() + repositoryCachesExpirationTime;
                        console.log("File data of " + model + ".json retreived from respository cache");
                        return cache.data;
                    }
                }
            }
        } catch (error) {
            console.log("repository cache error!", error);
        }
        return null;
    }
    static flushExpired() {
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for (let cache of CachedRequests) {
            if (cache.Expire_Time < now) {
                console.log("Cached file data of " + cache.model + ".json expired");
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(CachedRequests, indexToDelete);
    }
}
// periodic cleaning of expired cached repository data
setInterval(RepositoryCachesManager.flushExpired, repositoryCachesExpirationTime * 1000);
log(BgWhite, FgBlack, "Periodic repository caches cleaning process started...");
