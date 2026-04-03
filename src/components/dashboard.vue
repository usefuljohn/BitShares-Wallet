<script setup>
    import { computed, watchEffect, ref, onMounted } from "vue";
    import { useI18n } from 'vue-i18n';

    import Balances from "./balances";
    import AccountDetails from "./account-details";
    import AccountSelect from "./account-select";

    import store from '../store/index.js';
    import router from '../router/index.js';

    const { t } = useI18n({ useScope: 'global' });

    let selectedAccount = computed(() => {
        if (!store.state.WalletStore.isUnlocked) {
            return;
        }
        return store.getters["AccountStore/getCurrentSafeAccount"]()
    })
    
    let isConnected = ref();
    let isConnecting = ref();
    let lastBlockchain = ref(null);
    let fetchQty = ref(1);

    let _explorer = ref("");
    let _accessType = ref("");
    let _balances = ref([]);
    let _chain = ref("");

    watchEffect(async () => {
        async function lookupBlockchain() {
            isConnecting.value = true;
            isConnected.value = false;
            let selectedDifferentChain = !lastBlockchain.value || (lastBlockchain.value && lastBlockchain.value !== selectedAccount.value.chain);
            if (selectedDifferentChain) {
                lastBlockchain.value = selectedAccount.value.chain;
            }

            _chain.value = selectedAccount.value.chain;

            let blockchainRequest;
            try { 
                blockchainRequest = await window.electron.blockchainRequest({
                    methods: selectedDifferentChain
                        ? ['getExplorer', 'getAccessType', 'getBalances']
                        : ['getExplorer', 'getBalances'],
                    account: selectedAccount.value,
                    chain: selectedAccount.value.chain,
                })
            } catch (error) {
                console.log({error});
            }

            if (!blockchainRequest) {
                console.log("No blockchain request");
                isConnecting.value = false;
                isConnected.value = false;
                return;
            }

            if (blockchainRequest.getExplorer) {
                _explorer.value = blockchainRequest.getExplorer;
            }
            if (blockchainRequest.getAccessType) {
                _accessType.value = blockchainRequest.getAccessType;
            }
            if (blockchainRequest.getBalances) {
                _balances.value = JSON.parse(blockchainRequest.getBalances);
            }

            isConnecting.value = false;
            isConnected.value = true;
        }

        if (selectedAccount.value && fetchQty.value) {
            console.log(`Fetching blockchain data #${fetchQty.value}`);
            lookupBlockchain();
        }
    });

    onMounted(() => {
        if (!store.state.WalletStore.isUnlocked) {
            console.log("logging user out...");
            store.dispatch("WalletStore/logout");
            router.replace("/");
            return;
        }
    });
</script>

<template>
    <span
        class="container"
        style="min-height:700px;"
    >
        <AccountSelect />
        <span v-if="selectedAccount">
            <AccountDetails
                :account="selectedAccount"
                :explorer="_explorer"
                :type="_accessType"
            />
            <Balances
                :account="selectedAccount"
                :balances="_balances"
                :chain="_chain"
                :is-connected="isConnected"
                :is-connecting="isConnecting"
                @refresh="() => fetchQty += 1"
            />

            <!-- Quick Actions -->
            <ui-card
                v-shadow="2"
                outlined
                style="margin: 15px auto; max-width: 400px; padding: 15px; text-align: center;"
            >
                <p style="margin-bottom: 10px; font-weight: bold;">
                    {{ t('common.dashboard.quickActions') }}
                </p>
                <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                    <router-link :to="'/local'" replace style="text-decoration: none;">
                        <ui-button
                            raised
                            icon="upload_file"
                            style="margin-bottom: 5px;"
                        >
                            {{ t('common.dashboard.signLocal') }}
                        </ui-button>
                    </router-link>
                    <router-link :to="'/raw-link'" replace style="text-decoration: none;">
                        <ui-button
                            raised
                            icon="link"
                            style="margin-bottom: 5px;"
                        >
                            {{ t('common.dashboard.acceptRaw') }}
                        </ui-button>
                    </router-link>
                </div>
            </ui-card>
        </span>
    </span>
</template>
