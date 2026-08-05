<script setup>
    import { watchEffect, ref, computed } from "vue";
    import { useI18n } from 'vue-i18n';
    import store from '../store/index.js';

    const { t } = useI18n({ useScope: 'global' });

    const props = defineProps({
        account: {
            type: Object,
            required: true,
            default() {
                return {}
            }
        },
        balances: {
            type: Array,
            required: false,
            default() {
                return []
            }
        },
        chain: {
            type: String,
            required: true,
            default: ""
        },
        isConnected: {
            type: Boolean,
            required: false,
            default: false
        },
        isConnecting: {
            type: Boolean,
            required: false,
            default: false
        }
    });

    const emit = defineEmits(['refresh']);

    let balances = computed(() => {
        return props.balances;
    });

    let selectedChain = computed(() => {
        return props.account.chain;
    });

    let accountName = computed(() => {
        return props.account.accountName;
    });

    const trackedAssets = computed(() => {
        return store.getters['SettingsStore/getTrackedAssets'];
    });

    const showAllAssets = ref(false);
    const newAssetInput = ref('');
    const showManageModal = ref(false);

    function addAsset() {
        const symbol = newAssetInput.value.trim().toUpperCase();
        if (symbol) {
            store.dispatch('SettingsStore/addTrackedAsset', { symbol });
            newAssetInput.value = '';
        }
    }

    function removeAsset(symbol) {
        store.dispatch('SettingsStore/removeTrackedAsset', { symbol });
    }

    let displayedBalances = computed(() => {
        if (!balances.value) return [];
        if (showAllAssets.value) return balances.value;
        const tracked = trackedAssets.value || [];
        return balances.value.filter(b => tracked.includes(b.asset_name));
    });

    let tableData = ref();
    async function loadBalances() {
        if (
            selectedChain.value !== '' &&
            accountName.value !== '' &&
            props.chain === selectedChain.value
        ) {
            tableData.value = null;
            emit('refresh', true);
            window.electron.resetTimer();
        } else {
            console.log("Unable to reload balances, please try again later.")
        }
    }

    watchEffect(() => {
        if (displayedBalances.value && displayedBalances.value.length) {
            tableData.value = {
                data: displayedBalances.value.map(balance => {
                    return {
                        balance: balance.balance.toLocaleString(
                            undefined,
                            { minimumFractionDigits: balance.precision }
                        ),
                        asset_name: balance.asset_name
                    }
                }),
                thead: [
                    {
                        value: 'Asset name',
                        sort: 'asc',
                        columnId: 'asset_name'
                    },
                    {
                        value: 'Balance',
                        columnId: 'balance'
                    },
                ],
                tbody: ['asset_name', 'balance'],
            };
        } else {
            tableData.value = null;
        }
    });
</script>

<template>
    <div style="padding:5px">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; flex-wrap: wrap; gap: 5px;">
            <span style="font-weight: bold;">{{ t('common.balances_lbl') }}</span>
            <div style="display: flex; gap: 5px; align-items: center; flex-wrap: wrap;">
                <ui-button
                    v-if="isConnected || balances"
                    class="step_btn"
                    @click="loadBalances()"
                >
                    {{ t('common.balances.refresh') }}
                </ui-button>
                <ui-button
                    v-else-if="!isConnected && !isConnecting"
                    class="step_btn"
                    @click="loadBalances()"
                >
                    {{ t('common.balances.reconnect') }}
                </ui-button>
                <ui-button
                    outlined
                    dense
                    style="font-size: 11px;"
                    @click="showAllAssets = !showAllAssets"
                >
                    {{ showAllAssets ? 'Showing All' : 'Whitelisted Only' }}
                </ui-button>
                <ui-button
                    outlined
                    dense
                    icon="tune"
                    style="font-size: 11px;"
                    @click="showManageModal = !showManageModal"
                >
                    Track Assets
                </ui-button>
            </div>
        </div>

        <ui-table
            v-if="tableData"
            v-shadow="1"
            :data="tableData.data"
            :thead="tableData.thead"
            :tbody="tableData.tbody"
            style="height: 180px;"
        />

        <ui-card
            v-if="balances && balances.length && !displayedBalances.length && !showAllAssets"
            v-shadow="1"
            outlined
            style="padding: 10px; text-align: center; margin-top: 5px;"
        >
            No whitelisted assets found in account balances.
            <ui-button
                raised
                style="margin-left: 5px;"
                @click="showAllAssets = true"
            >
                Show All Assets
            </ui-button>
        </ui-card>

        <ui-card
            v-if="balances && !balances.length"
            v-shadow="1"
            outlined
        >
            {{ t('common.balances.empty') }}
        </ui-card>

        <ui-card
            v-if="isConnecting"
            v-shadow="1"
            outlined
            style="padding:5px; text-align: center;"
        >
            <ui-skeleton active />
        </ui-card>

        <ui-card
            v-if="!isConnected && !isConnecting"
            v-shadow="1"
            outlined
            style="padding:5px"
        >
            {{ t('common.balances.error') }}
        </ui-card>

        <!-- Manage Tracked Assets Box -->
        <ui-card
            v-if="showManageModal"
            v-shadow="2"
            outlined
            style="margin-top: 10px; padding: 12px;"
        >
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 13px;">
                Custom Asset Whitelist
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 12px; align-items: center;">
                <ui-textfield
                    v-model="newAssetInput"
                    placeholder="Symbol (e.g. HONEST.BTC)"
                    style="flex: 1;"
                    @keyup.enter="addAsset"
                />
                <ui-button raised @click="addAsset">
                    Add Asset
                </ui-button>
            </div>
            <div style="font-size: 11px; color: #666; margin-bottom: 5px;">Tracked Symbols:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; max-height: 100px; overflow-y: auto;">
                <span
                    v-for="symbol in trackedAssets"
                    :key="symbol"
                    style="background: #e8e8e8; color: #222; padding: 3px 8px; border-radius: 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 6px;"
                >
                    {{ symbol }}
                    <span
                        style="cursor: pointer; font-weight: bold; color: #d32f2f;"
                        title="Remove asset from whitelist"
                        @click="removeAsset(symbol)"
                    >&times;</span>
                </span>
            </div>
        </ui-card>
    </div>
</template>
