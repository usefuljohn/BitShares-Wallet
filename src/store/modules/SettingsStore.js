import { defaultLocale } from '../../config/i18n.js'
import {blockchains} from '../../config/config.js';
import BeetDB from '../../lib/BeetDB.js';

const LOAD_SETTINGS = 'LOAD_SETTINGS';

function decodeMessage(bytes) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(new Uint8Array(bytes));
}

const mutations = {
    [LOAD_SETTINGS] (state, settings) {
        state.settings = settings;
    }
};

const defaultTrackedAssets = [
    'BTS',
    'TWENTIX',
    'BTWTY',
    'BTWTY.EOS',
    'BTWTY.BTC',
    'IOB.XRP',
    'IOB.XLM',
    'XBTSX.BTC',
    'XBTSX.LTC'
];

const actions = {
    loadSettings({
        commit
    }) {
        return new Promise(async (resolve, reject) => {
            try {
                BeetDB.settings.get({id: 'settings'}).then((settings) => {
                    if (settings && settings.length > 0) {
                        const parsed = JSON.parse(settings);
                        if (!parsed.trackedAssets) {
                            parsed.trackedAssets = defaultTrackedAssets;
                        }
                        commit(LOAD_SETTINGS, parsed);
                    } else {
                        BeetDB.settings.put({id: 'settings', value: JSON.stringify(initialState.settings)}).then(() => {
                            commit(LOAD_SETTINGS, initialState.settings);
                        })
                    }
                });
                resolve();
            } catch (error) {
                console.log(error)
                reject();
            }
        });
    },
    setNode({
        commit
    }, payload) {
        return new Promise(async (resolve, reject) => {

            BeetDB.settings.get({id: 'settings'}).then((settings) => {
                if (settings && settings.length > 0) {
                    settings = JSON.parse(settings)
                } else {
                    settings = initialState.settings;
                }
  
                // backwards compatibility
                if (typeof settings.selected_node === "string") {
                    settings.selected_node = {}
                }
  
                try {
                  settings.selected_node[payload.chain] = payload.node;
                } catch (error) {
                  console.log(`setNode: ${error}`)
                }

                let chainNodeList = settings.chainNodes[payload.chain];
                if (chainNodeList && chainNodeList.length > payload.node) {
                    let node = chainNodeList.splice(payload.node, 1)[0];
                    chainNodeList.unshift(node);
                }
                
                try {
                    settings.chainNodes[payload.chain] = chainNodeList;
                } catch (error) {
                    console.log(`setNodeList: ${error}`)
                }

                BeetDB.settings.put({id: 'settings', value: JSON.stringify(settings)}).then(() => {
                    commit(LOAD_SETTINGS, settings);
                    resolve();
                })
            }).catch((error) => {
                console.log(`setNode: ${error}`)
                reject(error);
            });
        });
    },
    setLocale({
        commit
    }, payload) {
        return new Promise(async (resolve, reject) => {

            BeetDB.settings.get({id: 'settings'}).then((settings) => {
                if (settings && settings.length > 0) {
                    settings = JSON.parse(settings)
                } else {
                    settings = initialState.settings;
                }

                settings.locale = payload.locale;

                BeetDB.settings.put({id: 'settings', value: JSON.stringify(settings)}).then(() => {
                    commit(LOAD_SETTINGS, settings);
                    resolve();
                })
            }).catch((error) => {
                console.log(`setLocale: ${error}`)
                reject(error);
            });
        });
    },
    /**
     * 
     * @param {Object} payload
     */
    setChainPermissions({
        commit
    }, payload) {
        return new Promise(async (resolve, reject) => {
            BeetDB.settings.get({id: 'settings'}).then((settings) => {
                if (settings && settings.length > 0) {
                    settings = JSON.parse(settings)
                } else {
                    settings = initialState.settings;
                }
    
                if (!Object.prototype.hasOwnProperty.call(settings, 'chainPermissions')) {
                    settings['chainPermissions'] = {
                        BTS: [],
                        BTS_TEST: [],
                        EOS: [],
                        BEOS: [],
                        TLOS: []
                    }
                }
                settings.chainPermissions[payload.chain] = payload.rows;
                BeetDB.settings.put({id: 'settings', value: JSON.stringify(settings)}).then(() => {
                    commit(LOAD_SETTINGS, settings);
                    resolve();
                })
            }).catch((error) => {
                console.log(`setChainPermissions: ${error}`)
                reject(error);
            });
        });
    },
    visualizeMemo({
        commit
    }, data) {
        const decodedMessage = decodeMessage(data.request.memo.message);
        console.log('Decoded Memo Message:', decodedMessage);
    },
    setAutoLockMinutes({
        commit
    }, payload) {
        return new Promise(async (resolve, reject) => {
            BeetDB.settings.get({id: 'settings'}).then((settings) => {
                if (settings && settings.length > 0) {
                    settings = JSON.parse(settings)
                } else {
                    settings = initialState.settings;
                }

                settings.autoLockMinutes = payload.minutes;

                BeetDB.settings.put({id: 'settings', value: JSON.stringify(settings)}).then(() => {
                    commit(LOAD_SETTINGS, settings);
                    resolve();
                })
            }).catch((error) => {
                console.log(`setAutoLockMinutes: ${error}`)
                reject(error);
            });
        });
    },
    addTrackedAsset({
        commit
    }, payload) {
        return new Promise(async (resolve, reject) => {
            BeetDB.settings.get({id: 'settings'}).then((settings) => {
                if (settings && settings.length > 0) {
                    settings = JSON.parse(settings);
                } else {
                    settings = initialState.settings;
                }

                if (!settings.trackedAssets) {
                    settings.trackedAssets = [...defaultTrackedAssets];
                }

                const assetSymbol = payload.symbol.trim().toUpperCase();
                if (assetSymbol && !settings.trackedAssets.includes(assetSymbol)) {
                    settings.trackedAssets.push(assetSymbol);
                }

                BeetDB.settings.put({id: 'settings', value: JSON.stringify(settings)}).then(() => {
                    commit(LOAD_SETTINGS, settings);
                    resolve();
                });
            }).catch((error) => {
                console.log(`addTrackedAsset: ${error}`);
                reject(error);
            });
        });
    },
    removeTrackedAsset({
        commit
    }, payload) {
        return new Promise(async (resolve, reject) => {
            BeetDB.settings.get({id: 'settings'}).then((settings) => {
                if (settings && settings.length > 0) {
                    settings = JSON.parse(settings);
                } else {
                    settings = initialState.settings;
                }

                if (!settings.trackedAssets) {
                    settings.trackedAssets = [...defaultTrackedAssets];
                }

                const assetSymbol = payload.symbol.trim().toUpperCase();
                settings.trackedAssets = settings.trackedAssets.filter(s => s !== assetSymbol);

                BeetDB.settings.put({id: 'settings', value: JSON.stringify(settings)}).then(() => {
                    commit(LOAD_SETTINGS, settings);
                    resolve();
                });
            }).catch((error) => {
                console.log(`removeTrackedAsset: ${error}`);
                reject(error);
            });
        });
    }
}

const getters = {
    getNode: (state) => state.settings.selected_node,
    getLocale: (state) => state.settings.locale,
    getChainPermissions: (state) => (chain) => {
        if (!Object.prototype.hasOwnProperty.call(state.settings, 'chainPermissions')) {
            return [];
        }
        return state.settings.chainPermissions[chain];
    },
    getNodes: (state) => (chain) => {
        if (!Object.prototype.hasOwnProperty.call(state.settings, 'chainNodes')) {
            return initialState.settings.chainNodes[chain];
        }
        return state.settings.chainNodes[chain];
    },
    getAutoLockMinutes: (state) => {
        if (!Object.prototype.hasOwnProperty.call(state.settings, 'autoLockMinutes')) {
            return 10;
        }
        return state.settings.autoLockMinutes;
    },
    getTrackedAssets: (state) => {
        if (!Object.prototype.hasOwnProperty.call(state.settings, 'trackedAssets') || !state.settings.trackedAssets) {
            return defaultTrackedAssets;
        }
        return state.settings.trackedAssets;
    }
};

const initialState = {
    settings: {
        locale: defaultLocale,
        selected_node: {},
        autoLockMinutes: 10,
        trackedAssets: defaultTrackedAssets,
        chainPermissions: {
            BTS: [],
            TEST: [],
            EOS: [],
            BEOS: [],
            TLOS: []
        },
        chainNodes: {
            BTS: blockchains.BTS.nodeList,
            TEST: blockchains.BTS_TEST.nodeList,
            EOS: blockchains.EOS.nodeList,
            BEOS: blockchains.BEOS.nodeList,
            TLOS: blockchains.TLOS.nodeList
        }
    }
};

export default {
    namespaced: true,
    state: initialState,
    actions,
    mutations,
    getters,
};
