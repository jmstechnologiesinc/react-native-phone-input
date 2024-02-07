/* eslint-disable global-require */

class FlagResource {
    private flags: any;

    constructor() {
        this.flags = {
            us: require('./images/us.png'),
            pa: require('./images/pa.png'),
            do: require('./images/do.png'),
        };
    }

    get(name) {
        return this.flags[name];
    }
}

export default new FlagResource();
